let p;
let fadeCol;
let cnv;

let foundation;
let cover;
let sites = [];
let siteRs = [];
let sitesNormalized = [];
let rNormalized = [];
let tls = [];

function setup() {
    cnv = createCanvas(1000, 1000);

    p = getPalette();
    fadeCol = color(0);

    foundation = createGraphics(width, height);
    cover = createGraphics(width, height);

    noLoop();
}

function draw() {
    background(p.getRandomCol());

    createDroste();
    recursiveDraw([0, 0], width, 0);

    

    border(random(0.01*width, 0.05*width), p.getRandomCol());

    granulateColor(8);
}

function border(size, col) {
    let m = new Mask([size, size], "rect", {"w": width-2*size, "h": height-2*size});
    let s = new Sheet(col, [m]);
    s.render();
}

function createDroste() {
    let viewCount = random([2, 3]);
    viewCount = 3;

    for(let i = 0; i < viewCount; i++) {
        voronoiSite(random()*width, random()*height, 255);
    }
    // viewCount = 1

    // svoronoiRndSites(viewCount, width/5);

    voronoi(width, height, false);
    // voronoiDraw(0, 0, true, false);


    let d = voronoiGetDiagram();
    let cells = d.cells;
    // let sites = [];
    // let siteRs = [];
    cells.forEach(c => {sites.push([c.site.x, c.site.y])});
    // console.log(d)

    aEdges = [];
    sEdges = [];

    function samePt(p1, p2) {
        return (p1[0] == p2[0] && p1[1] == p2[1])
    }

    function inEdges(edge) {
        let a = edge[0];
        let b = edge[1];
        for(let i = 0; i < aEdges.length; i++) {
            let e = aEdges[i];
            if(samePt(a, e[0]) && samePt(b, e[1])) return true;
            if(samePt(b, e[0]) && samePt(a, e[1])) return true;
        }
        return false;
    }

    for(let i = 0; i < viewCount; i++) {
        let c = cells[i];
        // console.log(c);
        let pts = [];
        c.halfedges.forEach(he => {
            let e1 = [he.edge.va.x, he.edge.va.y];
            let e2 = [he.edge.vb.x, he.edge.vb.y];
            // Curr pts (for polygon)
            if(!pts.includes(e1)) pts.push(e1);
            if(!pts.includes(e2)) pts.push(e2);
            
            // Edge
            if(inEdges([e1, e2])) { // If we've seen it before, it's shared
                sEdges.push([e1, e2]);
            } else {
                aEdges.push([e1, e2]);
            }
        });

        // Maybe sort points?
        shadowPolygon(pts, p.getRandomCol());

        let currSite = [c.site.x, c.site.y];
        // push();
        // fill('red');
        // circle(...currSite, 5);
        // pop();

        minDist = width;
        sites.forEach(s => {
            if(s[0] != currSite[0] && s[1] != currSite[1]) {
                let d = dist(...currSite, ...s);
                if(d < minDist) minDist = d;
            }
        });

        let siteR = random(minDist*0.75, minDist*0.9);
        siteRs.push(siteR);

        shadowCircle(currSite, siteR, width*0.01, p.getRandomCol());
    }
    sharedEdges(sEdges, width*0.01);

    foundation.push();
    foundation.erase();
    for(let i = 0; i < sites.length; i++) {
        let s = sites[i];
        let r = siteRs[i];
        // console.log(s)
        sitesNormalized.push([s[0]/width, s[1]/height]);
        rNormalized.push(r/width);

        tls.push([
            sitesNormalized[i][0] - rNormalized[i]/2, 
            sitesNormalized[i][1] - rNormalized[i]/2]
        );

        foundation.circle(...s, r);
    }
    foundation.pop();

    // sites.forEach(s => {
    //     sitesNormalized.push([s[0]/width, s[1]/height]);
    // });
}

function recursiveDraw(pos, size, depth) {
    if(depth == 8) return;

    // console.log(pos, size, depth);

    for(let i = 0; i < sites.length; i++) {
        let normR = rNormalized[i];
        
        let tl = tls[i];

        let newPos = [
            pos[0] + tl[0]*size,
            pos[1] + tl[1]*size,
        ]

        let newSize = normR*size;
        
        recursiveDraw(newPos, newSize, depth+1);   
    };
    
    // drawingContext.filter = "blur(" + depth/2 + "px)"
    // if(depth  < 2) return;
    image(foundation, ...pos, size, size);
    image(cover, ...pos, size, size);
}

class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
}

function shadowPolygon(pts, col) {
    foundation.push();
    foundation.noStroke();

    // shadow
    blurFilter = "blur(" + (width*0.05) + "px)";
    foundation.drawingContext.filter = blurFilter;
    foundation.fill(lerpColor(color(0), col, 0.1));
    foundation.beginShape();
    pts.forEach(p => foundation.vertex(...p));
    foundation.endShape(CLOSE);
    foundation.drawingContext.filter = "blur(0px)";

    // main
    foundation.fill(col);
    foundation.beginShape();
    pts.forEach(p => foundation.vertex(...p));
    foundation.endShape(CLOSE);

    foundation.pop();
}

function shadowCircle(pos, r, wgt, col) {
    cover.push();
    cover.noFill();
    cover.strokeWeight(wgt);

    // shadow
    blurFilter = "blur(" + (width*0.05) + "px)";
    cover.drawingContext.filter = blurFilter;
    cover.stroke(lerpColor(color(0), col, 0.1));
    cover.circle(...pos, r);
    cover.drawingContext.filter = "blur(0px)";

    // main
    cover.stroke(col);
    cover.circle(...pos, r);

    cover.pop();
}

function sharedEdges(edges, wgt) {

    cover.push();
    cover.noFill();
    cover.strokeWeight(wgt);
    let col = p.getRandomCol();

    // shadow
    edges.forEach(e => {
        blurFilter = "blur(" + (width*0.05) + "px)";
        cover.drawingContext.filter = blurFilter;
        cover.stroke(lerpColor(color(0), col, 0.1));
        cover.line(...e[0], ...e[1]);
        cover.drawingContext.filter = "blur(0px)";
    });

    // main
    edges.forEach(e => {
        cover.stroke(col);
        cover.line(...e[0], ...e[1]);
    })

    cover.pop();
}