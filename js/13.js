let p;
let bg;
let bgt;

// let capturer = new CCapture({ format: 'webm', framerate: 30 });
// let complete = false;
// let saved = false;
// let ms;

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    // frameRate(30);

    p = getPalette();
    bg = lerpColor(random()>0.5?color(0):color(255), rc(), 0.2)
    background(bg);

    bgt = color(bg.levels[0], bg.levels[1], bg.levels[2], 0);

    // capturer.start();
    // draw();
    noLoop();
}

function draw() {
    background(bg);
    let wob = new Wobbly();
    noFill();

    for(let i = width; i >= 1; i -= (width/25)) {
        strokeWeight(i);
        stroke(rc());
        

        beginShape();
        wob.pts.forEach(p => curveVertex(p[0], p[1]+(height/2)));

        endShape();
    }
    border(width*0.05, rc());

    granulateColor(10);
   
}

function cap() {
    capturer.capture(document.getElementById('defaultCanvas0'));
}

function border(size, col) {
    let m = new Mask([size, size], "rect", {"w": width-2*size, "h": height-2*size});
    let s = new Sheet(col, [m]);
    s.render();
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

class Wobbly {
    constructor() {
        this.parts = [];

        for(let i = 0; i < ceil(random()*5); i++) {
            let part = {
                "type": random(["sin", "cos"]),
                "mult_or_div": random(["mult", "div"]),
                "factor": random(1)*(width*0.25),
                "offset": random(-1, 1)*(width*0.2),
                "sq": random([1, 1, 1, 2, 2, 3]),
            }
            this.parts.push(part);
        }

        let res = width;
        this.pts = [];
        for(let i = 0; i < res; i++) {
            this.pts.push([i, this.get(i)]);
        }
    }

    get(x) {
        let val = 0;

        x = x / 25;

        let t = 10*noise(x*0.1);

        for(let i = 0; i < this.parts.length; i++) {
            let part = this.parts[i];
            let curr;
            if(part.type == "sin") {
                curr = sin(x+part.offset + t);
            } else if (part.type == "cos") {
                curr = cos(x+part.offset + t);
            }

            if(part.mult_or_div == "mult") {
                curr = curr*part.factor;
            } else if (part.mult_or_div == "div") {
                curr = curr/part.factor;
            }

            // if(part.sq != 1) {
            //     curr = curr**part.sq;
            // }
            val += curr;
        }

        return val;
    }
}