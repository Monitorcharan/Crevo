import * as THREE from 'three';

export function createParallelTransportFrames(curve, steps) {
  const tangents = [];
  const normals = [];
  const binormals = [];
  const points = [];

  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    points.push(curve.getPointAt(u));
    tangents.push(curve.getTangentAt(u).normalize());
  }

  // Initial normal
  const t0 = tangents[0];
  let n0 = new THREE.Vector3();
  const up = Math.abs(t0.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  n0.crossVectors(t0, up).normalize();
  const b0 = new THREE.Vector3().crossVectors(t0, n0).normalize();

  normals.push(n0);
  binormals.push(b0);

  // Parallel transport step by step
  for (let i = 1; i <= steps; i++) {
    const tPrev = tangents[i - 1];
    const tCurr = tangents[i];
    const nPrev = normals[i - 1];

    const axis = new THREE.Vector3().crossVectors(tPrev, tCurr);
    const axisLen = axis.length();

    let nCurr = nPrev.clone();
    if (axisLen > 1e-6) {
      axis.normalize();
      const dot = THREE.MathUtils.clamp(tPrev.dot(tCurr), -1, 1);
      const angle = Math.acos(dot);
      nCurr.applyAxisAngle(axis, angle);
    }

    // Gram-Schmidt orthogonalize
    nCurr.sub(tCurr.clone().multiplyScalar(nCurr.dot(tCurr))).normalize();
    const bCurr = new THREE.Vector3().crossVectors(tCurr, nCurr).normalize();

    normals.push(nCurr);
    binormals.push(bCurr);
  }

  return { points, tangents, normals, binormals };
}

export function buildRibbonGeometry({
  curve,
  steps = 200,
  profile, // array of [x, y] points relative to center
  twist = () => 0, // twist function (t: 0..1) => radians
  scale = () => 1, // scale function (t: 0..1) => factor
  closedCaps = true,
}) {
  const { points, normals, binormals } = createParallelTransportFrames(curve, steps);
  const M = profile.length;

  const positions = [];
  const uvs = [];
  const indices = [];

  // Generate ring vertices
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const P = points[i];
    const N = normals[i];
    const B = binormals[i];
    const tw = twist(u);
    const sc = scale(u);

    // Rotated basis vectors by twist angle tw
    const cosT = Math.cos(tw);
    const sinT = Math.sin(tw);
    const Nrot = new THREE.Vector3()
      .copy(N).multiplyScalar(cosT)
      .addScaledVector(B, sinT);
    const Brot = new THREE.Vector3()
      .copy(N).multiplyScalar(-sinT)
      .addScaledVector(B, cosT);

    for (let k = 0; k < M; k++) {
      const [px, py] = profile[k];
      const vx = P.x + (Nrot.x * px + Brot.x * py) * sc;
      const vy = P.y + (Nrot.y * px + Brot.y * py) * sc;
      const vz = P.z + (Nrot.z * px + Brot.z * py) * sc;

      positions.push(vx, vy, vz);
      uvs.push(k / (M - 1), u);
    }
  }

  // Generate quad indices along the tube
  for (let i = 0; i < steps; i++) {
    for (let k = 0; k < M; k++) {
      const nextK = (k + 1) % M;
      const i0 = i * M + k;
      const i1 = i * M + nextK;
      const i2 = (i + 1) * M + k;
      const i3 = (i + 1) * M + nextK;

      // Two triangles per quad
      indices.push(i0, i2, i1);
      indices.push(i1, i2, i3);
    }
  }

  // Add end caps if requested
  if (closedCaps) {
    // Start cap
    const startCenter = points[0];
    const startCenterIdx = positions.length / 3;
    positions.push(startCenter.x, startCenter.y, startCenter.z);
    uvs.push(0.5, 0);

    for (let k = 0; k < M; k++) {
      const nextK = (k + 1) % M;
      indices.push(startCenterIdx, nextK, k);
    }

    // End cap
    const endCenter = points[steps];
    const endCenterIdx = positions.length / 3;
    positions.push(endCenter.x, endCenter.y, endCenter.z);
    uvs.push(0.5, 1);

    const baseIdx = steps * M;
    for (let k = 0; k < M; k++) {
      const nextK = (k + 1) % M;
      indices.push(endCenterIdx, baseIdx + k, baseIdx + nextK);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
