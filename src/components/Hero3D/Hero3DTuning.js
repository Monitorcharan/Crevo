/**
 * Crevo 3D Hero Tuning Values
 * Balanced, photorealistic studio lighting and volumetric chrome material parameters.
 */

export const STUDIO_LIGHTING_TUNING = {
  // Balanced studio reflection strips (prevents overexposure/clipping)
  magentaIntensity: 5.5,
  magentaColor: '#ff1c8a',

  pinkSoftIntensity: 3.8,
  pinkSoftColor: '#e01874',

  cyanIntensity: 4.8,
  cyanColor: '#00e5ff',

  cyanRimIntensity: 4.2,
  cyanRimColor: '#00cce6',

  keyWhiteIntensity: 6.0,
  keyWhiteColor: '#ffffff',

  warmPeachIntensity: 3.6,
  warmPeachColor: '#ffcaa4',

  // Direct scene illumination
  ambientIntensity: 0.45,
  ambientColor: '#2b0b3d',

  keyLightIntensity: 2.2,
  keyLightColor: '#fff5f8',

  rimLightIntensity: 2.4,
  rimLightColor: '#00e5ff',

  magentaPointIntensity: 3.0,
  magentaPointColor: '#ff2290',
};

export const RIBBON_MATERIAL_TUNING = {
  color: '#faf8fc',
  metalness: 0.98,
  roughness: 0.16,
  clearcoat: 1.0,
  clearcoatRoughness: 0.06,
  reflectivity: 1.0,
  envMapIntensity: 2.4,
  normalScale: 0.035, // Smooth glassy liquid chrome with subtle micro-flow lines
};

export const MOTION_TUNING = {
  // Slow continuous rotation around Y axis
  continuousRotationSpeed: 0.04, // rad/sec gentle continuous rotation

  // Slow sinusoidal floating (preserves composition)
  floatSpeed: 0.35,
  floatAmplitudeY: 0.07,
  floatAmplitudeX: 0.04,
  floatRotationZ: 0.02,
  floatRotationY: 0.025,

  // Smoothly damped pointer parallax
  mouseParallaxFactorX: 0.22,
  mouseParallaxFactorY: 0.16,
  mouseRotationFactorX: 0.06,
  mouseRotationFactorY: 0.08,
  dampSpeed: 3.5,
};

export const PLUM_BACKGROUND_TUNING = {
  innerColor: '#36104e', // Deep glowing plum center
  outerColor: '#0a0210', // Deep plum-black perimeter
  glowIntensity: 1.5,
};
