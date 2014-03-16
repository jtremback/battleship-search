var computeCenter = require('./center.js');
var mean = require('./mean.js');
var isTriangle = require('is-triangle');

module.exports = Region;

function Region (points, values) {
    if (!(this instanceof Region)) return new Region(points, values);
    this.points = points;
    this.center = computeCenter(points);
    this.values = values || [];
}

Region.prototype.set = function (fc) {
    var centerMean = (fa + fb) / 2;
    var fa = this.values[0] || 0;
    var fb = this.values[1] || 0;
    this.range = [
        Math.min(centerMean, fc),
        Math.max(centerMean, fc)
    ];
    this.fc = fc;
};

Region.prototype.getSlope = function (regions, max) {
    var a = this.points[0];
    var c = this.center;
    var fa = this.values[0] || 0;
    var fc = this.fc;
    var distAC = dist(a, c);
    return (fa - fc) / distAC;
};

Region.prototype.getScore = function (regions, max) {
    var a = this.points[0];
    var b = this.points[1];
    var fa = this.values[0] || 0;
    var fb = this.values[1] || 0;
    var c = this.center;
    var fc = this.fc;
    
    var distAC = dist(a, c);
    var centerMean = (fa + fb) / 2;
    
    var slopes = regions.map(function (r) { return r.getSlope() });
    var thresh = (max - fa) / distAC;
    
    var appliedSlopes = regions.filter(function (r) {
        return r.range[0] >= centerMean && r.range[1] <= centerMean;
    });
    if (appliedSlopes.length === 0) appliedSlopes = slopes;
    if (appliedSlopes.length === 0) return 0;
    
    var projected = appliedSlopes.map(function (s) {
        return distAC * (s || 0) + centerMean;
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
        var pts = [ this.center ];
        for (var j = 0; j < len - 1; j++) {
            pts.push(this.points[(i+j) % len]);
        }
        if (isTriangle(pts)) {
            subRegions.push(new Region(pts, []));
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
