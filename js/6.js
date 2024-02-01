let p;
let circles = [];
let bg;
let nScale = 0.005;
let maxCircles = 500;
let currTime = 0;

var capturer = new CCapture({ format: 'webm', framerate: 30 });

function setup() {
    let scale = 0.5;
    let res = [1920*scale, 1080*scale]
    cnv = createCanvas(...res);
    frameRate(30);

    p = getPalette();
    black = color(0);

    bg = lerpColor(color(0), rc(), 0.2)
    // background(bg);

    packCircles(maxCircles);

    capturer.start();

    draw();
}

function draw() {
    let ms = millis();
    currTime = ms/50 * nScale;

    background(bg);
    drawCircles();

    // if(circles.length < maxCircles) {
    //     packCircles(maxCircles-circles.length);
    // }

    capturer.capture(document.getElementById('defaultCanvas0'));  
    if(ms >= 10000) {
        console.log('stop')
        capturer.stop();
        console.log('save')
        capturer.save();
        console.log('complete')
        noLoop();
    }
}

function rc() {
    return p.getRandomCol();
}

function packCircles(count){
    let pad = width*0.001;
    let passes = 3;
    let sRange = [min(width, height)*0.025, min(width, height)*0.3];

    while(circles.length < count && passes > 0) {
        let ct = (count - circles.length);
        for(let i = 0; i < ct; i++) {
            let rx = random()*width;
            let ry = random()*height;
            let rs = random(...sRange);
            let valid = true;

            if(lifeAtPt(rx, ry) < 0.5) break;
    
            for(let j = 0; j < circles.length; j++) {
                let c = circles[j];
                let d = dist(rx, ry, c.x, c.y);
    
                if(d < (c.s/2) + (rs/2) + pad) {
                    valid = false;
                    break;
                }
            }
    
            if(valid) circles.push(new Circle(rx, ry, rs, rc(), circles.length));
        }

        sRange[1] = sRange[1] * 0.75;
    }
}

// function drawCircles() {
//     push();
//     for(let i = 0; i < circles.length; i++) {
//         circles[i].render();
//     }
//     pop();
// }

function drawCircles() {
    push();
    for(let i = 0; i < circles.length; i++) {
        circles[i].render();
        circles[i].getLife(currTime);
    }
    pop();
}

class Circle {
    constructor(x, y, s, c, idx) {
        this.x = x;
        this.y = y;
        this.s = s;
        this.c = c;
        this.idx = idx;

        this.spawning = 0;
        this.getLife(0);
    }

    render() {
        noStroke();

        if(this.spawning < 1) {
            fill(lerpColor(bg, lerpColor(bg, this.c, this.life), this.spawning));
            this.spawning += 0.005;
        } else {
            fill(lerpColor(bg, this.c, this.life));
        }

        circle(this.x, this.y, this.s);
    }

    getLife(time) {
        this.life = map(noise(this.x*nScale, this.y*nScale, time)+0.033, 0.3, 0.7, 0, 1);
    }
}

function lifeAtPt(x, y, time) {
    return map(noise(x*nScale, y*nScale, time*nScale)+0.033, 0.3, 0.7, 0, 1);
}