// Grid-Based Game
// James Gorkoff
// November 23, 2026
//
// Extra for Experts:
// - Used p5.party to allow two players to create and join games using unique room codes
// - Used shared game data between players including turns, shots, results, deployment, and restarts to allow both players to interact from different machines
// - Created a multiplayer chat system that displays messages between players
// - Used script injection to reload the p5.party library, allowing the multiplayer connection to be recreated from scratch when disconnecting from game
// - Learned how to inject and find HTML script elements in a webpage, and how to trick a browser into treating the script as a new resource, preventing it from using an older cached copy (cache busting)
// - Created and positioned HTML text input boxes, allowing players to seamlessly enter usernames, room codes, and chat messages
// - Used HTML input elements to style, position, show, and hide input boxes depending on the current game screen
// - Used JS event listeners to detect keyboard input, allowing players to send chat messages via the keyboard
// - Used input checking using regular expressions to ensure room codes contain only digits

// General default settings
const SQUARE_COUNT = 12;

let gameState = "menu";
let previousGameState = "";
let reloadPage = false;

// Grid positioning and screen scaling
let cellSize;
let gridStartPointX, gridStartPointY;
let scaleX, scaleY, gameScale;
let titleTextSize, subtitleTextSize;

// Player information
let username = "";
let myPlayerNumber = -1;

// Structured input boxes
let usernameInputBox;
let joinCodeInputBox;
let chatInputBox;

// Multiplayer connection
let roomCode = "";
let game = {};
let connected = false;
let connecting = false;
let bothPlayersConnectedTime = 0;

// Ships and fleet placement
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

// Play grids
let myShipGrid;
let myAttackGrid;
let myAttackResultGrid;
let myHitsTaken = 0;

// Restart and turn tracking
let lastProcessedShotNumber = 0;
let lastSeenRestartNumber = 0;
let restartWaiting = false;
let finalHitDisplayStart = 0;

// Images
let startScreenBackground;
let startScreenBackgroundZoom = 1.05;

let aimPreviewIcon;
let fireIcon;
let missIcon;
let hitIcon;

// Sounds
let gameBackgroundMusic;
let hitSound;
let missSound;

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

  // Calculates the starting points needed to centre the grid
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
  // Creates an HTML text input element
  usernameInputBox = createInput("");
  // Sets an HTML attribute on the input element, "placeholder" tells the browser to display text inside of the empty input box
  usernameInputBox.attribute("placeholder", "Enter your username...");
  // "maxlength" is an HTML attribute that limits how many characters a user can type
  usernameInputBox.attribute("maxlength", "15");
  // ".style" changes the CSS styling, "width" tells CSS to change the width, which is the calculated size plus "px", the pixel unit so CSS understands the measurement
  usernameInputBox.style("width", (400 * gameScale) + "px");
  // Same thing here except we are changing internal spacing, the space between the text inside the box and the edges of the box
  usernameInputBox.style("padding", (12 * gameScale) + "px");
  // Same thing again, but changing how tall the text is by pixels
  usernameInputBox.style("font-size", (24 * gameScale) + "px");
  // Makes the specified width include the content and the padding instead of being outside the specified width
  usernameInputBox.style("box-sizing", "border-box");
  // Makes input box invisible when it is first created
  usernameInputBox.hide();

  // Room code input box
  joinCodeInputBox = createInput("");
  joinCodeInputBox.attribute("placeholder", "Enter 6-digit code...");
  joinCodeInputBox.attribute("maxlength", "6");
  // Removes any typed characters that are not numbers
  // Attaches an input event to the HTML input box, the arrow function tells p5.js what to do when said event occurs, the {} contain the instructions that should be ran, ".value()" retrieves the current contents of the input box, ".replace()" is a built-in JS string method which searches through a string for something matching a specific pattern to replace it, "/" marks the start or end of the regex (regular expression), "\D" is part of the search pattern, meaning not letters, not spaces, not punctuation, and other non-digit characters, "g" means global so JS should find every matching character not just the first one, anything matching said search pattern is replaced with an empty string, so it becomes nothing
  joinCodeInputBox.input(() => {
    joinCodeInputBox.value(joinCodeInputBox.value().replace(/\D/g, ""));
  });
  joinCodeInputBox.style("width", (400 * gameScale) + "px");
  joinCodeInputBox.style("padding", (12 * gameScale) + "px");
  joinCodeInputBox.style("font-size", (24 * gameScale) + "px");
  joinCodeInputBox.style("box-sizing", "border-box");
  joinCodeInputBox.hide();

  // Chat input box
  chatInputBox = createInput("");
  chatInputBox.attribute("placeholder", "Type a message...");
  chatInputBox.attribute("maxlength", "100");
  chatInputBox.style("width", (400 * gameScale) + "px");
  chatInputBox.style("padding", (10 * gameScale) + "px");
  chatInputBox.style("font-size", (20 * gameScale) + "px");
  chatInputBox.style("box-sizing", "border-box");
  chatInputBox.hide();
  // Sends the chat message when the Enter key is pressed
  // ".elt" gives access to the actual HTML element behind the p5.js input box (allowing us to use standard JS features not necessarily provided to us by p5.js rather than p5.js's built in functions), ".addEventListener" is a JS method telling HTML to listen for an event, the event is "keydown", and "(event)" is the information received during the event, which we then execute what is in the {} during the event, "event.key" accesses the "key" property of the event object to check whether the enter key was pressed, if the enter key was pressed, "event.preventDefault()" prevents the browser from performing the default action associated with an event, then we call our "sendChatMessage()" function, sending the message
  chatInputBox.elt.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendChatMessage();
    }
  });
}

function draw() {
  // Reloads the page if p5.party needs to be restarted due to my script injector failing
  checkPageReload();

  background(103, 105, 122);

  // Updates shots, their results, and restarts
  processGame();

  // Displays whichever screen matches the current game state variable
  displayGameScreens();

  // Starts background music once both players have joined
  startMusic();
}

function checkPageReload() {
  if (reloadPage === true) {
    // Refreshes entire webpage, window.location is the current webpage URL, and .reload() forces the browser to reload said URL
    window.location.reload();
  }
}

function processGame() {
  // Checks whether the opponent fired at this player's grid
  processShot();

  // Checks whether this player's shot has received a result
  processShotResult();

  // Checks whether both players are ready to restart
  processRestart();
}

function startMusic() {
  // Starts looping through the background music once both players have joined and the music is not already playing
  if (game.player1Username && game.player2Username && !gameBackgroundMusic.playing) {
    gameBackgroundMusic.volume(0.1);
    gameBackgroundMusic.play();
    gameBackgroundMusic.loop();
  }
}

function displayGameScreens() {
  // Hides input boxes that do not belong on the current screen
  if (gameState !== "username") {
    usernameInputBox.hide();
  }

  if (gameState !== "join") {
    joinCodeInputBox.hide();
  }

  if (gameState !== "playing") {
    chatInputBox.hide();
  }

  // Starts the game 1.5 seconds after both players have connected, so that both players see the "Connected!" text after connecting
  if (connected && game.player1Username && game.player2Username) {
    if (bothPlayersConnectedTime === 0) {
      bothPlayersConnectedTime = millis();
    }

    if (millis() - bothPlayersConnectedTime >= 1500) {
      gameState = "playing";
    }
  }

  // Waits 1.5 seconds after the final hit before showing the win screen
  if (game.winner && lastProcessedShotNumber >= game.shotResolvedNumber) {
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

  // Displays the screen matching the current game state
  if (gameState === "menu") {
    displayStartScreen();
  }
  else if (gameState === "create") {
    displayWaitingScreen("Create Game");
  }
  else if (gameState === "join") {
    displayWaitingScreen("Join Game");
  }
  else if (gameState === "tutorial") {
    displayTutorialScreen();
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
  // Displays the background image slightly larger than the screen to evade a watermark
  image(startScreenBackground, width / 2 - (width * startScreenBackgroundZoom) / 2, height / 2 - (height * startScreenBackgroundZoom) / 2, width * startScreenBackgroundZoom, height * startScreenBackgroundZoom);

  // Adds a dark transparent overlay to the image
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
  // Tutorial
  displayMenuButton(height * 0.8, "How to Play");
}

function displayTutorialScreen() {
  displayBackground();

  fill(255, 220, 80);
  textSize(titleTextSize * 0.75);
  textStyle(BOLD);
  text("How to Play" ,width / 2, height * 0.2);

  fill(255);
  textSize(subtitleTextSize);
  textStyle(NORMAL);

  // Tutorial steps
  text("1. Create a game or join a friend's game.", width / 2, height * 0.35);
  text("2. Drag your ships from your Fleet Dock to your sea grid.", width / 2, height * 0.45);
  text("3. Press R while dragging to rotate your selected ship.", width / 2, height * 0.55);
  text("4. Take turns firing missiles at your opponent's sea grid.", width / 2, height * 0.65);
  text("5. Destroy all five of the enemy ships to win!", width / 2, height * 0.75);

  displayMenuButton(height * 0.92, "Back");
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

  // Shows the room code for the player creating a game
  if (gameState === "create") {
    text("Share this code with your opponent!", width / 2, height * 0.375);

    textSize(titleTextSize * 0.6);
    fill(255, 220, 80);
    text(roomCode, width / 2, height * 0.55);
  }
  // Shows the room code input box for the player joining a game
  else {
    text("Enter your opponents room code:", width / 2, height * 0.375);

    joinCodeInputBox.position(width / 2 - 200 * gameScale, height * 0.55 - 20 * gameScale);
    joinCodeInputBox.show();

    // Hides the join game button while the guest is connecting
    if (!game.guestConnecting) {
      displayMenuButton(height * 0.7, "Join Game");
    }
  }

  // Shows current connection status
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

  // Hides the back button while the guest is connecting
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

function displayPlayingScreen() {
  // Shows the attacking grid after both fleets have been deployed
  if (game.gameStarted) {
    let gridLeft = (width - cellSize * SQUARE_COUNT) / 2;

    displayAimingGrid();

    push();

    textAlign(CENTER, CENTER);
    textSize(subtitleTextSize);
    fill(255);

    // Shows whose turn it currently is
    if (game.whoseTurn === myPlayerNumber) {
      text("Your Turn!", gridLeft / 2, height / 2);
    }
    else {
      text("Opponent's Turn...", gridLeft / 2, height / 2);
    }

    pop();
  }
  // Shows the ship placement grid before the game starts
  else {
    displayGrid();

    // Only shows the fleet dock while ships are not deployed
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

  text("Player 1: " + game.player1Username, 25 * gameScale, 80 * gameScale);
  text("Player 2: " + game.player2Username, 25 * gameScale, 125 * gameScale);

  pop();

  displayChat();

  chatInputBox.position(width - 425 * gameScale, 385 * gameScale);
  chatInputBox.show();
}

function displayWinScreen() {
  displayBackground();

  fill(255, 220, 80);
  textSize(titleTextSize * 0.8);
  textStyle(BOLD);
  text(game.winner + " Won!", width / 2, height * 0.3);

  // Shows a waiting message if this player has chosen to restart
  if (restartWaiting) {
    fill(255);
    textSize(subtitleTextSize);
    textStyle(NORMAL);
    text("Waiting for opponent...", width / 2, height * 0.4);
  }

  // Hides the play again button while waiting for the opponent to play again
  if (!restartWaiting) {
    displayMenuButton(height * 0.5, "Play Again");
  }

  displayMenuButton(height * 0.7, "Back to Menu");
}

function displayMenuButton(y, buttonText) {
  let x = width / 2;
  let w = 350 * gameScale;
  let h = 80 * gameScale;

  // Checks if the mouse is inside the button
  let hovering = mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;

  // Changes the button colour when the mouse is hovered over the button
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

function keyPressed() {
  // Rotates the selected ship when R is pressed while dragging
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

function mousePressed() {
  // Handles clicks on the win screen
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

  // Handles ship placement before the fleet is deployed
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

      // Checks whether the deploy fleet button was clicked
      if (mouseX >= buttonX - buttonWidth / 2 && mouseX <= buttonX + buttonWidth / 2 && mouseY >= buttonY - buttonHeight / 2 && mouseY <= buttonY + buttonHeight / 2) {
        deployFleet();
        return;
      }

      // Checks if a ship was clicked
      selectClickedShip();
    }

    return;
  }

  // Handles clicks on the main menu
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
    else if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.8 - 40 * gameScale && mouseY < height * 0.8 + 40 * gameScale) {
      gameState = "tutorial";
    }
  }

  // Handles clicks on the username screen
  else if (gameState === "username") {
    if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.7 - 40 * gameScale && mouseY < height * 0.7 + 40 * gameScale) {
      // Only continues if the trimmed (leading and trailing spaces are removed) username is not empty
      if (usernameInputBox.value().trim().length > 0) {
        username = usernameInputBox.value().trim();
        
        // Creates a new game if the player chose to generate a game
        if (previousGameState === "create") {
          roomCode = nf(floor(random(1000000)), 6);
          gameState = "create";

          connectToGame();
        }
        // Moves to the join a game screen if the player chose to join a game
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

  // Handles clicks on the join screen
  else if (gameState === "join") {
    if (!game.guestConnecting) {
      if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.7 - 40 * gameScale && mouseY < height * 0.7 + 40 * gameScale) {
        // Only connects if the entered code is exactly six digits (not any character)
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

  // Handles clicks on the create game screen
  else if (gameState === "create") {
    if (!game.guestConnecting) {
      if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.85 - 40 * gameScale && mouseY < height * 0.85 + 40 * gameScale) {
        disconnectFromGame();

        gameState = "menu";
      }
    }
  }

  // Handles clicks on the tutorial screen
  if (gameState === "tutorial") {
    if (mouseX > width / 2 - 175 * gameScale && mouseX < width / 2 + 175 * gameScale && mouseY > height * 0.92 - 40 * gameScale && mouseY < height * 0.92 + 40 * gameScale) {
      gameState = "menu";
    }
  }
}

function mouseDragged() {
  // Updates the preview position while dragging a ship
  if (gameState === "playing" && draggingShip) {
    previewX = getGridX() - dragOffsetX;
    previewY = getGridY() - dragOffsetY;
  }
}

function mouseReleased() {
  // Does nothing if no ship is being dragged
  if (!draggingShip) {
    return;
  }

  // Places the ship if its preview position is a valid location
  if (canPlaceShip(selectedShip, previewX, previewY)) {
    ships[selectedShip].x = previewX;
    ships[selectedShip].y = previewY;
    ships[selectedShip].placed = true;
  }

  // Returns the ship to its original position if placement is not valid
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

function generateBlankGrid(SQUARE_COUNT, fillValue = 0) {
  let newGrid = [];
  
  // Creates a 2D grid filled with the chosen value
  for (let y = 0; y < SQUARE_COUNT; y++) {
    newGrid.push([]);
    for (let x = 0; x < SQUARE_COUNT; x++) {
      newGrid[y].push(fillValue);
    }
  }

  return newGrid;
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

  // Displays the result of every shot this player has taken
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

  // Shows an aiming preview on an empty cell during this player's turn
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

function displayShipBar() {
  // Finds the empty space to the left of the game grid
  let gridLeft = (width - cellSize * SQUARE_COUNT) / 2;

  let barX = gridLeft / 2;
  let barY = height / 2;

  let shipSpacing = 150 * gameScale;

  let panelWidth = gridLeft * 0.85;
  let panelHeight = 950 * gameScale;

  // Calculates the top and bottom of the fleet dock rectangle
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
    // Skips ships that have already been placed or are being dragged
    if (ships[i].placed || draggingShip && selectedShip === i) {
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

function displayPlacedAndDraggedShips() {
  for (let i = 0; i < ships.length; i++) {
    let ship = ships[i];

    // Skips any ships that have not been placed, unless they are currently being dragged
    if (!ship.placed && !(draggingShip && selectedShip === i)) {
      continue;
    }

    // Uses the preview coordinates for a ship currently being dragged
    let shipX = draggingShip && selectedShip === i ? previewX : ship.x;
    let shipY = draggingShip && selectedShip === i ? previewY : ship.y;

    // Horizontal ships are longer than they are tall, vertical ships are the opposite
    let shipWidth = ship.horizontal ? ship.length : 1;
    let shipHeight = ship.horizontal ? 1 : ship.length;

    // Finds the centre of the ship so it can be rotated around its middle
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

function getGridX() {
  // Converts the mouse's horizontal position into a grid column
  return floor((mouseX - (gridStartPointX - cellSize / 2)) / cellSize);
}

function getGridY() {
  // Converts the mouse's vertical position into a grid row
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

    // Checks whether the two ships occupy any of the same grid cells
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

  // Saves how far away the mouse was from the ship's starting cell
  dragOffsetX = offsetX;
  dragOffsetY = offsetY;

  // Saves the ship's original placement in case the new position is not valid
  dragStartX = ships[shipIndex].x;
  dragStartY = ships[shipIndex].y;
  dragStartPlaced = ships[shipIndex].placed;
  dragStartHorizontal = ships[shipIndex].horizontal;

  previewX = getGridX() - dragOffsetX;
  previewY = getGridY() - dragOffsetY;
}

function selectClickedShip() {
  let barX = (width - cellSize * SQUARE_COUNT) / 4;
  let barY = height / 2;
  let shipSpacing = 150 * gameScale;

  // Checks every ship in the ship bar
  for (let i = 0; i < ships.length; i++) {
    if (ships[i].placed) {
      continue;
    }

    let shipY = barY - 150 * gameScale + i * shipSpacing;
    let shipWidth = ships[i].length * cellSize;

    // Starts dragging a ship if the mouse is over it
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

    // Starts dragging a placed ship if the mouse is over one of its cells
    if (gridX >= ship.x && gridX < ship.x + shipWidth && gridY >= ship.y && gridY < ship.y + shipHeight) {
      beginShipDrag(i, gridX - ship.x, gridY - ship.y);

      return true;
    }
  }

  return false;
}

function fleetReady() {
  // Checks whether every ship has been placed
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

  // Checks if the mouse is over the deploy fleet button
  let hovering = mouseX >= buttonX - buttonWidth / 2 && mouseX <= buttonX + buttonWidth / 2 && mouseY >= buttonY - buttonHeight / 2 && mouseY <= buttonY + buttonHeight / 2;

  let ready = fleetReady();

  // Changes the colour of the button based on whether the fleet is ready to be deployed or not
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
  // Does nothing if any ships are missing or the fleet is already deployed
  if (!fleetReady() || fleetDeployed) {
    return;
  }

  buildMyShipGrid();

  fleetDeployed = true;

  // Tells the shared game that this player has finished placing their ships
  if (myPlayerNumber === 1) {
    game.player1FleetDeployed = true;
  }
  else if (myPlayerNumber === 2) {
    game.player2FleetDeployed = true;
  }

  // Starts the game once both players have deployed their fleets
  if (game.player1FleetDeployed && game.player2FleetDeployed) {
    game.gameStarted = true;
  }
}

function buildMyShipGrid() {
  myHitsTaken = 0;

  // Creates an empty grid where "O" means water
  myShipGrid = generateBlankGrid(SQUARE_COUNT, "O");

  // Marks every cell occupied by one of this player's ships
  for (let i = 0; i < ships.length; i++) {
    let ship = ships[i];

    for (let j = 0; j < ship.length; j++) {
      let x = ship.x + (ship.horizontal ? j : 0);
      let y = ship.y + (ship.horizontal ? 0 : j);

      // "X" means ship is occupying location, "O" means it is empty so it is water
      myShipGrid[y][x] = "X";
    }
  }

  // Creates empty grids to track this player's shots and their results
  myAttackGrid = generateBlankGrid(SQUARE_COUNT, 0);

  myAttackResultGrid = generateBlankGrid(SQUARE_COUNT, "");
}

function fireAtShipCell(x, y) {
  // Does nothing if it is not this player's turn, the game is over, or the cell is not valid
  if (!game.gameStarted || game.winner || game.whoseTurn !== myPlayerNumber) {
    return;
  }
  if (x < 0 || x >= SQUARE_COUNT || y < 0 || y >= SQUARE_COUNT) {
    return;
  }
  // Does nothing if this player has already fired at that cell
  if (myAttackGrid[y][x] === 1) {
    return;
  }
  // Does nothing if the previous shot has not been resolved yet
  if (game.shotNumber > game.shotResolvedNumber) {
    return;
  }

  // Marks the cell as fired at and waiting for a result
  myAttackGrid[y][x] = 1;
  myAttackResultGrid[y][x] = "F";

  // Sends the shot information to the shared game
  game.shotX = x;
  game.shotY = y;
  game.shotBy = myPlayerNumber;
  game.shotResult = "";
  game.shotNumber++;
}

function processShot() {
  // Does nothing if the game has not started yet or this player's ship grid does not exist
  if (!game.gameStarted || !myShipGrid) {
    return;
  }
  // Does nothing if there are no unresolved shots
  if (game.shotNumber <= game.shotResolvedNumber) {
    return;
  }
  // Does nothing if this player fired the shot, since the opponent must resolve it
  if (game.shotBy === myPlayerNumber) {
    return;
  }

  let x = game.shotX;
  let y = game.shotY;

  if (x < 0 || x >= SQUARE_COUNT || y < 0 || y >= SQUARE_COUNT) {
    return;
  }

  // Checks whether the shot hit one of this player's ships
  if (myShipGrid[y][x] === "X") {
    // Hit
    game.shotResult = "H";
    myHitsTaken++;

    // Ends the game once all 17 ship cells have been hit
    if (myHitsTaken === 17) {
      game.winner = game.shotBy === 1 ? game.player1Username : game.player2Username;
    }
  }
  else {
    // Miss
    game.shotResult = "M";
  }

  // Marks the shot as resolved and changes the turn to the other player
  game.shotResolvedNumber = game.shotNumber;
  lastProcessedShotNumber = game.shotResolvedNumber;

  if (!game.winner) {
    game.whoseTurn = 3 - game.shotBy;
  }
}

function processShotResult() {
  // Does nothing if the game has not started and there is no winner
  if (!game.gameStarted && !game.winner) {
    return;
  }
  // Does nothing if this result has already been processed
  if (game.shotResolvedNumber <= lastProcessedShotNumber) {
    return;
  }
  // Does nothing if the opponent fired the shot
  if (game.shotBy !== myPlayerNumber) {
    return;
  }

  let x = game.shotX;
  let y = game.shotY;

  // Updates the result grid and plays the corresponding sound
  if (game.shotResult === "H") {
    myAttackResultGrid[y][x] = "H";

    hitSound.play();
  }
  else if (game.shotResult === "M") {
    myAttackResultGrid[y][x] = "M";

    missSound.play();
  }

  lastProcessedShotNumber = game.shotResolvedNumber;
}

async function connectToGame() {
  // Does nothing if already connected or currently connecting
  if (connecting || connected) {
    return;
  }

  connecting = true;

  // App ID long string at the end was generated by ChatGPT
  await p5party.connect("wss://demoserver.p5party.org", "battleship-cs30-wmci-jg-p[A%I5C4hFa9Rv4d)Pqk48;GL*TQ::Tv$Aln+:YwzETzU+!t&eTNdHPM0oP:@0G2w}1vW:SbTr;,La9OK?GdQ[Sz3avxWIn$_(u%s]!26k0rnA9bNmwm!j13NdfVEzr0*@O;e;OY!zg!(6P9-kfH[1v{fBv4WhfpkYHm7%tSJNp?^Ldvfxt9PD4Dith{fF9G$)lV4;b@JCz?z3SwHkSsg:s(QqZE.n%^HUjml3tVxUqbPcw1N661eZ[ZwemaX,qf]L;%gQ+rx_H0Q!HN,Y?D@;[DbP5%a$$69e9!g}AD&IEcTJC(huB}!i1?oWd@QdmSM;#),.E;u!QCb5?0-OYlpM{HLJSmx]kEUU]es?_FMR]n%%rp4J+@r%v!xkG$v=z,s&+LTL:=q,=NOu,dbw2%,D4*P-.Hj*V}t$:e=N.$I8Dng7MI!w.Z)}0k{-BBJBy^rL_AV$IjT%LlZHNjN$GvJ(FC=vTU7,+vXLF@d^3bM3u17QQwR:;[", roomCode);

  // Creates the shared game data
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

    chatMessages: [],
    chatMessageNumber: 0,
  });

  lastSeenRestartNumber = game.restartNumber;

  // Tells the shared game that the guest is connecting
  if (!p5party.isHost()) {
    game.guestConnecting = true;
  }

  // Assigns player numbers and usernames based on whether this player is the host
  if (p5party.isHost()) {
    myPlayerNumber = 1;
    game.player1Username = username;
  }
  else {
    myPlayerNumber = 2;
    // Adds labels to distinguish the players if they entered the same username
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
}

async function disconnectFromGame() {
  // Disconnects from p5.party if this player was connected or connecting
  if (connected || connecting) {
    p5party.disconnect();
  }

  // Stops the background music if it is playing
  if (gameBackgroundMusic && gameBackgroundMusic.playing) {
    gameBackgroundMusic.stop();
  }

  connected = false;
  connecting = false;

  game = {};
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
    // Sets the source file path to the p5.party.js library, and adds the current time to it in milliseconds, making it unique to bypass browser caching and load a fresh copy of the script
    newScript.src = "libraries/p5.party.js?" + Date.now();
    // Sets up a listener that runs the exact moment the browser finishes downloading then executing p5.party.js (the new blank one), resolve tells await (called from disconnectFromGame()) that window.p5party is ready to be used again
    newScript.onload = () => resolve();
    // Reloads the page if an error occurs, since this will ensure that p5.party.js is reloaded, it just might cause more hassle for the user
    newScript.onerror = () => reloadPage = true;
    // Actually injects the new script into the <head> section of the live webpage, so the browser actually sees it, recognizes that the file has not been ran before (with its current name), and runs it
    document.head.appendChild(newScript);
  });
}

function restartGame() {
  // Does nothing if already waiting to restart, disconnected, or there is no winner yet
  if (restartWaiting || !connected || !game.winner) {
    return;
  }

  restartWaiting = true;

  // Tells the shared game that this player is ready to restart
  if (myPlayerNumber === 1) {
    game.player1RestartReady = true;
  }
  else if (myPlayerNumber === 2) {
    game.player2RestartReady = true;
  }
}

function processRestart() {
  // Does nothing if not connected or the restart number does not exist
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

    // Increases the restart number so both players know a reset occurred
    game.restartNumber++;
  }

  // Resets this player's local game once the restart number changes
  if (game.restartNumber !== lastSeenRestartNumber) {
    resetLocalGame();

    lastSeenRestartNumber = game.restartNumber;
    restartWaiting = false;

    gameState = "playing";
  }
}

function resetLocalGame() {
  // Returns every ship to the fleet dock
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

  // Clears this player's grids and shot tracking
  myShipGrid = undefined;
  myAttackGrid = generateBlankGrid(SQUARE_COUNT, 0);
  myAttackResultGrid = generateBlankGrid(SQUARE_COUNT, "");

  myHitsTaken = 0;
  lastProcessedShotNumber = 0;
  finalHitDisplayStart = 0;
}

function displayChat() {
  let chatWidth = 400 * gameScale;
  let chatHeight = 350 * gameScale;
  let chatX = width - chatWidth - 25 * gameScale;
  let chatY = 25 * gameScale;

  push();

  // Chat panel
  rectMode(CORNER);
  fill(5, 15, 35, 220);
  rect(chatX, chatY, chatWidth, chatHeight, 12 * gameScale);

  // Chat title
  fill(255, 220, 80);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(subtitleTextSize * 0.6);
  text("Game Chat", chatX + 15 * gameScale, chatY + 12 * gameScale);

  // Chat messages
  fill(255);
  textStyle(NORMAL);
  textSize(subtitleTextSize * 0.4);

  if (game.chatMessages) {
    // Only displays the last seven messages
    let firstMessage = max(0, game.chatMessages.length - 7);

    for (let i = firstMessage; i < game.chatMessages.length; i++) {
      let message = game.chatMessages[i];
      let messageText = message.text;

      // Truncates messages that are too long to fit in the chat panel
      if (messageText.length > 32) {
        messageText = messageText.substring(0, 32) + "...";
      }

      text(message.username + ": " + messageText, chatX + 15 * gameScale, chatY + 60 * gameScale + (i - firstMessage) * 40 * gameScale);
    }
  }

  pop();
}

function sendChatMessage() {
  let messageText = chatInputBox.value().trim();

  // Does nothing if the message is empty or the player is not connected
  if (messageText.length === 0 || !connected) {
    return;
  }

  if (!game.chatMessages) {
    game.chatMessages = [];
  }

  // Adds the message to the shared chat
  game.chatMessages.push({
    username: username,
    text: messageText
  });

  // Keeps only the newest 30 messages
  if (game.chatMessages.length > 30) {
    game.chatMessages.shift();
  }

  game.chatMessageNumber++;

  chatInputBox.value("");
}