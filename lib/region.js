var computeCenter = require('./center.js');
var mean = require('./mean.js');

module.exports = Region;

function Region (points, values, search) {
    if (!(this instanceof Region)) return new Region(points, values);
    this.points = points;
    this.center = computeCenter(points);
    this.values = values || [];
    this.search = search;
}

Region.prototype.setValue = function (fc) {
    var a = this.points[0];
    var b = this.points[1];
    var fa = this.values[0];
    var fb = this.values[1];
    var c = this.center;
    this.fc = fc;
    
    var distAC = dist(a, c);
    var centerMean = (fa + fb) / 2;
    
    this.slope = (fa - fc) / distAC;
    this.range = [
        Math.min(centerMean, fc),
        Math.max(centerMean, fc)
    ];
    
    var thresh = (this.search.max - fa) / distAC;
    var appliedSlopes = this.search.slopes.filter(function (s) {
        return s.range[0] >= centerMean && s.range[1] <= centerMean;
    });
    if (appliedSlopes.length === 0) appliedSlopes = this.search.slopes;
    var projected = appliedSlopes.map(function (s) {
        return distAC * s.slope + centerMean;
    });
    var highEnough = projected.filter(function (s) {
        return s > thresh;
    });
    var portion = highEnough.length / appliedSlopes.length;
    this.value = portion > 0 ? mean(highEnough) / portion : 0;
};

function dist (a, b) {
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
        var d = a[i] - b[i];
        sum += d * d;
    }
    return Math.sqrt(sum);
}
