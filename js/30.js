let p;
let bg;
let shapeCol;

let sdfs = [];

let anchors = [];
let cells = [];

let isovalue = 0;

let capturer = new CCapture({ format: 'webm', framerate: 30 });
let complete = false;
let saved = false;
let ms;
let tenk = 10000;

function getShaders() {
    let vs = `
        precision highp float;

        attribute vec3 aPosition;
        attribute vec2 aTexCoord;

        varying vec2 vTexCoord;

        void main() {
            vTexCoord = aTexCoord;
            vec4 positionVec4 = vec4(aPosition, 1.0);
            positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
            gl_Position = positionVec4;
        }
    `;

    let fs = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        
        #define TWO_PI 6.28318530718
        
        varying vec2 vTexCoord;
        
        uniform vec2 resolution;
        uniform vec2 mouse;
        uniform float t;
        uniform float noise;

        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 color4;
        uniform vec3 color5;
        
        uniform int count;
        const int max_count = 100;
        uniform vec2 points[max_count];
        
        float rand(vec2 co) {
            float v1 = cos(co.x * 1032.31 / co.y + 123903.2);
            float v2 = cos(v1 * 1023.201202 + co.y * 1023.2301021);
            return fract(v1 + v2);
        }
        
        float sinn(float v) {
            return sin(v * TWO_PI) * 0.5 + 0.5;
        }
        
        vec2 getCo() {
            vec2 dimVec = resolution.x > resolution.y 
            ? vec2(resolution.x / resolution.y, 1.) 
            : vec2(1., resolution.y / resolution.x);
            
            vec2 co = vTexCoord; // view space coordinates
            co *= dimVec; // fit square coordinates inside rectangular view
            co -= (dimVec - 1.) * 0.5; // center coordinates
            
            return co;
        }
        
        void main (void) {  
            vec2 co = getCo();
            
            vec2 mCo = mouse / resolution;
            
            vec3 col = vec3(0);
            
            float closestDist = length(vec2(1));
            int index = 0;
            for (int i=0; i<max_count; i++) {
                if (i >= count)
                    break;
                
                vec2 pos = points[i];
                float dist = length(pos - co);
                if (dist < closestDist) {
                    closestDist = dist;
                    index = i;
                }
            }

            int size = 5; // Size of the colors array
            int remainder = index - (index / size) * size;

            if(remainder == 0) {
                col = color1;
            } else if(remainder == 1) {
                col = color2;
            } else if(remainder == 2) {
                col = color3;
            } else if(remainder == 3) {
                col = color4;
            } else if(remainder == 4) {
                col = color5;
            } else {
                col = color1;
            }

            gl_FragColor = vec4(col, 1);
        }
    `;

    return [vs, fs];
}

let myShader;

function setup() {
    createCanvas(2000,2000, WEBGL);
    pixelDensity(1);
    frameRate(30);

    createPoints();

    myShader = createShader(...getShaders());
    shader(myShader);
    noStroke();
    

    let p = getPalette();

    let levelsArr = [
        p.get(0).levels,
        p.get(1).levels,
        p.get(2).levels,
        p.get(3).levels,
        p.get(4).levels,
    ];


    for(let i = 0; i < levelsArr.length; i++) {
        let l = levelsArr[i];
        levelsArr[i] = [l[0]/255,l[1]/255,l[2]/255];
    }

    myShader.setUniform("color1", levelsArr[0]);
    myShader.setUniform("color2", levelsArr[1]);
    myShader.setUniform("color3", levelsArr[2]);
    myShader.setUniform("color4", levelsArr[3]);
    myShader.setUniform("color5", levelsArr[4]);

    capturer.start();
    draw();
}

let currTime = 0;
let msIncrement = 33.333;


function draw() {

    ms = currTime;

    t = fract(currTime / LOOP_LENGTH);

    currTime += msIncrement;

    scene(t)

    // plane(width, height);

    cap();
    check();
}

function scene(t) {
    const pts = points.map(
      ({x, y}) => [
        invCosn(x + t), // x position
        invCosn(y + t)  // y position
      ]
    ).flat();
  
    myShader.setUniform("points", pts);
    myShader.setUniform("count", COUNT);
  
    myShader.setUniform("t", t);
    myShader.setUniform("resolution", [width, height]);
    myShader.setUniform("mouse", [mouseX, height - mouseY]);
  
    shader(myShader);
    rect(0,0,width,height);
  }
  
  // inverted normalized cos function (normalized phase and amplitude between 0 - 1)
  function invCosn(v) {
    return 1 - (cos(v * TWO_PI) * 0.5 + 0.5);
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

let COUNT = 25;
let LOOP_LENGTH = 50000;
let MOUSE_X_TIME = false;

let points
function createPoints() {
  points = new Array(COUNT).fill().map((_,i) => 
    createVector(random(), random())
 );
}
