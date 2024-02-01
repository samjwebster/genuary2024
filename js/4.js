let p;
let cnv;

let pix = [];
let resolution;

function setup() {
    createCanvas(1000, 1000);
    noLoop();
    p = getPalette();

    resolution = 32;
    for(let i = 0; i < resolution; i++) {
        pix.push([]);
        for(let j = 0; j < resolution; j++) {
            pix[i].push(
                new Pixel(i, j, color(
                    (i/resolution)*255,
                    (j/resolution)*255,
                    ((i+j)/(2*resolution))*255,
            )));
        }
    }

    background(0);

    let g = createComposition();

    sampleGraphic(g);
    renderpix();

    granulateColor(10);

    
}

function renderpix() {
    pix.forEach(row => {
        row.forEach(p => p.render());
    });
}

class Pixel {
    constructor(i, j, col) {
        this.i = i;
        this.j = j;
        this.col = col;

        this.x = (i/resolution) * width;
        this.y = (j/resolution) * height;
        this.pos = [this.x, this.y];

        this.w = width/resolution;
        this.h = height/resolution;
    }

    setCol(col) {
        this.col = col;
    }

    render() {
        push();
        stroke(0);
        strokeWeight(width*0.005);
        noStroke();

        let levels = this.col.levels;
        let step = this.w/3;

        // R
        fill(levels[0], 0, 0);
        lcdRect([this.x, this.y], step);

        // G
        fill(0, levels[1], 0);
        lcdRect([this.x+step, this.y], step);

        // B
        fill(0, 0, levels[2]);
        // rect(this.x + 2*step, this.y, step, this.h);
        lcdRect([this.x+2*step, this.y], step);
        pop();
    }
}

function lcdRect(tl, step) {
    circle(tl[0]+step/2, tl[1]+step/2, step);
    rect(tl[0], tl[1]+step/2, step, 2*step);
    circle(tl[0]+step/2, tl[1]+(2*step)+step/2, step);
}

function sampleGraphic(g) {
    for(let i = 0; i < resolution; i++) {
        pix.push([]);
        for(let j = 0; j < resolution; j++) {
            let x = (i/resolution) * width;
            let y = (j/resolution) * height;
            pix[i][j].setCol(color(...g.get(x, y)));
        }
    }
    return;
}

function createComposition() {
    let g = createGraphics(width, height);

    g.background(rc());
    g.noStroke();
    // g.drawingContext.filter = "blur(10px)"
    for(let i = 0; i < 50; i++) {
        if(random() > 0.5) {
            g.noStroke();
            g.fill(rc());
            g.circle(random()*width, random()*height, random()*width/2);
        } else {
            g.noFill();
            g.strokeWeight(random(0.05, 0.1)*width);
            g.stroke(rc());
            let options = shuffleArray([0, 1, 2, 3]);
            let choices = [options[0], options[1]];
            let pts = [];
            choices.forEach(c => {
                if(c == 0)       pts.push([0, random()*height]);
                else if (c == 1) pts.push([width, random()*height]);
                else if (c == 2) pts.push([random()*width, 0]);
                else if (c == 3) pts.push([random()*width, height]);
            });
            g.line(...pts[0], ...pts[1]);
        }
    }
    g.drawingContext.filter = "blur(0px)"

    return g;
}

function rc() {
    return p.getRandomCol();
}