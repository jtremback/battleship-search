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
    
    this.slopes = [];
    this.regions = [];
    this._pointMap = {};
    
    this.center = range.map(mean);
    
    for (var i = 0; i < this.corners.length; i++) {
        var a = this.corners[i];
        var b = this.corners[(i+1) % this.corners.length];
        var r = Region([ a, b, this.center ], [], this)
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
        this.iteration ++;
        this.setPoint(this.center, value);
        return { point: this.center, value: value };
    }
    if (this.iteration <= this.corners.length) {
        var ix = this.iteration - 1;
        var pt = this.corners[ix];
        var r = this.regions[ix];
        this.iteration ++;
        var value = this.fn(pt);
        this.setPoint(pt, value);
        return { point: pt, value: value };
    }
    
    this.iteration ++;
};

Search.prototype.setPoint = function (pt, value) {
    var regions = this._pointMap[pt.join(',')];
    for (var i = 0; i < regions.length; i++) {
        var r = regions[i][0];
        r.values[regions[i][1]] = value;
    }
};
