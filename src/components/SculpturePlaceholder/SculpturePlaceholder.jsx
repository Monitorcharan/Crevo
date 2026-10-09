import './SculpturePlaceholder.css';

/**
 * Visual slot for the hero sculpture.
 *
 * Today it renders a static CSS composition. It is intentionally structured so a
 * React Three Fiber scene can be dropped in later without touching layout:
 *
 *   import { Canvas } from '@react-three/fiber';
 *   import { OrbitControls, Environment } from '@react-three/drei';
 *
 *   <SculpturePlaceholder>
 *     <Canvas camera={{ position: [0, 0, 5], fov: 35 }} dpr={[1, 2]}>
 *       <Sculpture />
 *       <Environment preset="studio" />
 *     </Canvas>
 *   </SculpturePlaceholder>
 *
 * When `children` are provided, they fill `.sculpture__stage` (position: absolute;
 * inset: 0), which is the sizing contract a <Canvas> expects.
 */
export default function SculpturePlaceholder({ children, label = 'Abstract sculpture artwork' }) {
  const hasScene = Boolean(children);

  return (
    <figure className="sculpture" aria-label={label} role="img">
      <div className="sculpture__stage" data-scene-ready={hasScene ? 'true' : 'false'}>
        {hasScene ? (
          children
        ) : (
          <div className="sculpture__fallback" aria-hidden="true">
            <span className="sculpture__ring sculpture__ring--outer" />
            <span className="sculpture__ring sculpture__ring--inner" />
            <span className="sculpture__form" />
            <span className="sculpture__plinth" />
          </div>
        )}
      </div>

      <span className="sculpture__corner sculpture__corner--tl" aria-hidden="true" />
      <span className="sculpture__corner sculpture__corner--br" aria-hidden="true" />
      <figcaption className="sculpture__caption" aria-hidden="true">
        <span>Fig. 01</span>
        <span>Study in form</span>
      </figcaption>
    </figure>
  );
}
