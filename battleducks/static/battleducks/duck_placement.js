const BOARD_SIZE = 15;
const DUCK_SIZES = [
    'normal',
    'chubby',
    'long',
    'wide',
    'very-long',
];
DUCK_SPRITE = 'https://i.ibb.co/qxxPWsJ/duck.png';

globalDraggedDuckSizeTracker = null;


function createDucksFromDuckSizes(duckSizes) {
    const ducks = [];
    for(const size of duckSizes) {
        ducks.push(new Duck(size));
    }
    return ducks;
}

function getSizeFromImageElement(img) {
    for (let size of DUCK_SIZES) {
        if (img.classList.contains(size)) {
            return size;
        }
    }
    return null;
}

function getCellIDFromCoordinate(x, y) {
  return `cell-${y}-${x}`
}

function getCoordinateFromCellID(cell_id){
  return {
    x: parseInt(cell_id.split('-')[2], 10),
    y: parseInt(cell_id.split('-')[1], 10),
  }
}


class Duck {
    constructor(size) {
        this.element = document.createElement('img');
        this.element.src = DUCK_SPRITE;
        this.element.classList.add("duck");
        this.element.classList.add(size);
        this.element.setAttribute('draggable', true);
    }
}


class Board {
    constructor(boardElement) {
        this.element = boardElement;
    }

    draw() {
        for (let y = 0; y < BOARD_SIZE; y++) { // 15x15 grid
            for (let x = 0; x < BOARD_SIZE; x++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.id = getCellIDFromCoordinate(x, y); // Assigns a unique ID to each cell
                this.element.appendChild(cell);
            }
        }
    }

    initializeDragEvents() {
        const duckCells = Array.from(this.element.children);

        duckCells.forEach((cell) => {
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.clearDuckShadow();

                if(this.isDuckPlacable(e)) {
                    this.showShadow(e, "duck-shadow");
                }
            });
            cell.addEventListener('drop', (e) => {
                this.clearDuckShadow();
                if(this.isDuckPlacable(e)) {
                    this.dropDuck(e);
                }
            });
            cell.addEventListener('dragend', () => {
              this.clearDuckShadow();
            });          
        })
    }

    dropDuck(e) {
        const cell = e.target;
        const duckSize = globalDraggedDuckSizeTracker;
        const draggedDuck = new Duck(duckSize);
        draggedDuck.element.setAttribute('draggable', false);
        draggedDuck.element.style.position = 'absolute';
        draggedDuck.element.style.left = `${cell.getBoundingClientRect().left}px`;
        draggedDuck.element.style.top = `${cell.getBoundingClientRect().top}px`;

        this.element.appendChild(draggedDuck.element);

        this.clearDuckShadow();
        this.showShadow(e, "duck-placed");
    }

    isDuckPlacable(e) {
        const cell_id = e.target.id;
        const coordinate = getCoordinateFromCellID(cell_id);
        
        const size = globalDraggedDuckSizeTracker
        const coordinates = this.getDuckCoordinates(coordinate.x, coordinate.y, size);
     
        return this.isDuckInBound(coordinates) && !this.isDuckOverLapping(coordinates);
    }
  
    isDuckInBound(coordinates) {
        for(let coord of coordinates) {
              if(coord.x<0 || coord.x>= BOARD_SIZE || coord.y<0 || coord.y>=BOARD_SIZE) {
                  return false;
              }
        }
        return true;
    }

    isDuckOverLapping(coordinates) {
        const cells = Array.from(this.element.children);
        
        for(let cell of cells) {
          for(let coordinate of coordinates) {
            const cellCoordinate = getCoordinateFromCellID(cell.id)
            if(
                cellCoordinate.x === coordinate.x &&
                cellCoordinate.y === coordinate.y &&
                cell.classList.contains('duck-placed')
             ) return true; 
          }
        }
        return false;
    }
  
    getDuckCoordinates(refX, refY, size) {
        const width = getComputedStyle(document.documentElement).getPropertyValue('--'+size+'-width').trim();
        const length = getComputedStyle(document.documentElement).getPropertyValue('--'+size+'-height').trim();
        const coordinates = [];
        for(let w = 0; w < width; w++) {
            for(let l = 0; l < length; l++) {
                coordinates.push({
                    x: refX + w,
                    y: refY + l,
                })
            }
        }
        return coordinates;
    }
  
    clearDuckShadow() {
        const duckCells = Array.from(this.element.children);
        duckCells.forEach(function (cell) {
            if(cell.classList.contains("duck-shadow")){
                cell.classList.remove("duck-shadow");
            }
        });
    }

    showShadow(e, shadowClass) {
        const cell = e.target
        const cell_id = cell.id;
        const coordinate = getCoordinateFromCellID(cell_id);
        
        const size = globalDraggedDuckSizeTracker
        const duckCoordinates = this.getDuckCoordinates(coordinate.x, coordinate.y, size);
        
        if(!(this.isDuckInBound(duckCoordinates) && !this.isDuckOverLapping(duckCoordinates))) {
            return;
        }
      
        const cells = Array.from(this.element.children);
        cells.forEach((cell) => {
            duckCoordinates.forEach((duckCoordinate) => {
                const cellCoordinate = getCoordinateFromCellID(cell.id)
                if(
                    cellCoordinate.x === duckCoordinate.x &&
                    cellCoordinate.y === duckCoordinate.y
                ) {
                    cell.classList.add(shadowClass);
                }
            });
        });
    }
}


class DuckTray {
    constructor(duckTrayElement) {
        this.element = duckTrayElement;
    }

    addDucks(ducks) {
        for(const duck of ducks) {
            this.element.appendChild(duck.element);
        }
    }

    createNewDuckOnDrag() {
        const ducks = Array.from(this.element.children);
        ducks.forEach((img) => {
            img.addEventListener('dragstart', (e) => {
                globalDraggedDuckSizeTracker = getSizeFromImageElement(img)
            });
        })
    }
}


class Arena {
    constructor(board, duckTray) {
        this.board = board;
        this.duckTray = duckTray;
    }

    initialize() {
        this.board.draw();
        this.setUpDragAndDrop();
    }

    setUpDragAndDrop() {
        this.duckTray.createNewDuckOnDrag();
        this.board.initializeDragEvents();
    }
}


// game setup
const board = new Board(document.getElementById(`battleship-grid`));
const duckTray = new DuckTray(document.getElementById(`ducks-container`));
duckTray.addDucks(createDucksFromDuckSizes(DUCK_SIZES))

const arena = new Arena(board, duckTray);

arena.initialize();