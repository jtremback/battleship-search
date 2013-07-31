var search = require('../');
var test = require('tape');

test('1-dimensional', function (t) {
    t.plan(2);
    
    var results = [];
    
    var q = search([ [ 0, 5 ] ], function (pt, cb) {
        var x = pt[0];
        cb(
            Math.sin(5 * x) - Math.cos(x)
            + 1/4 * Math.sin(x - 1) - 2 * Math.cos(x)
        );
    });
    
    t.on('end', function () { q.stop() });
    
    q.on('max', function (pt, x) {
        if (results.length === 13) {
            t.pass('got enough maximum results');
            t.ok(x > 4.10827, 'found a good enough solution');
        }
        results.push([ pt, x ]);
    });
    
    q.start();
});
