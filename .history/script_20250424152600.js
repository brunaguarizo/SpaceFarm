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
    // Character selection event listeners
    characterOptions.forEach((option) => {
        option.addEventListener("click", () => {
            // Remove selected class from all options
            characterOptions.forEach((opt) => opt.classList.remove("selected"));
            // Add selected class to clicked option
            option.classList.add("selected");
            // Store selected character
            selectedCharacter = option.dataset.character;
            // Enable confirm button
            confirmBtn.disabled = false;
        });
    });

    // Confirm button event listener
    confirmBtn.addEventListener("click", startGame);

    // Pause button event listener
    pauseBtn.addEventListener("click", togglePause);

    // Resume button event listener
    resumeBtn.addEventListener("click", togglePause);

    // Restart button event listener
    restartBtn.addEventListener("click", restartGame);

    // Keyboard event listeners
    document.addEventListener("keydown", handleKeyPress);
}

// Start the game
function startGame() {
    // Hide character selection screen
    characterSelectScreen.style.display = "none";
    // Show game screen
    gameScreen.style.display = "block";

    // Set up player
    playerElement = document.getElementById("player");
    playerElement.innerHTML = `<img src="${characterImages[selectedCharacter]}" alt="Player">`;

    // Initialize variables
    gameHeight = window.innerHeight;
    gameWidth = window.innerWidth;
    score = 0;
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
    asteroidInterval = setInterval(spawnPlanet, 1500); // Then every 1.5 seconds
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

    const moveDistance = 20;

    if (e.key === "ArrowUp" || e.key === "w") {
        // Move up
        playerY = Math.max(50, playerY - moveDistance);
        updatePlayerPosition();
    } else if (e.key === "ArrowDown" || e.key === "s") {
        // Move down
        playerY = Math.min(gameHeight - 50, playerY + moveDistance);
        updatePlayerPosition();
    }
}

// Update player position on screen
function updatePlayerPosition() {
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
    planet.innerHTML = `<img src="${planetType}" alt="Planet">`;

    // Set random position (y-axis)
    const planetY = Math.random() * (gameHeight - 100) + 50;

    // Set planet properties
    planet.style.left = `${gameWidth}px`;
    planet.style.top = `${planetY}px`;

    // Add to game screen
    gameScreen.appendChild(planet);

    // Add to asteroids array (keep the same array for simplicity)
    asteroids.push({
        element: planet,
        x: gameWidth,
        y: planetY,
        speed: Math.random() * 2 + 3, // Random speed between 3-5
        passed: false,
    });
}

// Move all planets
function movePlanets() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
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
    const playerRect = {
        x: 100,
        y: playerY - 30,
        width: 60,
        height: 60,
    };

    for (const planet of asteroids) {
        const planetRect = {
            x: planet.x,
            y: planet.y - 15,
            width: 30,
            height: 30,
        };

        // Check if player and planet rectangles intersect
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
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        pauseScreen.style.display = "flex";
    } else {
        pauseScreen.style.display = "none";
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
