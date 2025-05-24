export class GameMenu {
  private container: HTMLDivElement;
  private startButton: HTMLButtonElement;
  private startCallback: (() => void) | null = null;
  private isVisible: boolean = true;

  constructor() {
    console.log('Initializing GameMenu');
    
    // Создаем контейнер для меню
    this.container = document.createElement('div');
    this.container.id = 'game-menu';
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.justifyContent = 'center';
    this.container.style.alignItems = 'center';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.container.style.zIndex = '1000';
    
    // Создаем кнопку START GAME
    this.startButton = document.createElement('button');
    this.startButton.id = 'start-game-button';
    this.startButton.textContent = 'START GAME';
    this.startButton.style.padding = '15px 30px';
    this.startButton.style.fontSize = '24px';
    this.startButton.style.backgroundColor = '#4CAF50';
    this.startButton.style.color = 'white';
    this.startButton.style.border = 'none';
    this.startButton.style.borderRadius = '5px';
    this.startButton.style.cursor = 'pointer';
    this.startButton.style.fontWeight = 'bold';
    
    // Добавляем обработчик клика
    this.startButton.onclick = (event) => {
      console.log('START GAME button clicked');
      event.preventDefault();
      
      if (this.startCallback) {
        console.log('Executing startCallback');
        this.startCallback();
      } else {
        console.error('startCallback is not set');
      }
    };
    
    // Добавляем кнопку в контейнер
    this.container.appendChild(this.startButton);
    
    // Добавляем контейнер в DOM
    document.body.appendChild(this.container);
    
    console.log('GameMenu initialized');
  }

  public onStart(callback: () => void): void {
    this.startCallback = callback;
    console.log('Start callback set');
  }
  
  public hide(): void {
    this.container.style.display = 'none';
    this.isVisible = false;
    console.log('Menu hidden');
  }
  
  public show(): void {
    this.container.style.display = 'flex';
    this.isVisible = true;
    console.log('Menu shown');
  }
}




















