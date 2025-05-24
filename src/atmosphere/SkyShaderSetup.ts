import * as THREE from 'three';
import { skyUniforms } from './SkyUniforms';

// Вместо импорта шейдеров как модулей, определим их как строки
const skyVertexShader = `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const skyFragmentShader = `
precision highp float;

varying vec3 vWorldPosition;

uniform vec3 sunDirection;
uniform vec3 cameraPosition;
uniform float timeOfDay;
uniform float airDensity;
uniform float horizonFade;
uniform float fogDensity;
uniform vec3 fogColor;
uniform float cloudSpeed;
uniform float cloudDensity;
uniform float exposure;
uniform vec3 horizonColor;
uniform float starIntensity;
uniform bool showStars;

const float PI = 3.14159265359;

// Простая функция шума для облаков
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  
  return mix(mix(mix(hash(p + vec3(0, 0, 0)), 
                     hash(p + vec3(1, 0, 0)), f.x),
                 mix(hash(p + vec3(0, 1, 0)), 
                     hash(p + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(p + vec3(0, 0, 1)), 
                     hash(p + vec3(1, 0, 1)), f.x),
                 mix(hash(p + vec3(0, 1, 1)), 
                     hash(p + vec3(1, 1, 1)), f.x), f.y), f.z);
}

// Тон-маппинг
vec3 toneMapReinhard(vec3 color) {
  return color / (color + vec3(1.0));
}

// Гамма-коррекция
vec3 toGamma(vec3 color, float gamma) {
  return pow(color, vec3(1.0 / gamma));
}

// Солнечный диск
float getSunDisk(vec3 viewDirection, vec3 sunDirection, float diskSize, float intensity) {
  float sunAmount = dot(viewDirection, normalize(sunDirection));
  sunAmount = clamp(sunAmount, 0.0, 1.0);
  float sunDisk = smoothstep(1.0 - diskSize, 1.0, sunAmount);
  return sunDisk * intensity;
}

// Облака
float getClouds(vec3 dir, float time) {
  vec3 cloudPos = dir * 1.0 + vec3(time * 0.01, 0.0, time * 0.005);
  float cloudDensity = noise(cloudPos * 2.0);
  return smoothstep(0.4, 0.7, cloudDensity);
}

// Туман
vec3 applyFog(vec3 color, vec3 viewDir, vec3 cameraPos, float fogDensity, vec3 fogColor) {
  float distance = length(viewDir * 1000.0);
  float heightFactor = clamp((cameraPos.y + viewDir.y * 1000.0) / 50.0, 0.0, 1.0);
  float fogAmount = 1.0 - exp(-distance * fogDensity);
  fogAmount *= heightFactor;
  return mix(color, fogColor, fogAmount);
}

// Звезды
float getStars(vec3 dir, float intensity) {
  vec3 starPos = dir * 100.0;
  float starNoise = noise(starPos * 50.0);
  return smoothstep(0.95, 1.0, starNoise) * intensity;
}

void main() {
  vec3 viewDirection = normalize(vWorldPosition - cameraPosition);

  vec3 skyColorTop = vec3(0.1, 0.4, 0.8);
  vec3 skyColorBottom = vec3(0.9, 0.8, 0.6);
  float t = clamp(viewDirection.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 skyColor = mix(skyColorBottom, skyColorTop, pow(t, 1.0 - horizonFade));

  float sun = getSunDisk(viewDirection, sunDirection, 0.004, 3.0);
  vec3 sunColor = vec3(1.0, 0.85, 0.6);
  skyColor += sunColor * sun;

  float cloud = getClouds(viewDirection, timeOfDay * cloudSpeed) * cloudDensity;
  skyColor = mix(skyColor, vec3(1.0), cloud * 0.3);

  skyColor = applyFog(skyColor, viewDirection, cameraPosition, fogDensity, fogColor);

  skyColor = toneMapReinhard(skyColor * exposure);
  skyColor = toGamma(skyColor, 2.2);

  gl_FragColor = vec4(skyColor, 1.0);
}
`;

let skyMesh: THREE.Mesh;

export function createSky(scene: THREE.Scene, camera: THREE.Camera) {
  // Удаляем существующий skyMesh, если он есть
  if (skyMesh) {
    scene.remove(skyMesh);
  }

  console.log("Creating sky with shaders...");
  
  // Создаем геометрию и материал
  const geometry = new THREE.SphereGeometry(1000, 64, 32);
  const material = new THREE.ShaderMaterial({
    vertexShader: skyVertexShader,
    fragmentShader: skyFragmentShader,
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
  });

  // Создаем меш и добавляем в сцену
  skyMesh = new THREE.Mesh(geometry, material);
  scene.add(skyMesh);
  
  console.log("Sky created successfully");

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

// Функция для обновления времени суток
export function updateTimeOfDay(time: number) {
  if (skyUniforms.timeOfDay) {
    skyUniforms.timeOfDay.value = time;
  }
}
