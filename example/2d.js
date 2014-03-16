var search = require('../');
var q = search([ [ 0, 5 ], [ 0, 5 ] ], function (pt) {
    var x = pt[0], y = pt[1];
    return Math.sin(5 * x) - Math.cos(x)
        + Math.sin(3 * y) - 1 / 5 * Math.cos(x * y + 3 * y)
        + 1/4 * Math.sin(x - 1) - 2 * Math.cos(x)
    ;
});

var count = 0;
q.on('test', function (pt, x) {
    console.log('TEST', pt, x);
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

for (var i = 0; i < 20; i++) q.next();
