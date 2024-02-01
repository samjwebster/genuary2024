let p;
let bg;

let lightCol;
let darkCol;

function setup() {
    createCanvas(1000, 1000);
    p = getPalette();
    if(random()>0.70) p.makeMonochromatic(true, p.getRandomIndex(), 0.25);
    p.shuffle();

    let cols = [...p.colors];
    let sortByBright = (a, b) => {
        return brightness(a) - brightness(b);
    }
    cols.sort(sortByBright)

    darkCol = cols[0];
    lightCol = cols[cols.length-1];

    darkCol = lerpColor(darkCol, color(0), 0.50);
    lightCol = lerpColor(lightCol, color(255), 0.50);

    noLoop();
}

function draw() {
    background(lerpColor(darkCol, color(0), 0.25));

    let threadCols = [];
    for(let i = 1; i < p.size; i++) {
        threadCols.push(p.get(i));
    }

    let threadCount = round(random(20, 40));
    wavelength = width/(threadCount-1);

    let threads = [];
    let vCol = threadCols[0];
    let hCol = threadCols[1];
    let thickness = width/threadCount;
    let thicknessMod = random(0.20, 0.75);
    thickness *= thicknessMod;

    let flip = random([true, false])

    let perfect = random()>0.80

    for(let i = 0; i < threadCount; i++) {
        let t = i/(threadCount-1);
        let cx = t*width;
        let cy = t*height;

        let hcStart = random()<0.75 ? hCol : random(threadCols);
        let hcEnd;
        if(hcStart == hCol) {
            hcEnd = random()<0.75 ? hCol : random(threadCols);
        } else {
            hcEnd = random()<0.10 ? hCol : random(threadCols);
        }

        let vcStart = random()<0.75 ? vCol : random(threadCols);
        let vcEnd;
        if(vcStart == vCol) {
            vcEnd = random()<0.75 ? vCol : random(threadCols);
        } else {
            vcEnd = random()<0.10 ? vCol : random(threadCols);
        }


        let hPoints = [
            [cx, 0],        // Start
            [cx, height],   // End
        ];

        if (!perfect && random() > 0.75) {
            let idx = random()>0.5 ? 0 : 1;
            hPoints[idx][0] += (random()>0.5?-1:1)*(random(0.5, 0.9))*((height/threadCount)*0.5);
        }

        let vPoints = [
            [0, cy],        // Start
            [width, cy],   // End
        ];

        if (!perfect && random() > 0.75) {
            let idx = random()>0.5 ? 0 : 1;
            vPoints[idx][0] += (random()>0.5?-1:1)*(random(0.5, 0.9))*((width/threadCount)*0.5);
        }

        // Horizontal Thread
        threads.push(new Thread(
            ...hPoints,
            hcStart,        // Start Color
            hcEnd,          // End Color
            thickness,      // Thickness
            flip            // Flip
        ));

        // Vertical Thread
        threads.push(new Thread(
            ...vPoints,
            vcStart,        // Start Color
            vcEnd,          // End Color
            thickness,      // Thickness
            !flip           // Flip
        ));
    }

    renderThreads(threads);
    
    granulate(8);
}

function sortByDepth(a, b) {
    return a[2] - b[2];
}

// function drawCheckerboard() {
//     let res = 200;
//     let step = width/res;
//     let flipflop = true;

//     for(let i = 0; i < res; i++) {
//         for(let j = 0; j < res; j++) {
//             let x = i*step;
//             let y = j*step;

//             let d = gd(x, y);

//             d = (d + 1)/2;
//             let c = d*255;
//             fill(c);
//             stroke(c);

//             rect(x, y, step, step);

//             flipflop = !flipflop;
//         }
//     }
// }

function renderThreads(threads) {
    let allPtsWCols = [];
    let allLinesWCols = [];

    let allThings = [];
    threads.forEach(t => {
        t.pts.forEach(p => {
            allThings.push(p);
        });
        t.lines.forEach(l => {
            allThings.push(l);
        });
    });

    // allPtsWCols.sort(sortByDepth);
    // allLinesWCols.sort(sortByDepth);


    // let allThings = [
    //     ...allPtsWCols,
    //     ...allLinesWCols,
    // ];

    allThings.sort(sortByDepth);

    allThings.forEach(thing => {
        let a, b, c, d;
        if(thing.length == 4) {
            a = [
                thing[0], thing[1],
            ];
            d = thing[2];
            c = thing[3];
        } else if (thing.length == 6) {
            a = [
                thing[0], thing[1],
            ];
            d = thing[2];
            b = [
                thing[3], thing[4],
            ]
            c = thing[5];
        }

        if(d > 0) {
            c = lerpColor(c, lightCol, (d*0.5));
        } else if(d < 0) {
            c = lerpColor(c, darkCol, ((-1*d)*0.5));
        }
        c = jc(c);

        if(thing.length == 4) {
            noStroke();
            fill(c);
            circle(a[0], a[1], random(width*0.0025, width*0.009));
        } else if (thing.length == 6) {
            noFill();
            stroke(c);
            strokeWeight(2);
            line(...a, ...b);
        }
    });
}

class Thread {
    constructor(start, end, colStart, colEnd, thickness, aFlip) {
        this.start = start;
        this.end = end;
        this.col = colStart;
        this.colStart = colStart;
        this.colEnd = colEnd;

        this.thickness = thickness;

        this.aFlip = aFlip;

        this.generate();
    }

    generate() {
        this.pts = [];
        this.lines = [];
        let wCt = ceil(this.thickness/1.5);

        let dirVec = p5.Vector.sub(createVector(...this.start), createVector(...this.end)).normalize();

        let leftDir = dirVec.copy().rotate(-1*PI/2);
        let rightDir = dirVec.copy().rotate(PI/2);

        let left = leftDir.copy().mult(this.thickness/2);
        let right = rightDir.copy().mult(this.thickness/2);

        let xRange = [min(left.x, right.x), max(left.x, right.x)];
        let yRange = [min(left.y, right.y), max(left.y, right.y)];

        for(let i = 0; i < 2; i++) {
            let t = round(xRange[i], 3);
            if(!t) {
                xRange[i] = round(xRange[i]);
            } else {
                xRange[i] = t;
            }
        }

        for(let i = 0; i < 2; i++) {
            let t = round(yRange[i], 3);
            if(!t) {
                yRange[i] = round(yRange[i]);
            } else {
                yRange[i] = t;
            }
        }

        let d = dist(...this.start, ...this.end);
        let ct = d;
        for(let i = 0; i < ct; i++) {
            let t = i/(ct-1);

            let currCol = lerpColor(this.colStart, this.colEnd, t);

            let p = lerpPos(this.start, this.end, t);

            let depth = gd(...p);
            if(this.aFlip) depth *= -1;

            this.lines.push([
                p[0] + xRange[0],
                p[1] + yRange[0],
                depth-1,
                p[0] + xRange[1],
                p[1] + yRange[1],
                currCol,
            ]);
            
            for(let j = 0; j < wCt; j++) {

                let norms = [
                    random(-1, 1),
                    random(-1, 1),
                ];

                let asVec = createVector(...norms);

                let dirDistL = asVec.dist(leftDir);
                let dirDistR = asVec.dist(rightDir);

                let edgeNearness = 1-max(dirDistL, dirDistR);

                let xOff = norms[0]*(this.thickness/2);
                let yOff = norms[1]*(this.thickness/2);


                this.pts.push([
                    p[0]+xOff, p[1]+yOff, 
                    depth+edgeNearness,
                    currCol,
                ]);
            }
        }
    }

    // render() {
    //     push();
    //     this.pts.sort(sortByDepth);
    //     noStroke();
    //     this.pts.forEach(p => {
    //         let cc;
    //         if(p[2] > 0) {
    //             cc = lerpColor(this.col, color(255), 
    //                 (p[2]*0.15)
    //             );
    //         } else if(p[2] < 0) {
    //             cc = lerpColor(this.col, color(0), 
    //                 ((-1*p[2])*0.15)
    //             );
    //         } else {
    //             cc = this.col;
    //         }


    //         fill(jc(cc));
    //         circle(p[0], p[1], random(0.5, 2));
    //     });
    //     pop();
    // }
}

function jc(c, t  = 0.025) {
    let ls = c.levels;
    return color(
        ls[0] + random(-t, t)*255,
        ls[1] + random(-t, t)*255,
        ls[2] + random(-t, t)*255,
        ls[3]
    );
}


let wavelength;
let done = false;
function gd(x, y) {

    x = PI*(x/wavelength)-(PI/2);
    y = PI*(y/wavelength);
   
    return sin(x)*cos(y)
}