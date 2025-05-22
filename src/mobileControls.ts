import { Joystick } from './joystick';

export class MobileControls {
  private joystick: Joystick;
  private jumpButton: HTMLElement;
  private runButton: HTMLElement;
  private actionButton: HTMLElement;
  private isMobile: boolean;
  
  // Состояние кнопок
  private _jumpPressed: boolean = false;
  private _runPressed: boolean = false;
  private _actionPressed: boolean = false;
  
  // Обработчики событий
  private onJumpCallback: ((pressed: boolean) => void) | null = null;
  private onRunCallback: ((pressed: boolean) => void) | null = null;
  private onActionCallback: ((pressed: boolean) => void) | null = null;
  
  constructor() {
    // Проверяем, является ли устройство мобильным
    this.isMobile = this.isMobileDevice();
    console.log('MobileControls constructor - Is mobile device:', this.isMobile);
    
    // Создаем джойстик
    this.joystick = new Joystick();
    
    // Создаем кнопки
    this.jumpButton = this.createButton('JUMP', 'right', 150);
    this.runButton = this.createButton('RUN', 'right', 80);
    this.actionButton = this.createButton('ACTION', 'right', 220);
    
    // Настраиваем обработчики событий для кнопок
    this.setupButtonEvents();
    
    // Автоматически показываем элементы управления, если это мобильное устройство
    if (this.isMobile) {
      console.log('Auto-showing mobile controls on construction');
      this.showControls();
    }
  }
  
  // Создание кнопки
  private createButton(text: string, position: 'left' | 'right', bottom: number): HTMLElement {
    const button = document.createElement('div');
    
    // Стилизуем кнопку
    button.style.position = 'absolute';
    button.style.bottom = `${bottom}px`;
    button.style.right = position === 'right' ? '50px' : 'auto';
    button.style.left = position === 'left' ? '50px' : 'auto';
    button.style.width = '80px';
    button.style.height = '50px';
    button.style.borderRadius = '25px';
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    button.style.border = '2px solid rgba(255, 255, 255, 0.5)';
    button.style.color = 'white';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '16px';
    button.style.fontWeight = 'bold';
    button.style.userSelect = 'none';
    button.style.touchAction = 'none';
    button.style.zIndex = '1000';
    button.style.display = 'none'; // Скрыт по умолчанию
    
    // Добавляем текст
    button.textContent = text;
    
    // Добавляем кнопку в DOM
    document.body.appendChild(button);
    
    return button;
  }
  
  // Настройка обработчиков событий для кнопок
  private setupButtonEvents(): void {
    // Обработчики для кнопки прыжка
    this.setupButtonTouchEvents(this.jumpButton, (pressed) => {
      this._jumpPressed = pressed;
      if (this.onJumpCallback) {
        this.onJumpCallback(pressed);
      }
    });
    
    // Обработчики для кнопки бега
    this.setupButtonTouchEvents(this.runButton, (pressed) => {
      this._runPressed = pressed;
      if (this.onRunCallback) {
        this.onRunCallback(pressed);
      }
    });
    
    // Обработчики для кнопки действия
    this.setupButtonTouchEvents(this.actionButton, (pressed) => {
      this._actionPressed = pressed;
      if (this.onActionCallback) {
        this.onActionCallback(pressed);
      }
    });
  }
  
  // Настройка обработчиков касания для кнопки
  private setupButtonTouchEvents(button: HTMLElement, callback: (pressed: boolean) => void): void {
    button.addEventListener('touchstart', (event) => {
      event.preventDefault();
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      callback(true);
    }, { passive: false });
    
    button.addEventListener('touchend', (event) => {
      event.preventDefault();
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      callback(false);
    }, { passive: false });
    
    button.addEventListener('touchcancel', (event) => {
      event.preventDefault();
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      callback(false);
    }, { passive: false });
  }
  
  // Показать элементы управления
  public showControls(): void {
    if (!this.isMobile) return; // Не показываем на десктопе
    
    console.log('Showing mobile controls');
    this.joystick.show();
    this.jumpButton.style.display = 'flex';
    this.runButton.style.display = 'flex';
    this.actionButton.style.display = 'flex';
  }
  
  // Скрыть элементы управления
  public hideControls(): void {
    if (!this.isMobile) return; // Не скрываем на десктопе (их и так нет)
    
    console.log('Hiding mobile controls');
    this.joystick.hide();
    this.jumpButton.style.display = 'none';
    this.runButton.style.display = 'none';
    this.actionButton.style.display = 'none';
  }
  
  // Проверка, является ли устройство мобильным
  public isMobileDevice(): boolean {
    // Используем более надежный способ определения мобильного устройства
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Добавляем отладочную информацию
    console.log('User agent:', userAgent);
    console.log('Is mobile device:', isMobile);
    
    return isMobile;
  }
  
  // Получить значения джойстика
  public getJoystickValues(): { x: number, y: number } {
    return {
      x: this.joystick.xValue,
      y: this.joystick.yValue
    };
  }
  
  // Получить состояние кнопки прыжка
  public isJumpPressed(): boolean {
    return this._jumpPressed;
  }
  
  // Получить состояние кнопки бега
  public isRunPressed(): boolean {
    return this._runPressed;
  }
  
  // Получить состояние кнопки действия
  public isActionPressed(): boolean {
    return this._actionPressed;
  }
  
  // Установить обработчик для джойстика
  public onJoystickMove(callback: (x: number, y: number) => void): void {
    this.joystick.onMove(callback);
  }
  
  // Установить обработчик для окончания движения джойстика
  public onJoystickEnd(callback: () => void): void {
    this.joystick.onEnd(callback);
  }
  
  // Установить обработчик для кнопки прыжка
  public onJump(callback: (pressed: boolean) => void): void {
    this.onJumpCallback = callback;
  }
  
  // Установить обработчик для кнопки бега
  public onRun(callback: (pressed: boolean) => void): void {
    this.onRunCallback = callback;
  }
  
  // Установить обработчик для кнопки действия
  public onAction(callback: (pressed: boolean) => void): void {
    this.onActionCallback = callback;
  }
}






