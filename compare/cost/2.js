exports.domain = [ [ 0, 5 ], [ 0, 5 ] ];
exports.costf = function (pt) {
    var x = pt[0], y = pt[1];
    return Math.sin(5 * x + 3) - Math.cos(x)
        + Math.sin(3 * y - 4) - 1 / 5 * Math.cos(x * y + 3 * y)
        + 1/4 * Math.sin(3 * x - 1) - 2 * Math.cos(x)
    ;
};
