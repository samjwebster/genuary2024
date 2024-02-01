let p;
// let walkers = [];
// let idCounter = 0;

let sectionSize;

let c;

// let capturer = new CCapture({ format: 'webm', framerate: 30 });

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);
    frameRate(30);

    p = getPalette();
    bg = lerpColor(random()>0.5?color(0):color(255), rc(), 0.2)
    background(bg);

    sectionSize = (width*0.05);

    c = new Crank();

    // walkers.push(new Walker([width/2, height/2], rc(), newId()));
    // let walkerCount = 10;
    // for(let i = 0; i < walkerCount; i++) {
    //     walkers.push(new Walker(
    //         [random()*width, random()*height], rc(), newId(), 0
    //     ));
    // }


    // capturer.start();

    // draw();
    noLoop();
}

function draw() {

    let ms = millis();

    // walkers.forEach(w => w.step());
    c.render();

    border(width*0.02, rc());

    granulate(8);
    // capturer.capture(document.getElementById('defaultCanvas0'));
    // if(!complete && progress >= 100) {
    //     complete = true;
    //     completionTime = ms;
    // }

    // if(complete && (ms - completionTime >= 3000)) {
    //     if(!saved) {
    //         noLoop();
    //         console.log("done!");
    //         capturer.stop();
    //         capturer.save();
    //         console.log('capture complete!');
    //         saved = true;
    //     } else {
    //         noLoop();
    //     }
    // }
}

function border(size, col) {
    let m = new Mask([size, size], "rect", {"w": width-2*size, "h": height-2*size});
    let s = new Sheet(col, [m]);
    s.render();
}

function rc() {
    return p.getRandomCol();
}

function rcp() {
    let pc = shuffleArray(p.colors);
    return [pc[0], pc[1]];
}

function rcDiff(col) {
    let c = rc();
    while(c == col) c = rc();
    return c;
}

// function newId() {
//     idCounter += 1;
//     return (idCounter-1);
// }

// class Walker {
//     constructor(startPos, col, id, depth) {
//         // this.startPos = startPos;
//         this.path = [startPos];
//         this.speed = 1;
//         this.col = col;
//         this.id = id;
//         this.depth = depth;
//     }

//     step() {
//         this.walk();
//         this.render();
//         if(random() > 0.9 && this.depth < 2) this.split();
//     }

//     walk() {
//         let pos = this.path[this.path.length-1];

//         let a = TAU*noise(pos[0]*0.01, pos[1]*0.01, this.id);
//         let vec = createVector(cos(a), sin(a)).normalize().mult(this.speed);

//         let newPos = [pos[0]+vec.x, pos[1]+vec.y];
//         this.path.push(newPos);
//         return;
//     }

//     render() {
//         if(this.path.length <= 1) return;
//         let a = this.path[this.path.length-2];
//         let b = this.path[this.path.length-1];
//         stroke(this.col);
//         line(...a, ...b);
//         return;
//     }

//     split() {
//         let count = 2;
//         for(let i = 0; i < count; i++) {
//             walkers.push(new Walker(
//                 this.path[this.path.length-1], this.col, newId(), this.depth+1
//             ));
//         }
//         walkers.splice(walkers.indexOf(this), 1);
//     }
// }

class Crank {
    constructor() {
        let edge = random([0, 1, 2, 3]);
        let start;
        if(edge == 0) start = [random()*width, 0];
        if(edge == 1) start = [random()*width, height];
        if(edge == 2) start = [0, random()*height];
        if(edge == 3) start = [width, random()*height];
        
        let startA = random()*TAU;;
        let endA = startA+random()*TAU;
        let cols = rcp();

        let startSection = new CrankSection(
            start,
            random(width*0.1, width*0.5),
            startA,
            endA,
            ...cols,
        );


        while(startSection.endsOnCanvas() == false) {
            let startA = random()*TAU;
            let endA = startA+random()*TAU
            startSection = new CrankSection(
                start,
                random(width*0.1, width*0.5),
                startA,
                endA,
                ...cols,
            );
        }

        this.sections = [startSection];

        let flip = false;
        let genCount = 50;
        for(let i = 0; i < genCount; i++) {
            let last = this.sections[this.sections.length-1];



            console.log(last)

            let r = random(0.75, 1.25)*last.r;

            let start_a = (last.end_a+PI);
            let end_a = start_a + random(0.5, 1)*2*(flip?PI:-PI);
            let end_col = rcDiff(last.end_col);

            let section = new CrankSection(
                last.extensions[last.sectionCount-1],
                r,
                start_a,
                end_a,
                last.end_col,
                end_col,
            );

            let tries = 10;
            while(section.endsOnCanvas() == false && tries > 0) {
                r = random(0.75, 1.25)*last.r;
                end_a = start_a + random(0.5, 1)*1.5*(flip?PI:-PI);
                section = new CrankSection(
                    last.extensions[last.sectionCount-1],
                    r,
                    start_a,
                    end_a,
                    last.end_col,
                    end_col
                );
                tries -= 1
            }

            this.sections.push(section);

            flip = !flip;
        }
    }

    render() {
        push();
        noStroke();
        this.sections.forEach(s => {
            for(let i = 0; i < s.sectionCount-1; i++) {
                let t = i/(s.sectionCount-1);
                let c = lerpColor(s.start_col, s.end_col, t);
                
                fill(c);
                stroke(c);
                beginShape();
                vertex(...s.p);
                vertex(...s.extensions[i]);
                vertex(...s.extensions[i+1]);
                endShape(CLOSE);
            }
        });
        pop();
    }
}

class CrankSection {
    constructor(p, r, start_a, end_a, start_col, end_col) {


        this.p = p;
        this.r = r;
        this.start_a = start_a;
        this.end_a = end_a;

        this.start_col = start_col;
        this.end_col = end_col;

        this.sectionCount = floor((abs(end_a-start_a)*r)/sectionSize);

        this.extensions = [];
        for(let i = 0; i < this.sectionCount; i++) {
            let t = i/(this.sectionCount-1);
            let a = lerp(start_a, end_a, t);
            let vec = createVector(cos(a), sin(a)).normalize().mult(r);
            this.extensions.push([p[0]+vec.x, p[1]+vec.y]);
        }
    }

    endsOnCanvas() {
        let final = this.extensions[this.sectionCount-1];
        if(final[0] < 0 || final[0] > width) return false;
        if(final[1] < 0 || final[1] > height) return false;
        return true;
    }
}