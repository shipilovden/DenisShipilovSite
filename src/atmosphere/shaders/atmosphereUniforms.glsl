// atmosphereUniforms.glsl
//
// Единый список uniforms, используемых в атмосфере
// Подключается в sky.frag.glsl и других шейдерах.
//

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
