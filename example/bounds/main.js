var search = require('../../');
var viewer = require('./viewer')();
viewer.appendTo('#viewer');

var q = search([ [ 0, 5 ], [ 0, 5 ] ], function (pt) {
    var x = pt[0], y = pt[1];
    return Math.sin(5 * x + 3) - Math.cos(x)
        + Math.sin(3 * y - 4) - 1 / 5 * Math.cos(x * y + 3 * y)
        + 1/4 * Math.sin(3 * x - 1) - 2 * Math.cos(x)
    ;
});

q.on('region', function (r) {
    viewer.bound(r.points)
});

var next = document.querySelector('#next');
next.addEventListener('click', function () {
    var t = q.next();
    console.log('TEST', t.point, t.value);
    viewer.plot(t.point);
});
