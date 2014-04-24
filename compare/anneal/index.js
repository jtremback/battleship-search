module.exports = function(options){
    var domain = options['domain'];
    var costf = options['costf'];
    var temperature = options['temperature'];
    var cool = options['cool'];
    var step = options['step'];

    var i;
    var vec = [];
    for(i=0 ; i<domain.length ; i++) {
        var a = domain[i][0], b = domain[i][1];
        vec.push(Math.random() * (b - a) + a);
    }

    while(temperature > 0.1) {
        var idx = Math.floor(Math.random() * domain.length);
        var dir = (2 * Math.random() - 1) * step;
        var newVec = [];
        for(i=0; i<vec.length ; i++)
            newVec.push(vec[i]);
        newVec[idx]+=dir;
        if(newVec[idx] < domain[idx][0]) newVec[idx] = domain[idx][0];
        if(newVec[idx] > domain[idx][1]) newVec[idx] = domain[idx][1];

        var ea = costf(vec);
        var eb = costf(newVec);
        var p = Math.exp(-1.*(eb-ea)/temperature);
        if(eb < ea || Math.random() < p)
            vec = newVec;

        temperature *= cool;
    }

    return vec;
}
