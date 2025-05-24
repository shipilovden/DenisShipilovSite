// sky.frag.glsl
//
// Основной фрагментный шейдер для атмосферы.
// Включает: градиент неба, солнце, облака, туман, tone mapping.
//

precision highp float;

varying vec3 vWorldPosition;

// Uniforms
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

// Constants
const float PI = 3.14159265359;

// Noise functions
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

// Классический Perlin noise (3D)
float noise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - 0.5;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));

  vec4 j = p - 49.0 * floor(p * (1.0 / 49.0));  // mod(p,7*7)

  vec4 x_ = floor(j * (1.0 / 7.0));
  vec4 y_ = floor(j - 7.0 * x_);  // mod(j,N)

  vec4 x = x_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;
  vec4 y = y_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;

  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 g0 = vec3(a0.xy, h.x);
  vec3 g1 = vec3(a0.zw, h.y);
  vec3 g2 = vec3(a1.xy, h.z);
  vec3 g3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
  g0 *= norm.x;
  g1 *= norm.y;
  g2 *= norm.z;
  g3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
}

// Color utilities
vec3 toGamma(vec3 color, float gamma) {
  return pow(color, vec3(1.0 / gamma));
}

vec3 toneMapReinhard(vec3 color) {
  return color / (color + vec3(1.0));
}

// Scattering functions
float rayleighPhase(float cosTheta) {
  return (3.0 / (16.0 * PI)) * (1.0 + pow(cosTheta, 2.0));
}

float miePhase(float cosTheta, float g) {
  return (3.0 / (8.0 * PI)) * ((1.0 - g * g) * (1.0 + cosTheta * cosTheta)) /
         pow(1.0 + g * g - 2.0 * g * cosTheta, 1.5);
}

// Sun disk
float getSunDisk(vec3 viewDirection, vec3 sunDirection, float diskSize, float intensity) {
  float sunAmount = dot(viewDirection, normalize(sunDirection));
  sunAmount = clamp(sunAmount, 0.0, 1.0);
  float sunDisk = smoothstep(1.0 - diskSize, 1.0, sunAmount);
  return sunDisk * intensity;
}

// Clouds
float getClouds(vec3 dir, float time) {
  vec3 cloudPos = dir * 1.0 + vec3(time * 0.01, 0.0, time * 0.005);
  float cloudDensity = noise(cloudPos * 2.0);
  return smoothstep(0.4, 0.7, cloudDensity);
}

// Fog
vec3 applyFog(vec3 color, vec3 viewDir, vec3 cameraPos, float fogDensity, vec3 fogColor) {
  float distance = length(viewDir * 1000.0);
  float heightFactor = clamp((cameraPos.y + viewDir.y * 1000.0) / 50.0, 0.0, 1.0);
  float fogAmount = 1.0 - exp(-distance * fogDensity);
  fogAmount *= heightFactor;
  return mix(color, fogColor, fogAmount);
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
