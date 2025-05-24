// fog.glsl
//
// Добавляет атмосферный туман в зависимости от расстояния и высоты.
// Можно использовать в sky.frag.glsl для смешивания цвета с туманом.
//
// Вход:
// - color: базовый цвет пикселя
// - viewDir: направление взгляда
// - cameraPos: позиция камеры
// - fogDensity: плотность тумана (0.0–0.05 типично)
// - fogColor: цвет тумана
//

vec3 applyFog(vec3 color, vec3 viewDir, vec3 cameraPos, float fogDensity, vec3 fogColor) {
  float distance = length(viewDir * 1000.0);
  float heightFactor = clamp((cameraPos.y + viewDir.y * 1000.0) / 50.0, 0.0, 1.0);
  float fogAmount = 1.0 - exp(-distance * fogDensity);
  fogAmount *= heightFactor;
  return mix(color, fogColor, fogAmount);
}
