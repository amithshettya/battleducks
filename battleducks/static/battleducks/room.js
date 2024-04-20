let board;
let ducks;

function initGameRoom() {
    connectToServer()
}


function connectToServer() {
    // Use wss: protocol if site using https:, otherwise use ws: protocol
    let wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"

    // Create a new WebSocket.
    //roomName is from Django template
    let url = `${wsProtocol}//${window.location.host}/ws/battleducks/${roomName}`
    let socket = new WebSocket(url)

    // Handle any errors that occur.
    socket.onerror = function (error) {
        displayMessage("WebSocket Error: " + error)
    }

    // Show a connected message when the WebSocket is opened.
    socket.onopen = function (event) {
        displayMessage("WebSocket Connected")
    }

    // Show a disconnected message when the WebSocket is closed.
    socket.onclose = function (event) {
        displayMessage("WebSocket Disconnected")
    }

    // Handle messages received from the server.
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        const eventType = data["eventType"]
        if (eventType === "chat"){
            handleChatEvent(data)
        } else if (eventType === "shoot") {
            handleShootEvent(data)
        }

    }

    setUpGame(socket)
    setUpDucks()
    setupChat(socket)
}

function handleChatEvent(data) {
    const chatMessage = `${data.user_first_name} ${data.user_last_name} : ${data.message}`
    document.getElementById('chat-log').value += (chatMessage + '\n');
}

function handleShootEvent(data) {
    const cell_x = data.cell_x
    const cell_y = data.cell_y
    document.getElementById('chat-log').value += ("Got shot at coordinate: " + cell_x + + " " + cell_y + '\n');
    //we will color self board if receive shot event from opponent
    colorShotCell(cell_x, cell_y, "self")
}


function setUpGame(socket) {
    board = setUpBoard(socket, "self")
    setUpBoard(socket, "opponent")
}
function setUpBoard(socket, player) {
    let setupBoard = new Board(document.getElementById(`battleship-grid-${player}`));
    setupBoard.drawRoom(socket, player, colorShotCell)
    return setupBoard
}

function colorShotCell(cell_x, cell_y, player) {
    const cellId = `${player}-cell-${cell_x}-${cell_y}`;
    const cell = document.getElementById(cellId)
    if (!cell.classList.contains("shot")) {
        cell.classList.remove("placed")
        cell.classList.add("shot");
    }
}

function colorPlacedCell(cell_x, cell_y) {
    const cellId = `self-cell-${cell_x}-${cell_y}`;
    const cell = document.getElementById(cellId)
    if (!cell.classList.contains("placed")) {
         cell.classList.add("placed");
    }
}



function setupChat(socket) {
    document.getElementById('chat-message-input').focus();
    document.getElementById('chat-message-input').onkeyup = function (e) {
        if (e.key === 'Enter') {  // enter, return
            document.getElementById('chat-message-submit').click();
        }
    };

    document.getElementById('chat-message-submit').onclick = function (e) {
        const messageInputDom = document.getElementById('chat-message-input');
        const message = messageInputDom.value;
        const data = {"action": "chat", "message": message, "user_first_name": user_first_name, "user_last_name": user_last_name}
        socket.send(JSON.stringify(data))
        messageInputDom.value = '';
    };
}


function displayError(message) {
    let errorElement = document.getElementById("error")
    errorElement.innerHTML = message
}

function displayMessage(message) {
    let errorElement = document.getElementById("message")
    errorElement.innerHTML = message
}

function setUpDucks() {
    $.ajax({
        url: `/battleducks/room/${roomName}/get_my_ducks`,
        type: "GET",
        dataType : "json",
        success: placeDucks,
        error: displayError
    });
}

function placeDucks(response) {
    let ducks = response;
    for (let index in ducks) {
        let duck = ducks[index]
        const element = document.createElement('div');
        element.setAttribute('data-size', duck.size);
        const duckEl = new Duck(element);
        duckEl.setOrientation(returnDuckTransform(duck.orientation));

        let cells = board.getCells();
        let cell = cells[duck.x*Board.BOARD_SIZE + duck.y];
        console.log(cell)
        console.log(cell.getBoundingClientRect().top)

        board.dropDuck(cell, duckEl);
    }
}

function returnDuckTransform(orientation) {
    let scale = "scaleY(1)";
    switch(orientation) {
        case "NORTH":
            scale = "scaleY(1)";
            break;
        case "EAST":
            scale = "scaleX(1)";
            break;
        case "SOUTH":
            scale = "scaleY(-1)";
            break;
        case "WEST":
            scale = "scaleX(-1)";
            break;
        default:
            scale = "scaleY(1)";
    }

    return scale;
}