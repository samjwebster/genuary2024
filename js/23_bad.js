let p;
let bgc;
let bgt;
let cols;

let cells = [];

let sixtyfour = 64

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    p = getPalette();

    cols = p.colors.slice();

    let sortByValue = (a, b) => {
        let ba = (a.levels[0] + a.levels[1] + a.levels[2])/3;
        let bb = (b.levels[0] + b.levels[1] + b.levels[2])/3;
        return bb - ba;
    }
    cols.sort(sortByValue);

    if(random()>0.5) cols = cols.reverse();

    bgc = lerpColor(rc(), random()>0.5?color(0):color(255), 0.75);
    bgt = color(bgc.levels[0], bgc.levels[1], bgc.levels[2], 0);

    background(bgc);


    let pad = random(0.02, 0.01);
    let size = ((1-pad)/sixtyfour)*width;

    for(let i = 0; i < sixtyfour; i++) {
        for(let j = 0; j < sixtyfour; j++) {
            cells.push(new Cell(i, j, size, pad));
        }
    }

    let sortByAvg = (a, b) => {
        return b.avgN - a.avgN;
    }

    let sortByMax = (a, b) => {
        return b.maxN - a.maxN;
    }

    cells.sort(sortByMax).reverse();

    cells.forEach(c => c.render(0.9, 0.3, width*0.25));


    // compose();


    noLoop();
}

function rc() {
    return p.getRandomCol();
}

function rct(n) {
    let c = rc();
    let t = color(c.levels[0], c.levels[1], c.levels[2], 0);
    return lerpColor(c, t, n);
}

class Cell {
    constructor(i, j, size, col)
}

// class Cell {
//     constructor(i, j, size, pad) {
//         this.i = i;
//         this.j = j;
//         this.size = size;
//         this.pad = pad;
//         this.c = rc();

//         let ti = map(i/sixtyfour, 0, 1, pad/2, 1-pad/2);
//         let tj = map(j/sixtyfour, 0, 1, pad/2, 1-pad/2);
//         let tl = [ti*width, tj*height];
//         let center = [tl[0] + size/2, tl[1] + size/2];
//         this.center = center;

//         let posSpikes = [
//             [center[0], center[1]-size/2],
//             [center[0], center[1]+size/2],
//             [center[0]-size/2, center[1]],
//             [center[0]+size/2, center[1]],
//         ];

//         let nSpikes = [];
//         posSpikes.forEach(p => nSpikes.push(noise(p[0]*0.002, p[1]*0.002)));
//         this.pSpikes = posSpikes;
//         this.nSpikes = nSpikes;

//         let avgN = 0;
//         let maxN = 0;
//         nSpikes.forEach(n => {
//             avgN += n
//             if(n > maxN) maxN = n;
//         });
//         avgN = avgN/4;
//         this.avgN = avgN;
//         this.maxN = maxN;
//     }

//     render(mod=1, spikeBase, distMod) {
//         push();
//         stroke(bgc);
//         strokeWeight(width*0.001);
//         fill(this.c);
        
//         let c = this.center;
//         let corners = [
//             [c[0]-this.size/2, c[1]-this.size/2],
//             [c[0]+this.size/2, c[1]-this.size/2],
//             [c[0]+this.size/2, c[1]+this.size/2],
//             [c[0]-this.size/2, c[1]+this.size/2],
//         ];

//         beginShape();
//         vertex(...corners[0]);

//         let s = this.size*(spikeBase/2)

//         this.pSpikes.forEach(p => circle(...p, 5))

//         // North
//         let pNorth = this.pSpikes[0]
//         let nNorth = this.nSpikes[0]

//         let nOut = [pNorth[0], pNorth[1] - nNorth*distMod];
//         let nL = [pNorth[0] - s, pNorth[1]];
//         let nR = [pNorth[0] + s, pNorth[1]];

//         vertex(...nL);
//         vertex(...nOut);
//         vertex(...nR);

//         vertex(...corners[1]);

//         // East
//         let pEast = this.pSpikes[3]
//         let nEast = this.nSpikes[3]

//         let eOut = [pEast[0] + nEast*distMod, pEast[1]];
//         let eL = [pEast[0], pEast[1] - s];
//         let eR = [pEast[0], pEast[1] + s];

//         vertex(...eL);
//         vertex(...eOut);
//         vertex(...eR);

//         vertex(...corners[2]);

//         // South
//         let pSouth = this.pSpikes[1]
//         let nSouth = this.nSpikes[1]

//         let sOut = [pSouth[0], pSouth[1] + nSouth*distMod];
//         let sL = [pSouth[0] - s, pSouth[1]];
//         let sR = [pSouth[0] + s, pSouth[1]];

//         vertex(...sR);
//         vertex(...sOut);
//         vertex(...sL);


//         vertex(...corners[3]);

//         // West
//         let pWest = this.pSpikes[2]
//         let nWest = this.nSpikes[2]

//         let wOut = [pWest[0] - nWest*distMod, pWest[1]];
//         let wL = [pWest[0], pWest[1] - s];
//         let wR = [pWest[0], pWest[1] + s];

//         vertex(...wR);
//         vertex(...wOut);
//         vertex(...wL);

//         endShape(CLOSE);
//         pop();
//     }
// }