// Square Moving Around Edge of Screen

let side = 125; //Change to Desired Size
let speed = 20; //Change to Desired Speed

let x = 0;
let y = 0;
let going = true;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

}

function draw() {
  background(220);
  fill(0);
  rect(x, y, side, side);
  moveBox();
}

function moveBox() {
  if (going) {
    if (x < width - side) {
      x += speed;
    }
    else if (y < height - side) {
      y += speed;
    }
    else {
      going = !going;
    }
  }
  else {
    if (x > 0) {
      x -= speed;
    }
    else if (y > 0) {
      y -= speed;
    }
    else {
      going = !going;
    }
  }
}