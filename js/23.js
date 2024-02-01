let cells = [];
let indices = [];
let sixtyfour = 64;
let p;

let capturer = new CCapture({ format: 'webm', framerate: 30 });
let complete = false;
let saved = false;

function setup() {

    createCanvas(500,500);
    frameRate(30)
    p = getPalette();
    pc = p.size;

    for(let i = 0; i < sixtyfour; i++) {
        cells.push([]);
        for(let j = 0; j < sixtyfour; j++) {
            if(random()>0.99) {
                cells[i].push(new Cell(i, j, floor(random()*pc)));
            } else {
                cells[i].push(null)
            }

            indices.push([i, j]);
        }
    }

    cells.forEach(r => r.forEach(c => {
        if(c != null) c.render();
    }));

    capturer.start();
    draw();
}

function getCellId(i, j) {
    if(i >= 0 && i < sixtyfour && j >= 0 && j < sixtyfour) {
        if(cells[i][j] != null) {
            return cells[i][j].id;
        }
    }
    return "null";
}

function copyCells() {
    let cellsCopy = [];
    for(let i = 0; i < cells.length; i++) {
        cellsCopy.push([])
        for(let j = 0; j < cells[i].length; j++) {
            cellsCopy[i] = [...cells[i]];
        }
    }
    return cellsCopy;
}

let ms;
let tenk = 10000;
let completionTime;

function draw() {
    background(color("#fcffe3"))

    ms = millis();

    cells.forEach(r => r.forEach(c => {
        if(c != null) c.render();
    }));

    let nextCells = copyCells();

    indices = shuffleArray(indices);
    indices.forEach(ij => {
        let i = ij[0];
        let j = ij[1];

        let freqs = {
            0: 0,
            1: 0,
            2: 0, 
            3: 0,
            4: 0,
        };

        let a = getCellId(i-1, j);
        if(a >= 0) freqs[a] += 1;
        let b = getCellId(i+1, j);
        if(b >= 0) freqs[b] += 1;
        let c = getCellId(i, j-1);
        if(c >= 0) freqs[c] += 1;
        let d = getCellId(i, j+1);
        if(d >= 0) freqs[d] += 1;

        // console.log(a, b, c, d, freqs);
        let maxId = [];
        for(let [id, freq] of Object.entries(freqs)) {
            if(freq > 0) {
                // console.log()
                if(maxId.length == 0 || freq > freqs[maxId[0]]) maxId = [id];
                else if (freq == freqs[maxId[0]]) maxId.push(id);
            }
        }

        // console.log(maxId)

        if(maxId.length > 0) {
            if(cells[i][j] == null && random() > 0.1) {
                nextCells[i][j] = new Cell(i, j, random(maxId));
            } else if (freqs[maxId] >= 3 || random() < 0.25) {
                nextCells[i][j] = new Cell(i, j, random(maxId));
            } 
                
            // if(random()>0.8) {
            //     nextCells[i][j] = new Cell(i, j, random(maxId));
            // }   
        }
    });

    cells = nextCells;

    // granulate(4)

    cap();
    check();
    
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

class Cell {
    constructor(i, j, id) {
        this.i = i;
        this.j = j;

        this.x = (i/sixtyfour)*width;
        this.y = (j/sixtyfour)*height;
        this.w = width/sixtyfour;
        this.h = height/sixtyfour;

        this.id = id;
        this.c = p.getCol(id);
    }

    render() {
        push();
        fill(this.c);
        stroke(this.c);
        strokeWeight(1.1)
        rect(this.x, this.y, this.w, this.h);
        pop();
    }
}