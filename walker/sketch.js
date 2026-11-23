// Walker OOP Demo

let walkers = [];

class Walker {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.diamter = 5;
    this.colour = "red";
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

  for (let i = 0; i < 101; i++) {
    let newWalker;

    newWalker = new Walker(random(width), random(height));
    newWalker.colour = color(random(255), random(255), random(255));

    walkers.push(newWalker);
  }
}

function draw() {
  for (let i = 0; i < walkers.length; i++) {
    walkers[i].move();
    walkers[i].display();
  }
}
