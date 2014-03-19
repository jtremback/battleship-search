var center = require('../lib/center.js');
var test = require('tape');

test('circumscribed center', function (t) {
    var pt2 = center([ [ 0, 5 ], [ 2.5, 2.5 ], [ 5, 5 ] ]);
    t.deepEqual(pt2, [ 2.5, 5 ], '2d');
    
    var pt4 = center([
        [ 0, 0, 0, 0 ],
        [ -5, -5, -5, 0 ],
        [ -5, -5, -5, 5 ],
    ]);
    console.log(pt4);
    t.equal(pt4.length, 4);
    
    t.end();
});
