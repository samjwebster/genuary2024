let stairs = [];

let im;

function preload() {
    im = loadImage("../assets/img/triangle.png")
}

function setup() {

    createCanvas(1000,1000);
    // image(im, 0, 0, width, height);

    p = getPalette();
    pc = p.size;


    // for(let i = 0; i < )

    noLoop();
}

function rc() {
    return p.getRandomCol();
}

function draw() {

    let cols = shuffleArray(p.colors);
    let bg = cols[0];
    background(bg);

    let a = cols[1];
    let b = cols[2];
    let c = cols[3];
    let sc = cols[random([0,4])];


    let xRange = [width*0.05, width*0.95];
    // xRange = [0,width];
    let yRange = [height*0.05, height*0.95];
    // yRange = [0,height];

    // let w = width*0.16;


    let amt = 0.16;
    let w = amt*(xRange[1]-xRange[0]);


    let tops = [
        [lerp(...xRange, 0.5)-(w/2), lerp(...yRange, 0)],
        [lerp(...xRange, 0.5)+(w/2), lerp(...yRange, 0)],
    ];

    let lefts = [
        [lerp(...xRange, 0.0), lerp(...yRange, 1)-(w)],
        [lerp(...xRange, 0.0)+(w/2), lerp(...yRange, 1)],
    ];

    let rights = [
        [lerp(...xRange, 1.0), lerp(...yRange, 1)-(w)],
        [lerp(...xRange, 1.0)-(w/2), lerp(...yRange, 1)],
    ];

    outerMids = [
        lerpPos(tops[0], rights[1], 1-(1.9*amt)),
        lerpPos(rights[0], lefts[0], 1-(1.9*amt)),
        lerpPos(lefts[1], tops[1], 1-(1.9*amt)),
    ];

    let mid = [0,0];
    outerMids.forEach(i => {mid[0] += i[0]; mid[1] += i[1];});
    mid = [mid[0]/3, mid[1]/3];

    innerMids = [
        lerpPos(mid, lerpPos(...tops, 0.5), amt*1.66),
        lerpPos(mid, lerpPos(...lefts, 0.5), amt*1.66),
        lerpPos(mid, lerpPos(...rights, 0.5), amt*1.66),
    ];

    let panelA = [
        lefts[1],
        lefts[0],
        tops[0],
        outerMids[0],
        innerMids[2],
        outerMids[2],
    ];

    let panelB = [
        tops[0],
        tops[1],
        rights[0],
        outerMids[1],
        innerMids[1],
        outerMids[0],
    ];

    let panelC = [
        rights[0],
        rights[1],
        lefts[1],
        outerMids[2],
        innerMids[0],
        outerMids[1],
    ];


    


    ns = random(0.001, 0.02);
    


    panelA = fillPts(panelA, 1);
    panelB = fillPts(panelB, 1);
    panelC = fillPts(panelC, 1);

    noStroke();

    let order = shuffleArray([1, 2, 3]);
    for(let i = 0; i < 3; i++) {
        if(order[i] == 1) {
            fill(a);
            beginShape();
            panelA.forEach(p => {
                vertex(...p);
                circle(...p, random(1, 3));
            });
            endShape();
        }
        if(order[i] == 2) {
            fill(b);
            beginShape();
            panelB.forEach(p => {
                vertex(...p);
                circle(...p, random(1, 3));
            });
            endShape();
        }
        if(order[i] == 3) {
            fill(c);
            beginShape();
            panelC.forEach(p => {
                vertex(...p);
                circle(...p, random(1, 3));
            });
            endShape();
        }
    }

    granulate(8);
    noLoop();
}

let ns = 0.01;

function fillPts(pts, d=2) {
    newPts = [];
    for(let i = 0; i < pts.length; i++) {
        let a = pts[i];
        let b = pts[(i+1)%pts.length];
        let dAB = dist(...a, ...b);
        let ct = dAB/d;
        for(let j = 0; j < ct; j++) {
            let t = j/(ct);
            let p = lerpPos(a, b, t);
            newPts.push(p);
        }
    }
    newPts.push(pts[pts.length-1]);

    nStr = width*0.01;
    for(let i = 0; i < newPts.length; i++) {
        let p = newPts[i];
        let n = noise(p[0]*ns, p[1]*ns);
        let a = TAU*n;
        newPts[i] = [p[0] + cos(a)*nStr, p[1] + sin(a)*nStr];
    }
    
    return newPts;
}