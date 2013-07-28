var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

module.exports = Search;
inherits(Search, EventEmitter);

function Search (bounds, fn) {
    if (!(this instanceof Search)) return new Search(bounds, fn);
    this.bounds = bounds;
    this.fn = fn;
}

Search.prototype.stop = function () {
};

Search.prototype.start = function () {
    var self = this;
    var fn = self.fn;
    
    var dims = self.bounds.length;
    var bounds = self.bounds[0];
    
    fn(bounds[0], function (x) {
        self.emit('test', [ bounds[0] ], x);
    });
    fn(bounds[1], function (x) {
        self.emit('test', [ bounds[1] ], x);
    });
};
