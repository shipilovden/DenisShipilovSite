import * as THREE from 'three';

export function setupAtmosphere(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
  // Устанавливаем цвет фона сцены (голубое небо)
  scene.background = new THREE.Color(0x87CEEB);
  
  // Добавляем туман для создания эффекта глубины
  scene.fog = new THREE.FogExp2(0xCCCCFF, 0.005);
  
  console.log('Atmosphere setup complete');
}
