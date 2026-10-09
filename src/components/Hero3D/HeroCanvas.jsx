import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import Ribbons from './Ribbons.jsx';
import StudioLighting from './StudioLighting.jsx';
import PlumBackground from './PlumBackground.jsx';
import RibbonMotion from './RibbonMotion.jsx';
import './HeroCanvas.css';

/**
 * Checks for WebGL 1/2 support in the browser.
 */
function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') ||
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Responsive camera framing that preserves the close-up diagonal composition
 * across desktop, tablet, and mobile aspect ratios.
 */
function ResponsiveCamera() {
  const cameraRef = useRef(null);
  const { size } = useThree();
  const aspect = size.width / Math.max(1, size.height);

  const camProps = useMemo(() => {
    if (aspect < 0.8) {
      // Mobile vertical framing: pulls back slightly and widens angle
      return { fov: 46, position: [0.0, 0.0, 7.0] };
    }
    if (aspect <= 1.2) {
      // Tablet / square framing
      return { fov: 40, position: [0.0, 0.0, 6.0] };
    }
    // Desktop wide framing
    return { fov: 37, position: [0.0, 0.0, 5.7] };
  }, [aspect]);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0.0, 0.0, 0.0);
    }
  }, [camProps]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={camProps.fov}
      position={camProps.position}
      near={0.1}
      far={35}
    />
  );
}

/**
 * RibbonScene positions the ribbons dynamically across viewports:
 * - Desktop: offset to the center-right so the ribbons sweep majestically on the right
 *   while leaving clean breathing room on the left for the headline copy.
 * - Mobile: lower and offset so ribbons frame dynamically behind buttons & stats.
 */
function RibbonScene({ reducedMotion }) {
  const { size } = useThree();
  const aspect = size.width / Math.max(1, size.height);

  const basePosition = useMemo(() => {
    if (aspect > 1.2) {
      // Desktop: ribbons sweep prominently across the center-right
      return [1.15, -0.05, 0];
    }
    if (aspect > 0.8) {
      // Tablet
      return [0.6, -0.1, 0];
    }
    // Mobile: lower ribbons slightly to keep copy background clean and dark
    return [0.25, -0.55, 0];
  }, [aspect]);

  return (
    <RibbonMotion reducedMotion={reducedMotion} basePosition={basePosition}>
      <Ribbons />
    </RibbonMotion>
  );
}

/**
 * Hook to monitor prefers-reduced-motion media query.
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/**
 * React Error Boundary for graceful fallback if WebGL fails at runtime.
 */
class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('Hero3D WebGL error captured:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

/**
 * Main Hero 3D Canvas component:
 * - Fills full background
 * - Capped pixel ratio (dpr 1 to 2)
 * - Responsive framing and ribbon placement
 * - Slow floating and cursor parallax
 * - Strictly non-blocking pointer events
 * - Respects prefers-reduced-motion
 * - WebGL fallback
 */
export default function HeroCanvas({ fallback = null }) {
  const webGLSupported = useMemo(() => isWebGLAvailable(), []);
  const reducedMotion = usePrefersReducedMotion();

  // Pixel ratio capped at 2 to balance crispness and performance
  const dpr = typeof window !== 'undefined'
    ? Math.min(window.devicePixelRatio || 1, 2)
    : 1;

  if (!webGLSupported) {
    return fallback;
  }

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <div className="hero-3d-wrapper">
        <Canvas
          className="hero-3d-canvas"
          style={{ pointerEvents: 'none' }}
          dpr={[1, dpr]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
        >
          <color attach="background" args={['#0a0312']} />
          <ResponsiveCamera />

          <Suspense fallback={null}>
            <PlumBackground />
            <StudioLighting />
            <RibbonScene reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>

        {/* Ambient subtle vignette overlay */}
        <div className="hero-3d-overlay" aria-hidden="true" />
      </div>
    </WebGLErrorBoundary>
  );
}
