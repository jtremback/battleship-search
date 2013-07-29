var search = require('../');
var domain = [ [ -5, 5 ], [ -5, 5 ], [ -5, 5 ], [ -5, 5 ] ];

var q = search(domain, function (pt, cb) {
    var x = pt[0], y = pt[1], z = pt[2], w = pt[3];
    cb(
        Math.sin(x + y * Math.cos(z) / 10)
        + Math.sin(3 * y) - Math.cos(z + x) * 1/2
        + Math.sin(5 * w) * Math.sin(3 * x + 4 * w) * 1/8
    );
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

q.start();
