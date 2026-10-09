import { useMemo } from 'react';
import * as THREE from 'three';
import { PLUM_BACKGROUND_TUNING } from './Hero3DTuning.js';

export default function PlumBackground({ tuning = PLUM_BACKGROUND_TUNING }) {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uInner: { value: new THREE.Color(tuning.innerColor) },
        uOuter: { value: new THREE.Color(tuning.outerColor) },
        uIntensity: { value: tuning.glowIntensity },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uInner;
        uniform vec3 uOuter;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          // Centered around the ribbon loops in center-right
          vec2 center = vec2(0.64, 0.52);
          float dist = distance(vUv, center) * 1.35;
          dist = clamp(dist, 0.0, 1.0);
          float radial = pow(1.0 - dist, 1.8);
          vec3 color = mix(uOuter, uInner * uIntensity, radial);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      depthWrite: false,
    });
  }, [tuning.innerColor, tuning.outerColor, tuning.glowIntensity]);

  return (
    <mesh position={[0, 0, -8]} scale={[50, 32, 1]} material={shaderMaterial}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
