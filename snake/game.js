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
    statusEl.textContent = "Playing";
    resetFood();
}

document.addEventListener("keydown", (e) => {
    if (gameOver && (e.key === "Enter" || e.key === " ")) {
        resetGame();
        return;
    }

    // prevent reversing directly
    if ((e.key === "ArrowLeft" || e.key === "a") && snake.dx !== 1) {
        snake.dx = -1;
        snake.dy = 0;
    } else if ((e.key === "ArrowRight" || e.key === "d") && snake.dx !== -1) {
        snake.dx = 1;
        snake.dy = 0;
    } else if ((e.key === "ArrowUp" || e.key === "w") && snake.dy !== 1) {
        snake.dx = 0;
        snake.dy = -1;
    } else if ((e.key === "ArrowDown" || e.key === "s") && snake.dy !== -1) {
        snake.dx = 0;
        snake.dy = 1;
    }
});

function loop() {
    requestAnimationFrame(loop);

    if (gameOver) return;

    // slow down game
    if (++frameCount < 6) return;
    frameCount = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        statusEl.textContent = "Game Over (wall). Press Enter.";
        gameOver = true;
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
    ctx.fillStyle = food.spoiled ? "#b300ff" : "#ff4136";
    ctx.fillRect(food.x * grid, food.y * grid, grid - 1, grid - 1);

    // draw snake
    ctx.fillStyle = "#2ecc40";
    snake.cells.forEach((cell, index) => {
        ctx.fillRect(cell.x * grid, cell.y * grid, grid - 1, grid - 1);

        // food collision
        if (cell.x === food.x && cell.y === food.y) {
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
                statusEl.textContent = "Game Over (self). Press Enter.";
                gameOver = true;
                return;
            }
        }
    });
}

resetGame();
requestAnimationFrame(loop);
