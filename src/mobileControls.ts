
import * as THREE from 'three';

export class MobileControls {
  // Приватные свойства
  private joystickContainer: HTMLElement;
  private joystickKnob: HTMLElement;
  private runButton: HTMLElement;
  private joystickXValue: number = 0;
  private joystickYValue: number = 0;
  
  // Колбэки для внешних обработчиков
  private joystickMoveCallback: ((x: number, y: number) => void) | null = null;
  private joystickEndCallback: (() => void) | null = null;
  private runButtonCallback: ((pressed: boolean) => void) | null = null;
  
  constructor() {
    // Создаем элементы управления
    this.joystickContainer = this.createJoystickContainer();
    this.joystickKnob = this.createJoystickKnob();
    this.runButton = this.createRunButton();
    
    // Добавляем элементы в DOM
    this.joystickContainer.appendChild(this.joystickKnob);
    document.body.appendChild(this.joystickContainer);
    document.body.appendChild(this.runButton);
    
    // Скрываем элементы по умолчанию
    this.hideControls();
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
  }
  
  // ПУБЛИЧНЫЕ методы для регистрации обработчиков
  public onJoystickMove(callback: (x: number, y: number) => void): void {
    this.joystickMoveCallback = callback;
  }
  
  public onJoystickEnd(callback: () => void): void {
    this.joystickEndCallback = callback;
  }
  
  public onRun(callback: (pressed: boolean) => void): void {
    this.runButtonCallback = callback;
  }
  
  // Метод для проверки мобильного устройства
  public isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // Методы для показа/скрытия элементов управления
  public showControls(): void {
    this.joystickContainer.style.display = 'block';
    this.runButton.style.display = 'block';
  }
  
  public hideControls(): void {
    this.joystickContainer.style.display = 'none';
    this.runButton.style.display = 'none';
  }
  
  // ПРИВАТНЫЕ методы
  private createJoystickContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.bottom = '100px';
    container.style.left = '100px';
    container.style.width = '120px';
    container.style.height = '120px';
    container.style.borderRadius = '60px';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    container.style.border = '2px solid rgba(255, 255, 255, 0.5)';
    container.style.touchAction = 'none';
    return container;
  }
  
  private createJoystickKnob(): HTMLElement {
    const knob = document.createElement('div');
    knob.style.position = 'absolute';
    knob.style.top = '50%';
    knob.style.left = '50%';
    knob.style.transform = 'translate(-50%, -50%)';
    knob.style.width = '50px';
    knob.style.height = '50px';
    knob.style.borderRadius = '25px';
    knob.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    return knob;
  }
  
  private createRunButton(): HTMLElement {
    const button = document.createElement('div');
    button.style.position = 'absolute';
    button.style.bottom = '100px';
    button.style.right = '100px';
    button.style.width = '80px';
    button.style.height = '80px';
    button.style.borderRadius = '40px';
    button.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    button.style.border = '2px solid rgba(255, 255, 255, 0.5)';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.color = 'white';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '16px';
    button.textContent = 'RUN';
    button.style.touchAction = 'none';
    return button;
  }
  
  private setupEventListeners(): void {
    // Обработчики для джойстика
    this.joystickContainer.addEventListener('touchstart', this.handleJoystickStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleJoystickMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleJoystickEnd.bind(this), { passive: false });
    document.addEventListener('touchcancel', this.handleJoystickEnd.bind(this), { passive: false });
    
    // Обработчики для кнопок
    this.runButton.addEventListener('touchstart', () => {
      if (this.runButtonCallback) {
        this.runButtonCallback(true);
      }
    }, { passive: false });
    
    this.runButton.addEventListener('touchend', () => {
      if (this.runButtonCallback) {
        this.runButtonCallback(false);
      }
    }, { passive: false });
  }
  
  // Обработчики событий джойстика
  private handleJoystickStart(event: TouchEvent): void {
    event.preventDefault();
    this.updateJoystickPosition(event);
  }
  
  private handleJoystickMove(event: TouchEvent): void {
    event.preventDefault();
    this.updateJoystickPosition(event);
  }
  
  private handleJoystickEnd(event: TouchEvent): void {
    event.preventDefault();
    
    // Возвращаем джойстик в центр
    this.joystickKnob.style.top = '50%';
    this.joystickKnob.style.left = '50%';
    this.joystickXValue = 0;
    this.joystickYValue = 0;
    
    // Вызываем колбэк
    if (this.joystickEndCallback) {
      this.joystickEndCallback();
    }
  }
  
  private updateJoystickPosition(event: TouchEvent): void {
    // Находим первое касание
    const touch = event.touches[0];
    if (!touch) return;
    
    // Получаем координаты контейнера
    const rect = this.joystickContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Вычисляем смещение от центра
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    
    // Ограничиваем перемещение джойстика
    const maxDistance = rect.width / 2 - 25; // Радиус контейнера минус радиус кнобки
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDistance;
      dy = Math.sin(angle) * maxDistance;
    }
    
    // Обновляем положение кнобки
    this.joystickKnob.style.left = `calc(50% + ${dx}px)`;
    this.joystickKnob.style.top = `calc(50% + ${dy}px)`;
    
    // Нормализуем значения для использования в игре (-1 до 1)
    this.joystickXValue = dx / maxDistance;
    this.joystickYValue = -dy / maxDistance; // Инвертируем Y для соответствия игровым координатам
    
    // Вызываем колбэк
    if (this.joystickMoveCallback) {
      this.joystickMoveCallback(this.joystickXValue, this.joystickYValue);
    }
  }
}

// Глобальная переменная для хранения нажатых клавиш
const keysPressed: Record<string, boolean> = {};






