import * as THREE from 'three';
import { Pane } from 'tweakpane';

export function setupSunSettings(pane: Pane, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  const folder = pane.addFolder({ title: '☀️ Солнце' });

  const sunParams = {
    включено: true,
    цвет: '#ffffff',
    интенсивность: 1.0,
    азимут: 45,
    высота: 45,
    анимация: false,
    скорость: 0.2,
    время: 12,
    авто_время: false,
    тени: true,
    размер_тени: 2048,
    мягкость_тени: 1.0,
    показать_направление: true,
    размер_солнца: 2,
    эффект_короны: true,
    пресет: 'Текущий',
  };

  // Солнце (DirectionalLight)
  const sun = new THREE.DirectionalLight(sunParams.цвет, sunParams.интенсивность);
  sun.castShadow = sunParams.тени;
  sun.shadow.mapSize.set(sunParams.размер_тени, sunParams.размер_тени);
  sun.shadow.radius = sunParams.мягкость_тени;
  scene.add(sun);

  // Сфера солнца
  const sunSphere = new THREE.Mesh(
    new THREE.SphereGeometry(sunParams.размер_солнца, 32, 32),
    new THREE.MeshBasicMaterial({ color: sunParams.цвет })
  );
  scene.add(sunSphere);

  // Glow (корона солнца)
  const glowMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load('/textures/glow.png'), // твоя текстура glow
    color: sunParams.цвет,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const sunGlow = new THREE.Sprite(glowMaterial);
  sunGlow.scale.set(30, 30, 1);
  scene.add(sunGlow);

  // Линия-направление
  const dirHelper = new THREE.DirectionalLightHelper(sun, 5, 0xffff00);
  scene.add(dirHelper);

  // Обновление позиции и эффектов
  const clock = new THREE.Clock();
  function updateSun() {
    const elapsed = clock.getElapsedTime() * sunParams.скорость;
    const time = sunParams.авто_время ? (elapsed % 24) : sunParams.время;

    const azimuth = sunParams.анимация ? (elapsed * 15) % 360 : sunParams.азимут;
    const altitude = sunParams.авто_время
      ? Math.max(0, Math.sin((time / 24) * Math.PI) * 90)
      : sunParams.высота;

    const azimuthRad = THREE.MathUtils.degToRad(azimuth);
    const altitudeRad = THREE.MathUtils.degToRad(altitude);

    const radius = 100;
    const x = radius * Math.cos(altitudeRad) * Math.sin(azimuthRad);
    const y = radius * Math.sin(altitudeRad);
    const z = radius * Math.cos(altitudeRad) * Math.cos(azimuthRad);

    sun.position.set(x, y, z);
    sun.lookAt(0, 0, 0);
    sun.intensity = sunParams.интенсивность;
    sun.color.set(sunParams.цвет);
    sun.castShadow = sunParams.тени;

    sunSphere.position.copy(sun.position);
    sunSphere.visible = sunParams.включено;
    sunSphere.scale.setScalar(sunParams.размер_солнца);
    (sunSphere.material as THREE.MeshBasicMaterial).color.set(sunParams.цвет);

    sunGlow.position.copy(sun.position);
    sunGlow.visible = sunParams.включено && sunParams.эффект_короны;
    sunGlow.scale.setScalar(sunParams.размер_солнца * 10);
    sunGlow.material.color.set(sunParams.цвет);

    dirHelper.visible = sunParams.показать_направление;

    requestAnimationFrame(updateSun);
  }
  updateSun();

  // Панель управления
  folder.addInput(sunParams, 'включено', { label: 'Включить солнце' }).on('change', () => {
    sun.visible = sunParams.включено;
    sunSphere.visible = sunParams.включено;
  });

  folder.addInput(sunParams, 'цвет', { label: 'Цвет' });
  folder.addInput(sunParams, 'интенсивность', { min: 0, max: 10, step: 0.1, label: 'Интенсивность' });
  folder.addInput(sunParams, 'размер_солнца', { min: 0.1, max: 10, step: 0.1, label: 'Размер' });
  folder.addInput(sunParams, 'эффект_короны', { label: 'Корона' });

  folder.addInput(sunParams, 'азимут', { min: 0, max: 360, step: 1, label: 'Горизонт (азимут)' });
  folder.addInput(sunParams, 'высота', { min: 0, max: 90, step: 1, label: 'Высота (угол)' });
  folder.addInput(sunParams, 'анимация', { label: 'Анимация солнца' });
  folder.addInput(sunParams, 'скорость', { min: 0.01, max: 5, step: 0.01, label: 'Скорость' });

  folder.addInput(sunParams, 'время', { min: 0, max: 24, step: 0.1, label: 'Время суток' });
  folder.addInput(sunParams, 'авто_время', { label: 'Автоматическое время' });

  folder.addInput(sunParams, 'тени', { label: 'Включить тени' });
  folder.addInput(sunParams, 'размер_тени', { min: 256, max: 4096, step: 256, label: 'Размер тени' });
  folder.addInput(sunParams, 'мягкость_тени', { min: 0, max: 10, step: 0.1, label: 'Мягкость тени' });

  folder.addInput(sunParams, 'показать_направление', { label: 'Показать линию света' });

  folder.addInput(sunParams, 'пресет', {
    label: 'Пресет',
    options: {
      'Текущий': 'Текущий',
      'Закат': 'Закат',
      'Полдень': 'Полдень',
      'Рассвет': 'Рассвет',
    },
  }).on('change', () => {
    switch (sunParams.пресет) {
      case 'Закат':
        sunParams.цвет = '#ff8844';
        sunParams.высота = 5;
        sunParams.азимут = 270;
        sunParams.интенсивность = 0.8;
        sunParams.эффект_короны = true;
        break;
      case 'Полдень':
        sunParams.цвет = '#ffffff';
        sunParams.высота = 80;
        sunParams.азимут = 180;
        sunParams.интенсивность = 1.2;
        sunParams.эффект_короны = false;
        break;
      case 'Рассвет':
        sunParams.цвет = '#ffcc88';
        sunParams.высота = 10;
        sunParams.азимут = 90;
        sunParams.интенсивность = 0.6;
        sunParams.эффект_короны = true;
        break;
    }
  });
}
