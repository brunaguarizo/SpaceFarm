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

// Character image mapping
const characterImages = {
    astronaut: "img/astronaut.png",
    alien: "img/alien.png",
    robot: "img/robot.png",
};

// Asteroid image options
const asteroidImages = [
    "img/asteroid1.png",
    "img/asteroid2.png",
    "img/asteroid3.png",
    "img/asteroid4.png",
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

    // Start spawning asteroids
    spawnAsteroid(); // Spawn first asteroid immediately
    asteroidInterval = setInterval(spawnAsteroid, 1500); // Then every 1.5 seconds
}

// Game loop
function gameLoop() {
    if (!gameRunning || isPaused) return;

    // Move asteroids
    moveAsteroids();

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

// Spawn a new asteroid
function spawnAsteroid() {
    if (!gameRunning || isPaused) return;

    // Create asteroid element
    const asteroid = document.createElement("div");
    asteroid.classList.add("asteroid");

    // Set random asteroid type
    const asteroidType =
        asteroidImages[Math.floor(Math.random() * asteroidImages.length)];
    asteroid.innerHTML = `<img src="${asteroidType}" alt="Asteroid">`;

    // Set random position (y-axis)
    const asteroidY = Math.random() * (gameHeight - 100) + 50;

    // Set asteroid properties
    asteroid.style.left = `${gameWidth}px`;
    asteroid.style.top = `${asteroidY}px`;

    // Add to game screen
    gameScreen.appendChild(asteroid);

    // Add to asteroids array
    asteroids.push({
        element: asteroid,
        x: gameWidth,
        y: asteroidY,
        speed: Math.random() * 2 + 3, // Random speed between 3-5
        passed: false,
    });
}

// Move all asteroids
function moveAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];

        // Move asteroid
        asteroid.x -= asteroid.speed;
        asteroid.element.style.left = `${asteroid.x}px`;

        // Check if asteroid passed the player
        if (!asteroid.passed && asteroid.x < 100) {
            asteroid.passed = true;
            score += 10;
            updateScore();
        }

        // Remove asteroid if it's off-screen
        if (asteroid.x < -50) {
            gameScreen.removeChild(asteroid.element);
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

    for (const asteroid of asteroids) {
        const asteroidRect = {
            x: asteroid.x,
            y: asteroid.y - 15,
            width: 30,
            height: 30,
        };

        // Check if player and asteroid rectangles intersect
        if (
            playerRect.x < asteroidRect.x + asteroidRect.width &&
            playerRect.x + playerRect.width > asteroidRect.x &&
            playerRect.y < asteroidRect.y + asteroidRect.height &&
            playerRect.y + playerRect.height > asteroidRect.y
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

    // Remove all asteroids
    asteroids.forEach((asteroid) => {
        gameScreen.removeChild(asteroid.element);
    });
    asteroids = [];

    // Update final score
    finalScoreDisplay.textContent = `Final Score: ${score}`;

    // Show game over screen
    gameOverScreen.style.display = "flex";
}

// Restart game
function restartGame() {
    // Clear asteroids
    asteroids.forEach((asteroid) => {
        if (asteroid.element.parentNode) {
            asteroid.element.parentNode.removeChild(asteroid.element);
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
