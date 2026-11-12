// Grid-Based Game
// James Gorkoff
// November 16, 2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let reloadPage = false;

const SQUARE_COUNT = 12;

let cellSize;
let grid;

let gridStartPointX, gridStartPointY;

let scaleX, scaleY, gameScale;

let gameState = "menu";
let previousGameState = "";
let actionSelected = "";

let username = "";
let usernameInput = "";
let usernameInputActive = false;

let startScreenBackground;
let startScreenBackgroundZoom = 1.05;
let titleTextSize, subtitleTextSize;

let roomCode = "";
let joinCodeInput = "";

let game = {};

let myPlayerData, otherPlayerData;
let myPlayerNumber = -1;

let connected = false;
let connecting = false;
let bothPlayersConnectedTime = 0;

let ships = [
  {length: 5, placed: false, x: -1, y: -1, horizontal: true},
  {length: 4, placed: false, x: -1, y: -1, horizontal: true},
  {length: 3, placed: false, x: -1, y: -1, horizontal: true},
  {length: 3, placed: false, x: -1, y: -1, horizontal: true},
  {length: 2, placed: false, x: -1, y: -1, horizontal: true},
];

let selectedShip = -1;
let draggingShip = false;
let fleetDeployed = false;

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
  gridStartPointX = (width - cellSize * SQUARE_COUNT) / 2 + cellSize / 2;
  gridStartPointY = (height - cellSize * SQUARE_COUNT) / 2 + cellSize / 2;

  // Load images
  startScreenBackground = await loadImage("battleship-loading-screen-background-image.jpg");

  titleTextSize = 150 * gameScale;
  subtitleTextSize = 40 * gameScale;
}

function draw() {
  checkPageReload();
  background(220);

  displayGameScreens();
}

function displayGameScreens() {
  if (connected && game.player1Username && game.player2Username) {
    if (bothPlayersConnectedTime === 0) {
      bothPlayersConnectedTime = millis();
    }

    if (millis() - bothPlayersConnectedTime >= 1500) {
      gameState = "playing";
    }
  }

  if (gameState === "menu") {
    usernameInputActive = false;
    displayStartScreen();
  }
  else if (gameState === "create") {
    usernameInputActive = false;
    displayWaitingScreen("Create Game");
  }
  else if (gameState === "join") {
    usernameInputActive = false;
    displayWaitingScreen("Join Game");
  }
  else if (gameState === "username") {
    usernameInputActive = true;
    displayUsernameScreen();
  }
  else if (gameState === "playing") {
    usernameInputActive = false;
    displayPlayingScreen();
  }
}

function displayBackground() {
  image(startScreenBackground, width / 2 - (width * startScreenBackgroundZoom) / 2, height / 2 - (height * startScreenBackgroundZoom) / 2, width * startScreenBackgroundZoom, height * startScreenBackgroundZoom);

  fill(0, 0, 0, 160);
  rect(width / 2, height / 2, width, height);
}

function displayStartScreen() {
  displayBackground()

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
  displayBackground()

  fill(255);
  textStyle(BOLD);
  textSize(titleTextSize / 2);

  text(title, width / 2, height * 0.3);

  textStyle(NORMAL);
  textSize(subtitleTextSize);
  fill(200);

  if (gameState === "create") {
    text("Share this code with your opponent!", width / 2, height * 0.375)

    textSize(titleTextSize * 0.6);
    fill(255, 220, 80);
    text(roomCode, width / 2, height * 0.55)
  }
  else {
    text("Enter your opponents room code:", width / 2, height * 0.375)

    fill(255);
    rect(width / 2, height * 0.55, 500 * gameScale, 75 * gameScale, 15 * gameScale)

    fill(180);
    textSize(subtitleTextSize);
    text(joinCodeInput || "Enter 6-digit code", width / 2, height * 0.55);

    if (!game.guestConnecting) {
      displayMenuButton(height * 0.7, "Join Game")
    }
  }

  if (connecting) {
    textStyle(NORMAL);
    fill(255, 220, 80);
    textSize(subtitleTextSize);
    text("Connecting to server...", width / 2, height * 0.625)
  }
  else if (connected) {
    textStyle(NORMAL);
    fill(100, 255, 130);
    textSize(subtitleTextSize);
    text("Connected!", width / 2, height * 0.625)
  }

  if (!game.guestConnecting) {
    displayMenuButton(height * 0.85, "Back");
  }
}

function displayUsernameScreen() {
  displayBackground()

  fill(255);
  textSize(titleTextSize * 0.75);
  textStyle(BOLD);
  text("Enter Your Username", width / 2, height * 0.3);

  // Input box
  fill(255);
  rect(width / 2, height * 0.55, 600 * gameScale, 75 * gameScale, 15 * gameScale);

  fill(180);
  textSize(subtitleTextSize);
  // If usernameInput has no value, use alternate text
  text(usernameInput || "Start typing your username...", width / 2, height * 0.55)

  displayMenuButton(height * 0.7, "Continue");
  displayMenuButton(height * 0.85, "Back");
}

function keyTyped() {
  if (gameState === "username" && usernameInputActive) {
    if (usernameInput.length < 15) {
      usernameInput += key;
    }
  }

  if (gameState === "join") {
    if (joinCodeInput.length < 6 && key >= "0" && key <= "9") {
      joinCodeInput += key;
    }
  }
}

function keyPressed() {
  if (gameState === "username" && usernameInputActive) {
    if (key === BACKSPACE) {
      usernameInput = usernameInput.slice(0, -1);
    }
  }

  if (gameState === "join" && key === BACKSPACE) {
    joinCodeInput = joinCodeInput.slice(0, -1);
  }
}

function displayGrid() {
  fill(30, 100, 150);

  push();

  stroke(255);
  strokeWeight(2 * gameScale);
  for (let y = 0; y < SQUARE_COUNT; y++) {
    for (let x = 0; x < SQUARE_COUNT; x++) {

      // Display square at proper loaction to build a centred grid
      square(x * cellSize + gridStartPointX, y * cellSize + gridStartPointY, cellSize);
    }
  }

  pop();
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
  let gridLeft = (width - cellSize * SQUARE_COUNT) / 2;

  let barX = gridLeft / 2;
  let barY = height / 2;

  let shipSpacing = 150 * gameScale;

  let panelWidth = gridLeft * 0.85;
  let panelHeight = 950 * gameScale;

  let panelTop = barY - 300 * gameScale - subtitleTextSize / 2;
  let panelBottom = barY - 150 * gameScale + 4 * shipSpacing + cellSize / 2;

  let panelY = (panelTop + panelBottom) / 2;

  fill(5, 15, 35);
  rectMode(CENTER);
  rect(barX, panelY, panelWidth, panelHeight, 15 * gameScale);

  fill(255);
  textSize(subtitleTextSize);
  textStyle(BOLD);
  text("Fleet Dock", barX, barY - 300 * gameScale);

  displayShips(barX, barY, shipSpacing);
}

function displayShips(barX, barY, shipSpacing) {
  for (let i = 0; i < ships.length; i++) {
    let shipY = barY - 150 * gameScale + i * shipSpacing;

    fill(65, 70, 75);

    rect(barX, shipY, ships[i].length * cellSize, cellSize, 2 * cellSize);
  }
}

function displayDeployFleetButton() {

}

function displayFireButton() {

}

function mousePressed() {
  if (gameState === "menu") {
    if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.5 - 40 * gameScale && mouseY < height * 0.5 + 40 * gameScale) {
      previousGameState = "create";
      usernameInput = "";
      gameState = "username";
    }
    else if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.65 - 40 * gameScale && mouseY < height * 0.65 + 40 * gameScale) {
      previousGameState = "join";
      usernameInput = "";
      gameState = "username";
    }
  }

  else if (gameState === "username") {
    if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.7 - 40 * gameScale && mouseY < height * 0.7 + 40 * gameScale) {
      if (usernameInput.trim().length > 0) {
        username = usernameInput.trim()
        
        if (previousGameState === "create") {
          roomCode = nf(floor(random(1000000)), 6);
          gameState = "create";

          connectToGame();
        }
        else if (previousGameState === "join") {
          if (roomCode !== "") {
            gameState = "join";
            connectToGame();
          }
          else {
            joinCodeInput = "";
            gameState = "join";
          }
        }
      }
    }

    else if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.85 - 40 * gameScale && mouseY < height * 0.85 + 40 * gameScale) {
      usernameInput = "";
      gameState = "menu";
    }
  }

  else if (gameState === "create" || gameState === "join") {
    if (!game.guestConnecting) {
      if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.7 - 40 * gameScale && mouseY < height * 0.7 + 40 * gameScale) {
      if (joinCodeInput.length === 6) {
        roomCode = joinCodeInput;

        connectToGame();
      }
    }

    else if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.85 - 40 * gameScale && mouseY < height * 0.85 + 40 * gameScale) {
      disconnectFromGame();

      gameState = "menu";
    }
    }
  }
}

async function connectToGame() {
  if (connecting || connected) {
    return
  }

  connecting = true;

  await p5party.connect("wss://demoserver.p5party.org", "battleship-cs30-wmci-jg-iL8RT%b7a3GOE8zk2@qOcYyhdlkIt4Ns7*2eVGmbVTkKCzigPUkV840hg6KNpklEe3^^+i8t354P%su@IGD%$vtSEvLJjb!sj@", roomCode);

  console.log("Connected to room: ", roomCode);

  game = await p5party.loadShared("game", {
    player1Username: "",
    player2Username: "",
    guestConnecting: false,
    gameStarted: false,
  });

  if (!p5party.isHost()) {
    game.guestConnecting = true;
  }

  myPlayerData = await p5party.loadMyShared({
    playerNumber: -1,
    username: username
  });

  otherPlayerData = p5party.loadGuestShareds();

  if (p5party.isHost()) {
    myPlayerNumber = 1;
    game.player1Username = username;
  }
  else {
    myPlayerNumber = 2;
    if (username === game.player1Username) {
      if (game.player1Username !== "") {
        game.player1Username = username + " (Host)";
      }
      game.player2Username = username + " (Guest)";
    }
    else {
      game.player2Username = username;
    }
  }

  connected = true;
  connecting = false;

  console.log("Game date: ", game);
  console.log("My player data: ", myPlayerData);
  console.log("Other Player: ", otherPlayerData);
}

async function disconnectFromGame() {
  if (connected || connecting) {
    p5party.disconnect();
  }

  connected = false;
  connecting = false;

  game = {};
  myPlayerData = undefined;
  otherPlayerData = undefined;
  bothPlayersConnectedTime = 0;

  myPlayerNumber = -1;

  roomCode = "";
  joinCodeInput = "";

  // Completely destroys any old p5.party global objects (because p5.party is dumb and does not have a built in function to fully reconnect from square one 😞)
  let p5GlobalNames = ["p5party", "partyConnect", "partyLoadShared", "partyWatchShared", "partyIsHost", "partyDisconnect", "partyLoadMyShared", "partyLoadGuestShareds", "partySubscribe", "partyUnsubscribe", "partyEmit", "partyToggleInfo"];

  for (let name of p5GlobalNames) {
    delete window[name];
  }

  // Again, because p5.party is dumb, we need to re-inject p5.party.js, so that it exists again for the next game
  await reloadP5PartyJS();

  console.log("Disconnected from game");
}

function reloadP5PartyJS() {
  // Creates a waiting ticket that pauses await in disconnectFromGame() until we finish reloading p5.party.js
  return new Promise((resolve) => {
    // Searches the HTML document for tags called <script> whose source attribute is "p5.party"
    const oldScripts = document.querySelectorAll("script[src*='p5.party']");
    // Loops through any tags found and deletes them from the webpage
    oldScripts.forEach((script) => script.remove());

    // Creates a new empty <script> HTML element in the browser memory
    const newScript = document.createElement("script");
    // Sets the source file path to the p5.party.js library, and ads the current time to it in milliseconds, as browsers only run scripts that have not been ran already, and adding the date guarantees that file has never been ran before
    newScript.src = "libraries/p5.party.js?" + Date.now();
    // Sets up a listener that runs the exact moment the browser finishes downloading then executing p5.party.js (the new blank one), resolve tells await (called from disconnectFromGame()) that window.p5party is ready to be used again
    newScript.onload = () => resolve();
    // Reloads the page if an error occurs, since this will ensure that p5.party.js is reloaded, it just might cause more hassle for the user
    newScript.onerror = () => (reloadPage = true);
    // Actually injects the new script into the <head> section of the live webpage, so the browser actually sees it, recognizes that the file has not been ran before (with its current name), and runs it
    document.head.appendChild(newScript);
  })
}

function checkPageReload() {
  if (reloadPage === true) {
    // Refreshes entire webpage, window.location is the current webpage URL, and .reload() forces the browser to reload said URL
    window.location.reload();
  }
}

function displayPlayingScreen() {
  displayGrid();
  displayShipBar();

  push();

  textAlign(LEFT, TOP);

  fill(100, 255, 130);
  textStyle(BOLD);
  textSize(subtitleTextSize * 0.8);
  text("Connected!", 25 * gameScale, 25 * gameScale);
  
  fill(255);
  textStyle(NORMAL);
  textSize(subtitleTextSize * 0.65);

  text("Player 1: " + (game.player1Username), 25 * gameScale, 80 * gameScale);
  text("Player 2: " + (game.player2Username), 25 * gameScale, 125 * gameScale)

  pop();
}