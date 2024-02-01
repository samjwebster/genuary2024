let p;
let bgc;
let bgt;

let gridRes;
let bg = [];
let mg = [];
let fg = [];

let darkCol;

// let capturer = new CCapture({ format: 'webm', framerate: 30 });
// let complete = false;
// let saved = false;

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    let pals = [
        {
            "main": [
                color("#DBC053"),
                color("#E45E38"),
                color("#1D3B77"),
            ],
            "dark": color("#191411"),
            "light": color("#DECDBF"),
        },
        {
            "main": [
                color("#FDA31A"),
                color("#BB0202"),
                color("#050E5A"),
            ],
            "dark": color("#020405"),
            "light": color("#F9E9DB"),
        },
        {
            "main": [
                color("#F77040"),        
                color("#3166D4"),
                color("#FDD9DA"),
            ],
            "dark": color("#11213C"),
            "light": color("#FFFFFF"),
        },
    ]

    p = random(pals);

    // let sortByValue = (a, b) => {return brightness(b) - brightness(a);}
    // cols = sort(p.colors, sortByValue);



    bgc = p.light;
    bgt = color(bgc.levels[0], bgc.levels[1], bgc.levels[2], 0);

    // frame(random(0.025, 0.1));

    darkCol = p.dark;

    gridRes = 10;

    for(let i = 0; i < gridRes; i++) {
        bg.push([]);
        mg.push([]);
        fg.push([]);
        for(let j = 0; j < gridRes; j++) {
            bg[i].push(new Cell(i, j));
            mg[i].push(new Cell(i, j));
            fg[i].push(new Cell(i, j));
        }
    }

    background(bgc)

    doBg();
    bg.forEach(r => r.forEach(c => c.render()));

    doMg();
    mg.forEach(r => r.forEach(c => c.render()));

    bg.forEach(r => r.forEach(c => {
        if(c.type == "block") {
            if(random() > 0.95) c.renderOutline();
        } else {
            if(random() > 0.75) c.renderOutline();
        }
    }));

    doFg();
    fg.forEach(r => r.forEach(c => c.render()));

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
}

function rc() {
    return random(p.main);
}

// function os(a,b) {
//     return [a[0] + b[0], a[1] + b[1]];
// }

// function thickLine(pts) {
//     for(let i = 0; i < pts.length; i++) {
//         let c = pts[i];
//         let n = pts[(i+1)%pts.length];
//         thickSegment(c, n);
//     }
// }

// function thickSegment(a, b) {
//     let div = 0.5;
//     let d = dist(...a, ...b);
//     let ct = ceil(d/div);
//     noStroke();
//     fill(bg);

//     for(let i = 0; i < ct; i++) {
//         let t = i/(ct-1);
//         let p = lerpPos(a, b, t);
//         let r = lerp(2, 20, noise(p[0]*0.025, p[1]*0.025));;

//         circle(...p, r);
//     }
// }

class Cell{
    constructor(i, j) {
        this.i = i;
        this.j = j;

        this.w = width/gridRes;
        this.x = this.i*this.w;
        this.y = this.j*this.w;

        this.col = rc();
        this.bgc = null;

        this.id = null;
        this.type = null;
    }

    render() {
        push();
        noStroke();
        if(this.type == "block") {
            fill(this.bgc);
            rect(this.x, this.y, this.w, this.w);
        } else if (this.type == "dot") {
            fill(this.bgc);
            circle(this.x + this.w/2, this.y + this.w/2, this.w/3);
        } else if (this.type == "stripe") {
            let sd = this.stripeData;
            let flipflop = true;
            let step = this.w/((2*sd.ct)-1);
            fill(sd.c);
            if(sd.dir == "h") {
                for(let i = 0; i < (2*sd.ct) - 1; i++) {
                    if(flipflop) {
                        rect(this.x + i*step, this.y, step, this.w);
                    }
                    flipflop = !flipflop;
                }
                if(sd.cap === 0) {
                    rect(this.x, this.y + this.w - step, this.w, step);
                    // push();
                    // fill('red');
                    // circle(this.x, this.y+this.w, 30);
                    // pop();
                } else if (sd.cap === 1) {
                    rect(this.x, this.y, this.w, step);
                    // push();
                    // fill('red');
                    // circle(this.x, this.y, 30);
                    // pop();
                }
            } else if (sd.dir == "v") {
                for(let i = 0; i < (2*sd.ct) - 1; i++) {
                    if(flipflop) {
                        rect(this.x, this.y + i*step,  this.w, step);
                    }
                    flipflop = !flipflop;
                }
                if(sd.cap === 0) {
                    rect(this.x + this.w - step, this.y, step, this.w);
                } else if (sd.cap === 1) {
                    rect(this.x, this.y, step, this.w);
                }
            } else {
                console.log('here')
            }
        }
        pop();
    }

    renderOutline() {
        push();
        if(this.type == "block") {
            noStroke();
            fill(random()<0.75?darkCol:bgc);
            rect(this.x, this.y, this.w, this.w);
            fill(this.bgc);
            let a = 0.15;
            rect(this.x+this.w*a, this.y+this.w*a, this.w*(1-2*a), this.w*(1-2*a));
        } else if (this.type == "dot") {
            strokeWeight(width*0.01);
            stroke(random()<0.75?darkCol:bgc);
            fill(this.bgc);
            circle(this.x + this.w/2, this.y + this.w/2, this.w/3);
        }
        pop();
    }
}

function doBg() {

    // let options = ["dot", "block"];

    let colorBlocks = floor(random(3, 8));

    for(let n = 0; n < colorBlocks; n++) {
        let c = rc();

        let ix = floor(random()*gridRes);
        let jx = floor(random()*gridRes);
        let w = ceil(random()*gridRes-1);
        let h = ceil(random()*gridRes-1);

        // console.log(w, h, i, j)

        for(let i = 0; i < gridRes; i++) {
            if(i >= ix && i < ix+w) {
                for(let j = 0; j < gridRes; j++) {
                    if(j >= jx && j < jx+h) {
                        bg[i][j].bgc = c;
                        bg[i][j].type = "block";
                    }
                }
            }
        }
    }


    let dotBlocks = floor(random(1, 8));
    for(let n = 0; n < dotBlocks; n++) {
        let c = rc();

        let ix = floor(random()*gridRes);
        let jx = floor(random()*gridRes);
        let w = ceil(random()*gridRes-1);
        let h = ceil(random()*gridRes-1);

        for(let i = 0; i < gridRes; i++) {
            if(i >= ix && i < ix+w) {
                for(let j = 0; j < gridRes; j++) {
                    if(j >= jx && j < jx+h) {
                        if(bg[i][j].type == null) {
                            bg[i][j].type = "dot";
                            bg[i][j].bgc = c;
                        }
                    }
                }
            }
        }
    }
}

function doMg() {

    let stripeCount = random(4, 10);
    for(let n = 0; n < stripeCount; n++) {
        let c = rc();
        let ct = random([2, 3, 4]);

        if(random() < 0.5) {
            let i = floor(random()*gridRes);
            if(random() < 0.5) {
                for(let j = 0; j < gridRes; j++) {
                    if(mg[i][j].type === "stripe") {
                        if(j > 0 && mg[i][j-1].stripeData && mg[i][j-1].stripeData.id == n) {
                            mg[i][j-1].stripeData.cap = 0;
                        }
                        continue;
                    }
                    mg[i][j].type = "stripe";
                    mg[i][j].stripeData = {
                        "dir": "h",
                        "c": c,
                        "ct": ct,
                        "cap": null,
                        "id": n,
                    }

                    if(random() > 0.9) {
                        mg[i][j].stripeData.cap = 0;
                        break;
                    }
                }
            } else {
                for(let j = gridRes-1; j >= 0; j--) {
                    if(mg[i][j].type == "stripe") { 
                        if(j < gridRes-1 && mg[i][j+1].stripeData && mg[i][j+1].stripeData.id == n) {
                            mg[i][j+1].stripeData.cap = 1;
                        }
                        continue;
                    }
                    mg[i][j].type = "stripe";
                    mg[i][j].stripeData = {
                        "dir": "h",
                        "c": c,
                        "ct": ct,
                        "cap": null,
                        "id": n,
                    }
                    if(random() > 0.9) {
                        mg[i][j].stripeData.cap = 1;
                        break;
                    }
                }
            }
        } else {
            let j = floor(random()*gridRes);
            if(random() < 0.5) {
                for(let i = 0; i < gridRes; i++) {
                    if(mg[i][j].type === "stripe") {
                        if(i > 0 && mg[i-1][j].stripeData && mg[i-1][j].stripeData.id == n) {
                            mg[i-1][j].stripeData.cap = 0;
                        }
                        continue;
                    }

                    mg[i][j].type = "stripe";
                    mg[i][j].stripeData = {
                        "dir": "v",
                        "c": c,
                        "ct": ct,
                        "cap": null,
                        "id": n,
                    }
                    if(random() > 0.9) {
                        mg[i][j].stripeData.cap = 0;
                        break;
                    }
                }
            } else {
                for(let i = gridRes-1; i >= 0; i--) {
                    if(mg[i][j].type == "stripe") { 
                        if(i < gridRes-1 && mg[i+1][j].stripeData && mg[i+1][j].stripeData.id == n) {
                            mg[i+1][j].stripeData.cap = 1;
                        }
                        continue;
                    }

                    mg[i][j].type = "stripe";
                    mg[i][j].stripeData = {
                        "dir": "v",
                        "c": c,
                        "ct": ct,
                        "cap": null,
                        "id": n,
                    }
                    if(random() > 0.9) {
                        mg[i][j].stripeData.cap = 1;
                        break;
                    }
                }
            }
        }
    }
}

function doFg() {
    let circCount = random(1, 10);

    let circs = [];

    let tryCap = 100;
    while(circs.length < circCount && tryCap > 0) {
        let i = floor(random()*gridRes);
        let j = floor(random()*gridRes);
        let r = floor(random(0.75)*gridRes);
        let good = true;

        for(let c = 0; c < circs.length; c++) {
            let ix = circs[c][0];
            let jx = circs[c][1];
            let rx = circs[c][2];

            if(ix == i || jx == j) {
                good = false;
            } else if (dist(i, j, ix, jx)<(r+rx)) {
                good = false;
            }
        }
        if(good) circs.push([i, j, r]);
        tryCap -= 1;
    }

    push();
    noStroke();
    circs.forEach(c => {
        let w = width/gridRes;
        let x = c[0]*w;
        let y = c[1]*w;
        let r = c[2]*w;

        let rings = floor(random(0, c[2]));

        let flip = true;
        for(let n = 0; n < 2*rings; n++) {
            let t = 1-(n/(2*rings));
            let rx = lerp(0, r, t);
            if(flip) fill(rc());
            else fill(random() > 0.2?bgc:darkCol);
            circle(x, y, rx);

            flip = !flip;
        }
    });
    pop();

    console.log(circs)



    return;
}