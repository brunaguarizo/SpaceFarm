// Game variables
let selectedCharacter = "";
let score = 0;
let playerElement;
let gameRunning = false;
let isPaused = false;
let playerY;
let asteroids = [];
let gameLoopInterval;
let asteroidInterval;
let gameHeight;
let gameWidth;
let speedMultiplier = 1; // Added speed multiplier
let spawnIntervalMultiplier = 1; // Added spawn interval multiplier
const BASE_SPAWN_INTERVAL = 1500; // Base spawn interval in milliseconds

// Character image mapping - using the exact filenames from the img folder
const characterImages = {
    astronaut: "img/dog.png",
    alien: "img/pig.png",
    robot: "img/cat.png",
};

// Planet image options - using the exact filenames from the img folder
const planetImages = [
    "img/planet1.png",
    "img/planet2.png",
    "img/planet3.png",
    "img/planet4.png",
    "img/planet5.png",
    "img/planet6.png",
];

// DOM elements
const characterOptions = document.querySelectorAll(".character-option");
const confirmBtn = document.getElementById("confirm-btn");
const characterSelectScreen = document.getElementById("character-select");
const gameScreen = document.getElementById("game-screen");
const pauseBtn = document.getElementById("pause-btn");
const pauseScreen = document.getElementById("pause-screen");
const resumeBtn = document.getElementById("resume-btn");
const gameOverScreen = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const scoreDisplay = document.getElementById("score");

// Initialize the game
function init() {
    console.log("Game initializing...");

    // Character selection event listeners
    characterOptions.forEach((option) => {
        option.addEventListener("click", () => {
            console.log("Character option clicked:", option.dataset.character);
            // Remove selected class from all options
            characterOptions.forEach((opt) => opt.classList.remove("selected"));
            // Add selected class to clicked option
            option.classList.add("selected");
            // Store selected character
            selectedCharacter = option.dataset.character;
            // Enable confirm button
            confirmBtn.disabled = false;
            console.log("Selected character:", selectedCharacter);
        });
    });

    // Confirm button event listener
    confirmBtn.addEventListener("click", () => {
        console.log("Start button clicked, starting game...");
        startGame();
    });

    // Pause button event listener
    pauseBtn.addEventListener("click", togglePause);

    // Resume button event listener
    resumeBtn.addEventListener("click", togglePause);

    // Restart button event listener
    restartBtn.addEventListener("click", restartGame);

    // Keyboard event listeners
    document.addEventListener("keydown", handleKeyPress);

    console.log("Game initialized successfully");
}

// Start the game
function startGame() {
    console.log("Starting game with character:", selectedCharacter);

    if (!selectedCharacter) {
        console.error("No character selected!");
        return;
    }

    // Hide character selection screen
    characterSelectScreen.style.display = "none";
    // Show game screen
    gameScreen.style.display = "block";

    // Set up player
    playerElement = document.getElementById("player");
    if (!playerElement) {
        console.error("Player element not found!");
        return;
    }

    const playerImagePath = characterImages[selectedCharacter];
    console.log("Loading player image:", playerImagePath);

    // Create image element with error handling
    const playerImg = document.createElement("img");
    playerImg.src = playerImagePath;
    playerImg.alt = "Player";
    playerImg.onerror = function () {
        console.error("Error loading player image:", playerImagePath);
        // Fallback to text if image fails to load
        playerElement.innerHTML = "Player";
    };
    playerElement.innerHTML = "";
    playerElement.appendChild(playerImg);

    // Initialize variables
    gameHeight = window.innerHeight;
    gameWidth = window.innerWidth;
    score = 0;
    speedMultiplier = 1; // Reset speed multiplier
    spawnIntervalMultiplier = 1; // Reset spawn interval multiplier
    updateScore();
    playerY = gameHeight / 2;
    gameRunning = true;
    isPaused = false;
    asteroids = [];

    // Position player
    updatePlayerPosition();

    // Start game loop
    gameLoopInterval = setInterval(gameLoop, 16); // ~60fps

    // Start spawning planets
    spawnPlanet(); // Spawn first planet immediately
    asteroidInterval = setInterval(spawnPlanet, BASE_SPAWN_INTERVAL);

    console.log("Game started successfully");
}

// Game loop
function gameLoop() {
    if (!gameRunning || isPaused) return;

    // Move planets
    movePlanets();

    // Check collisions
    checkCollisions();
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning || isPaused) return;

    const moveDistance = 60; // Increased for even faster movement

    if (e.key === "ArrowUp" || e.key === "w") {
        // Move up
        playerY = Math.max(125, playerY - moveDistance);
        updatePlayerPosition();
    } else if (e.key === "ArrowDown" || e.key === "s") {
        // Move down
        playerY = Math.min(gameHeight - 125, playerY + moveDistance);
        updatePlayerPosition();
    }
}

// Update player position on screen
function updatePlayerPosition() {
    playerElement.style.left = `${gameWidth * 0.2}px`;
    playerElement.style.top = `${playerY}px`;
}

// Spawn a new planet
function spawnPlanet() {
    if (!gameRunning || isPaused) return;

    // Create planet element
    const planet = document.createElement("div");
    planet.classList.add("asteroid"); // Keep the same class for styling

    // Set random planet type
    const planetType =
        planetImages[Math.floor(Math.random() * planetImages.length)];
    console.log("Loading planet image:", planetType);

    // Create image element with error handling
    const planetImg = document.createElement("img");
    planetImg.src = planetType;
    planetImg.alt = "Planet";
    planetImg.onerror = function () {
        console.error("Error loading planet image:", planetType);
        // Fallback to text if image fails to load
        planet.innerHTML = "Planet";
    };
    planet.appendChild(planetImg);

    // Set random position (y-axis)
    const planetY = Math.random() * (gameHeight - 100) + 50;

    // Set planet properties
    planet.style.left = `${gameWidth}px`;
    planet.style.top = `${planetY}px`;

    // Add to game screen
    gameScreen.appendChild(planet);

    // Calculate base speed and apply multiplier
    const baseSpeed = Math.random() * 2 + 3; // Base speed between 3-5
    const finalSpeed = baseSpeed * speedMultiplier;

    // Add to asteroids array
    asteroids.push({
        element: planet,
        x: gameWidth,
        y: planetY,
        speed: finalSpeed,
        passed: false,
    });
}

// Move all planets
function movePlanets() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        // Exit if game is no longer running (e.g., after collision)
        if (!gameRunning || isPaused) return;

        const planet = asteroids[i];

        // Move planet
        planet.x -= planet.speed;
        planet.element.style.left = `${planet.x}px`;

        // Check if planet passed the player
        if (!planet.passed && planet.x < 100) {
            planet.passed = true;
            score += 10;
            updateScore();
        }

        // Remove planet if it's off-screen
        if (planet.x < -50) {
            gameScreen.removeChild(planet.element);
            asteroids.splice(i, 1);
        }
    }
}

// Check for collisions
function checkCollisions() {
    // Larger hitbox for player with better positioning
    const playerRect = {
        x: gameWidth * 0.2 + 30, // Adjusted for better alignment
        y: playerY - 40, // Adjusted for better alignment
        width: 150, // Larger width to catch more collisions
        height: 150, // Larger height to catch more collisions
    };

    for (const planet of asteroids) {
        const planetRect = {
            x: planet.x - 10, // Slightly larger hitbox
            y: planet.y - 40, // Better vertical alignment
            width: 80, // Larger width
            height: 80, // Larger height
        };

        // Standard collision detection
        if (
            playerRect.x < planetRect.x + planetRect.width &&
            playerRect.x + playerRect.width > planetRect.x &&
            playerRect.y < planetRect.y + planetRect.height &&
            playerRect.y + playerRect.height > planetRect.y
        ) {
            // Collision detected
            gameOver();
            return;
        }
    }
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
    // Increase speed multiplier based on score
    speedMultiplier = 1 + score * 0.01;
    // Decrease spawn interval multiplier based on score
    spawnIntervalMultiplier = Math.max(0.3, 1 - score * 0.005); // Minimum interval multiplier of 0.3

    // Update the spawn interval if the game is running
    if (gameRunning && !isPaused) {
        clearInterval(asteroidInterval);
        const newInterval = BASE_SPAWN_INTERVAL * spawnIntervalMultiplier;
        asteroidInterval = setInterval(spawnPlanet, newInterval);
    }
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        pauseScreen.style.display = "flex";
        clearInterval(asteroidInterval);
    } else {
        pauseScreen.style.display = "none";
        // Resume with current spawn interval
        asteroidInterval = setInterval(
            spawnPlanet,
            BASE_SPAWN_INTERVAL * spawnIntervalMultiplier
        );
    }
}

// Game over
function gameOver() {
    gameRunning = false;

    // Clear intervals
    clearInterval(gameLoopInterval);
    clearInterval(asteroidInterval);

    // Remove all planets
    asteroids.forEach((planet) => {
        gameScreen.removeChild(planet.element);
    });
    asteroids = [];

    // Update final score
    finalScoreDisplay.textContent = `Final Score: ${score}`;

    // Show game over screen
    gameOverScreen.style.display = "flex";
}

// Restart game
function restartGame() {
    // Clear planets
    asteroids.forEach((planet) => {
        if (planet.element.parentNode) {
            planet.element.parentNode.removeChild(planet.element);
        }
    });

    // Hide game over screen
    gameOverScreen.style.display = "none";

    // Go back to character selection
    gameScreen.style.display = "none";
    characterSelectScreen.style.display = "flex";

    // Reset character selection
    characterOptions.forEach((opt) => opt.classList.remove("selected"));
    confirmBtn.disabled = true;
    selectedCharacter = "";
}

// Initialize the game when the page loads
window.addEventListener("load", init);
