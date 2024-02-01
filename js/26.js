let p;
let bg;

let particles = [];
let shapeStart;

let sideCol;

let lineCol;
let lineWgt;
let lineCurve;

// Parameters for particle behavior
let maxForce = 0.8;
let maxSpeed = 1.25; // 2
let desiredSeparation;
let separationCohesionRation = 1.2; // 0.88; // 1.1
let maxEdgeLen;

let capturer = new CCapture({ format: 'webm', framerate: 30 });
let complete = false;
let saved = false;
let ms;

function setup() {

    createCanvas(1000,1000);
    frameRate(30);
    // image(im, 0, 0, width, height);

    p = getPaletteByName("meadow");
    pc = p.size;

    let cols = shuffleArray(p.colors);

    desiredSeparation = (width*0.05);
    maxEdgeLen = desiredSeparation*0.36;

    let ct = 20;
    for(let i = 0; i < ct; i++) {
        let t = i/ct;
        let a = t*TAU;
        let p = [
            (width/2) + width*0.2*cos(a),
            (height/2) + height*0.2*sin(a),
        ];
        particles.push(new Particle(...p,
            maxForce,
            maxSpeed,
            desiredSeparation,
            separationCohesionRation,
        ));
        if(i > 0) {
            particles[i].setLeft(particles[i-1]);
            particles[i-1].setRight(particles[i]);
        }
    }

    particles[0].setLeft(particles[ct-1]);
    particles[ct-1].setRight(particles[0]);

    shapeStart = particles[0];

    particles = shuffleArray(particles);


    let borderSize = 50;
    let borderAmt = 0.02;
    let tl = [width*borderAmt, height*borderAmt];
    let tr = [width*(1-borderAmt), height*borderAmt];
    let br = [width*(1-borderAmt), height*(1-borderAmt)];
    let bl = [width*borderAmt, height*(1-borderAmt)];
    for(let i = 0; i < borderSize; i++) {
        let t = i/borderSize;

        // Top
        let curr = new Particle(...lerpPos(tl, tr, t));
        curr.frozen = true;
        curr.doRender = false;
        particles.push(curr);

        // Right
        curr = new Particle(...lerpPos(tr, br, t));
        curr.frozen = true;
        curr.doRender = false;
        particles.push(curr);

        // Bottom
        curr = new Particle(...lerpPos(bl, br, t));
        curr.frozen = true;
        curr.doRender = false;
        particles.push(curr);

        // Left
        curr = new Particle(...lerpPos(tl, bl, t));
        curr.frozen = true;
        curr.doRender = false;
        particles.push(curr);
    }

    bg = cols[0];
    sideCol = cols[2];
    // shapeCol = cols[1];
    lineCol = cols[1];
    lineWgt = random(1, width*0.01);
    lineCurve = true;

    capturer.start();
    draw();
}

function rc() {
    return p.getRandomCol();
}

let qtree;


function draw() {
    ms = millis();

    background(bg);
    frame();
    connectParticles();
    renderParticles();

    let boundary = new Rectangle(width/2, height/2, width, height);
    qtree = new QuadTree(boundary, 4);
    particles.forEach(p => qtree.insert(p));

    particles.forEach(p => {
        p.run();
    });

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

function frame() {
    push();
    stroke(sideCol);
    fill(sideCol);
    

    amt = 0.05;
    rect(0, 0, width, height*amt);
    rect(0, 0, width*amt, height);
    rect(0, height*(1-amt), width, height*amt);
    rect(width*(1-amt), 0, width*amt, height);

    pop();
}

function renderParticles() {
    particles.forEach(p => p.render());
}

function connectParticles() {
    push();
    noFill();
    stroke(lineCol);
    strokeWeight(lineWgt);

    beginShape();
    let curr = shapeStart;
    while (true) {
        if(lineCurve) {
            curveVertex(curr.pos.x, curr.pos.y);
        } else {
            vertex(curr.pos.x, curr.pos.y);
        }
        
        curr = curr.rightNeighbor;
        if(curr == shapeStart) break;
    }

    endShape(CLOSE);
    pop();
}

function insertBetween(a, b) {
    let newParticle = createInsertionParticle(a, b);
    particles.push(newParticle);

    if(a.leftNeighbor == b) {
        a.setLeft(newParticle);
        newParticle.setRight(a);
        b.setRight(newParticle);
        newParticle.setLeft(b);
    } else if (a.rightNieghbor == b) {
        a.setRight(newParticle);
        newParticle.setLeft(a);
        b.setLeft(newParticle);
        newParticle.setRight(b);
    }
}

function createInsertionParticle(a, b) {
    let newParticle = new Particle(
        lerp(a.pos.x, b.pos.x, 0.5), 
        lerp(a.pos.y, b.pos.y, 0.5),
        random([a.maxForce, b.maxForce]) + random(-0.1, 0.1),
        random([a.maxSpeed, b.maxSpeed]) + random(-0.1, 0.1),
        random([a.desiredSeparation, b.desiredSeparation]),
        a.separationCohesionRation,
    );
    return newParticle;
}

class Particle {
    constructor(x, y, maxForce, maxSpeed, desiredSeparation, separationCohesionRation) {
        this.pos = createVector(x, y);

        let a = random()*TAU;
        this.vel = createVector(cos(a), sin(a));
    
        this.acc = createVector(0,0);


        this.maxForce = maxForce;
        this.maxSpeed = maxSpeed;
        this.desiredSeparation = desiredSeparation;
        this.separationCohesionRation = separationCohesionRation;


        this.canAddLeft = false;
        this.addRight = false;

        this.frozen = false;
        this.doRender = true;

        this.rOuter = random(0.25, 1) * desiredSeparation/4;
        this.rInner = random(0.25, 1) * this.rOuter;

        p.shuffle();
        this.cOuter = p.getCol(0);
        this.cInner = p.getCol(1);


        

    }

    setLeft(p) {
        this.leftNeighbor = p;
    }

    setRight(p) {
        this.rightNeighbor = p;
    }

    applyForce(force) {
        this.acc.add(force);
    }

    run() {
        if(this.frozen) return;

        this.differentiate();
        this.update();
        this.checkNeighborDist();
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);

        this.checkOOB();
    }

    checkOOB() {
        let oob = (
            this.pos.x <= 0 || 
            this.pos.x >= width ||
            this.pos.y <= 0 ||
            this.pos.y >= height
        );

        if(oob) {
            this.frozen = true;
            this.canAddRight = false;
            this.canAddLeft = false;
        }

    }

    differentiate() {
        let separation = this.separate();
        let cohesion = this.edgeCohesion();

        separation.mult(this.separationCohesionRation);
        this.applyForce(separation);
        this.applyForce(cohesion);
    }

    separate() {
        let steer = createVector(0,0);
        let count = 0;
        let queryRange = new Circle(this.pos.x, this.pos.y, this.desiredSeparation);
        let pts = qtree.query(queryRange);

        pts = particles;

        for(let p of pts) {
            if(p == this) continue;
            let d = p5.Vector.dist(this.pos, p.pos);
            if(d > 0 && d < this.desiredSeparation) {
                let diff = p5.Vector.sub(this.pos, p.pos);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count += 1;
            }
        }

        if(count > 0) {
            steer.div(count+0.0);
        }

        if(steer.mag() > 0) {
            steer.setMag(this.maxSpeed);
            steer.sub(this.vel);
            steer.limit(this.maxForce);
        }

        return steer;
    }

    edgeCohesion() {
        let sum = createVector(0,0);
        sum.add(this.leftNeighbor.pos);
        sum.add(this.rightNeighbor.pos);
        sum.div(2);

        return this.seek(sum);
    }

    checkNeighborDist() {
        let dln = this.pos.dist(this.leftNeighbor.pos);
        if(dln >= maxEdgeLen && random() > 0.95) {
            insertBetween(this, this.leftNeighbor);
        }

        let drn = this.pos.dist(this.rightNeighbor.pos)

        if(drn >= maxEdgeLen && random() > 0.95) {
            insertBetween(this, this.leftNeighbor);
        }

    }

    seek(target) {
        let desired = p5.Vector.sub(target, this.pos);
        desired.setMag(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }

    render() {
        if(!this.doRender) return;

        push();
        noStroke();

        fill(this.cOuter);
        circle(this.pos.x, this.pos.y, this.rOuter);

        fill(this.cInner);
        circle(this.pos.x, this.pos.y, this.rInner);

        pop();
    }
}