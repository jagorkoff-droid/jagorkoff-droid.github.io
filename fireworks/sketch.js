// Fireworks OOP Demo

const PARTICLES_PER_CLICK = 100;

class Particle {
  constructor(x, y, r, g, b) {
    this.x = x;
    this.y = y;
    this.dx = random(-5, 5) * random(1, 2);
    this.dy = random(-5, 5) * random(1, 2);
    this.diameter = random(4, 6);
    this.r = r;
    this.g = g;
    this.b = b;
    this.opacity = 255;
  }

  display() {
    noStroke();
    fill(this.r, this.g, this.b, this.opacity);
    circle(this.x, this.y, this.diameter);
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    this.opacity -= 3.5;
  }

  isDead() {
    return this.opacity <= 0;
  }
}

let particles = [];


async function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background("black");

  checkParticleLife();
  displayFirework();
}

function displayFirework() {
  for (let particle of particles) {
    particle.update();
    particle.display();
  }
}

function mousePressed() {
  let r = random(255);
  let g = random(255);
  let b = random(255);

  for (let i = 0; i < PARTICLES_PER_CLICK; i++) {
    let someParticle = new Particle(mouseX, mouseY, r, g, b);

    particles.push(someParticle);
  }
}

function checkParticleLife() {
  for (let particle of particles) {
    if (particle.isDead()) {
      particles.shift();
    }
  }
}