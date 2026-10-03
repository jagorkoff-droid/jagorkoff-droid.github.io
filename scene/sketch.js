// Interactive Scene
// James Gorkoff
// October 2, 2026
//
// Extra for Experts:
// - I explored how to make my scene respond to varying window sizes. I used windowWidth and windowHeight to scale and position my objects so that the game remains proportional during window size changes.
// - I explored projectile motion, velocity, and gravity, and how they impact an object's trajectory.
// - I used the equation for projectile distance by acceleration to show the path of flight for the bird, creating a parabolic trajectory to aid the player.
// - I explored object transformations using translate() and rotate() to make the bird rotate around its center while rolling.

let screen = "start";

let score = 0;

let titleSize;
let titleX;
let titleY;

let buttonTextSize;
let buttonX;
let buttonY;

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
let hasPlayed = false;

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

  timerStopped = false;

  windowResize();
}

function draw() {
  // Lets Enter key start the game
  if (keyIsDown(ENTER) && screen === "start") {
    resetGame();
    screen = "game";
  }

  // Loads the start screen
  if (screen === "start") {
    displayStartScreen();
    quitFlight();
  }

  // Loads the game screen
  if (screen === "game") {
    moveBird();
    checkCollisions();
    quitFlight();
  
    displayBackground();
  
    // Displays tall blocks
    for (let i = 0; i < tallBlocks.length; i++) {
      displayTallBlock(tallBlocks[i].x, tallBlocks[i].y);
    }
  
    // Displays short blocks
    for (let i = 0; i < shortBlocks.length; i++) {
      displayShortBlock(shortBlocks[i].x, shortBlocks[i].y);
    }
  
    // Displays boulders
    for (let i = 0; i < boulders.length; i++) {
      displayBoulder(boulders[i].x, boulders[i].y);
    }
  
    // Displays pigs
    for (let i = 0; i < pigs.length; i++) {
      displayPig(pigs[i].x, pigs[i].y);
    }
  
    displaySlingshotBands();
    displayBirdTrajectory();
    displayBird();
    displaySlingshot();
  
    displayTimer();
  }

  displayPointer();
}

// Scales object properties using screen dimensions so they stay proportional
function windowResize() {
  titleSize = (sqrt(windowWidth**2 + windowHeight **2) / sqrt(8627200)) * 120;

  titleX = windowWidth / 2 + 5 * (windowWidth / 1440);
  titleY = windowHeight * 0.2 + 5 * (windowHeight / 900);

  buttonTextSize = (sqrt(windowWidth**2 + windowHeight **2) / sqrt(8627200)) * 50;
  buttonX = windowWidth / 2;
  buttonY = windowHeight / 2 + 150 * (windowHeight / 900);

  // Calculates the y-value of the ground depending on the screen height
  groundY = windowHeight - (70/1440) * windowHeight;

  gravity = (windowHeight / 1440) * 0.5;

  tallBlockScaleX = 1 * (windowWidth / 1920);
  tallBlockScaleY = 1.4 * (windowHeight / 1080);

  shortBlockScaleX = 2.48 * (windowWidth / 1920);
  shortBlockScaleY = 1.25 * (windowHeight / 1080);

  // Tall block array of objects
  tallBlocks = [
    {x: 1000 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1200 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1400 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1600 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1800 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2)},
    {x: 1300 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1500 * (windowWidth / 1920), y: groundY - (tallBlock.width * tallBlockScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)}
  ];

  // Short block array of objects
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


  // Boulder array of objects
  boulders = [
    {x: 1000 * (windowWidth / 1920), y: groundY - (boulder.height * boulderScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1800 * (windowWidth / 1920), y: groundY - (boulder.height * boulderScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)}
  ];

  pigScaleX = 0.75 * (windowWidth / 1920);
  pigScaleY = 0.75 * (windowHeight / 1080);
  pigDisplacement = 4 * (windowHeight / 1080);

  // Pig array of objects
  pigs = [
    {x: 1200 * (windowWidth / 1920), y: groundY - (pig.height * pigScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1600 * (windowWidth / 1920), y: groundY - (pig.height * pigScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1400 * (windowWidth / 1920), y: groundY - (boulder.height * boulderScaleY / 2) - (shortBlock.height * shortBlockScaleY / 2) * 4 - (tallBlock.width * tallBlockScaleY) * 2},
    {x: 900 * (windowWidth / 1920), y: groundY - (pig.height * pigScaleY) / 2}
  ];

  pointerScaleX = (windowWidth / 2560) * 60;
  pointerScaleY = (windowHeight / 1440) * 60;

  pointerOffsetX = (windowWidth / 2560) * 15.25;
  pointerOffsetY = (windowHeight / 1440) * 5.75;

  slingshotX = (200 / 2560) * windowWidth;
  slingshotY = (1125 / 1440) * windowHeight;

  slingshotScaleX = (windowWidth / 2560) * 0.15;
  slingshotScaleY = (windowHeight / 1440) * 0.15;

  birdScaleX = (windowWidth / 2560) * 0.06;
  birdScaleY = (windowHeight / 1440) * 0.06;

  birdRadius = (sqrt(windowWidth**2 + windowHeight **2) / sqrt(8627200)) * 34;

  slingshotPullX = slingshotX + 50 * slingshotScaleX / 0.15;
  slingshotPullY = slingshotY + -30 * slingshotScaleY / 0.15;

  strengthX =  0.14;
  strengthY =  0.14;

  maxDrag = (275 / 1440) * min(windowWidth, windowHeight);

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
  // translate() moves the drawing origin to its parameters (x, y), allowing rotation around the center
  // rotate() rotates everything that comes after it by birdAngle
  // pop() restores drawing settings saved by push()
  push();

  translate(birdCenterX, birdCenterY);
  rotate(birdAngle);
  image(bird, -birdWidth / 2, -birdHeight / 2, birdWidth, birdHeight);

  pop();
}

function mousePressed() {
  // If mouse is on start button and is clicked, start the game and reset the game
  if (mouseX >= windowWidth / 2 - 100 * (windowWidth / 1440) && mouseY >= windowHeight / 2 + 100 * (windowHeight / 900) && mouseX <= windowWidth / 2 - 100 * (windowWidth / 1440) + 200 * (windowWidth / 1440) && mouseY <= windowHeight / 2 + 100 * (windowHeight / 900) + 100 * (windowHeight / 900) && screen === "start") {
    resetGame();
    screen = "game";
  }

  // Finds distance between bird center and where the mouse has clicked
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

  // Finds bird center
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

  // Updates the bird's center
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

  // If the bird is not flying, place back at slingshot
  if (!flyingBird) {
    birdX = (260 / 2560) * windowWidth;
    birdY = (1125 / 1440) * windowHeight;

    birdCenterX = birdX + birdWidth / 2;
    birdCenterY = birdY + birdHeight / 2;
  }
}

// Displays and rotates the current tall block using passed in x and y coordinates
function displayTallBlock(x, y) {
  push();

  imageMode(CENTER);
  translate(x, y);
  rotate(3 * PI / 2);
  image(tallBlock, 0, 0, tallBlock.width * tallBlockScaleY, tallBlock.height * tallBlockScaleX);

  pop();
}

// Displays the current short block using passed in x and y coordinates
function displayShortBlock(x, y) {
  push();

  imageMode(CENTER);
  translate(x, y);
  image(shortBlock, 0, 0, shortBlock.width * shortBlockScaleX, shortBlock.height * shortBlockScaleY);

  pop();
}

// Displays the boulder using passed in x and y coordinates
function displayBoulder(x, y) {
  push();

  imageMode(CENTER);
  translate(x, y);
  image(boulder, 0, 0, boulder.width * boulderScaleX, boulder.height * boulderScaleY);

  pop();
}

// Displays the current pig using passed in x and y coordinates
function displayPig(x, y) {
  push();

  imageMode(CENTER);
  translate(x, y);
  image(pig, 0, pigDisplacement, pig.width * pigScaleX, pig.height * pigScaleY);

  pop();
}

// Displays the timer for the game
function displayTimer() {
  let currentTime;

  // Use final time once the timer has been stopped
  if (timerStopped) {
    currentTime = finalTime;
  }

  // Otherwise, calculates amount of time that has passed since game start
  else {
    currentTime = millis() - timerStart;
  }

  // Converts time into minutes and seconds
  let seconds = floor(currentTime / 1000);
  let minutes = floor(seconds / 60);
  seconds = seconds % 60;

  // Formats the minutes and seconds to only have two digits each
  let timeText = nf(minutes, 2) + ":" + nf(seconds, 2);

  fill(255);
  stroke(0);
  strokeWeight(4);
  textSize(40 * (windowHeight / 1440));
  textAlign(CENTER, CENTER);
  text(timeText, windowWidth / 2, 50 * (windowHeight / 1440));
}

function checkCollisions() {
  if (!flyingBird) {
    return;
  }

  // Pigs
  for (let i = pigs.length - 1; i >= 0; i--) {
    // Checks if bird's center is close enough to the pig's center to count as a collision
    if (abs(birdCenterX - pigs[i].x) < (birdWidth + pig.width * pigScaleX) / 2 && abs(birdCenterY - pigs[i].y) < (birdHeight + pig.height * pigScaleY) / 2) {

      // Removes hit pig from array
      pigs.splice(i, 1);

      // Checks if all pigs have been removed
      if (pigs.length === 0) {
        gameComplete = true;
        hasPlayed = true;
        timerStopped = true;
        finalTime = millis() - timerStart;

        // Gives a score depending on how fast the game was won
        score = max(0, floor(30000 - finalTime));

        // Stops bird flight after game completion
        flyingBird = false;
        rollingBird = false;
        draggingBird = false;

        // Returns to the start screen after all pigs are removed
        screen = "start";
      }

      return;
    }
  }

  // Tall blocks
  for (let i = 0; i < tallBlocks.length; i++) {
    // Checks if bird is touching current tall block
    if (abs(birdCenterX - tallBlocks[i].x) < (birdWidth + tallBlock.height * tallBlockScaleX) / 2 && abs(birdCenterY - tallBlocks[i].y) < (birdHeight + tallBlock.width * tallBlockScaleY) / 2) {

      birdVelocityX *= -0.5;
      birdVelocityY *= -0.5;

      // Moves the bird away from the block so it does not remain inside it
      birdX += birdVelocityX * 2;
      birdY += birdVelocityY * 2;

      rollingBird = true;

      // Stops vertical bounce when vertical speed becomes small
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
    // Checks if bird is touching current short block
    if (abs(birdCenterX - shortBlocks[i].x) < (birdWidth + shortBlock.width * shortBlockScaleX) / 2 && abs(birdCenterY - shortBlocks[i].y) < (birdHeight + shortBlock.height * shortBlockScaleY) / 2) {

      // Reverses both velocities and reduces them by 50% to create bounce
      birdVelocityX *= -0.5;
      birdVelocityY *= -0.5;

      // Moves the bird away from the block so it does not remain inside it
      birdX += birdVelocityX * 2;
      birdY += birdVelocityY * 2;

      rollingBird = true;

      // Stops vertical bounce when vertical speed becomes small
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
    // Checks if bird is touching current boulder
    if (abs(birdCenterX - boulders[i].x) < (birdWidth + boulder.width * boulderScaleX) / 2 && abs(birdCenterY - boulders[i].y) < (birdHeight + boulder.height * boulderScaleY) / 2) {

      birdVelocityX *= -0.5;
      birdVelocityY *= -0.5;

      // Moves the bird away from the boulder so it does not remain inside it
      birdX += birdVelocityX * 2;
      birdY += birdVelocityY * 2;

      rollingBird = true;

      // Stops vertical bounce when vertical speed becomes small
      if (abs(birdVelocityY) < 1) {
        birdVelocityY = 0;
        stoppedBouncing = true;
        rollingBird = true;
      }

      return;
    }
  }
}

function displayStartScreen() {
  background(135, 206, 250);

  // Creates green hills in the background
  noStroke();
  fill(34, 139, 34);
  ellipse(100 * (windowWidth / 1440), 720 * (windowHeight / 900), 1100 * (windowWidth / 1440), 600 * (windowHeight / 900));
  ellipse(1000 * (windowWidth / 1440), 690 * (windowHeight / 900), 1200 * (windowWidth / 1440), 650 * (windowHeight / 900));

  // Creates brown ground and green grass
  fill(139, 69, 13);
  rect(0, windowHeight - 40 * (windowHeight / 900), windowWidth, 40 * (windowHeight / 900));
  fill(50, 205, 50);
  rect(0, windowHeight - 45 * (windowHeight / 900), windowWidth, 5 * (windowHeight / 900));

  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  // Displays the title with transparency
  fill(50, 50, 50, 150);
  textSize(titleSize);
  text("AGITATED AVIANS", titleX, titleY);

  // Creates the start button
  fill(200);
  rect(windowWidth / 2 - 100 * (windowWidth / 1440), windowHeight / 2 + 100 * (windowHeight / 900), 200 * (windowWidth / 1440), 100 * (windowHeight / 900));

  // Displays start button text
  fill(50, 50, 255);
  textSize(buttonTextSize);
  text("Start (Click or\nPress Enter)", buttonX, buttonY);

  // Displays player score if they have already completed a game
  if (hasPlayed) {
    fill(50, 50, 50);
    textSize(buttonTextSize * 0.5);
    text(`Score: ${score} / 30000`, windowWidth / 2, windowHeight / 2 + 250 * (windowHeight / 900));
  }
}

function resetGame() {
  // Respawn pigs
  pigs = [
    {x: 1200 * (windowWidth / 1920), y: groundY - (pig.height * pigScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1600 * (windowWidth / 1920), y: groundY - (pig.height * pigScaleY / 2) - (tallBlock.width * tallBlockScaleY) - (shortBlock.height * shortBlockScaleY)},
    {x: 1400 * (windowWidth / 1920), y: groundY - (boulder.height * boulderScaleY / 2) - (shortBlock.height * shortBlockScaleY / 2) * 4 - (tallBlock.width * tallBlockScaleY) * 2},
    {x: 900 * (windowWidth / 1920), y: groundY - (pig.height * pigScaleY) / 2}
  ];

  // Respawn bird
  birdX = (260 / 2560) * windowWidth;
  birdY = (1125 / 1440) * windowHeight;

  // Finds center of bird using position and dimensions
  birdCenterX = birdX + birdWidth / 2;
  birdCenterY = birdY + birdHeight / 2;

  // Resets bird's movement state variables
  draggingBird = false;
  flyingBird = false;
  rollingBird = false;
  stoppedBouncing = true;

  // Resets the game completion and timer variables
  gameComplete = false;
  timerStopped = false;
  finalTime = 0;
  score = 0;
  timerStart = millis();
}

// Resizes window and recalculates positions / sizes when the window is changed
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  windowResize();
}