function setup() {
    w = min(windowWidth, windowHeight);
    // createCanvas(w,w);
    createCanvas(500,500);

    setupUtil();
    noLoop();
}

function draw() {
    background(0);
    let p = getPalette();
}

