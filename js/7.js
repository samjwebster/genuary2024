let p;
let circles = [];
let shapes = [];
let bg;
let maxShapes = 500;
let currTime = 0;
let progress = 0;

let capturer = new CCapture({ format: 'webm', framerate: 30 });
let saved = false;
let complete = false;
let completionTime;

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);
    frameRate(30);

    p = getPaletteByName("palm");
    bg = lerpColor(color(0), rc(), 0.2)

    packShapes(maxShapes);

    capturer.start();

    draw();
    // noLoop();
}



function draw() {

    let ms = millis();

    if(!complete) {
        background(bg);
        progress += (noise(ms/150, progress/500))/1.5;

        drawShapes();

        push();
        fill(255);
        stroke(255);
        strokeWeight(0.5);
        textSize(15)
        text(""+floor(progress), 20, 30);
        pop();

        granulate(4);
    }

    

    capturer.capture(document.getElementById('defaultCanvas0'));
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

function packShapes(count) {
    let passes = 5;
    let sRange = [min(width, height)*0.025, min(width, height)*0.5];

    while(shapes.length < count && passes > 0) {
        let ct = (count - shapes.length);
        for(let i = 0; i < ct; i++) {
            let rx = random()*width;
            let ry = random()*height;

            while(!withinSquare(rx, ry)) {
                rx = random()*width;
                ry = random()*height;
            }

            let rs = random(...sRange);
            let shape;

            let type = random([0,1,2]);
            if(type == 0) {
                shape = new Circle(rx, ry, rs, rc());
            } else if (type == 1) {
                shape = new Square(rx, ry, rs, random()*TAU, rc());
            } else if (type == 2) {
                shape = new Triangle(rx, ry, rs, random()*TAU, rc());
            }

            if(validate(shape)) {
                shapes.push(shape);
                if(type == 0) circles.push(shape);
                else shape.circles.forEach(c => circles.push(c));
            }
        }

        sRange[1] = sRange[1] * 0.75;
        passes -= 1;
    }

    let compareBySize = (a, b) => a.s - b.s;
    shapes.sort(compareBySize);

    for(let i = 0; i < shapes.length; i++) {
        shapes[i].setIdx(i+1);
    }
}

function withinSquare(x, y) {
    let amt = 0.15;
    if(x < width*amt  || x > width*(1-amt))  return false;
    if(y < height*amt || y > height*(1-amt)) return false;
    return true; 
}

function validate(shape) {
    let pad = width*0.02;
    let valid = true;
    
    if(shape.type == 0) {
        for(let i = 0; i < circles.length; i++) {
            let curr = circles[i];
            let d = dist(shape.x, shape.y, curr.x, curr.y);
            if(d < (curr.s/2) + (shape.s/2) + pad) {
                valid = false;
                break;
            }
        }
    } else {
        shape.circles.forEach(c => {
            for(let i = 0; i < circles.length; i++) {
                let curr = circles[i];
                let d = dist(c.x, c.y, curr.x, curr.y);
                if(d < (curr.s/2) + (c.s/2) + pad) {
                    valid = false;
                    break;
                }
            }
        });
    }
    
    return valid;
}

function drawShapes() {
    push();
    for(let i = 0; i < shapes.length; i++) {
        // console.log(shapes[i])
        shapes[i].render();
        // circles[i].getLife(currTime);
    }
    pop();
}

function drawCircles() {
    push();
    stroke('red');
    noFill();
    strokeWeight(3);
    for(let i = 0; i < circles.length; i++) {
        let curr = circles[i];
        circle(curr.x, curr.y, 5);
    }
    pop();
}

class Circle {
    constructor(x, y, s, c) {
        this.type = 0;
        this.x = x;
        this.y = y;
        this.s = s;
        this.c = c;
    }

    setIdx(idx) {
        this.idx = idx;
        this.finish = (this.idx/shapes.length)*100;
    }

    render() {
        push();
        stroke(this.c);
        strokeWeight(2);
        if(progress < this.finish) {
            noFill();
            let t = progress/this.finish;
            let ease_t = 1 - (1 - t) * (1 - t)
            circle(this.x, this.y, lerp(0, this.s, t));
        } else {
            fill(this.c);
            circle(this.x, this.y, this.s);
        }
        pop();
    }
}

class Square {
    constructor(x, y, s, a, c) {
        this.type = 1;
        this.x = x;
        this.y = y;
        this.s = s;
        this.a = a;
        this.c = c;

        this.setup();
    }

    setIdx(idx) {
        this.idx = idx;
        this.finish = (this.idx/shapes.length)*100;
    }

    setup() {
        let vec = createVector(sin(this.a), cos(this.a)).normalize().mult(this.s/2);

        let pos1 = [this.x + vec.x, this.y + vec.y];
        vec.rotate(PI/2);
        pos1 = [pos1[0] + vec.x, pos1[1] + vec.y];
        vec.normalize().mult(this.s).rotate(PI/2);
        let pos2 = [pos1[0] + vec.x, pos1[1] + vec.y];
        vec.rotate(PI/2);
        let pos3 = [pos2[0] + vec.x, pos2[1] + vec.y];
        vec.rotate(PI/2);
        let pos4 = [pos3[0] + vec.x, pos3[1] + vec.y];

        this.pts = [pos1, pos2, pos3, pos4];
        this.circles = [
            new Circle(this.x, this.y, this.s, null),
            new Circle(...lerpPos([this.x, this.y], pos1, 0.8), this.s*0.2, null),
            new Circle(...lerpPos([this.x, this.y], pos2, 0.8), this.s*0.2, null),
            new Circle(...lerpPos([this.x, this.y], pos3, 0.8), this.s*0.2, null),
            new Circle(...lerpPos([this.x, this.y], pos4, 0.8), this.s*0.2, null),
        ];
    }

    render() {
        push();
        stroke(this.c);
        strokeWeight(2);
        if(progress < this.finish) {
            noFill();

            let t = progress/this.finish;
            // let ease_t = 1 - (1 - t) * (1 - t)
            beginShape();
            this.pts.forEach(p => {
                vertex(...lerpPos([this.x, this.y], p, t));
            });
            endShape(CLOSE);
        } else {
            fill(this.c);

            beginShape();
            this.pts.forEach(p => vertex(...p));
            endShape(CLOSE);
        }
        pop();
    }
}

class Triangle {
    constructor(x, y, s, a, c) {
        this.type = 2;
        this.x = x;
        this.y = y;
        this.s = s;
        this.a = a;
        this.c = c;

        this.setup();
    }

    setIdx(idx) {
        this.idx = idx;
        this.finish = (this.idx/shapes.length)*100;
    }

    setup() {
        let vec = createVector(sin(this.a), cos(this.a)).normalize().mult(this.s*(-0.58)); 
        let pos1 = [this.x + vec.x, this.y + vec.y];
        vec.normalize().mult(this.s).rotate(PI*5/6);
        let pos2 = [pos1[0] + vec.x, pos1[1] + vec.y];
        vec.rotate(PI*(2/3));
        let pos3 = [pos2[0] + vec.x, pos2[1] + vec.y];

        this.avg = [(pos1[0]+pos2[0] + pos3[0])/3, (pos1[1]+pos2[1] + pos3[1])/3]


        this.pts = [pos1, pos2, pos3];
        this.circles = [
            new Circle(this.x, this.y, this.s*0.6, null),
            new Circle(...lerpPos([this.x, this.y], pos1, 0.70), this.s*0.2, null),
            new Circle(...lerpPos([this.x, this.y], pos2, 0.70), this.s*0.2, null),
            new Circle(...lerpPos([this.x, this.y], pos3, 0.70), this.s*0.2, null),
        ];
    }

    render() {
        push();
        stroke(this.c);
        strokeWeight(2);
        if(progress < this.finish) {
            noFill();

            let t = progress/this.finish;
            // let ease_t = 1 - (1 - t) * (1 - t);
            beginShape();
            this.pts.forEach(p => {
                vertex(...lerpPos([this.x, this.y], p, t));
            });
            endShape(CLOSE);
        } else {
            fill(this.c);

            beginShape();
            this.pts.forEach(p => vertex(...p));
            endShape(CLOSE);
        }
        pop();
    }

}