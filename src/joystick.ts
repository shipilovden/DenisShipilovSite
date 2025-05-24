export class Joystick {
  private container: HTMLElement;
  private stick: HTMLElement;
  private baseSize: number = 100;
  private stickSize: number = 50;
  private maxDistance: number = 40;
  private centerX: number = 0;
  private centerY: number = 0;
  private active: boolean = false;
  private touchId: number | null = null;
  
  // Значения джойстика от -1 до 1
  private _xValue: number = 0;
  private _yValue: number = 0;
  
  // Обработчики событий
  private onMoveCallback: ((x: number, y: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  
  constructor() {
    // Создаем элементы джойстика
    this.container = document.createElement('div');
    this.stick = document.createElement('div');
    
    // Проверяем, является ли устройство мобильным
    const isMobile = this.isMobileDevice();
    
    // Устанавливаем размер джойстика (увеличенный для мобильных)
    if (isMobile) {
      this.baseSize = 200; // Увеличиваем в 2 раза для мобильных
      this.stickSize = 100;
      this.maxDistance = 80;
    }
    
    // Стилизуем основу джойстика
    this.container.style.position = 'absolute';
    this.container.style.bottom = '100px';
    this.container.style.left = '100px';
    this.container.style.width = `${this.baseSize}px`;
    this.container.style.height = `${this.baseSize}px`;
    this.container.style.borderRadius = '50%';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    this.container.style.border = '2px solid rgba(255, 255, 255, 0.5)';
    this.container.style.display = 'none'; // Скрыт по умолчанию
    this.container.style.touchAction = 'none'; // Предотвращаем стандартные действия касания
    this.container.style.zIndex = '1000';
    
    // Стилизуем ручку джойстика
    this.stick.style.position = 'absolute';
    this.stick.style.top = `${(this.baseSize - this.stickSize) / 2}px`;
    this.stick.style.left = `${(this.baseSize - this.stickSize) / 2}px`;
    this.stick.style.width = `${this.stickSize}px`;
    this.stick.style.height = `${this.stickSize}px`;
    this.stick.style.borderRadius = '50%';
    this.stick.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    this.stick.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
    
    // Добавляем ручку в контейнер
    this.container.appendChild(this.stick);
    
    // Добавляем джойстик в DOM
    document.body.appendChild(this.container);
    
    // Вычисляем центр
    this.centerX = this.baseSize / 2 - this.stickSize / 2;
    this.centerY = this.baseSize / 2 - this.stickSize / 2;
    
    // Добавляем обработчики событий
    this.setupEventListeners();
  }
  
  // Проверка на мобильное устройство
  private isMobileDevice(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }
  
  // Настройка обработчиков событий
  private setupEventListeners(): void {
    // Обработчики для сенсорных экранов
    this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchcancel', this.onTouchEnd.bind(this), { passive: false });
    
    // Обработчик изменения ориентации экрана
    window.addEventListener('resize', this.onResize.bind(this));
  }
  
  // Обработчик начала касания
  private onTouchStart(event: TouchEvent): void {
    if (this.active) return;
    
    const touch = event.touches[0];
    const rect = this.container.getBoundingClientRect();
    
    // Проверяем, что касание произошло внутри джойстика
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      event.preventDefault();
      this.active = true;
      this.touchId = touch.identifier;
    }
  }
  
  // Обработчик движения пальца
  private onTouchMove(event: TouchEvent): void {
    if (!this.active) return;
    
    event.preventDefault();
    
    // Находим нужное касание по идентификатору
    let touch: Touch | undefined;
    for (let i = 0; i < event.touches.length; i++) {
      if (event.touches[i].identifier === this.touchId) {
        touch = event.touches[i];
        break;
      }
    }
    
    if (!touch) return;
    
    const rect = this.container.getBoundingClientRect();
    
    // Вычисляем смещение от центра джойстика
    const offsetX = touch.clientX - (rect.left + rect.width / 2);
    const offsetY = touch.clientY - (rect.top + rect.height / 2);
    
    // Вычисляем расстояние от центра
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    
    // Ограничиваем движение ручки
    const angle = Math.atan2(offsetY, offsetX);
    const limitedDistance = Math.min(distance, this.maxDistance);
    
    // Вычисляем новую позицию ручки
    const moveX = limitedDistance * Math.cos(angle);
    const moveY = limitedDistance * Math.sin(angle);
    
    // Перемещаем ручку
    this.stick.style.left = `${this.centerX + moveX}px`;
    this.stick.style.top = `${this.centerY + moveY}px`;
    
    // Вычисляем значения джойстика от -1 до 1
    this._xValue = moveX / this.maxDistance;
    this._yValue = moveY / this.maxDistance;
    
    // Вызываем callback, если он установлен
    if (this.onMoveCallback) {
      this.onMoveCallback(this._xValue, this._yValue);
    }
  }
  
  // Обработчик окончания касания
  private onTouchEnd(event: TouchEvent): void {
    if (!this.active) return;
    
    // Проверяем, что это наше касание
    let touchFound = false;
    for (let i = 0; i < event.touches.length; i++) {
      if (event.touches[i].identifier === this.touchId) {
        touchFound = true;
        break;
      }
    }
    
    if (!touchFound) {
      event.preventDefault();
      this.active = false;
      this.touchId = null;
      
      // Возвращаем ручку в центр
      this.stick.style.left = `${this.centerX}px`;
      this.stick.style.top = `${this.centerY}px`;
      
      // Сбрасываем значения
      this._xValue = 0;
      this._yValue = 0;
      
      // Вызываем callback, если он установлен
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    }
  }
  
  // Обработчик изменения размера окна
  private onResize(): void {
    // Обновляем позицию джойстика при изменении размера окна
    // Можно добавить дополнительную логику
  }
  
  // Методы для установки обработчиков
  public onMove(callback: (x: number, y: number) => void): void {
    this.onMoveCallback = callback;
  }
  
  public onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }
  
  // Методы для показа/скрытия джойстика
  public show(): void {
    this.container.style.display = 'block';
  }
  
  public hide(): void {
    this.container.style.display = 'none';
  }
}


