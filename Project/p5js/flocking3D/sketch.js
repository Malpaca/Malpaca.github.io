let length = 5000;
let width = 5000;
let height = 2000;

let flock = [];
let walls = [];
fcount = 0;
let framerateP;
let withQuadTree;

angleX = 0;
angleY = 1.1;
xOffset = 0;
yOffset = 0;

// let bird;

// function preload() {
//   bird = loadModel('assets/bird.obj');
// }

function setup() {
    frameRate(120);
    createCanvas(1280, 720, WEBGL);
    // ortho(-length, length, width, -width/2, 0.1, 100);
    for (let i = 0; i < 100; i++) {
        flock.push(new Particle());
    }
    // noLoop();
    framerateP = createP('framerate: ');
    withQuadTree = createCheckbox('using quadtree');
    withQuadTree.checked(true);
}

// function draw(){
//   let dirY = (mouseY / width - 0.5) *2;
//   let dirX = (mouseX / length - 0.5) *2;
//   // directionalLight(250, 250, 250, dirX, -dirY, 0.25);
//   // ambientLight(100);
//   // pointLight(250, 250, 250, 100, 100, 0);
//   ambientMaterial(255, 0 , 0);
//   cone(100, 100 * 2.5, 24, 16, true);
// }

function draw() {
    // setGradient(340, 0, 20, 80, color(255,0,0), color(0,0,255));
    background_setup();

    let boundary = new Rectangle(0, 0, 0, length / 2, width / 2, height / 2);
    qtree = new QuadTree(boundary, 4);
    // qtree = new QuadTree(boundary, floor(min(1280 / flock.length, 720 / flock.length)));
    for (let p of flock) {
        let point = new Point(p.position.x, p.position.y, p.position.z, p);
        qtree.insert(point);
    }
    //qtree.show();
    let nextgen = flock;
    for (i = 0; i < nextgen.length; i++) {
        particle = nextgen[i]
        if (withQuadTree.checked()) {
            let range = new Circle(particle.position.x, particle.position.y, particle.position.z, particle.perception);
            let subflock = qtree.query(range);
            // console.log(subflock.length, subflock);
            particle.flocking(subflock, walls);
            particle.evaluate(subflock)
        } else {
            particle.flocking(flock, walls);
        }

        particle.show(i);
    }
    flock = nextgen;
    for (let wall of walls) {
        wall.show();
    }
    fcount++;
    if (fcount % 5 == 0) {
        let fr = floor(frameRate());
        framerateP.html("Framerate: " + fr);
    }
    if (fcount % 50 == 0) {
        fcount = 0
        console.log(flock[0].acceleration)
    }

}

function background_setup() {
    rotateX(angleY);
    translate(0, -1800, -1000);
    rotateZ(angleX);

    background(51);
    noStroke();
    fill(150);
    rect(-length / 2, -width / 2, length, width);
    // push();
    //   translate(-length/2, -width/2);
    //   rotateX(PI/2);
    //   rect(0, 0, length, height);
    // pop();
    // push();
    //   translate(-length/2, -width/2);
    //   rotateY(PI/2);
    //   rect(0, 0, -height, width);
    // pop();
    ambientLight(255, 255, 255);

    // push();
    // specularMaterial(100, 100, 100);
    // stroke(25);
    // strokeWeight(16);
    // translate(-length/2+1, -width/2+1)
    // line(0,0,0,length,0,0);
    // line(0,0,0,0,width,0);
    // line(0,0,0,0,0,height);
    // translate(length-2, width-2);
    // line(0,0,0,-length,0,0);
    // line(-length,0,0,-length,0,height);
    // line(0,0,0,0,-width,0);
    // line(0,-width,0,0,-width,height);
    // line(0,0,0,0,0,height);
    // pop();

    // directionalLight(255,255,255,-length/2, width/2, height);
}

function mousePressed() {
    xOffset = angleX + mouseX / 100;
    yOffset = mouseY / 100 - angleY;
}

function mouseDragged() {
    angleX = xOffset - mouseX / 100;
    angleY = mouseY / 100 - yOffset;
}
