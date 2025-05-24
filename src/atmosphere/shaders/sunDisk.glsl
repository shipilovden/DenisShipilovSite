// sunDisk.glsl
//
// Добавляет яркий диск солнца в небе.
// Вычисляет силу свечения в зависимости от угла взгляда и положения солнца.
//

float getSunDisk(vec3 viewDirection, vec3 sunDirection, float diskSize, float intensity) {
  float sunAmount = dot(viewDirection, normalize(sunDirection));
  sunAmount = clamp(sunAmount, 0.0, 1.0);
  float sunDisk = smoothstep(1.0 - diskSize, 1.0, sunAmount);
  return sunDisk * intensity;
}
