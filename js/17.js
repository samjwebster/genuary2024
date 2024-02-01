let p;
let bg;
let bgt;

// let capturer = new CCapture({ format: 'webm', framerate: 30 });
// let complete = false;
// let saved = false;

let hyp;

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    hyp = sqrt(width*width + height*height);

    p = getPalette();
    bg = lerpColor(random()>0.5?color(0):color(255), rc(), 0.35);
    background(bg);
    bgt = color(bg.levels[0], bg.levels[1], bg.levels[2], 0);



    let wedges = [];

    for(let i = 0; i < random(2, 10); i++) {
        let ct = round(random(2, 6));
        let aStart = -PI/2;
        let aEnd = aStart + (2*PI)/ct;
        let w = new Wedge(ct, aStart, aEnd, [width/2, height/2]);
        wedges.push(w);
    }

    let sortByOuterR = (a, b) => {
        return b.outerR - a.outerR;
    }
    wedges = sort(wedges, sortByOuterR);

    wedges.forEach(w => w.render());

    frame(random(0.025, 0.1));

    granulate(7);

    noLoop();
}

function frame(amt=0.1) {

    fill(rc());
    noStroke();

    rect(0,0,width, height*amt);
    rect(0,height*(1-amt),width, height*amt);
    rect(0,0,width*amt, height);
    rect((1-amt)*width,0,width*amt, height);
    
    thickLine([
        [width*amt, height*amt],
        [width*(1-amt), height*amt],
        [width*(1-amt), height*(1-amt)],
        [width*amt, height*(1-amt)],
    ]);
    
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


class Wedge {
    constructor(ct, aStart, aEnd, center, contour = true) {
        this.ct = ct;
        this.aStart = aStart;
        this.aEnd = aEnd;
        this.center = center;
        this.contour = true;

        this.div = width*random(0.02, 0.1);

        this.generate();
    }

    generate() {
        let outerOffs = [];
        let innerOffs = [];

        let outerR = random(0.1, 0.8)*(hyp/2);
        let innerR = random(0.2, 0.8)*outerR;
        let rDiff = outerR - innerR;

        let outerArc = (this.aEnd - this.aStart)*outerR;
        let innerArc = (this.aEnd - this.aStart)*innerR;

        let oc = floor(outerArc/this.div);
        let ic = floor(innerArc/this.div);

        let str = (outerR)/random(1, 3);
        let ns = random(0.001, 0.01) / (hyp/outerR);

        let outerFormation = random(["noise", "star", "reverse_star"]);
        let innerFormation = random(["noise", "star", "reverse_star"]);

        for(let i = 0; i < oc; i++) {
            let t = i/oc;
            let a = lerp(this.aStart, this.aEnd, t);
            if(outerFormation == "noise") {
                let start = [this.center[0] + cos(a)*outerR, this.center[1] + sin(a)*outerR];
                let nOff = str*lerp(-1, 1, noise(start[0]*ns, start[1]*ns));
                outerOffs.push(outerR+nOff);
            } else if (outerFormation == "star") {
                let st = spikeFunction(t);
                let sr = lerp(innerR, outerR, st);
                outerOffs.push(sr);
            } else if (outerFormation == "reverse_star") {
                let st = 1 - spikeFunction(t);
                let sr = lerp(innerR, outerR, st);
                outerOffs.push(sr);
            }
        }

        for(let i = 0; i < ic; i++) {
            let t = i/ic;
            let a = lerp(this.aStart, this.aEnd, t);
            if(innerFormation = "noise") {
                let start = [this.center[0] + cos(a)*innerR, this.center[1] + sin(a)*innerR];
                let nOff = str*lerp(-1, 1, noise(start[0]*ns, start[1]*ns));
                innerOffs.push(innerR+nOff);
            } else if (innerFormation == "star") {
                let st = spikeFunction(t);
                let sr = lerp(innerR-rDiff, innerR, st);
                outerOffs.push(sr);
            } else if (innerFormation = "reverse_star") {
                let st = 1 - spikeFunction(t);
                let sr = lerp(innerR-rDiff, innerR, st);
                outerOffs.push(sr);
            }
            
        }

        this.outerOffs = outerOffs;
        this.innerOffs = innerOffs;
        this.outerR = outerR;
    }

    render() {
        noStroke();
        fill(rc());
        beginShape();
        let shapePts = [];
        let c = this.center;
        for(let n = 0; n < this.ct; n++) {
            let aOff = n*((2*PI)/this.ct);
            let as = this.aStart + aOff;
            let ae = this.aEnd + aOff;
            for(let i = 0; i < this.outerOffs.length; i++) {
                let t = i/this.outerOffs.length;
                let a = lerp(as, ae, t);
                let p = [cos(a)*this.outerOffs[i], sin(a)*this.outerOffs[i]];
                let po = os(p, c);
                vertex(...po);
                shapePts.push(po);
            }
        }

        let contourPts = [];
        if(this.contour) {
            for(let n = 0; n < this.ct; n++) {
                let aOff = n*((2*PI)/this.ct);
                let as = this.aStart + aOff;
                let ae = this.aEnd + aOff;
                for(let i = 0; i < this.innerOffs.length; i++) {
                    let t = i/this.innerOffs.length;
                    let a = lerp(as, ae, t);
                    let p = [cos(a)*this.innerOffs[i], sin(a)*this.innerOffs[i]];
                    let po = os(p, c);
                    contourPts.push(po);
                }
            }
            contourPts = contourPts.reverse();
            if(contourPts.length > 0) {
                beginContour(); 
                contourPts.forEach(p => vertex(...p));
                endContour();

            }
           
        }
        

        endShape(CLOSE);

        thickLine(shapePts);
        if(this.contour) thickLine(contourPts);
    }
}

function os(a,b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function thickLine(pts) {
    for(let i = 0; i < pts.length; i++) {
        let c = pts[i];
        let n = pts[(i+1)%pts.length];
        thickSegment(c, n);
    }
}

function thickSegment(a, b) {
    let div = 0.5;
    let d = dist(...a, ...b);
    let ct = ceil(d/div);
    noStroke();
    fill(bg);

    for(let i = 0; i < ct; i++) {
        let t = i/(ct-1);
        let p = lerpPos(a, b, t);
        let r = lerp(2, 20, noise(p[0]*0.025, p[1]*0.025));;
        // if(random() > 0.90) {
        //     r = 
        // } 
        circle(...p, r);
    }
}

// function spikeFunction(t) {
//     if(t < 0 || t > 1) return 0;

//     if(t < 0.5) {
//         return 2*t;
//     } else if (t == 0.5) {
//         return 1;
//     } else if (t > 0.5) {
//         return 2 + -2*t;
//     }
//     return 0;
// }

function spikeFunction(t) {
    if(t < 0 || t > 1) return 0;

    if(t < 0.5) {
        return 4*(t**2);
    } else if (t == 0.5) {
        return 1;
    } else if (t > 0.5) {
        return 4*((t-1)**2);
    }
    return 0;
}