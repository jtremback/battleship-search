module.exports = function (ranges) {
    var bounds = [ [ ranges[0][0] ], [ ranges[0][1] ] ];
    
    for (var i = 1; i < ranges.length; i++) {
        for (var j = 0, l = bounds.length; j < l; j++) {
            bounds.push(bounds[j].concat(ranges[i][1]));
            bounds[j].push(ranges[i][0]);
        }
    }
    return bounds;
};
