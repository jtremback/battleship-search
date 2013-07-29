var search = require('../');
var q = search([ [ 0, 5 ] ], function (pt, cb) {
    var x = pt[0];
    cb(Math.sin(x) + Math.sqrt(x) * (x - 3) * (x + 4 * Math.sin(x)));
});

var count = 0;
q.on('test', function (pt, x) {
    console.log('TEST', pt, x);
    if (count++ > 20) q.stop();
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

q.start();
