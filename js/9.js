let p;

let grid = [];
let size = 40;
let light;
let c;
let myFont;

// let capturer = new CCapture({ format: 'webm', framerate: 30 });

function preload() {
    myFont = loadFont("../assets/font/apple-pro.otf");
}

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);
    light = createGraphics(...res);

    frameRate(30);
    textFont(myFont);
    textSize((width/size)*0.8);

    light.textFont(myFont);
    light.textSize((width/size)*0.8);

    p = getPalette();
    bg = lerpColor(random()>0.5?color(0):color(255), rc(), 0.2)
    background(bg);

    let sampler = createGraphics(size, size);
    sampler.background(40);
    for(let i = 0; i < 50; i++) {
        let val = random()*255
        let fillCol = color(val,val,val);
        sampler.fill(fillCol);
        if(random() < 0.5) sampler.stroke(fillCol);
        else sampler.stroke(random()*255);
        if(random() < 0.8) {
            sampler.rect(random()*size, random()*size, random()*size/2, random()*size/2);
        } else {
            sampler.circle(random()*size, random()*size, random()*size/2);
        }
    }

    let span = random(0.33, 1)*size;
    let count = random()*5;
    let col = random()*255;
    sampler.noFill();
    sampler.stroke(col);
    sampler.strokeWeight(1);

    if(random() > 0.5) {
        if(random() > 0.5) {
            for(let i = 0; i < count; i++) {
                let t = i/(count-1);
                let x = lerp(0, span, t);
                sampler.line(x, 0, x, size);
            }
        } else {
            for(let i = 0; i < count; i++) {
                let t = i/(count-1);
                let x = lerp(size-span, size, t);
                sampler.line(x, 0, x, size);
            }
        }
    } else {
        if(random() > 0.5) {
            for(let i = 0; i < count; i++) {
                let t = i/(count-1);
                let y = lerp(0, span, t);
                sampler.line(0, y, size, y);
            }
        } else {
            for(let i = 0; i < count; i++) {
                let t = i/(count-1);
                let y = lerp(size-span, size, t);
                sampler.line(0, y, size, y);
            }
        }
    }

    for(let i = 0; i < size; i++) {
        grid.push([]);
        for(let j = 0; j < size; j++) {
            let v = round(sampler.get(i, j)[0]);
            let c = p.getCol(floor((v/256)*p.colors.length));
            if(c == undefined) console.log(v, c, v*p.colors.length)
            grid[i].push(
                new ASCII(
                    i, j, 
                    map(v, 0, 255, 21, 126), 
                    c
                )
            );

        }
    }

    // capturer.start();

    // draw();
    noLoop();
}

function draw() {



    populateBg();
    renderGrid();
    granulate(8);
   


    
}

function cap() {
    capturer.capture(document.getElementById('defaultCanvas0'));
}

function check() {
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

function populateBg() {
    for(let i = 0; i < random()*5; i++) {
        let pts = [];
        for(let i = 0; i < 3; i++) {
            let x = random()>0.5?random(-width, -width/2):random(width*1.5, 2*width);
            let y = random()>0.5?random(-width, -width/2):random(width*1.5, 2*width);
            pts.push([x, y]);
        }

        noStroke();
        fill(lerpColor(rc(), bg, 0.8));

        beginShape();
        pts.forEach(p=>vertex(...p));
        endShape(CLOSE);
    }

}

function renderGrid() {
    grid.forEach(r => r.forEach(a => a.render()));
    blendMode(HARD_LIGHT)
    light.background(bg.levels[0], bg.levels[1], bg.levels[2],0);
    grid.forEach(r => r.forEach(a => {if(random()>0.5) a.gRender(light)}));
    drawingContext.filter = "blur(10px);"
    blendMode(HARD_LIGHT);
    image(light,0,0,width,height);
}

class ASCII {
    constructor(i, j, code, col) {
        this.i = i; 
        this.j = j;
        this.code = code;
        this.char = String.fromCharCode(code);
        this.col = col;

        this.x = (i/size) * width;
        this.y = (j/size) * height;
        this.pos = [this.x, this.y];
    }

    render() {
        fill(this.col);
        stroke(this.col);
        // rect(this.x, this.y, size, size);
        text(this.char, this.x+(width/size)*0.25, this.y+(height/size)*0.75);
    }

    gRender(g) {
        g.fill(this.col);
        g.stroke(this.col);

        // rect(this.x, this.y, size, size);
        g.text(this.char, this.x+(width/size)*0.25, this.y+(height/size)*0.75);
    }
}