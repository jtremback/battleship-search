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
    this._buffered = [];
    
    this.max = -Infinity;
    this.iteration = 0;
}

Search.prototype.next = function () {
    var self = this;
    
    if (this._buffered.length > 0) {
        this.iteration ++;
        return this._buffered.shift();
    }
    
    if (this.iteration === 0) {
        var center = this.range.map(mean);
        this.test(center);
        
        for (var i = 0; i < this.corners.length; i++) {
            var pts = [ center ];
            for (var j = 0; j < this.range.length; j++) {
                pts.push(this.corners[(i+j) % this.corners.length]);
            }
            var r = Region(pts, function (pt) {
                return self.test(pt);
            });
            this.regions.push(r);
            this.emit('region', r);
        }
    }
    else if (this.iteration <= this.corners.length) {
        var ix = this.iteration - 1;
        var pt = this.corners[ix];
        this.test(pt);
    }
    else if (this.iteration <= this.corners.length + this.regions.length) {
        var ix = this.iteration - this.corners.length - 1;
        var r = this.regions[ix];
        this.test(r.center);
        this.emit('region', r);
    }
    else {
        var best = this.best();
        var subRegions = best.region.divide();
        
        this.emit('divide', best.region);
        var xs = [ best.index, 1 ].concat(subRegions);
        this.regions.splice.apply(this.regions, xs);
        
        for (var i = 0; i < subRegions.length; i++) {
            this.emit('region', subRegions[i]);
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
    console.log('BEST', index, score);
    return { region: max, index: index };
};

Search.prototype.test = function (pt) {
    var key = pt.join(',');
    if (this._pointMap[key] !== undefined) return this._pointMap[key];
    
    var value = this.fn(pt);
    this._pointMap[key] = value;
    
    this.emit('test', pt, value);
    if (value > this.max) {
        this.max = value;
        this.emit('max', pt, value);
    }
    
    this._buffered.push({ point: pt, value: value });
    return value;
};
