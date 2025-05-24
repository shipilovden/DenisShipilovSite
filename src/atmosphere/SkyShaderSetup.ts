import * as THREE from 'three';
import { skyUniforms } from './SkyUniforms';

// @ts-ignore
import skyVert from './shaders/sky.vert.glsl';
// @ts-ignore
import skyFrag from './shaders/sky.frag.glsl';

let skyMesh: THREE.Mesh;

export function createSky(scene: THREE.Scene, camera: THREE.Camera) {
  // Проверяем, существует ли уже skyMesh в сцене
  if (skyMesh) {
    scene.remove(skyMesh);
  }

  const geometry = new THREE.SphereGeometry(1000, 64, 32);
  const material = new THREE.ShaderMaterial({
    vertexShader: skyVert,
    fragmentShader: skyFrag,
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
  });

  skyMesh = new THREE.Mesh(geometry, material);
  scene.add(skyMesh);

  // Обновляем позицию камеры и направление солнца
  updateSkyUniforms(camera);

  return skyMesh;
}

// Функция для обновления униформ неба
export function updateSkyUniforms(camera: THREE.Camera) {
  if (!skyMesh) return;

  const update = () => {
    skyUniforms.cameraPosition.value.copy(camera.position);
    const theta = (skyUniforms.timeOfDay.value / 24) * 2 * Math.PI;
    skyUniforms.sunDirection.value.set(Math.cos(theta), Math.sin(theta), 0).normalize();
    requestAnimationFrame(update);
  };

  update();
}
