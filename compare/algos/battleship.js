var search = require('../../');
var results = [];

var q = null;
module.exports = function (domain, cost) {
    if (!q) q = search(domain, cost);
    q.next();
};
