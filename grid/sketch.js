// Grid Demo
// 2D Arrays

const GRID_SIZE = 10;
let grid;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  
  cellSize = min(width, height) / GRID_SIZE;

  grid = randomizeGrid(GRID_SIZE, GRID_SIZE);
}

function draw() {
  background(220);
  showGrid();
}

function showGrid() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === 1) {
        fill("black");
      }
      else if (grid[y][x] === 0) {
        fill("white");
      }
      
      square(x * cellSize, y * cellSize, cellSize);
    }
  }
}

function randomizeGrid(cols, rows) {
  let newGrid = [];

  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    
    for (let x = 0; x < cols; x++) {
      newGrid[y].push(random() > 0.5 ? 0 : 1);
    }
  }

  return newGrid;
}
