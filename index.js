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
}

Search.prototype.stop = function () {
};

Search.prototype.start = function () {
    var self = this;
    var fn = self.fn;
    var dims = self.bounds.length;
    var init = [ undefined, undefined ];
    var pending = 2;
    
    var initA = self.bounds[0][0];
    fn(initA, function (x) {
        init[0] = [ initA, x ];
        self.emit('test', [ initA ], x);
        ready();
    });
    
    var initB = self.bounds[0][1];
    fn(initB, function (x) {
        self.emit('test', [ initB ], x);
        init[1] = [ initB, x ];
        ready();
    });
    
    function ready () {
        if (--pending === 0) next(init);
    }
    
    function next (bounds) {
        var a = bounds[0][0], b = bounds[1][0];
        var fa = bounds[0][1], fb = bounds[1][1];
        var center = (a + b) / 2;
        var centerMean = (fa + fb) / 2;
        
        fn(center, function (x) {
            self.emit('test', [ center ], x);
            
            var s0 = (fa - x) / (a - center);
            var s1 = (fb - x) / (b - center);
            var high = Math.max(fa, fb);
            self.slopes.push(s0, s1);
            
            var thresh = (high - fa) / Math.abs(center - a);
            var highEnough = self.slopes.filter(function (s) {
                return s > thresh;
            });
            var portion = highEnough.length / self.slopes.length;
            var yield = mean(highEnough) / portion;
            
            console.log('yield=', yield);
            
            console.dir([ s0, s1 ]);
            
        });
    }
};

function mean (xs) {
    var sum = 0;
    for (var i = 0; i < xs.length; i++) sum += xs[i];
    return sum / xs.length;
}
