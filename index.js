var expandBounds = require('./lib/expand_bounds.js');
var Region = require('./lib/region.js');
var mean = require('./lib/mean.js');

module.exports = Search;

var immediate = typeof setImmediate !== 'undefined'
    ? setImmediate : process.nextTick
;

function Search (range, opts, fn) {
    if (!(this instanceof Search)) return new Search(range, opts, fn);
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    }
    if (!opts) opts = {};
    
    this.range = range;
    this.corners = expandBounds(range);
    this.fn = fn;
    
    this.slopes = [];
    this.regions = [];
    
    this.center = range.map(mean);
    
    for (var i = 0; i < this.corners.length; i++) {
        var a = this.corners[i];
        var b = this.corners[(i+1) % this.corners.length];
        var r = Region([ a, b, this.center ])
        this.regions.push(r);
    }
    
    this.max = -Infinity;
    this.iteration = 0;
}

Search.prototype.next = function () {
    if (this.iteration === 0) {
        var res = this.fn(this.center);
        this.iteration ++;
        return { point: this.center, value: res };
    }
    if (this.iteration <= this.corners.length) {
        var pt = this.corners[this.iteration - 1];
        this.iteration ++;
        return { point: pt, value: this.fn(pt) };
    }
};

Search.prototype.start = function () {
    var self = this;
    self.running = true;
    
    var fn = self.fn;
    var bounds = expandBounds(self.range);
    
    var fbounds = [];
    var pending = 1;
    
    var center = self.range.map(mean);
    var fcenter;
    fn(center, function (value) {
        fcenter = value;
        self.emit('test', center, value);
        ready();
    });
    
    function ready () {
        if (--pending !== 0) return;
        
        var max = { point: center, value: fcenter };
        for (var i = 0; i < bounds.length; i++) {
            if (fbounds[i] > max.value) {
                max = { point: bounds[i], value: fbounds[i] };
            }
        }
        self.max = max.value;
        self.emit('max', max.point, max.value);
        
        self._next(center, fcenter, bounds, fbounds);
    }
};

Search.prototype._next = function (center, fcenter, bounds, fbounds) {
    var self = this;
    if (!self.running) return;
    
    var pending = bounds.length;
    bounds.forEach(function (b, i) {
        var fb = fbounds[i];
        self._findYield(
            createPoint(b, fb, center, fcenter),
            result
        );
    });
    
    function result (center) {
        self.centers.push(center);
        if (--pending !== 0) return;
        
        var cy = best(self.centers);
        var y = cy.center;
        self.centers.splice(cy.index, 1);
        
        var nextBounds = [];
        for (var i = 0; i < y.a.length; i++) {
            nextBounds.push([
                Math.min(y.a[i], y.b[i]),
                Math.max(y.a[i], y.b[i])
            ]);
        }
        
        var points = expandBounds(nextBounds);
        self.emit('bound', points);
        var bpending = points.length;
        var fpoints = [];
        points.forEach(function (pt, ix) {
            self.fn(pt, function (value) {
                fpoints[ix] = value;
                if (--bpending === 0) {
                    self._next(y.c, y.fc, points, fpoints);
                }
            });
        });
    }
};
    
function createPoint (a, fa, b, fb) {
    var center = a.map(function (_, i) {
        return (a[i] + b[i]) / 2;
    });
    return {
        a: a, fa: fa,
        b: b, fb: fb,
        distAC: dist(a, center),
        c: center,
        centerMean: (fa + fb) / 2
    };
};

Search.prototype._findYield = function (point, cb) {
    var self = this;
    if (!self.running) return;
    
    self.fn(point.c, function (fc) {
        point.fc = fc;
        
        self.emit('test', point.c, fc);
        if (fc > self.max) {
            self.emit('max', point.c, fc);
            self.max = fc;
        }
        var range = [
            Math.min(point.centerMean, fc),
            Math.max(point.centerMean, fc)
        ];
        
        var s0 = (point.fa - point.fc) / point.distAC;
        self.slopes.push({ range: range, slope: s0 });
        
        for (var i = 0; i < self.centers.length; i++) {
            var c = self.centers[i];
            c.yield = computeYield(c);
        }
        point.yield = computeYield(point); // necessary?
        
        cb(point);
    });
    
    function computeYield (c) {
        var thresh = (self.max - c.fa) / c.distAC;
        var appliedSlopes = self.slopes.filter(function (s) {
            return s.range[0] >= c.centerMean && s.range[1] <= c.centerMean;
        });
        if (appliedSlopes.length === 0) appliedSlopes = self.slopes;
        
        var projected = appliedSlopes.map(function (s) {
            return c.distAC * s.slope + c.centerMean;
        });
        var highEnough = projected.filter(function (s) {
            return s > thresh;
        });
        var portion = highEnough.length / appliedSlopes.length;
        return portion > 0 ? mean(highEnough) / portion : 0
    }
};
