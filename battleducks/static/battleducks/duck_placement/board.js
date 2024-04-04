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
                this.updateShadow(e.target.id, arena.movingDuck);
            });

            cell.addEventListener('drop', (e) => {
                this.dropDuck(e.target, arena.movingDuck);
            });

            cell.addEventListener('dragend', () => {
                this.updateShadow(e.target.id, arena.movingDuck);
            });          
        }
    }

    dropDuck(cell, movingDuck) {
        // set the location of the duck with its size
        movingDuck.element.setAttribute("data-cell-id", cell.id);

        movingDuck.rePositionCSSAbsolute(
            `${cell.getBoundingClientRect().top}px`,
            `${cell.getBoundingClientRect().left}px`
        )

        this.updateShadow(cell.id, movingDuck)
        
        this.element.appendChild(movingDuck.element);
    }

    updateShadow(cellID, duck) {
        this.clearDuckShadow();
        if(this.isDuckPlacable(cellID, duck)) {
            this.showShadow(cellID, duck, "blue-shadow");
        }
    }

    isDuckPlacable(cellID, duck) {
        const coordinate = this.getCoordinateFromCellID(cellID);
        const coordinates = duck.getDuckCoordinates(coordinate.x, coordinate.y);
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
  
    clearDuckShadow() {
        const duckCells = this.getCells()
        for(let cell of duckCells) {
            if(cell.classList.contains("blue-shadow")){
                cell.classList.remove("blue-shadow");
            }

            if(cell.classList.contains("red-shadow")){
                cell.classList.remove("red-shadow");
            }
        };
    }

    showShadow(cellID, duck, shadow_color) {
       
        const coordinate = this.getCoordinateFromCellID(cellID);
        
        const duckCoordinates = duck.getDuckCoordinates(coordinate.x, coordinate.y);
        
        const cells = this.getCells()
        for(let cell of cells) {
            for(let duckCoordinate of duckCoordinates)  {
                const cellCoordinate = this.getCoordinateFromCellID(cell.id);
                if(
                    cellCoordinate.x === duckCoordinate.x &&
                    cellCoordinate.y === duckCoordinate.y
                ) {
                    cell.classList.add(shadow_color);
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
            if(children.classList.contains("duck-container"))
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
            duckCoordinates[duck.size()] = duck.getDuckCoordinates(cellCoordinate.x, cellCoordinate.y)
        }
        
        return duckCoordinates;
    }
}