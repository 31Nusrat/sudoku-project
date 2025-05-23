import React, { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const emptyBoard = Array.from({ length: 9 }, () => Array(9).fill(""));
  const [board, setBoard] = useState(emptyBoard);
  const [fixed, setFixed] = useState(emptyBoard.map((row) => row.map(() => false)));
  const [solution, setSolution] = useState([]);
  const [time, setTime] = useState(0);
  const [selectedCell, setSelectedCell] = useState([0, 0]);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [difficulty, setDifficulty] = useState("easy");
  const [wrongMoves, setWrongMoves] = useState(0);
  const [score, setScore] = useState(0); // Added score state

  // Load puzzle based on difficulty
  const loadPuzzle = (level) => {
    setDifficulty(level);
    fetch(`http://localhost:5000/generate?difficulty=${level}`)
      .then((res) => res.json())
      .then(({ puzzle, solution }) => {
        setBoard(puzzle);
        setFixed(puzzle.map((row) => row.map((cell) => cell !== "")));
        setSolution(solution);
        setTime(0);
        setHintsLeft(3);
        setWrongMoves(0); // Reset wrong moves on new puzzle load
        setScore(0); // Reset score on new puzzle load
        setSelectedCell([0, 0]);
        setTimeout(() => {
          document.getElementById("cell-0-0")?.focus();
        }, 0);
      })
      .catch(() => alert("Failed to load puzzle from server"));
  };

  useEffect(() => {
    loadPuzzle(difficulty);
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [difficulty]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleChange = (row, col, value) => {
    if (fixed[row][col]) return;
    if (value === "" || /^[1-9]$/.test(value)) {
      if (value !== "" && solution[row][col] !== value) {
        // Wrong move
        const newWrongMoves = wrongMoves + 1;
        setWrongMoves(newWrongMoves);
        if (newWrongMoves >= 3) {
          alert("Game Over! You made 3 wrong moves.");
          resetBoard();
          setWrongMoves(0);
          setScore(0);
          return;
        } else {
          // alert(`Wrong move! You have ${3 - newWrongMoves} attempts left.`);
        }
      } else if (value !== "" && solution[row][col] === value) {
        // Correct move, increase score
        setScore((prevScore) => prevScore + 10);
      }
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = value;
      setBoard(newBoard);
    }
  };

  const isValidBoard = () => {
    for (let i = 0; i < 9; i++) {
      const rowSet = new Set();
      const colSet = new Set();
      for (let j = 0; j < 9; j++) {
        const rowCell = board[i][j];
        const colCell = board[j][i];
        if (rowCell !== "") {
          if (rowSet.has(rowCell)) return false;
          rowSet.add(rowCell);
        }
        if (colCell !== "") {
          if (colSet.has(colCell)) return false;
          colSet.add(colCell);
        }
      }
    }
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxSet = new Set();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const value = board[boxRow * 3 + i][boxCol * 3 + j];
            if (value !== "") {
              if (boxSet.has(value)) return false;
              boxSet.add(value);
            }
          }
        }
      }
    }
    return true;
  };

  const solveSudoku = (b) => {
    const isSafe = (board, row, col, num) => {
      for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
      }
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[startRow + i][startCol + j] === num) return false;
        }
      }
      return true;
    };

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === "") {
          for (let num = 1; num <= 9; num++) {
            const strNum = num.toString();
            if (isSafe(b, row, col, strNum)) {
              b[row][col] = strNum;
              if (solveSudoku(b)) return true;
              b[row][col] = "";
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const resetBoard = () => {
    loadPuzzle(difficulty);
  };

  const clearAllUserInputs = () => {
    const newBoard = board.map((row, r) =>
      row.map((cell, c) => (fixed[r][c] ? cell : ""))
    );
    setBoard(newBoard);
  };

  const giveHint = () => {
    if (!selectedCell) {
      alert("Please select a cell to get a hint.");
      return false;
    }
    const [row, col] = selectedCell;
    if (
      !Array.isArray(solution) ||
      !Array.isArray(solution[row]) ||
      typeof solution[row][col] !== "string"
    ) {
      alert("Solution not available for this cell.");
      return false;
    }
    if (fixed[row][col]) {
      alert("Can't give a hint for a fixed cell!");
      return false;
    }
    if (board[row][col] !== "") {
      alert("Cell already has a value!");
      return false;
    }
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    return true;
  };

  const isConflicting = (row, col) => {
    const value = board[row][col];
    if (value === "") return false;
    for (let i = 0; i < 9; i++) {
      if (i !== col && board[row][i] === value) return true;
      if (i !== row && board[i][col] === value) return true;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if ((r !== row || c !== col) && board[r][c] === value) return true;
      }
    }
    return false;
  };

  return (
    <div className="app">
      <h1>🧩 Sudoku Game</h1>

      <div className="difficulty-buttons">
        {["easy", "medium", "hard"].map((level) => (
          <button
            key={level}
            className={`difficulty-button ${
              difficulty === level ? "active" : ""
            }`}
            onClick={() => loadPuzzle(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      <div className="timer">⏱️ Time: {formatTime(time)}</div>
      <div className="score">⭐ Score: {score}</div>
       <div className="remaining-moves">
    ❌ Remaining Wrong Moves: {3 - wrongMoves}
  </div>

      <div className="sudoku-grid">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              id={`cell-${r}-${c}`}
                autoComplete="off"
              className={`cell
                ${c % 3 === 0 ? "left-border" : ""}
                ${c === 8 ? "right-border" : ""}
                ${r % 3 === 0 ? "top-border" : ""}
                ${r === 8 ? "bottom-border" : ""}
                ${fixed[r][c] ? "fixed-cell" : ""}
                ${isConflicting(r, c) ? "conflict-cell" : ""}
                ${
                  selectedCell?.[0] === r && selectedCell?.[1] === c
                    ? "selected-cell"
                    : ""
                }
              `}
              type="text"
              maxLength="1"
              value={cell}
              onClick={() => setSelectedCell([r, c])}
              onChange={(e) => handleChange(r, c, e.target.value)}
              onKeyDown={(e) => {
                if (!selectedCell) return;
                let [row, col] = selectedCell;
                switch (e.key) {
                  case "ArrowUp":
                    row = row > 0 ? row - 1 : row;
                    break;
                  case "ArrowDown":
                    row = row < 8 ? row + 1 : row;
                    break;
                  case "ArrowLeft":
                    col = col > 0 ? col - 1 : col;
                    break;
                  case "ArrowRight":
                    col = col < 8 ? col + 1 : col;
                    break;
                  default:
                    return;
                }
                e.preventDefault();
                setSelectedCell([row, col]);
                const next = document.getElementById(`cell-${row}-${col}`);
                if (next) next.focus();
              }}
            />
          ))
        )}
      </div>

      <button className="reset-button" onClick={resetBoard}>
        Reset Board
      </button>
      <button
        className="check-button"
        onClick={() =>
          isValidBoard()
            ? alert("Sudoku board is valid!")
            : alert("Oops! There's a mistake.")
        }
      >
        Check Board
      </button>
      <button
        className="solve-button"
        onClick={() => {
          const copy = board.map((row) => [...row]);
          if (solveSudoku(copy)) {
            setBoard(copy);
            setScore(0); // Reset score if solved automatically
            alert("Sudoku solved");
          } else {
            alert("Unsolvable.");
          }
        }}
      >
        Solve Sudoku
      </button>
      <button className="clear-button" onClick={clearAllUserInputs}>
        Clear All
      </button>
      <button
        className="hint-button"
        onClick={() => {
          if (hintsLeft <= 0) return;
          if (giveHint()) {
            setHintsLeft(hintsLeft - 1);
          }
        }}
        disabled={hintsLeft <= 0}
      >
        Hint ({hintsLeft} left)
      </button>
    </div>
  );
};

export default App;
