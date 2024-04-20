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
        displayMessage("WebSocket Error", error, "red")
    }

    // Show a connected message when the WebSocket is opened.
    socket.onopen = function (event) {
        displayMessage("WebSocket Connected", "", "green")
    }

    // Show a disconnected message when the WebSocket is closed.
    socket.onclose = function (event) {
        displayMessage("WebSocket Disconnected", "", "red")
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
    // Function to format the current time as HH:MM
    function formatTime(date) {
        return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
    }

    console.log("here")
    const chatMessage = document.createElement('div');

    // right pad if its my message
    let padding = "mr-auto";
    if(data.user_first_name == user_first_name && data.user_last_name == user_last_name) {
        padding = "ml-auto";
    }
    

    chatMessage.innerHTML = `
        <div class="flex flex-col ${padding} w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-50 rounded-e-xl rounded-es-xl dark:bg-gray-700">
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">${data.user_first_name} ${data.user_last_name}</span>
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">${formatTime(new Date())}</span>
            </div>
            <p class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">
            ${data.message}
            </p>
        </div>
    `
    const chatLog = document.getElementById('chat-log');
    chatLog.appendChild(chatMessage);
}

function handleShootEvent(data) {
    const cell_x = data.cell_x
    const cell_y = data.cell_y

    //we will color self board if receive shot event from opponent
    colorShotCell(cell_x, cell_y, "self")
}


function setUpGame(socket) {
    setUpBoard(socket, "self")
    setUpBoard(socket, "opponent")
}
function setUpBoard(socket, player) {
    const grid = document.getElementById(`battleship-grid-${player}`);

    for (let j = 0; j < 15; j++) { // 15x15 grid
        for (let i = 0; i < 15; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `${player}-cell-${i}-${j}`; // Assigns a unique ID to each cell
            cell.addEventListener("click", function () {
                //send shoot event via websocket
                if(player === "opponent"){
                    colorShotCell(i, j, player)
                    let data = {
                        "action": "shoot",
                        "user_id": user_id,
                        "cell_x": i,
                        "cell_y": j,
                    }
                    socket.send(JSON.stringify(data))
                }
            });
            grid.appendChild(cell);
        }
    }
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

function displayMessage(heading, message, color) {
    let messageElement = document.getElementById("status")
    messageElement.innerHTML = `
        <div class="p-4 mb-4 text-sm text-${color}-800 rounded-lg bg-${color}-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
            <span class="font-medium">${heading}</span>${message} 
        </div>
    `
}