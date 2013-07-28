var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var runningMean = require('running-mean');

module.exports = Search;
inherits(Search, EventEmitter);

function Search (bounds, fn) {
    if (!(this instanceof Search)) return new Search(bounds, fn);
    this.bounds = bounds;
    this.fn = fn;
    this.errorMean = runningMean();
    this.slopes = [];
    this.centers = [];
    this.running = false;
}

Search.prototype.stop = function () {
    this.running = false;
};

Search.prototype.start = function () {
    var self = this;
    
    var fn = self.fn;
    var dims = self.bounds.length;
    var init = {};
    var pending = 2;
    
    self.running = true;
    
    init.a = self.bounds[0][0];
    fn(init.a, function (x) {
        init.fa = x;
        self.emit('test', [ init.a ], x);
        ready();
    });
    
    init.b = self.bounds[0][1];
    fn(init.b, function (x) {
        self.emit('test', [ init.b ], x);
        init.fb = x;
        ready();
    });
    
    function ready () {
        if (--pending === 0) next(init.a, init.fa, init.b, init.fb);
    }
    
    function next (a, fa, b, fb) {
        if (!self.running) return;
        
        var center = (a + b) / 2;
        var centerMean = (fa + fb) / 2;
        
        fn(center, function (x) {
            self.emit('test', [ center ], x);
            
            var s0 = (fa - x) / (a - center);
            var s1 = (fb - x) / (b - center);
            var high = Math.max(fa, fb);
            self.slopes.push(s0, s1);
            
            var thresh = (high - fa) / Math.abs(center - a);
            
            var projected = self.slopes.map(function (s) {
                return (a - center) * s + centerMean;
            });
            var highEnough = projected.filter(function (s) {
                return s > thresh;
            });
            var portion = highEnough.length / self.slopes.length;
            var yield = mean(highEnough) / portion;
console.log('yield=', yield);
            
            self.centers.push({ center: center, yield: yield });
            
            var nextCenter = best(self.centers);
            //next();
        });
    }
};

function mean (xs) {
    var sum = 0;
    for (var i = 0; i < xs.length; i++) sum += xs[i];
    return sum / xs.length;
}

function best (centers) {
    var max = centers[0];
    for (var i = 1; i < centers.length; i++) {
        if (centers[i].yield > max.yield) max = centers[i];
    }
    return max.center;
}
