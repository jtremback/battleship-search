var ml = require('machine_learning');
var results = [];

var domain = [ [ 0, 5 ], [ 0, 5 ] ];

function cost (pt) {
    var x = pt[0], y = pt[1];
    return Math.sin(5 * x + 3) - Math.cos(x)
        + Math.sin(3 * y - 4) - 1 / 5 * Math.cos(x * y + 3 * y)
        + 1/4 * Math.sin(3 * x - 1) - 2 * Math.cos(x)
    ;
}

var max = Number.MIN_VALUE;
var index = 0;
var times = parseInt(process.argv[2], 10);

process.on('exit', function () {
    process.stdout.write(']');
});

while (true) {
    ml.optimize.hillclimb({
        domain: domain,
        costf: function (pt) {
            var value = cost(pt);
            if (value > max) {
                max = value;
                
                if (index !== 0) process.stdout.write(',');
                console.log(JSON.stringify({
                    index: index,
                    value: value,
                    point: pt
                }));
            }
            index ++;
            if (index > times) process.exit();
            return -value;
        }
    });
}
