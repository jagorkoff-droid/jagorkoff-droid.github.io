// Grid-Based Game
// James Gorkoff
// November 16, 2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const SQUARE_COUNT = 12;

let cellSize;
let grid;

let startPointX, startPointY;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  // Make grid side length be one square length less than window height
  cellSize = (windowHeight - windowHeight / SQUARE_COUNT) / SQUARE_COUNT;

  grid = generateBlankGrid(SQUARE_COUNT);

  // Starting points to centre grid
  startPointX = width / 2 - (cellSize * SQUARE_COUNT) / 2;
  startPointY = height / 2 - (cellSize * SQUARE_COUNT) / 2;
}

function draw() {
  background(220);
  displayGrid();
}

function displayGrid() {
  for (let y = 0; y < SQUARE_COUNT; y++) {
    for (let x = 0; x < SQUARE_COUNT; x++) {

      // Display square at proper loaction to build a centred grid
      square(x * cellSize + startPointX, y * cellSize + startPointY, cellSize);
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

function displayStartScreen() {
  
}
