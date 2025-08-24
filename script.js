document.addEventListener("DOMContentLoaded", function () {
  // --- DOM refs ---
  const setupPanel = document.getElementById("setup-panel");
  const gamePanel = document.getElementById("game-panel");
  const player1NameInput = document.getElementById("player1-name");
  const player2NameInput = document.getElementById("player2-name");
  const symbolRadios = document.getElementsByName("player1-symbol");
  const autoSymbol = document.getElementById("auto-symbol");
  const startBtn = document.getElementById("start-game");
  const boardDiv = document.getElementById("game-board");
  const turnIndicator = document.getElementById("turn-indicator");
  const showResultDiv = document.getElementById("show-result");
  const restartBtn = document.getElementById("restart-game");
  const cells = boardDiv.querySelectorAll(".cell");

  // --- State ---
  let board = Array(9).fill("");
  let players = [
    { name: "", symbol: "X" },
    { name: "", symbol: "O" },
  ];
  let current = 0;
  let gameActive = false;

  // --- Symbol selection logic ---
  symbolRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        autoSymbol.textContent = `Player 2 Symbol: ${
          this.value === "X" ? "O" : "X"
        }`;
      }
    });
  });

  // --- Main Functions ---
  function playGame() {
    const name1 = player1NameInput.value.trim();
    const name2 = player2NameInput.value.trim();
    let symbol1 = "";
    symbolRadios.forEach((r) => {
      if (r.checked) symbol1 = r.value;
    });
    if (!name1 || !name2 || !symbol1) {
      showResult("Please enter both names and select a symbol.");
      return;
    }
    players[0].name = name1.charAt(0).toUpperCase() + name1.slice(1);
    players[0].symbol = symbol1;
    players[1].name = name2.charAt(0).toUpperCase() + name2.slice(1);
    players[1].symbol = symbol1 === "X" ? "O" : "X";
    current = 0;
    board = Array(9).fill("");
    gameActive = true;
    setupPanel.style.display = "none";
    gamePanel.style.display = "flex";
    showResult("");
    updateBoard();
    updateTurn();
  }

  function winChecker(symbol) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    return winPatterns.some((pattern) =>
      pattern.every((idx) => board[idx] === symbol)
    );
  }

  function showResult(msg) {
    showResultDiv.textContent = msg;
  }

  function endGame(msg) {
    gameActive = false;
    showResult(msg);
  }

  // --- UI/Board helpers ---
  function updateBoard() {
    cells.forEach((cell, idx) => {
      cell.textContent = board[idx];
      cell.className = "cell" + (board[idx] ? " filled" : "");
    });
  }
  function updateTurn() {
    turnIndicator.textContent = `${players[current].name}'s turn (${players[current].symbol})`;
  }

  // --- Cell click ---
  cells.forEach((cell) => {
    cell.addEventListener("click", function () {
      if (!gameActive) return;
      const idx = parseInt(cell.getAttribute("data-cell-index"));
      if (board[idx]) return;
      board[idx] = players[current].symbol;
      updateBoard();
      if (winChecker(players[current].symbol)) {
        endGame(`${players[current].name} wins!`);
        return;
      }
      if (board.every((cell) => cell)) {
        endGame("It's a draw!");
        return;
      }
      current = 1 - current;
      updateTurn();
    });
  });
  // --- Start/Restart ---
  startBtn.addEventListener("click", playGame);
  restartBtn.addEventListener("click", function () {
    board = Array(9).fill("");
    current = 0;
    gameActive = true;
    showResult("");
    updateBoard();
    updateTurn();
  });
});
