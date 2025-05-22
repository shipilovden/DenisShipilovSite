import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class GameCamera {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  
  constructor(renderer: THREE.WebGLRenderer) {
    // Создаем камеру
    this.camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.set(0, 5, 10);
    
    // Создаем контроллер орбиты
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 15;
    this.controls.enablePan = false;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.update();
  }
  
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
  
  public getControls(): OrbitControls {
    return this.controls;
  }
  
  public update(): void {
    this.controls.update();
  }
  
  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}