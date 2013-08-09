var rref = require('rref');

module.exports = function (points) {
    var a = points[0];
    var rows = [];
    
    for (var i = 1; i < points.length; i++) {
        var b = points[i];
        var row = [];
        
        var z = 0;
        for (var j = 0; j < a.length; j++) {
            row.push(b[j] - a[j]);
            z += (b[j] - a[j]) * (b[j] + a[j]) / 2;
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
