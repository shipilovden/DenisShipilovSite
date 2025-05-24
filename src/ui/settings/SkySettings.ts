import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { skyUniforms } from '../../atmosphere/SkyUniforms';

export function setupSkySettings(pane: Pane, scene: THREE.Scene) {
  const folder = pane.addFolder({ title: '🌤 Небо' });
  
  const params = {
    skyColor: { r: 128, g: 200, b: 255 },
    horizonColor: { r: 255, g: 230, b: 200 },
    horizonFade: 0.5,
    cloudDensity: 0.5,
    cloudSpeed: 0.25,
    exposure: 1.0,
    airDensity: 0.01,
    showStars: true,
    starIntensity: 0.5,
    preset: 'Текущий'
  };
  
  // Цвет неба
  folder.addInput(params, 'skyColor', { 
    view: 'color',
    label: 'Цвет неба'
  }).on('change', (ev) => {
    if (scene.background instanceof THREE.Color) {
      scene.background.setRGB(
        ev.value.r / 255,
        ev.value.g / 255,
        ev.value.b / 255
      );
    }
    
    // Обновляем юниформы шейдера, если они доступны
    if (skyUniforms && skyUniforms.fogColor) {
      skyUniforms.fogColor.value.setRGB(
        ev.value.r / 255,
        ev.value.g / 255,
        ev.value.b / 255
      );
    }
  });
  
  // Цвет горизонта
  folder.addInput(params, 'horizonColor', { 
    view: 'color',
    label: 'Цвет горизонта'
  }).on('change', (ev) => {
    if (skyUniforms && skyUniforms.horizonColor) {
      skyUniforms.horizonColor.value.setRGB(
        ev.value.r / 255,
        ev.value.g / 255,
        ev.value.b / 255
      );
    }
  });
  
  // Размытие горизонта
  folder.addInput(params, 'horizonFade', {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Размытие горизонта'
  }).on('change', (ev) => {
    if (skyUniforms && skyUniforms.horizonFade) {
      skyUniforms.horizonFade.value = ev.value;
    }
  });
  
  // Плотность облаков
  folder.addInput(params, 'cloudDensity', {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Плотность облаков'
  }).on('change', (ev) => {
    if (skyUniforms && skyUniforms.cloudDensity) {
      skyUniforms.cloudDensity.value = ev.value;
    }
  });
  
  // Скорость облаков
  folder.addInput(params, 'cloudSpeed', {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Скорость облаков'
  }).on('change', (ev) => {
    if (skyUniforms && skyUniforms.cloudSpeed) {
      skyUniforms.cloudSpeed.value = ev.value;
    }
  });
  
  // Экспозиция
  folder.addInput(params, 'exposure', {
    min: 0.1,
    max: 2,
    step: 0.1,
    label: 'Яркость неба'
  }).on('change', (ev) => {
    if (skyUniforms && skyUniforms.exposure) {
      skyUniforms.exposure.value = ev.value;
    }
  });
  
  // Плотность воздуха
  folder.addInput(params, 'airDensity', {
    min: 0.001,
    max: 0.1,
    step: 0.001,
    label: 'Плотность воздуха'
  }).on('change', (ev) => {
    if (skyUniforms && skyUniforms.airDensity) {
      skyUniforms.airDensity.value = ev.value;
    }
  });
  
  // Звезды
  folder.addInput(params, 'showStars', {
    label: 'Показать звезды'
  });
  
  folder.addInput(params, 'starIntensity', {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Яркость звезд'
  });
  
  // Пресеты
  folder.addInput(params, 'preset', {
    label: 'Пресет',
    options: {
      'Текущий': 'Текущий',
      'Ясный день': 'Ясный день',
      'Закат': 'Закат',
      'Ночь': 'Ночь',
      'Туманное утро': 'Туманное утро'
    }
  }).on('change', (ev) => {
    switch (ev.value) {
      case 'Ясный день':
        params.skyColor = { r: 128, g: 200, b: 255 };
        params.horizonColor = { r: 255, g: 230, b: 200 };
        params.horizonFade = 0.5;
        params.cloudDensity = 0.3;
        params.exposure = 1.2;
        params.airDensity = 0.01;
        params.showStars = false;
        break;
      case 'Закат':
        params.skyColor = { r: 100, g: 120, b: 200 };
        params.horizonColor = { r: 255, g: 180, b: 120 };
        params.horizonFade = 0.3;
        params.cloudDensity = 0.6;
        params.exposure = 1.0;
        params.airDensity = 0.02;
        params.showStars = false;
        break;
      case 'Ночь':
        params.skyColor = { r: 10, g: 20, b: 50 };
        params.horizonColor = { r: 30, g: 40, b: 80 };
        params.horizonFade = 0.7;
        params.cloudDensity = 0.4;
        params.exposure = 0.5;
        params.airDensity = 0.005;
        params.showStars = true;
        params.starIntensity = 0.8;
        break;
      case 'Туманное утро':
        params.skyColor = { r: 180, g: 190, b: 200 };
        params.horizonColor = { r: 200, g: 200, b: 210 };
        params.horizonFade = 0.2;
        params.cloudDensity = 0.8;
        params.exposure = 0.9;
        params.airDensity = 0.03;
        params.showStars = false;
        break;
    }
    
    // Применяем изменения
    if (scene.background instanceof THREE.Color) {
      scene.background.setRGB(
        params.skyColor.r / 255,
        params.skyColor.g / 255,
        params.skyColor.b / 255
      );
    }
    
    if (skyUniforms) {
      if (skyUniforms.fogColor) {
        skyUniforms.fogColor.value.setRGB(
          params.skyColor.r / 255,
          params.skyColor.g / 255,
          params.skyColor.b / 255
        );
      }
      
      if (skyUniforms.horizonColor) {
        skyUniforms.horizonColor.value.setRGB(
          params.horizonColor.r / 255,
          params.horizonColor.g / 255,
          params.horizonColor.b / 255
        );
      }
      
      if (skyUniforms.horizonFade) skyUniforms.horizonFade.value = params.horizonFade;
      if (skyUniforms.cloudDensity) skyUniforms.cloudDensity.value = params.cloudDensity;
      if (skyUniforms.cloudSpeed) skyUniforms.cloudSpeed.value = params.cloudSpeed;
      if (skyUniforms.exposure) skyUniforms.exposure.value = params.exposure;
      if (skyUniforms.airDensity) skyUniforms.airDensity.value = params.airDensity;
    }
  });
}










