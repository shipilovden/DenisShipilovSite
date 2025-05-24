import * as THREE from 'three';

export const skyUniforms = {
  sunDirection: { value: new THREE.Vector3(0.0, 1.0, 0.0) },
  cameraPosition: { value: new THREE.Vector3() },
  timeOfDay: { value: 12.0 },
  airDensity: { value: 0.01 },
  horizonFade: { value: 0.5 },
  fogDensity: { value: 0.002 },
  fogColor: { value: new THREE.Color(0.8, 0.9, 1.0) },
  cloudSpeed: { value: 0.25 },
  cloudDensity: { value: 0.5 },
  exposure: { value: 1.0 },
  horizonColor: { value: new THREE.Color(1.0, 0.9, 0.8) },
  starIntensity: { value: 0.5 },
  showStars: { value: true }
};
