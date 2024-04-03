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
        this.duckTray.storeDucksFromDuckSizes(Duck.DUCK_SIZES);
    }
}