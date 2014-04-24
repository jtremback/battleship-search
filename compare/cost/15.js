var domain = [];
for (var i = 0; i < 15; i++) domain.push([ -10, 10 ]);
exports.domain = domain;

var sin = Math.sin;
exports.costf = function (pt) {
    return 3 * sin(pt[0]) + 1/5 * sin(11 * pt[0] - 2)
        + 7 * sin(pt[1] - 3) + 1/11 * sin(8 * pt[1])
        + 8 * sin(pt[2] * 1.2 - 8) + 0.34 * sin(6 * pt[2])
        + 5 * sin(pt[3] * 2 - 8) + 1/8 * sin(9 * pt[3])
        + 11 * sin(pt[4] * 1/2) + sin(8 * pt[4] - 2)
        + 10 * sin(pt[5] * 2) + sin(21 * pt[5] - 2/4)
        + 7.1 * sin(pt[6] - 2) + 4/11 * sin(8 * pt[6])
        + 8.2 * sin(pt[7] * 1.6 - 2) + 0.34 * sin(10 * pt[7] - 2)
        + 5.2 * sin(pt[8] * 2.3 - 8.2) + 1/8 * sin(9.1 * pt[8])
        + 11.5 * sin(pt[9] * 1/2.6) + sin(8.2 * pt[9] - 2)
        + 10.1 * sin(pt[10] * 2.2) + sin(21.3 * pt[10] - 2/4)
        + 7.6 * sin(pt[11] - 2.6) + 4/11 * sin(8.4 * pt[11])
        + 10.2 * sin(pt[12] * 2.2) + sin(21.5 * pt[12] - 2/4)
        + 7.2 * sin(pt[13] - 2.1) + 4/11 * sin(8.1 * pt[13])
        + 8.1 * sin(pt[14] * 1.2 - 2) + 0.34 * sin(10.6 * pt[14] - 2.1)
    ;
};
