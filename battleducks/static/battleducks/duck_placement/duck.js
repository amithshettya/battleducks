class Duck {
    constructor(size) {
        this.element = document.createElement('img');
        this.element.src = DUCK_SPRITE;
        this.element.classList.add("duck");
        this.element.classList.add(size);
        this.element.setAttribute('draggable', true);
    }
}