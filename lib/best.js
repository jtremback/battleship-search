module.exports = function (centers) {
    var max = centers[0];
    var index = 0;
    for (var i = 1; i < centers.length; i++) {
        if (centers[i]['yield'] > max['yield']) {
            max = centers[i];
            index = i;
        }
    }
    return { center: max, index: index };
};
