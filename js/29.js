let p;
let bg;
let shapeCol;

let sdfs = [];

let anchors = [];
let cells = [];

let isovalue = 0;

let capturer = new CCapture({ format: 'webm', framerate: 30 });
let complete = false;
let saved = false;
let ms;

function setup() {
    createCanvas(500,500);
    frameRate(30);
    
    p = getPalette();
    p.shuffle();

    bg = p.get(0);
    p.colors.splice(0, 1);

    shapeCol = p.get(1);

    for(let i = 0; i < random(3, 10); i++) {   
        sdfs.push(new SDF_Circle(
            random()*width,
            random()*height,
            random(width/20, width/8),
            createVector(random(-3, 3), random(-3, 3))
        ));
    }


    genCells(random(9, 30));
    
    // noLoop();
    capturer.start();
    draw();
}

function draw() {
    ms = millis();

    background(p.get(0));

    // sdfs.forEach(s => s.render());

    updateAnchors();
    // renderCells();

    isoRange = [-100, 0];

    let ct = p.colors.length;
    for(let i = 0; i < ct; i++) {
        let t = i/(ct-1);
        isovalue = lerp(...isoRange, t);
        shapeCol = p.get(i);
        renderCells();
    }

    updateSDFs();

    cap();
    check();
}

let tenk = 10000;

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
    return p.getRandomCol();
}

function L(x, y) {
    return (x*x+y*y)**0.5;
}

function genCells(res) {
    let anchorsTemp = [];

    // Create Anchors 
    for(let i = 0; i < res+1; i++) {
        let ti = i/(res);
        let cx = ti*width;
        anchorsTemp.push([]);
        for(let j = 0; j < res+1; j++) {
            let tj = j/(res);
            let cy = tj*height;

            let a = new Anchor(cx, cy);
            anchorsTemp[i].push(a);
            anchors.push(a);
        }
    }

    // Create Cells
    for(let i = 0; i < res; i++) {
        for(let j = 0; j < res; j++) {
            cells.push(new Cell(
                i, j, res, rc(), 
                [anchorsTemp[i][j],
                anchorsTemp[i+1][j],
                anchorsTemp[i+1][j+1],
                anchorsTemp[i][j+1]],
            ));
        }
    }
}

function updateAnchors() {
    anchors.forEach(a => a.update());
}

function updateSDFs() {
    sdfs.forEach(sdf => sdf.update());
}

function renderCells() {
    push();
    cells.forEach(c => c.render());
    // anchors.forEach(c => c.render());
    // anchors.forEach(c => console.log(c.value));
    pop();
}

class Anchor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.value = 0;
    }

    update() {
        let newVal = Infinity;
        sdfs.forEach(sdf => {
            newVal = min(sdf.f([this.x, this.y]), newVal)
        });
        this.value = -1*newVal;
        // this.value = noise(this.x*0.01, this.y*0.01);
    }

    render() {
        if(this.value > isovalue) {
            push();
            fill("green");
            circle(this.x, this.y, width*0.02);
            pop();
        }
    }
}

class SDF_Circle {
    constructor(x, y, r, v) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.v = v;
    }   

    f([x, y]) {
        return (L(x - this.x, y - this.y) - this.r);
    }

    update() {
        this.x += this.v.x;
        this.y += this.v.y;
        if(this.x < 0 && this.v.x < 0) this.v.mult(-1, 1);
        if(this.x > width && this.v.x > 0)  this.v.mult(-1, 1);
        if(this.y < 0 && this.v.y < 0) this.v.mult(1, -1);
        if(this.y > height && this.v.y > 0) this.v.mult(1, -1);
    }

    render() {
        circle(this.x, this.y, this.r*2);
    }
}

function getT(f1, f2) {
    let v2 = max(f1, f2);
    let v1 = min(f1, f2);
    return (isovalue - v1)/(v2 - v1);
}

function getPt(p0, p1) {
    let t = getT(p0.value, p1.value);
    console.log(t);
    return [
        Math.trunc((1-t) * p0.x + t*p1.x),
        Math.trunc((1-t) * p0.y + t*p1.y),
    ];

    let pt =[0,0];
    

    // return [
    //     lerp(a1.x, a2.x, 0.5),
    //     lerp(a1.y, a2.y, 0.5),
    // ]

    // let v2, v1;
    // if(a.value > a.value) {
    //     v2 = a;
    //     v1 = b;
    // } else {
    //     v1 = a;
    //     v2 = b;
    // }

    // let t = getT(to.value, from.value);
    // console.log(t)

    // if(from.x == to.x) {
    //     pt[0] = from.x;
    //     if(from.y < to.y) {
    //         pt[1] = lerp(from.y, to.y, t);
    //     } else {
    //         pt[1] = lerp(to.y, from.y, t);
    //     }
    // } else if (from.y == to.y) {
    //     pt[1] = from.y;
    //     if(from.x < to.x) {
    //         pt[0] = lerp(from.x, to.x, t);
    //     } else {
    //         pt[0] = lerp(to.x, from.x, t);
    //     }


    //     // if(a1.x < a2.x) {
    //     //     pt[0] = lerp(a1.x, a2.x, t)
    //     // } else {
    //     //     pt[0] = lerp(a2.x, a1.x, t)
    //     // }
    // }

    pt[0] = Math.trunc((1-t) * from.x + t*to.x);
    pt[1] = Math.trunc((1-t) * from.y + t*to.y);

    return pt;
}

class Cell {
    constructor(i, j, res, col, anchors) {
        this.i = i;
        this.j = j;
        this.col = col;

        this.x = i*(width/res);
        this.y = j*(height/res);
        this.res = res;
        this.w = (width/res);
        this.h = (height/res);

        this.center = [
            this.x + this.w/2,
            this.y + this.h/2,
        ];

        // this.edges = [
        //     [this.x + this.w/2, this.y],
        //     [this.x + this.w, this.y + this.h/2],
        //     [this.x + this.w/2, this.y + this.h],
        //     [this.x, this.y + this.h/2],
        // ]

        this.cw = [];
        this.ccw = [];

        this.corners = [
            [this.x, this.y],
            [this.x + this.w, this.y],
            [this.x + this.w, this.y + this.h],
            [this.x, this.y + this.h],
        ];

        this.anchors = anchors;


    }

    render() {
        let f0 = this.anchors[0].value - isovalue;
        let f1 = this.anchors[1].value - isovalue;
        let f2 = this.anchors[2].value - isovalue;
        let f3 = this.anchors[3].value - isovalue;

        let x = this.x;
        let y = this.y;
        let rez = this.w;

        this.cw = [
            [x + rez * f0 / (f0 - f1), y],
            [x + rez, y + rez * f1 / (f1 - f2)],
            [x + rez * (1 - f2 / (f2 - f3)), y + rez],
            [x, y + rez * (1 - f3 / (f3 - f0))],
        ];

        // (x + rez * f0 / (f0 - f1), y);
        // (x + rez, y + rez * f1 / (f1 - f2));
        // (x + rez * (1 - f2 / (f2 - f3)), y + rez);
        // (x, y + rez * (1 - f3 / (f3 - f0)));

        // this.ccw = [
        //     getPt(this.anchors[0], this.anchors[1]),
        //     getPt(this.anchors[1], this.anchors[2]),
        //     getPt(this.anchors[2], this.anchors[3]),
        //     getPt(this.anchors[3], this.anchors[0]),
        // ];

        // console.log(this.cw, this.ccw);




        // Identify case:
        let tl = (this.anchors[0].value > isovalue);
        let tr = (this.anchors[1].value > isovalue);
        let br = (this.anchors[2].value > isovalue);
        let bl = (this.anchors[3].value > isovalue);

        let encode = ""
        tl ? encode += "1" : encode += "0";
        tr ? encode += "1" : encode += "0";
        br ? encode += "1" : encode += "0";
        bl ? encode += "1" : encode += "0";

        let parse = {
            "0000": 0,
            "0001": 1,
            "0010": 2,
            "0011": 3,
            "0100": 4,
            "0101": 5,
            "0110": 6,
            "0111": 7,
            "1000": 8,
            "1001": 9,
            "1010": 10,
            "1011": 11,
            "1100": 12,
            "1101": 13,
            "1110": 14,
            "1111": 15,
        }

        let f = parse[encode];

        push();
        fill(shapeCol);
        stroke(shapeCol);

        if(f == 0) this.case0();
        if(f == 1) this.case1();
        if(f == 2) this.case2();
        if(f == 3) this.case3();
        if(f == 4) this.case4();
        if(f == 5) this.case5();
        if(f == 6) this.case6();
        if(f == 7) this.case7();
        if(f == 8) this.case8();
        if(f == 9) this.case9();
        if(f == 10) this.case10();
        if(f == 11) this.case11();
        if(f == 12) this.case12();
        if(f == 13) this.case13();
        if(f == 14) this.case14();
        if(f == 15) this.case15();

        pop();
    }

    case0() {
        // console.log(0)
        return;
    }

    case1() {
        beginShape();
        vertex(...this.cw[2]);
        vertex(...this.corners[3]);
        vertex(...this.cw[3]);
        endShape(CLOSE);
        // text("1", this.x, this.y);
    }

    case2() {
        beginShape();
        vertex(...this.cw[1]);
        vertex(...this.cw[2]);
        vertex(...this.corners[2]);
        endShape(CLOSE);
        // text("2", this.x, this.y);
    }

    case3() {
        beginShape();
        vertex(...this.cw[3]);
        vertex(...this.cw[1]);
        vertex(...this.corners[2]);
        vertex(...this.corners[3]);
        endShape(CLOSE);
        // text("3", this.x, this.y);
    }
    case4() {
        beginShape();
        vertex(...this.cw[0]);
        vertex(...this.cw[1]); // Edge 1
        vertex(...this.corners[1]);
        endShape(CLOSE);
        // text("4", this.x, this.y);
    }
    case5() {
        beginShape();
        vertex(...this.cw[3]);
        vertex(...this.cw[0]);
        vertex(...this.corners[1]);
        vertex(...this.cw[1]);
        vertex(...this.cw[2]);
        vertex(...this.corners[3]);
        endShape(CLOSE);
        // text("5", this.x, this.y);
    }
    case6() {
        beginShape();
        vertex(...this.cw[0]);
        vertex(...this.cw[2]);
        vertex(...this.corners[2]);
        vertex(...this.corners[1]);
        endShape(CLOSE);
        // text("6", this.x, this.y);
    }
    case7() {
        beginShape();
        vertex(...this.corners[1]);
        vertex(...this.corners[2]);
        vertex(...this.corners[3]);
        vertex(...this.cw[3]);
        vertex(...this.cw[0]);
        endShape(CLOSE);
        // text("7", this.x, this.y);
    }
    case8() {
        beginShape();
        vertex(...this.cw[0]);
        vertex(...this.cw[3]); // Edge 3
        vertex(...this.corners[0]);
        endShape(CLOSE);
        // text("8", this.x, this.y);
    }
    case9() {
        beginShape();
        vertex(...this.cw[0]);
        vertex(...this.cw[2]);
        vertex(...this.corners[3]);
        vertex(...this.corners[0]);
        endShape(CLOSE);
        // text("9", this.x, this.y);
    }
    case10() {
        beginShape();
        vertex(...this.corners[0]);
        vertex(...this.cw[0]);
        vertex(...this.cw[1]);
        vertex(...this.corners[2]);
        vertex(...this.cw[2]);
        vertex(...this.cw[3]);
        endShape(CLOSE);
    }
    case11() {
        beginShape();
        vertex(...this.corners[0]);
        vertex(...this.cw[0]);
        vertex(...this.cw[1]);
        vertex(...this.corners[2]);
        vertex(...this.corners[3]);
        endShape(CLOSE);
    }
    case12() {
        beginShape();
        vertex(...this.corners[0]);
        vertex(...this.corners[1]);
        vertex(...this.cw[1]);
        vertex(...this.cw[3]);
        endShape(CLOSE);
    }
    case13() {
        beginShape();
        vertex(...this.corners[3]);
        vertex(...this.corners[0]);
        vertex(...this.corners[1]);
        vertex(...this.cw[1]);
        vertex(...this.cw[2]);
        endShape(CLOSE);
    }
    case14() {
        beginShape();
        vertex(...this.corners[0]);
        vertex(...this.corners[1]);
        vertex(...this.corners[2]);
        vertex(...this.cw[2]);
        vertex(...this.cw[3]);
        endShape(CLOSE);
    }
    case15() {
        beginShape();
        vertex(...this.corners[0]);
        vertex(...this.corners[1]);
        vertex(...this.corners[2]);
        vertex(...this.corners[3]);
        endShape(CLOSE);
    }


}
