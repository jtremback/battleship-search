var search = require('../../');
var viewer = require('./viewer')();
viewer.appendTo('#viewer');

var q = search([ [ 0, 5 ], [ 0, 5 ] ], function (pt, cb) {
    var x = pt[0], y = pt[1];
    cb(
        Math.sin(5 * x) - Math.cos(x)
        + Math.sin(3 * y) - 1 / 5 * Math.cos(x * y + 3 * y)
        + 1/4 * Math.sin(x - 1) - 2 * Math.cos(x)
    );
});

var count = 0;
q.on('test', function (pt, x) {
    viewer.plot(pt);
    console.log('TEST', pt, x);
    if (count++ > 20) q.stop();
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

q.start();
