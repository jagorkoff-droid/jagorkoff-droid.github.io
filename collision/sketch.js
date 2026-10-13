// Collision Demo

let hit = false;

async function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);

  hit = collideRectCircle(300, 400, 200, 150, mouseX, mouseY, 100);

  if (hit) {
    fill("red");
  }
  else {
    fill("black");
  }

  rect(300, 400, 200, 150);
  circle(mouseX, mouseY, 100);
}
