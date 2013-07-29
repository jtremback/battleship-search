# battleship-search

maximize an n-dimensional landscape using the
[battleship search algorithm](http://opensourceecology.org/wiki/Anthony_Repetto/Concept_Log#Binary_Search)

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

var count = 0;
q.on('test', function (pt, x) {
    console.log('TEST', pt, x);
    if (count++ > 20) q.stop();
});

q.on('max', function (pt, x) {
    console.log('MAX', pt, x);
});

q.start();
```

output:

```
TEST [ 0 ] -3.210367746201974
TEST [ 5 ] -1.1725389303144338
TEST [ 2.5 ] 2.586482695940614
MAX [ 2.5 ] 2.586482695940614
TEST [ 1.25 ] -0.9172953139197322
TEST [ 3.75 ] 2.457701773132917
TEST [ 0.625 ] -2.5078655985578178
TEST [ 1.875 ] 1.1402438004288078
TEST [ 3.125 ] 3.2950351120302708
MAX [ 3.125 ] 3.2950351120302708
TEST [ 4.375 ] 1.051137369654716
TEST [ 0.3125 ] -2.013390028470085
TEST [ 0.9375 ] -2.790720340054251
TEST [ 1.5625 ] 1.1075767338974998
TEST [ 2.1875 ] 0.9685926649069998
TEST [ 2.8125 ] 4.078954538271598
MAX [ 2.8125 ] 4.078954538271598
TEST [ 3.4375 ] 2.0356107371499594
TEST [ 4.0625 ] 2.8292361992816173
TEST [ 4.6875 ] -1.0474059319720759
TEST [ 0.15625 ] -2.4460710559787806
TEST [ 0.46875 ] -2.0872025767959683
TEST [ 0.78125 ] -2.876643819629943
TEST [ 1.09375 ] -2.081406810502803
TEST [ 1.40625 ] 0.287598866659619
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
