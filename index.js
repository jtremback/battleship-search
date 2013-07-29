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
    this.max = -Infinity;
    this.running = false;
}

Search.prototype.stop = function () {
    this.running = false;
};

Search.prototype.start = function () {
    var self = this;
    
    var fn = self.fn;
    var dims = self.bounds.length;
    var init = { pending: 3 };
    
    self.running = true;
    
    init.a = self.bounds[0][0];
    fn([ init.a ], function (x) {
        init.fa = x;
        self.emit('test', [ init.a ], x);
        ready();
    });
    
    init.b = self.bounds[0][1];
    fn([ init.b ], function (x) {
        self.emit('test', [ init.b ], x);
        init.fb = x;
        ready();
    });
    
    init.c = (init.a + init.b) / 2;
    fn([ init.c ], function (x) {
        self.emit('test', [ init.c ], x);
        init.fc = x;
        ready();
    });
    
    function ready () {
        if (--init.pending !== 0) return;
        
        self.max = Math.max(init.fa, init.fb, init.fc);
        if (self.max === init.fa) {
            self.emit('max', [ init.a ], init.fa);
        }
        else if (self.max === init.fb) {
            self.emit('max', [ init.b ], init.fb);
        }
        else if (self.max === init.fc) {
            self.emit('max', [ init.c ], init.fc);
        }
        
        next(init);
    }
    
    function next (pt) {
        if (!self.running) return;
        
        var pending = 2;
        
        findYield(pt.a, pt.fa, pt.c, pt.fc, result);
        findYield(pt.c, pt.fc, pt.b, pt.fb, result);
        
        function result (center) {
            self.centers.push(center);
            if (--pending !== 0) return;
            
            var c = best(self.centers);
            self.centers.splice(c.index, 1);
            next(c.center);
        }
    }
    
    function findYield (a, fa, b, fb, cb) {
        if (!self.running) return;
        
        var center = (a + b) / 2;
        var centerMean = (fa + fb) / 2;
        
        fn([ center ], function (x) {
            self.emit('test', [ center ], x);
            if (x > self.max) {
                self.emit('max', [ center ], x);
                self.max = x;
            }
            
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
            var yld = mean(highEnough) / portion;
            
            cb({
                c: center,
                'yield': yld,
                a: a, b: b, fa: fa, fb: fb
            });
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
    var index = 0;
    for (var i = 1; i < centers.length; i++) {
        if (centers[i]['yield'] > max['yield']) {
            max = centers[i];
            index = i;
        }
    }
    return { center: max, index: index };
}
