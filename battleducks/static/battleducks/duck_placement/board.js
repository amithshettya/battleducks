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

    initializeDragEvents(arena) {
        const duckCells = Array.from(this.element.children);

        duckCells.forEach((cell) => {
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.clearDuckShadow();
                if(this.isDuckPlacable(e.target.id, getSizeFromImageElement(arena.movingDuck))) {
                    this.showShadow(e.target, getSizeFromImageElement(arena.movingDuck),"duck-shadow");
                }
            });
            cell.addEventListener('drop', (e) => {
                this.clearDuckShadow();
                if(this.isDuckPlacable(e.target.id, getSizeFromImageElement(arena.movingDuck))) {
                    this.dropDuck(e.target, arena.movingDuck);
                }
            });
            cell.addEventListener('dragend', () => {
              this.clearDuckShadow();
            });          
        })
    }

    dropDuck(cell, movingDuck) {
        movingDuck.setAttribute('draggable', false);
        movingDuck.style.position = 'absolute';
        movingDuck.style.left = `${cell.getBoundingClientRect().left}px`;
        movingDuck.style.top = `${cell.getBoundingClientRect().top}px`;

        this.element.appendChild(movingDuck);

        this.clearDuckShadow();
        this.showShadow(cell, getSizeFromImageElement(movingDuck), "duck-placed");
    }

    isDuckPlacable(cell_id, size) {
        const coordinate = getCoordinateFromCellID(cell_id);
   
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

    showShadow(cell, size, shadowClass) {
        const cell_id = cell.id;
        const coordinate = getCoordinateFromCellID(cell_id);
        
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