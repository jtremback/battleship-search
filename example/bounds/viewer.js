module.exports = Viewer;

function Viewer () {
    if (!(this instanceof Viewer)) return new Viewer;
    this.element = createElement('svg');
}

Viewer.prototype.plot = function (pt) {
    var c = createElement('circle');
    c.setAttribute('cx', pt[0] * 100);
    c.setAttribute('cy', pt[1] * 100);
    c.setAttribute('fill', 'blue');
    c.setAttribute('r', 2);
    this.element.appendChild(c);
};

Viewer.prototype.appendTo = function (target) {
    if (typeof target === 'string') target = document.querySelector(target);
    target.appendChild(this.element);
};

function createElement (name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
