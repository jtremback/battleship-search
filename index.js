var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var expandBounds = require('./lib/expand_bounds.js');

module.exports = Search;
inherits(Search, EventEmitter);

function Search (bounds, fn) {
    if (!(this instanceof Search)) return new Search(bounds, fn);
    this.bounds = bounds;
    this.fn = fn;
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
    var init = { pending: 3 };
    
    self.running = true;
    
    init.a = [ self.bounds[0][0] ];
    fn(init.a, function (x) {
        init.fa = x;
        self.emit('test', init.a, x);
        ready();
    });
    
    init.b = [ self.bounds[0][1] ];
    fn(init.b, function (x) {
        self.emit('test', init.b, x);
        init.fb = x;
        ready();
    });
    
    init.c = [ (init.a + init.b) / 2 ];
    fn(init.c, function (x) {
        self.emit('test', init.c, x);
        init.fc = x;
        ready();
    });
    
    function ready () {
        if (--init.pending !== 0) return;
        
        self.max = Math.max(init.fa, init.fb, init.fc);
        if (self.max === init.fa) {
            self.emit('max', init.a, init.fa);
        }
        else if (self.max === init.fb) {
            self.emit('max', init.b, init.fb);
        }
        else if (self.max === init.fc) {
            self.emit('max', init.c, init.fc);
        }
        
        self._next(init);
    }
};

Search.prototype._next = function (pt) {
    var self = this;
    if (!self.running) return;
    
    var pending = 2;
    
    self._findYield(pt.a, pt.fa, pt.c, pt.fc, result);
    self._findYield(pt.c, pt.fc, pt.b, pt.fb, result);
    
    function result (center) {
        self.centers.push(center);
        if (--pending !== 0) return;
        
        var c = best(self.centers);
        self.centers.splice(c.index, 1);
        self._next(c.center);
    }
};
    
Search.prototype._findYield = function (a, fa, b, fb, cb) {
    var self = this;
    if (!self.running) return;
    
    var center = [ (a[0] + b[0]) / 2 ]; // TODO MULTI
    var centerMean = (fa + fb) / 2;
    
    self.fn(center, function (fc) {
        self.emit('test', center, fc);
        if (fc > self.max) {
            self.emit('max', center, fc);
            self.max = fc;
        }
        
        var s0 = (fa - fc) / (a[0] - center[0]); // TODO MULTI
        var s1 = (fb - fc) / (b[0] - center[0]); // TODO MULTI
        self.slopes.push(s0, s1);
        
        var thresh = (self.max - fa) / Math.abs(center[0] - a[0]); // TODO MULTI
        
        var projected = self.slopes.map(function (s) {
            return (a[0] - center[0]) * s + centerMean; // TODO MULTI
        });
        var highEnough = projected.filter(function (s) {
            return s > thresh;
        });
        var portion = highEnough.length / self.slopes.length;
        
        cb({
            'yield': portion > 0
                ? mean(highEnough) / portion
                : 0
            ,
            a: a, fa: fa,
            b: b, fb: fb,
            c: center, fc: fc
        });
    });
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
