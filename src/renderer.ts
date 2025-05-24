import * as THREE from 'three';

export class Renderer {
  private renderer: THREE.WebGLRenderer;
  
  constructor() {
    console.log('Initializing Renderer');
    
    // Создаем WebGL рендерер
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Устанавливаем стили для canvas
    const canvas = this.renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '0';
    
    // Добавляем canvas в DOM
    document.body.appendChild(canvas);
    
    console.log('Renderer initialized');
  }
  
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
  
  public setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }
}


