// Object Notation and Arrays Demo
// Bouncing Circles

let circles = [];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(220);

  for (let theCircle of circles) {
    edgeBounce(theCircle);
    moveCircle(theCircle);
    displayCircle(theCircle);
  }
}


function displayCircle(theCircle) {
  fill(theCircle.r, theCircle.g, theCircle.b);
  circle(theCircle.x, theCircle.y, theCircle.radius);
}

function moveCircle(theCircle) {
  theCircle.x += theCircle.dx;
  theCircle.y += theCircle.dy;
}

function edgeBounce(theCircle) {
  if (theCircle.x <= 0 + theCircle.radius || theCircle.x >= width - theCircle.radius) {
    theCircle.dx *= -1;
  }

  if (theCircle.y <= 0 + theCircle.radius || theCircle.y >= height - theCircle.radius) {
    theCircle.dy *= -1;
  }
}

function addCircle() {
  let someCircle = {
    x: random(width),
    y: random(height),
    dx: random(-5, 5),
    dy: random(-5, 5),
    radius: random(10, 50),
    r: random(255),
    g: random(255),
    b: random(255),
  };

  circles.push(someCircle);
}

function mousePressed() {
  addCircle();
}
