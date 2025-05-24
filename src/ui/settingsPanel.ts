import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { setupLightSettings } from './settings/LightSettings';
import { setupFogSettings } from './settings/FogSettings';
import { setupObjectSettings } from './settings/ObjectSettings';
import { setupParticleSettings } from './settings/ParticleSettings';
import { setupXRStreamSettings } from './settings/XRStreamSettings';
import { setupSkySettings } from './settings/SkySettings';

export function createSettingsPanel(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  // Создаем контейнер для настроек
  const settingsContainer = document.createElement('div');
  settingsContainer.style.position = 'absolute';
  settingsContainer.style.top = '10px';
  settingsContainer.style.right = '10px';
  settingsContainer.style.zIndex = '1000';
  document.body.appendChild(settingsContainer);
  
  // Создаем кнопку для открытия/закрытия панели (только шестеренка)
  const toggleButton = document.createElement('div'); // Используем div вместо button
  toggleButton.innerHTML = '⚙️';
  toggleButton.style.padding = '8px';
  toggleButton.style.backgroundColor = '#333';
  toggleButton.style.color = 'white';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '4px';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.fontSize = '24px';
  toggleButton.style.width = '40px';
  toggleButton.style.height = '40px';
  toggleButton.style.display = 'flex';
  toggleButton.style.alignItems = 'center';
  toggleButton.style.justifyContent = 'center';
  toggleButton.style.userSelect = 'none'; // Предотвращает выделение текста
  toggleButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)'; // Добавляем тень для лучшей видимости
  settingsContainer.appendChild(toggleButton);
  
  // Создаем контейнер для панели Tweakpane
  const paneContainer = document.createElement('div');
  paneContainer.style.display = 'none'; // Изначально скрыт
  paneContainer.style.maxHeight = '80vh'; // Максимальная высота 80% от высоты окна
  paneContainer.style.overflowY = 'auto'; // Добавляем прокрутку
  paneContainer.style.marginTop = '10px'; // Отступ от кнопки
  settingsContainer.appendChild(paneContainer);
  
  // Создаем панель настроек с помощью Tweakpane
  const pane = new Pane({
    container: paneContainer,
    title: 'Настройки сцены',
  });
  
  // Добавляем только нужные категории настроек
  setupLightSettings(pane, scene, renderer);
  setupSkySettings(pane, scene);
  setupFogSettings(pane, scene);
  
  try {
    setupObjectSettings(pane, scene);
    setupParticleSettings(pane, scene);
    setupXRStreamSettings(pane, scene, renderer);
  } catch (e) {
    console.warn('Некоторые модули настроек не удалось загрузить:', e);
  }
  
  // Обработчик клика по кнопке
  toggleButton.onclick = function() {
    if (paneContainer.style.display === 'none') {
      paneContainer.style.display = 'block';
    } else {
      paneContainer.style.display = 'none';
    }
  };
  
  return pane;
}
