/**
 * 2D cross-section profiles for ribbon extrusion with physical thickness.
 * Returns an array of [x, y] coordinates forming a smooth, closed,
 * counter-clockwise polygon in local cross-section space.
 */

/**
 * Broad flattened band with rounded pill/capsule edges and physical thickness.
 * Smoothly rounded borders prevent razor-sharp artifacts and produce
 * continuous, volumetric specular highlights across the 3D form.
 */
export function createBroadRibbonProfile({
  width = 0.95,
  thickness = 0.22,
  samplesPerEdge = 12,
  samplesPerCap = 10,
} = {}) {
  const profile = [];
  const radius = thickness / 2;
  const wFlat = Math.max(0.01, width / 2 - radius);

  // 1. Top face (from -wFlat to +wFlat)
  for (let i = 0; i < samplesPerEdge; i++) {
    const t = i / (samplesPerEdge - 1);
    const x = -wFlat + t * (2 * wFlat);
    const y = radius;
    profile.push([x, y]);
  }

  // 2. Right semicircle cap
  for (let i = 1; i < samplesPerCap; i++) {
    const angle = Math.PI / 2 - (i / samplesPerCap) * Math.PI;
    const x = wFlat + Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    profile.push([x, y]);
  }

  // 3. Bottom face (from +wFlat down to -wFlat)
  for (let i = 0; i < samplesPerEdge; i++) {
    const t = i / (samplesPerEdge - 1);
    const x = wFlat - t * (2 * wFlat);
    const y = -radius;
    profile.push([x, y]);
  }

  // 4. Left semicircle cap
  for (let i = 1; i < samplesPerCap; i++) {
    const angle = -Math.PI / 2 - (i / samplesPerCap) * Math.PI;
    const x = -wFlat + Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    profile.push([x, y]);
  }

  return profile;
}

/**
 * Thinner curved strand profile (smooth circular/capsule tube).
 */
export function createStrandProfile({
  radius = 0.08,
  samples = 20,
} = {}) {
  const profile = [];
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    profile.push([x, y]);
  }
  return profile;
}
