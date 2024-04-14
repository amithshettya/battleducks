class Duck {
    static DUCK_SPRITE_VERTICAL = '/static/battleducks/duck-vertical.png';
    static DUCK_SPRITE_HORIZONTAL = '/static/battleducks/duck-horizontal.png';
    static ROTATE_ICON = '/static/battleducks/rotate-icon.png'
    static UNIT_SIZE_IN_EM = 2;
    static DUCK_SIZES = {
        'normal': {
            'length': 2,
            'width': 1,
        },
        'chubby': {
            'length': 2,
            'width': 2,
        },
        'long': {
            'length': 6,
            'width': 2,
        },
        'wide':{
            'length': 6,
            'width': 4,
        },
        'very-long': {
            'length': 8,
            'width': 2,
        },
    };
    
    constructor(containerElement) {
        this.element = containerElement;


        // if duck and rotate icon is not present add to the element
        if(this.element.children.length !== 2) {
            this.element.classList.add("duck-container");

            const duck = document.createElement('img');
            duck.src = Duck.DUCK_SPRITE_VERTICAL;
            duck.style.width = `${Duck.DUCK_SIZES[this.size()]['width'] * Duck.UNIT_SIZE_IN_EM}em`;
            duck.style.height = `${Duck.DUCK_SIZES[this.size()]['length'] * Duck.UNIT_SIZE_IN_EM}em`;
            duck.style.transform = "scaleY(1)";
            duck.classList.add("duck");
            this.element.appendChild(duck);

            const icon = document.createElement('img');
            icon.src = Duck.ROTATE_ICON;
            icon.addEventListener('click', (e) => {
                this.rotate();
            });
            icon.classList.add("rotate-icon");
        
            this.element.appendChild(icon);

        }

        // set the duck for easy access
        this.duck = this.element.querySelector('.duck');
    }

    size() {
        return this.element.getAttribute('data-size');;
    }

    width() {
        return parseFloat(this.duck.style.width) / Duck.UNIT_SIZE_IN_EM;
    }

    height() {
        return parseFloat(this.duck.style.height) / Duck.UNIT_SIZE_IN_EM;
    }
    
    rePositionCSSAbsolute(top, left) {
        this.element.style.position = 'absolute';
        this.element.style.top = top;
        this.element.style.left = left;
    }

    isHorizontal() {
        const filename = this.duck.src.split('/').pop(); // Get the last part after '/'

        // duck with "horizontal." src is horizontal
        return filename.includes('horizontal.')
    }

    getDuckCoordinates(refX, refY) {
        const width = this.width();
        const length = this.height();

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

    rotate() {
        const cellID = this.element.getAttribute("data-cell-id");
        // when not on a board
        if(cellID === null) {
            this.toggleDimension(); 
            this.toggleImageOrientation();
            this.rotate90();
            return;
        }

        // When on board, remove the duck and place in the rotated orientation
        const boardElement = this.element.parentElement;
        boardElement.removeChild(this.element);

        const board = new Board(boardElement);

        // Change dimension if the duck is not placeble revert back dimension
        this.toggleDimension(); 
        if(!board.isDuckPlacable(cellID, this)) {
            this.toggleDimension();
            this.rotate180();
        } else {
            // In case we can rotate the duck by 90deg, use roatated image
            this.toggleImageOrientation();
            this.rotate90(this.duck.style.transform);
        }

        board.updateShadow(cellID, this);
        boardElement.appendChild(this.element);
    }

    toggleImageOrientation() {
        if(this.isHorizontal()) {
            this.duck.src = Duck.DUCK_SPRITE_VERTICAL;
        } else {
            this.duck.src = Duck.DUCK_SPRITE_HORIZONTAL;
        }
    }

    toggleDimension() {
        const size = this.size();

        const width = this.duck.style.width;
        const height = this.duck.style.height;

        this.duck.style.width = height;
        this.duck.style.height = width;
    }

    rotate90() {
        let newState = "scaleY(1)";
        const currentState = this.duck.style.transform;

        switch(currentState) {
            case "scaleY(1)":
                newState = "scaleX(1)";
                break;

            case "scaleX(1)": 
                newState =  "scaleY(-1)";
                break;

            case "scaleY(-1)":
                newState = "scaleX(-1)";
                break;
            
            case "scaleX(-1)":
                newState = "scaleY(1)";
                break;
        }

        this.duck.style.transform = newState;
    }

    rotate180() {
        let newState = "scaleY(1)";
        const currentState = this.duck.style.transform;

        switch(currentState) {
            case "scaleY(1)":
                newState = "scaleY(-1)";
                break;

            case "scaleX(1)": 
                newState =  "scaleX(-1)";
                break;

            case "scaleY(-1)":
                newState = "scaleY(1)";
                break;
            
            case "scaleX(-1)":
                newState = "scaleX(1)";
                break;
        }

        this.duck.style.transform = newState;
    }
}
