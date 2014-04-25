# battleship-search

maximize an n-dimensional landscape using the
[battleship search algorithm](http://opensourceecology.org/wiki/Anthony_Repetto/Concept_Log#Binary_Search)

[![build status](https://secure.travis-ci.org/substack/battleship-search.png)](http://travis-ci.org/substack/battleship-search)

[![testling badge](https://ci.testling.com/substack/battleship-search.png)](https://ci.testling.com/substack/battleship-search)

# example

## 2-dimensional

``` js
var search = require('battleship-search');
var q = search([ [ 0, 5 ], [ 0, 5 ] ], function (pt) {
    var x = pt[0], y = pt[1];
    return Math.sin(5 * x) - Math.cos(x)
        + Math.sin(3 * y) - 1 / 5 * Math.cos(x * y + 3 * y)
        + 1/4 * Math.sin(x - 1) - 2 * Math.cos(x)
    ;
});

var count = 0;
q.on('test', function (pt, x) {
    console.log('TEST', pt, x);
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

for (var i = 0; i < 20; i++) q.next();
```

output:

```
TEST [ 2.5, 2.5 ] 3.4489693584958943
MAX [ 2.5, 2.5 ] 3.4489693584958943
TEST [ 0, 0 ] -3.410367746201974
TEST [ 0, 2.5 ] -2.34169483299424
TEST [ 0, 5 ] -2.408142323473093
TEST [ 2.5, 5 ] 3.379747929853664
TEST [ 5, 5 ] -0.38886347782686465
TEST [ 5, 2.5 ] -0.31615536590237336
TEST [ 5, 0 ] -1.372538930314434
TEST [ 2.5, 0 ] 2.386482695940614
TEST [ 3.750000000000001, 3.75 ] 1.2931164053743218
TEST [ 3.75, 1.25 ] 1.996333158495778
TEST [ 5, 1.25 ] -1.576285943241487
TEST [ 3.75, 2.500000000000001 ] 3.4742774295274836
MAX [ 3.75, 2.500000000000001 ] 3.4742774295274836
TEST [ 3.75, 2.500000000000002 ] 3.4742774295274836
TEST [ 4.999999999999999, 3.7500000000000004 ] -2.171197217803212
TEST [ 4.375000000000003, 3.125000000000003 ] 1.1994139125493546
TEST [ 3.1249999999999973, 3.125000000000003 ] 3.1532049938105677
TEST [ 4.375000000000002, 4.374999999999999 ] 1.4491198782015409
TEST [ 4.375000000000002, 3.1250000000000018 ] 1.1994139125493692
TEST [ 1.25, 1.25 ] -1.601803452333597
```

## 4-dimensional example

``` js
var search = require('battleship-search');
var domain = [ [ -5, 5 ], [ -5, 5 ], [ -5, 5 ], [ -5, 5 ] ];

var q = search(domain, function (pt) {
    var x = pt[0], y = pt[1], z = pt[2], w = pt[3];
    return Math.sin(x + y * Math.cos(z) / 10)
        + Math.sin(3 * (y - 3)) - 7 * Math.cos((z-1) + x) * 1/2
        + 2 * Math.sin(5 * (w - 5)) * Math.sin(3 * x + 4 * w) * 1/8
    ;
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

while (true) q.next();
```

output:

```
MAX [ 0, 0, 0, 0 ] -2.303176555780246
MAX [ -5, -5, -5, -5 ] 1.827372685649148
MAX [ -3.3333333333333335,
  3.3333333333333335,
  4.440892098500626e-16,
  3.3333333333333335 ] 2.0377750437796696
MAX [ 3.3333333333333335,
  3.3333333333333335,
  -4.440892098500626e-16,
  3.3333333333333335 ] 2.973899545084325
MAX [ 5, -5, 5, -5 ] 3.168040771270319
^C
```

# methods

``` js
var search = require('battleship-search')
```

## var q = search(bounds, testFn)

Create a new search from an array of 2-element arrays `bounds` with `[min,max]`
bounds for each dimension.

`testFn(pt, cb)` fires for each point `pt` to test. `testFn()` should call
`cb()` with its result.

## var res = q.next()

Compute the next point in the search, returning `res`, an object with
the point tested, `res.point`, and the value at that point `res.value`.

# events

## q.on('test', function (pt, value) {})

Each time the test function produces a result, the `'test'` event fires with the
coordinate tested `pt` and the resulting `value`.

## q.on('max', function (pt, value) {})

Each time a test value is greater than the maximum value seen so far, the
`'max'` event fires with the point `pt` and the `value`.

# install

With [npm](https://npmjs.org) do:

```
npm install battleship-search
```

# license

MIT
