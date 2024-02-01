let p;
let bg;
let bgt;

let blobGroups = [];
let shapes = [];

// let capturer = new CCapture({ format: 'webm', framerate: 30 });
let complete = false;
let saved = false;
let ms;

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    frameRate(30);

    p = getPalette();
    bg = lerpColor(random()>0.5?color(0):color(255), rc(), 0.2)
    background(bg);

    bgt = color(bg.levels[0], bg.levels[1], bg.levels[2], 0);

    let colorRange = p.colors.length;

    let blobsTemp = [];
    let blobCount = 30;
    for(let i = 0; i < blobCount; i++) {
        let ra = random()*TAU;
        let speed = random(0.5, 5);
        let idx = floor(random()*colorRange);
        blobsTemp.push(new Blob(
            random()*width, 
            random()*height,
            random(0.1, 1)*(width*0.08),
            createVector(cos(ra), sin(ra)).normalize().mult(speed),
            idx,
            p.getCol(idx),
        ));
    }

    for(let i = 0; i < colorRange; i++) {
        blobGroups.push([]);
        blobsTemp.forEach(b => {
            if(b.i == i) blobGroups[i].push(b);
        });
        shapes.push(random([0, 1]));
    }

    let lengthCompare = (a, b) => b.length - a.length;

    blobGroups = blobGroups.sort(lengthCompare);



    // capturer.start();

    // draw();
}

// let frameCap = 500;
function draw() {
    ms = millis();

    background(bg);

    // blobGroups.forEach(g => g.forEach(b => b.update()));

    // granulateColor(5)

    let sampleSize = 75;

    // stroke(bgt);
    noStroke();
    rectMode(CENTER);

    let threshold = 0.35;
    for(let i = 0; i < sampleSize; i++) {
        let x = lerp(0, width, i/(sampleSize-1));
        for(let j = 0; j < sampleSize; j++) {
            let y = lerp(0, height, j/(sampleSize-1));


            for(let idx = 0; idx < blobGroups.length; idx++) {
                let g = blobGroups[idx];
                if(g.length > 0) {
                    let c = g[0].c;
                    fill(c);

                    let score = 0;

                    g.forEach(b => {
                        score += b.score(x, y, 0.5);
                    });

                    if(score > threshold) {
                        if(shapes[idx] == 0) {
                            // strokeWeight(2);
                            circle(x, y, width/sampleSize)
                        } else if (shapes[idx] == 1) {
                            // noStroke();
                            rect(x, y, width/sampleSize*0.9, width/sampleSize*0.9);
                        }
                    }
                }
            }
        }
    }

    blobGroups.forEach(g => g.forEach(b => b.update()));

    rectMode(CORNER);
    fill(bg);
    noStroke();


    rect(0,0,width,2*(height/sampleSize));
    rect(0,height - (2*(height/sampleSize)),width,2*(height/sampleSize));
    rect(0,0, 2*(width/sampleSize), height);
    rect(width - 2*(width/sampleSize), 0, 2*(width/sampleSize), height);

    // granulateColor(5);

    // noLoop();
    // cap();
    // check();
}

function cap() {
    capturer.capture(document.getElementById('defaultCanvas0'));
}

function check() {
    if(!complete && ms >= 10000) {
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

class Blob {
    constructor(x, y, r, v, i, c) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.v = v;
        this.i = i;
        this.c = c;
    }

    update() {
        this.x += this.v.x;
        if(this.x > width) {
            this.x = width;
            this.v.x = -1*this.v.x;
        }
        if(this.x < 0) {
            this.x = 0;
            this.v.x = -1*this.v.x;
        }

        this.y += this.v.y;
        if(this.y > height) {
            this.y = height;
            this.v.y = -1*this.v.y;
        }
        if(this.y < 0) {
            this.y = 0;
            this.v.y = -1*this.v.y;
        }
    }

    render() {
        push();
        noStroke();
        fill(this.c);
        circle(this.x, this.y, this.r);
        pop();
    }

    score(x, y, mod) {
        let dx = x - this.x;
        let dy = y - this.y;
        let d = sqrt((dx*dx)+(dy*dy));
        return mod*this.r/d;
    }
}