let p, s;
function setup() {
    createCanvas(500, 500);
    p = genCompPalette();


    background(p.getRandomCol());

    noLoop();
}

function draw() {
    newIdea();

    if(random() > 0.75) {
        blendMode(random([DODGE, SOFT_LIGHT, BURN]));
        newIdea();
    }
    
    blendMode(BLEND);
    border(random(0.01*width, 0.05*width), p.getRandomCol());
    granulateColor(8);
}

function newIdea() {
    noFill();

    let dir = false
    if(random() > 0.5) dir = true;

    let size = width*0.05;
    let step = width/size;

    strokeWeight(size/random(1, 2));
    strokeCap(random([SQUARE, PROJECT]));

    let d = random(0.005, 0.05)

    for(let x = -width; x < width; x += size) {
        for(let y = -0.1*height; y < height*1.1; y += size) {
            

            let n = noise(x*d, y*d);

            let col = p.getCol(floor(lerp(0, 6, n)));
            stroke(col);

            let top, bot;
            if(dir) {
                top = [x, y];
                bot = [x+step, y+step]
            } else {
                top = [x + step, y];
                bot = [x, y+step]
            }
            line(...top, ...bot);
        }
    }
}

function border(size, col) {
    let m = new Mask([size, size], "rect", {"w": width-2*size, "h": height-2*size});
    let s = new Sheet(col, [m]);
    s.render();
}

// Complimentary color palette bank
function genCompPalette() {
    push();
    colorMode(HSB);

    let s = random(40, 75);
    let b = random(40, 75);

    let h1 = random(0, 360);
    let h2 = (h1 + 180)%360;

    let c1 = color(h1, s, b);
    let c2 = color(h2, s, b);

    colors = [c1, c2];
    [h1, h2].forEach(h => {
        let cBlack = color(h, s, lerp(b, 255, 0.15));
        let cWhite = color(h, s, lerp(0, b, 0.85));

        colors.push(cBlack);
        colors.push(cWhite);
    }); 

    pop();
    return new Palette("gen", 1, colors);
    
}

function keyPressed() {
    if(keyCode == 83) {
        saveCanvas();
    }
}