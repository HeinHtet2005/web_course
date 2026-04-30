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
// --- Instructions / How to Play Logic ---
const helpBtnHome = document.getElementById('help-btn-home');
const helpBtnGame = document.getElementById('help-btn');
const closeHelp = document.getElementById('close-help');
const gotItBtn = document.getElementById('got-it-btn');

const openHelp = () => { if (helpModal) helpModal.style.display = 'flex'; };
const hideHelp = () => { if (helpModal) helpModal.style.display = 'none'; };

if (helpBtnHome) helpBtnHome.addEventListener('click', openHelp);
if (helpBtnGame) helpBtnGame.addEventListener('click', openHelp);
if (closeHelp) closeHelp.addEventListener('click', hideHelp);
if (gotItBtn) gotItBtn.addEventListener('click', hideHelp);

// --- Logout Logic ---
if (exitBtn) {
    exitBtn.addEventListener('click', () => { exitModal.style.display = 'flex'; });
    document.getElementById('cancel-exit').addEventListener('click', () => { exitModal.style.display = 'none'; });
    document.getElementById('confirm-exit').addEventListener('click', () => {
        localStorage.removeItem('playerName');
        location.reload();
    });
}

// --- Core Gameplay ---
const submitBtn = document.getElementById("submit-btn");
const historyBox = document.getElementById("history");
const resetBtn = document.getElementById("reset-btn");
const tiles = document.querySelectorAll(".tile");

let currentGuess = "";
let secretWord = "";
let attempts = 0;
const maxAttempts = 6;

if (submitBtn) {
    const words = ["PLANE", "CRANE", "LIGHT", "BRAVE", "GHOST", "NEONS", "CYBER", "SPACE"];
    const today = new Date().toISOString().slice(0, 10);
    
    if (localStorage.getItem("dailyDate") === today) {
        secretWord = localStorage.getItem("dailyWord");
    } else {
        secretWord = words[Math.floor(Math.random() * words.length)];
        localStorage.setItem("dailyWord", secretWord);
        localStorage.setItem("dailyDate", today);
    }

    let score = parseInt(localStorage.getItem("score")) || 0;

    function handleGuess() {
        if (submitBtn.disabled || currentGuess.length !== 5) return;

        attempts++;
        updateKeyboardUI(currentGuess);

        const result = checkMatch(currentGuess);       
        const attemptLine = document.createElement("div");
        attemptLine.classList.add("history-item");
        attemptLine.innerText = `${currentGuess} → ${result.pos} Pos | ${result.let} Letter`;
        historyBox.appendChild(attemptLine);

        if (result.pos === 5) {
                // 1. Get fresh score, add reward, and save
                let currentScore = parseInt(localStorage.getItem("score")) || 0;
                currentScore += 10;
                localStorage.setItem("score", currentScore);
                
                // 2. Trigger the end game with the NEW score
                endGame(true, currentScore); 
            } else if (attempts >= maxAttempts) {
                // Trigger end game with current score on failure
                let currentScore = parseInt(localStorage.getItem("score")) || 0;
                endGame(false, currentScore);
            }
        currentGuess = "";
        updateTiles();
    }

    function checkMatch(guess) {
        let pos = 0, letCount = 0;
        let sArr = secretWord.split(""), gArr = guess.split("");
        gArr.forEach((l, i) => { if (l === sArr[i]) { pos++; sArr[i] = null; gArr[i] = null; } });
        gArr.forEach((l) => { if (l && sArr.includes(l)) { letCount++; sArr[sArr.indexOf(l)] = null; } });
        return { pos, let: letCount };
    }

    function endGame(win, finalScore) {
        submitBtn.disabled = true;
        const winModal = document.getElementById('win-modal');
        const winTitle = document.getElementById('win-title');
        const winMsg = document.getElementById('win-message');
        const finalScoreText = document.getElementById('final-score-display');
        
        // Refresh the score from localStorage one last time to be safe
        const verifiedScore = localStorage.getItem("score") || 0;

        winModal.style.display = 'flex';
        winTitle.innerText = win ? "MISSION SUCCESS!" : "MISSION FAILED";
        winTitle.style.color = win ? "#00ff44" : "#ff4444";
        winMsg.innerText = win ? `You decoded: ${secretWord}` : `Target was: ${secretWord}`;
        
        // FIX: This line now uses the verified score from storage
        finalScoreText.innerText = `TOTAL CREDITS: ${verifiedScore}`;
    }

    function updateTiles() {
        tiles.forEach((tile, i) => {
            tile.innerText = currentGuess[i] || "";
            tile.classList.toggle("active", !!currentGuess[i]);
        });
    }

    function updateKeyboardUI(guess) {
        const guessArray = guess.split("");
        const secretArray = secretWord.split("");
        guessArray.forEach((letter, i) => {
            const key = document.querySelector(`.key[data-key="${letter}"]`);
            if (!key) return;
            if (letter === secretArray[i]) {
                key.classList.add("correct");
            } else if (secretWord.includes(letter)) {
                if (!key.classList.contains("correct")) key.classList.add("present");
            } else {
                key.classList.add("absent");
            }
        });
    }

    submitBtn.addEventListener("click", handleGuess);
    document.getElementById('win-close-btn').addEventListener('click', () => location.reload());
}
// --- Keyboard Interaction ---
const keyboard = document.getElementById("keyboard");
if (keyboard) {
    const rows = [document.getElementById("row1"), document.getElementById("row2"), document.getElementById("row3")];
    const layout = ["QWERTYUIOP".split(""), "ASDFGHJKL".split(""), ["ENTER", ..."ZXCVBNM".split(""), "⌫"]];

    layout.forEach((keys, idx) => {
        keys.forEach(k => {
            const btn = document.createElement("div");
            btn.className = `key ${k.length > 1 ? 'large' : ''}`;
            btn.innerText = k;
            btn.setAttribute("data-key", k);
            btn.onclick = () => handleInput(k);
            rows[idx].appendChild(btn);
        });
    });
}

function handleInput(key) {
    if (key === "ENTER") handleGuess();
    else if (key === "⌫" || key === "BACKSPACE") currentGuess = currentGuess.slice(0, -1);
    else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) currentGuess += key;
    if (typeof updateTiles === "function") updateTiles();
}

document.addEventListener("keydown", (e) => handleInput(e.key.toUpperCase()));