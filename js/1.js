let eggshell;
let clays = [];
let particles = [];
// let capturer = new CCapture({ format: 'webm' , framerate: 30});

function setup() {
    createCanvas(750, 750);
    // frameRate(30);

    eggshell = color("#F0EAD6");
    background(eggshell);

    clays.push(
        color("#ba6b6b"), 
        color("#d4a576"), 
        color("#e7df8e"),
        color("#85c183"),
        color("#6574bf"),
        color("#9565bf"),
    );

    let ct = random(150, 500);
    ct = 5000;
    for(let i = 0; i < ct; i++) {
        let w = random()*width;
        let h = random()*height;
        particles.push(new Particle(w, h, 1, random()*(width*0.05), random(clays)));
    }

    // capturer.start();
    // draw();
}

function draw() {
    let running = false;
    particles.forEach(p => {
        if(p.life > 0) {
            p.move();
            p.render();
            if(running == false) running = true;
        }
    });

    // capturer.capture(document.getElementById('defaultCanvas0'));

    if(!running) {
        noLoop();
        border(random(width*0.05, width*0.15));
        granulateColor(12);

        // capturer.capture(document.getElementById('defaultCanvas0'));
        // capturer.stop();
        // capturer.save();
    }
    
}

class Particle {
    constructor(x, y, z, r, col) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
        this.col = col;

        this.wax = true;
        this.life = random([1, 2, 3]);

        this.sc = random(0.001, 0.01);
    }

    render() {
        let col = lerpColor(this.col, eggshell, this.z);
        let r = lerp(this.r, 0, this.z);
        push();
        noStroke();
        fill(col);
        circle(this.x, this.y, r);
        pop();
    }

    move() {
        let n = lerp(-1, 1, noise(this.x*this.sc, this.y*this.sc, this.z*this.sc));
        let nx = cos(n*TAU)/2;
        let ny = sin(n*TAU)/2;

        this.x += nx;
        this.y += ny;

        if(this.wax) {
            this.z -= 0.005;
        } else {
            this.z += 0.005;
        }
        
        if(this.z <= 0 || this.z >= 1) this.wax = !this.wax;
        if(this.z >= 1) this.life -= 1;
    }
}

function border(size) {
    let m = new Mask([size, size], "rect", {"w": width-2*size, "h": height-2*size});
    let s = new Sheet(eggshell, [m]);
    s.render();
}