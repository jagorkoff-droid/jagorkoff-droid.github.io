// Circle Generator


async function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  // background(220);

  fill(random(255), random(255), random(255));
  circle(random(0, width), random(0, height), random(30, 100));
}
