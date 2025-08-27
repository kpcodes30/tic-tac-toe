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
  const resetBtn = document.getElementById("reset-game");
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
    for (let pattern of winPatterns) {
      if (pattern.every((idx) => board[idx] === symbol)) {
        return pattern;
      }
    }
    return null;
  }

  function showResult(msg) {
    if (msg.includes("wins")) {
      showResultDiv.textContent = "🏆 " + msg + " 🎉";
    } else if (msg.toLowerCase().includes("draw")) {
      showResultDiv.textContent = "🤝 " + msg;
    } else if (msg.toLowerCase().includes("please")) {
      showResultDiv.textContent = "⚠️ " + msg;
    } else {
      showResultDiv.textContent = msg;
    }
  }

  function endGame(msg, winPattern) {
    gameActive = false;
    removeHighlight();
    if (winPattern) {
      addHighlight(winPattern);
    }
    showResult(msg);
  }

  function addHighlight(pattern) {
    // Remove any existing highlight
    removeHighlight();
    const highlight = document.createElement("div");
    highlight.className = "win-highlight";
    // Calculate position/size
    // Board is 3x3, cells are 100x100 (or 33.33%)
    let pos = getHighlightPosition(pattern);
    if (pos) {
      highlight.style.left = pos.left + "%";
      highlight.style.top = pos.top + "%";
      highlight.style.width = pos.width + "%";
      highlight.style.height = pos.height + "%";
      highlight.style.transform = pos.rotate ? `rotate(${pos.rotate}deg)` : "";
      boardDiv.appendChild(highlight);
    }
  }

  function removeHighlight() {
    const old = boardDiv.querySelector(".win-highlight");
    if (old) old.remove();
  }

  function getHighlightPosition(pattern) {
    // Returns {left, top, width, height, rotate}
    // All values in % of board
    // Rows
    if (pattern[0] === 0 && pattern[1] === 1 && pattern[2] === 2)
      return { left: 0, top: 0, width: 100, height: 33.33 };
    if (pattern[0] === 3 && pattern[1] === 4 && pattern[2] === 5)
      return { left: 0, top: 33.33, width: 100, height: 33.33 };
    if (pattern[0] === 6 && pattern[1] === 7 && pattern[2] === 8)
      return { left: 0, top: 66.66, width: 100, height: 33.33 };
    // Columns
    if (pattern[0] === 0 && pattern[1] === 3 && pattern[2] === 6)
      return { left: 0, top: 0, width: 33.33, height: 100 };
    if (pattern[0] === 1 && pattern[1] === 4 && pattern[2] === 7)
      return { left: 33.33, top: 0, width: 33.33, height: 100 };
    if (pattern[0] === 2 && pattern[1] === 5 && pattern[2] === 8)
      return { left: 66.66, top: 0, width: 33.33, height: 100 };
    // Diagonals
    if (pattern[0] === 0 && pattern[1] === 4 && pattern[2] === 8)
      return { left: 0, top: 0, width: 100, height: 100, rotate: 45 };
    if (pattern[0] === 2 && pattern[1] === 4 && pattern[2] === 6)
      return { left: 0, top: 0, width: 100, height: 100, rotate: -45 };
    return null;
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
      const winPattern = winChecker(players[current].symbol);
      if (winPattern) {
        endGame(`${players[current].name} wins!`, winPattern);
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
  // --- Start/Restart/Reset ---
  startBtn.addEventListener("click", playGame);
  restartBtn.addEventListener("click", function () {
    board = Array(9).fill("");
    current = 0;
    gameActive = true;
    showResult("");
    updateBoard();
    updateTurn();
    // Remove win highlight
    cells.forEach((cell) => cell.classList.remove("win-row"));
  });

  // Reset Game button in game panel
  resetBtn.addEventListener("click", function () {
    // Remove win highlight
    cells.forEach((cell) => cell.classList.remove("win-row"));
    // Reset panels
    setupPanel.style.display = "flex";
    gamePanel.style.display = "none";
    showResult("");
    board = Array(9).fill("");
    updateBoard();
  });
});
