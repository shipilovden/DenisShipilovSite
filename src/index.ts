
import { KeyDisplay } from './utils';
import { CharacterControls } from './characterControls';
import { GameMenu } from './menu';
import { GameScene } from './scene';
import { GameCamera } from './camera';
import { GameRenderer } from './renderer';
import { MobileControls } from './mobileControls';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Инициализация основных компонентов
const renderer = new GameRenderer();
const gameScene = new GameScene();
const camera = new GameCamera(renderer.getRenderer());
const gameMenu = new GameMenu();
const mobileControls = new MobileControls();

// Проверяем, нужно ли показать мобильные элементы управления сразу
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, checking if mobile controls should be shown');
  
  // Проверяем, является ли устройство мобильным или эмулятором
  const isMobile = mobileControls.isMobileDevice();
  const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isMobile || (isDevMode && window.innerWidth < 800)) {
    console.log('Showing mobile controls on initial load');
    mobileControls.showControls();
  }
});

// Получаем объекты для использования
const scene = gameScene.getScene();
const mainCamera = camera.getCamera();
const orbitControls = camera.getControls();

const keysPressed: Record<string, boolean> = {};
const keyDisplayQueue = new KeyDisplay();
keyDisplayQueue.updatePosition();

let model: THREE.Group;
let characterControls: CharacterControls;
let gltfAnimations: THREE.AnimationClip[];
let isGameStarted = false;

// Добавляем объекты на сцену
function createSceneObjects() {
  // Создаем несколько деревьев
  gameScene.createTree({
    position: new THREE.Vector3(5, 0, 5),
    trunkHeight: 2,
    leavesRadius: 1.2
  });
  
  gameScene.createTree({
    position: new THREE.Vector3(-7, 0, 3),
    trunkHeight: 2.5,
    leavesRadius: 1.5
  });
  
  // Создаем дом
  gameScene.createHouse({
    position: new THREE.Vector3(10, 0, -10),
    width: 5,
    height: 3.5,
    depth: 5
  });
  
  // Создаем группу камней
  const rocksGroup = gameScene.createGroup("rocks");
  
  const rock1 = gameScene.createSphere({
    position: new THREE.Vector3(-5, 0.5, -5),
    radius: 0.5,
    color: 0x808080,
    name: "rock1"
  });
  
  const rock2 = gameScene.createSphere({
    position: new THREE.Vector3(-4.5, 0.3, -4.5),
    radius: 0.3,
    color: 0x707070,
    name: "rock2"
  });
  
  const rock3 = gameScene.createSphere({
    position: new THREE.Vector3(-5.5, 0.4, -4.8),
    radius: 0.4,
    color: 0x909090,
    name: "rock3"
  });
  
  // Добавляем камни в группу
  rocksGroup.add(rock1);
  rocksGroup.add(rock2);
  rocksGroup.add(rock3);
  
  // Создаем куб
  const cube = gameScene.createCube({
    position: new THREE.Vector3(0, 1, -15),
    size: 2,
    color: 0xff0000
  });
  
  // Создаем спрайт (например, для маркера или иконки)
  gameScene.createSprite({
    position: new THREE.Vector3(0, 5, 0),
    scale: new THREE.Vector2(2, 2),
    color: 0xffff00
  });
  
  // Или можно просто заполнить сцену случайными объектами
  // gameScene.populateScene(20);
}

// Вызываем функцию создания объектов
createSceneObjects();

// Создаем кнопку Apply
function createApplyButton() {
  const applyButton = document.createElement('button');
  applyButton.textContent = 'APPLY';
  applyButton.style.position = 'absolute';
  applyButton.style.bottom = '20px';
  applyButton.style.right = '20px';
  applyButton.style.padding = '10px 20px';
  applyButton.style.fontSize = '18px';
  applyButton.style.backgroundColor = '#4CAF50';
  applyButton.style.color = 'white';
  applyButton.style.border = 'none';
  applyButton.style.borderRadius = '5px';
  applyButton.style.cursor = 'pointer';
  applyButton.style.zIndex = '1000';
  
  applyButton.addEventListener('click', () => {
    console.log('Apply changes');
    // Здесь можно добавить логику применения изменений
  });
  
  document.body.appendChild(applyButton);
  return applyButton;
}

// Создаем кнопку Apply
const applyButton = createApplyButton();

// Загрузка модели и настройка управления
new GLTFLoader().load('models/Soldier.glb', function (gltf) {
  model = gltf.scene;
  model.traverse(function (object: any) {
    if (object.isMesh) object.castShadow = true;
  });
  gameScene.add(model);

  gltfAnimations = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map();
  gltfAnimations.filter(a => a.name !== 'TPose').forEach((a: THREE.AnimationClip) => {
    animationsMap.set(a.name, mixer.clipAction(a));
  });

  characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, mainCamera, 'Idle');
  
  // Настраиваем мобильные элементы управления
  setupMobileControls();
  
  // Запускаем анимацию
  animate();
});

// Настройка мобильных элементов управления
function setupMobileControls() {
  // Показываем элементы управления, если устройство мобильное
  if (mobileControls.isMobileDevice()) {
    mobileControls.showControls();
  } else {
    // Для тестирования на десктопе можно принудительно показать элементы управления
    mobileControls.showControls();
  }
  
  // Настраиваем обработчики событий для джойстика
  mobileControls.onJoystickMove((x, y) => {
    // Сбрасываем все клавиши
    keysPressed['w'] = false;
    keysPressed['a'] = false;
    keysPressed['s'] = false;
    keysPressed['d'] = false;
    
    // Устанавливаем нажатые клавиши в зависимости от положения джойстика
    if (y > 0.3) keysPressed['w'] = true;
    if (y < -0.3) keysPressed['s'] = true;
    if (x < -0.3) keysPressed['a'] = true;
    if (x > 0.3) keysPressed['d'] = true;
  });
  
  mobileControls.onJoystickEnd(() => {
    // Сбрасываем все клавиши при отпускании джойстика
    keysPressed['w'] = false;
    keysPressed['a'] = false;
    keysPressed['s'] = false;
    keysPressed['d'] = false;
  });
  
  // Настраиваем обработчики для кнопок
  mobileControls.onJump((pressed) => {
    // Можно добавить прыжок, если он реализован в CharacterControls
    console.log('Jump button pressed:', pressed);
  });
  
  mobileControls.onRun((pressed) => {
    if (characterControls) {
      if (pressed) {
        characterControls.switchRunToggle();
      }
    }
  });
  
  mobileControls.onAction((pressed) => {
    // Действие (например, взаимодействие с объектами)
    console.log('Action button pressed:', pressed);
  });
}

// Обработка нажатия клавиш (только когда игра запущена)
document.addEventListener('keydown', (event) => {
  if (!isGameStarted) return;
  
  keyDisplayQueue.down(event.key);
  if (event.shiftKey && characterControls) {
    characterControls.switchRunToggle();
  } else {
    keysPressed[event.key.toLowerCase()] = true;
  }
}, false);

document.addEventListener('keyup', (event) => {
  if (!isGameStarted) return;
  
  keyDisplayQueue.up(event.key);
  keysPressed[event.key.toLowerCase()] = false;
}, false);

// Обработчик для кнопки Escape (пауза/меню)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (isGameStarted) {
      isGameStarted = false;
      gameMenu.show();
      
      // Скрываем мобильные элементы управления при открытии меню
      mobileControls.hideControls();
    }
  }
});

// Настраиваем обработчик для кнопки старта
gameMenu.onStart(() => {
  isGameStarted = true;
  
  // Показываем мобильные элементы управления при старте игры
  if (mobileControls.isMobileDevice()) {
    mobileControls.showControls();
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  
  // Обновляем контроллер персонажа только если игра запущена
  if (characterControls && isGameStarted) {
    characterControls.update(delta, keysPressed);
  }

  camera.update();
  renderer.render(scene, mainCamera);
}

function onWindowResize() {
  camera.resize();
  renderer.resize();
  keyDisplayQueue.updatePosition();
}
window.addEventListener('resize', onWindowResize);

// Загрузка дополнительных моделей
gameScene.loadModel({
  path: 'models/tree.glb',
  position: new THREE.Vector3(15, 0, 15),
  scale: 2,
  name: 'customTree',
  onLoad: (model) => {
    console.log('Tree model loaded!');
    // Здесь можно выполнить дополнительные действия с загруженной моделью
  }
});
