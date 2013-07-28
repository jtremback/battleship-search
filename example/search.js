var search = require('../');
var q = search([ [ 0, 5 ] ], function (x, cb) {
    cb(Math.sin(x) + Math.sqrt(x) * (x - 3) * (x + 4 * Math.sin(x)));
});

q.on('test', function (pt, x) {
    console.log('TEST', pt, x);
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

q.start();
