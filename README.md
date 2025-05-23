# Sudoku Puzzle Generator & Solver 🧩

This is a full-stack web application built with **React** on the frontend and **Node.js + Express** on the backend. It generates Sudoku puzzles with different difficulty levels, and also provides a solution for each.

---

## 🔧 Features

### ✅ Backend Features (Node.js + Express)
- Generates a **fully solved** Sudoku grid.
- Removes cells based on **difficulty level** while ensuring a **unique solution**.
- Supports difficulty levels: `easy`, `medium`, and `hard`.
- API endpoint: `GET /generate?difficulty=easy|medium|hard`
- Automatically serves the frontend from the Express server in production.

### ✅ Frontend Features (React)
- Displays the generated Sudoku puzzle in a **9x9 grid**.
- Users can **enter values** into empty cells.
- Includes **validation** to prevent incorrect moves (optional in future).
- Can fetch new puzzles from backend using the difficulty dropdown.
- Designed to be clean and responsive.

---

## 📁 Project Structure
sudoku-project/
│
├── client/ # React frontend
│ ├── public/
│ └── src/
│ └── components/ # Sudoku grid and UI components
│
├── server/ # Express backend
│ └── index.js # API logic for generating Sudoku
│
├── README.md # You are here!
└── package.json


---

## 🚀 Getting Started



```bash
1. Clone the Repository
  git clone https://github.com/yourusername/sudoku-project.git
  cd sudoku-project

2. Install dependencies
Backend
  cd server
  npm install
Frontend
  cd ../client
  npm install

3. Run in development
  Start backend:
    cd ../server
    node index.js
  Start frontend:
    cd ../client
    npm start

4. Production build
  To build the React frontend and serve it from Express:
  cd client
  npm run build
  cd ../server
  node index.js
  Then visit: http://localhost:5000

🌐 API Reference
GET /generate?difficulty=<level>

difficulty : easy, medium, or hard 

🧑‍💻 Author
Made by Nusrat