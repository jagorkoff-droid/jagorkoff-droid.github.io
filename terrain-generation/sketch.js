// Terrain Generation Demo with Perlin Noise

let terrain = [];
const NUMBER_OF_RECTANGLES = 100000;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  generateTerrain();
}

function draw() {
  background(220);

  stroke("green");
  fill("green");

  for (let rectangle of terrain) {
    rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
  }
}

function generateTerrain() {
  let theWidth = 0.1;
  let time = 0;
  let deltaTime = 0.0001;

  for (let i = 0; i < NUMBER_OF_RECTANGLES; i++) {
    let theHeight = noise(time) * height;
    let someRectangle = spawnRectangle(theWidth * i, theWidth, theHeight);
    terrain.push(someRectangle);
    time += deltaTime;
  }

}

function spawnRectangle(leftSide, rectWidth, rectHeight) {
  let rectangle = {
    x: leftSide,
    y: height - rectHeight,
    w: rectWidth,
    h: rectHeight,
  };

  return rectangle;
}