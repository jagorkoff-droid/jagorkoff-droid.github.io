// Traffic Light Starter Code
// Your Name Here
// The Date Here

// GOAL: make a 'traffic light' simulator. For now, just have the light
// changing according to time. You may want to investigate the millis()
// function at https://p5js.org/reference/#/p5/millis

let changeTime = 3000;

const GREEN = "green";
const YELLOW = "yellow";
const RED = "red";

const YELLOW_LIGHT_DURATION = 500;
const GREEN_LIGHT_DURATION = 3000;
const RED_LIGHT_DURATION = 3000;

let lightColour = GREEN;

async function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(255);
  drawOutlineOfLights();
  changeLight();
  cycle();
}

function drawOutlineOfLights() {
  //box
  rectMode(CENTER);
  fill(0);
  rect(width/2, height/2, 75, 200, 10);

  //lights
  fill(255);
  ellipse(width/2, height/2 - 65, 50, 50); //top
  ellipse(width/2, height/2, 50, 50); //middle
  ellipse(width/2, height/2 + 65, 50, 50); //bottom
}

function changeLight() {
  if (lightColour === GREEN) {
    fill(lightColour);
    ellipse(width/2, height/2 + 65, 50, 50);
  }
  else if (lightColour === YELLOW) {
    fill(lightColour);
    ellipse(width/2, height/2, 50, 50);
  }
  else {
    fill(lightColour);
    ellipse(width/2, height/2 - 65, 50, 50);
  }
}

function cycle() {
  if (millis() - changeTime >= 0 && lightColour === GREEN) {
    changeTime = millis() + YELLOW_LIGHT_DURATION;
    lightColour = YELLOW;
  }
  else if (millis() - changeTime >= 0 && lightColour === YELLOW) {
    changeTime = millis() + RED_LIGHT_DURATION;
    lightColour = RED;
  }

  else if (millis() - changeTime >= 0 && lightColour === RED) {
    changeTime = millis() + GREEN_LIGHT_DURATION;
    lightColour = GREEN;
  }
}