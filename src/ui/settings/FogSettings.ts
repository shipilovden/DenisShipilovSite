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
  updateFog();

  // Панель управления
  folder.addInput(fogParams, 'включен', { label: 'Включить туман' }).on('change', applyFog);

  folder.addInput(fogParams, 'тип', {
    label: 'Тип',
    options: {
      'Линейный': 'Линейный',
      'Экспоненциальный': 'Экспоненциальный',
    },
  }).on('change', applyFog);

  folder.addInput(fogParams, 'цвет', { label: 'Цвет' }).on('change', () => {
    if (scene.fog) scene.fog.color.set(fogParams.цвет);
  });

  folder.addInput(fogParams, 'ближняяГраница', { min: 0, max: 100, step: 1, label: 'Ближняя граница' }).on('change', () => {
    if (scene.fog instanceof THREE.Fog) scene.fog.near = fogParams.ближняяГраница;
  });

  folder.addInput(fogParams, 'дальняяГраница', { min: 10, max: 1000, step: 10, label: 'Дальняя граница' }).on('change', () => {
    if (scene.fog instanceof THREE.Fog) scene.fog.far = fogParams.дальняяГраница;
  });

  folder.addInput(fogParams, 'плотность', { min: 0.001, max: 0.2, step: 0.001, label: 'Плотность' }).on('change', () => {
    if (scene.fog instanceof THREE.FogExp2) (scene.fog as THREE.FogExp2).density = fogParams.плотность;
  });

  folder.addInput(fogParams, 'анимация', { label: 'Анимация' });
  folder.addInput(fogParams, 'амплитуда', { min: 0, max: 5, step: 0.1, label: 'Амплитуда волн' });
  folder.addInput(fogParams, 'скорость', { min: 0.1, max: 5, step: 0.1, label: 'Скорость волн' });

  folder.addInput(fogParams, 'пресет', {
    label: 'Пресет',
    options: {
      'Без тумана': 'Без тумана',
      'Легкий туман': 'Легкий туман',
      'Плотный туман': 'Плотный туман',
      'Закат': 'Закат',
    },
  }).on('change', () => {
    switch (fogParams.пресет) {
      case 'Без тумана':
        fogParams.включен = false;
        break;
      case 'Легкий туман':
        fogParams.включен = true;
        fogParams.тип = 'Экспоненциальный';
        fogParams.плотность = 0.01;
        fogParams.цвет = '#dddddd';
        break;
      case 'Плотный туман':
        fogParams.включен = true;
        fogParams.тип = 'Экспоненциальный';
        fogParams.плотность = 0.05;
        fogParams.цвет = '#cccccc';
        break;
      case 'Закат':
        fogParams.включен = true;
        fogParams.тип = 'Линейный';
        fogParams.цвет = '#ffa07a';
        fogParams.ближняяГраница = 10;
        fogParams.дальняяГраница = 200;
        break;
    }
    applyFog();
  });
}
