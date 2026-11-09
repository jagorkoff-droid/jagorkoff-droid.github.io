// Grid Character Demo

const CELL_SIZE = 40;

const OPEN_TILE = 0;
const IMPASSIBLE = 1;

const PLAYER = 9;
let thePlayer = {
  x: 0,
  y: 0,
};

let rows;
let cols;
let grid;

let stoneImg, grassImg;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  rows = Math.floor(height/CELL_SIZE);
  cols = Math.floor(width/CELL_SIZE);
  grid = generateRandomGrid(cols, rows);

  stoneImg = await loadImage("stone.jpg");
  grassImg = await loadImage("grass.jpg");
  
  // Put player in grid
  grid[thePlayer.y][thePlayer.x] = PLAYER;
}

function draw() {
  background(220);
  displayGrid();
}

function keyPressed() {
  if (key === 'r') {
    grid = generateRandomGrid(cols, rows);
  }
  else if (key === 'e') {
    grid = generateEmptyGrid(cols, rows);
  }
  else if (key === RIGHT_ARROW) {
    movePlayer(thePlayer.x + 1, thePlayer.y);
  }
  else if (key === LEFT_ARROW) {
    movePlayer(thePlayer.x - 1, thePlayer.y);
  }
  else if (key === UP_ARROW) {
    movePlayer(thePlayer.x, thePlayer.y - 1);
  }
  else if (key === DOWN_ARROW) {
    movePlayer(thePlayer.x, thePlayer.y + 1);
  }
}

function movePlayer(x, y) {
  // Keep player in the grid
  if (x >= 0 && x < cols && y >= 0 && y < rows && grid[y][x] === OPEN_TILE) {
    // Keep track of player
    let oldX = thePlayer.x;
    let oldY = thePlayer.y;

    // Move the player
    thePlayer.x = x;
    thePlayer.y = y;
  
    // Put the player in the grid
    grid[thePlayer.y][thePlayer.x] = PLAYER;

    // Reset the previous spot to an open tile
    grid[oldY][oldX] = OPEN_TILE;
  }
}

function mousePressed() {
  let x = Math.floor(mouseX/CELL_SIZE);
  let y = Math.floor(mouseY/CELL_SIZE);

  toggleCell(x, y);
}

function toggleCell(x, y) {
  // Ensure sure you are in the grid
  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    if (grid[y][x] === OPEN_TILE) {
      grid[y][x] = IMPASSIBLE;
    }
    else if (grid[y][x] === IMPASSIBLE) {
      grid[y][x] = OPEN_TILE;
    }
  }
}

function displayGrid() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === OPEN_TILE) {
        image(stoneImg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      else if (grid[y][x] === IMPASSIBLE) {
        image(grassImg, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }

      else if (grid[y][x] === PLAYER) {
        fill("red");
        square(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function generateRandomGrid(cols, rows) {
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      if (random(100) < 50) {
        newGrid[y].push(OPEN_TILE);
      }
      else {
        newGrid[y].push(IMPASSIBLE);
      }
    }
  }
  return newGrid;
}

function generateEmptyGrid(cols, rows) {
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      newGrid[y].push(OPEN_TILE);
    }
  }
  return newGrid;
}