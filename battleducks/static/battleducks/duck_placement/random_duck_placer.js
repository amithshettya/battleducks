class RandomPlacer {
    constructor(button, arena) {
        this.element = button;
        this.arena = arena;
    }
  
    listenButtonClick() {
        this.element.addEventListener('click', () => {
            this.startRandomPlacement();
        });
    }
    
    startRandomPlacement() {
        const startTime = Date.now();
        const endTime = startTime + 1000; 
        
        // Ducks needs to be place randomly. But there might be cases where random placement
        // might overlap ducks. To prevent this, we will retry until we don't have an overlap.
        // What if there is no place to place duck? This could cause an infinte loop. To prevent 
        // this, a timeout of one second is added to prevent retrying after one second.
        while(Date.now() < endTime) {
            const ducks = Array.from(this.arena.duckTray.element.children)
            if(ducks.length == 0)
                return;
            
            const cells = Array.from(this.arena.board.element.children)
            const randomIndex = Math.floor(Math.random() * cells.length);
            const cell = cells[randomIndex];
            
            const duck = ducks.pop();
            const size = getSizeFromImageElement(duck);
            if(this.arena.board.isDuckPlacable(cell.id, size)) {
                this.arena.board.dropDuck(cell, duck);
            } else {
                ducks.push(duck);
            }
        }
    }
}
