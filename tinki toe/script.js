// Select elements
const cells = document.querySelectorAll('.cell');
const startGameButton = document.getElementById('start-game');
const playAgainButton = document.getElementById('play-again');
const turnInfo = document.getElementById('turn-info');
const resultLog = document.getElementById('result-log');
const playerScore = document.getElementById('player-score');
const aiScore = document.getElementById('ai-score');
const welcomeAudio = document.getElementById('welcome-audio');
const historyLessonAudio = document.getElementById('history-lesson-audio');
const youWinAudio = document.getElementById('you-win-audio');
const iWinAudio = document.getElementById('i-win-audio');
const drawAudio = document.getElementById('draw-audio');
const levelOptions = document.getElementById('level-options');
const levelButtons = document.querySelectorAll('#level-options button');
const resultDisplay = document.getElementById('result-display');

// Game state variables
let currentPlayer = 'X';
let gameBoard = Array(9).fill(null);
let gameActive = false;
let playerWins = 0;
let aiWins = 0;
let isFirstGame = true; // Track if it's the first game
let playWithFriend = false; // Track if playing with a friend
let currentLevel = 1; // Track the current AI level

// Winning combinations
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Attach event listeners to cells
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Attach event listeners to buttons
startGameButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);
levelButtons.forEach(button => button.addEventListener('click', selectLevel));

function selectLevel(event) {
    const level = event.target.id;

    if (level === 'play-with-friend') {
        playWithFriend = true;
    } else {
        playWithFriend = false;
        currentLevel = parseInt(level.split('-')[1]); // Get the level number from button id
    }

    levelOptions.style.display = 'none';
    startGameButton.style.display = 'block';
}

function startGame() {
    resetGame(); // Reset the game state
    gameActive = true;
    currentPlayer = 'X';
    turnInfo.textContent = "Your turn!";
    startGameButton.style.display = 'none';
    playAgainButton.style.display = 'none';

    if (isFirstGame) {
        // Play audio only for the first game
        welcomeAudio.play();
        historyLessonAudio.play();
        isFirstGame = false; // Set the flag to false after the first game
    }

    appendToResultLog("Game started. Your turn!");
}

function handleCellClick(event) {
    const index = event.target.dataset.index;

    if (!gameActive || gameBoard[index] || checkWinner() || isDraw()) {
        return;
    }

    gameBoard[index] = currentPlayer;
    event.target.textContent = currentPlayer;
    appendToResultLog(`Player ${currentPlayer} marked cell ${index}.`);

    if (checkWinner()) {
        gameActive = false;
        displayResult(`${currentPlayer} Wins!`);
        if (currentPlayer === 'X') {
            turnInfo.textContent = "You win!";
            youWinAudio.play();
            playerWins++;
            playerScore.textContent = playerWins;
            appendToResultLog("You win!");
        } else {
            turnInfo.textContent = "Miss Minutes wins!";
            iWinAudio.play();
            aiWins++;
            aiScore.textContent = aiWins;
            appendToResultLog("Miss Minutes wins!");
        }
        playAgainButton.style.display = 'block';
    } else if (isDraw()) {
        gameActive = false;
        displayResult("It's a draw!");
        turnInfo.textContent = "It's a draw!";
        drawAudio.play();
        appendToResultLog("It's a draw!");
        playAgainButton.style.display = 'block';
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (!playWithFriend && currentPlayer === 'O') {
            turnInfo.textContent = "Miss Minutes' turn...";
            appendToResultLog("Miss Minutes' turn...");
            setTimeout(() => makeAIMove(currentLevel), 1000);
        } else {
            turnInfo.textContent = `Player ${currentPlayer}'s turn!`;
            appendToResultLog(`Player ${currentPlayer}'s turn!`);
        }
    }
}

function checkWinner() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameBoard[index] === currentPlayer;
        });
    });
}

function isDraw() {
    return gameBoard.every(cell => cell);
}

function resetGame() {
    gameBoard.fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
    });
    currentPlayer = 'X';
    gameActive = false;
    turnInfo.textContent = "Press 'Play Again' to play!";
    appendToResultLog("Game reset. Press 'Play Again' to play again.");
}

function makeAIMove(level) {
    let bestMove;
    switch (level) {
        case 1:
            bestMove = makeAIMoveWithProbability(1); // 1% optimal move
            break;
        case 2:
            bestMove = makeAIMoveWithProbability(20); // 20% optimal move
            break;
        case 3:
            bestMove = makeAIMoveWithProbability(90); // 90% optimal move
            break;
        default:
            bestMove = findBestMove(gameBoard); // 100% optimal move
    }
    gameBoard[bestMove] = currentPlayer;
    cells[bestMove].textContent = currentPlayer;
    appendToResultLog(`Miss Minutes marked cell ${bestMove}.`);

    if (checkWinner()) {
        gameActive = false;
        displayResult("Miss Minutes Wins!");
        turnInfo.textContent = "Miss Minutes wins!";
        iWinAudio.play();
        aiWins++;
        aiScore.textContent = aiWins;
        appendToResultLog("Miss Minutes wins!");
        playAgainButton.style.display = 'block';
    } else if (isDraw()) {
        gameActive = false;
        displayResult("It's a draw!");
        turnInfo.textContent = "It's a draw!";
        drawAudio.play();
        appendToResultLog("It's a draw!");
        playAgainButton.style.display = 'block';
    } else {
        currentPlayer = 'X';
        turnInfo.textContent = "Your turn!";
        appendToResultLog("Your turn!");
    }
}

function makeAIMoveWithProbability(probability) {
    const random = Math.random() * 100;
    if (random < probability) {
        return findBestMove(gameBoard);
    } else {
        const emptyCells = gameBoard.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
}

function findBestMove(board) {
    let bestValue = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            let moveValue = minimax(board, 0, false);
            board[i] = null;

            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function minimax(board, depth, isMax) {
    const score = evaluate(board);

    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (isDraw()) return 0;

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                best = Math.max(best, minimax(board, depth + 1, false));
                board[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                best = Math.min(best, minimax(board, depth + 1, true));
                board[i] = null;
            }
        }
        return best;
    }
}

function evaluate(board) {
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            if (board[a] === 'O') return 10;
            if (board[a] === 'X') return -10;
        }
    }
    return 0;
}

function appendToResultLog(message) {
    const p = document.createElement('p');
    p.textContent = message;
    resultLog.appendChild(p);
    resultLog.scrollTop = resultLog.scrollHeight; // Scroll to the bottom
}

function displayResult(message) {
    resultDisplay.textContent = message;
    resultDisplay.classList.add('show');
    setTimeout(() => {
        resultDisplay.classList.remove('show');
    }, 3000); // Display result for 3 seconds
}
