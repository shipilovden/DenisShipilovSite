import * as THREE from 'three';

export class GameScene {
  private scene: THREE.Scene;
  private sun: THREE.DirectionalLight | null = null;

  constructor() {
    console.log('Initializing GameScene');
    
    // Создаем сцену
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Голубое небо
    
    // Добавляем базовое освещение
    this.addBasicLighting();
    
    console.log('GameScene initialized');
  }
  
  private addBasicLighting(): void {
    // Добавляем окружающий свет
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);
    
    // Добавляем направленный свет (солнце)
    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.position.set(10, 10, 10);
    this.sun.castShadow = true;
    
    // Настраиваем тени
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 50;
    
    this.scene.add(this.sun);
  }
  
  public getScene(): THREE.Scene {
    return this.scene;
  }
  
  public getSun(): THREE.DirectionalLight | null {
    return this.sun;
  }
}

