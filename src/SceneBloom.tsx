import { Bloom, EffectComposer } from "@react-three/postprocessing";

// A low-intensity bloom softens the hub lights on devices using the 3D view.
export default function SceneBloom() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.82} intensity={0.35} mipmapBlur />
    </EffectComposer>
  );
}
