class Duck {
    static DUCK_SPRITE = '/static/battleducks/duck.png';
    static DUCK_SIZES = [
        'normal',
        'chubby',
        'long',
        'wide',
        'very-long',
    ];
    
    constructor(element) {
        this.element = element;
        this.element.src = Duck.DUCK_SPRITE;

        if(!this.element.classList.contains("duck")) {
            this.element.classList.add("duck");
        }
        
        this.element.setAttribute('draggable', true);
    }

    resize(size) {
        this.element.classList.add(size);
    }

    size() {
        for (let size of Duck.DUCK_SIZES) {
            if (this.element.classList.contains(size)) {
                return size;
            }
        }
        return null;
    }

    disableDragging() {
        this.element.setAttribute('draggable', false);
    }

    rePositionCSSAbsolute(top, left) {
        this.element.style.position = 'absolute';
        this.element.style.top = top;
        this.element.style.left = left;
    }
}