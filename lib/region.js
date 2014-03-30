//var computeCenter = require('./center.js');
var computeCenter = require('circumcenter');

var mean = require('./mean.js');
var isTriangle = require('is-triangle');

module.exports = Region;

function Region (points) {
    var self = this;
    if (!(this instanceof Region)) return new Region(points);
    this.points = points;
    
    this.a = points[0];
    this.b = points[1];
    this.c = computeCenter(points);
    
    this._queue = [ [ 'a', 'fa' ], [ 'b', 'fb' ], [ 'c', 'fc' ] ];
}

Region.prototype.next = function (fn) {
    var q = this._queue.shift();
    if (q) {
        var pt = this[q[0]];
        var value = fn(pt);
        this[q[1]] = value;
        return { point: pt, value: value };
    }
    
    this.centerMean = (this.fa + this.fb) / 2;
    this.range = [
        Math.min(this.centerMean, this.fc),
        Math.max(this.centerMean, this.fc)
    ];
    this.distAC = dist(this.a, this.c);
    this.slope = (this.fa - this.fc) / this.distAC;
    
    return null;
};

Region.prototype.getScore = function (regions, max) {
    var self = this;
    var slopes = regions.map(function (r) { return r.slope });
    var thresh = (max - this.fa) / this.distAC;
    
    var appliedSlopes = regions.filter(function (r) {
        return r.range[0] >= self.centerMean
            && r.range[1] <= self.centerMean
        ;
    });
    if (appliedSlopes.length === 0) appliedSlopes = slopes;
    if (appliedSlopes.length === 0) return 0;
    
    var projected = appliedSlopes.map(function (s) {
        return self.distAC * s + self.centerMean;
    });
    var highEnough = projected.filter(function (s) {
        return s > thresh;
    });
    var portion = highEnough.length / appliedSlopes.length;
    return portion > 0 ? mean(highEnough) / portion : 0;
};

Region.prototype.recompute = function () {
    if (this.fc !== undefined) this.setValue(this.fc);
};

Region.prototype.divide = function () {
    var subRegions = [];
    var len = this.points.length;
    
    for (var i = 0; i < len; i++) {
        var pts = [ this.c ];
        for (var j = 0; j < len - 1; j++) {
            pts.push(this.points[(i+j) % len]);
        }
        if (isTriangle(pts)) {
            subRegions.push(new Region(pts));
        }
    }
    return subRegions;
};

function dist (a, b) {
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
        var d = a[i] - b[i];
        sum += d * d;
    }
    return Math.sqrt(sum);
}
