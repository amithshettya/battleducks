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
        ducks.forEach((duckElement) => {
            duckElement.addEventListener('dragstart', (e) => {
                arena.movingDuck = new Duck(duckElement);
            });
        })
    }

    storeDucksFromDuckSizes(duckSizes) {
        const ducks = [];
        for(const size of duckSizes) {
            const element = document.createElement('img')
            const duck = new Duck(element);
            duck.resize(size);
            ducks.push(duck);
        }
        this.addDucks(ducks);
    }
}