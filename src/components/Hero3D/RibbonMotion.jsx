import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MOTION_TUNING } from './Hero3DTuning.js';

export default function RibbonMotion({
  children,
  reducedMotion = false,
  tuning = MOTION_TUNING,
  basePosition = [0, 0, 0],
}) {
  const groupRef = useRef();
  const windowPointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const handlePointerMove = (e) => {
      // Normalize to [-1, 1] relative to viewport
      windowPointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      windowPointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      windowPointerRef.current.active = true;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const [baseX, baseY, baseZ = 0] = basePosition;

    if (reducedMotion) {
      // Completely static presentation respecting accessibility
      groupRef.current.position.set(baseX, baseY, baseZ);
      groupRef.current.rotation.set(0, 0, 0);
      return;
    }

    const t = state.clock.getElapsedTime();

    // Slow continuous rotation around Y axis
    const spinY = t * (tuning.continuousRotationSpeed || 0.04);

    // Slow floating sway
    const floatY = Math.sin(t * tuning.floatSpeed) * tuning.floatAmplitudeY;
    const floatX = Math.cos(t * tuning.floatSpeed * 0.7) * tuning.floatAmplitudeX;
    const floatRotZ = Math.sin(t * tuning.floatSpeed * 0.5) * tuning.floatRotationZ;
    const floatRotY = Math.cos(t * tuning.floatSpeed * 0.6) * tuning.floatRotationY;

    // Use window pointer if active for full-viewport parallax, fallback to R3F pointer
    const px = windowPointerRef.current.active ? windowPointerRef.current.x : state.pointer.x;
    const py = windowPointerRef.current.active ? windowPointerRef.current.y : state.pointer.y;

    const targetX = baseX + floatX + px * tuning.mouseParallaxFactorX;
    const targetY = baseY + floatY + py * tuning.mouseParallaxFactorY;
    const targetRotX = -py * tuning.mouseRotationFactorX;
    const targetRotY = spinY + floatRotY + px * tuning.mouseRotationFactorY;
    const targetRotZ = floatRotZ;

    // Smooth frame-rate independent damping
    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      targetX,
      tuning.dampSpeed,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY,
      tuning.dampSpeed,
      delta
    );
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      baseZ,
      tuning.dampSpeed,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotX,
      tuning.dampSpeed,
      delta
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotY,
      tuning.dampSpeed,
      delta
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetRotZ,
      tuning.dampSpeed,
      delta
    );
  });

  return <group ref={groupRef}>{children}</group>;
}
