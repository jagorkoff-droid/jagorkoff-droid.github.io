// Interative Scene
// James Gorkoff
// September 22, 2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let img, x, y;
let imageScale = 0.06;


async function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  x = 250;
  y = 700;
  img = await loadImage("red_angry_bird.png");
}

function draw() {
  background(220);
  displayBird();
  displaySlingshot();
}

function displayBird() {
  image(img, x, y, img.width * imageScale, img.height * imageScale);
}

function displaySlingshot() {
  
}
