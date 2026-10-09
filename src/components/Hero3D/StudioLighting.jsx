import { Environment, Lightformer } from '@react-three/drei';
import { STUDIO_LIGHTING_TUNING } from './Hero3DTuning.js';

export default function StudioLighting({ tuning = STUDIO_LIGHTING_TUNING }) {
  return (
    <>
      {/* Ambient plum shadow fill */}
      <ambientLight
        intensity={tuning.ambientIntensity}
        color={tuning.ambientColor}
      />

      {/* Key directional light */}
      <directionalLight
        position={[4, 7, 6]}
        intensity={tuning.keyLightIntensity}
        color={tuning.keyLightColor}
      />

      {/* Cyan rim light from bottom-left */}
      <directionalLight
        position={[-6, -4, -3]}
        intensity={tuning.rimLightIntensity}
        color={tuning.rimLightColor}
      />

      {/* Magenta point light accent */}
      <pointLight
        position={[2.5, 2.5, 4.5]}
        intensity={tuning.magentaPointIntensity}
        color={tuning.magentaPointColor}
        distance={20}
      />

      {/* Procedural HDR Studio Environment with balanced Lightformers */}
      <Environment resolution={512} background={false}>
        {/* Deep plum ambient environment floor */}
        <color attach="background" args={['#0e0316']} />

        {/* --- Overhead Studio Reflection Strips --- */}

        {/* 1. Magenta / Hot Pink strip */}
        <Lightformer
          form="rect"
          intensity={tuning.magentaIntensity}
          color={tuning.magentaColor}
          scale={[24, 2.8, 1]}
          position={[2.5, 4.5, 3.8]}
          rotation={[0.35, -0.4, 0.5]}
        />

        {/* 2. Soft Pink secondary strip */}
        <Lightformer
          form="rect"
          intensity={tuning.pinkSoftIntensity}
          color={tuning.pinkSoftColor}
          scale={[20, 2.0, 1]}
          position={[1.2, 3.5, 3.4]}
          rotation={[0.35, -0.4, 0.5]}
        />

        {/* 3. Pure White key softbox between them */}
        <Lightformer
          form="rect"
          intensity={tuning.keyWhiteIntensity}
          color={tuning.keyWhiteColor}
          scale={[26, 2.2, 1]}
          position={[0.2, 5.2, 4.0]}
          rotation={[0.35, -0.4, 0.5]}
        />

        {/* 4. Electric Icy Cyan strip */}
        <Lightformer
          form="rect"
          intensity={tuning.cyanIntensity}
          color={tuning.cyanColor}
          scale={[24, 2.4, 1]}
          position={[-1.5, 5.2, 4.0]}
          rotation={[0.35, -0.4, 0.5]}
        />

        {/* 5. Warm Peach / Amber Gold accent strip */}
        <Lightformer
          form="rect"
          intensity={tuning.warmPeachIntensity}
          color={tuning.warmPeachColor}
          scale={[18, 1.8, 1]}
          position={[3.8, 3.2, 3.0]}
          rotation={[0.35, -0.4, 0.5]}
        />

        {/* --- Rim Lightformers --- */}

        {/* Hot pink rim on lower right */}
        <Lightformer
          form="rect"
          intensity={tuning.magentaIntensity * 0.6}
          color="#ff2692"
          scale={[18, 2.4, 1]}
          position={[4.0, -3.2, 2.5]}
          rotation={[-0.2, 0.45, -0.3]}
        />

        {/* Icy cyan rim on upper left */}
        <Lightformer
          form="rect"
          intensity={tuning.cyanRimIntensity}
          color={tuning.cyanRimColor}
          scale={[20, 2.4, 1]}
          position={[-4.5, 2.5, 1.5]}
          rotation={[-0.25, 0.6, -0.45]}
        />

        {/* --- High contrast dark absorption panels --- */}
        <Lightformer
          form="rect"
          intensity={0}
          color="#000000"
          scale={[30, 8, 1]}
          position={[0, -7.5, 2.0]}
        />
        <Lightformer
          form="rect"
          intensity={0}
          color="#000000"
          scale={[25, 7, 1]}
          position={[-7.5, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      </Environment>
    </>
  );
}
