const express = require("express");
const cors = require("cors");
const path = require("path");  // <-- Add this

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Check if placing val is valid in Sudoku grid
function isSafe(grid, row, col, val) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === val) return false;
    if (grid[i][col] === val) return false;
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (grid[boxRow][boxCol] === val) return false;
  }
  return true;
}

// Solve Sudoku by backtracking, used to generate full grid or count solutions
function solveSudoku(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === "") {
        for (let num = 1; num <= 9; num++) {
          const val = num.toString();
          if (isSafe(grid, row, col, val)) {
            grid[row][col] = val;
            if (solveSudoku(grid)) return true;
            grid[row][col] = "";
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Generate a fully solved Sudoku grid randomly
function generateFullSolution() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(""));

  // Fill diagonal 3x3 boxes first for randomness
  function fillBox(rowStart, colStart) {
    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const randIndex = Math.floor(Math.random() * nums.length);
        grid[rowStart + i][colStart + j] = nums[randIndex].toString();
        nums.splice(randIndex, 1);
      }
    }
  }
  fillBox(0, 0);
  fillBox(3, 3);
  fillBox(6, 6);

  solveSudoku(grid);

  return grid;
}

// Convert 2D grid to string with "." for empty cells
function gridToString(grid) {
  return grid
    .map((row) => row.map((cell) => (cell === "" ? "." : cell)).join(""))
    .join("");
}

// Convert string puzzle to 2D grid
function stringToGrid(str) {
  const grid = [];
  for (let i = 0; i < 9; i++) {
    grid.push(
      str
        .slice(i * 9, i * 9 + 9)
        .split("")
        .map((c) => (c === "." ? "" : c))
    );
  }
  return grid;
}

// Count number of solutions (up to limit)
function countSolutions(grid, limit = 2) {
  let solutions = 0;

  function solve(grid) {
    if (solutions >= limit) return;

    // Find empty cell
    let row = -1,
      col = -1;
    outer: for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === "") {
          row = r;
          col = c;
          break outer;
        }
      }
    }

    if (row === -1) {
      solutions++;
      return;
    }

    for (let num = 1; num <= 9; num++) {
      const ch = num.toString();
      if (isSafe(grid, row, col, ch)) {
        grid[row][col] = ch;
        solve(grid);
        grid[row][col] = "";
      }
      if (solutions >= limit) return;
    }
  }

  solve(grid);
  return solutions;
}

// Remove cells safely while keeping unique solution and min clues
function removeCellsSafely(fullGrid, maxRemove, minClues = 17) {
  let puzzleArr = gridToString(fullGrid).split("");
  const indices = [...Array(81).keys()];

  // Shuffle indices randomly
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  let removed = 0;

  for (const idx of indices) {
    if (removed >= maxRemove) break;

    const cluesLeft = puzzleArr.filter((c) => c !== ".").length;

    if (cluesLeft <= minClues) break;

    const backup = puzzleArr[idx];
    puzzleArr[idx] = ".";

    const grid = stringToGrid(puzzleArr.join(""));
    const solutions = countSolutions(grid, 2);

    if (solutions === 1) {
      removed++;
    } else {
      puzzleArr[idx] = backup;
    }
  }

  return stringToGrid(puzzleArr.join(""));
}

// API endpoint with difficulty parameter support
app.get("/generate", (req, res) => {
  try {
    const difficulty = req.query.difficulty || "easy";

    let maxRemove;
    let minClues;

    if (difficulty === "easy") {
      maxRemove = 25; // Leaves ~40-45 clues
      minClues = 40;
    } else if (difficulty === "medium") {
      maxRemove = 50; // Leaves ~30-35 clues
      minClues = 30;
    } else if (difficulty === "hard") {
      maxRemove = 64; // Leaves as low as ~17-20 clues
      minClues = 17;
    } else {
      maxRemove = 25;
      minClues = 40;
    }

    const fullSolutionGrid = generateFullSolution();
    const puzzleGrid = removeCellsSafely(fullSolutionGrid, maxRemove, minClues);

    const clues = puzzleGrid.flat().filter((c) => c !== "").length;
    console.log(`Generated ${difficulty} puzzle with ${clues} clues`);

    res.json({ puzzle: puzzleGrid, solution: fullSolutionGrid });
  } catch (error) {
    console.error("Error generating puzzle:", error);
    res.status(500).json({ error: "Failed to generate puzzle" });
  }
});

// Serve React frontend build as static files
app.use(express.static(path.join(__dirname, "../client/build")));

// For any other routes, serve React's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
