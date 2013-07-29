var search = require('../');
var q = search([ [ 0, 5 ] ], function (pt, cb) {
    var x = pt[0];
    cb(
        Math.sin(5 * x) - Math.cos(x)
        + 1/4 * Math.sin(x - 1) - 2 * Math.cos(x)
    );
});

var count = 0;
q.on('test', function (pt, x) {
    console.log('TEST', pt, x);
    if (count++ > 24) q.stop();
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
    if (count++ > 24) q.stop();
});

q.start();
