var computeCenter = require('./center.js');

module.exports = Region;

function Region (points) {
    if (!(this instanceof Region)) return new Region(points);
    this.points = points;
    this.center = computeCenter(points);
}
