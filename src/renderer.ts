import * as THREE from 'three';

export class GameRenderer {
  private renderer: THREE.WebGLRenderer;
  
  constructor() {
    // Создаем рендерер
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Добавляем canvas на страницу
    document.body.appendChild(this.renderer.domElement);
  }
  
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
  
  public render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }
  
  public resize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}