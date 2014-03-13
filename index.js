var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var expandBounds = require('./lib/expand_bounds.js');

module.exports = Search;
inherits(Search, EventEmitter);

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
    
    var results = {};
    this.fn = function (pt, cb) {
        var key = pt.join(',');
        if (results[key]) cb(results[key])
        else fn(pt, function (value) {
            results[key] = value;
            immediate(function () { cb(value) });
        });
    };
    
    this.slopes = [];
    this.centers = [];
    this.max = -Infinity;
    this.running = false;
}

Search.prototype.stop = function () {
    this.running = false;
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

function mean (xs) {
    var sum = 0;
    for (var i = 0; i < xs.length; i++) sum += xs[i];
    return sum / xs.length;
}

function dist (a, b) {
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
        var d = a[i] - b[i];
        sum += d * d;
    }
    return Math.sqrt(sum);
}

function best (centers) {
    var max = centers[0];
    var index = 0;
    for (var i = 1; i < centers.length; i++) {
        if (centers[i]['yield'] > max['yield']) {
            max = centers[i];
            index = i;
        }
    }
    return { center: max, index: index };
}
