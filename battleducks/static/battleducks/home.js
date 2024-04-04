function createRoom() {
    $.ajax({
        url: "/battleducks/create-room",
        type: "POST",
        data: `csrfmiddlewaretoken=${getCSRFToken()}`,
        dataType : "json",
        success: openRoom,
        error: updateError
    });
}

function openRoom(response) {
    let room_code = response.room_code;
    let lastIndex = room_url.lastIndexOf('/');
    window.location.pathname = room_url.substring(0, lastIndex + 1) + room_code;
}

function updateError(xhr) {
    if (xhr.status === 0) {
        displayError("Cannot connect to server")
        return
    }

    if (!xhr.getResponseHeader('content-type') === 'application/json') {
        displayError("Received status=" + xhr.status)
        return
    }

    let response = JSON.parse(xhr.responseText)
    if (response.hasOwnProperty('error')) {
        displayError(response.error)
        return
    }

    displayError(response)
}

function displayError(message) {
    $("#error").html(message);
}

function getCSRFToken() {
    let cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim()
        if (c.startsWith("csrftoken=")) {
            return c.substring("csrftoken=".length, c.length)
        }
    }
    return "unknown";
}