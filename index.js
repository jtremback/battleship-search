var expandBounds = require('./lib/expand_bounds.js');
var Region = require('./lib/region.js');
var mean = require('./lib/mean.js');
var dist = require('./lib/dist.js');

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

module.exports = Search;
inherits(Search, EventEmitter);

function Search (range, opts, fn) {
    var self = this;
    if (!(this instanceof Search)) return new Search(range, opts, fn);
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    }
    if (!opts) opts = {};
    if (range.length < 2) {
        throw new Error('dimensionality must be >= 2');
    }
    
    this.range = range;
    this.corners = expandBounds(range);
    this.fn = fn;
    this.center = range.map(mean);
    
    this.regions = [];
    
    this.k = range.map(function () { return 0 });
    this.smooth = range.map(function () { return 1 });
    this.tansum = range.map(function () { return 1 });
    
    this._pointMap = {};
    this._pending = [];
    
    this.max = -Infinity;
    this.iteration = 0;
}

Search.prototype.next = function () {
    var self = this;
    
    if (this._pending.length > 0) {
        var previously = false;
        var c = this._pending[0].next(function (pt) {
            previously = self.has(pt);
            return self.test(pt);
        });
        if (previously) return this.next();
        if (c === null) {
            this._pending.shift();
            return this.next();
        }
        
        this.iteration ++;
        return c;
    }
    
    if (this.iteration === 0) {
        var first = true;
        this._pending.push({
            next: function (fn) {
                if (!first) return null;
                first = false;
                
                var value = fn(self.center);
                return { point: self.center, value: value };
            }
        });
    }
    else if ((this.iteration - 1) / 2 < this.corners.length) {
        var i = (this.iteration - 1) / 2;
        var pts = [ this.center ];
        for (var j = 0; j < 2; j++) {
            pts.push(this.corners[(i+j) % this.corners.length]);
        }
        var r = Region(pts);
        this._pending.push(r);
        this.regions.push(r);
        this.emit('region', r);
    }
    else {
        var best = this.best();
        var subRegions = best.region.divide();
        
        this.emit('divide', best.region);
        var xs = [ best.index, 1 ].concat(subRegions);
        this.regions.splice.apply(this.regions, xs);
        
        for (var i = 0; i < subRegions.length; i++) {
            var r = subRegions[i];
            this._pending.push(r);
            this.emit('region', r);
        }
    }
    return this.next();
};

Search.prototype.best = function () {
    var max = this.regions[0];
    var score = max.getScore(this.regions, this.max);
    var index = 0;
    for (var i = 1; i < this.regions.length; i++) {
        var r = this.regions[i];
        var v = r.getScore(this.regions, this.max);
        if (v > score) {
            max = r;
            index = i;
            score = v;
        }
    }
    this.emit('best', r, score);
    return { region: max, index: index };
};

Search.prototype.has = function (pt) {
    var key = pt.join(',');
    return this._pointMap[key] !== undefined;
};

Search.prototype.test = function (pt) {
    var key = pt.join(',');
    if (this._pointMap[key] !== undefined) return this._pointMap[key];
    
    var value = this.fn(pt);
    this._pointMap[key] = value;
    
    var sm = this._smooth(pt, value);
    this.regions.forEach(function (r) {
        r.setSmooth(sm);
    });
    
    this.emit('test', pt, value);
    if (value > this.max) {
        this.max = value;
        this.emit('max', pt, value);
    }
    return value;
};

Search.prototype._smooth = function (pt, value) {
    var pcoords = pt.concat(value);
    var epsilon = [];
    var ptKeys = Object.keys(this._pointMap);
    var key = pt.join(',');
    if (ptKeys.length < 2) return this.smooth;
    
    for (var i = 0; i < this.range.length; i++) {
        epsilon[i] = 0;
        var csum = 0;
        
        for (var j = 0; j < ptKeys.length; j++) {
            if (key === ptKeys[j]) continue;
            var otherPt = ptKeys[j].split(',');
            var otherValue = this._pointMap[ptKeys[j]];
            
            var projMag = Math.sqrt(
                Math.pow(otherPt[i] - pt[i], 2)
                + Math.pow(otherValue - value, 2)
            );
            var c = projMag / dist(pt, ptKeys[j].split(',').map(parseFloat));
            epsilon[i] += c;
            csum += Math.atan2(otherValue - value, otherPt[i] - pt[i]) * c;
        }
        this.tansum[i] = (this.k[i] / (this.k[i] + epsilon[i])) * this.tansum[i]
            + csum / (this.k[i] + epsilon[i])
        ;
        this.k[i] += epsilon[i];
        this.smooth[i] = Math.tan(this.tansum[i]);
    }
    return this.smooth;
};
