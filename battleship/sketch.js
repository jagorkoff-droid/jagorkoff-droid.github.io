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

let usernameInputBox;
let joinCodeInputBox;

let startScreenBackground;
let startScreenBackgroundZoom = 1.05;
let titleTextSize, subtitleTextSize;

let roomCode = "";

let game = {};
let winner = "";

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

let dragOffsetX = 0;
let dragOffsetY = 0;

let dragStartX = -1;
let dragStartY = -1;
let dragStartPlaced = false;
let dragStartHorizontal = true;

let previewX = -1;
let previewY = -1;

let aimPreviewIcon;
let fireIcon;
let missIcon;
let hitIcon;

let gameBackgroundMusic;
let hitSound;
let missSound;

let myShipGrid;
let myAttackGrid;
let myAttackResultGrid;

let lastProccesedShotNumber = 0;

let myHitsTaken = 0;

let lastSeenRestartNumber = 0;
let restartWaiting = false;

let finalHitDisplayStart = 0;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  rectMode(CENTER);

  // Variable to scale game proportionally
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
  aimPreviewIcon = await loadImage("aim-peview-icon.png");
  fireIcon = await loadImage("fire-icon.png");
  missIcon = await loadImage("miss-icon.png");
  hitIcon = await loadImage("hit-icon.png");

  // Load sounds
  gameBackgroundMusic = await createAudio("game-background-music.mp3");
  hitSound = await loadSound("hit-sound.mp3");
  missSound = await loadSound("miss-sound.mp3");

  // Scaled text sizes
  titleTextSize = 150 * gameScale;
  subtitleTextSize = 40 * gameScale;

  // Username input box
  usernameInputBox = createInput("");
  usernameInputBox.attribute("placeholder", "Enter your username...");
  usernameInputBox.attribute("maxlength", "15");
  usernameInputBox.style("width", (400 * gameScale) + "px");
  usernameInputBox.style("padding", (12 * gameScale) + "px");
  usernameInputBox.style("font-size", (24 * gameScale) + "px");
  usernameInputBox.style("box-sizing", "border-box");
  usernameInputBox.hide();

  // Room code input box
  joinCodeInputBox = createInput("");
  joinCodeInputBox.attribute("placeholder", "Enter 6-digit code...");
  joinCodeInputBox.attribute("maxlength", "6");
  joinCodeInputBox.input(() => {joinCodeInputBox.value(joinCodeInputBox.value().replace(/\D/g, ""))});
  joinCodeInputBox.style("width", (400 * gameScale) + "px");
  joinCodeInputBox.style("padding", (12 * gameScale) + "px");
  joinCodeInputBox.style("font-size", (24 * gameScale) + "px");
  joinCodeInputBox.style("box-sizing", "border-box");
  joinCodeInputBox.hide();
}

function draw() {
  checkPageReload();
  background(220);

  processGame();

  displayGameScreens();
  startMusic();
}

function displayGameScreens() {
  if (gameState !== "username") {
    usernameInputBox.hide();
  }

  if (gameState !== "join") {
    joinCodeInputBox.hide();
  }

  if (connected && game.player1Username && game.player2Username) {
    if (bothPlayersConnectedTime === 0) {
      bothPlayersConnectedTime = millis();
    }

    if (millis() - bothPlayersConnectedTime >= 1500) {
      gameState = "playing";
    }
  }

  if (game.winner && lastProccesedShotNumber >= game.shotResolvedNumber) {
    if (finalHitDisplayStart === 0) {
      finalHitDisplayStart = millis();
    }

    if (millis() - finalHitDisplayStart >= 1500) {
      gameState = "won";
    }
  }
  else {
    finalHitDisplayStart = 0;
  }

  if (gameState === "menu") {
    displayStartScreen();
  }
  else if (gameState === "create") {
    displayWaitingScreen("Create Game");
  }
  else if (gameState === "join") {
    displayWaitingScreen("Join Game");
  }
  else if (gameState === "username") {
    displayUsernameScreen();
  }
  else if (gameState === "playing") {
    displayPlayingScreen();
  }
  else if (gameState === "won") {
    displayWinScreen();
  }
}

function displayBackground() {
  image(startScreenBackground, width / 2 - (width * startScreenBackgroundZoom) / 2, height / 2 - (height * startScreenBackgroundZoom) / 2, width * startScreenBackgroundZoom, height * startScreenBackgroundZoom);

  fill(0, 0, 0, 160);
  rect(width / 2, height / 2, width, height);
}

function displayStartScreen() {
  displayBackground();

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

  rect(x, y, w, h, 15 * gameScale);

  fill(255);
  textSize(subtitleTextSize);
  textStyle(BOLD);

  text(buttonText, x, y);
}

function displayWaitingScreen(title) {
  displayBackground();

  fill(255);
  textStyle(BOLD);
  textSize(titleTextSize / 2);

  text(title, width / 2, height * 0.3);

  textStyle(NORMAL);
  textSize(subtitleTextSize);
  fill(200);

  if (gameState === "create") {
    text("Share this code with your opponent!", width / 2, height * 0.375);

    textSize(titleTextSize * 0.6);
    fill(255, 220, 80);
    text(roomCode, width / 2, height * 0.55);
  }
  else {
    text("Enter your opponents room code:", width / 2, height * 0.375);

    joinCodeInputBox.position(width / 2 - 200 * gameScale, height * 0.55 - 20 * gameScale);
    joinCodeInputBox.show();

    if (!game.guestConnecting) {
      displayMenuButton(height * 0.7, "Join Game");
    }
  }

  if (connecting) {
    textStyle(NORMAL);
    fill(255, 220, 80);
    textSize(subtitleTextSize);
    text("Connecting to server...", width / 2, height * 0.625);
  }
  else if (connected) {
    textStyle(NORMAL);
    fill(100, 255, 130);
    textSize(subtitleTextSize);
    text("Connected!", width / 2, height * 0.625);
  }

  if (!game.guestConnecting) {
    displayMenuButton(height * 0.85, "Back");
  }
}

function displayUsernameScreen() {
  displayBackground();

  fill(255);
  textSize(titleTextSize * 0.75);
  textStyle(BOLD);
  text("Enter Your Username", width / 2, height * 0.3);

  usernameInputBox.position(width / 2 - 200 * gameScale, height * 0.55 - 20 * gameScale);
  usernameInputBox.show();

  displayMenuButton(height * 0.7, "Continue");
  displayMenuButton(height * 0.85, "Back");
}

function keyPressed() {
  if (gameState === "playing" && draggingShip && (key === "r" || key === "R")) {
    // Adjust the cells in a way such that the grabbed cell stays beneath the mouse
    if (ships[selectedShip].horizontal) {
      dragOffsetY = dragOffsetX;
      dragOffsetX = 0;
    }
    else {
      dragOffsetX = dragOffsetY;
      dragOffsetY = 0;
    }

    ships[selectedShip].horizontal = !ships[selectedShip].horizontal;

    previewX = getGridX() - dragOffsetX;
    previewY = getGridY() - dragOffsetY;
  }
}

function displayGrid() {
  fill(30, 100, 150);

  push();

  stroke(255);
  strokeWeight(2 * gameScale);
  for (let y = 0; y < SQUARE_COUNT; y++) {
    for (let x = 0; x < SQUARE_COUNT; x++) {

      // Display square at proper location to build a centred grid
      square(x * cellSize + gridStartPointX, y * cellSize + gridStartPointY, cellSize);
    }
  }

  pop();
}

function displayAimingGrid() {
  displayGrid();

  push();
  imageMode(CENTER);

  for (let y = 0; y < SQUARE_COUNT; y++) {
    for (let x = 0; x < SQUARE_COUNT; x++) {
      let cellX = gridStartPointX + x * cellSize;
      let cellY = gridStartPointY + y * cellSize;

      if (myAttackResultGrid[y][x] === "H") {
        image(hitIcon, cellX, cellY, cellSize * 0.8, cellSize * 0.8);
      }
      else if (myAttackResultGrid[y][x] === "M") {
        image(missIcon, cellX, cellY, cellSize * 0.8, cellSize * 0.8);
      }
      else if (myAttackResultGrid[y][x] === "F") {
        image(fireIcon, cellX, cellY, cellSize * 0.8, cellSize * 0.8);
      }
    }
  }

  if (game.whoseTurn === myPlayerNumber) {
    let x = getGridX();
    let y = getGridY();

    if (x >= 0 && x < SQUARE_COUNT && y >= 0 && y < SQUARE_COUNT && myAttackGrid[y][x] === 0) {
      let cellX = gridStartPointX + x * cellSize;
      let cellY = gridStartPointY + y * cellSize;

      image(aimPreviewIcon, cellX, cellY, cellSize * 0.8, cellSize * 0.8);
    }

  }

  pop();
}

function displayPlacedAndDraggedShips() {
  for (let i = 0; i < ships.length; i++) {
    let ship = ships[i];

    // Skips any ships that have not been placed, unless they are currently being dragged
    if (!ship.placed && !(draggingShip && selectedShip === i)) {
      continue;
    }

    // Uses the preview coordinates for a ship currently being dragged
    let shipX = (draggingShip && selectedShip === i) ? previewX : ship.x;
    let shipY = (draggingShip && selectedShip === i) ? previewY : ship.y;

    let shipWidth = ship.horizontal ? ship.length : 1;
    let shipHeight = ship.horizontal ? 1 : ship.length;

    let centreX = gridStartPointX + (shipX + (shipWidth - 1) / 2) * cellSize;
    let centreY = gridStartPointY + (shipY + (shipHeight - 1) / 2) * cellSize;

    let shipWidthPixels = ship.length * cellSize;
    let shipHeightPixels = cellSize;

    push();

    translate(centreX, centreY);

    // Rotates vertical ships
    if (!ship.horizontal) {
      rotate(PI / 2);
    }

    // Hull
    fill(55, 62, 68);
    rect(0, 0, shipWidthPixels, shipHeightPixels, 15 * gameScale);

    // Deck
    fill(90, 105, 110);
    rect(0, 0, shipWidthPixels - (shipHeightPixels - shipHeightPixels * 0.6), shipHeightPixels * 0.6, 15 * gameScale);

    // Bridge
    fill(135, 140, 145);
    rect(0, 0, shipWidthPixels * 0.2, shipHeightPixels * 0.4, 3 * gameScale);

    pop();
  }
}

function generateBlankGrid(SQUARE_COUNT, fillValue = 0) {
  let newGrid = [];
  
  for (let y = 0; y < SQUARE_COUNT; y++) {
    newGrid.push([]);
    for (let x = 0; x < SQUARE_COUNT; x++) {
      newGrid[y].push(fillValue);
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
    if (ships[i].placed || (draggingShip && selectedShip === i)) {
      continue;
    }

    let shipY = barY - 150 * gameScale + i * shipSpacing;

    let shipWidth = ships[i].length * cellSize;
    let shipHeight = cellSize;

    // Hull
    fill(55, 62, 68);
    rect(barX, shipY, shipWidth, shipHeight, 15 * gameScale);

    // Deck
    fill(90, 105, 110);
    rect(barX, shipY, shipWidth - (shipHeight - shipHeight * 0.6), shipHeight * 0.6, 15 * gameScale);

    // Bridge
    fill(135, 140, 145);
    rect(barX, shipY, shipWidth * 0.2, shipHeight * 0.4, 3 * gameScale);
  }
}

function mousePressed() {
  if (gameState === "won") {
    if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.5 - 40 * gameScale && mouseY < height * 0.5 + 40 * gameScale) {
      // Play again
      restartGame();
    }
    else if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.7 - 40 * gameScale && mouseY < height * 0.7 + 40 * gameScale) {
      // Go back to menu
      disconnectFromGame();
      gameState = "menu";
    }

    return;
  }

  if (gameState === "playing") {
    if (game.gameStarted) {
      fireAtShipCell(getGridX(), getGridY());
      return;
    }

    if (!fleetDeployed) {
      let gridRight = gridStartPointX + cellSize * (SQUARE_COUNT - 0.5);
      let buttonX = (gridRight + width) / 2;
      let buttonY = height / 2;
      let buttonWidth = 600 * gameScale;
      let buttonHeight = 200 * gameScale;

      if (mouseX >= buttonX - buttonWidth / 2 && mouseX <= buttonX + buttonWidth / 2 && mouseY >= buttonY - buttonHeight / 2 && mouseY <= buttonY + buttonHeight / 2) {
        deployFleet();
        return;
      }

      selectClickedShip();
    }

    return;
  }

  if (gameState === "menu") {
    if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.5 - 40 * gameScale && mouseY < height * 0.5 + 40 * gameScale) {
      previousGameState = "create";
      usernameInputBox.value("");
      gameState = "username";
    }
    else if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.65 - 40 * gameScale && mouseY < height * 0.65 + 40 * gameScale) {
      previousGameState = "join";
      usernameInputBox.value("");
      gameState = "username";
    }
  }

  else if (gameState === "username") {
    if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.7 - 40 * gameScale && mouseY < height * 0.7 + 40 * gameScale) {
      if (usernameInputBox.value().trim().length > 0) {
        username = usernameInputBox.value().trim();
        
        if (previousGameState === "create") {
          roomCode = nf(floor(random(1000000)), 6);
          gameState = "create";

          connectToGame();
        }
        else if (previousGameState === "join") {
          joinCodeInputBox.value("");
          gameState = "join";
        }
      }
    }

    else if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.85 - 40 * gameScale && mouseY < height * 0.85 + 40 * gameScale) {
      usernameInputBox.value("");
      gameState = "menu";
    }
  }

  else if (gameState === "join") {
    if (!game.guestConnecting) {
      if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.7 - 40 * gameScale && mouseY < height * 0.7 + 40 * gameScale) {
        if (/^\d{6}$/.test(joinCodeInputBox.value())) {
          roomCode = joinCodeInputBox.value();

          connectToGame();
        }
      }

      else if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.85 - 40 * gameScale && mouseY < height * 0.85 + 40 * gameScale) {
        disconnectFromGame();

        joinCodeInputBox.value("");

        gameState = "menu";
      }
    }
  }
}

async function connectToGame() {
  if (connecting || connected) {
    return;
  }

  connecting = true;

  await p5party.connect("wss://demoserver.p5party.org", "battleship-cs30-wmci-jg-iL8RT%b7a3GOE8zk2@qOcYyhdlkIt4Ns7*2eVGmbVTkKCzigPUkV840hg6KNpklEe3^^+i8t354P%su@IGD%$vtSEvLJjb!sj@", roomCode);

  console.log("Connected to room: ", roomCode);

  game = await p5party.loadShared("game", {
    player1Username: "",
    player2Username: "",
    winner: "",

    guestConnecting: false,
    gameStarted: false,

    player1FleetDeployed: false,
    player2FleetDeployed: false,

    whoseTurn: 1,
    shotNumber: 0,
    shotResolvedNumber: 0,

    shotX: -1,
    shotY: -1,
    shotBy: -1,
    shotResult: "",

    restartNumber: 0,
    player1RestartReady: false,
    player2RestartReady: false,
  });

  lastSeenRestartNumber = game.restartNumber;

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

  if (gameBackgroundMusic && gameBackgroundMusic.playing) {
    gameBackgroundMusic.stop();
  }

  connected = false;
  connecting = false;

  game = {};
  myPlayerData = undefined;
  otherPlayerData = undefined;
  bothPlayersConnectedTime = 0;

  myPlayerNumber = -1;

  restartWaiting = false;
  lastSeenRestartNumber = 0;

  resetLocalGame();

  roomCode = "";
  joinCodeInputBox.value("");

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
    // Sets the source file path to the p5.party.js library, and adds the current time to it in milliseconds, as browsers only run scripts that have not been ran already, and adding the date guarantees that file has never been ran before
    newScript.src = "libraries/p5.party.js?" + Date.now();
    // Sets up a listener that runs the exact moment the browser finishes downloading then executing p5.party.js (the new blank one), resolve tells await (called from disconnectFromGame()) that window.p5party is ready to be used again
    newScript.onload = () => resolve();
    // Reloads the page if an error occurs, since this will ensure that p5.party.js is reloaded, it just might cause more hassle for the user
    newScript.onerror = () => (reloadPage = true);
    // Actually injects the new script into the <head> section of the live webpage, so the browser actually sees it, recognizes that the file has not been ran before (with its current name), and runs it
    document.head.appendChild(newScript);
  });
}

function checkPageReload() {
  if (reloadPage === true) {
    // Refreshes entire webpage, window.location is the current webpage URL, and .reload() forces the browser to reload said URL
    window.location.reload();
  }
}

function displayPlayingScreen() {
  if (game.gameStarted) {
    let gridLeft = (width - cellSize * SQUARE_COUNT) / 2;

    displayAimingGrid()

    push();

    textAlign(CENTER, CENTER);
    textSize(subtitleTextSize);
    fill(255);

    if (game.whoseTurn === myPlayerNumber) {
      text("Your Turn!", gridLeft / 2, height / 2);
    }
    else {
      text("Opponent's Turn...", gridLeft / 2, height / 2);
    }

    pop();
  }
  else {
    displayGrid();

    if (!fleetDeployed) {
      displayShipBar();
    }

    displayDeployFleetButon();
    displayPlacedAndDraggedShips();
  }

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
  text("Player 2: " + (game.player2Username), 25 * gameScale, 125 * gameScale);

  pop();
}

function getGridX() {
  return floor((mouseX - (gridStartPointX - cellSize / 2)) / cellSize);
}

function getGridY() {
  return floor((mouseY - (gridStartPointY - cellSize / 2)) / cellSize);
}

function canPlaceShip(shipIndex, x, y) {
  let ship = ships[shipIndex];

  let shipWidth = ship.horizontal ? ship.length : 1;
  let shipHeight = ship.horizontal ? 1 : ship.length;

  // Checks grid boundaries
  if (x < 0 || y < 0 || x+ shipWidth > SQUARE_COUNT || y + shipHeight > SQUARE_COUNT) {
    return false;
  }

  // Checks for overlapping ships
  for (let i = 0; i < ships.length; i++) {
    if (i === shipIndex || !ships[i].placed) {
      continue;
    }

    let otherShip = ships[i];
    let otherShipWidth = otherShip.horizontal ? otherShip.length : 1;
    let otherShipHeight = otherShip.horizontal ? 1 : otherShip.length;

    let overlaps = x < otherShip.x + otherShipWidth && x + shipWidth > otherShip.x && y < otherShip.y + otherShipHeight && y + shipHeight > otherShip.y;

    if (overlaps) {
      return false;
    }
  }

  return true;
}

function beginShipDrag(shipIndex, offsetX, offsetY) {
  selectedShip = shipIndex;
  draggingShip = true;

  dragOffsetX = offsetX;
  dragOffsetY = offsetY;

  dragStartX = ships[shipIndex].x;
  dragStartY = ships[shipIndex].y;
  dragStartPlaced = ships[shipIndex].placed;
  dragStartHorizontal = ships[shipIndex].horizontal;

  previewX = getGridX() - dragOffsetX;
  previewY = getGridY() - dragOffsetY;
}

function selectClickedShip() {
  let barX = ((width - cellSize * SQUARE_COUNT) / 2) / 2;
  let barY = height / 2;
  let shipSpacing = 150 * gameScale;

  // Checks every ship in the ship bar
  for (let i = 0; i < ships.length; i++) {
    if (ships[i].placed) {
      continue;
    }

    let shipY = barY - 150 * gameScale + i * shipSpacing;
    let shipWidth = ships[i].length * cellSize;

    if (mouseX >= barX - shipWidth / 2 && mouseX <= barX + shipWidth / 2 && mouseY >= shipY - cellSize / 2 && mouseY <= shipY + cellSize / 2) {
      let offsetX = floor((mouseX - (barX - shipWidth / 2)) / cellSize);
      beginShipDrag(i, offsetX, 0);

      return true;
    }
  }

  // Checks ships already on the grid
  let gridX = getGridX();
  let gridY = getGridY();

  for (let i = 0; i < ships.length; i ++) {
    let ship = ships[i];

    if (!ship.placed) {
      continue;
    }

    let shipWidth = ship.horizontal ? ship.length : 1;
    let shipHeight = ship.horizontal ? 1 : ship.length;

    if (gridX >= ship.x && gridX < ship.x + shipWidth && gridY >= ship.y && gridY < ship.y + shipHeight) {
      beginShipDrag(i, gridX - ship.x, gridY - ship.y);

      return true;
    }
  }

  return false;
}

function mouseDragged() {
  if (gameState === "playing" && draggingShip) {
    previewX = getGridX() - dragOffsetX;
    previewY = getGridY() - dragOffsetY;
  }
}

function mouseReleased() {
  if (!draggingShip) {
    return;
  }

  if (canPlaceShip(selectedShip, previewX, previewY)) {
    ships[selectedShip].x = previewX;
    ships[selectedShip].y = previewY;
    ships[selectedShip].placed = true;
  }

  else {
    ships[selectedShip].x = dragStartX;
    ships[selectedShip].y = dragStartY;
    ships[selectedShip].placed = dragStartPlaced;
    ships[selectedShip].horizontal = dragStartHorizontal;
  }

  selectedShip = -1;
  draggingShip = false;

  previewX = -1;
  previewY = -1;
}

function fleetReady() {
  for (let i = 0; i < ships.length; i++) {
    if (!ships[i].placed) {
      return false;
    }
  }

  return true;
}

function displayDeployFleetButon() {
  let gridRight = gridStartPointX + cellSize * (SQUARE_COUNT - 0.5);
  let buttonX = (gridRight + width) / 2;
  let buttonY = height / 2;
  let buttonWidth = 600 * gameScale;
  let buttonHeight = 200 * gameScale;

  let hovering = (mouseX >= buttonX - buttonWidth / 2 && mouseX <= buttonX + buttonWidth / 2 && mouseY >= buttonY - buttonHeight / 2 && mouseY <= buttonY + buttonHeight / 2);

  let ready = fleetReady();

  if (fleetDeployed) {
    fill(80, 170, 115);
  }
  else if (ready) {
    if (hovering) {
      fill(0, 70, 140);
    }
    else {
      fill(20, 100, 180);
    }
  }
  else {
    fill(100);
  }

  rect(buttonX, buttonY, buttonWidth, buttonHeight, 12 * gameScale);

  fill(255);
  textSize(titleTextSize / 2);
  textStyle(BOLD);

  if (fleetDeployed) {
    text("Fleet Deployed!", buttonX, buttonY);
  }
  else {
    text("Deploy Fleet", buttonX, buttonY);
  }
}

function deployFleet() {
  if (!fleetReady() || fleetDeployed) {
    return;
  }

  buildMyShipGrid();

  fleetDeployed = true;

  if (myPlayerNumber === 1) {
    game.player1FleetDeployed = true;
  }
  else if (myPlayerNumber === 2) {
    game.player2FleetDeployed = true;
  }

  if (game.player1FleetDeployed && game.player2FleetDeployed) {
    game.gameStarted = true;
  }
}

function buildMyShipGrid() {
  myHitsTaken = 0;

  myShipGrid = generateBlankGrid(SQUARE_COUNT, "O");

  for (let i = 0; i < ships.length; i++) {
    let ship = ships[i];

    for (let j = 0; j < ship.length; j++) {
      let x = ship.x + (ship.horizontal ? j : 0);
      let y = ship.y + (ship.horizontal ? 0 : j);

      // "X" means ship is occupying location, "O" means it is empty so it is water
      myShipGrid[y][x] = "X"
    }
  }

  myAttackGrid = generateBlankGrid(SQUARE_COUNT, 0);

  myAttackResultGrid = generateBlankGrid(SQUARE_COUNT, "");
}

function fireAtShipCell(x, y) {
  if (!game.gameStarted || game.winner || game.whoseTurn !== myPlayerNumber) {
    return;
  }
  if (x < 0 || x >= SQUARE_COUNT || y < 0 || y >= SQUARE_COUNT) {
    return;
  }
  if (myAttackGrid[y][x] === 1) {
    return;
  }
  if (game.shotNumber > game.shotResolvedNumber) {
    return;
  }

  myAttackGrid[y][x] = 1;
  myAttackResultGrid[y][x] = "F";

  game.shotX = x;
  game.shotY = y;
  game.shotBy = myPlayerNumber;
  game.shotResult = "";
  game.shotNumber++;
}

function processShot() {
  if (!game.gameStarted || !myShipGrid) {
    return;
  }

  if (game.shotNumber <= game.shotResolvedNumber) {
    return;
  }

  if (game.shotBy === myPlayerNumber) {
    return;
  }

  let x = game.shotX;
  let y = game.shotY;

  if (x < 0 || x >= SQUARE_COUNT || y < 0 || y >= SQUARE_COUNT) {
    return;
  }

  if (myShipGrid[y][x] === "X") {
    // Hit
    game.shotResult = "H";
    myHitsTaken++;

    if (myHitsTaken === 17) {
      game.winner = game.shotBy === 1 ? game.player1Username : game.player2Username;
    }
  }
  else {
    // Miss
    game.shotResult = "M";
  }

  game.shotResolvedNumber = game.shotNumber;
  lastProccesedShotNumber = game.shotResolvedNumber;

  if (!game.winner) {
    game.whoseTurn = 3 - game.shotBy;
  }
}

function processShotResult() {
  if (!game.gameStarted && !game.winner) {
    return;
  }

  if (game.shotResolvedNumber <= lastProccesedShotNumber) {
    return;
  }

  if (game.shotBy !== myPlayerNumber) {
    return;
  }

  let x = game.shotX;
  let y = game.shotY;

  if (game.shotResult === "H") {
    myAttackResultGrid[y][x] = "H";

    hitSound.play();
  }
  else if (game.shotResult === "M") {
    myAttackResultGrid[y][x] = "M";

    missSound.play();
  }

  lastProccesedShotNumber = game.shotResolvedNumber;
}

function processGame() {
  processShot();
  processShotResult();
  processRestart();
}

function startMusic() {
  if (game.player1Username && game.player2Username && !gameBackgroundMusic.playing) {
    gameBackgroundMusic.volume(0.1);
    gameBackgroundMusic.play()
    gameBackgroundMusic.loop()
  }
}

function displayWinScreen() {
  displayBackground();

  fill(255, 220, 80);
  textSize(titleTextSize * 0.8);
  textStyle(BOLD);
  text(game.winner + " Won!", width / 2, height * 0.3);

  if (restartWaiting) {
    fill(255);
    textSize(subtitleTextSize);
    textStyle(NORMAL);
    text("Waiting for opponent...", width / 2, height * 0.4);
  }

  if (!restartWaiting) {
    displayMenuButton(height * 0.5, "Play Again");
  }

  displayMenuButton(height * 0.7, "Back to Menu");
}

function restartGame() {
  if (restartWaiting || !connected || !game.winner) {
    return;
  }

  restartWaiting = true;

  if (myPlayerNumber === 1) {
    game.player1RestartReady = true;
  }
  else if (myPlayerNumber === 2) {
    game.player2RestartReady = true;
  }
}

function processRestart() {
  if (!connected || game.restartNumber === undefined) {
    return;
  }
  // Only the party host is allowed to reset the shared game
  if (p5party.isHost() && game.winner && game.player1RestartReady && game.player2RestartReady) {
    game.gameStarted = false;

    game.player1FleetDeployed = false;
    game.player2FleetDeployed = false;

    game.whoseTurn = 1;

    game.shotNumber = 0;
    game.shotResolvedNumber = 0;

    game.shotX = -1;
    game.shotY = -1;
    game.shotBy = -1;
    game.shotResult = "";

    game.winner = "";

    game.player1RestartReady = false;
    game.player2RestartReady = false;

    game.restartNumber++;
  }

  if (game.restartNumber !== lastSeenRestartNumber) {
    resetLocalGame();

    lastSeenRestartNumber = game.restartNumber;
    restartWaiting = false;

    gameState = "playing";
  }
}

function resetLocalGame() {
  for (let i = 0; i < ships.length; i++) {
    ships[i].placed = false;
    ships[i].x = -1;
    ships[i].y = -1;
    ships[i].horizontal = true;
  }

  selectedShip = -1;
  draggingShip = false;
  fleetDeployed = false;

  dragOffsetX = 0;
  dragOffsetY = 0;

  dragStartX = -1;
  dragStartY = -1;
  dragStartPlaced = false;
  dragStartHorizontal = true;

  previewX = -1;
  previewY = -1;

  myShipGrid = undefined;
  myAttackGrid = generateBlankGrid(SQUARE_COUNT, 0);
  myAttackResultGrid = generateBlankGrid(SQUARE_COUNT, "");

  myHitsTaken = 0;
  lastProccesedShotNumber = 0;
  finalHitDisplayStart = 0;
}