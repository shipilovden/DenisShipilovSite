// scattering.glsl
//
// Расчёт фазовых функций рассеивания света в атмосфере.
// Используется для имитации Rayleigh и Mie scattering,
// которые определяют цвет и мягкость неба.
//

const float PI = 3.14159265359;

const vec3 betaR = vec3(5.8e-6, 13.5e-6, 33.1e-6); // Rayleigh scattering для R, G, B
const float betaM = 21e-6;                         // Mie scattering (одинаковое значение)

float rayleighPhase(float cosTheta) {
  return (3.0 / (16.0 * PI)) * (1.0 + pow(cosTheta, 2.0));
}

float miePhase(float cosTheta, float g) {
  return (3.0 / (8.0 * PI)) * ((1.0 - g * g) * (1.0 + cosTheta * cosTheta)) /
         pow(1.0 + g * g - 2.0 * g * cosTheta, 1.5);
}
