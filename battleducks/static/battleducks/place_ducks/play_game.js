class GameStarter {
    constructor(button, arena) {
        this.element = button;
        this.arena = arena;
    }

    getCsrfToken() {
        let csrfToken = null;
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === 'csrftoken') {
                csrfToken = value;
                break;
            }
        }
        return csrfToken;
    }
  
    listenButtonClick() {
        this.element.addEventListener('click', () => {
            this.saveDuckLocation();
        });
    } 
    
    saveDuckLocation() {
        fetch(window.location.href + "/save_ducks", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCsrfToken(),
            },
            body: JSON.stringify(this.arena.board.getPlacedDucksInfo())
        })
        .then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Invalid response:', response.body);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    startGame(redirect) {
        window.location.href = redirect;
    }
}
