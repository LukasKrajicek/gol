let rows = 15;
let cols = 15;
let playing = false;
let timer;
let reproductionTime = 500;
let grid = [];
let nextGrid = [];
let generation = 0;
let history = [];
let ageGrid = []; // Tracks the age of each cell
let liveCellColor = "#4caf50"; // Default color for live cells

let rule1Enabled = true;
let rule2Enabled = true;
let rule3Enabled = false;

document.addEventListener("DOMContentLoaded", () => {
  createTable();
  initializeGrids();
  resetGrids();
  setupControlButtons();
  setupSettings();
});

function resetGrids() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = 0;
      nextGrid[i][j] = 0;
      ageGrid[i][j] = 0; // Reset age to 0
    }
  }
  history = [];
  generation = 0;
  updateStatistics();
  updateView();
}

function initializeGrids() {
  grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
  nextGrid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
  ageGrid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
}

function createTable() {
  let gridContainer = document.getElementById("gridContainer");
  gridContainer.innerHTML = "";
  let table = document.createElement("table");
  table.className = "large";

  for (let i = 0; i < rows; i++) {
    let tr = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
      let cell = document.createElement("td");
      cell.setAttribute("id", `${i}_${j}`);
      cell.setAttribute("class", "dead");
      cell.onclick = cellClickHandler;
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  }
  gridContainer.appendChild(table);
}

function cellClickHandler() {
  let [row, col] = this.id.split("_").map(Number);
  grid[row][col] = grid[row][col] ? 0 : 1;
  ageGrid[row][col] = grid[row][col] ? 1 : 0; // Set age to 1 if cell becomes alive
  this.setAttribute("class", grid[row][col] ? "live" : "dead");
  this.textContent = grid[row][col] ? ageGrid[row][col] : ""; // Display age or clear text
  updateStatistics();
}

function setupControlButtons() {
  document.querySelector("#start").onclick = () => {
    playing = !playing;
    document.querySelector("#start").textContent = playing ? "Pause" : "Start";
    if (playing) play();
  };

  document.querySelector("#clear").onclick = () => {
    playing = false;
    document.querySelector("#start").textContent = "Start";
    resetGrids();
  };

  document.querySelector("#random").onclick = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        grid[i][j] = Math.random() > 0.5 ? 1 : 0;
        ageGrid[i][j] = grid[i][j] ? 1 : 0; // Initialize age to 1 if cell is alive
      }
    }
    updateView();
    updateStatistics();
  };

  document.querySelector("#undo").onclick = () => {
    if (history.length > 0) {
      grid = history.pop();
      generation--;
      updateView();
      updateStatistics();
    }
  };
}

function play() {
  if (playing) {
    saveStateToHistory();
    updateNextGrid();
    updateView();
    setTimeout(play, reproductionTime);
  }
}

function saveStateToHistory() {
  history.push(grid.map(row => row.slice()));
}

function updateNextGrid() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let neighbors = countNeighbors(i, j);
      if (grid[i][j] === 1) {
        nextGrid[i][j] = rule1Enabled && (neighbors === 2 || neighbors === 3) ? 1 : 0;
        ageGrid[i][j] = nextGrid[i][j] ? ageGrid[i][j] + 1 : 0; // Increment age or reset to 0
      } else {
        nextGrid[i][j] = (rule2Enabled && neighbors === 3) || (rule3Enabled && neighbors === 6) ? 1 : 0;
        ageGrid[i][j] = nextGrid[i][j] ? 1 : 0; // Set age to 1 if new cell comes to life
      }
    }
  }

  [grid, nextGrid] = [nextGrid, grid];
  generation++;
  updateStatistics();
}

function countNeighbors(row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      let r = row + i;
      let c = col + j;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        count += grid[r][c];
      }
    }
  }
  return count;
}

function updateStatistics() {
  document.querySelector("#generation").textContent = generation;
  document.querySelector("#livingCells").textContent = grid.flat().filter(cell => cell === 1).length;
}

function updateView() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let cell = document.getElementById(`${i}_${j}`);
      if (grid[i][j]) {
        cell.setAttribute("class", "live");
        cell.style.backgroundColor = liveCellColor; // Aplikace barvy
      } else {
        cell.setAttribute("class", "dead");
        cell.style.backgroundColor = ""; // Reset barvy pro mrtvé buňky
      }
      cell.textContent = grid[i][j] ? ageGrid[i][j] : ""; // Zobrazení věku
    }
  }
}

function toggleSettings() {
  const settings = document.querySelector(".settings");
  settings.style.display = settings.style.display === "none" ? "block" : "none";
  
  if (settings.style.display === "block") {
    settings.scrollIntoView({ behavior: 'smooth' }); // Plynulé posunutí do sekce
  }
}

function setupSettings() {
  document.querySelector("#darkMode").onclick = (e) => {
    document.body.classList.toggle("dark", e.target.checked);
  };

  document.querySelectorAll("input[name='cellSize']").forEach(input => {
    input.onchange = (e) => {
      document.querySelector("table").className = e.target.value;
    };
  });

  document.querySelector("#rule1").onclick = (e) => {
    rule1Enabled = e.target.checked;
  };

  document.querySelector("#rule2").onclick = (e) => {
    rule2Enabled = e.target.checked;
  };

  document.querySelector("#rule3").onclick = (e) => {
    rule3Enabled = e.target.checked;
  };

  // Ukládání barvy živých buněk
  document.querySelector("#cellColor").addEventListener("input", (e) => {
    liveCellColor = e.target.value;
    updateView();
  });
}