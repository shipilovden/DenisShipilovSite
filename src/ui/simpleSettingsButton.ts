import * as THREE from 'three';
import { Pane } from 'tweakpane';

export function setupSimpleSettingsButton(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  // Создаем фиксированную кнопку настроек
  const button = document.createElement('div');
  button.innerHTML = '⚙️';
  button.style.position = 'fixed';
  button.style.top = '10px';
  button.style.right = '10px';
  button.style.width = '40px';
  button.style.height = '40px';
  button.style.backgroundColor = '#333';
  button.style.color = 'white';
  button.style.borderRadius = '50%';
  button.style.fontSize = '24px';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.cursor = 'pointer';
  button.style.zIndex = '1000';
  button.style.userSelect = 'none';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
  
  // Добавляем кнопку в DOM
  document.body.appendChild(button);
  
  // Создаем контейнер для Tweakpane
  const paneContainer = document.createElement('div');
  paneContainer.style.position = 'fixed';
  paneContainer.style.top = '60px';
  paneContainer.style.right = '10px';
  paneContainer.style.zIndex = '999';
  paneContainer.style.display = 'none';
  document.body.appendChild(paneContainer);
  
  // Создаем панель настроек с помощью Tweakpane
  const pane = new Pane({
    container: paneContainer,
    title: 'Настройки освещения'
  });
  
  // Находим направленный свет (солнце) в сцене
  let sun: THREE.DirectionalLight | null = null;
  scene.traverse((object) => {
    if (object instanceof THREE.DirectionalLight) {
      sun = object;
    }
  });
  
  // Если нет солнца, создаем его
  if (!sun) {
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
  
  // Параметры для настроек
  const params = {
    // Основные настройки солнца
    sunEnabled: true,
    sunColor: '#ffffff',
    sunIntensity: 1.0,
    sunPosition: { x: 10, y: 10, z: 10 },
    sunSize: 2,
    coronaEffect: true,
    coronaSize: 20,
    coronaColor: '#ffff00',
    castShadow: true,
    
    // Настройки теней
    shadowMapSize: 2048,
    shadowSoftness: 2,
    shadowNear: 0.5,
    shadowFar: 50,
    
    // Настройки окружающего света
    ambientLight: 0.4,
    ambientColor: '#404040',
    
    // Настройки неба и тумана
    skyColor: '#87CEEB',
    fogEnabled: false,
    fogDensity: 0.01,
    fogColor: '#E6E6FA',
    
    // Время суток
    timeOfDay: 12,
    autoRotate: false,
    rotationSpeed: 0.1,
    
    // Пресет
    preset: 'Текущий'
  };
  
  // Функция для обновления всех параметров освещения
  function updateLighting() {
    if (sun) {
      sun.visible = params.sunEnabled;
      sun.color.set(params.sunColor);
      sun.intensity = params.sunIntensity;
      sun.position.set(params.sunPosition.x, params.sunPosition.y, params.sunPosition.z);
      sun.castShadow = params.castShadow;
      
      // Настройки теней
      sun.shadow.mapSize.width = params.shadowMapSize;
      sun.shadow.mapSize.height = params.shadowMapSize;
      sun.shadow.radius = params.shadowSoftness;
      sun.shadow.camera.near = params.shadowNear;
      sun.shadow.camera.far = params.shadowFar;
      
      // Обновляем размер области теней
      const shadowCameraSize = 15;
      sun.shadow.camera.left = -shadowCameraSize;
      sun.shadow.camera.right = shadowCameraSize;
      sun.shadow.camera.top = shadowCameraSize;
      sun.shadow.camera.bottom = -shadowCameraSize;
      sun.shadow.camera.updateProjectionMatrix();
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
    
    // Обновляем цвет неба
    scene.background = new THREE.Color(params.skyColor);
    
    // Обновляем туман
    if (params.fogEnabled) {
      scene.fog = new THREE.FogExp2(params.fogColor, params.fogDensity);
    } else {
      scene.fog = null;
    }
    
    // Если включено автовращение, обновляем позицию солнца
    if (params.autoRotate) {
      const theta = (params.timeOfDay / 24) * 2 * Math.PI;
      const radius = 30;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      params.sunPosition = { x, y, z: 10 };
      
      // Обновляем цвет солнца в зависимости от времени суток
      if (params.timeOfDay > 6 && params.timeOfDay < 18) {
        // День
        const dayProgress = (params.timeOfDay - 6) / 12; // 0 на рассвете, 1 на закате
        if (dayProgress < 0.5) {
          // Рассвет -> полдень
          params.sunColor = blendColors('#ff9966', '#ffffff', dayProgress * 2);
        } else {
          // Полдень -> закат
          params.sunColor = blendColors('#ffffff', '#ff4500', (dayProgress - 0.5) * 2);
        }
      } else {
        // Ночь
        params.sunColor = '#c0c0c0';
      }
    }
  }
  
  // Функция для смешивания цветов
  function blendColors(color1: string, color2: string, ratio: number) {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    const blended = new THREE.Color().copy(c1).lerp(c2, ratio);
    return '#' + blended.getHexString();
  }
  
  // Функция для обновления времени суток
  function updateTimeOfDay(time: number) {
    params.timeOfDay = time;
    
    // Обновляем цвет неба в зависимости от времени суток
    if (time > 6 && time < 18) {
      // День
      const dayProgress = (time - 6) / 12; // 0 на рассвете, 1 на закате
      if (dayProgress < 0.5) {
        // Рассвет -> полдень
        params.skyColor = blendColors('#87ceeb', '#4169e1', dayProgress * 2);
      } else {
        // Полдень -> закат
        params.skyColor = blendColors('#4169e1', '#ff7f50', (dayProgress - 0.5) * 2);
      }
    } else {
      // Ночь
      params.skyColor = '#000033';
    }
    
    updateLighting();
  }
  
  // Пресеты освещения
  const presetOptions = {
    'Текущий': 'Текущий',
    'Рассвет': 'Рассвет',
    'Полдень': 'Полдень',
    'Закат': 'Закат',
    'Ночь': 'Ночь',
    'Туманное утро': 'Туманное утро'
  };
  
  pane.addInput(params, 'preset', {
    label: 'Пресет',
    options: presetOptions
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
        params.skyColor = '#ff7f50';
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
        params.fogEnabled = true;
        params.fogDensity = 0.03;
        params.fogColor = '#e6e6fa';
        break;
    }
    
    updateLighting();
  });
  
  // Основные настройки солнца
  const sunFolder = pane.addFolder({
    title: 'Солнце',
    expanded: true
  });
  
  sunFolder.addInput(params, 'sunEnabled', {
    label: 'Включено'
  }).on('change', updateLighting);
  
  sunFolder.addInput(params, 'sunColor', {
    view: 'color',
    label: 'Цвет солнца',
    picker: 'inline', // Встроенный выбор цвета
    expanded: true,   // Развернуть выбор цвета
    color: { alpha: false } // Отключаем прозрачность
  }).on('change', updateLighting);
  
  sunFolder.addInput(params, 'sunIntensity', {
    min: 0,
    max: 3,
    step: 0.1,
    label: 'Интенсивность'
  }).on('change', updateLighting);
  
  // Время суток
  sunFolder.addInput(params, 'timeOfDay', {
    min: 0,
    max: 24,
    step: 0.5,
    label: 'Время суток'
  }).on('change', (ev) => {
    updateTimeOfDay(ev.value);
  });
  
  // Автоматическое вращение солнца
  const rotationFolder = sunFolder.addFolder({
    title: 'Вращение солнца',
    expanded: false
  });
  
  rotationFolder.addInput(params, 'autoRotate', {
    label: 'Автовращение'
  }).on('change', updateLighting);
  
  rotationFolder.addInput(params, 'rotationSpeed', {
    min: 0.01,
    max: 1,
    step: 0.01,
    label: 'Скорость вращения'
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
  }).on('change', updateLighting);
  
  effectsFolder.addInput(params, 'coronaEffect', {
    label: 'Эффект короны'
  }).on('change', updateLighting);
  
  effectsFolder.addInput(params, 'coronaSize', {
    min: 5,
    max: 50,
    step: 1,
    label: 'Размер короны'
  }).on('change', updateLighting);
  
  effectsFolder.addInput(params, 'coronaColor', {
    view: 'color',
    label: 'Цвет короны',
    picker: 'inline',
    expanded: true,
    color: { alpha: false }
  }).on('change', updateLighting);
  
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
  }).on('change', updateLighting);
  
  // Настройки теней
  const shadowFolder = sunFolder.addFolder({
    title: 'Настройки теней',
    expanded: false
  });
  
  shadowFolder.addInput(params, 'castShadow', {
    label: 'Отбрасывать тени'
  }).on('change', updateLighting);
  
  shadowFolder.addInput(params, 'shadowMapSize', {
    options: {
      '512': 512,
      '1024': 1024,
      '2048': 2048,
      '4096': 4096
    },
    label: 'Размер карты теней'
  }).on('change', updateLighting);
  
  shadowFolder.addInput(params, 'shadowSoftness', {
    min: 0,
    max: 10,
    step: 0.1,
    label: 'Мягкость теней'
  }).on('change', updateLighting);
  
  shadowFolder.addInput(params, 'shadowNear', {
    min: 0.1,
    max: 10,
    step: 0.1,
    label: 'Расстояние ближней плоскости'
  }).on('change', updateLighting);
  
  shadowFolder.addInput(params, 'shadowFar', {
    min: 10,
    max: 100,
    step: 1,
    label: 'Расстояние дальней плоскости'
  }).on('change', updateLighting);
  
  // Создаем папку для настроек окружения
  const envFolder = pane.addFolder({ title: 'Окружение', expanded: true });
  
  // Добавляем настройки окружения
  envFolder.addInput(params, 'ambientLight', {
    min: 0,
    max: 1,
    step: 0.1,
    label: 'Фоновый свет'
  }).on('change', updateLighting);
  
  envFolder.addInput(params, 'ambientColor', {
    view: 'color',
    label: 'Цвет фона',
    color: { alpha: false } // Отключаем прозрачность
  }).on('change', updateLighting);
  
  envFolder.addInput(params, 'skyColor', {
    view: 'color',
    label: 'Цвет неба',
    color: { alpha: false } // Отключаем прозрачность
  }).on('change', updateLighting);
  
  // Добавляем настройки тумана
  const fogFolder = envFolder.addFolder({ title: 'Туман', expanded: false });
  
  fogFolder.addInput(params, 'fogEnabled', {
    label: 'Включить туман'
  }).on('change', updateLighting);
  
  fogFolder.addInput(params, 'fogDensity', {
    min: 0.001,
    max: 0.1,
    step: 0.001,
    label: 'Плотность тумана'
  }).on('change', updateLighting);
  
  fogFolder.addInput(params, 'fogColor', {
    view: 'color',
    label: 'Цвет тумана',
    color: { alpha: false } // Отключаем прозрачность
  }).on('change', updateLighting);
  
  // Инициализируем настройки
  updateLighting();
  
  // Обработчик клика по кнопке
  button.onclick = function(event) {
    event.stopPropagation(); // Предотвращаем всплытие события
    if (paneContainer.style.display === 'none') {
      paneContainer.style.display = 'block';
    } else {
      paneContainer.style.display = 'none';
    }
  };
  
  // Предотвращаем смещение кнопки при клике
  button.addEventListener('mousedown', function(event) {
    event.preventDefault();
    event.stopPropagation();
  });
  
  return { button, pane };
}

