var search = require('../');
var domain = [ [ -5, 5 ], [ -5, 5 ], [ -5, 5 ], [ -5, 5 ] ];

var q = search(domain, function (pt) {
    var x = pt[0], y = pt[1], z = pt[2], w = pt[3];
    return Math.sin(x + y * Math.cos(z) / 10)
        + Math.sin(3 * (y - 3)) - 7 * Math.cos((z-1) + x) * 1/2
        + 2 * Math.sin(5 * (w - 5)) * Math.sin(3 * x + 4 * w) * 1/8
    ;
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

while (true) {
    //console.log(q.next());
    q.next();
}
