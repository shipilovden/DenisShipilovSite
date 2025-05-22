import * as THREE from 'three';

export class GameMenu {
  private container: HTMLElement;
  private startButton: HTMLButtonElement;
  private titleElement: HTMLHeadingElement;
  private isVisible: boolean = true;

  constructor() {
    // Создаем контейнер для меню
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.justifyContent = 'center';
    this.container.style.alignItems = 'center';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.container.style.zIndex = '1000';

    // Создаем заголовок
    this.titleElement = document.createElement('h1');
    this.titleElement.textContent = 'Denis Shipilov Site';
    this.titleElement.style.color = 'white';
    this.titleElement.style.fontFamily = 'Arial, sans-serif';
    this.titleElement.style.fontSize = '48px';
    this.titleElement.style.marginBottom = '40px';
    this.container.appendChild(this.titleElement);

    // Создаем кнопку старта
    this.startButton = document.createElement('button');
    this.startButton.textContent = 'START GAME';
    this.startButton.style.padding = '15px 30px';
    this.startButton.style.fontSize = '24px';
    this.startButton.style.backgroundColor = '#4CAF50';
    this.startButton.style.color = 'white';
    this.startButton.style.border = 'none';
    this.startButton.style.borderRadius = '5px';
    this.startButton.style.cursor = 'pointer';
    this.startButton.style.transition = 'background-color 0.3s';
    
    this.startButton.addEventListener('mouseover', () => {
      this.startButton.style.backgroundColor = '#45a049';
    });
    
    this.startButton.addEventListener('mouseout', () => {
      this.startButton.style.backgroundColor = '#4CAF50';
    });
    
    this.container.appendChild(this.startButton);
    
    // Добавляем меню в DOM
    document.body.appendChild(this.container);
  }

  public onStart(callback: () => void): void {
    // Добавляем обработчик события клика
    this.startButton.addEventListener('click', () => {
      console.log('Start button clicked');
      this.hide();
      callback();
    });
    
    // Добавляем обработчик события касания для мобильных устройств
    this.startButton.addEventListener('touchstart', (event) => {
      event.preventDefault();
      console.log('Start button touched');
      this.hide();
      callback();
    }, { passive: false });
  }

  public show(): void {
    this.container.style.display = 'flex';
    this.isVisible = true;
  }

  public hide(): void {
    this.container.style.display = 'none';
    this.isVisible = false;
  }

  public isMenuVisible(): boolean {
    return this.isVisible;
  }
}
