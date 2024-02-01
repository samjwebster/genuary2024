let p;
let bgc;
let bgt;

let flocks = [];
let contrails = [];

let capturer = new CCapture({ format: 'webm', framerate: 30 });
let complete = false;
let saved = false;

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    p = getPaletteByName("tropics");

    let sortByValue = (a, b) => {return brightness(b) - brightness(a);}
    let cols = sort(p.colors, sortByValue);

    if(random()>0.5) cols = cols.reverse();

    bgc = cols[0];
    bgt = color(bgc.levels[0], bgc.levels[1], bgc.levels[2], 0);

    cols.splice(0, 1);
    cols = shuffleArray(cols);

    for(let n = 0; n < cols.length; n++) {
        flocks.push(new Flock(n, 5, cols[n], cols[(n+1)%cols.length]));
    }  

    // granulate(7);


    // capturer.start();
    // draw();
    // noLoop();
}

let ms;
let tenk = 10000;
let completionTime;

function draw() {
    ms = millis();

    background(bgc);
    updateContrails();
    flocks.forEach(f => {
        f.update();
        f.render();
    });

    // cap();
    // check();
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
    return p.getRandomCol();
}

function updateContrails() {
    let dead = [];
    for(let i = 0; i < contrails.length; i++) {
        if(contrails[i].updateAndRender()) dead.push(i);
    }
    for(let i = dead.length-1; i >= 0; i--) {
        contrails.splice(i, 1);
    }
}

class Flock {
    constructor(id, size, col, contrailCol) {
        this.id = id;
        this.size = size;
        this.col = col;
        this.contrailCol = contrailCol;

        this.setupParticles();
    }

    setupParticles() {
        this.particles = [];
        for(let i = 0; i < this.size; i++) {
            let x = random()*width;
            let y = random()*height;
            let dir = random()*TAU;
            let speed = 10;
            this.particles.push(new Particle(x, y, dir, speed, this.col, this.contrailCol, this.id));
        }
    }

    update() {
        for(let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            for(let j = 0; j < this.particles.length; j++) {
                if(i != j) p.adjustTowards(this.particles[j]);
            }
        }

        this.particles.forEach(p => p.update());
    }

    render() {
        this.particles.forEach(p => p.render());
    }
}

class Particle {
    constructor(x, y, dir, speed, col, contrailCol, flockId) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.speed = speed;
        this.col = col;
        this.contrailCol = contrailCol;
        this.flockId = flockId;

        this.tempDir = null;
        this.range = width*0.2;

        this.updateV();
    }

    updateV() {
        if(this.tempDir != null) {
            this.dir = this.tempDir;
            this.tempDir = null;
        }

        this.v = createVector(cos(this.dir), sin(this.dir)).normalize().mult(this.speed);
    }

    update() {
        if(this.tempDir != null) this.updateV();

        let na = noise(this.x * 0.01, this.y*0.01, this.flockId)*TAU;
        this.tempDir = lerp(this.dir, na, 0.005);
        this.updateV();



        this.x += this.v.x;
        this.y += this.v.y;
        if(this.x > width) this.x -= width;
        if(this.x < 0) this.x += width;
        if(this.y > height) this.y -= height;
        if(this.y < 0) this.y += height;
    }

    render() {

        let head = [
            this.x+cos(this.dir)*20, 
            this.y+sin(this.dir)*20,
        ];
        let leftWing = [
            this.x+cos(this.dir + (TAU/3))*20, 
            this.y+sin(this.dir + (TAU/3))*20,
        ];
        let rightWing = [
            this.x+cos(this.dir + (2*(TAU/3)))*20, 
            this.y+sin(this.dir + (2*(TAU/3)))*20,
        ];

        noStroke();
        fill(this.col);

        beginShape(); 
        vertex(...head);
        vertex(...rightWing);
        vertex(...leftWing);
        endShape(CLOSE);

        contrails.push(new Contrail(
            ...lerpPos([this.x, this.y], leftWing, 0.60), 
            5, this.contrailCol)
        );
        contrails.push(new Contrail(
            ...lerpPos([this.x, this.y], rightWing, 0.60), 
            5, this.contrailCol)
        );

        // circle(this.x+cos(this.dir)*20, this.y+sin(this.dir)*20, 20);
    }

    adjustTowards(particle) {
        // If it's out of range, do not adjust towards that particle
        let d = dist(this.x, this.y, particle.x, particle.y);
        if (d > this.range) return;

        let amt = 1-(d/this.range);
        let amt_fixed = amt/30;
        this.tempDir = lerp(this.dir, particle.dir, amt_fixed);
    }
}

class Contrail {
    constructor(x, y, r, c) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
        this.life = 1;
        this.decay = 0.01;
        this.dead = false;
    }

    updateAndRender() {
        if(!this.dead) {
            noStroke();
            fill(this.c);
            circle(this.x, this.y, lerp(0, this.r, this.life));
            this.life -= this.decay;
            if(this.life <= 0) this.dead = true;
        } else {
            return true;
        }
    }
}