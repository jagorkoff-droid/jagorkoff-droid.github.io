// Arrays and Object Notation
// James Gorkoff
// October 8, 2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let terrain = [];

let cameraX = 0;
let nextX = 0;

let crashed = false;
let crashTimer = 0;
let crashDelay = 0;
let crashDelayLength = 3;
let explosionParticles = [];

let speed;

let bike = {
  x: 100,
  y: 100,
  velocityX: 0,
  velocityY: 0,
  tireRadius: 15,
  onGround: false,
  angle: 0,
  angularVelocity: 0,
}

let gravity = 0.25;
let acceleration = 0.075;
let maxSpeed = 15;
let airRotation = 0.03;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  generateTerrain();
}

function draw() {
  setVariables();
  background("skyblue");

  handleCrash();
  moveCamera();
  checkTerrain();
  displayTerrain();
  displayBike();
  displayExplosion();
}

function moveCamera() {
  cameraX = bike.x - width * 0.3;
  cameraX = max(0, cameraX);
}

function generateTerrain() {
  let chunkSpacing = max(2, width * 0.0005);
  let numberOfChunks = ceil(width / chunkSpacing);

  for (let i = 0; i <= numberOfChunks; i++) {
    generateChunk(chunkSpacing);
  }
}

function generateChunk(chunkSpacing) {
  let xPosition = nextX;

  let smallHills = noise(xPosition * (1.5 / width)) * height * 0.25;
  let bigHills = noise(xPosition * (0.3 / width) + 100) * height * 0.2;

  let giantHill = 0;

  let hillPosition = 2000;
  let hillSpacing = width * 5;

  let distance = abs((xPosition % hillSpacing) - hillPosition);

  if (distance < width * 0.3) {
    giantHill = (1 - distance / (width * 0.3)) * height * 0.45;
  }
 
  let chunkHeight = smallHills + bigHills + giantHill;

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
  let chunkSpacing = max(2, width * 0.0005);

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
    if (chunk.x + chunk.w < cameraX) {
      continue;
    }

    if (chunk.x > cameraX + width) {
      break;
    }

    displayChunk(chunk);
  }

  pop();
}

function displayChunk(chunk) {
  rect(chunk.x, chunk.y, chunk.w, chunk.h);
}

function setVariables() {
  speed = width * 0.01;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  terrain = [];
  cameraX = 0;
  nextX = 0;

  generateTerrain();
}

function updateBike() {
  moveBike();

bike.velocityX = constrain(bike.velocityX, 0, maxSpeed);

  applyGravity();
  checkBikeCollision();
  updateBikeRotation();
}

function moveBike() {
  if (keyIsDown("W") || keyIsDown("w")) {
    bike.velocityX += acceleration;
  }
  else {
    bike.velocityX *= 0.99;
  }

  bike.velocityX = constrain(bike.velocityX, 0, maxSpeed);

  bike.x += bike.velocityX;
}

function applyGravity() {
  bike.velocityY += gravity;
  bike.y += bike.velocityY;
}

function checkBikeCollision() {
  bike.onGround = false;

  let rearX = bike.x - 28;
  let frontX = bike.x + 28;
  
  let rearY = getTerrainHeight(rearX);
  let frontY = getTerrainHeight(frontX);

  let groundY = max(rearY, frontY);
  let tireY = bike.y + 15;

  if (tireY + bike.tireRadius >= groundY && bike.velocityY >= 0) {
    bike.y = groundY - 30;
    bike.velocityY = 0;
    bike.onGround = true;
  }
}

function checkTireCollision(tireX, tireY, chunk) {
  let collision = collideLineCircle(
    chunk.x,
    chunk.y,
    chunk.x + chunk.w,
    chunk.y,
    tireX,
    tireY,
    bike.tireRadius * 2,
  );

  if (collision && bike.velocityY >= 0) {
    bike.y = chunk.y - 30;
    bike.velocityY = 0;
    bike.onGround = true;
  }
}

function displayBike() {
  if (!crashed) {
    push();
    translate(bike.x - cameraX, bike.y);
    rotate(bike.angle);

    displayTires();
    displayFrame();
    displayRider();

    pop();
  }
}

function displayTires() {
  fill("black");
  stroke("white");
  strokeWeight(3);

  circle(-28, 15, bike.tireRadius * 2);
  circle(28, 15, bike.tireRadius * 2);

  fill("silver");
  noStroke();

  circle(-28, 15, 8);
  circle(28, 15, 8);
}

function displayFrame() {
  stroke("red");
  strokeWeight(5);

  line(-28, 15, -8, -5);
  line(-8, -5, 28, 15);
  line(-8, -5, 5, 15);
  line(5, 15, -28, 15);
  line(5, 15, 28, 15);

  stroke("black");
  strokeWeight(4);

  line(20, -4, 30, -12);
  line(20, -4, 18, 7);
}

function displayRider() {
  stroke("navy");
  strokeWeight(8);

  line(-5, -8, 5, -22);
  line(5, -22, 25, -10);
  line(-5, -8, 0, 18);

  noStroke();
  fill("orange");

  circle(5, -29, 15);
}

function updateBikeRotation() {
  if (bike.onGround) {
    let rearY = getTerrainHeight(bike.x - 28);
    let frontY = getTerrainHeight(bike.x + 28);

    let groundAngle = atan2(frontY - rearY, 56);

    let angleDifference = atan2(sin(groundAngle - bike.angle), cos(groundAngle - bike.angle));
    bike.angle += angleDifference * 0.08;

    bike.angularVelocity *= 0.92;
  }
  else {
    bike.angularVelocity += airRotation * bike.velocityX * 0.025;

    if (keyIsDown("A") || keyIsDown("a")) {
      bike.angularVelocity -= 0.02;
    }
    if (keyIsDown("D") || keyIsDown("d")) {
      bike.angularVelocity += 0.02;
    }

    bike.angularVelocity = constrain(bike.angularVelocity, -0.35, 0.35);

    bike.angle += bike.angularVelocity;
    bike.angularVelocity *= 0.8;
  }
}

function getTerrainHeight(x) {
  for (let chunk of terrain) {
    if (x >= chunk.x && x <= chunk.x + chunk.w) {
      return chunk.y;
    }
  }

  return height;
}

function handleCrash() {
  if (crashed) {
    updateExplosion();
    crashTimer--;

    if (crashTimer <= 0) {
      resetGame();
    }

    return;
  }

  if (crashDelay > 0) {
    crashDelay--;

    if (crashDelay <= 0) {
      explodeBike();
    }

    return;
  }

  updateBike();
  checkRiderCrash();
}

function checkRiderCrash() {
  let headX = bike.x + 5 * cos(bike.angle) - (-29) * sin(bike.angle);
  let headY = bike.y + 5 * sin(bike.angle) + (-29) * cos(bike.angle);

  let bodyX = bike.x - 5 * cos(bike.angle) - (-8) * sin(bike.angle);
  let bodyY = bike.y - 5 * sin(bike.angle) + (-8) * cos(bike.angle);

  if (headY >= getTerrainHeight(headX) || bodyY >= getTerrainHeight(bodyX)) {
    if (crashDelay === 0) {
      crashDelay = crashDelayLength;
    }
    return;
  }

  let normalizedAngle = atan2(sin(bike.angle), cos(bike.angle));

  if (bike.onGround && abs(normalizedAngle) > PI / 2.5) {
    if (crashDelay === 0) {
      crashDelay = crashDelayLength;
    }
  }
}

function explodeBike() {
  crashed = true;
  crashTimer = 60;
  explosionParticles = [];

  for (let i = 0; i < 50; i++) {
    explosionParticles.push({
      x: bike.x,
      y: bike.y - 10,
      velocityX: random(-7, 7),
      velocityY: random(-8, 3),
      size: random(8, 20),
      life: 60,
      colour: random() < 0.5 ? "darkred" : "firebrick",
    });
  }
}

function updateExplosion() {
  for (let particle of explosionParticles) {
    particle.x += particle.velocityX;
    particle.y += particle.velocityY;
    particle.velocityY += 0.2;
    particle.life--;
  }

  explosionParticles = explosionParticles.filter(particle => particle.life > 0);
}

function displayExplosion() {
  push();
  translate(-cameraX, 0);
  noStroke();

  for (let particle of explosionParticles) {
    fill(particle.colour);
    circle(particle.x, particle.y, particle.size * particle.life / 60);
  }

  pop();
}

function resetGame() {
  terrain = [];
  cameraX = 0;
  nextX = 0;

  bike.x = 100;
  bike.y = 100;
  bike.velocityX = 0;
  bike.velocityY = 0;
  bike.angle = 0;
  bike.angularVelocity = 0;
  bike.onGround = false;

  explosionParticles = [];
  crashed = false;
  crashDelay = 0;
  crashTimer = 0;

  generateTerrain();
}