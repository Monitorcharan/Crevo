import * as THREE from 'three';

/**
 * Generates a procedural tangent-space normal map containing subtle,
 * high-frequency longitudinal micro-grooves.
 * These striations run along the length of the ribbons (V direction),
 * turning standard point highlights into elongated, liquid chrome streaks.
 */
export function createRibbonNormalTexture() {
  const width = 128;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width;

      // Longitudinal micro-groove slope across ribbon width (X)
      // Combining two subtle harmonic frequencies
      const slope1 = Math.cos(u * Math.PI * 24) * 24 * 0.08;
      const slope2 = Math.cos(u * Math.PI * 48) * 48 * 0.04;
      const nx = THREE.MathUtils.clamp((slope1 + slope2) * 0.04, -0.4, 0.4);
      const ny = 0.0; // Smooth along length Y
      const nz = Math.sqrt(Math.max(0, 1.0 - nx * nx - ny * ny));

      const idx = (y * width + x) * 4;
      data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 12);
  texture.needsUpdate = true;
  return texture;
}
