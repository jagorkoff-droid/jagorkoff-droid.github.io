// Arrays and Object Notation
// James Gorkoff
// October 26, 2026
//
// Extra for Experts:
// - Altered Perlin noise terrain generation demonstration from class to only generate what is required to fill the screen, and then generate what is needed for movement
// - Included physics aspects including collision detection (covered slightly in class using libraries), acceleration, rotation, and gravity
// - Used a camera system to follow the bike through the world as the terrain scrolls
// - Created an explosion effect using object arrays and .filter() to remove old particles (also used to remove passed out-of-frame terrain)
// - Used trigonometric functions to calculate bike rotation, align it with terrain slope, and find rider head and body positions for collision detection

let terrain = [];

let scaleX;
let scaleY;
let gameScale;

let cameraX = 0;
let nextX = 0;

let crashed = false;
let crashTimer = 0;
let crashDelay = 0;
let crashDelayLength = 5;
let explosionParticles = [];

let bike = {
  x: 0,
  y: 0,
  velocityX: 0,
  velocityY: 0,
  tireRadius: 15,
  onGround: false,
  angle: 0,
  angularVelocity: 0,
};

let gravity = 0;
let acceleration = 0;
let maxSpeed = 0;
let airRotation = 0.03;

let bottle;
let bottles = [];

let thirst = 100;
let dehydrationStep = 0.05;
let drinkSound;

let deathSound;

let backgroundMusic;

// Loads the game assets as well as sets starting terrain and physics
async function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();

  scaleX = windowWidth / 2560;
  scaleY = windowHeight / 1310;
  gameScale = min(scaleX, scaleY);

  bike.x = 100 * gameScale;
  bike.y = 100 * gameScale;
  gravity = 0.25  * gameScale;
  acceleration = 0.075  * gameScale;
  maxSpeed = 15  * gameScale;

  bottle = await loadImage("bottle.png");

  drinkSound = await loadSound("drink.mp3");
  deathSound = await loadSound("death.mp3");

  backgroundMusic = await createAudio("background.mp3");

  generateTerrain();
}

function draw() {
  background("skyblue");
  startMusic();

  handleCrash();
  updateThirst();
  collectBottles();
  forceBottleIfThirsty();
  moveCamera();
  checkTerrain();
  displayBottles();
  displayTerrain();
  displayBike();
  displayExplosion();
  displayThirst();
}

// Recalculates scaling and resets the world when the window changes size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  scaleX = windowWidth / 2560;
  scaleY = windowHeight / 1310;
  gameScale = min(scaleX, scaleY);

  bike.x = 100 * gameScale;
  bike.y = 100 * gameScale;
  gravity = 0.25 * gameScale;
  acceleration = 0.075 * gameScale;
  maxSpeed = 15 * gameScale;

  bike.velocityX = 0;
  bike.velocityY = 0;

  terrain = [];
  cameraX = 0;
  nextX = 0;

  thirst = 100;

  generateTerrain();
}

// Keeps the bike near the left side of the screen as it travels across the terrain
function moveCamera() {
  cameraX = bike.x - width * 0.3;
  cameraX = max(0, cameraX);
}

// Generates the starting terrain chunks to fill the screen
function generateTerrain() {
  bottles = [];

  let chunkSpacing = max(2 * scaleX, width * 0.0005);
  let numberOfChunks = ceil(width / chunkSpacing);

  for (let i = 0; i <= numberOfChunks; i++) {
    generateChunk(chunkSpacing);
  }
}

// Creates one more chunk of terrain using Perlin noise as the camera moves, also may randomly place a bottle
function generateChunk(chunkSpacing) {
  let xPosition = nextX;

  // Perlin noise creates smooth hills instead of random heights
  let smallHills = noise(xPosition * (1.5 / width)) * height * 0.25;
  let bigHills = noise(xPosition * (0.3 / width) + 100) * height * 0.2;

  let giantHill = 0;

  let hillPosition = 2000 * scaleX;
  let hillSpacing = width * 5;

  // Calculates the distance from the centre of the giant hill
  let distance = abs((xPosition % hillSpacing) - hillPosition);

  if (distance < width * 0.3) {
    giantHill = (1 - distance / (width * 0.3)) * height * 0.45;
  }
 
  let chunkHeight = smallHills + bigHills + giantHill;

  // Stores the chunk position and dimensions in an object
  let chunkPoint = {
    x: xPosition,
    y: height - (height * 0.15) - chunkHeight,
    w: chunkSpacing + 1,
    h: height,
  };

  terrain.push(chunkPoint);

  // Occasionally spawns a bottle above the terrain
  if (xPosition > width && random(0, 5000) < 1) {
    bottles.push(
      {
        x: xPosition,
        y: chunkPoint.y - 22 * gameScale,
      }
    );
  }

  nextX += chunkSpacing;
}

// Generates terrain ahead of the camera and removes chunks behind and out of the frame
function checkTerrain() {
  let chunkSpacing = max(2 * scaleX, width * 0.0005);

  // Keeps generating chunks until there is enough terrain in front of the rider
  while (nextX < cameraX + width * 2) {
    generateChunk(chunkSpacing);
  }

  // filter() removes any terrain object chunks that are no longer needed (behind the camera)
  terrain = terrain.filter(chunk => chunk.x + chunk.w >= cameraX - 100 * scaleX);
}

// Finds the terrain height at a given x position
function getTerrainHeight(x) {
  for (let chunk of terrain) {
    if (x >= chunk.x && x <= chunk.x + chunk.w) {
      return chunk.y;
    }
  }

  // Returns the bottom of the canvas if no current terrain chunk contains that position
  return height;
}

// Displays the visible terrain and shifts it based off of the camera position
function displayTerrain() {
  fill("green");
  noStroke();

  push();

  // Shifts the world to the left as the camera moves to the right
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

// Draws an individual terrain chunk as a single thin rectangle
function displayChunk(chunk) {
  rect(chunk.x, chunk.y, chunk.w, chunk.h);
}

// Updates the bike's movement, gravity, collision, and rotation
function updateBike() {
  moveBike();

  // Keeps horizontal speed within allowed range
  bike.velocityX = constrain(bike.velocityX, 0, maxSpeed);

  applyGravity();
  checkBikeCollision();
  updateBikeRotation();
}

// Controls horizontal acceleration as well as movement
function moveBike() {
  if (keyIsDown("W") || keyIsDown("w")) {

    // Acceleration decreases as the player's thirst drops
    bike.velocityX += acceleration * (thirst / 100);
  }
  else {

    //Gradually slows down the bike if W is not being pressed
    bike.velocityX *= 0.99;
  }

  bike.velocityX = constrain(bike.velocityX, 0, maxSpeed * (0.3 + 0.7 * thirst / 100));

  bike.x += bike.velocityX;
}

// Applies gravity to the bike's vertical movement
function applyGravity() {

  // Gravity increases downward velocity, changing the bike's y position
  bike.velocityY += gravity;
  bike.y += bike.velocityY;
}

// Checks whether the bike's tires are touching the ground
function checkBikeCollision() {
  bike.onGround = false;

  let rearX = bike.x - 28 * gameScale;
  let frontX = bike.x + 28 * gameScale;
  
  let rearY = getTerrainHeight(rearX);
  let frontY = getTerrainHeight(frontX);

  let groundY = min(rearY, frontY);
  let tireY = bike.y + 15 * gameScale;

  if (tireY + bike.tireRadius * gameScale >= groundY && bike.velocityY >= 0) {

    // Stop downward movement and position the bike back on the ground
    bike.y = groundY - 30 * gameScale;
    bike.velocityY = 0;
    bike.onGround = true;
  }
}

// Rotates the bike to match the ground slope or allows free rotation when the bike is in the air
function updateBikeRotation() {
  if (thirst <= 1) {
    bike.angularVelocity += 0.02;
    bike.angle += bike.angularVelocity;
    return;
  }

  if (bike.onGround) {
    let rearY = getTerrainHeight(bike.x - 28 * gameScale);
    let frontY = getTerrainHeight(bike.x + 28 * gameScale);

    // atan2() calculates the slope angle from the horizontal and vertical differences
    let groundAngle = atan2(frontY - rearY, 56 * gameScale);

    // sin() and cos() let atan2() find the shortest angular difference back to ground slope
    let angleDifference = atan2(sin(groundAngle - bike.angle), cos(groundAngle - bike.angle));
    bike.angle += angleDifference * 0.08;

    bike.angularVelocity *= 0.92;
  }
  else {

    // The A and D keys control rotation while the bike is in the air
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

// Displays the bike and rider, rotating them around the centre of the bike
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

// Displays the bike's tires and their centres
function displayTires() {
  fill("black");
  stroke("white");
  strokeWeight(3 * gameScale);

  circle(-28 * gameScale, 15 * gameScale, bike.tireRadius * 2 * gameScale);
  circle(28 * gameScale, 15 * gameScale, bike.tireRadius * 2 * gameScale);

  fill("silver");
  noStroke();

  circle(-28 * gameScale, 15 * gameScale, 8 * gameScale);
  circle(28 * gameScale, 15 * gameScale, 8 * gameScale);
}

// Displays the bike's frame and handlebars using lines
function displayFrame() {
  stroke("red");
  strokeWeight(5 * gameScale);

  line(-28 * gameScale, 15 * gameScale, -8 * gameScale, -5 * gameScale);
  line(-8 * gameScale, -5 * gameScale, 28 * gameScale, 15 * gameScale);
  line(-8 * gameScale, -5 * gameScale, 5 * gameScale, 15 * gameScale);
  line(5 * gameScale, 15 * gameScale, -28 * gameScale, 15 * gameScale);
  line(5 * gameScale, 15 * gameScale, 28 * gameScale, 15 * gameScale);

  stroke("black");
  strokeWeight(4 * gameScale);

  line(20 * gameScale, -4 * gameScale, 30 * gameScale, -12 * gameScale);
  line(20 * gameScale, -4 * gameScale, 18 * gameScale, 7 * gameScale);
}

// Displays the rider's head and body
function displayRider() {
  stroke("navy");
  strokeWeight(8 * gameScale);

  line(-5 * gameScale, -8 * gameScale, 5 * gameScale, -22 * gameScale);
  line(5 * gameScale, -22 * gameScale, 25 * gameScale, -10 * gameScale);
  line(-5 * gameScale, -8 * gameScale, 0, 18 * gameScale);

  noStroke();
  fill("orange");

  circle(5 * gameScale, -29 * gameScale, 15  * gameScale);
}

// Handles regular gameplay, crash delay time, and explosion countdown
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

// Checks whether the rider hits the terrain or the bike tilts too far in any direction
function checkRiderCrash() {

  // sin() and cos() calculate the head's position after the bike has rotated
  let headX = bike.x + 5 * gameScale * cos(bike.angle) - (-29 * gameScale) * sin(bike.angle);
  let headY = bike.y + 5 * gameScale * sin(bike.angle) + (-29 * gameScale) * cos(bike.angle);

  // Uses sin() and cos() to calculate the rotated body position
  let bodyX = bike.x - 5 * gameScale * cos(bike.angle) - (-8 * gameScale) * sin(bike.angle);
  let bodyY = bike.y - 5 * gameScale * sin(bike.angle) + (-8 * gameScale) * cos(bike.angle);

  if (headY >= getTerrainHeight(headX) || bodyY >= getTerrainHeight(bodyX)) {
    if (crashDelay === 0) {
      crashDelay = crashDelayLength;
    }
    return;
  }

  // Normalizes the bike's angle so the crash and collision check works consistently across rotations (simplifies coterminal angles)
  let normalizedAngle = atan2(sin(bike.angle), cos(bike.angle));

  if (bike.onGround && abs(normalizedAngle) > PI / 2.5) {
    if (crashDelay === 0) {
      crashDelay = crashDelayLength;
    }
  }
}

// Creates the explosion and gives each particle its own movement and graphics
function explodeBike() {
  crashed = true;
  crashTimer = 60;
  explosionParticles = [];
  deathSound.play();

  for (let i = 0; i < 50; i++) {
    explosionParticles.push({
      x: bike.x,
      y: bike.y - 10 * gameScale,
      velocityX: random(-7, 7) * gameScale,
      velocityY: random(-8, 3) * gameScale,
      size: random(8, 20) * gameScale,
      life: 60,
      colour: random() < 0.5 ? "darkred" : "firebrick",
    });
  }
}

// Moves the explosion particles and removes them if their lifetime is over
function updateExplosion() {
  for (let particle of explosionParticles) {
    particle.x += particle.velocityX;
    particle.y += particle.velocityY;
    particle.velocityY += 0.2 * gameScale;
    particle.life--;
  }

  // filter() keeps particles with remaining lifetime and removes old ones
  explosionParticles = explosionParticles.filter(particle => particle.life > 0);
}

// Displays the explosion particles themselves, while shrinking them as their lifetime decreases
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

// Resets the bike, thirst, crash variables, and terrain for a new game attempt
function resetGame() {
  backgroundMusic.stop();

  terrain = [];
  cameraX = 0;
  nextX = 0;

  bike.x = 100 * gameScale;
  bike.y = 100 * gameScale;
  bike.velocityX = 0;
  bike.velocityY = 0;
  bike.angle = 0;
  bike.angularVelocity = 0;
  bike.onGround = false;

  explosionParticles = [];
  crashed = false;
  crashDelay = 0;
  crashTimer = 0;

  thirst = 100;

  generateTerrain();
}

// Checks the distance between the bike and each bottle to collect nearby ones
function collectBottles() {

  // Loop backward through array of bottles so splice() does not cause any disruptive index shifting
  for (let i = bottles.length - 1; i >= 0; i--) {
    let bottleItem = bottles[i];

    let distanceToBottle = dist(bike.x, bike.y, bottleItem.x, bottleItem.y);

    if (distanceToBottle < 40 * gameScale) {
      thirst = min(100, thirst + 15);
      drinkSound.play();
      bottles.splice(i, 1);
    }
  }
}

// Has a chance to spawn a bottle ahead of the bike if thirst is low and no bottles are remaining
function forceBottleIfThirsty() {
  if (thirst < 25 && bottles.length === 0) {
    if (random(1000) < 1) {
      let bottleX = bike.x + random(500 * scaleX, 1000 * scaleX);

      bottles.push({
          x: bottleX,
          y: getTerrainHeight(bottleX) - 22 * gameScale,
      })
    }
  }
}

// Decreases thirst over time, stopping if it reaches zero
function updateThirst() {
  if (!crashed) {
    thirst -= dehydrationStep;
    thirst = max(0, thirst);
  }
}

// Displays all bottles at their positions relative to the camera
function displayBottles() {
  for (let bottleItem of bottles) {
    image(bottle, bottleItem.x - cameraX - 15 * gameScale, bottleItem.y - 40 * gameScale, 45 * gameScale, 60 * gameScale);
  }
}

// Displays the thirst bar, changing its colour as thirst drops lower
function displayThirst() {
  let barWidth = 400 * scaleX;
  let barHeight = 40 * scaleY;
  let x = 20 * scaleX;
  let y = 20 * scaleY;

  noStroke();
  fill("darkred");
  rect(x, y, barWidth, barHeight, 5 * gameScale);

  if (thirst > 50) {
    fill("deepskyblue");
  }
  else if (thirst > 25) {
    fill("orange");
  }
  else {
    fill("red");
  }

  // The filled width represents the percentage of thirst remaining
  rect(x, y, barWidth * (thirst / 100), barHeight, 5 * gameScale);

  fill("black");
  textSize(30 * gameScale);
  text("Water", x, y + barHeight + 30 * gameScale);
}

// Starts and loops the background music after the player presses a key
function startMusic() {
  if (keyIsPressed && !backgroundMusic.playing) {
    backgroundMusic.volume(0.0075);

    backgroundMusic.play();
    backgroundMusic.loop();
  }
}