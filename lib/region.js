var computeCenter = require('./center.js');
var mean = require('./mean.js');
var isTriangle = require('is-triangle');

module.exports = Region;

function Region (points, values) {
    if (!(this instanceof Region)) return new Region(points, values);
console.log('REGION', points.join(' '));
    this.points = points;
    this.center = computeCenter(points);
    this.values = values || [];
}

Region.prototype.set = function (fc) {
    this.fc = fc;
};

Region.prototype.getScore = function (search) {
    var a = this.points[0];
    var b = this.points[1];
    var fa = this.values[0] || 0;
    var fb = this.values[1] || 0;
    var c = this.center;
    var fc = this.fc;
    
    var distAC = dist(a, c);
    var centerMean = (fa + fb) / 2;
    
    this.slope = (fa - fc) / distAC;
    this.range = [
        Math.min(centerMean, fc),
        Math.max(centerMean, fc)
    ];
    
    var thresh = (search.max - fa) / distAC;
    var appliedSlopes = search.regions
        .map(function (r) { return this.slope })
        .filter(function (s) {
            if (s === undefined) return false;
            return s.range[0] >= centerMean && s.range[1] <= centerMean;
        })
    ;
    if (appliedSlopes.length === 0) {
        appliedSlopes = search.regions
            .map(function (r) { return r.slope })
            .filter(function (s) { return s !== undefined })
        ;
    }
    if (appliedSlopes.length === 0) return 0;
    var projected = appliedSlopes.map(function (s) {
        return distAC * (s.slope || 0) + centerMean;
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
        if (isTriangle(pts)) subRegions.push(new Region(pts, []));
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
