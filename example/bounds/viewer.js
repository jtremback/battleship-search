module.exports = Viewer;
var mr = require('mrcolor')();

function Viewer () {
    if (!(this instanceof Viewer)) return new Viewer;
    this.element = createElement('svg');
    this.scale = 80;
}

Viewer.prototype.plot = function (pt) {
    var c = createElement('circle');
    c.setAttribute('cx', pt[0] * this.scale + 5);
    c.setAttribute('cy', pt[1] * this.scale + 5);
    c.setAttribute('fill', 'blue');
    c.setAttribute('r', 2);
    this.element.appendChild(c);
};

Viewer.prototype.bound = function (rpts) {
    var self = this;
console.log('pts=', rpts.join(' '));
    var pts = rpts.map(function (pt) {
        return pt.map(function (p) { return p * self.scale + 5 });
    });
    var p = createElement('polygon');
    p.setAttribute('points', pts.join(' '));
    var color = mr().rgb();
    p.setAttribute('fill', 'rgba(' + color.join(',') + ',0.5)');
    this.element.appendChild(p);
};

Viewer.prototype.appendTo = function (target) {
    if (typeof target === 'string') target = document.querySelector(target);
    target.appendChild(this.element);
};

function createElement (name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
