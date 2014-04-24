#!/usr/bin/env node

if (process.argv.length - 2 < 3) {
    console.error('usage: ./run.js ALGO COST ITERATIONS');
    return;
}

var path = require('path');
var algo = require(path.resolve(__dirname + '/algos', process.argv[2]));
var cost = require(path.resolve(__dirname + '/cost', process.argv[3]));
var times = parseInt(process.argv[4], 10);

var results = [];
var tested = {};

process.stdout.write('[');
var max = Number.MIN_VALUE;
var index = 0, maxes = 0;

while (true) {
    algo(cost.domain, function (pt) {
        var key = pt.map(round).join(',');
        if (tested[key]) return tested[key];
        
        var value = cost.costf(pt);
        tested[key] = value;
        
        if (value > max) {
            max = value;
            if (maxes++ !== 0) process.stdout.write(',');
            console.log(JSON.stringify({
                index: index,
                point: pt,
                value: value
            }));
        }
        index ++;
        if (index > times) {
            process.stdout.write(']');
            process.exit();
        }
        return value;
    });
}

function round (n) {
    return Math.round(n * 1e8) / 1e8;
}
