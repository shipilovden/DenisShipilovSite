import * as THREE from 'three';
import { createSky, updateSkyUniforms } from './SkyShaderSetup';

export function setupAtmosphere(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
  console.log("Setting up atmosphere...");
  
  // Создаем небо с шейдерами
  const sky = createSky(scene, camera);
  
  // Настраиваем обновление униформ неба
  updateSkyUniforms(camera);
  
  // Устанавливаем цвет фона сцены (будет заменен шейдером)
  scene.background = new THREE.Color(0x87CEEB);
  
  // Добавляем туман для создания эффекта глубины
  scene.fog = new THREE.FogExp2(0xCCCCFF, 0.005);
  
  console.log("Atmosphere setup complete");
  
  return sky;
}

// Функция для обновления атмосферы при изменении времени суток
export function updateAtmosphere(timeOfDay: number, scene: THREE.Scene) {
  // Здесь можно добавить логику для изменения цвета неба и тумана
  // в зависимости от времени суток
  
  // Например, изменение цвета тумана
  if (scene.fog) {
    // Утро
    if (timeOfDay >= 5 && timeOfDay < 8) {
      scene.fog.color.setHex(0xE6E6FA); // Светло-лавандовый
    }
    // День
    else if (timeOfDay >= 8 && timeOfDay < 18) {
      scene.fog.color.setHex(0xCCCCFF); // Светло-голубой
    }
    // Вечер
    else if (timeOfDay >= 18 && timeOfDay < 21) {
      scene.fog.color.setHex(0xFFB347); // Оранжевый
    }
    // Ночь
    else {
      scene.fog.color.setHex(0x151530); // Темно-синий
    }
  }
}
