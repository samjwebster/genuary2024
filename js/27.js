let p;
let bg;

let nThresh = 0.75;
let ns = 0.01;
let nStr;

let skyCol;
let groundCol;
let bushOuter;
let bushInner;


function setup() {

    createCanvas(1000,1000);
    // image(im, 0, 0, width, height);

    nStr = width*0.005;

    let beige = color("#F5F5DC");

    p = getPalette();

    // for(let i = 0; i < p.size; i++) {
    //     p.colors[i] = lerpColor(p.colors[i], beige, 0.2);
    // }    

    p.colors = shuffleArray(p.colors);


    bg = p.getCol(0);
    skyCol = p.getCol(1);
    groundCol = p.getCol(2);
    bushOuter = p.getCol(3);
    bushInner = p.getCol(4);
    
    noLoop();
}

function rc() {
    return p.getRandomCol();
}

function resetN() {
    nThresh = 0.75;
    ns = 0.01;
    nStr = width*0.005;
}

function draw() {
    background(bg);

    // let sCol = rc();

    noStroke();
    fill(skyCol);

    nThresh = 0.75;
    ns = 0.01;
    nStr = width*0.005;

    let bandCt = round(random(20, 80));
    let skyBands = [];
    nThresh = random(0.35,0.65);
    ns = random(0.002, 0.01);
    for(let i = 0; i < bandCt; i++) {
        let y = height*(i/(bandCt-1));
        let a = [0, y];
        let b = [width, y];
        skyBands.push(dotLine(a, b));
    }

    nStr = random(0.02, 0.20)*width;
    ns = 0;
    nThresh = 0;

    let sunPos = [
        random()*width,
        random()*height,
    ];

    let sunPts = dotCircle(sunPos, random(0.03, 0.20)*width, false);


    fill(skyCol);
    
    beginShape();
    sunPts.forEach(p => vertex(...p));
    endShape(CLOSE);

    fill(bg);
    sunPts.forEach(p => {
        let r = random(width*0.002, width*0.005);
        circle(...p, r)
    });

    

    

    nStr = random(0.01, 0.05)*width;
    nThresh = 0.75

    for(let i = 0; i < random()*20; i++) {
        let cloudPos = [
            random()*width, random()*height
        ];

        let bushR = random(width*0.01, width*0.2);
        let bushCt = floor(random(1, 5));
        let layers = [];

        for(let i = 0; i < bushCt; i++) {
            let t = i/(bushCt);
            let currR = lerp(0, bushR, 1-t);

            let pts = dotCircle(cloudPos, currR, false);
            layers.push(pts);
        }

        layers.forEach(l => {
            fill(bg);
            
            beginShape();
            l.forEach(p => vertex(...p));
            endShape(CLOSE);

            fill(skyCol);
            l.forEach(p => {
                let r = random(width*0.002, width*0.005);
                circle(...p, r)
            });

        });
    }

    resetN();

    ns = random(0.0001, 0.0025);
    nStr = width*random(0.025, 0.1);

    let hy = random(0.33, 0.80)*height
    // let horizon = dotLine([0,hy], [width,hy], true);

    let groundLines = [];
    let ct = round(random(10, 60));
    for(let i = 0; i < ct; i++) {
        let y = lerp(hy, height*1.1, i/(ct-1));
        let a = [0,y];
        let b = [width,y];
        groundLines.push(dotLine(a, b, false));
    }

    // Clear sky bands to empty ground area
    noStroke();
    fill(bg);
    beginShape();
    vertex(0,hy);
    groundLines[0].forEach(p => vertex(...p));
    vertex(width,hy);
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);

    sCol = rc();
    bushCol = rc();

    resetN();
    ns = random(0.001, 0.0025);
    nStr = width*random(0.005, 0.05);

    fill(sCol);

    bushThresh = random(0.5, 0.75);
    groundLines.forEach(gl => {

        if(random() > bushThresh) {
            let bushPos = random(gl);

            let bushR = random(width*0.01, width*0.2);
            let bushCt = floor(random(1, 10));
            let layers = [];

            for(let i = 0; i < bushCt; i++) {
                let t = i/(bushCt);
                let currR = lerp(0, bushR, 1-t);

                let pts = dotCircle(bushPos, currR, false);
                layers.push(pts);
            }

            layers.forEach(l => {
                fill(bushInner);
                
                beginShape();
                l.forEach(p => vertex(...p));
                endShape(CLOSE);

                fill(bushOuter);
                l.forEach(p => {
                    let r = random(width*0.002, width*0.005);
                    circle(...p, r)
                });

            });

        }


        fill(bg);
        
        beginShape();
        gl.forEach(p => vertex(...p));
        vertex(width, height);
        vertex(0, height);
        endShape(CLOSE);

        fill(groundCol);
        gl.forEach(p => {
            let r = random(width*0.002, width*0.005);
            circle(...p, r)
        });
    });

    granulate(8);
    





    // dotLine([0, height/2], [width, height/2]);

    // dotCircle([width/2, height/2], width/4);

    
    
    
    
}

function dotLine(a,b, render = true) {
    let d = floor(dist(...a, ...b));
    let aOff = random()*TAU;
    let pts = [];

    for(let i = 0; i < d; i++) {
        let t = i/(d-1);
        let p = lerpPos(a, b, t);

        let n = noise(p[0]*ns, p[1]*ns);
        if(n > nThresh) continue;

        // na = (TAU*n)+aOff;
        // p[0] += cos(na)*nStr;
        // p[1] += sin(na)*nStr;

        let yDiff = lerp(-1*nStr, nStr, n);
        p[1] += yDiff;

        let r = random(width*0.002, width*0.005);
        if(render) circle(...p, r);
        pts.push(p);
    }
    return pts;
}

function dotCircle(pt, r, render=true) {
    let d = floor(TAU*r);
    let aOff = random()*TAU;
    let pts = [];
    for(let i = 0; i < d; i++) {
        let t = i/(d);
        let a = (TAU*t)+aOff;

        let p = [
            pt[0] + cos(a)*r,
            pt[1] + sin(a)*r,
        ];

        let n = noise(p[0]*ns, p[1]*ns);
        if(n > nThresh) continue;

        na = (TAU*n)+aOff;
        p[0] += cos(na)*nStr;
        p[1] += sin(na)*nStr;

        let nr = random(width*0.002, width*0.005);
        if(render) circle(...p, nr);
        pts.push(p);
    }
    return pts;
}
