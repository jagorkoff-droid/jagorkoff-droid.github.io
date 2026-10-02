// Interactive Scene
// James Gorkoff
// September 22, 2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let backgroundImage;
let backgroundImageX = 0;
let backgroundImageY = 0;

let timerStart;
let timerStopped;
let finalTime = 0;

let pointer;
let pointerScaleX;
let pointerScaleY;
let pointerOffsetX;
let pointerOffsetY;

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
let birdAngle = 0;

let draggingBird = false;

let birdVelocityX = 0;
let birdVelocityY = 0;

let strengthX;
let strengthY;

let gravity;

let maxDrag;
let dragAmount = 0;

let birdRadius;

let flyingBird = false;

let groundY;

let rollingBird = false;

let stoppedBouncing = true;

let releaseTime = 0;

let tallBlock;
let tallBlockScaleX;
let tallBlockScaleY;
let tallBlocks;

let shortBlock;
let shortBlockScaleX;
let shortBlockScaleY;
let shortBlocks;

let boulder;
let boulderScaleX;
let boulderScaleY;
let boulders;

let pig;
let pigScaleX;
let pigScaleY;
let pigDisplacement;
let pigs;

let gameComplete = false;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();

  pointer = await loadImage("angry_birds_pointer.png");
  backgroundImage = await loadImage("background_image.jpeg");
  slingshot = await loadImage("slingshot.png");
  bird = await loadImage("red_angry_bird.png");
  tallBlock = await loadImage("tall_block.png");
  shortBlock = await loadImage("short_block.png");
  boulder = await loadImage("boulder.png");
  pig = await loadImage("pig.png");

  timerStart = millis();
  timerStopped = false;

  windowResize();
}

function draw() {
  moveBird();
  checkCollisions();
  quitFlight();

  displayBackground();

  for (let i = 0; i < tallBlocks.length; i++) {
    displayTallBlock(tallBlocks[i].x, tallBlocks[i].y);
  }

  for (let i = 0; i < shortBlocks.length; i++) {
    displayShortBlock(shortBlocks[i].x, shortBlocks[i].y)
  }

  for (let i = 0; i < boulders.length; i++) {
    displayBoulder(boulders[i].x, boulders[i].y)
  }

  for (let i = 0; i < pigs.length; i++) {
    displayPig(pigs[i].x, pigs[i].y)
  }

  displaySlingshotBands();
  displayBirdTrajectory();
  displayBird();
  displaySlingshot();
  displayPointer();

  displayTimer();
}

function windowResize() {
  // Calculates the y-value of the ground depending on the screen height
  groundY = windowHeight - (70/1440) * windowHeight;

  gravity = (windowHeight / 1440) * 0.5;

  tallBlockScaleX = 1 * (windowWidth / 1920);
  tallBlockScaleY = 1.4 * (windowHeight / 1080);

  shortBlockScaleX = 2.48 * (windowWidth / 1920);
  shortBlockScaleY = 1.25 * (windowHeight / 1080);

  tallBlocks = [
    {x: 1000 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1200 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1400 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1600 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1800 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1300 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1500 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)}
  ];

  shortBlocks = [
    {x: 1000 * (windowWidth / 1920), y: groundY - (shortBlock.height * shortBlockScaleY / 2) - (tallBlock.width * tallBlockScaleY)},
    {x: 1200 * (windowWidth / 1920), y: groundY - (shortBlock.height * shortBlockScaleY / 2) - (tallBlock.width * tallBlockScaleY)},
    {x: 1400 * (windowWidth / 1920), y: groundY - (shortBlock.height * shortBlockScaleY / 2) - (tallBlock.width * tallBlockScaleY)},
    {x: 1600 * (windowWidth / 1920), y: groundY - (shortBlock.height * shortBlockScaleY / 2) - (tallBlock.width * tallBlockScaleY)},
    {x: 1800 * (windowWidth / 1920), y: groundY - (shortBlock.height * shortBlockScaleY / 2) - (tallBlock.width * tallBlockScaleY)},
    {x: 1400 * (windowWidth / 1920), y: groundY - (shortBlock.height * shortBlockScaleY / 2) * 3 - (tallBlock.width * tallBlockScaleY) * 2}
  ];

  boulderScaleX = 1 * (windowWidth / 1920);
  boulderScaleY = 1 * (windowHeight / 1080);

  boulders = [
    {x: 1000 * (windowWidth / 1920), y: groundY - (boulder.height * boulderScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1800 * (windowWidth / 1920), y: groundY - (boulder.height * boulderScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)}
  ];

  pigScaleX = 0.75 * (windowWidth / 1920);
  pigScaleY = 0.75 * (windowHeight / 1080);
  pigDisplacement = 4 * (windowHeight / 1080);

  pigs = [
    {x: 1200 * (windowWidth / 1920), y: groundY - (pig.height * pigScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1600 * (windowWidth / 1920), y: groundY - (pig.height * pigScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1400 * (windowWidth / 1920), y: groundY - (boulder.height * boulderScaleY / 2) - (shortBlock.height * shortBlockScaleY / 2) * 4 - (tallBlock.width * tallBlockScaleY) * 2},
    {x: 900 * (windowWidth / 1920), y: groundY - (pig.height * pigScaleY) / 2}
  ];

  // Changes scale of the pointer to ensure it is the same proportional size on different screens
  pointerScaleX = (windowWidth / 2560) * 60;
  pointerScaleY = (windowHeight / 1440) * 60;

  // Changes pointer location to be proper on all screen sizes
  pointerOffsetX = (windowWidth / 2560) * 15.25;
  pointerOffsetY = (windowHeight / 1440) * 5.75;

  // Places slingshot at the same relative position on the screen
  slingshotX = (200 / 2560) * windowWidth;
  slingshotY = (1125 / 1440) * windowHeight;

  // Changes the scale of the slingshot depending on screen size
  slingshotScaleX = (windowWidth / 2560) * 0.15;
  slingshotScaleY = (windowHeight / 1440) * 0.15;

  // Changes the scale of the bird depending on screen size
  birdScaleX = (windowWidth / 2560) * 0.06;
  birdScaleY = (windowHeight / 1440) * 0.06;

  // Scales bird radius proportionally using both the window width and height
  birdRadius = (sqrt(windowWidth**2 + windowHeight **2) / sqrt(8627200)) * 34;

  // Finds the slingshot pull point and ensures it is the same relative to screen size
  slingshotPullX = slingshotX + 50 * slingshotScaleX / 0.15;
  slingshotPullY = slingshotY + -30 * slingshotScaleY / 0.15;

  // Scales strength to be proportional to window size
  strengthX =  0.12;
  strengthY =  0.12;

  // Determines how far the bird can be pulled back depending on screen size
  maxDrag = (275 / 1440) * min(windowWidth, windowHeight);

  // Calculates the bird dimensions based on predetermined scaling variables
  birdWidth = bird.width * birdScaleX;
  birdHeight = bird.height * birdScaleY;

  // Resets the birds position when it is sitting still and finds its center
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

function displayPointer() {
  image(pointer, mouseX - pointerOffsetX, mouseY - pointerOffsetY, pointerScaleX, pointerScaleY);
}

function displaySlingshot() {
  image(slingshot, slingshotX, slingshotY, slingshot.width * slingshotScaleX, slingshot.height * slingshotScaleY);
}

function displaySlingshotBands() {
  //Makes the lines dark grey and 8 pixels thick
  stroke(80);
  strokeWeight(8);

  // When not dragging bird, creates a straight line across slingshot and then stops anything else from happening
  if (!draggingBird) {
    line(
      slingshotX + 50 * slingshotScaleX / 0.15,
      slingshotY + 40 * slingshotScaleY / 0.15,
      slingshotX + 150 * slingshotScaleX / 0.15,
      slingshotY + 40 * slingshotScaleY / 0.15
    );

    return;
  }

  // If the bird is being dragged, draws two bands, one from each of the points on the slingshot fork, and connects them at the bird's center
  line(
    slingshotX + 50 * slingshotScaleX / 0.15,
    slingshotY + 40 * slingshotScaleY / 0.15,
    birdCenterX,
    birdCenterY
  );

  line(
    slingshotX + 150 * slingshotScaleX / 0.15,
    slingshotY + 40 * slingshotScaleY / 0.15,
    birdCenterX,
    birdCenterY
  );
}

function displayBird() {
  // If not rolling, display image normally
  if (!rollingBird) {
    image(bird, birdX, birdY, birdWidth, birdHeight);
    return;
  }

  // If bird is rolling, rotate bird
  // push() saves the current draw settings and lets you change position or rotation without impacting the rest of the drawing
  // translate() moves the drawing origin to its parameters (x, y), allowing rotation around the centre
  // rotate() rotates everything that comes after it by birdAngle
  // pop() restores drawing settings saved by push()
  push();

  translate(birdCenterX, birdCenterY);
  rotate(birdAngle);
  image(bird, -birdWidth / 2, -birdHeight / 2, birdWidth, birdHeight);

  pop();
}

function mousePressed() {
  // Finds distance between bird centre and where the mouse has clicked
  let distance = dist(mouseX, mouseY, birdCenterX, birdCenterY);

  // If the mouse is closer to the bird than its radius (so mouse is on the bird), start dragging the bird as long as it is not already flying
  if (distance < birdRadius && !flyingBird) {
    draggingBird = true;
  }
}

function mouseReleased() {
  if (!draggingBird) {
    return;
  }

  // Gives a multiplier ratio from 0 - 1 that varies depending on how far the bird has been pulled
  let power = dragAmount / maxDrag;

  // Determines distances (and direction) between bird and slingshot pull point, multiplies that by an overall launch strength number, then by the multiplier ratio
  birdVelocityX = (slingshotPullX - birdX) * strengthX * power;
  birdVelocityY = (slingshotPullY - birdY) * strengthY * power;

  draggingBird = false;
  flyingBird = true;
  rollingBird = false;
  stoppedBouncing = false;
  birdAngle = 0;
  releaseTime = millis();
}

function mouseDragged() {
  if (!draggingBird) {
    return;
  }

  // Calculates difference between mouse and slingshot pull point
  let dx = mouseX - slingshotPullX;
  let dy = mouseY - slingshotPullY;

  // Finds distance in a line from mouse and slingshot pull point
  let distance = dist(mouseX, mouseY, slingshotPullX, slingshotPullY);

  // Limits pull distance of bird if mouse goes beyond maximum pull distance
  if (distance > maxDrag) {
    dx = dx / distance * maxDrag;
    dy = dy / distance * maxDrag;
  }

  // Places bird at mouse position relative to slingshot pull point
  birdX = slingshotPullX + dx;
  birdY = slingshotPullY + dy;

  // Finds bird centre
  birdCenterX = birdX + birdWidth / 2;
  birdCenterY = birdY + birdHeight / 2;

  // Records how far the bird has been pulled
  dragAmount = dist(birdX, birdY, slingshotPullX, slingshotPullY);
}

function displayBirdTrajectory() {
  if (!draggingBird) {
    return;
  }

  // Gives a multiplier ratio from 0 - 1 that varies depending on how far the bird has been pulled
  let power = dragAmount / maxDrag;

  // Determines distances (and direction) between bird and slingshot pull point, multiplies that by an overall launch strength number, then by the multiplier ratio
  let velocityX = (slingshotPullX - birdX) * strengthX * power;
  let velocityY = (slingshotPullY - birdY) * strengthY * power;

  fill(255, 30, 30);
  noStroke();

  // Creates 30 trajectory dots, gives each dot a time to represent a different time for where the bird will be (horizontal location), 
  for (let dotCounter = 1; dotCounter <= 30; dotCounter++) {
    let time = dotCounter * 0.75;

    // Calculates the x position of each dot for a given time
    // Calculates the y position of each dot, first by calculating where the bird would move vertically on its initial velocity, then adds the effect of gravity over time making a parabola
    // Distance by acceleration (position) = starting position + initial velocity * time - 1/2 * gravity (acceleration) * time^2
    let x = birdCenterX + velocityX * time;
    let y = birdCenterY + velocityY * time + 0.5 * gravity * time**2;

    circle(x, y, 6);
  }
}

function moveBird() {
  // Does nothing if the bird is being dragged or is not flying
  if (draggingBird || !flyingBird) {
    return;
  }

  // Moves the bird horizontally and vertically based on predetermined velocities
  birdX += birdVelocityX;
  birdY += birdVelocityY;

  // Updates the bird's centre
  birdCenterX = birdX + birdWidth / 2;
  birdCenterY = birdY + birdHeight / 2;

  // Applies gravity to bird's velocity if its not rolling
  if (!stoppedBouncing) {
    birdVelocityY += gravity;
  }
}

function quitFlight() {
  // Does nothing if the bird is not flying
  if (!flyingBird) {
    return;
  }

  // Checks if bird has hit ground and 50 milliseconds have passed since the bird's release, puts bird exactly on ground
  if (birdY + birdHeight >= groundY && millis() - releaseTime > 200) {
    birdY = groundY - birdHeight;

    // Checks if the birds vertical speed is greater than five, if it is, it reverses the vertical direction and reduces the velocity by 50%, it also reduces horizontal velocity by 20%
    if (abs(birdVelocityY) > 5) {
      birdVelocityY *= -0.5;
      birdVelocityX *= 0.8;
      rollingBird = true;
    }

    // If the vertical speed is not greater than five, stop any vertical movement, and start bird rolling
    else {
      birdVelocityY = 0;
      stoppedBouncing = true;
      rollingBird = true;
    }
  }

  // Checks if bird is rolling, decreases horizontal velocity by 3%, rotates the bird by (current horizontal velocity multipled by 0.03) radians
  if (rollingBird) {
    birdVelocityX *= 0.97;
    birdAngle += birdVelocityX * 0.03;

    // Checks if the horizontal speed is less than 0.1, if it is, stops horizontal movement, stops rolling, and stops flying, to allow the bird to be respawned
    if (abs(birdVelocityX) < 0.1) {
      birdVelocityX = 0;
      rollingBird = false;
      flyingBird = false;
      stoppedBouncing = true;
    }
  }

  // Stops bird if it goes off sides
  if (birdX < 0 || birdX > windowWidth) {
    flyingBird = false;
    rollingBird = false;
    stoppedBouncing = true;
  }

  if (!flyingBird) {
    birdX = (260 / 2560) * windowWidth;
    birdY = (1125 / 1440) * windowHeight;

    birdCenterX = birdX + birdWidth / 2;
    birdCenterY = birdY + birdHeight / 2;
  }
}

function displayTallBlock(x, y) {
  push();

  imageMode(CENTER);
  translate(x, y);
  rotate(3 * PI / 2);
  image(tallBlock, 0, 0, tallBlock.width * tallBlockScaleY, tallBlock.height * tallBlockScaleX);

  pop();
}

function displayShortBlock(x, y) {
  push();

  imageMode(CENTER);
  translate(x, y);
  image(shortBlock, 0, 0, shortBlock.width * shortBlockScaleX, shortBlock.height * shortBlockScaleY);

  pop();
}

function displayBoulder(x, y) {
  push();

  imageMode(CENTER);
  translate(x, y);
  image(boulder, 0, 0, boulder.width * boulderScaleX, boulder.height * boulderScaleY);

  pop();
}

function displayPig(x, y) {
  push();

  imageMode(CENTER);
  translate(x, y);
  image(pig, 0, pigDisplacement, pig.width * pigScaleX, pig.height * pigScaleY)

  pop();
}

function displayTimer() {
  let currentTime;

  if (timerStopped) {
    currentTime = finalTime;
  }

  else {
    currentTime = millis() - timerStart;
  }

  let seconds = floor(currentTime / 1000);
  let minutes = floor(seconds / 60);
  seconds = seconds % 60;

  let timeText = nf(minutes, 2) + ":" + nf(seconds, 2);

  fill(255);
  stroke(0);
  strokeWeight(4);
  textSize(40 * (windowHeight / 1440));
  textAlign(CENTER, CENTER);
  text(timeText, windowWidth / 2, 50 * (windowHeight / 1440))
}

function checkCollisions() {
  if (!flyingBird) {
    return;
  }

  // Pigs
  for (let i = pigs.length - 1; i >= 0; i--) {
    if(abs(birdCenterX - pigs[i].x) < (birdWidth + pig.width * pigScaleX) / 2 && abs(birdCenterY - pigs[i].y) < (birdHeight + pig.height * pigScaleY) / 2) {
      pigs.splice(i, 1);

      if (pigs.length === 0) {
        gameComplete = true;
        timerStopped = true;
        finalTime = millis() - timerStart;
      }

      return;
    }
  }

  // Tall blocks
  for (let i = 0; i < tallBlocks.length; i++) {
    if (abs(birdCenterX - tallBlocks[i].x) < (birdWidth + tallBlock.height * tallBlockScaleX) / 2 && abs(birdCenterY - tallBlocks[i].y) < (birdHeight + tallBlock.width * tallBlockScaleY) / 2) {
      birdVelocityX *= -0.5;
      birdVelocityY *= -0.5;

      birdX += birdVelocityX * 2;
      birdY += birdVelocityY * 2;

      if (abs(birdVelocityY) < 1) {
        birdVelocityY = 0;
        stoppedBouncing = true;
        rollingBird = true;
      }

      return;
    }
  }

  // Short blocks
  for (let i = 0; i < shortBlocks.length; i++) {
    if (abs(birdCenterX - shortBlocks[i].x) < (birdWidth + shortBlock.width * shortBlockScaleX) / 2 && abs(birdCenterY - shortBlocks[i].y) < (birdHeight + shortBlock.height * shortBlockScaleY) / 2) {
      birdVelocityX *= -0.5;
      birdVelocityY *= -0.5;

      birdX += birdVelocityX * 2;
      birdY += birdVelocityY * 2;

      if (abs(birdVelocityY) < 1) {
        birdVelocityY = 0;
        stoppedBouncing = true;
        rollingBird = true;
      }

      return;
    }
  }

  // Boulders
  for (let i = 0; i < boulders.length; i++) {
    if (abs(birdCenterX - boulders[i].x) < (birdWidth + boulder.width * boulderScaleX) / 2 && abs(birdCenterY - boulders[i].y) < (birdHeight + boulder.height * boulderScaleY) / 2) {
      birdVelocityX *= -0.5;
      birdVelocityY *= -0.5;

      birdX += birdVelocityX * 2;
      birdY += birdVelocityY * 2;

      if (abs(birdVelocityY) < 1) {
        birdVelocityY = 0;
        stoppedBouncing = true;
        rollingBird = true;
      }

      return;
    }
  }
}