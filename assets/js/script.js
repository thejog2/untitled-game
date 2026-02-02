// Game Speed
let speed = 12; //Default speed

// Stops the game from starting automatically
let gameStarted = false;

// setting up the game,canvas height and width to be 400 css pixels rendered in 2d //
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// elements for score and status display  //
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");

//  number of tiles and grid size,
// ie  canvas width = 400, therefore tilecount = 400/20 = 20 tiles
const grid = 20;
const tileCount = canvas.width / grid;

// Defining themes

/* Configure Themes */

const themes = {
    default: {
        backgroundColor: "#000000",
        snakeColor: "#2ecc40",
        foodFreshColor: "#ff4136",
        foodSpoiledColor: "#b300ff",
    },
    underwater: {
        backgroundColor: "#001f3f",
        snakeColor: "#0074D9",
        foodFreshColor: "#7FDBFF",
        foodSpoiledColor: "#39CCCC",
    },
    desert: {
        backgroundColor: "#FFDC00",
        snakeColor: "#7D5C3E",
        foodFreshColor: "#FF4136",
        foodSpoiledColor: "#B10DC9",
    },

    jungle: {
        backgroundColor: "#1A472A",
        snakeColor: "#32CD32",
        foodFreshColor: "#FF6B6B",
        foodSpoiledColor: "#8B4513",
    },

    sky: {
        backgroundColor: "#87CEEB",
        snakeColor: "#FFFFFF",
        foodFreshColor: "#FFD700",
        foodSpoiledColor: "#FF4500",
    },
};
// define current theme, starts as default
let currentTheme = themes.default;


//sounds

const bgMusic = new Audio("sounds/game-bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.1;

const eatSound = new Audio("sounds/impactGeneric_light_002.ogg");

function playEatSound() {
  eatSound.currentTime = 0;
  eatSound.play();
}
document.getElementById("play-btn").addEventListener("click", () => {
    document.getElementById("game-overlay").classList.add("hidden");
    gameStarted = true;
    resetGame();
});

const wallSound = new Audio("sounds/jingles_HIT16.ogg");
const selfSound = new Audio("sounds/jingles_HIT09.ogg");

function playWallSound() {
  wallSound.currentTime = 0;
  wallSound.play();
}

function playSelfSound() {
  selfSound.currentTime = 0;
  selfSound.play();
}



//  setting up the snake position and movement variables
let snake = {
    x: 10,
    y: 10,
    dx: 1,
    dy: 0,
    cells: [],
    maxCells: 4,
};

let food = {
    x: 15,
    y: 10,
    spoiled: false,
    spoilTimer: 0,
};

let score = 0;
let gameOver = false;
let frameCount = 0;

// random integer in [min, max)
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetFood() {
    food.x = randInt(0, tileCount);
    food.y = randInt(0, tileCount);
    food.spoiled = false;
    food.spoilTimer = 0;
}

function resetGame() {
    snake.x = 10;
    snake.y = 10;
    snake.dx = 1;
    snake.dy = 0;
    snake.cells = [];
    snake.maxCells = 4;
    score = 0;
    scoreEl.textContent = score;
    gameOver = false;
    gameStarted = false;
    frameCount = 0;
    statusEl.textContent = "Playing";
    resetFood();
    bgMusic.currentTime = 0;
    bgMusic.play();

    ctx.fillStyle = currentTheme.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function endGame() {
    gameOver = true;
    const overlay = document.getElementById("game-overlay");
    const playBtn = document.getElementById("play-btn");
    playBtn.textContent = "Restart";
    overlay.classList.remove("hidden");
}

// shared direction handler used by keyboard and on-screen buttons
function setDirectionFromKey(key) {

    // prevent reversing directly
    if ((key === "ArrowLeft" || key === "a") && snake.dx !== 1) {
        snake.dx = -1;
        snake.dy = 0;
    } else if ((key === "ArrowRight" || key === "d") && snake.dx !== -1) {
        snake.dx = 1;
        snake.dy = 0;
    } else if ((key === "ArrowUp" || key === "w") && snake.dy !== 1) {
        snake.dx = 0;
        snake.dy = -1;
    } else if ((key === "ArrowDown" || key === "s") && snake.dy !== -1) {
        snake.dx = 0;
        snake.dy = 1;
    }
}

// keyboard input delegates to the shared handler
document.addEventListener("keydown", (e) => {
    // Prevent default behavior for arrow keys (scrolling)
    const scrollKeys = ["ArrowUp", "ArrowDown", " "];
    if (gameStarted && scrollKeys.includes(e.key)) {
        e.preventDefault();
    }

    // Restart Logic
    if (gameOver && (e.key === "Enter" || e.key === " ")) {
        resetGame();
        return;
    }

    // Pass the key to the shared direction handler
    setDirectionFromKey(e.key);
});

document.addEventListener("keydown", () => {
    [eatSound, wallSound, selfSound].forEach(sound => {
        sound.play().then(() => {
            sound.pause();
            sound.currentTime = 0;
        });
    });

    bgMusic.play(); // start music ONCE
}, { once: true });

    // Pass the key to the shared direction handler
    setDirectionFromKey(e.key);
});

document.addEventListener(
    "keydown",
    () => {
        eatSound.play().then(() => {
            eatSound.pause();
            eatSound.currentTime = 0;
        });
    },
    { once: true },
);

// wire on-screen arrow buttons (for mobile/tablet)
window.addEventListener("load", () => {
    const arrowButtons = document.querySelectorAll(".arrow-btn");
    arrowButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.key;
            setDirectionFromKey(key);
        });
        // also support touchstart for better mobile responsiveness
        btn.addEventListener(
            "touchstart",
            (ev) => {
                ev.preventDefault();
                const key = btn.dataset.key;
                setDirectionFromKey(key);
            },
            { passive: false },
        );
    });
    // expose for debugging if needed
    window.setDirectionFromKey = setDirectionFromKey;
});

function setTheme(name) {
    if (themes[name]) {
        currentTheme = themes[name];

        // Immediately update canvas background
        ctx.fillStyle = currentTheme.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Optional: draw preview if game isn't running
        if (!gameStarted && !gameOver) {
            drawPreview();
        }
    }
}

function drawPreview() {
    // background 
    ctx.fillStyle = currentTheme.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // snake preview 
    ctx.fillStyle = currentTheme.snakeColor;
    ctx.fillRect(8 * grid, 10 * grid, grid - 1, grid - 1);
    ctx.fillRect(9 * grid, 10 * grid, grid - 1, grid - 1);
    ctx.fillRect(10 * grid, 10 * grid, grid - 1, grid - 1);

    // food preview 
    ctx.fillStyle = currentTheme.foodFreshColor;
    ctx.fillRect(12 * grid, 10 * grid, grid - 1, grid - 1);
}

function loop() {
    requestAnimationFrame(loop);

    if (!gameStarted) return; // Stop everything until the game is started
    if (gameOver) return;

    // slow down game
    if (++frameCount < speed) return;
    frameCount = 0;

    // CLEAR CANVAS EVERY FRAME 
    ctx.fillStyle = currentTheme.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // move snake
    snake.x += snake.dx;
    snake.y += snake.dy;

    // wall collision
    if (
        snake.x < 0 ||
        snake.x >= tileCount ||
        snake.y < 0 ||
        snake.y >= tileCount
    ) {
       playWallSound(); 
       bgMusic.pause(); // 🔊 WALL HIT
      statusEl.textContent = "Game Over (wall).";
        endGame();
        return;
    }

    // add head to front of cells
    snake.cells.unshift({ x: snake.x, y: snake.y });

    // trim tail
    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    // update food spoil timer
    food.spoilTimer++;
    if (!food.spoiled && food.spoilTimer > 120) {
        food.spoiled = true; // after ~120 ticks
    }

    // draw food
    if (currentTheme.foodImage) {
        ctx.drawImage(
            currentTheme.foodImage,
            food.x * grid,
            food.y * grid,
            grid - 1,
            grid - 1,
        );
    } else {
        ctx.fillStyle = food.spoiled
            ? currentTheme.foodSpoiledColor
            : currentTheme.foodFreshColor;

        ctx.fillRect(food.x * grid, food.y * grid, grid - 1, grid - 1);
    }

    // draw snake
    ctx.fillStyle = currentTheme.snakeColor;
    snake.cells.forEach((cell, index) => {
        ctx.fillRect(cell.x * grid, cell.y * grid, grid - 1, grid - 1);

        // food collision
        if (cell.x === food.x && cell.y === food.y) {
            playEatSound(); // 🔊 PLAY SOUND HERE
            if (food.spoiled) {
                // spoiled: shrink and lose score
                snake.maxCells = Math.max(2, snake.maxCells - 1);
                score = Math.max(0, score - 2);
                statusEl.textContent = "Ouch! Spoiled food!";
            } else {
                // fresh: grow and gain score
                snake.maxCells++;
                score += 5;
                statusEl.textContent = "Nice! Fresh food!";
            }
            scoreEl.textContent = score;
            resetFood();
        }

        // self collision
        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {

              playSelfSound(); // 🔊 SNAKE HIT ITSELF
              bgMusic.pause();
              statusEl.textContent = "Game Over (self).";
                endGame();
                return;
            }
        }
    });
}

console.log("Current theme:", currentTheme);
resetGame();
requestAnimationFrame(loop);


function playEatSound() {
    eatSound.currentTime = 0;
    eatSound.play();
}

document.getElementById("play-btn").addEventListener("click", () => {
    // Always reset the game
    resetGame();

    // Mark game as running
    gameStarted = true;
    gameOver = false;

    // Hide overlay 
    document.getElementById("game-overlay").classList.add("hidden");

    // Clear preview immediately
    ctx.fillStyle = currentTheme.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
