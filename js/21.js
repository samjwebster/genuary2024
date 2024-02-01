let p;


let skyColA;
let skyColB;
let sunCol;
let groundCol;
let roadCol;

// function setup() {
//     let scale = 0.5;
//     let res = [1000*scale, 1000*scale]
//     cnv = createCanvas(...res, WEBGL);

//     translate(-width/2,-height/2)  
//     angleMode(DEGREES)

//     console.log(brush.box())

//     p = getPalette();

//     let cols = shuffleArray(p.colors);

//     skyColA = cols[0];
//     skyColB = cols[1];
//     sunCol = cols[2];
//     groundCol = cols[3];
//     roadCol = cols[4];


//     background(skyColB);
//     setupScene();

    
    

//     // granulate(6);


//     noLoop();
// }

const C = {
    loaded: false,
    prop() {return this.height/this.width},
    isLandscape() {return window.innerHeight <= window.innerWidth * this.prop()},
    resize () {
        if (this.isLandscape()) {
          console.log("yes")
            document.getElementById(this.css).style.height = "100%";
            document.getElementById(this.css).style.removeProperty('width');
        } else {
            document.getElementById(this.css).style.removeProperty('height');
            document.getElementById(this.css).style.width = "100%";
        }
    },
    setSize(w,h,p,css) {
        this.width = w, this.height = h, this.pD = p, this.css = css;
    },
    createCanvas() {
        this.main = createCanvas(this.width,this.height,WEBGL), pixelDensity(this.pD), this.main.id(this.css), this.resize();
    }
};
C.setSize(1000,1000,1,'mainCanvas')

// function windowResized () {
//     C.resize();
// }

let palette = ["#7b4800", "#002185", "#003c32", "#fcd300", "#ff2702", "#6b9404"]

function setup () {
    C.createCanvas();

    angleMode(DEGREES);
    background("#fffceb");
  
    translate(-width/2,-height/2);

    p = getPaletteByName("vibrant");

    let cols = shuffleArray(p.colors);

    skyColA = cols[0];
    skyColB = cols[1];
    sunCol = cols[2];
    groundCol = cols[3];
    roadCol = cols[4];
        
    brush.noField();
    brush.noStroke();
    brush.noHatch();

    setupScene();

    // brushRect(0,0,width/2,height/2,rc());

    nestedSquareThing();
}

function brushRect(x, y, w, h, c) {
    brush.fill(c, random(60,100));
    brush.bleed(random(0.05,0.2));
    brush.fillTexture(0.3,0.6);
    brush.rect(x, y, w, h);
}

function setupScene() {
    let hillHeight = random(0.25, 0.75)*height;
    hillHeight = height;
    // let sunPos = [random()*width, random(0, hillHeight)];
    // let sunR = random(0.025, 0.1)*width;

    let skyStripeSize = random(0.02, 0.05)*width;
    let skyStripeCount = floor(hillHeight/skyStripeSize)
    skyStripeSize = hillHeight/skyStripeCount;

    bars = [];

    for(let i = 0; i < skyStripeCount; i++) {
        let t = i/skyStripeCount;
        let y = lerp(0, hillHeight, t);
        let c = lerpColor(skyColA, skyColB, t);
        bars.push([y, c]);
    }

    // let lnum = (width*0.025/skyStripeSize);

    bars.forEach(b => {
        let y = b[0];
        let c = b[1];
        let p1 = [0, y];
        let p2 = [width, y];
        let p3 = [width, y+skyStripeSize];
        let p4 = [0, y+skyStripeSize];

        // let center = [
        //     (p1[0]+p2[0]+p3[0]+p4[0])/4,
        //     (p1[1]+p2[1]+p3[1]+p4[1])/4,
        // ];

        // // (width*0.025/skyStripeHeight)

        // // console.log(width*0.025/skyStripeSize);

        // p1 = [
        //     lerp(p1[0], center[0], 0.05),
        //     lerp(p1[1], center[1], lnum),
        // ];
        // p2 = [
        //     lerp(p2[0], center[0], 0.05),
        //     lerp(p2[1], center[1], lnum),
        // ];
        // p3 = [
        //     lerp(p3[0], center[0], 0.05),
        //     lerp(p3[1], center[1], lnum),
        // ];
        // p4 = [
        //     lerp(p4[0], center[0], 0.05),
        //     lerp(p4[1], center[1], lnum),
        // ];

        // p1 = lerpPos(p1, center, 0.1);
        // p2 = lerpPos(p2, center, 0.1);
        // p3 = lerpPos(p3, center, 0.1);
        // p4 = lerpPos(p4, center, 0.1);

        paintShape([p1, p2, p3, p4], c);
    });

    // paintCircle(sunPos, sunR, sunCol);



    // let hillCount = random(1, 10);
    // for(let i = 0; i < hillCount; i++) {
    //     let t = i/(hillCount-1);
    //     let y = lerp(hillHeight, height, t);



    // }

}


function nestedSquareThing() {
    let sCount = random(2, 10);
    // sCount = 3;
    let squares = [];

    let insideAny = (p) => {
        for(let i = 0; i < squares.length; i++) {
            let s = squares[i];
            if(s.contains(p, width*0.01)) {
                return true;
            }
        }
        return false;
    }

    for(let i = 0; i < sCount; i++) {
        let x = random()*width;
        let y = random()*height;

        if(insideAny([x, y])) {
            i -= 1;
            continue;
        }

        squares.push(new Square(x, y, 0));
    }

    for(let i = 0; i < sCount; i++) {
        let a = squares[i];

        let nearestIdx = null;
        let nearestD = Infinity;
        for(let j = 0; j < sCount; j++) {
            if(i != j) {
                let sb = squares[j];
                let d = dist(a.x, a.y, sb.x, sb.y);
                if(d < nearestD) {
                    nearestIdx = j;
                    nearestD = d;
                }
            }
        }


        let b = squares[nearestIdx];

        let xDiff = abs(a.x - b.x);
        let yDiff = abs(a.y - b.y);

        let diff = max(xDiff, yDiff);
        let size = diff*0.9;


        if(size > a.size) a.size = size;
        if(size < b.size) b.size = size;
    }

    squares.forEach(s => s.render());
}

class Square {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;

        this.nearest = -1;

        this.growing = true;
    }

    contains(p, pad) {
        return (
            p[0] >= this.x - pad && 
            p[0] <= this.x + this.size + pad &&
            p[1] >= this.y - pad && 
            p[1] <= this.y + this.size + pad
        );
    }

    render() {
        let s = this.size/2;
        let pts = [
            [this.x - s, this.y - s],
            [this.x + s, this.y - s],
            [this.x + s, this.y + s],
            [this.x - s, this.y + s],
        ]
        let c = random([sunCol, groundCol, roadCol]);

        paintShape(pts, c);

        // push();
        // fill('red');
        // stroke(0);
        // rectMode(CENTER);
        // rect(this.x, this.y, this.size, this.size);
        // pop();
    }
}


function rc() {
    return p.getRandomCol();
}

// function rcn(n) {
//     p.colors = shuffleArray(p.colors);
//     let cs = [];
//     for(let i = 0; i < n; i++) {
//         if(n < p.colors.length) {
//             cs.push(p.getCol(i));
//         } else {
//             break;
//         }
//     }
//     return cs;
// }

function resetBrush() {
    brush.noStroke();
    brush.noFill();
    brush.noHatch();
}

function paintShape(pts, c) {
    resetBrush();
    brush.fill(c, random(60,100));
    brush.bleed(random(0.05,0.2));
    brush.fillTexture(0.3,0.6);

    brush.beginShape();
    fillPts(pts, (width*random(0.05, 0.2))).forEach(p => brush.vertex(...p));
    brush.endShape(CLOSE);
}

function paintCircle(pos, r, c) {
    // resetBrush();
    brush.fill(c, 100);
    brush.bleed(random(0.05,0.2));
    brush.fillTexture(0.3,0.6);
    brush.circle(pos[0], pos[1], r, true);

    // push();
    // noFill();
    // stroke(0);
    // circle(...pos, r);
    // pop();
}

function fillPts(pts, d=2) {
    newPts = [];
    for(let i = 0; i < pts.length-1; i++) {
        let a = pts[i];
        let b = pts[i+1];
        let dAB = dist(...a, ...b);
        let ct = dAB/d;
        for(let j = 0; j < ct; j++) {
            let t = j/(ct);
            let p = lerpPos(a, b, t);
            newPts.push(p);
        }
    }
    newPts.push(pts[pts.length-1]);
    
    return newPts;
}