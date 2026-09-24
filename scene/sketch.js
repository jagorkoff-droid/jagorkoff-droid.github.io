// Interative Scene
// James Gorkoff
// September 22, 2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let backgroundImage;
let backgroundImageX = 0;
let backgroundImageY = 0;

let slingshot;
let slingshotX;
let slingshotY;
let slingshotPullX;
let slingshotPullY;
let slingshotScaleX;
let slingshotScaleY;

let bird;
let birdX;
let birdY;
let birdScaleX;
let birdScaleY;
let birdWidth;
let birdHeight;
let birdCenterX;
let birdCenterY;

let draggingBird = false;

let birdVelocityX = 0;
let birdVelocityY = 0;

let gravity = 0.5;

let maxDrag;
let dragAmount = 0;

let birdRadius = 30;

let birdStartX;
let birdStartY;

let flyingBird = false;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  backgroundImage = await loadImage("background_image.jpeg");
  slingshot = await loadImage("slingshot.png");
  bird = await loadImage("red_angry_bird.png");
}

function draw() {
  windowResize();

  moveBird();
  displayBackground();
  displaySlingshotBands();
  displayBirdTrajectory();
  displayBird();
  displaySlingshot();
  quitFlight();
  console.log(flyingBird)
}

function windowResize() {
  slingshotX = (200 / 2560) * windowWidth;
  slingshotY = (1125 / 1440) * windowHeight;

  slingshotScaleX = (windowWidth / 2560) * 0.15;
  slingshotScaleY = (windowHeight / 1440) * 0.15;

  birdScaleX = (windowWidth / 2560) * 0.06;
  birdScaleY = (windowHeight / 1440) * 0.06;

  slingshotPullX = slingshotX + 50 * slingshotScaleX / 0.15;
  slingshotPullY = slingshotY + -30 * slingshotScaleY / 0.15;

  maxDrag = (250 / 2560) * windowWidth;

  birdWidth = bird.width * birdScaleX;
  birdHeight = bird.height * birdScaleY;

  if (!draggingBird && !flyingBird) {
    birdX = (260 / 2560) * windowWidth;
    birdY = (1125 / 1440) * windowHeight;

    birdCenterX = birdX + birdWidth / 2;
    birdCenterY = birdY + birdHeight / 2;
  }
}

function displayBackground() {
  image(backgroundImage, backgroundImageX, backgroundImageY, windowWidth, windowHeight);
}

function displaySlingshot() {
  image(slingshot, slingshotX, slingshotY, slingshot.width * slingshotScaleX, slingshot.height * slingshotScaleY);
}

function displaySlingshotBands() {
  stroke(80);
  strokeWeight(8);

  if (!draggingBird) {
    line(
      slingshotX + 50 * slingshotScaleX / 0.15,
      slingshotY + 40 * slingshotScaleY / 0.15,
      slingshotX + 150 * slingshotScaleX / 0.15,
      slingshotY + 40 * slingshotScaleY / 0.15
    );

    return;
  }

  line(
    slingshotX + 50 * slingshotScaleX / 0.15,
    slingshotY + 40 * slingshotScaleY / 0.15,
    birdCenterX,
    birdCenterY
  )

  line(
    slingshotX + 150 * slingshotScaleX / 0.15,
    slingshotY + 40 * slingshotScaleY / 0.15,
    birdCenterX,
    birdCenterY
  );
}

function displayBird() {
  image(bird, birdX, birdY, bird.width * birdScaleX, bird.height * birdScaleY);
}

function mousePressed() {
  let distance = dist(mouseX, mouseY, birdCenterX, birdCenterY);

  if (distance < birdRadius) {
    draggingBird = true;
  }
}

function mouseReleased() {
  if (!draggingBird) {
    return;
  }

  let power = dragAmount / maxDrag;

  birdVelocityX = (slingshotPullX - birdX) * 0.15 * power;
  birdVelocityY = (slingshotPullY - birdY) * 0.18 * power;

  draggingBird = false;
  flyingBird = true;
}

function mouseDragged() {
  if (!draggingBird) {
    return;
  }

  let dx = mouseX - slingshotPullX;
  let dy = mouseY - slingshotPullY;

  let distance = dist(mouseX, mouseY, slingshotPullX, slingshotPullY);

  if (distance > maxDrag) {
    dx = dx / distance * maxDrag;
    dy = dy / distance * maxDrag;
  }

  birdX = slingshotPullX + dx;
  birdY = slingshotPullY + dy;

  birdCenterX = birdX + birdWidth / 2;
  birdCenterY = birdY + birdHeight / 2;

  dragAmount = dist(birdX, birdY, slingshotPullX, slingshotPullY);
}

function displayBirdTrajectory() {
  if (!draggingBird) {
    return;
  }

  let power = dragAmount / maxDrag;

  let velocityX = (slingshotPullX - birdX) * 0.15 * power;
  let velocityY = (slingshotPullY - birdY) * 0.18 * power;

  fill(255, 30, 30);
  noStroke();

  for (let dotCounter = 1; dotCounter <= 45; dotCounter++) {
    let time = dotCounter * 0.5;

    let x = birdCenterX + velocityX * time;
    let y = birdCenterY + velocityY * time + 0.5 * gravity * time**2;

    circle(x, y, 6);
  }
}

function moveBird() {
  if (draggingBird || !flyingBird) {
    return;
  }

  birdX += birdVelocityX;
  birdY += birdVelocityY;

  birdCenterX = birdX + birdWidth / 2;
  birdCenterY = birdY + birdHeight / 2;

  birdVelocityY += gravity;
}

function quitFlight() {
  if (!flyingBird) {
    return;
  }

  if (flyingBird && birdY > windowHeight || birdX < 0 || birdX > windowWidth) {
    flyingBird = false;
  }
}