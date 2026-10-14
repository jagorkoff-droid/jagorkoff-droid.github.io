// Arrays and Object Notation
// James Gorkoff
// October 8, 2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let terrain = [];

let cameraX = 0;
let nextX = 0;

let speed;

let bikeX;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  bike = await loadImage("bike.png");

  speed = width * 0.005;

  generateTerrain();
}

function draw() {
  setVariables();
  background("skyblue");

  moveCamera();
  checkTerrain();
  displayTerrain();

  displayBike();
}

function moveCamera() {
  if (keyIsDown("W") || keyIsDown("w")) {
    cameraX += speed;
  }
}

function generateTerrain() {
  let chunkSpacing = width * 0.0005;
  let numberOfChunks = ceil(width / chunkSpacing);

  for (let i = 0; i <= numberOfChunks; i++) {
    generateChunk(chunkSpacing);
  }
}

function generateChunk(chunkSpacing) {
  let xPosition = nextX;

  let chunkHeight = noise(xPosition * (0.003 * 1000 / width)) * (height * 0.45);

  let chunkPoint = {
    x: xPosition,
    y: height - (height * 0.15) - chunkHeight,
    w: chunkSpacing + 1,
    h: height,
  };

  terrain.push(chunkPoint);

  nextX += chunkSpacing;
}

function checkTerrain() {
  let chunkSpacing = width * 0.0005;

  while (nextX < cameraX + width * 2) {
    generateChunk(chunkSpacing);
  }
}

function displayTerrain() {
  fill("green");
  noStroke();

  push();
  translate(-cameraX, 0);

  for (let chunk of terrain) {
    displayChunk(chunk);
  }

  pop();
}

function displayChunk(chunk) {
  rect(chunk.x, chunk.y, chunk.w, chunk.h);
}

function displayBike() {
  let bikeTerrainX = bikeX + cameraX;
  let chunkSpacing = width * 0.0005;
  let chunkIndex = floor(bikeTerrainX / chunkSpacing);

  let groundY = terrain[chunkIndex].y;

  image(bike, bikeX, groundY - bike.height, bike.width, bike.height);
}

function setVariables() {
  speed = width * 0.005;
  
  bikeX = 450 * (width / 1920);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  terrain = [];
  cameraX = 0;
  nextX = 0;

  generateTerrain();
}