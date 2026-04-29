// --- Elements ---
const startGameBtn = document.getElementById('start-game-btn');
const exitBtn = document.getElementById('exit-btn');
const playerProfile = document.getElementById('player-profile');
const displayName = document.getElementById('display-name');
const creditScore = document.getElementById('credit-score');
const mainMenu = document.getElementById('main-menu');
const backHomeBtn = document.getElementById('back-to-home');
const welcomeText = document.getElementById('welcome-text');

// Modals
const exitModal = document.getElementById('exit-modal');
const helpModal = document.getElementById('help-modal');
const winModal = document.getElementById('win-modal');

// --- Personalized Welcome Logic ---
function setPlayerGreeting() {
    const storedName = localStorage.getItem('playerName');
    if (welcomeText) {
        // Ensure real player name is shown if it exists in storage
        welcomeText.innerText = storedName ? `WELCOME, ${storedName.toUpperCase()}!` : "WELCOME PLAYER!";
    }
}
setPlayerGreeting();

// --- Initialization & Index Page Personalization ---
function init() {
    const savedName = localStorage.getItem('playerName');
    const savedScore = localStorage.getItem('score') || 0;

    if (savedName && playerProfile) {
        playerProfile.style.display = "block";
        if (exitBtn) exitBtn.style.display = "block";
        displayName.innerText = `WELCOME BACK, ${savedName.toUpperCase()}!`;
        creditScore.innerText = `CREDITS: ${savedScore}`;
    }
}
init();
// --- Navigation & Game Initialization ---
if (startGameBtn) {
    const nameModal = document.getElementById('name-modal');
    const confirmBtn = document.getElementById('confirm-btn');
    const playerNameInput = document.getElementById('player-name');
    const loadingScreen = document.getElementById('loading-screen');

    startGameBtn.addEventListener('click', () => {
        if (localStorage.getItem('playerName')) {
            if (mainMenu) mainMenu.style.display = "none";
            loadingScreen.style.display = "flex";
            setTimeout(() => { window.location.href = "game.html"; }, 1500);
        } else {
            nameModal.style.display = "flex";
        }
    });

    confirmBtn.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (name === "") {
            playerNameInput.style.border = "1px solid red";
            return;
        }
        localStorage.setItem('playerName', name);
        nameModal.style.display = "none";
        if (mainMenu) mainMenu.style.display = "none";
        loadingScreen.style.display = "flex";
        setTimeout(() => { window.location.href = "game.html"; }, 2000);
    });
}

if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
        window.location.href = "index.html"; // Returns to home page
    });
}
