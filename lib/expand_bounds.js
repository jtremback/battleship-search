var gray = require('gray-code');

module.exports = function (ranges) {
    var bounds = [ [ ranges[0][0] ], [ ranges[0][1] ] ];
    var indexes = gray(ranges.length);
    return indexes.map(function (ix) {
        return ix.map(function (i, j) {
            return ranges[j][i];
        });
    });
};
