var search = require('../');
var q = search([ [ 0, 5 ] ], function (pt) {
    var x = pt[0];
    return Math.sin(5 * x) - Math.cos(x)
        + 1/4 * Math.sin(x - 1) - 2 * Math.cos(x)
    ;
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

q.on('test', function (pt, x) {
    console.log('TEST', pt, x);
});

setInterval(function () { q.next() }, 50);
