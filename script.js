// --- Elements ---
const startGameBtn = document.getElementById('start-game-btn');
const exitBtn = document.getElementById('exit-btn');
const playerProfile = document.getElementById('player-profile');
const displayName = document.getElementById('display-name');
const creditScore = document.getElementById('credit-score');
const mainMenu = document.getElementById('main-menu');
const backHomeBtn = document.getElementById('back-to-home');
const welcomeText = document.getElementById('welcome-text');
    const loadingScreen = document.getElementById('loading-screen');
// Modals
const exitModal = document.getElementById('exit-modal');
const helpModal = document.getElementById('help-modal');
const winModal = document.getElementById('win-modal');


function setPlayerGreeting() {
    const welcomeText = document.getElementById('welcome-text');
    const storedName = localStorage.getItem('playerName');
    const textToType = storedName ? `WELCOME,   ${storedName.toUpperCase()}` : "WELCOME, OPERATIVE";
    
    if (welcomeText) {
        welcomeText.innerText = ""; 
        welcomeText.classList.add('typing-active', 'gradient-text'); 
        
        let i = 0;
        function typeWriter() {
            if (i < textToType.length) {
                welcomeText.innerText += textToType.charAt(i);
                i++;
                let typingSpeed = Math.floor(Math.random() * 100) + 50; 
                setTimeout(typeWriter, typingSpeed);
            }
        }
        setTimeout(typeWriter, 500); 
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
    console.log(true)
    backHomeBtn.addEventListener('click', () => {
        playSfx('clickSound'); 
        if (loadingScreen) {
            loadingScreen.style.display = "flex";
        }
        setTimeout(() => { 
            window.location.href = "index.html"; 
        }, 1500);
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
if (helpBtnGame){
    helpBtnGame.addEventListener('click',()=>{
        playSfx('clickSound'); 
        openHelp();
    } );
} 
if (closeHelp) {closeHelp.addEventListener('click', ()=>{
    playSfx('clickSound'); 
    hideHelp();
})};
if (gotItBtn) {gotItBtn.addEventListener('click', ()=>{
    playSfx('clickSound'); 
    hideHelp();
})};

// --- Logout Logic ---
if (exitBtn) {
    playSfx('clickSound');
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
const words = ["PLANE", "CRANE", "LIGHT", "BRAVE", "GHOST", "NEONS", "CYBER", "SPACE", "AGENT", "LASER", "STARS", "ROBOT"];
    function shuffleAndPickWord() {
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        secretWord = words[0];
    }
    shuffleAndPickWord();
    function resetBoardForNextRound() {
        if (typeof playSfx === 'function') playSfx('clickSound');
        shuffleAndPickWord();
        currentGuess = "";
        attempts = 0;
        submitBtn.disabled = false;
        historyBox.innerHTML = "";
        tiles.forEach(tile => {
            tile.innerText = "";
            tile.className = "tile"; 
        });
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('correct', 'present', 'absent');
        });
        document.getElementById('win-modal').style.display = 'none';
    }
    let score = parseInt(localStorage.getItem("score")) || 0;

    function handleGuess() {
        playSfx('clickSound');
        if (submitBtn.disabled || currentGuess.length !== 5) return;

        attempts++;
        updateKeyboardUI(currentGuess);

        const result = checkMatch(currentGuess);       

        const attemptLine = document.createElement("div");
        attemptLine.classList.add("history-item");
        attemptLine.innerHTML = `
            <span class="history-word">${currentGuess}</span>
            <div class="history-stats">
                <span class="stat-badge pos-badge">${result.pos} POS</span>
                <span class="stat-badge let-badge">${result.let} LET</span>
            </div>
        `;

    historyBox.appendChild(attemptLine);

        if (result.pos === 5) {
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
      updateLiveScoreDisplay();
    submitBtn.disabled = true;
    const winModal = document.getElementById('win-modal');
    const winTitle = document.getElementById('win-title');
    const winMsg = document.getElementById('win-message');
    const finalScoreText = document.getElementById('final-score-display');
    if (win) {
        playSfx('winSound');
    }
    const verifiedScore = localStorage.getItem("score") || 0;

    winModal.style.display = 'flex';
    winTitle.innerText = win ? "MISSION SUCCESS!" : "MISSION FAILED";
    winTitle.style.color = win ? "#00ff44" : "#ff4444";
    winMsg.innerText = win ? `You decoded: ${secretWord}` : `Target was: ${secretWord}`;
    finalScoreText.innerText = `TOTAL CREDITS: ${verifiedScore}`;
    if (typeof updateLeaderboard === "function") {
        updateLeaderboard();
    }
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
    document.getElementById('win-close-btn').addEventListener('click', resetBoardForNextRound);
}

const keyboard = document.getElementById("keyboard");
if (keyboard) {
    playSfx('clickSound');
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
    playSfx('keyboardSound'); 
    if (key === "ENTER") handleGuess();
    else if (key === "⌫" || key === "BACKSPACE") currentGuess = currentGuess.slice(0, -1);
    else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) currentGuess += key;
    if (typeof updateTiles === "function") updateTiles();
}

document.addEventListener("keydown", (e) => handleInput(e.key.toUpperCase()));

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

function initSystems() {

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
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

document.getElementById('settings-btn')?.addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'flex';
});

document.getElementById('close-settings')?.addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'none';
});
document.getElementById('volume-slider')?.addEventListener('input', (e) => {
    const vol = e.target.value;
    localStorage.setItem('gameVolume', vol);
   const clickSound = document.getElementById('clickSound');
    if (clickSound) {
        clickSound.volume = vol;
        clickSound.play(); 
    }
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
// --- Hint System Logic ---
const hintBtn = document.getElementById('hint-btn');
const hintModal = document.getElementById('hint-modal');
const closeHintBtn = document.getElementById('close-hint');
const cancelHintBtn = document.getElementById('cancel-hint-btn');
const confirmHintBtn = document.getElementById('confirm-hint-btn');
const hintFundsVal = document.getElementById('hint-funds-val');

if (hintBtn) {
    hintBtn.addEventListener('click', () => {
        if (typeof playSfx === 'function') playSfx('clickSound');
        let score = parseInt(localStorage.getItem('score')) || 0;
        if (hintFundsVal) {
            hintFundsVal.innerText = score;
            hintFundsVal.style.color = score >= 20 ? "#00ff44" : "#ff4444";
            hintFundsVal.style.textShadow = score >= 20 ? "0 0 10px #00ff44" : "0 0 10px #ff4444";
        }
        if (confirmHintBtn) {
            confirmHintBtn.disabled = score < 20;
            if(score < 20) {
                confirmHintBtn.innerText = "INSUFFICIENT FUNDS";
            } else {
                confirmHintBtn.innerText = "CONFIRM";
            }
        }
        if (hintModal) hintModal.style.display = 'flex';
    });
}

// 2. Close Modal Handlers
const hideHintModal = () => { if (hintModal) hintModal.style.display = 'none'; };
if (closeHintBtn) closeHintBtn.addEventListener('click', () => { playSfx('clickSound'); hideHintModal(); });
if (cancelHintBtn) cancelHintBtn.addEventListener('click', () => { playSfx('clickSound'); hideHintModal(); });
if (confirmHintBtn) {
    confirmHintBtn.addEventListener('click', () => {
        let score = parseInt(localStorage.getItem('score')) || 0;
        if (score < 20) return; 
        let hintIndex = -1;
        for (let i = 0; i < 5; i++) {
            if (!currentGuess[i]) {
                hintIndex = i;
                break;
            }
        }
        if (hintIndex !== -1) {
            score -= 20;
            localStorage.setItem('score', score);
            updateLiveScoreDisplay();
            const revealedLetter = secretWord[hintIndex];
            const targetTile = tiles[hintIndex];
            targetTile.innerText = revealedLetter;
            targetTile.classList.add('hint-reveal');
            currentGuess += revealedLetter;
            if (typeof playSfx === 'function') playSfx('clickSound'); 
            hideHintModal();
        } else {
            alert("Clear some letters first to use a hint!");
            hideHintModal();
        }
    });
}

// --- Integrated Audio System ---
function playSfx(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        const savedVol = localStorage.getItem('gameVolume') || 0.5; 
        sound.volume = savedVol;
        sound.currentTime = 0; 
        sound.play().catch(e => console.log("Audio play blocked"));
    }
}
const musicToggleBtn = document.getElementById('music-toggle-btn');
const bgMusic = document.getElementById('bgMusic');

function updateMusicUI() {

    const isMusicOn = localStorage.getItem('musicEnabled') === 'true';
    if (musicToggleBtn) {
        musicToggleBtn.innerText = isMusicOn ? "ON" : "OFF";
        musicToggleBtn.style.boxShadow = isMusicOn ? "0 0 15px #00f0ff" : "none";
        musicToggleBtn.style.borderColor = isMusicOn ? "#00f0ff" : "#ff00ff";
        musicToggleBtn.style.color = isMusicOn ? "#00f0ff" : "#ff00ff";
    }
    const bgAudio = document.getElementById('bgSound') || document.getElementById('bgMusic');
    if (bgAudio) {
        if (isMusicOn) {
            const savedVol = localStorage.getItem('gameVolume') || 0.5;
            bgAudio.volume = savedVol * 0.3;
            bgAudio.play().catch(e => console.log("Browser requires user interaction first."));
        } else {
            bgAudio.pause();
        }
    }
}

if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
        if (typeof playSfx === 'function') playSfx('clickSound');

        const currentState = localStorage.getItem('musicEnabled') === 'true';
        localStorage.setItem('musicEnabled', !currentState);

        updateMusicUI(); 
    });
}


function initSystems() {
    applyTheme();
    startBgMusic(); 
    updateLiveScoreDisplay();
    const highScore = localStorage.getItem('highScore') || 0;
    const streak = localStorage.getItem('winStreak') || 0;
    if (document.getElementById('high-score-val')) {
        document.getElementById('high-score-val').innerText = highScore;
        document.getElementById('streak-val').innerText = streak;
    }
}
function startBgMusic() {
    const music = document.getElementById('bgSound'); 
    const isEnabled = localStorage.getItem('musicEnabled') === 'true';
    
    if (music && isEnabled) {
        const savedVol = localStorage.getItem('gameVolume') || 0.5;
        music.volume = savedVol * 0.3; 
        music.play().catch(e => console.log("Waiting for user interaction to play music..."));
    }
}
// --- Live Score HUD Sync ---
function updateLiveScoreDisplay() {
    const currentScore = parseInt(localStorage.getItem('score')) || 0;
    const scoreValEl = document.getElementById('current-score-val');
    if (scoreValEl) {
        scoreValEl.innerText = currentScore;
    }
}
// Call init on load
window.onload = initSystems;