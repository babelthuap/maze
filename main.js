(() => {
'use strict';

let maze;

const Element = {
  DIMENSIONS: document.querySelectorAll('.dimension'),
  GENERATE_BUTTON: document.getElementById('generate'),
  MAZE: document.querySelector('.maze'),
};

const PixelSize = {
  BUTTON: 52,
  CELL: 20,
};

const TileType = {
  WALL: false,
  OPEN: true,
};

class Cell {
  constructor(down = TileType.WALL, right = TileType.WALL) {
    this.down = down;
    this.right = right;
  }
}

class Maze {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.cells_ = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      this.cells_[y] = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        this.cells_[y][x] = new Cell();
      }
    }
    this.randomize_();
  }

  getCell_([y, x]) {
    return this.cells_[y][x];
  }

  randomize_() {
    const discovered = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      discovered[y] = new Array(this.width).fill(false);
    }
    const markDiscovered = ([y, x]) => {
      discovered[y][x] = true;
    };
    const isUndiscovered = ([y, x]) => !discovered[y][x];

    // Randomized depth-first search
    const startCoords = [rand(this.height), rand(this.width)];
    const stack = [startCoords];
    while (stack.length > 0) {
      const coords = stack[stack.length - 1];
      markDiscovered(coords);
      const neighbors = this.getUndiscoveredNeighbors_(coords, isUndiscovered);
      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const randNbr = neighbors[rand(neighbors.length)];
        // Remove wall. Only one coordinate will have changed.
        const deltaY = randNbr[0] - coords[0];
        const deltaX = randNbr[1] - coords[1];
        if (deltaY === 1) {
          this.getCell_(coords).down = TileType.OPEN;
        } else if (deltaY === -1) {
          this.getCell_(randNbr).down = TileType.OPEN;
        } else if (deltaX === 1) {
          this.getCell_(coords).right = TileType.OPEN;
        } else if (deltaX === -1) {
          this.getCell_(randNbr).right = TileType.OPEN;
        }
        stack.push(randNbr);
      }
    }
  }

  // Returns an array of undiscovered neighbors in random order.
  getUndiscoveredNeighbors_([y, x], isUndiscovered) {
    let neighbors = [];
    if (y > 0 && isUndiscovered([y - 1, x])) {
      neighbors.push([y - 1, x]);
    }
    if (y < this.height - 1 && isUndiscovered([y + 1, x])) {
      neighbors.push([y + 1, x]);
    }
    if (x > 0 && isUndiscovered([y, x - 1])) {
      neighbors.push([y, x - 1]);
    }
    if (x < this.width - 1 && isUndiscovered([y, x + 1])) {
      neighbors.push([y, x + 1]);
    }
    return neighbors;
  }

  // Converts the maze to a 2D array of walls ready for rendering.
  asGrid() {
    const height = (this.cells_.length << 1) + 1;
    const width = (this.cells_[0].length << 1) + 1;
    const grid = new Array(height);
    grid[0] = new Array(width).fill(TileType.WALL);
    for (let y = 1; y < height; y++) {
      grid[y] = new Array(width);
      grid[y][0] = TileType.WALL;
      if (y & 1) {
        for (let x = 1; x < width; x++) {
          if (x & 1) {
            // y odd, x odd
            grid[y][x] = TileType.OPEN;
          } else {
            // y odd, x even
            grid[y][x] = this.cells_[(y - 1) >> 1][(x >> 1) - 1].right;
          }
        }
      } else {
        for (let x = 1; x < width; x++) {
          if (x & 1) {
            // y even, x odd
            grid[y][x] = this.cells_[(y >> 1) - 1][(x - 1) >> 1].down;
          } else {
            // y even, x even
            grid[y][x] = TileType.WALL;
          }
        }
      }
    }
    return grid;
  }
}

// Returns random int in range [0, n)
function rand(n) {
  return n > 1 ? Math.floor(n * Math.random()) : 0;
}

function render(maze) {
  const grid = maze.asGrid();
  const height = grid.length;
  const width = grid[0].length;
  const newMaze = createDiv(['maze']);
  for (let y = 0; y < height; y++) {
    const row = createDiv(['row', `y${y}`]);
    for (let x = 0; x < width; x++) {
      const cell = createDiv(['cell', `x${x}`, (grid[y][x] == TileType.WALL) ? 'wall' : 'open']);
      row.appendChild(cell);
    }
    newMaze.appendChild(row);
  }
  Element.MAZE.parentNode.replaceChild(newMaze, Element.MAZE);
  Element.MAZE = newMaze;
}

function createDiv(classNames) {
  const div = document.createElement('div');
  for (let className of classNames) {
    div.classList.add(className);
  }
  return div;
}

function regenerate() {
  let height = parseInt(Element.DIMENSIONS[0].value, 10);
  let width = parseInt(Element.DIMENSIONS[1].value, 10);
  if (isNaN(height) || isNaN(width) || height < 1 || width < 1) {
    const docEl = document.documentElement;
    height = Math.floor((docEl.clientHeight - PixelSize.BUTTON) / (2 * PixelSize.CELL)) - 1;
    width = Math.floor(docEl.clientWidth / (2 * PixelSize.CELL)) - 1;
    Element.DIMENSIONS[0].value = height;
    Element.DIMENSIONS[1].value = width;
  }
  maze = new Maze(height, width);
  render(maze);
}

Element.GENERATE_BUTTON.addEventListener('click', regenerate);
regenerate();

})();
