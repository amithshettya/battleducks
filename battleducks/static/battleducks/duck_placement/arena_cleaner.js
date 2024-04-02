class ArenaCleaner {
    constructor(button, arena) {
      this.element = button;
      this.arena = arena;
    }
  
    listenButtonClick() {
      this.element.addEventListener('click', () => {
          this.arena.reinitialize();
      });
    }
}