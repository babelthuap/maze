(() => {
'use strict';

let grid, gridMaxY, gridMaxX, player, keyPressed;

const Direction = {
  NORTH: 0,
  SOUTH: 1,
  EAST: 2,
  DENIS: 3,
};

const Element = {
  DIMENSIONS: document.querySelectorAll('.dimension'),
  GENERATE_BUTTON: document.getElementById('generate'),
  MAZE: document.querySelector('.maze'),
  WIN: document.getElementById('win'),
};

const KeyCode = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

const PixelSize = {
  BUTTON: 52,
  CELL: 30,
};

const TileType = {
  WALL: false,
  OPEN: true,
};

class Cell {
  constructor() {
    this.down = TileType.WALL;
    this.right = TileType.WALL;
  }
}

class Maze {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.cells_ = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      this.cells_[y] = new Array(this.width);
    }
    this.randomize_();
  }

  randomize_() {
    const startCoords = [rand(this.height), rand(this.width)];
    this.cells_[startCoords[0]][startCoords[1]] = new Cell();
    // Randomized depth-first search
    const stack = [startCoords];
    while (stack.length > 0) {
      const coords = stack[stack.length - 1];
      const neighbors = this.getUndiscoveredNeighbors_(coords);
      if (neighbors.length === 0) {
        stack.pop();
      } else {
        // Open path to a random undiscovered neighbor
        const randNbr = neighbors[rand(neighbors.length)];
        const randNbrCell = (this.cells_[randNbr[0]][randNbr[1]] = new Cell());
        const [deltaY, deltaX] = [randNbr[0] - coords[0], randNbr[1] - coords[1]];
        if (deltaY === 1) {
          this.cells_[coords[0]][coords[1]].down = TileType.OPEN;
        } else if (deltaY === -1) {
          randNbrCell.down = TileType.OPEN;
        } else if (deltaX === 1) {
          this.cells_[coords[0]][coords[1]].right = TileType.OPEN;
        } else if (deltaX === -1) {
          randNbrCell.right = TileType.OPEN;
        }
        stack.push(randNbr);
      }
    }
  }

  // Returns an array of undiscovered neighbors in random order.
  getUndiscoveredNeighbors_([y, x]) {
    let neighbors = [];
    if (y > 0 && !this.cells_[y - 1][x]) {
      neighbors.push([y - 1, x]);
    }
    if (y < this.height - 1 && !this.cells_[y + 1][x]) {
      neighbors.push([y + 1, x]);
    }
    if (x > 0 && !this.cells_[y][x - 1]) {
      neighbors.push([y, x - 1]);
    }
    if (x < this.width - 1 && !this.cells_[y][x + 1]) {
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
  grid = maze.asGrid();
  gridMaxY = grid.length - 1;
  gridMaxX = grid[0].length - 1;
  // Create an exit
  const directionOfDeliverance = rand(4);
  const randOddY = 2 * rand(gridMaxY / 2) + 1;
  const randOddX = 2 * rand(gridMaxX / 2) + 1;
  switch (directionOfDeliverance) {
    case Direction.NORTH:
      grid[0][randOddX] = TileType.OPEN;
      break;
    case Direction.SOUTH:
      grid[gridMaxY][randOddX] = TileType.OPEN;
      break;
    case Direction.EAST:
      grid[randOddY][gridMaxX] = TileType.OPEN;
      break;
    case Direction.DENIS:
      grid[randOddY][0] = TileType.OPEN;
      break;
  }
  // Convert the grid to an unholy number of divs
  const newMaze = createDiv('maze');
  for (let y = 0; y <= gridMaxY; y++) {
    const row = createDiv('row', `y${y}`);
    for (let x = 0; x <= gridMaxX; x++) {
      const cell = createDiv('cell', `x${x}`, (grid[y][x] === TileType.WALL) ? 'wall' : 'open');
      row.appendChild(cell);
    }
    newMaze.appendChild(row);
  }
  Element.MAZE.parentNode.replaceChild(newMaze, Element.MAZE);
  Element.MAZE = newMaze;
}

function createDiv(...classNames) {
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
  const maze = new Maze(height, width);
  render(maze);
  initGame(); 
}

function initGame() {
  // Initial player coords
  const y = ((gridMaxY >> 2) << 1) + 1;
  const x = ((gridMaxX >> 2) << 1) + 1;
  const cell = Element.MAZE.querySelector(`.y${y} .x${x}`);
  cell.classList.add('player');
  player = {cell, y, x};
  Element.WIN.classList.add('hidden');
  document.addEventListener('keydown', handleKeydown);
}

function handleKeydown({keyCode}) {
  // Calculate destination
  let [y, x] = [player.y, player.x];
  switch (keyCode) {
    case KeyCode.UP:
      y--;
      break;
    case KeyCode.DOWN:
      y++;
      break;
    case KeyCode.LEFT:
      x--;
      break;
    case KeyCode.RIGHT:
      x++;
      break;
    default:
      return;
  }
  // Prevent exception on win
  if (grid[y] === undefined || grid[y][x] === undefined) {
    return;
  }
  // Allow inexact moves
  if (grid[y][x] === TileType.WALL) {
    switch (keyCode) {
      case KeyCode.UP:
      case KeyCode.DOWN:
        if (grid[y][x + 1] === TileType.OPEN && grid[y][x - 1] === TileType.WALL) {
          x++;
        } else if (grid[y][x - 1] === TileType.OPEN && grid[y][x + 1] === TileType.WALL) {
          x--;
        } else {
          return;
        }
        break;
      case KeyCode.LEFT:
      case KeyCode.RIGHT:
        if (grid[y + 1][x] === TileType.OPEN && grid[y - 1][x] === TileType.WALL) {
          y++;
        } else if (grid[y - 1][x] === TileType.OPEN && grid[y + 1][x] === TileType.WALL) {
          y--;
        } else {
          return;
        }
        break;
    }
  }

  // Move player
  movePlayer(y, x)

  // Schedule another move while the key is still being pressed
  setTimeout(() => {
    if (keyPressed === keyCode) {
      handleKeydown({keyCode});
    }
  }, 75);
  if (!keyPressed) {
    keyPressed = keyCode;
    document.removeEventListener('keydown', handleKeydown);
    const endMove = () => {
      keyPressed = null;
      document.removeEventListener('keyup', endMove);
      document.addEventListener('keydown', handleKeydown);
    };
    document.addEventListener('keyup', endMove);
  }
}

function movePlayer(y, x) {
  let destCell = Element.MAZE.querySelector(`.y${y} .x${x}`);
  requestAnimationFrame(() => {
    player.cell.classList.remove('player');
    player = {
      cell: destCell,
      y: y,
      x: x,
    };
    player.cell.classList.add('player');
    if (y == 0 || y == gridMaxY || x == 0 || x == gridMaxX) {
      // Win-state
      document.removeEventListener('keydown', handleKeydown);
      keyPressed = null;
      Element.WIN.classList.remove('hidden');
    }
  });
}

class Queue {
  constructor() {
    this.clear();
  }
  clear() {
    this.head_ = null;
    this.tail_ = null;
  }
  push(value) {
    const newTail = {value: value, next: null};
    if (this.tail_ != null) {
      this.tail_.next = newTail;
      this.tail_ = newTail;
    } else {
      this.head_ = this.tail_ = newTail;
    }
  }
  pop() {
    if (this.head_ != null) {
      const value = this.head_.value;
      if (this.head_ == this.tail_) {
        this.clear();
      } else {
        this.head_ = this.head_.next;
      }
      return value;
    } 
  }
  isEmpty() {
    return this.tail_ == null;
  }
}

class BFSCell {
  constructor(y, x, prev) {
    this.y = y;
    this.x = x;
    this.prev = prev;
  }
  toString() {
    return `${this.y},${this.x}`;
  }
  toCoords() {
    return [this.y, this.x];
  }
}

let moveStack = [];
setInterval(() => {
  if (moveStack.length > 0) {
    const [y, x] = moveStack.pop();
    movePlayer(y, x);
  }
}, 50);
document.body.addEventListener('click', ({target}) => {
  if (!target.classList.contains('open')) {
    return;
  }
  const start = new BFSCell(player.y, player.x, null);
  const destString = 
      target.parentNode.className.match(/y(\d+)/)[1] + ',' +
      target.className.match(/x(\d+)/)[1];
  // Breath-first search through the grid
  const visitedSet = new Set();
  const searchQueue = new Queue();
  visitedSet.add(start.toString());
  searchQueue.push(start);
  let current;
  while (!searchQueue.isEmpty()) {
    current = searchQueue.pop();
    // Check whether we've reached dest
    if (current.toString() == destString) {
      break;
    }
    // Add each unvisited neighbor cell to the set and the queue
    const unvisitedNeighbors = [
      new BFSCell(current.y + 1, current.x, current),
      new BFSCell(current.y - 1, current.x, current),
      new BFSCell(current.y, current.x + 1, current),
      new BFSCell(current.y, current.x - 1, current),
    ].filter(cell => {
      return 0 <= cell.y && cell.y <= gridMaxY && 0 <= cell.x && cell.x <= gridMaxX &&
          grid[cell.y][cell.x] == TileType.OPEN && !visitedSet.has(cell.toString());
    });
    for (const neighbor of unvisitedNeighbors) {
      visitedSet.add(neighbor.toString());
      searchQueue.push(neighbor);
    }
  }
  // Push the shortest path onto the move stack
  for (moveStack = []; current.toString() != start.toString(); current = current.prev) {
    moveStack.push(current.toCoords());
  }
});


Element.GENERATE_BUTTON.addEventListener('click', regenerate);
regenerate();

})();
















































