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
TEST [ 3.125 ] 3.2950351120302708
MAX [ 3.125 ] 3.2950351120302708
TEST [ 4.375 ] 1.051137369654716
TEST [ 4.0625 ] 2.8292361992816173
TEST [ 4.6875 ] -1.0474059319720759
TEST [ 3.90625 ] 2.853262288251983
TEST [ 4.21875 ] 2.1839376570275504
TEST [ 4.140625 ] 2.5838763083094087
TEST [ 4.296875 ] 1.6576747894464356
TEST [ 2.8125 ] 4.078954538271598
MAX [ 2.8125 ] 4.078954538271598
TEST [ 3.4375 ] 2.0356107371499594
TEST [ 2.65625 ] 3.558159548506052
TEST [ 2.96875 ] 3.9463482836752064
TEST [ 3.28125 ] 2.517401415907384
TEST [ 3.59375 ] 2.0574794924829236
TEST [ 2.890625 ] 4.093839145038978
MAX [ 2.890625 ] 4.093839145038978
TEST [ 3.046875 ] 3.6648351771981242
TEST [ 2.8515625 ] 4.107647760472744
MAX [ 2.8515625 ] 4.107647760472744
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
