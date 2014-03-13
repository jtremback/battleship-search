var expandBounds = require('./lib/expand_bounds.js');
var Region = require('./lib/region.js');
var mean = require('./lib/mean.js');

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
    
    this.range = range;
    this.corners = expandBounds(range);
    this.fn = fn;
    
    this.regions = [];
    this._pointMap = {};
    this._pending = [];
    
    this.center = range.map(mean);
    
    for (var i = 0; i < this.corners.length; i++) {
        var a = this.corners[i];
        var b = this.corners[(i+1) % this.corners.length];
        var r = Region([ a, b, this.center ], [], this)
        
        var ckey = r.center.join(',');
        if (!this._pointMap[ckey]) this._pointMap[ckey] = [];
        
        r.points.forEach(function (pt, ix) {
            var key = pt.join(',');
            if (!self._pointMap[key]) self._pointMap[key] = [];
            self._pointMap[key].push([ r, ix ]);
        });
        this.regions.push(r);
    }
    
    this.max = -Infinity;
    this.iteration = 0;
}

Search.prototype.next = function () {
    if (this.iteration === 0) {
        var value = this.fn(this.center);
        this.setPoint(this.center, value);
        this.iteration ++;
        return { point: this.center, value: value };
    }
    if (this.iteration <= this.corners.length) {
        var ix = this.iteration - 1;
        var pt = this.corners[ix];
        var r = this.regions[ix];
        var value = this.fn(pt);
        this.setPoint(pt, value);
        this.iteration ++;
        return { point: pt, value: value };
    }
    if (this.iteration <= this.corners.length + this.regions.length) {
        var ix = this.iteration - this.corners.length - 1;
        var r = this.regions[ix];
        var value = this.fn(r.center);
        this.setPoint(r.center, value);
        r.setValue(value);
        this.emit('region', r);
        this.iteration ++;
        return { point: r.center, value: value };
    }
    
    if (this._pending.length === 0) {
        var best = this.best();
        var subRegions = best.region.divide();
        
        this.emit('divide', best.region);
        var xs = [ best.index, 1 ].concat(subRegions);
        this.regions.splice.apply(this.regions, xs);
        
        for (var i = 0; i < subRegions.length; i++) {
            var r = subRegions[i];
            this.emit('region', r);
            for (var j = 0; j < r.points.length; j++) {
                var pt = r.points[j];
                var pkey = pt.join(',');
                if (!this._pointMap[pkey]) this._pointMap[pkey] = [];
                var pmk = this._pointMap[pkey];
                if (r.values[j] === undefined && pmk[0]) {
                    r.values[j] = pmk[1][0].values[pmk[1][1]];
                }
            }
            var ckey = r.center.join(',');
            if (!this._pointMap[ckey]) this._pointMap[ckey] = [];
            this._pending.push(r);
        }
    }
    
    var p = this._pending.shift();
    var value = this.fn(p.center);
    this.setPoint(p.center, value);
    p.setValue(value);
    this.iteration ++;
    return { point: p.center, value: value };
};

Search.prototype.best = function () {
    for (var i = 0; i < this.regions.length; i++) {
        this.regions[i].recompute();
    }
    
    var max = this.regions[0];
    var index = 0;
    for (var i = 0; i < this.regions.length; i++) {
        var r = this.regions[i];
        if (r.value > max.value) {
            max = r;
            index = i;
        }
    }
    return { region: max, index: index };
};

Search.prototype.setPoint = function (pt, value) {
    this.emit('test', pt, value);
    if (value > this.max) {
        this.max = value;
        this.emit('max', pt, value);
    }
    
    var regions = this._pointMap[pt.join(',')];
    for (var i = 0; i < regions.length; i++) {
        var r = regions[i][0];
        r.values[regions[i][1]] = value;
    }
};
