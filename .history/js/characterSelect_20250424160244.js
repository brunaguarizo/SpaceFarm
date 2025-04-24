// Character selection module
import { startGame } from "./game.js";

export function initCharacterSelect() {
    const characterOptions = document.querySelectorAll(".character-option");
    const confirmBtn = document.getElementById("confirm-btn");
    let selectedCharacter = "";

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
        startGame(selectedCharacter);
    });
}
