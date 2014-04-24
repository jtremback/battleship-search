var search = require('../');
var results = [];

var q = search([ [ 0, 5 ], [ 0, 5 ] ], function (pt) {
    var x = pt[0], y = pt[1];
    return Math.sin(5 * x + 3) - Math.cos(x)
        + Math.sin(3 * y - 4) - 1 / 5 * Math.cos(x * y + 3 * y)
        + 1/4 * Math.sin(3 * x - 1) - 2 * Math.cos(x)
    ;
});

var times = parseInt(process.argv[2], 10);
process.stdout.write('[');
var max = Number.MIN_VALUE;

for (var i = 0; i < times; i++) {
    var value = q.next();
    if (value.value > max) {
        max = value.value;
        if (i !== 0) process.stdout.write(',');
        console.log(JSON.stringify({
            index: i,
            value: value.value,
            point: value.point
        }));
    }
}
process.stdout.write(']');
