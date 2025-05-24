
import * as THREE from 'three';
import { GameCamera } from './camera';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createSettingsPanel } from './ui/settingsPanel';
import { CharacterControls } from './characterControls';
import { keyDown, keyUp, SHIFT } from './utils';
import { setupAtmosphere } from './atmosphere/AtmosphereSettings';

// Объявляем глобальную функцию для запуска игры
declare global {
  interface Window {
    startGame: () => Promise<void>;
  }
}

// Основные переменные
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let playerModel: THREE.Group | null = null;
let sun: THREE.DirectionalLight;
let gameCamera: GameCamera;

// Переменные для анимации и управления
let characterControls: CharacterControls;
let mixer: THREE.AnimationMixer;
let animations: THREE.AnimationClip[] = [];
let clock = new THREE.Clock();
let keysPressed: {[key: string]: boolean} = {};

// Добавление освещения
function addLighting() {
  // Добавляем окружающий свет
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);
  
  // Добавляем направленный свет (солнце)
  sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(10, 10, 10);
  sun.castShadow = true;
  
  // Настраиваем тени
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 50;
  
  scene.add(sun);
}

// Добавление пола
function addGround() {
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
  
  scene.add(ground);
}

// Инициализация базовых компонентов
function init() {
  console.log('Initializing game components');
  
  // Создаем рендерер
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Создаем камеру после рендерера
  gameCamera = new GameCamera(renderer);
  camera = gameCamera.getCamera();
  controls = gameCamera.getControls();

  // Создаем сцену
  scene = new THREE.Scene();

  // Настраиваем атмосферу
  setupAtmosphere(scene, camera);

  // Добавляем базовое освещение
  addLighting();

  // Добавляем пол
  addGround();

  // Обработчик изменения размера окна
  window.addEventListener('resize', onWindowResize, false);
  
  // Обработчики клавиатуры
  document.addEventListener('keydown', (e) => keyDown(e, keysPressed), false);
  document.addEventListener('keyup', (e) => keyUp(e, keysPressed), false);
  
  // Запускаем цикл анимации
  animate();
  
  console.log('Game initialized');
}

// Обработчик изменения размера окна
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Создание простого игрока (куба)
function createDefaultPlayer() {
  console.log('Creating default player cube');
  
  // Создаем простой куб вместо модели
  const geometry = new THREE.BoxGeometry(1, 2, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 1, 0); // Поднимаем куб, чтобы он стоял на земле
  
  scene.add(cube);
  playerModel = new THREE.Group();
  playerModel.add(cube);
}

// Загрузка модели игрока с анимацией
async function loadPlayerModel(): Promise<void> {
  console.log('Loading player model...');
  
  return new Promise<void>((resolve, reject) => {
    const loader = new GLTFLoader();
    
    // Пробуем загрузить Soldier.glb
    loader.load(
      'models/Soldier.glb',
      (gltf) => {
        playerModel = gltf.scene;
        playerModel.position.set(0, 0, 0);
        playerModel.scale.set(1, 1, 1);
        
        // Настраиваем тени для всех мешей модели
        playerModel.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
        
        scene.add(playerModel);
        
        // Настраиваем анимацию
        animations = gltf.animations;
        if (animations && animations.length > 0) {
          console.log(`Found ${animations.length} animations`);
          
          // Создаем микшер анимаций
          mixer = new THREE.AnimationMixer(playerModel);
          
          // Создаем карту анимаций для CharacterControls
          const animationsMap = new Map();
          
          // Ищем анимации Idle, Walk и Run
          let idleAnim = animations.find(a => a.name.toLowerCase().includes('idle'));
          let walkAnim = animations.find(a => a.name.toLowerCase().includes('walk'));
          let runAnim = animations.find(a => a.name.toLowerCase().includes('run'));
          
          // Если не нашли конкретные анимации, используем первые доступные
          if (!idleAnim && animations.length > 0) idleAnim = animations[0];
          if (!walkAnim && animations.length > 1) walkAnim = animations[1];
          if (!runAnim && animations.length > 2) runAnim = animations[2];
          
          // Добавляем анимации в карту
          if (idleAnim) animationsMap.set('Idle', mixer.clipAction(idleAnim));
          if (walkAnim) animationsMap.set('Walk', mixer.clipAction(walkAnim));
          if (runAnim) animationsMap.set('Run', mixer.clipAction(runAnim));
          
          // Если не нашли все три анимации, используем доступные
          if (animationsMap.size < 3) {
            console.warn('Not all required animations found. Using available animations.');
            
            // Если нет Idle, используем первую анимацию
            if (!animationsMap.has('Idle')) {
              animationsMap.set('Idle', mixer.clipAction(animations[0]));
            }
            
            // Если нет Walk, дублируем Idle или используем вторую анимацию
            if (!animationsMap.has('Walk')) {
              if (animations.length > 1) {
                animationsMap.set('Walk', mixer.clipAction(animations[1]));
              } else if (animationsMap.has('Idle')) {
                animationsMap.set('Walk', mixer.clipAction(idleAnim));
              }
            }
            
            // Если нет Run, дублируем Walk или используем третью анимацию
            if (!animationsMap.has('Run')) {
              if (animations.length > 2) {
                animationsMap.set('Run', mixer.clipAction(animations[2]));
              } else if (animationsMap.has('Walk')) {
                animationsMap.set('Run', mixer.clipAction(walkAnim));
              } else if (animationsMap.has('Idle')) {
                animationsMap.set('Run', mixer.clipAction(idleAnim));
              }
            }
          }
          
          // Создаем контроллер персонажа
          characterControls = new CharacterControls(
            playerModel,
            mixer,
            animationsMap,
            controls,
            camera,
            'Idle'
          );
          
          // Выводим названия всех анимаций
          animations.forEach((clip, index) => {
            console.log(`Animation ${index}: ${clip.name}`);
          });
        } else {
          console.warn('No animations found in the model');
        }
        
        console.log('Soldier model loaded successfully');
        resolve();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('Error loading Soldier model:', error);
        reject(error);
      }
    );
  });
}

// Функция для запуска игры
window.startGame = async function() {
  console.log('Starting game...');
  
  try {
    // Загружаем модель игрока
    await loadPlayerModel();
    
    // Создаем панель настроек
    createSettingsPanel(scene, sun, renderer);
    
    console.log('Game started successfully');
  } catch (error) {
    console.error('Error starting game:', error);
    createDefaultPlayer();
    
    // Создаем панель настроек даже при ошибке
    createSettingsPanel(scene, sun, renderer);
  }
};

// Функция анимации (главный цикл)
function animate() {
  requestAnimationFrame(animate);
  
  // Получаем дельту времени
  const delta = clock.getDelta();
  
  // Обновляем контроллер персонажа, если он существует
  if (characterControls) {
    characterControls.update(delta, keysPressed);
  }
  
  // Обновляем контроллеры камеры
  gameCamera.update();
  
  // Рендерим сцену
  renderer.render(scene, camera);
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Добавляем обработчик клавиши Shift для переключения бега/ходьбы
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === SHIFT && characterControls) {
    characterControls.switchRunToggle();
  }
});
