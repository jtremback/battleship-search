var search = require('../../');
var viewer = require('./viewer')();
viewer.appendTo('#viewer');
var maxLabel = document.querySelector('#max');

var q = search([ [ 0, 5 ], [ 0, 5 ] ], function (pt) {
    var x = pt[0], y = pt[1];
    return Math.sin(5 * x + 3) - Math.cos(x)
        + Math.sin(3 * y - 4) - 1 / 5 * Math.cos(x * y + 3 * y)
        + 1/4 * Math.sin(3 * x - 1) - 2 * Math.cos(x)
    ;
});

var shapes = {};
q.on('region', function (r) {
    var key = r.points.join(' ');
    shapes[key] = viewer.bound(r.points)
});

q.on('divide', function (r) {
    var key = r.points.join(' ');
    shapes[key].parentNode.removeChild(shapes[key]);
});

q.on('max', function (pt, x) {
    maxLabel.textContent = x + ' on iteration ' + q.iteration;
});

var next = document.querySelector('#next');
next.addEventListener('click', function () {
    var t = q.next();
    console.log('TEST', t.point, t.value);
    viewer.plot(t.point);
});
