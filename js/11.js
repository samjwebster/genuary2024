let p;

let dirMod;
let lightMod;
let dirStrength;


// let capturer = new CCapture({ format: 'webm', framerate: 30 });

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    frameRate(30);

    p = getPalette();
    bg = lerpColor(random()>0.5?color(0):color(255), rc(), 0.2)
    background(bg);

    dirA = random()*TAU
    dirStrength = random(0.01, 0.02)*width;
    dirMod = createVector(cos(dirA), sin(dirA))
        .normalize()
        .mult(dirStrength);

    lightMod = dirMod.copy().rotate(PI);
    
    // SETUP
   
    let colorOptionRange = p.colors.length;

    let backBands = round(random(2, 10));
    let backShapes = [];
    if(random() < 0.5) {
        let backStep = (width/backBands);
        for(let i = 0; i < backBands; i++) {
            let x = lerp(0, width, (i/backBands));
            let idx = floor(random()*colorOptionRange);
            let c = p.getCol(idx);

            let pts = [
                [x, 0],
                [x+backStep, 0],
                [x+backStep, height],
                [x, height],
            ];

            backShapes.push(new Shape(pts, idx, c));
        }
    } else {
        let backStep = (height/backBands);
        for(let i = 0; i < backBands; i++) {
            let y = lerp(0, height, (i/backBands));
            let idx = floor(random()*colorOptionRange);
            let c = p.getCol(idx);

            let pts = [
                [0, y],
                [0, y+backStep],
                [width, y+backStep],
                [width, y],
            ];

            backShapes.push(new Shape(pts, idx, c));
        }
    }

    let hBands = round(random(5, 25));
    let hShapes = [];
    let hStep = height/(hBands*2);
    let hSize = hStep*random(0.5, 0.7);
    let flip = random([false, true]);
    for(let i = 0; i < hBands * 2; i++) {
        if(flip) {
            let y = lerp(0, height, (i/(hBands*2)));
            let idx = floor(random()*colorOptionRange);
            let c = p.getCol(idx);

            let pts = [
                [0, y],
                [0, y+hSize],
                [width, y+hSize],
                [width, y],
            ];

            hShapes.push(new Shape(pts, idx, c));
        }
        flip = !flip;
    }


    let vBands = round(random(5, 25));
    let vShapes = [];
    let vStep = width/(vBands*2);
    let vSize = vStep*random(0.5, 0.7);
    flip = random([false, true]);

    for(let i = 0; i < vBands * 2; i++) {
        if(flip) {
            let x = lerp(0, width, (i/(vBands*2)));
            let idx = floor(random()*colorOptionRange);
            let c = p.getCol(idx);

            let pts = [
                [x, 0],
                [x+vSize, 0],
                [x+vSize, height],
                [x, height],
            ];

            vShapes.push(new Shape(pts, idx, c));
        }
        flip = !flip;
    }

    let bandGroups = [];

    for(let i = 0; i < colorOptionRange; i++) {
        bandGroups.push([]);
        hShapes.forEach(s => {
            if(s.i == i) bandGroups[i].push(s);
        });
        vShapes.forEach(s => {
            if(s.i == i) bandGroups[i].push(s);
        });
    }

    // RENDER

    let darkAmt = random(0.75, 0.9);

    backShapes.forEach(b=>{b.renderDark(darkAmt); b.renderLight();});

    bandGroups = shuffleArray(bandGroups);
    bandGroups.forEach(g => {
        g.forEach(s => s.renderDark(darkAmt));
        g.forEach(s => s.renderLight());
    });


    // capturer.start();

    // draw();
    noLoop();
}

function draw() {
    
    granulate(8)
   
}

function cap() {
    capturer.capture(document.getElementById('defaultCanvas0'));
}

function check() {
    if(!complete && progress >= 100) {
        complete = true;
        completionTime = ms;
    }

    if(complete && (ms - completionTime >= 3000)) {
        if(!saved) {
            noLoop();
            console.log("done!");
            capturer.stop();
            capturer.save();
            console.log('capture complete!');
            saved = true;
        } else {
            noLoop();
        }
    }
}

function rc() {
    return p.getRandomCol();
}

class Shape {
    constructor(pts, i, c) {
        this.pts = pts;
        this.i = i;
        this.c = c;

        this.center = [0, 0];
        this.pts.forEach(p => {
            this.center[0] += p[0];
            this.center[1] += p[1];
        });
        this.center[0] = this.center[0]/this.pts.length;
        this.center[1] = this.center[1]/this.pts.length;
    }

    renderDark(amt) {
        let dc = lerpColor(this.c, color(0), amt);

        fill(dc);
        stroke(dc);

        beginShape();
        this.pts.forEach(p => {
            let offP = [p[0] + dirMod.x, p[1] + dirMod.y];
            let randP = lerpPos(this.center, offP, random(1, 1.25));
            vertex(...randP);
        });
        endShape(CLOSE);

    }

    renderLight() {
        fill(this.c);
        stroke(this.c);

        beginShape();
        this.pts.forEach(p => {
            let offP = [p[0] + lightMod.x, p[1] + lightMod.y];
            offP = p;
            let randP = lerpPos(this.center, offP, random(1, 1.25));
            vertex(...randP);
        });
        endShape(CLOSE);
    }
}