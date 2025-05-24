// colorUtils.glsl
//
// Вспомогательные функции для работы с цветом:
// гамма-коррекция, tone mapping, HSV, экспозиция.
//

// Гамма-коррекция
vec3 toGamma(vec3 color, float gamma) {
  return pow(color, vec3(1.0 / gamma));
}

vec3 toneMapReinhard(vec3 color) {
  return color / (color + vec3(1.0));
}
