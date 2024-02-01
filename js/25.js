let p;
let bg;
let outerCol;
let innterCol;

let beige;

function setup() {

    createCanvas(1000,1000);
    // image(im, 0, 0, width, height);

    p = getPalette();
    pc = p.size;

    beige = color("#F5F5DC");

    let cols = shuffleArray(p.colors);

    cols.forEach(c => c = lerpColor(c, beige, 0.25));

    bg = cols[0];
    outerCol = cols[1];
    innerCol = cols[2];

    noLoop();
}

function rc() {
    return p.getRandomCol();
}

function draw() {
    noStroke();

    background(beige);

    let amt = 0.05;
    let corners = [
        [width*amt, height*amt],
        [width*(1-amt), height*amt],
        [width*(1-amt), height*(1-amt)],
        [width*amt, height*(1-amt)],
    ]

    fill(lerpColor(bg, color(0, 0.90), 0.75));
    drawingContext.filter = "blur("+ceil(width*0.015)+"px)";
    beginShape();
    corners.forEach(p => vertex(...p));
    endShape(CLOSE);
    drawingContext.filter = "blur("+ceil(width*0.025)+"px)";
    beginShape();
    corners.forEach(p => vertex(...p));
    endShape(CLOSE);

    drawingContext.filter = "blur(0px)";

    fill(bg);
    beginShape();
    corners.forEach(p => vertex(...p));
    endShape(CLOSE);

    

    let shapePts = [];
    let innerPts = [];

    let shapeNs = 0.00075;
    let shapeNstr = width*0.25;

    let shapeNsInner = (0.00075)*1.1;
    let shapeNstrInner = (width*0.25)*0.5;

    let r = width/4;
    let rInner = width/6;

    let c = [width/2, height/2];
    let ct = 300;
    let aOff = random()*TAU;

    let mid = [0,0];
    let midInner = [0,0];

    for(let i = 0; i < ct; i++) {
        let t = i/ct;
        let a = t*TAU;
        a += aOff;

        let curr = [
            c[0] + cos(a)*r,
            c[1] + sin(a)*r,
        ];

        let nv = noise(curr[0]*shapeNs, curr[1]*shapeNs);
        let na = (nv * TAU);
        na += aOff
        let nOff = [
            shapeNstr*cos(na),
            shapeNstr*sin(na),
        ];
        shapePts.push([
            curr[0]+nOff[0],
            curr[1]+nOff[1],
        ]);
        mid[0] += shapePts[i][0];
        mid[1] += shapePts[i][1];


        let currInner = [
            c[0] + cos(a)*rInner,
            c[1] + sin(a)*rInner,
        ];

        let nvInner = noise(currInner[0]*shapeNsInner, currInner[1]*shapeNsInner);
        let naInner = (nvInner * TAU);
        naInner += aOff
        let nOffInner = [
            shapeNstrInner*cos(naInner),
            shapeNstrInner*sin(naInner),
        ];
        innerPts.push([
            currInner[0]+nOffInner[0],
            currInner[1]+nOffInner[1],
        ]);
        midInner[0] += innerPts[i][0];
        midInner[1] += innerPts[i][1];
    }

    mid = [mid[0]/shapePts.length, mid[1]/shapePts.length];
    let cDiff = [c[0]-mid[0], c[1]-mid[1]];
    
    shapePts.forEach(p => {
        p[0] += cDiff[0];
        p[1] += cDiff[1];
    });

    midInner = [
        midInner[0]/innerPts.length, midInner[1]/shapePts.length
    ];
    cDiff = [c[0]-midInner[0], c[1]-midInner[1]];
    innerPts.forEach(p => {
        p[0] += cDiff[0];
        p[1] += cDiff[1];
    });

    // Draw Inner shape
    fill(innerCol);
    beginShape();
    innerPts.forEach(p => vertex(...p));
    endShape(CLOSE);

    innerPts.reverse()

    // Draw Shadow
    let shadow = lerpColor(outerCol, color(0, 0.90), 0.75)
    fill(shadow)
    drawingContext.filter = "blur("+ceil(width*0.015)+"px)";
    beginShape();
    shapePts.forEach(p => vertex(...p));
    beginContour();
    innerPts.forEach(p => vertex(...p));
    endContour();
    endShape(CLOSE);

    drawingContext.filter = "blur("+ceil(width*0.025)+"px)";
    beginShape();
    shapePts.forEach(p => vertex(...p));
    beginContour();
    innerPts.forEach(p => vertex(...p));
    endContour();
    endShape(CLOSE);

    drawingContext.filter = "blur(0px)";

    

    // draw Outer shape
    fill(outerCol);
    beginShape();
    shapePts.forEach(p => vertex(...p));
    beginContour();
    innerPts.forEach(p => vertex(...p));
    endContour(CLOSE);
    endShape(CLOSE);

    granulate(6);
    
}