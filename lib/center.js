var rref = require('rref');

module.exports = function (points) {
    var rows = [];
    var a = points[0];
    var dim = a.length;
    
    for (var i = 1; i < points.length; i++) {
        var b = points[i];
        
        var row = [];
        var z = 0;
        for (var k = 0; k < dim; k++) {
            row.push(b[k] - a[k]);
            z += (b[k] - a[k]) * (b[k] + a[k]) / 2;
        }
        row.push(z);
        rows.push(row);
    }
    if (!rref(rows)) return undefined;
    
    var res = [];
    for (var i = 0; i < rows.length; i++) {
        res.push(rows[i][rows[i].length - 1]);
    }
    return res;
};
