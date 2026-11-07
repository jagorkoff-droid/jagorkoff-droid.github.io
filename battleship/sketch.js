// Grid-Based Game
// James Gorkoff
// November 16, 2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const SQUARE_COUNT = 12;

let cellSize;
let grid;

let gridStartPointX, gridStartPointY;

let scaleX, scaleY, gameScale;

let gameState = "menu";
let actionSelected = "";

let startScreenBackground;
let startScreenBackgroundZoom = 1.05;
let titleTextSize, subtitleTextSize;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  rectMode(CENTER);

  scaleX = windowWidth / 2560;
  scaleY = windowHeight / 1310;
  gameScale = min(scaleX, scaleY);

  // Make grid side length be one square length less than window height
  cellSize = (windowHeight - windowHeight / SQUARE_COUNT) / SQUARE_COUNT;

  grid = generateBlankGrid(SQUARE_COUNT);

  // Starting points to centre grid
  gridStartPointX = width / 2 - (cellSize * SQUARE_COUNT) / 2;
  gridStartPointY = height / 2 - (cellSize * SQUARE_COUNT) / 2;

  // Load images
  startScreenBackground = await loadImage("battleship-loading-screen-background-image.jpg");

  titleTextSize = 150 * gameScale;
  subtitleTextSize = 40 * gameScale;
}

function draw() {
  background(220);

  displayGameScreens();

  // displayGrid();
}

function displayGameScreens() {
  if (gameState === "menu") {
    displayStartScreen();
  }
  else if (gameState === "create") {
    displayWaitingScreen("Create Game");
  }
  else if (gameState === "join") {
    displayWaitingScreen("Join Game");
  }
}

function displayStartScreen() {
  image(startScreenBackground, width / 2 - (width * startScreenBackgroundZoom) / 2, height / 2 - (height * startScreenBackgroundZoom) / 2, width * startScreenBackgroundZoom, height * startScreenBackgroundZoom);

  fill(0, 0, 0, 160);
  rect(width / 2, height / 2, width, height);

  fill(255);
  textSize(titleTextSize);
  textStyle(BOLD);
  text("BATTLESHIP", width / 2, height / 2 * 0.25);

  fill(180);
  textSize(subtitleTextSize);
  textStyle(NORMAL);
  text("Two Player Naval Battle", width / 2, height / 2 * 0.4);

  // Create a game
  displayMenuButton(height * 0.5, "Generate Game");
  // Join a game
  displayMenuButton(height * 0.65, "Join Game");
}

function displayMenuButton(y, buttonText) {
  let x = width / 2;
  let w = 350 * gameScale;
  let h = 80 * gameScale;

  let hovering = mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;

  if (hovering) {
    fill(0, 50, 100);
  }
  else {
    fill(20, 100, 150);
  }

  rect(x, y, w, h, 15 * gameScale)

  fill(255);
  textSize(subtitleTextSize);
  textStyle(BOLD);

  text(buttonText, x, y);
}

function displayWaitingScreen(title) {
  image(startScreenBackground, width / 2 - (width * startScreenBackgroundZoom) / 2, height / 2 - (height * startScreenBackgroundZoom) / 2, width * startScreenBackgroundZoom, height * startScreenBackgroundZoom);

  fill(0, 0, 0, 160);
  rect(width / 2, height / 2, width, height);

  fill(255);
  textStyle(BOLD);
  textSize(titleTextSize / 2);

  text(title, width / 2, height * 0.3);

  textStyle(NORMAL);
  textSize(subtitleTextSize);
  fill(200);

  if (gameState === "create") {
    text("Create a new game", width / 2, height * 0.375)
  }
  else {
    text("Join an existing game", width / 2, height * 0.375)
  }

  displayMenuButton(height * 0.85, "Back");
}

function displayGrid() {
  for (let y = 0; y < SQUARE_COUNT; y++) {
    for (let x = 0; x < SQUARE_COUNT; x++) {

      // Display square at proper loaction to build a centred grid
      square(x * cellSize + gridStartPointX, y * cellSize + gridStartPointY, cellSize);
    }
  }
}

function generateBlankGrid(SQUARE_COUNT) {
  let newGrid = [];
  
  for (let y = 0; y < SQUARE_COUNT; y++) {
    newGrid.push([]);
    for (let x = 0; x < SQUARE_COUNT; x++) {
      newGrid[y].push(0);
    }
  }

  return newGrid;
}

function displayShipBar() {

}

function displayShips() {

}

function displayDeployFleetButton() {

}

function displayFireButton() {

}

function mousePressed() {
  if (gameState === "menu") {
    if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.5 - 40 * gameScale && mouseY < height * 0.5 + 40 * gameScale) {
      gameState = "create";
    }
    else if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.65 - 40 * gameScale && mouseY < height * 0.65 + 40 * gameScale) {
      gameState = "join";
    }
  }

  else if (gameState === "create" || gameState === "join") {
    if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.85 - 40 * gameScale && mouseY < height * 0.85 + 40 * gameScale) {
      gameState = "menu";
    }
  }
}