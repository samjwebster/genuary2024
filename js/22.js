let p;
let bgc;
let bgt;
let cols;

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    p = getPalette();

    cols = p.colors.slice();

    let sortByValue = (a, b) => {
        let ba = (a.levels[0] + a.levels[1] + a.levels[2])/3;
        let bb = (b.levels[0] + b.levels[1] + b.levels[2])/3;
        return bb - ba;
    }
    cols.sort(sortByValue);

    if(random()>0.5) cols = cols.reverse();

    bgc = lerpColor(rc(), random()>0.5?color(0):color(255), 0.25);
    bgt = color(bgc.levels[0], bgc.levels[1], bgc.levels[2], 0);

    background(bgc);

    // let c = new Circle(width/2, height/2, width/3, rc());
    // c.render();

    compose();

    noLoop();
}

function rc() {
    return p.getRandomCol();
}

function rct(n) {
    let c = rc();
    let t = color(c.levels[0], c.levels[1], c.levels[2], 0);
    return lerpColor(c, t, n);
}

function compose() {
    // create the pic

    let bigR = width/2.1;

    let bigC = new Circle(width/2, height/2, bigR, rc(), random(["none", "empty", "dot"]));

    bigC.render();

    let innerCt = random(2, 10);
    let rRange = [width/10, width/5];

    let innerCircs = [];
    for(let i = 0; i < innerCt; i++) {
        let x = 0;
        let y = 0;
        let r = width;
        while(!bigC.containsCircle(x, y, r)) {
            x = random()*width;
            y = random()*height;
            r = random(...rRange);
        }


        // let x = bigC.x + cos(a)*ar;
        // let y = bigC.y + sin(a)*ar;

        innerCircs.push(new Circle(x, y, r, rc(), random(["empty", "dot"])));
    }

    let sortCircs = (a,b) => {
        let typeScores = {
            "none": 0,
            "empty": 2, 
            "dot": 1,
        }

        let aScore = typeScores[a.t];
        let bScore = typeScores[b.t];

        return aScore - bScore;
    }

    innerCircs.sort(sortCircs);

    innerCircs.forEach(ic => ic.render());


    let lines = [];
    for(let i = 0; i < random(2, 10); i++) {
        let start = random()*TAU;
        let end = ((start + PI/5) + random()*TAU)%TAU;
        let a = [bigC.x + cos(start)*bigR, bigC.y + sin(start)*bigR];
        let b = [bigC.x + cos(end)*bigR, bigC.y + sin(end)*bigR];
        lines.push(new Line(a, b, rc()));
    }

    lines.forEach(l => l.render());

    // bigC.t = "empty";
    // bigC.render("noFill");
    // console.log(bigC.innerPts)

    // console.log(bigC.pts.length)

    noStroke();
    fill(bgc);
    beginShape();
    vertex(0,0);
    vertex(width, 0);
    vertex(width, height);
    vertex(0, height);
    beginContour();
    bigC.pts.reverse().forEach(p => vertex(...p));
    endContour();
    endShape(CLOSE);

    granulate(8)

}

class Line {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;

        this.pts = computeLinePts(a, b, random(0.05, 0.1)*width, random(0.001, 0.004));
    }

    render() {
        push();
        fill(this.c);
        beginShape();
        this.pts.forEach(p => vertex(...p));
        endShape(CLOSE);
        pop();
    }
}

class Circle {
    constructor(x, y, r, c, t) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
        this.t = t;

        this.ns = random(0.001, 0.004);
        this.pts = computeCirclePts(x, y, r, this.ns);

        let goalSize = 0.03*width;
        let amt = goalSize/this.r;
        this.innerPts = computeCirclePts(x, y, r*(1-amt), this.ns);


        this.cDot = rct(random(0.5, 0.75));

    }

    render(msg=null) {
        noStroke();
        fill(this.c);

        beginShape();
        this.pts.forEach(p => vertex(...p));
        if(this.t == "empty" || this.t == "dot") {
            beginContour();
            this.innerPts.reverse().forEach(p => vertex(...p));
            endContour();
        }
        endShape();

        if(this.t == "dot" && msg != "noFill") {
            fill(this.cDot);
            beginShape();
            this.innerPts.forEach(p => vertex(...p));
            endShape();
        }

    }

    containsCircle(x, y, r) {
        let d = dist(this.x, this.y, x, y);
        return d + r <= this.r;
    }
}


function computeCirclePts(x, y, r, ns) {
    let circ = TAU*r;
    let ct = floor(circ/(width*0.005));

    // let ns = random(0.001, 0.008);
    let nOff = random()*TAU;
    let nStrength = width*random(0.005, 0.015);

    let getNoisePt = (p) => {
        let na = (nOff + (TAU*noise(p[0]*ns, p[1]*ns)))%TAU;
        p[0] += cos(na)*nStrength;
        p[1] += sin(na)*nStrength;
        return p;
    }

    let pts = [];
    for(let i = 0; i < ct; i++) {
        t = i/ct;
        a = TAU*t;
        let cx = x + r*cos(a);
        let cy = y + r*sin(a);

        pts.push(getNoisePt([cx, cy]));
    }

    return pts;
}

function computeLinePts(a, b, s, ns) {
    let d = dist(...a, ...b);
    let ct = floor(d/(width*0.005));
    
    let nOff = random()*TAU;
    let nStrength = width*random(0.005, 0.015);

    let getNoisePt = (p) => {
        let na = (nOff + (TAU*noise(p[0]*ns, p[1]*ns)))%TAU;
        p[0] += cos(na)*nStrength;
        p[1] += sin(na)*nStrength;
        return p;
    }

    let ptsL = [];
    let ptsR = [];
    for(let i = 0; i < ct; i++) {
        let t = i/(ct-1);
        let c = lerpPos(a, b, t);

        let ts = spikeFunction(t);

        if(ts != 0 && i < (ct-1)) {
            let next = lerpPos(a, b, (i+1)/(ct-1));
            let dir = p5.Vector.sub(createVector(...next), createVector(...c)).normalize().rotate(-PI/4);
            ptsL.push(getNoisePt(
                [c[0] + ts*(dir.x*(s/2)), c[1] + ts*(dir.y*(s/2))]
            ));
            dir.rotate(PI);
            ptsR.push(getNoisePt(
                [c[0] + ts*(dir.x*(s/2)), c[1] + ts*(dir.y*(s/2))]
            ));
        } else {
            let np = getNoisePt(c);
            ptsL.push(np);
            ptsR.push(np);
        }
    }

    return [...ptsL, ...(ptsR.reverse())];
}

function spikeFunction(t) {
    if(t < 0 || t > 1) return 0;

    if(t < 0.5) {
        return 1-(1-(t*2))**3;
    } else if (t == 0.5) {
        return 1;
    } else if (t > 0.5) {
        t = t-0.5;
        return 1-(1-(1-(t*2)))**3;
    }
    return 0;
}