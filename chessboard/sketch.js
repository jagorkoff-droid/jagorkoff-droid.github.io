let dimensions = Math.min(window.innerWidth, window.innerHeight);
let l = dimensions/8;

function setup() {
  createCanvas(dimensions, dimensions);
}

function draw() {
  background(220);
  noStroke();
  drawBoard();
}

function drawBoard() {
  let isWhite = true;
  for (let x = 0; x <= dimensions; x += dimensions/8) {
    for (let y = 0; y <= dimensions; y += dimensions/8) {
      if (isWhite) {
        fill(255);
      }
      else {
        fill(0);
      }
      rect(x, y, l, l)
      isWhite = !isWhite;
    }
  }
}