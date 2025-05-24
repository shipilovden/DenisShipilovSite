import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { setupSunSettings } from './settings/SunSettings';
import { setupSkySettings } from './settings/SkySettings';
import { setupFogSettings } from './settings/FogSettings';
import { setupLightSettings } from './settings/LightSettings';
import { setupObjectSettings } from './settings/ObjectSettings';
import { setupParticleSettings } from './settings/ParticleSettings';
import { setupXRStreamSettings } from './settings/XRStreamSettings';

export function createSettingsPanel(scene: THREE.Scene, sun: THREE.DirectionalLight, renderer: THREE.WebGLRenderer) {
  console.log('Settings panel created');
  
  // Создаем контейнер для панели настроек
  const settingsContainer = document.createElement('div');
  settingsContainer.style.position = 'absolute';
  settingsContainer.style.right = '10px';
  settingsContainer.style.top = '10px';
  settingsContainer.style.zIndex = '1000';
  settingsContainer.style.display = 'flex';
  settingsContainer.style.flexDirection = 'column';
  settingsContainer.style.alignItems = 'flex-end';
  document.body.appendChild(settingsContainer);
  
  // Создаем кнопку-шестеренку
  const settingsButton = document.createElement('button');
  settingsButton.innerHTML = '⚙️';
  settingsButton.style.width = '40px';
  settingsButton.style.height = '40px';
  settingsButton.style.borderRadius = '50%';
  settingsButton.style.backgroundColor = '#333';
  settingsButton.style.color = 'white';
  settingsButton.style.border = 'none';
  settingsButton.style.fontSize = '20px';
  settingsButton.style.cursor = 'pointer';
  settingsButton.style.marginBottom = '10px';
  settingsButton.title = 'Настройки';
  settingsContainer.appendChild(settingsButton);
  
  // Создаем контейнер для панели Tweakpane
  const paneContainer = document.createElement('div');
  paneContainer.style.display = 'none'; // Изначально скрыт
  settingsContainer.appendChild(paneContainer);
  
  // Создаем панель настроек с помощью Tweakpane
  const pane = new Pane({
    container: paneContainer,
    title: 'Настройки сцены',
  });
  
  // Добавляем все категории настроек
  setupSunSettings(pane, scene, renderer);
  setupSkySettings(pane, scene);
  setupFogSettings(pane, scene);
  
  try {
    setupLightSettings(pane, scene);
    setupObjectSettings(pane, scene);
    setupParticleSettings(pane, scene);
    setupXRStreamSettings(pane, scene, renderer);
  } catch (e) {
    console.warn('Некоторые модули настроек не удалось загрузить:', e);
  }
  
  // Обработчик клика по кнопке-шестеренке
  let isVisible = false;
  settingsButton.addEventListener('click', () => {
    isVisible = !isVisible;
    paneContainer.style.display = isVisible ? 'block' : 'none';
    
    // Анимация кнопки при клике
    settingsButton.style.transform = isVisible ? 'rotate(90deg)' : 'rotate(0deg)';
    settingsButton.style.transition = 'transform 0.3s ease';
  });
  
  // Возвращаем объект с методами для управления панелью
  return {
    show: () => {
      isVisible = true;
      paneContainer.style.display = 'block';
      settingsButton.style.transform = 'rotate(90deg)';
    },
    hide: () => {
      isVisible = false;
      paneContainer.style.display = 'none';
      settingsButton.style.transform = 'rotate(0deg)';
    },
    toggle: () => {
      isVisible = !isVisible;
      paneContainer.style.display = isVisible ? 'block' : 'none';
      settingsButton.style.transform = isVisible ? 'rotate(90deg)' : 'rotate(0deg)';
    },
    pane // Экспортируем саму панель для возможности добавления настроек извне
  };
}
