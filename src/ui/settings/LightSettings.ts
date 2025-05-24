import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { updateTimeOfDay } from '../../atmosphere/SkyShaderSetup';
import { skyUniforms } from '../../atmosphere/SkyUniforms';

export function setupLightSettings(pane: Pane, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  const folder = pane.addFolder({ title: '☀️ Освещение и солнце' });
  
  // Находим направленный свет (солнце) в сцене
  let sun: THREE.DirectionalLight | null = null;
  scene.traverse((object) => {
    if (object instanceof THREE.DirectionalLight) {
      sun = object;
    }
  });
  
  if (!sun) {
    console.warn('DirectionalLight (sun) not found in scene');
    sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 10, 10);
    sun.castShadow = true;
    scene.add(sun);
  }
  
  // Находим ambient light в сцене
  let ambientLight: THREE.AmbientLight | null = null;
  scene.traverse((object) => {
    if (object instanceof THREE.AmbientLight) {
      ambientLight = object;
    }
  });
  
  // Если нет ambient light, создаем его
  if (!ambientLight) {
    ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
  }
  
  // Создаем сферу для визуализации солнца
  const sunSphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  scene.add(sunSphere);
  
  // Создаем корону солнца
  const sunGlowTexture = new THREE.TextureLoader().load('/textures/glow.png');
  const sunGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: sunGlowTexture,
      color: 0xffff00,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
  );
  sunGlow.scale.set(20, 20, 1);
  scene.add(sunGlow);
  
  const params = {
    preset: 'Текущий',
    sunEnabled: true,
    sunColor: '#ffffff',
    sunIntensity: 1.0,
    sunPosition: { x: 10, y: 10, z: 10 },
    sunSize: 2,
    coronaEffect: true,
    coronaSize: 20,
    coronaColor: '#ffff00',
    castShadow: true,
    timeOfDay: 12,
    ambientLight: 0.4,
    ambientColor: '#404040',
    autoRotate: false,
    rotationSpeed: 0.1,
    skyColor: '#87CEEB',
    horizonColor: '#E6E6FA',
    fogEnabled: true,
    fogDensity: 0.005,
    fogColor: '#CCCCFF'
  };
  
  // Функция для обновления всех параметров освещения
  function updateLighting() {
    if (sun) {
      sun.visible = params.sunEnabled;
      sun.color.set(params.sunColor);
      sun.intensity = params.sunIntensity;
      sun.position.set(params.sunPosition.x, params.sunPosition.y, params.sunPosition.z);
      sun.castShadow = params.castShadow;
    }
    
    if (ambientLight) {
      ambientLight.intensity = params.ambientLight;
      ambientLight.color.set(params.ambientColor);
    }
    
    // Обновляем сферу солнца
    sunSphere.visible = params.sunEnabled;
    sunSphere.position.copy(sun.position);
    sunSphere.scale.setScalar(params.sunSize);
    (sunSphere.material as THREE.MeshBasicMaterial).color.set(params.sunColor);
    
    // Обновляем корону солнца
    sunGlow.visible = params.sunEnabled && params.coronaEffect;
    sunGlow.position.copy(sun.position);
    sunGlow.scale.setScalar(params.coronaSize);
    sunGlow.material.color.set(params.coronaColor);
    
    // Обновляем небо
    if (skyUniforms) {
      skyUniforms.timeOfDay.value = params.timeOfDay;
      skyUniforms.sunDirection.value.copy(sun.position).normalize();
      
      // Обновляем цвета неба
      skyUniforms.fogColor.value.set(params.fogColor);
      
      // Обновляем туман
      if (params.fogEnabled) {
        if (!scene.fog) {
          scene.fog = new THREE.FogExp2(params.fogColor, params.fogDensity);
        } else {
          scene.fog.color.set(params.fogColor);
          if (scene.fog instanceof THREE.FogExp2) {
            scene.fog.density = params.fogDensity;
          }
        }
      } else {
        scene.fog = null;
      }
    }
    
    // Обновляем настройки рендерера для теней
    if (renderer) {
      renderer.shadowMap.enabled = params.castShadow;
    }
  }
  
  // Пресеты освещения
  folder.addInput(params, 'preset', {
    label: 'Пресет',
    options: {
      'Текущий': 'Текущий',
      'Рассвет': 'Рассвет',
      'Полдень': 'Полдень',
      'Закат': 'Закат',
      'Ночь': 'Ночь',
      'Туманное утро': 'Туманное утро'
    }
  }).on('change', (ev) => {
    switch (ev.value) {
      case 'Рассвет':
        params.timeOfDay = 6;
        params.sunColor = '#ff9966';
        params.sunIntensity = 0.7;
        params.sunPosition = { x: 30, y: 5, z: 10 };
        params.sunSize = 3;
        params.coronaEffect = true;
        params.coronaSize = 30;
        params.coronaColor = '#ff9966';
        params.ambientLight = 0.3;
        params.ambientColor = '#6b5c5c';
        params.skyColor = '#87ceeb';
        params.horizonColor = '#ff9966';
        params.fogEnabled = true;
        params.fogDensity = 0.01;
        params.fogColor = '#e6e6fa';
        break;
        
      case 'Полдень':
        params.timeOfDay = 12;
        params.sunColor = '#ffffff';
        params.sunIntensity = 1.2;
        params.sunPosition = { x: 0, y: 30, z: 0 };
        params.sunSize = 2;
        params.coronaEffect = false;
        params.coronaSize = 20;
        params.coronaColor = '#ffffff';
        params.ambientLight = 0.5;
        params.ambientColor = '#6b8cff';
        params.skyColor = '#4a80ff';
        params.horizonColor = '#87ceeb';
        params.fogEnabled = false;
        params.fogDensity = 0.002;
        params.fogColor = '#ccccff';
        break;
        
      case 'Закат':
        params.timeOfDay = 18;
        params.sunColor = '#ff6633';
        params.sunIntensity = 0.8;
        params.sunPosition = { x: -30, y: 5, z: 10 };
        params.sunSize = 3;
        params.coronaEffect = true;
        params.coronaSize = 35;
        params.coronaColor = '#ff6633';
        params.ambientLight = 0.3;
        params.ambientColor = '#6b5c5c';
        params.skyColor = '#4a80ff';
        params.horizonColor = '#ff6633';
        params.fogEnabled = true;
        params.fogDensity = 0.008;
        params.fogColor = '#ffb347';
        break;
        
      case 'Ночь':
        params.timeOfDay = 0;
        params.sunColor = '#ccccff';
        params.sunIntensity = 0.1;
        params.sunPosition = { x: 0, y: -20, z: 0 };
        params.sunSize = 0;
        params.coronaEffect = false;
        params.coronaSize = 0;
        params.coronaColor = '#ccccff';
        params.ambientLight = 0.1;
        params.ambientColor = '#000033';
        params.skyColor = '#000033';
        params.horizonColor = '#000066';
        params.fogEnabled = true;
        params.fogDensity = 0.015;
        params.fogColor = '#000033';
        break;
        
      case 'Туманное утро':
        params.timeOfDay = 8;
        params.sunColor = '#ffffcc';
        params.sunIntensity = 0.5;
        params.sunPosition = { x: 20, y: 10, z: 10 };
        params.sunSize = 2;
        params.coronaEffect = true;
        params.coronaSize = 40;
        params.coronaColor = '#ffffcc';
        params.ambientLight = 0.4;
        params.ambientColor = '#b3b3cc';
        params.skyColor = '#b3b3cc';
        params.horizonColor = '#e6e6fa';
        params.fogEnabled = true;
        params.fogDensity = 0.03;
        params.fogColor = '#e6e6fa';
        break;
    }
    
    updateLighting();
  });
  
  // Основные настройки солнца
  const sunFolder = folder.addFolder({
    title: 'Солнце',
    expanded: true
  });
  
  sunFolder.addInput(params, 'sunEnabled', {
    label: 'Включено'
  }).on('change', () => updateLighting());
  
  sunFolder.addInput(params, 'sunColor', {
    view: 'color',
    label: 'Цвет солнца'
  }).on('change', () => updateLighting());
  
  sunFolder.addInput(params, 'sunIntensity', {
    min: 0,
    max: 3,
    step: 0.1,
    label: 'Интенсивность'
  }).on('change', () => updateLighting());
  
  sunFolder.addInput(params, 'timeOfDay', {
    min: 0,
    max: 24,
    step: 0.5,
    label: 'Время суток'
  }).on('change', (ev) => {
    updateTimeOfDay(ev.value);
    
    if (sun && !params.autoRotate) {
      // Обновляем позицию солнца в зависимости от времени суток
      const theta = (ev.value / 24) * 2 * Math.PI;
      const radius = 30;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      params.sunPosition = { x, y, z: 10 };
    }
    
    updateLighting();
  });
  
  // Визуальные эффекты солнца
  const effectsFolder = sunFolder.addFolder({
    title: 'Визуальные эффекты',
    expanded: false
  });
  
  effectsFolder.addInput(params, 'sunSize', {
    min: 0,
    max: 10,
    step: 0.5,
    label: 'Размер солнца'
  }).on('change', () => updateLighting());
  
  effectsFolder.addInput(params, 'coronaEffect', {
    label: 'Эффект короны'
  }).on('change', () => updateLighting());
  
  effectsFolder.addInput(params, 'coronaSize', {
    min: 5,
    max: 50,
    step: 1,
    label: 'Размер короны'
  }).on('change', () => updateLighting());
  
  effectsFolder.addInput(params, 'coronaColor', {
    view: 'color',
    label: 'Цвет короны'
  }).on('change', () => updateLighting());
  
  // Позиция солнца
  const positionFolder = sunFolder.addFolder({
    title: 'Позиция солнца',
    expanded: false
  });
  
  positionFolder.addInput(params, 'sunPosition', {
    x: { min: -50, max: 50, step: 1 },
    y: { min: -50, max: 50, step: 1 },
    z: { min: -50, max: 50, step: 1 },
    label: 'Позиция'
  }).on('change', () => updateLighting());
  
  // Автоматическое вращение солнца
  positionFolder.addInput(params, 'autoRotate', {
    label: 'Автовращение'
  });
  
  positionFolder.addInput(params, 'rotationSpeed', {
    min: 0.01,
    max: 1,
    step: 0.01,
    label: 'Скорость вращения'
  });
  
  // Тени
  sunFolder.addInput(params, 'castShadow', {
    label: 'Отбрасывать тени'
  }).on('change', () => updateLighting());
  
  // Ambient light
  const ambientFolder = folder.addFolder({
    title: 'Окружающий свет',
    expanded: false
  });
  
  ambientFolder.addInput(params, 'ambientLight', {
    min: 0,
    max: 1,
    step: 0.05,
    label: 'Интенсивность'
  }).on('change', () => updateLighting());
  
  ambientFolder.addInput(params, 'ambientColor', {
    view: 'color',
    label: 'Цвет'
  }).on('change', () => updateLighting());
  
  // Туман
  const fogFolder = folder.addFolder({
    title: 'Туман',
    expanded: false
  });
  
  fogFolder.addInput(params, 'fogEnabled', {
    label: 'Включен'
  }).on('change', () => updateLighting());
  
  fogFolder.addInput(params, 'fogDensity', {
    min: 0.001,
    max: 0.05,
    step: 0.001,
    label: 'Плотность'
  }).on('change', () => updateLighting());
  
  fogFolder.addInput(params, 'fogColor', {
    view: 'color',
    label: 'Цвет тумана'
  }).on('change', () => updateLighting());
  
  // Функция для анимации солнца
  function animateSun() {
    if (params.autoRotate) {
      params.timeOfDay = (params.timeOfDay + params.rotationSpeed * 0.01) % 24;
      updateTimeOfDay(params.timeOfDay);
      
      const theta = (params.timeOfDay / 24) * 2 * Math.PI;
      const radius = 30;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      params.sunPosition = { x, y, z: 10 };
      
      updateLighting();
    }
    
    requestAnimationFrame(animateSun);
  }
  
  // Инициализация
  updateLighting();
  animateSun();
  
  return {
    updateLighting,
    getParams: () => params
  };
}
