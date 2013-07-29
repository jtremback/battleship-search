var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var search = require('../../');
var q = search([ [ 0, 20 ] ], function (pt, cb) {
    var x = pt[0];
    var res = Math.sin(5 * x) - Math.cos(x) + 1/4 * Math.sin(x - 1)
        - 2 * Math.cos(x)
    ;
    setTimeout(function () { cb(res) }, 500);
});

var count = 0;
q.on('test', function (pt, y) {
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(
        800 / 20 * pt[0],
        400 - 400 / 10 * (y + 5),
        10, 0, 2 * Math.PI
    );
    ctx.closePath();
    ctx.fill();
    
    console.log('TEST', pt, y);
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

window.onclick = function () {
    q.start();
};
