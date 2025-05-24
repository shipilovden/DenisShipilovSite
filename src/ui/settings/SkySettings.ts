import * as THREE from 'three';
import { Pane } from 'tweakpane';

export function setupSkySettings(pane: Pane, scene: THREE.Scene) {
  // Простая панель настроек без сложной логики
  const folder = pane.addFolder({ title: '🌤 Небо' });
  
  const params = {
    skyColor: { r: 128, g: 200, b: 255 }
  };
  
  folder.addInput(params, 'skyColor', { 
    view: 'color',
    label: 'Цвет неба'
  });
}









