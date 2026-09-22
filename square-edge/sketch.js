// Square Moving Around Edge of Screen

let side = 125; //Change to Desired Size
let speed = 300; //Change to Desired Speed

let x = 0;
let y = 0;
let going = true;
let trueWidth = window.innerWidth - window.innerWidth % speed;
let trueHeight = window.innerHeight - window.innerHeight % speed;

async function setup() {
  createCanvas(trueWidth, trueHeight);
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
    if (x < truewWidth - side) {
      x += speed;
    }
    else if (y < trueHeight - side) {
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