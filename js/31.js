let p;
let bg;
let bgt;
let bgi;

let capturer = new CCapture({ format: 'webm', framerate: 30 });
let complete = false;
let saved = false;
let ms;

let currTime = 0;
let msIncrement = 33.333;

let panels = [];
let balls = [];

let loadedSounds = [];

function preload() {
    soundFormats('mp3');
    for(let i = 1; i <= 10; i++) {
        let currName = "celeste"+i+".mp3";
        loadedSounds.push(loadSound("../assets/sound/"+currName));
    }
}


function setup() {
    createCanvas(300,300);



    p = getPaletteByName("bauhaus1");
    p.makeMonochromatic(true, p.getRandomIndex(), 0.35);

    p.shuffle();
    bg = p.get(0);

    bgi = genBackgroundImage();


    p.colors.splice(0, 1);
    p.size -= 1;

    let amt = 0.0;
    let corners = [
        [width*amt, height*amt],
        [width*(1-amt), height*amt],
        [width*(1-amt), height*(1-amt)],
        [width*amt, height*(1-amt)],
    ];


    panels.push(new Panel(
        corners[0], corners[1], p.r(), random(loadedSounds)
    ));

    panels.push(new Panel(
        corners[1], corners[2], p.r(), random(loadedSounds)
    ));

    panels.push(new Panel(
        corners[2], corners[3], p.r(), random(loadedSounds)
    ));

    panels.push(new Panel(
        corners[3], corners[0], p.r(), random(loadedSounds)
    ));


    // for(let i = 0; i < 10; i++) {
    //     balls.push(new Ball(random(2*amt, 1-2*amt)*width, random(2*amt, 1-2*amt)*height, width*random(0.025, 0.1), p5.Vector.random2D().setMag(random(0.1, 0.75)), p.r(), random(loadedSounds)));
    // }

    for(let i = 0; i < 10; i++) {
        let ti = lerp(0.15, 0.85, i/10);
        let x = width*ti;
        for(let j = 0; j < 10; j++) {
            if(random() > 0.90) {
                let tj = lerp(0.15, 0.85, j/10);
                let y = height*tj;
                balls.push(new Ball(
                    x, y, 
                    random(0.1, 0.75)*((width-(8*amt))/10),
                    p5.Vector.random2D().setMag(random(0.35, 1.4)),
                    p.r(),
                    random(loadedSounds),
                ));
            }
        }
    }

    // capturer.start();
    // draw();
}

let tenk = 2000;

function draw() {

    // ms = currTime;
    // currTime += msIncrement;

    background(bg);
    image(bgi, 0, 0, width, height);

    // panels.forEach(p => p.render());

    balls.forEach(b => {
        b.render();
        b.update();
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

function genBackgroundImage() {
    let bgi = createGraphics(width, height);
    // console.log(p);

    let pCopy = new Palette(
        "copy",
        1,
        [...p.colors],
    )

    // console.log(pCopy)
    pCopy.makeMonochromatic(true, 0, 0.85);
    bgi.background(pCopy.get(0));

    let count = 40;
    bgi.noStroke();
    bgi.noFill();
    let options = [0,1,2,3]
    
    let lines = [];

    for(let i = 0; i < count; i++) {
        options = shuffleArray(options)
        let pts = [];
        for(let i = 0; i < 2; i++) {
            if(options[i] == 0) {
                pts.push(
                    [-width, random()*height],
                );
            } else if (options[i] == 1) {
                pts.push(
                    [2*width, random()*height],
                );
            } else if (options[i] == 2) {
                pts.push(
                    [random()*width, -height],
                );
            } else if (options[i] == 3) {
                pts.push(
                    [random()*width, 2*height],
                );
            }
        }

        pts.push(pCopy.r());
        pts.push(random(0.03, 0.10) * width);
        lines.push(pts);
    }

    let blurPx = ceil(width*0.05);
    console.log(blurPx)
    
    let black = color(0);
    lines.forEach(l => {
        let a = l[0];
        let b = l[1];
        let c = l[2];
        let w = l[3];

        bgi.drawingContext.filter = "blur("+blurPx+"px)";

        let cDark = lerpColor(c, black, 0.8);
        bgi.stroke(cDark);
        bgi.strokeWeight(w);
        bgi.line(...a, ...b);

        bgi.drawingContext.filter = "blur(0px)";

        bgi.stroke(c);
        bgi.line(...a, ...b);
    });
    
    
    return bgi;
}


class Panel {
    constructor(a, b, col, snd) {
        this.a = createVector(...a);
        this.b = createVector(...b);
        this.col = col;

        this.length = this.a.dist(this.b);

        this.norm = p5.Vector.sub(this.b, this.a).normalize();

        this.sound = snd;

        this.active = false;

        this.lastPlayed = -1000;
    }

    render() {
        push();

        fill(this.col);
        if(this.active == true) {
            stroke(255);
        } else {
            stroke(this.col);
        }

        strokeWeight(0.01*width);
        strokeCap(ROUND);

        line(this.a.x, this.a.y, this.b.x, this.b.y);

        pop();
    }

    playSound() {
        let ms = millis();
        if(ms - this.lastPlayed >= 300) {
            this.sound.play();
            this.lastPlayed = ms;
        }
    }
}

class Ball {
    constructor(x, y, r, v, c, sound) {
        this.p = createVector(x, y);
        this.r = r;
        this.v = v;
        this.mag = v.mag();
        this.c = c;
        this.sound = sound;
        this.lastPlayed = -300;
        // this.soundCooldown = 0;

        this.img = createGraphics(this.r*8, this.r*8);
        this.img.noStroke();

        this.img.drawingContext.filter = "blur(" + ceil(width*0.02) + "px)";
        this.img.fill(lerpColor(this.c, color(0), 0.8));
        this.img.circle(this.img.width/2, this.img.height/2, this.r*2);
        this.img.drawingContext.filter = "blur(0px)";
        this.img.fill(this.c);
        this.img.circle(this.img.width/2, this.img.height/2, this.r*2);
        // this.img.background(color('red'));



    }

    update() {
        this.p.add(this.v);
        this.checkBounds();
        this.checkBalls();
        this.checkPanels();

        if(this.soundCooldown > 0) this.soundCooldown -= deltaTime;
    }

    playSound() {
        let ms = millis();
        if(ms - this.lastPlayed >= 300) {
            this.sound.play();
            this.lastPlayed = ms;
        }
    }

    checkBounds() {
        if((this.p.x < 0 && this.v.x < 0) || (this.p.x > width && this.v.x > 0)) {
            this.v.x *= -1;
            this.playSound();
        }
        if((this.p.y < 0 && this.v.y < 0) || (this.p.y > height && this.v.y > 0)) {
            this.v.y *= -1;
            this.playSound();
        }
    }

    checkBalls() {
        for(let i = 0; i < balls.length; i++) {
            if(balls[i] == this) continue;

            let b = balls[i];

            let d = this.p.dist(b.p);
            let rSum = this.r + b.r;
            if(d > rSum) continue;

            let dir = p5.Vector.sub(b.p, this.p).normalize().rotate(PI).setMag(this.mag);
            let newDir = [0,0];

            if(this.v.x < dir.x) {
                newDir[0] = lerp(this.v.x, dir.x, 0.4);
            } else {
                newDir[0] = lerp(dir.x, this.v.x, 0.6);
            }

            if(this.v.y < dir.y) {
                newDir[1] = lerp(this.v.y, dir.y, 0.4);
            } else {
                newDir[1] = lerp(dir.y, this.v.y, 0.6);
            }

            this.mag = this.mag > b.mag ? 
                lerp(b.mag, this.mag, 0.80) :
                lerp(this.mag, b.mag, 0.20);

            this.v.set(...newDir).setMag(this.mag);
            this.playSound();
        }
    }

    checkPanels() {
        for(let i = 0; i < panels.length; i++) {
            let p = panels[i];

            let ips = intersectLineCircle(p.a, p.b, this.p, this.r);
            if(ips.length == 0) continue;

            let dotProd = this.v.dot(p.norm);

            this.v.set(
                this.v.x - 2*dotProd*p.norm.x,
                this.v.y - 2*dotProd*p.norm.y,
            ).rotate(PI).setMag(this.mag);

            p.playSound();
        }
    }

    render() {
        image(this.img, this.p.x - this.img.width/2, this.p.y - this.img.height/2);

    }
}

let intersectLineCircle = function(p1, p2, cpt, r) {
    let sign = function(x) { return x < 0.0 ? -1 : 1; };

    let x1 = p1.copy().sub(cpt);
    let x2 = p2.copy().sub(cpt);

    let dv = x2.copy().sub(x1)
    let dr = dv.mag();
    let D = x1.x*x2.y - x2.x*x1.y;

    // evaluate if there is an intersection
    let di = r*r*dr*dr - D*D;
    if (di < 0.0)
        return [];
   
    let t = sqrt(di);

    ip = [];
    ip.push( new p5.Vector(D*dv.y + sign(dv.y)*dv.x * t, -D*dv.x + abs(dv.y) * t).div(dr*dr).add(cpt) );
    if (di > 0.0) {
        ip.push( new p5.Vector(D*dv.y - sign(dv.y)*dv.x * t, -D*dv.x - abs(dv.y) * t).div(dr*dr).add(cpt) ); 
    }
    return ip;
}