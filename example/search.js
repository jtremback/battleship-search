var search = require('../');
var q = search([ [ 0, 5 ] ], function (pt, cb) {
    var x = pt[0];
    cb(
        Math.sin(5 * x) - Math.cos(x)
        + 1/4 * Math.sin(x - 1) - 2 * Math.cos(x)
    );
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

q.start();
