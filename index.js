var expandBounds = require('./lib/expand_bounds.js');
var Region = require('./lib/region.js');
var mean = require('./lib/mean.js');

module.exports = Search;

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
        this.iteration ++;
        return { point: r.center, value: value };
    }
};

Search.prototype.best = function () {
    var max = this.regions[0];
    var index = 0;
    for (var i = 0; i < this.regions.length; i++) {
        var r = this.regions[i];
        if (r.value > max.value) {
            max = r;
            index = i;
        }
    }
    return { center: max, index: index };
};

Search.prototype.setPoint = function (pt, value) {
    var regions = this._pointMap[pt.join(',')];
    for (var i = 0; i < regions.length; i++) {
        var r = regions[i][0];
        r.values[regions[i][1]] = value;
    }
};
