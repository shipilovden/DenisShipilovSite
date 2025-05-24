import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private playerModel: THREE.Object3D | null = null;
  private isStarted: boolean = false;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    console.log('Game class initialized');
  }

  public async start(): Promise<void> {
    console.log('Game.start() called');
    this.isStarted = true;

    // Добавляем базовое освещение
    this.addLighting();
    
    // Добавляем пол, если его еще нет
    this.addGround();
    
    // Загружаем модель игрока
    try {
      await this.loadPlayerModel();
    } catch (error) {
      console.error('Failed to load player model:', error);
      this.createDefaultPlayer();
    }
    
    // Устанавливаем камеру
    this.camera.position.set(0, 2, 5);
    this.camera.lookAt(0, 0, 0);
    
    console.log('Game started successfully');
  }
  
  private addLighting(): void {
    // Проверяем, есть ли уже освещение
    if (!this.scene.children.some(child => 
        child instanceof THREE.DirectionalLight || 
        child instanceof THREE.AmbientLight)) {
      
      console.log('Adding lighting to scene');
      
      // Добавляем окружающий свет
      const ambientLight = new THREE.AmbientLight(0x404040, 1);
      this.scene.add(ambientLight);
      
      // Добавляем направленный свет (солнце)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 10, 10);
      directionalLight.castShadow = true;
      
      // Настраиваем тени
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      
      this.scene.add(directionalLight);
    }
  }
  
  private addGround(): void {
    // Проверяем, есть ли уже пол
    if (!this.scene.children.some(child => 
        child instanceof THREE.Mesh && 
        child.geometry instanceof THREE.PlaneGeometry)) {
      
      console.log('Adding ground to scene');
      
      // Создаем геометрию пола
      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x556B2F,
        roughness: 0.8,
        metalness: 0.2
      });
      
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2; // Поворачиваем горизонтально
      ground.receiveShadow = true;
      
      this.scene.add(ground);
    }
  }
  
  private async loadPlayerModel(): Promise<void> {
    console.log('Loading player model...');
    
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      
      loader.load(
        'models/character.glb',
        (gltf) => {
          this.playerModel = gltf.scene;
          this.playerModel.position.set(0, 0, 0);
          this.playerModel.scale.set(1, 1, 1);
          this.scene.add(this.playerModel);
          console.log('Player model loaded successfully');
          resolve();
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('Error loading player model:', error);
          reject(error);
        }
      );
    });
  }
  
  private createDefaultPlayer(): void {
    console.log('Creating default player cube');
    
    // Создаем простой куб вместо модели
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1, 0); // Поднимаем куб, чтобы он стоял на земле
    
    this.scene.add(cube);
    this.playerModel = cube;
  }
  
  public isGameStarted(): boolean {
    return this.isStarted;
  }
}
