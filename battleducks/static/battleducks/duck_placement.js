function setUpDuckPlacementBoard() {
    const grid = document.getElementById(`battleship-grid`);

    for (let i = 0; i < 15; i++) { // 15x15 grid
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `cell-${i}-${j}`; // Assigns a unique ID to each cell
            grid.appendChild(cell);
        }
    }
}

function setUpDucks() {
    const duckSizes = ['normal', 'chubby', 'long', 'wide', 'very-long']
    const ducks = document.getElementById(`ducks-container`);
    
    duckSizes.forEach(size => {
        const duck = createDuck(size);

        ducks.appendChild(duck);
    });
}

function createDuck(size) {
    const img = document.createElement('img');
    img.src = '/static/battleducks/duck.png';
    img.classList.add("duck");
    img.classList.add(size);
    img.dataset.key = size;

    img.setAttribute('draggable', true);
    return img
}

function setupDragAndDrop() {
    const ducksContainer = document.getElementById('ducks-container');
    const ducks = Array.from(ducksContainer.children);

    ducks.forEach(function (duck){
        duck.addEventListener('dragstart', handleDuckDragStart);
        // duck.addEventListener('dragend', handleDuckDragEnd);
       
    })

    const battleshipGrid = document.getElementById('battleship-grid');
    const duckCells = Array.from(battleshipGrid.children);
    
    duckCells.forEach(function (cell) {
        // cell.addEventListener('dragenter', handleDuckDragEnter);
        cell.addEventListener('dragover', handleDuckDragOver);
        // cell.addEventListener('dragleave', handleDuckDragLeave);
        cell.addEventListener('drop', handleDuckDrop);
    })
}

function handleDuckDragStart(e) {
    e.dataTransfer.setData('size', e.target.dataset.key);
}

function handleDuckDragOver(e) {
    e.preventDefault(); // allow dropping
}

function handleDuckDrop(e) {
    e.preventDefault();
    var size = e.dataTransfer.getData("size");
    const duck = createDuck(size);

    e.target.appendChild(duck);
}





// function handleDuckDragEnter(e) {
//     this.classList.add('placing');
//     e.dataTransfer.setData('duckPosition', this);
// }

// function handleDuckDragLeave(e) {
//     this.classList.remove('placing');
// }

// function handleDuckDragEnd(e) {
//     this.style.opacity = '1';
// }



function setUpDuckPlacement() {
    setUpDuckPlacementBoard();
    setUpDucks();
    setupDragAndDrop();
}

