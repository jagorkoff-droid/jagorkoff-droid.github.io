// Walker OOP Demo

let walkers = [];

let toggleSpawn = false;

class Walker {
  constructor(x, y, colour) {
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.diamter = 5;
    this.colour = colour;
  }

  display() {
    fill(this.colour);
    circle(this.x, this.y, this.diamter);
  }

  move() {
    let choice = random(100);

    if (choice < 25) {
      // Up
      this.y -= this.speed;
    }
    else if (choice < 50) {
      // Down
      this.y += this.speed;
    }
    else if (choice < 75) {
      // Left
      this.x -= this.speed;
    }
    else {
      // Right
      this.x += this.speed;
    }
  }
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  for (let i = 0; i < walkers.length; i++) {
    walkers[i].move();
    walkers[i].display();
  }

  automateWalkers();
}

function mousePressed() {
  toggleSpawn = !toggleSpawn;
}

function spawnWalker() {
  let newWalker = new Walker(mouseX, mouseY, color(random(255), random(255), random(255)));
  
  walkers.push(newWalker);
}

function automateWalkers() {
  if (toggleSpawn) {
    multiplyWalkers();
  }

  if (!toggleSpawn) {
    walkers = [];
    clear();
  }
}

function multiplyWalkers() {
  for (i = 0; i < 5; i++) {
    spawnWalker();
  }
}
