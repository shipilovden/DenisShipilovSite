import { MobileControls } from './mobileControls';
import { KeyDisplay } from './utils';

export class GameInput {
  private mobileControls: MobileControls;
  private keyDisplayQueue: KeyDisplay;
  private keysPressed: Record<string, boolean> = {};
  private isGameStarted: boolean = false;
  
  // Обработчики событий
  private onRunToggleCallback: (() => void) | null = null;
  
  constructor() {
    this.mobileControls = new MobileControls();
    this.keyDisplayQueue = new KeyDisplay();
    this.keyDisplayQueue.updatePosition();
    
    // Настраиваем обработчики клавиатуры
    this.setupKeyboardEvents();
    
    // Настраиваем мобильные элементы управления
    this.setupMobileControls();
  }
  
  private setupKeyboardEvents(): void {
    // Обработка нажатия клавиш
    document.addEventListener('keydown', (event) => {
      if (!this.isGameStarted) return;
      
      this.keyDisplayQueue.down(event.key);
      if (event.shiftKey) {
        if (this.onRunToggleCallback) {
          this.onRunToggleCallback();
        }
      } else {
        this.keysPressed[event.key.toLowerCase()] = true;
      }
    }, false);
    
    document.addEventListener('keyup', (event) => {
      if (!this.isGameStarted) return;
      
      this.keyDisplayQueue.up(event.key);
      this.keysPressed[event.key.toLowerCase()] = false;
    }, false);
  }
  
  private setupMobileControls(): void {
    // Показываем элементы управления, если устройство мобильное
    if (this.mobileControls.isMobileDevice()) {
      this.mobileControls.showControls();
    }
    
    // Настраиваем обработчики событий для джойстика
    this.mobileControls.onJoystickMove((x, y) => {
      if (!this.isGameStarted) return;
      
      // Сбрасываем все клавиши
      this.keysPressed['w'] = false;
      this.keysPressed['a'] = false;
      this.keysPressed['s'] = false;
      this.keysPressed['d'] = false;
      
      // Устанавливаем нажатые клавиши в зависимости от положения джойстика
      if (y > 0.3) this.keysPressed['w'] = true;
      if (y < -0.3) this.keysPressed['s'] = true;
      if (x < -0.3) this.keysPressed['a'] = true;
      if (x > 0.3) this.keysPressed['d'] = true;
    });
    
    this.mobileControls.onJoystickEnd(() => {
      if (!this.isGameStarted) return;
      
      // Сбрасываем все клавиши при отпускании джойстика
      this.keysPressed['w'] = false;
      this.keysPressed['a'] = false;
      this.keysPressed['s'] = false;
      this.keysPressed['d'] = false;
    });
    
    // Настраиваем обработчики для кнопок
    this.mobileControls.onRun((pressed) => {
      if (!this.isGameStarted) return;
      
      if (pressed && this.onRunToggleCallback) {
        this.onRunToggleCallback();
      }
    });
  }
  
  public getKeysPressed(): Record<string, boolean> {
    return this.keysPressed;
  }
  
  public setGameStarted(started: boolean): void {
    this.isGameStarted = started;
    
    if (started) {
      // Показываем мобильные элементы управления при старте игры
      // только если устройство мобильное
      if (this.mobileControls.isMobileDevice()) {
        this.mobileControls.showControls();
      }
    } else {
      // Скрываем мобильные элементы управления при паузе
      this.mobileControls.hideControls();
    }
  }
  
  public onRunToggle(callback: () => void): void {
    this.onRunToggleCallback = callback;
  }
  
  public resize(): void {
    this.keyDisplayQueue.updatePosition();
  }
}
