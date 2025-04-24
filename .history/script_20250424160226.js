// Game modules
import { initCharacterSelect } from "./js/characterSelect.js";
import { initGame } from "./js/game.js";
import { initUI } from "./js/ui.js";

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

// Initialize all game components
function init() {
    console.log("Game initializing...");

    // Initialize each module
    initCharacterSelect();
    initGame();
    initUI();

    console.log("Game initialized successfully");
}

// Initialize the game when the page loads
window.addEventListener("load", init);
