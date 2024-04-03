class Board {
    static BOARD_SIZE = 15;
    constructor(boardElement) {
        this.element = boardElement;
    }

    draw() {
        for (let y = 0; y < Board.BOARD_SIZE; y++) { // 15x15 grid
            for (let x = 0; x < Board.BOARD_SIZE; x++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.id = this.getCellIDFromCoordinate(x, y); // Assigns a unique ID to each cell
                this.element.appendChild(cell);
            }
        }
    }

    initializeDragEvents(arena) {
        const duckCells = Array.from(this.element.children);

        for(let cell of duckCells) {
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.clearDuckShadow();

                const cell = e.target;
                if(this.isDuckPlacable(cell, arena.movingDuck)) {
                    this.showShadow(cell, arena.movingDuck);
                }
            });

            cell.addEventListener('drop', (e) => {
                this.clearDuckShadow();

                const cell = e.target;
                if(this.isDuckPlacable(cell, arena.movingDuck)) {
                    this.dropDuck(cell, arena.movingDuck);
                }
            });

            cell.addEventListener('dragend', () => {
              this.clearDuckShadow();
            });          
        }
    }

    dropDuck(cell, movingDuck) {
        movingDuck.disableDragging();

        movingDuck.rePositionCSSAbsolute(
            `${cell.getBoundingClientRect().top}px`,
            `${cell.getBoundingClientRect().left}px`
        )
 
        this.element.appendChild(movingDuck.element);

        this.clearDuckShadow();

        // set the location of the duck with its size
        movingDuck.element.setAttribute("data-cell-id", cell.id);
    }

    isDuckPlacable(cell, duck) {
        const coordinate = this.getCoordinateFromCellID(cell.id);
   
        const coordinates = this.getDuckCoordinates(coordinate.x, coordinate.y, duck);
     
        return this.isDuckInBound(coordinates) && !this.isDuckOverLapping(coordinates);
    }
  
    isDuckInBound(coordinates) {
        for(let coord of coordinates) {
            if(
                coord.x < 0 || coord.x >= Board.BOARD_SIZE || 
                coord.y < 0 || coord.y >= Board.BOARD_SIZE
            ) {
                return false;
            }
        }
        return true;
    }

    isDuckOverLapping(newDuckCoordinates) {        
        const duckCoordinates = this.getPlacedDucksCoordinates();


        for(let newDuckCoordinate of newDuckCoordinates) {
            for(const duck in duckCoordinates) {
                for(let coordinate of duckCoordinates[duck]) {
                    if(
                        coordinate.x == newDuckCoordinate.x &&
                        coordinate.y == newDuckCoordinate.y
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
  
    getDuckCoordinates(refX, refY, duck) {
        const size = duck.size();
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
        const duckCells = this.getCells()
        for(let cell of duckCells) {
            if(cell.classList.contains("duck-shadow")){
                cell.classList.remove("duck-shadow");
            }
        };
    }

    showShadow(cell, duck) {
        const cell_id = cell.id;
        const coordinate = this.getCoordinateFromCellID(cell.id);
        
        const duckCoordinates = this.getDuckCoordinates(coordinate.x, coordinate.y, duck);
        
        if(!(this.isDuckInBound(duckCoordinates) && !this.isDuckOverLapping(duckCoordinates))) {
            return;
        }
      
        const cells = this.getCells()
        for(let cell of cells) {
            for(let duckCoordinate of duckCoordinates)  {
                const cellCoordinate = this.getCoordinateFromCellID(cell.id)
                if(
                    cellCoordinate.x === duckCoordinate.x &&
                    cellCoordinate.y === duckCoordinate.y
                ) {
                    cell.classList.add("duck-shadow");
                }
            };
        };
    }

    getCoordinateFromCellID(cell_id){
        return {
            x: parseInt(cell_id.split('-')[2], 10),
            y: parseInt(cell_id.split('-')[1], 10),
        }
    }

    getCellIDFromCoordinate(x, y) {
        return `cell-${y}-${x}`
    }

    getCells() {
        const childrens = Array.from(this.element.children);

        const cells = []
        for(let children of childrens) {
            if(children.classList.contains("cell"))
                cells.push(children);
        }
        return cells;
    }

    getDucks() {
        const childrens = Array.from(this.element.children);

        const ducks = []
        for(let children of childrens) {
            if(children.classList.contains("duck"))
                ducks.push(new Duck(children));
        }
        return ducks;
    }

    getPlacedDucksCoordinates() {
        const duckCoordinates  = {}
        const ducks = this.getDucks()
        
        for(let duck of ducks) {
            const cell_id = duck.element.getAttribute("data-cell-id");
            const cellCoordinate = this.getCoordinateFromCellID(cell_id);
            duckCoordinates[duck.size()] = this.getDuckCoordinates(cellCoordinate.x, cellCoordinate.y, duck)
        }
        
        return duckCoordinates;
    }
}