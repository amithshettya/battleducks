const duckSizeToArea = {
    'normal': [
        [0, 0],
    ], 
    'chubby': [
        [0, 0], [0, 1],
    ], 
    'long': [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
    ], 
    'wide': [
        [0, 0], [0, 1],
        [1, 0], [1, 1],
        [2, 0], [2, 1],
        [3, 0], [3, 1],
    ], 
    'very-long': [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
    ],
}

// global variable, lets remove this later
var sizeDuckBeingMoved = ""

function setUpDuckPlacement() {
    setUpDuckPlacementBoard();
    setUpDucks();
    setupDragAndDrop();
}

function setUpDuckPlacementBoard() {
    const grid = document.getElementById(`battleship-grid`);

    for (let y = 0; y < 15; y++) { // 15x15 grid
        for (let x = 0; x < 15; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `cell-${y}-${x}`; // Assigns a unique ID to each cell
            grid.appendChild(cell);
        }
    }
}

function setUpDucks() {
    const duckSizes = Object.keys(duckSizeToArea);
    const ducks = document.getElementById(`ducks-container`);
    
    duckSizes.forEach(size => {
        const duck = createDuck(size, true);
        ducks.appendChild(duck);
    });
}

function createDuck(size, draggable) {
    const img = document.createElement('img');
    img.src = '/static/battleducks/duck.png';
    img.classList.add("duck");
    img.classList.add(size);
    img.dataset.size = size;

    img.setAttribute('draggable', draggable);
    return img
}

function setupDragAndDrop() {
    const ducksContainer = document.getElementById('ducks-container');
    const ducks = Array.from(ducksContainer.children);
    ducks.forEach(function (duck){
        duck.addEventListener('dragstart', recordDuckSize);
    })

    const battleshipGrid = document.getElementById('battleship-grid');
    const duckCells = Array.from(battleshipGrid.children);

    duckCells.forEach(function (cell) {
        cell.addEventListener('dragover', showDuckShadow);
        cell.addEventListener('drop', dropTheDuck);
        cell.addEventListener('dragend', clearDuckShadow);
    })
}

function recordDuckSize(e) {
    sizeDuckBeingMoved = e.target.dataset.size;
}

function showDuckShadow(e) {
    // By default, dropping is disabled.
    e.preventDefault(); 

    clearDuckShadow();

    const duckSize = sizeDuckBeingMoved;
    const cell_id = e.target.id;
    const cellLocY = cell_id.split('-')[1]
    const cellLocX = cell_id.split('-')[2]
    showShadow(cellLocY, cellLocX, duckSize, "duck-shadow");
}

function dropTheDuck(e) {
    var duckSize = sizeDuckBeingMoved;
    const img = createDuck(duckSize, false);
    img.style.position = 'absolute';
    var cellLocY = e.target.getBoundingClientRect().top
    var cellLocX = e.target.getBoundingClientRect().left
    img.style.left = `${cellLocX}px`;
    img.style.top = `${cellLocY}px`;

    // Append the duck to the battleship grid
    const battleshipGrid = document.getElementById('battleship-grid');
    battleshipGrid.appendChild(img);

    // add placement shadow
    clearDuckShadow();
    duckSize = sizeDuckBeingMoved;
    const cell_id = e.target.id;
    cellLocY = cell_id.split('-')[1]
    cellLocX = cell_id.split('-')[2]
    showShadow(cellLocY, cellLocX, duckSize, "duck-placed");
}

function clearDuckShadow() {
    for (let y = 0; y < 15; y++) { // 15x15 grid
        for (let x = 0; x < 15; x++) {
            const id = `cell-${y}-${x}`;
            const cell = document.getElementById(id);
            if(cell.classList.contains("duck-shadow")){
                cell.classList.remove("duck-shadow");
            }
        }
    }
}


function showShadow(cellLocY, cellLocX, duckSize, shadowClass) {
    areas = getDuckShadow(cellLocY, cellLocX, duckSize);
    areas.forEach((coords) => {
        const [y, x] = coords;
        // if out of range clear shadow and exit
        if(y<0 || y>= 15 || x<0 || x>=15) {
            clearDuckShadow();
            return;
        }
        
        const id = `cell-${y}-${x}`;
        const cell = document.getElementById(id);
        if(cell === null) console.log(id);
        cell.classList.add(shadowClass);
    })
}

function getDuckShadow(refY, refX, size) {
    const shadows = [];

    const areas = duckSizeToArea[size];
    areas.forEach((coords) => {
        const [y, x] = coords;
        const newY = parseInt(refY, 10) + parseInt(y, 10);
        const newX = parseInt(refX, 10) + parseInt(x, 10);
        shadows.push([newY,  newX]);
    })
    return shadows;
}

function notInBound(areas) {
    areas.forEach((coords) => {
        const [y, x] = coords;
        if(y<0 || y>= 15 || x<0 || x>=15) return true;
        console.log("evaluate", y, x)
    })
    return false;
}
