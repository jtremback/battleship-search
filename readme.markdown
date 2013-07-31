# battleship-search

maximize an n-dimensional landscape using the
[battleship search algorithm](http://opensourceecology.org/wiki/Anthony_Repetto/Concept_Log#Binary_Search)

[![build status](https://secure.travis-ci.org/substack/battleship-search.png)](http://travis-ci.org/substack/battleship-search)

[![testling badge](https://ci.testling.com/substack/battleship-search.png)](https://ci.testling.com/substack/battleship-search)

# example

## 1-dimensional

``` js
var search = require('battleship-search');
var q = search([ [ 0, 5 ] ], function (pt, cb) {
    var x = pt[0];
    cb(
        Math.sin(5 * x) - Math.cos(x)
        + 1/4 * Math.sin(x - 1) - 2 * Math.cos(x)
    );
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

q.start();
```

output:

```
MAX [ 2.5 ] 2.586482695940614
MAX [ 3.125 ] 3.2950351120302708
MAX [ 2.8125 ] 4.078954538271598
MAX [ 2.890625 ] 4.093839145038978
MAX [ 2.8515625 ] 4.107647760472744
MAX [ 2.861328125 ] 4.108143493735451
MAX [ 2.8564453125 ] 4.108227683718651
MAX [ 2.85888671875 ] 4.108268474284235
MAX [ 2.857666015625 ] 4.108268817327394
MAX [ 2.8582763671875 ] 4.108273828324046
MAX [ 2.858257293701172 ] 4.1082738286448475
MAX [ 2.858266830444336 ] 4.108273829749719
MAX [ 2.8582656383514404 ] 4.10827382975
^C
```

## 4-dimensional example

``` js
var search = require('battleship-search');
var domain = [ [ -5, 5 ], [ -5, 5 ], [ -5, 5 ], [ -5, 5 ] ];

var q = search(domain, function (pt, cb) {
    var x = pt[0], y = pt[1], z = pt[2], w = pt[3];
    cb(
        Math.sin(x + y * Math.cos(z) / 10)
        + Math.sin(3 * y) - Math.cos(z + x) * 1/2
        + Math.sin(5 * w) * Math.sin(3 * x + 4 * w) * 1/8
    );
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

q.start();
```

output:

```
MAX [ -5, 5, -5, 5 ] 2.0750809293428523
MAX [ 1.25, -3.75, -3.75, 1.25 ] 2.365703195960478
MAX [ 1.25, -3.75, -3.75, 3.75 ] 2.369529012327853
MAX [ 1.25, -3.75, -3.75, -3.75 ] 2.3803181691252
MAX [ 2.03125, 0.46875, 1.40625, 0.15625 ] 2.3943124663892474
MAX [ 2.03125, 0.46875, 1.40625, 0.46875 ] 2.4460672123039338
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

## q.start()

Start the search. The search goes on forever until stopped.

## q.stop()

Stop the search.

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
