optimize = module.exports;

module.exports = function(options){
    var domain = options['domain'];
    var costf = options['costf'];

    var i;
    var vec = [];
    for(i=0 ; i<domain.length ; i++) {
        var a = domain[i][0], b = domain[i][1];
        vec.push(Math.random() * (b - a) + a);
    }

    var current, best;

    while(true) {
        var neighbors = [];
        var i,j;

        for(i=0 ; i<domain.length ; i++) {
            if(vec[i] > domain[i][0]) {
                var newVec = [];
                for(j=0 ; j<domain.length ; j++)
                    newVec.push(vec[j]);
                newVec[i]-=1;
                neighbors.push(newVec);
            } else if (vec[i] < domain[i][1]) {
                var newVec = [];
                for(j=0 ; j<domain.length ; j++)
                    newVec.push(vec[j]);
                newVec[i]+=1;
                neighbors.push(newVec);
            }
        }

        current = costf(vec);
        best = current;
        for(i=0 ; i<neighbors.length ; i++) {
            var cost = costf(neighbors[i]);
            if(cost < best) {
                best = cost;
                vec = neighbors[i];
            }
        }
        if(best === current)
            break;
    }
    return vec;
}
