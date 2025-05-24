import * as THREE from 'three';
import { Pane } from 'tweakpane';

export function setupFogSettings(pane: Pane, scene: THREE.Scene) {
  const folder = pane.addFolder({ title: '🌫️ Туман' });

  const fogParams = {
    включен: true,
    тип: 'Линейный',
    цвет: '#ffffff',
    ближняяГраница: 1,
    дальняяГраница: 100,
    плотность: 0.02, // для экспоненциального
    анимация: false,
    амплитуда: 1.0,
    скорость: 1.0,
    пресет: 'Без тумана',
  };

  function applyFog() {
    if (!fogParams.включен) {
      scene.fog = null;
      return;
    }

    if (fogParams.тип === 'Линейный') {
      scene.fog = new THREE.Fog(fogParams.цвет, fogParams.ближняяГраница, fogParams.дальняяГраница);
    } else {
      scene.fog = new THREE.FogExp2(fogParams.цвет, fogParams.плотность);
    }
  }

  applyFog();

  const clock = new THREE.Clock();
  function updateFog() {
    if (!fogParams.анимация || !scene.fog) return;
    const t = performance.now() * 0.001 * fogParams.скорость;
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.far = fogParams.дальняяГраница + Math.sin(t) * 10 * fogParams.амплитуда;
    } else if (scene.fog instanceof THREE.FogExp2) {
      (scene.fog as THREE.FogExp2).density = fogParams.плотность + Math.sin(t) * 0.005 * fogParams.амплитуда;
    }
    requestAnimationFrame(updateFog);
  }

  // Включение/выключение тумана
  folder.addInput(fogParams, 'включен', {
    label: 'Включен'
  }).on('change', () => {
    applyFog();
  });

  // Тип тумана
  folder.addInput(fogParams, 'тип', {
    label: 'Тип тумана',
    options: {
      'Линейный': 'Линейный',
      'Экспоненциальный': 'Экспоненциальный'
    }
  }).on('change', () => {
    applyFog();
  });

  // Цвет тумана
  folder.addInput(fogParams, 'цвет', {
    view: 'color',
    label: 'Цвет тумана'
  }).on('change', (ev) => {
    if (scene.fog) {
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.set(ev.value);
      } else if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.set(ev.value);
      }
    }
  });

  // Параметры для линейного тумана
  const linearFogFolder = folder.addFolder({
    title: 'Линейный туман',
    expanded: true,
  });

  linearFogFolder.addInput(fogParams, 'ближняяГраница', {
    min: 0,
    max: 50,
    step: 1,
    label: 'Ближняя граница'
  }).on('change', () => {
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = fogParams.ближняяГраница;
    }
  });

  linearFogFolder.addInput(fogParams, 'дальняяГраница', {
    min: 50,
    max: 500,
    step: 10,
    label: 'Дальняя граница'
  }).on('change', () => {
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.far = fogParams.дальняяГраница;
    }
  });

  // Параметры для экспоненциального тумана
  const expFogFolder = folder.addFolder({
    title: 'Экспоненциальный туман',
    expanded: true,
  });

  expFogFolder.addInput(fogParams, 'плотность', {
    min: 0.001,
    max: 0.1,
    step: 0.001,
    label: 'Плотность'
  }).on('change', () => {
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = fogParams.плотность;
    }
  });

  // Анимация тумана
  const animationFolder = folder.addFolder({
    title: 'Анимация тумана',
    expanded: true,
  });

  animationFolder.addInput(fogParams, 'анимация', {
    label: 'Включить анимацию'
  }).on('change', (ev) => {
    if (ev.value) {
      updateFog();
    }
  });

  animationFolder.addInput(fogParams, 'амплитуда', {
    min: 0,
    max: 5,
    step: 0.1,
    label: 'Амплитуда'
  });

  animationFolder.addInput(fogParams, 'скорость', {
    min: 0.1,
    max: 5,
    step: 0.1,
    label: 'Скорость'
  });

  // Пресеты тумана
  folder.addInput(fogParams, 'пресет', {
    label: 'Пресет',
    options: {
      'Без тумана': 'Без тумана',
      'Легкая дымка': 'Легкая дымка',
      'Густой туман': 'Густой туман',
      'Утренний туман': 'Утренний туман',
      'Ночной туман': 'Ночной туман'
    }
  }).on('change', (ev) => {
    switch (ev.value) {
      case 'Без тумана':
        fogParams.включен = false;
        break;
      case 'Легкая дымка':
        fogParams.включен = true;
        fogParams.тип = 'Экспоненциальный';
        fogParams.цвет = '#e6f0ff';
        fogParams.плотность = 0.005;
        break;
      case 'Густой туман':
        fogParams.включен = true;
        fogParams.тип = 'Экспоненциальный';
        fogParams.цвет = '#c8c8c8';
        fogParams.плотность = 0.03;
        break;
      case 'Утренний туман':
        fogParams.включен = true;
        fogParams.тип = 'Линейный';
        fogParams.цвет = '#e6e6fa';
        fogParams.ближняяГраница = 10;
        fogParams.дальняяГраница = 100;
        break;
      case 'Ночной туман':
        fogParams.включен = true;
        fogParams.тип = 'Экспоненциальный';
        fogParams.цвет = '#151530';
        fogParams.плотность = 0.015;
        break;
    }
    applyFog();
  });
}
