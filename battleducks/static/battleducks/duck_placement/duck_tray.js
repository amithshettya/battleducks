class DuckTray {
    constructor(duckTrayElement) {
        this.element = duckTrayElement;
    }

    addDucks(ducks) {
        for(const duck of ducks) {
            this.element.appendChild(duck.element);
        }
    }

    registerDuckOnDrag(arena) {
        const ducks = Array.from(this.element.children);
        ducks.forEach((img) => {
            img.addEventListener('dragstart', (e) => {
                arena.movingDuck = img
            });
        })
    }
}