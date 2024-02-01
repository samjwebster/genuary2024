let p;
let bg;
let bgt;

var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint;

let capturer = new CCapture({ format: 'webm', framerate: 30 });
let complete = false;
let saved = false;
let ms;

var engine;
var world;
var box1;

let pendulums = [];

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    frameRate(60);

    engine = Engine.create();
    world = engine.world;

    p = getPalette();
    bg = lerpColor(random()>0.5?color(0):color(255), rc(), 0.2)
    background(bg);
    bgt = color(bg.levels[0], bg.levels[1], bg.levels[2], 0);


    // pendulums.push(new Pendulum(width/2, height/4, height/2, width/10, "circle", rc()));

    let pad = 0.0;
    let count = random(3, 20);

    let start = [width/2, height*pad];

    let step = 1/count;

    let size = (step*width/2)/2
    

    for(let i = 0; i < count; i++) {
        let t = i*step;

        let length = lerp(pad*height, (1-pad)*height, t);

        pendulums.push(new Pendulum(width/2, pad*height, length, size, "circle", rc()));
        // if(random() < 0.9) {
        //     pendulums.push(new Pendulum(width/2, pad*height, length, size, "circle", rc()));
        // } else {
        //     pendulums.push(new Pendulum(width/2, pad*height, length, size*2, "square", rc()));
        // }

        
    }

    // World.add(world, pen);

    // Matter.Runner.run(engine); 

    capturer.start();
    Engine.update(engine, delta=1);
    draw();
    // noLoop();
}

let repeats = 500;

function draw() {
    ms = millis();

    background(bg);

    pendulums.forEach(p => p.renderLine());
    pendulums.forEach(p => p.render());


    // granulateColor(10);
   
    // if(!repeats) noLoop();
    // repeats -= 1;
    Engine.update(engine, delta=16.666);

    cap();
    check();
}

function cap() {
    capturer.capture(document.getElementById('defaultCanvas0'));
}

function check() {
    if(!complete && ms >= 10000) {
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

    // console.log(ms)
}

function rc() {
    return p.getRandomCol();
}

class Pendulum {
    constructor(x,y,l,s,t,c) {
        this.x = x; // X position of pivot
        this.y = y; // Y Position of pivot
        this.l = l; // Length of string
        this.s = s; // Size of pendulum 
        this.t = t; // Type of pendulum

        this.c = c;

        this.maxHistory = 25;
        this.history = [];
        // this.c = c; // Color of pendulum
        // this.history = [];

        this.setup();

        

        // let pendulum;
        // if(this.t == "circle") {
        //     pendulum = Bodies.circle(this.x, this.y + this.l, this.s, {
        //         inertia: Infinity, restitution: 1, friction: 0, frictionAir: 0, slop: this.s * 0.02
        //     });
        // }


        // let pendulum = Bodies.circle(x, y + l, s, 
        //         { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 0, slop: s * 0.02 });

        // let anchor = {x: x, y: y};
        // let constraint = Matter.Constraint.create({pointA: anchor, bodyB: pendulum, length: s});

        // Composite.addBody(pendulumComp, pendulum);
        // Composite.addBody(pendulumComp, constraint);

        // this.composite = pendulumComp

        // return this.composite;

        // console.log(this.composite);
        // noLoop();


        // World.add(world, pendulumComp);
    }

    setup() {


        let lowPos = [this.x, this.y + this.l];
        let startA = lerp(-PI, 0, noise(this.x*0.02, (this.y + this.l)*0.02));


        // let startA = random()*-PI;
        let offX = cos(startA)*this.l;
        let offY = sin(startA)*this.l;

        let pendulum;
        if(this.t == "circle") {
            pendulum = Bodies.circle(this.x + offX, this.y + this.l + offY, this.s, 
                { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 0, slop: this.s * 0.02 });
        } else if (this.t == "square") {
            pendulum = Bodies.rectangle(this.x + offX, this.y + this.l + offY, this.s, this.s,
                { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 0, slop: this.s * 0.02 });
        }

        // let pendulum = Bodies.circle(this.x + offX, this.y + this.l + offY, this.s, 
        //     { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 0, slop: this.s * 0.02 });

        let anchor = {x: this.x, y: this.y};
        let constraint = Matter.Constraint.create({pointA: anchor, bodyB: pendulum, length: this.l});

        World.add(world, pendulum);
        World.add(world, constraint);

        this.pendulum = pendulum;
    }

    renderLine() {
        push();

        strokeWeight(2);
        stroke(lerpColor(this.c, bgt, 0.75));
        line(this.pendulum.position.x, this.pendulum.position.y, this.x, this.y);

        pop();
    }

    render() {
        if(this.t == "circle") {
            this.history.push([this.pendulum.position.x, this.pendulum.position.y]);
        } else if (this.t == "square") {
            this.history.push([this.pendulum.position.x, this.pendulum.position.y, this.pendulum.angle]);
        }
        

        while(this.history.length > this.maxHistory) {
            this.history.splice(0, 1);
        }


        push();
        rectMode(CENTER);



        let i;
        for(i = 0; i < this.history.length; i++) {


            let t = 1-(i/(this.history.length-1));
            let c = lerpColor(this.c, bgt, t);
            
            stroke(c);
            fill(c);

            push();

            if(this.t == "circle") {
                circle(...this.history[i], this.s*2);
            } else if (this.t == "square") {
                translate(this.history[i][0], this.history[i][1]);
                rotate(this.history[i][2]);
                rect(0,0,this.s, this.s);

                // beginShape();
                // this.history[i].forEach(p => vertex(...p));
                // endShape(CLOSE);
            }

            pop();
            
            
        }
    
        pop();


    }

}