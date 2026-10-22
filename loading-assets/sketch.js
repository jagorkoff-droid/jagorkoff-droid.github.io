// Loading Images and Sound Demo

let coinImg;
let coinSound;
let coinScale = 4;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  coinImg = await loadImage("coin.png");
  coinSound = await loadSound("coin.wav");
}

function draw() {
  background("black");

  image(coinImg, width / 2, height / 2, coinImg.width * coinScale, coinImg.height * coinScale);
}

function mousePressed() {
  coinSound.play();
}
