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
    setupChat(socket)
}

function handleChatEvent(data) {
    document.getElementById('chat-log').value += (data.message + '\n');
}

function handleShootEvent(data) {
    const cellId = data.cell
    document.getElementById('chat-log').value += ("SHOOT: " + cellId + '\n');
    colorShotCell(cellId)
}


function setUpGame(socket) {
    setUpBoard(socket, "self")
    setUpBoard(socket, "opponent")
}
function setUpBoard(socket, player) {
    const grid = document.getElementById(`battleship-grid-${player}`);

    for (let i = 0; i < 15; i++) { // 15x15 grid
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `${player}-cell-${i}-${j}`; // Assigns a unique ID to each cell
            cell.addEventListener("click", function () {
                colorShotCell(cell.id)
                //send shoot event via websocket
                let data = {"action": "shoot", "cell": cell.id}
                socket.send(JSON.stringify(data))
            });
            grid.appendChild(cell);
        }
    }
}

function colorShotCell(cellId) {
    const cell = document.getElementById(cellId)
    if (!cell.classList.contains("clicked")) {
         cell.classList.add("clicked");
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
        const data = {"action": "chat", "message": message}
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