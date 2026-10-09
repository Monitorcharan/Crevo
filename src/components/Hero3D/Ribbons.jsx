import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { RIBBON_CONFIGS } from './RibbonCurveData.js';
import { buildRibbonGeometry } from './RibbonGeometry.js';
import { createRibbonNormalTexture } from './RibbonTexture.js';
import { RIBBON_MATERIAL_TUNING } from './Hero3DTuning.js';

export default function Ribbons({ materialTuning = RIBBON_MATERIAL_TUNING }) {
  // Generate procedural normal map texture once
  const normalMap = useMemo(() => createRibbonNormalTexture(), []);

  // Generate ribbon buffer geometries
  const ribbons = useMemo(() => {
    return RIBBON_CONFIGS.map((cfg) => {
      const curve = new THREE.CatmullRomCurve3(cfg.points, false, 'centripetal', 0.5);
      const geometry = buildRibbonGeometry({
        curve,
        steps: cfg.steps,
        profile: cfg.profile,
        twist: cfg.twist,
        scale: cfg.scale,
        closedCaps: true,
      });

      return {
        id: cfg.id,
        geometry,
        type: cfg.type,
      };
    });
  }, []);

  // Dispose geometries and texture when unmounting
  useEffect(() => {
    return () => {
      ribbons.forEach((r) => r.geometry.dispose());
      normalMap.dispose();
    };
  }, [ribbons, normalMap]);

  return (
    <group>
      {ribbons.map(({ id, geometry }) => (
        <mesh key={id} geometry={geometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={materialTuning.color}
            metalness={materialTuning.metalness}
            roughness={materialTuning.roughness}
            clearcoat={materialTuning.clearcoat}
            clearcoatRoughness={materialTuning.clearcoatRoughness}
            reflectivity={materialTuning.reflectivity}
            envMapIntensity={materialTuning.envMapIntensity}
            normalMap={normalMap}
            normalScale={[materialTuning.normalScale, materialTuning.normalScale]}
          />
        </mesh>
      ))}
    </group>
  );
}
