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
    dirStrength = random(0.01, 0.025)*width;
    dirMod = createVector(cos(dirA), sin(dirA))
        .normalize()
        .mult(dirStrength);

    lightMod = dirMod.copy().rotate(PI);
    
   

    // capturer.start();



    setupHex();

    // draw();
    noLoop();
}

function draw() {
    
    granulate(8)
   
}

function setupHex() {
    let gridRes = 10;
    let xRange = [width*0.1, width*0.9];
    let yRange = [height*0.15, height*0.85];

    let stepX = (xRange[1]-xRange[0])/gridRes;
    let stepY = (yRange[1]-yRange[0])/gridRes;
   
    let centers = [];

    for(let i = 0; i < gridRes; i++) {
        centers.push([])
        let ti = i/gridRes;
        let x = lerp(...xRange, ti) + stepX/2;
        for(let j = 0; j < gridRes; j++) {
            let tj = j/gridRes;
            let y = lerp(...yRange, tj) + stepY/2;
            // circle(x, y, 5);
            centers[i].push([x, y]);
        }
    }

    let flip = false;

    let size = stepX/1.75;

    let hexagons = [];

    for(let i = 0; i < centers.length; i++) {
        let xOff = flip?(0.25*stepX):(-0.25*stepX);
        for(let j = 0; j < centers[i].length; j++) {
            let newCenter = [
                centers[j][i][0] + xOff,
                centers[j][i][1],
            ];
            centers[j][i] = newCenter;

            let pts = [];

            for(let i = 0; i < 6; i++) {
                let angle_deg = 60*i-30;
                let angle_rad = PI/180*angle_deg;
                let vert = [
                    newCenter[0]+(size)*cos(angle_rad),
                    newCenter[1]+(size)*sin(angle_rad),
                ];
                pts.push(vert);
            }

            hexagons.push(new Hexagon(newCenter, size, pts, rc()));
        }
        flip = !flip;
    }

    strokeWeight(2);

    hexagons = shuffleArray(hexagons);

    let darkAmt = random(0.75, 0.95);


    hexagons.forEach(h => {
        h.renderDark(darkAmt)
        h.renderLight();
    });

    // let size = stepX/4;

    // centers.forEach(r => {
    //     r.forEach(c => {
    //         let x = c[0];
    //         let y = c[1];
    //         beginShape();
    //         for(let i = 0; i < 6; i++) {
    //             let angle_deg = 60*i;
    //             let angle_rad = PI/180*angle_deg;
    //             let vert = [
    //                 x+size*cos(angle_rad),
    //                 x+size*sin(angle_rad),
    //             ];
    //             vertex(...vert);
    //         }
    //         endShape(CLOSE);
    //     });
    // });


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

class Hexagon {
    constructor(center, size, pts, c) {
        this.center = center;
        this.size = size;
        this.pts = pts;
        this.c = c;
    }

    // render() {
    //     fill(this.c);
    //     stroke(lerpColor(this.c, color(0), 0.2));

    //     beginShape();
    //     this.pts.forEach(p => vertex(...p));
    //     endShape(CLOSE);
    // }


    renderDark(amt) {
        let dc = lerpColor(this.c, color(0), amt);

        console.log(dc);


        fill(dc);
        stroke(dc);


        beginShape();
        this.pts.forEach(p => {
            let offP = [p[0] + dirMod.x, p[1] + dirMod.y];
            let randP = lerpPos(this.center, offP, random(1, 1.15));
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
            let randP = lerpPos(this.center, offP, random(1, 1.25));
            vertex(...randP);
        });
        endShape(CLOSE);
    }
}