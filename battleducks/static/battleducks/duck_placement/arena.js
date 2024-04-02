const BOARD_SIZE = 15;
const DUCK_SIZES = [
    'normal',
    'chubby',
    'long',
    'wide',
    'very-long',
];
DUCK_SPRITE = '/static/battleducks/duck.png';

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


function createDucksFromDuckSizes(duckSizes) {
    const ducks = [];
    for(const size of duckSizes) {
        ducks.push(new Duck(size));
    }
    return ducks;
}


class Arena {
    constructor(board, duckTray) {
        this.board = board;
        this.duckTray = duckTray;
        this.movingDuck = null;
    }
    
    reinitialize() {
        this.redraw();
        this.setUpDragAndDrop();
    }

    setUpDragAndDrop() {
        this.duckTray.registerDuckOnDrag(this);
        this.board.initializeDragEvents(this);
    }
    
    redraw() {
        // remove all childrens
        while(this.board.element.lastChild) {
            this.board.element.removeChild(this.board.element.lastChild);
        }
        this.board.draw();
        
        while(this.duckTray.element.lastChild) {
            this.duckTray.element.removeChild(this.duckTray.element.lastChild);
        }
        this.duckTray.addDucks(createDucksFromDuckSizes(DUCK_SIZES));
    }
}