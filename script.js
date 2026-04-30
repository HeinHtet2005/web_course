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

// --- Particles Background ---
const canvas = document.getElementById("particles");
if (canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    for (let i = 0; i < 60; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, s: Math.random() * 2, v: Math.random() * 0.5 });
    function anim() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00f0ff";
        particles.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
            p.y += p.v; if (p.y > canvas.height) p.y = 0;
        });
        requestAnimationFrame(anim);
    }
    anim();
}

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        localStorage.removeItem("dailyWord");
        localStorage.removeItem("dailyDate");
        location.reload();
    });
}
// --- NEW: Theme & Sound Systems ---
function initSystems() {
    // 1. Theme Logic
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    // 2. Scoreboard Logic
    const highScore = localStorage.getItem('highScore') || 0;
    const streak = localStorage.getItem('winStreak') || 0;
    if (document.getElementById('high-score-val')) {
        document.getElementById('high-score-val').innerText = highScore;
        document.getElementById('streak-val').innerText = streak;
    }
}

function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle-btn');

    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (themeBtn) themeBtn.innerText = "LIGHT MODE";
    } else {
        body.classList.remove('light-mode');
        if (themeBtn) themeBtn.innerText = "DARK MODE";
    }
}
applyTheme();
const settingsBtn = document.getElementById('theme-toggle-btn');
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
        applyTheme();
    });
}
// Settings Event Listeners
document.getElementById('settings-btn')?.addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'flex';
});

document.getElementById('close-settings')?.addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'none';
});



document.getElementById('volume-slider')?.addEventListener('input', (e) => {
    const vol = e.target.value;
    localStorage.setItem('gameVolume', vol);
    // Apply to audio elements
    const sounds = [document.getElementById('clickSound'), document.getElementById('winSound')];
    sounds.forEach(s => { if(s) s.volume = vol; });
});
function updateWinStats() {
    let currentScore = parseInt(localStorage.getItem('score')) || 0;
    let highScore = parseInt(localStorage.getItem('highScore')) || 0;
    let streak = parseInt(localStorage.getItem('winStreak')) || 0;

    streak++;
    if (currentScore > highScore) {
        localStorage.setItem('highScore', currentScore);
    }
    localStorage.setItem('winStreak', streak);
    initSystems(); // Refresh UI
}
