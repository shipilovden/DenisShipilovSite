export class GameInput {
  private gameStarted: boolean = false;
  private keys: { [key: string]: boolean } = {};

  constructor() {
    console.log('Initializing GameInput');
    
    // Добавляем обработчики событий клавиатуры
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    
    console.log('GameInput initialized');
  }
  
  private onKeyDown(event: KeyboardEvent): void {
    if (!this.gameStarted) return;
    
    this.keys[event.key.toLowerCase()] = true;
  }
  
  private onKeyUp(event: KeyboardEvent): void {
    if (!this.gameStarted) return;
    
    this.keys[event.key.toLowerCase()] = false;
  }
  
  public isKeyPressed(key: string): boolean {
    return this.keys[key.toLowerCase()] === true;
  }
  
  public setGameStarted(started: boolean): void {
    this.gameStarted = started;
  }
}

