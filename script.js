document.addEventListener("DOMContentLoaded", function () {
  const setupPanel = document.getElementById("setup-panel");
  const gamePanel = document.getElementById("game-panel");
  const player1NameInput = document.getElementById("player1-name");
  const player2NameInput = document.getElementById("player2-name");
  const player1SymbolRadios = document.getElementsByName("player1-symbol");
  const autoSymbolSpan = document.getElementById("auto-symbol");
  const startGameBtn = document.getElementById("start-game");
  const gameBoardDiv = document.getElementById("game-board");
  const resetGameBtn = document.getElementById("reset-game");
  const turnIndicatorDiv = document.getElementById("turn-indicator");
  const showResultDiv = document.getElementById("show-result");
  const restartGameBtn = document.getElementById("restart-game");
  const cells = gameBoardDiv.querySelectorAll(".cell");

  let board = Array(9).fill("");
  let players = [
    { name: "", symbol: "X" },
    { name: "", symbol: "O" },
  ];
  let current = 0;
  let gameActive = false;

  const player1SymbolGroup = document.getElementById("player1-symbol-group");
  const player2SymbolGroup = document.getElementById("player2-symbol-group");
  const player1SymbolLabel = document.getElementById("player1-symbol-label");
  const player2SymbolLabel = document.getElementById("player2-symbol-label");

  player1NameInput.addEventListener("input", function () {
    if (this.value.trim()) {
      player1SymbolGroup.style.display = "flex";
      player1SymbolLabel.textContent = `${capitalize(
        this.value.trim()
      )}'s Symbol:`;
    } else {
      player1SymbolGroup.style.display = "none";
      player1SymbolRadios.forEach((r) => (r.checked = false));
      player2SymbolGroup.style.display = "none";
      player2SymbolLabel.textContent = "";
    }
  });

  player1SymbolRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked && player2NameInput.value.trim()) {
        player2SymbolGroup.style.display = "flex";
        const p2name = capitalize(player2NameInput.value.trim());
        player2SymbolLabel.textContent = `${p2name}'s Symbol: ${
          this.value === "X" ? "O" : "X"
        }`;
      } else if (!this.checked) {
        player2SymbolGroup.style.display = "none";
        player2SymbolLabel.textContent = "";
      }
    });
  });

  player2NameInput.addEventListener("input", function () {
    const checked = Array.from(player1SymbolRadios).find((r) => r.checked);
    if (this.value.trim() && checked) {
      player2SymbolGroup.style.display = "flex";
      player2SymbolLabel.textContent = `${capitalize(
        this.value.trim()
      )}'s Symbol: ${checked.value === "X" ? "O" : "X"}`;
    } else {
      player2SymbolGroup.style.display = "none";
      player2SymbolLabel.textContent = "";
    }
  });

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function playGame() {
    const name1 = player1NameInput.value.trim();
    const name2 = player2NameInput.value.trim();
    let symbol1 = "";
    player1SymbolRadios.forEach((r) => {
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
    removeHighlight();
    const highlight = document.createElement("div");
    highlight.className = "win-highlight";
    let pos = getHighlightPosition(pattern);
    if (pos) {
      highlight.style.left = pos.left + "%";
      highlight.style.top = pos.top + "%";
      highlight.style.width = pos.width + "%";
      highlight.style.height = pos.height + "%";
      highlight.style.transform = pos.rotate ? `rotate(${pos.rotate}deg)` : "";
      gameBoardDiv.appendChild(highlight);
    }
  }

  function removeHighlight() {
    const old = gameBoardDiv.querySelector(".win-highlight");
    if (old) old.remove();
  }

  function getHighlightPosition(pattern) {
    if (pattern[0] === 0 && pattern[1] === 1 && pattern[2] === 2)
      return { left: 0, top: 0, width: 100, height: 33.33 };
    if (pattern[0] === 3 && pattern[1] === 4 && pattern[2] === 5)
      return { left: 0, top: 33.33, width: 100, height: 33.33 };
    if (pattern[0] === 6 && pattern[1] === 7 && pattern[2] === 8)
      return { left: 0, top: 66.66, width: 100, height: 33.33 };
    if (pattern[0] === 0 && pattern[1] === 3 && pattern[2] === 6)
      return { left: 0, top: 0, width: 33.33, height: 100 };
    if (pattern[0] === 1 && pattern[1] === 4 && pattern[2] === 7)
      return { left: 33.33, top: 0, width: 33.33, height: 100 };
    if (pattern[0] === 2 && pattern[1] === 5 && pattern[2] === 8)
      return { left: 66.66, top: 0, width: 33.33, height: 100 };
    if (pattern[0] === 0 && pattern[1] === 4 && pattern[2] === 8)
      return { left: 0, top: 0, width: 100, height: 100, rotate: 45 };
    if (pattern[0] === 2 && pattern[1] === 4 && pattern[2] === 6)
      return { left: 0, top: 0, width: 100, height: 100, rotate: -45 };
    return null;
  }

  function updateBoard() {
    cells.forEach((cell, idx) => {
      cell.textContent = board[idx];
      cell.className = "cell" + (board[idx] ? " filled" : "");
    });
  }
  function updateTurn() {
    turnIndicatorDiv.textContent = `${players[current].name}'s turn (${players[current].symbol})`;
  }

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
  startGameBtn.addEventListener("click", playGame);
  restartGameBtn.addEventListener("click", function () {
    board = Array(9).fill("");
    current = 0;
    gameActive = true;
    showResult("");
    updateBoard();
    updateTurn();
    removeHighlight();
  });

  resetGameBtn.addEventListener("click", function () {
    removeHighlight();
    setupPanel.style.display = "flex";
    gamePanel.style.display = "none";
    showResult("");
    board = Array(9).fill("");
    updateBoard();
  });
});
