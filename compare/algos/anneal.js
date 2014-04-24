var anneal = require('./anneal/index.js');
var results = [];

module.exports = function (domain, cost) {
    anneal({
        domain: domain,
        temperature: 100000,
        costf: function (pt) {
            return -cost(pt);
        }
    });
};
