let p;
let bg;
let bgt;

let capturer = new CCapture({ format: 'webm', framerate: 30 });
let complete = false;
let saved = false;
let ms;

let ns = 0.0025;
let aOffset;
let offAmts;

let tenk = 10000;
let lines = [];

let counter = 0;

let minA;
let maxA;


function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);


    aOffset = random()*TAU;

    let shadowDir = random()*TAU;
    let shadowOff = 0.005*width;

    offAmts = [cos(shadowDir)*shadowOff, sin(shadowDir)*shadowOff];

    // frameRate(60);

    p = getPalette();
    bg = lerpColor(random()>0.5?color(0):color(255), rc(), 0.2)
    background(bg);
    bgt = color(bg.levels[0], bg.levels[1], bg.levels[2], 0);



    let sortByBrightness = (c1, c2) => {
        return brightness(c2) - brightness(c1);
    }

    sortedCols = sort(p.colors, sortByBrightness);
    if(random()>0.5) sortedCols = sortedCols.reverse();

    setupLines(tenk);


    // capturer.start();
    // draw();
    // noLoop();
}

function draw() {

    for(let i = 0; i < 10000; i++) {
        currLine = lines[counter];
        let start = currLine[0];
        let end = currLine[1];
        let a = currLine[2];
        let lineLength = currLine[3];

        let at = map(a, minA, maxA, 0, 1);
        if(at >= 1) at = 0.999;
        if(at < 0) at = 0;
        let ci = floor(p.colors.length*at);
        let c = p.getCol(ci);

        strokeWeight(lineLength/(random(3, 9)));
        strokeCap(ROUND);

        // Shadow
        stroke(lerpColor(c, color(0, 0.66*255), 0.75));

        // drawingContext.filter = "blur(8px)";
        line(...offset(start, offAmts), ...offset(end, offAmts));
        // drawingContext.filter = "blur(0px)";

        stroke(wobbleCol(c, 0.05));
        line(...start, ...end);

        counter += 1;

        if(counter >= tenk) {
            noLoop();
            granulateColor(8);
            break;
        }
    }

    
   
}

function setupLines(amt) {
    minA = Infinity;
    maxA = -Infinity;

    for(let i = 0; i < amt; i++) {
        let t = i/amt;

        let lineLength = lerp(0.01, 0.2, 1-t)*min(width, height);

        let x = random(-0.1, 1.1)*width;
        let y = random(-0.1, 1.1)*height;

        let n = noise(x*ns, y*ns);
        let a = (n*TAU + aOffset)%TAU;

        let start = [x,y];
        let end = [x + cos(a)*lineLength, y + sin(a)*lineLength];

        // let at = a/TAU;
        // let ci = floor(p.colors.length*at);
        // let c = p.getCol(ci);

        lines.push([start, end, a, lineLength]);

        if(a < minA) minA = a;
        if(a > maxA) maxA = a;
    }
}

function displayCount(reverse=false) {
    push();
    blendMode(DIFFERENCE)
    stroke(255);
    strokeWeight(3)
    textSize(width*0.025);
    if(reverse) {
        text(tenk-counter, width*0.025, height*0.05);
    } else {
        text(counter, width*0.025, height*0.05);
    }
    pop();
}

function offset(p1, p2) {
    return [p1[0] + p2[0], p1[1]+p2[1]];
}

function cap() {
    capturer.capture(document.getElementById('defaultCanvas0'));
}

function check() {
    if(!complete && ms >= tenk) {
        complete = true;
        completionTime = ms;
    }

    if(complete && (ms - completionTime >= 0)) {
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

    // console.log(ms)
}

function rc() {
    return p.getRandomCol();
}