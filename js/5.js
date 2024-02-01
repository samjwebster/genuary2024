let cnv;
let grid = [];
let res = 20;
let gl;
let minLevel = 100;
let maxLevel = -100;

let levels = {};

function setup() {
    cnv = createCanvas(1000, 1000);
    noLoop();

    res = floor(random(20, 30));

    setupGrid();
    gl = setupGuideLine();

    sectionGrid();
}

function draw() {
    // background(220);
    
    renderGrid();
    
    granulate(10);
}

function setupGrid() {
    for(let i = 0; i < res; i++) {
        grid.push([]);
        for(let j = 0; j < res; j++) {
            grid[i].push(new Square(i, j, -1));
        }
    }
}

function setupGuideLine() {
    let c = random([0, 1, 2, 3]);
    let p;
    if(c == 0)       p = [0, random()*height];
    else if (c == 1) p = [width, random()*height];
    else if (c == 2) p = [random()*width, 0];
    else if (c == 3) p = [random()*width, height];

    let center = [width/2, height/2];
    let vec = createVector(center[0] - p[0], center[1] - p[1]).normalize();

    let start = p;
    let end = [p[0] + 2*width*vec.x, p[1] + 2*height*vec.y];
    let seg = [...start, ...end];

    let xOption, yOption;
    if(vec.x < 0) xOption = [0, 0, 0, height];
    else xOption = [width, 0, width, height];
    if(vec.y < 0) yOption = [0, 0, width, 0];
    else yOption = [0, height, width, height];
    
    let xInt = line_intersect(...seg, ...xOption);
    let yInt = line_intersect(...seg, ...yOption);

    let target;
    if(xInt == null && yInt == null) {
        console.log("Error, vec doesn't meet reach any edge");
        return;
    }

    if(xInt == null && yInt != null) {
        target = [yInt.x, yInt.y];
    } else if (yInt == null && xInt != null) {
        target = [xInt.x, xInt.y];
    } else if (xInt != null && yInt != null) {
        let xDist = dist(...start, xInt.x, xInt.y);
        let yDist = dist(...start, yInt.x, yInt.y);
        if(xDist < yDist) target = [xInt.x, xInt.y];
        else target = [yInt.x, yInt.y];
    }

    return new GuideLine(vec, start, target, round(random(4, 10)));
}

class GuideLine {
    constructor(vec, start, end, count) {
        this.vec = vec;
        this.start = start;
        this.end = end;
        this.count = count;

        this.norm = p5.Vector.rotate(this.vec, PI/2);
    }

    render() {
        push();
        stroke(0);
        strokeWeight(2);
        line(...this.start, ...this.end);

        fill('blue');
        for(let i = 0; i < this.count; i++) {
            let t = i/(this.count-1);
            let pos = lerpPos(this.start, this.end, t);
            fill(lerpColor(color('green'), color('red'), t));
            circle(...pos, 10);
        }
        pop();
    }
}

function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1),
        seg1: ua >= 0 && ua <= 1,
        seg2: ub >= 0 && ub <= 1
    };
}

function sectionGrid() {

    for(let i = 0; i < gl.count; i++) {
        let t = i/(gl.count - 1);

        let pt = lerpPos(gl.start, gl.end, t);
        let stepX = (width/res)*gl.norm.x;
        let stepY = (height/res)*gl.norm.y;

        while(isOnCanvas(pt)) {
            let idx = getIdx(pt);
            let ix = idx[0];
            let jx = idx[1];
            grid[ix][jx].level = i;

            pt[0] += stepX;
            pt[1] += stepY;
        }

        pt = lerpPos(gl.start, gl.end, t);

        while(isOnCanvas(pt)) {
            let idx = getIdx(pt);
            let ix = idx[0];
            let jx = idx[1];
            grid[ix][jx].level = i;

            pt[0] -= stepX;
            pt[1] -= stepY;
        }
    }

    let incomplete = true;
    while(incomplete) {
        for(let i = 0; i < res; i++) {
            for(let j = 0; j < res; j++) {
                let curr = grid[i][j];
                if(curr.level != -1) continue;

                let ns = curr.neighbors;
                let options = []
                ns.forEach(n => {
                    let nx = grid[n[0]][n[1]];
                    if(nx.level != -1) options.push(nx.level);
                });

                if(options.length > 0) curr.stage(random(options));
            }
        }

        incomplete = false;
        for(let i = 0; i < res; i++) {
            for(let j = 0; j < res; j++) {
                let curr = grid[i][j];
                curr.update();
                if(curr.level == -1) incomplete = true;
            }
        }
    }

    for(let i = 0; i < res; i++) {
        for(let j = 0; j < res; j++) {
            let c = grid[i][j];
            if(random() > 0.93) c.level += random([1, -1]);

            if(c.level > maxLevel) maxLevel = c.level;
            if(c.level < minLevel) minLevel = c.level;
        }
    }

    for(let i = minLevel; i <= maxLevel; i++) {
        levels[i] = [];
    }

    for(let i = 0; i < res; i++) {
        for(let j = 0; j < res; j++) {
            let c = grid[i][j];
            levels[c.level].push(c);
        }
    }
}

function isOnCanvas(pt) {
    return pt[0] >= 0 && pt[0] < width && pt[1] >= 0 && pt[1] < height;
}

function getIdx(pt) {
    let i = floor((pt[0]/width) * res);
    let j = floor((pt[1]/height) * res);
    return [i, j];
}


function renderGrid() {
    for(let i = minLevel; i <= maxLevel; i++) {
        drawingContext.filter = "blur(" + floor(width*0.01) + "px)"
        levels[i].forEach(s => s.renderShadow());
        drawingContext.filter = "blur(0px)"

        levels[i].forEach(s => s.render());
    }
}

class Square {
    constructor(i, j, level) {
        this.i = i;
        this.j = j;
        this.level = level;

        this.neighbors = [];

        if(i > 0 && j > 0) this.neighbors.push([i-1, j-1]);
        if(i > 0) this.neighbors.push([i-1, j]);
        if(i > 0 && j < res-1) this.neighbors.push([i-1, j+1]);
        if(j < res-1) this.neighbors.push([i, j+1]);
        if(i < res-1 && j < res-1) this.neighbors.push([i+1, j+1]);
        if(i < res-1) this.neighbors.push([i+1, j]);
        if(i < res-1 && j > 0) this.neighbors.push([i+1, j-1]);
        if(j > 0) this.neighbors.push([i, j-1]);

        this.x = (i/res) * width;
        this.y = (j/res) * height;
        this.pos = [this.x, this.y];

        this.w = width/res;
        this.h = height/res;

        this.stageLevel = null;

        let maxOff = this.w*0.1;
        let tl = [this.x - random()*maxOff, this.y - random()*maxOff];
        let tr = [this.x + this.w + random()*maxOff, this.y - random()*maxOff];
        let br = [this.x + this.w + random()*maxOff, this.y + this.h + random()*maxOff];
        let bl = [this.x - random()*maxOff, this.y + this.h + random()*maxOff];
        this.pts = [tl, tr, br, bl];

    }

    renderShadow() {
        push();
        noStroke();
        fill(0);

        beginShape();
        this.pts.forEach(p => vertex(...p));
        endShape(CLOSE);

        pop();
    }

    render() {
        push();
        noStroke();
        fill(getCol(this.level));

        beginShape();
        this.pts.forEach(p => vertex(...p));
        endShape(CLOSE);

        pop();
    }

    stage(level) {
        this.stageLevel = level;
    }
    
    update() {
        if(this.stageLevel != null) this.level = this.stageLevel;
        this.stageLevel = null;
    }

}


function getCol(level) {
    return color(map(level, minLevel, maxLevel, 200, 240));
}