var hillclimb = require('./hillclimb/index.js');
var results = [];

module.exports = function (domain, cost) {
    hillclimb({
        domain: domain,
        costf: function (pt) { return -cost(pt) }
    });
};
