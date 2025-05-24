// clouds.glsl
//
// Процедурные облака на основе шума.
// Используют 3D Perlin noise с анимацией по времени.
//
// Требует noise.glsl
//

float getClouds(vec3 dir, float time) {
  vec3 cloudPos = dir * 1.0 + vec3(time * 0.01, 0.0, time * 0.005);
  float cloudDensity = noise(cloudPos * 2.0);
  return smoothstep(0.4, 0.7, cloudDensity);
}
