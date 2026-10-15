import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { lazy, Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

const SceneBloom = lazy(() => import("./SceneBloom"));

const cameraStops = [
  { position: new THREE.Vector3(0, 5.2, 12.5), target: new THREE.Vector3(0, 0.1, 0) },
  { position: new THREE.Vector3(-2.3, 6.4, 12), target: new THREE.Vector3(-0.5, 0.1, 0) },
  { position: new THREE.Vector3(2.8, 5.2, 11), target: new THREE.Vector3(0.5, 0.25, 0) },
  { position: new THREE.Vector3(0.4, 7, 13.5), target: new THREE.Vector3(0, 0, 0) },
  { position: new THREE.Vector3(-1.5, 8, 15), target: new THREE.Vector3(0, 0, 0) },
];

function LowPolyTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.34, 0]} castShadow={false}>
        <cylinderGeometry args={[0.075, 0.12, 0.72, 5]} />
        <meshStandardMaterial color="#73462d" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.86, 0]} castShadow={false}>
        <icosahedronGeometry args={[0.44, 0]} />
        <meshStandardMaterial color="#398c4c" flatShading roughness={1} />
      </mesh>
      <mesh position={[0.18, 0.72, 0.1]}>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#59a657" flatShading roughness={1} />
      </mesh>
    </group>
  );
}

function FarmPlot({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[1.15, 1.8]} />
        <meshStandardMaterial color="#b48d4d" roughness={1} />
      </mesh>
      {[0, 1, 2, 3].map((row) => (
        <mesh key={row} position={[-0.38 + row * 0.25, 0.09, 0]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[0.035, 0.13, 1.55]} />
          <meshStandardMaterial color="#e7bf6d" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function StorageHub() {
  return (
    <group position={[1.15, 0.68, -0.75]}>
      <mesh castShadow={false}>
        <boxGeometry args={[1.65, 1.15, 1.1]} />
        <meshStandardMaterial color="#e5dfc6" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.18, 0.565]}>
        <boxGeometry args={[0.95, 0.48, 0.035]} />
        <meshStandardMaterial color="#33463a" emissive="#8dff8a" emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[0, 0.84, 0]}>
        <boxGeometry args={[1.75, 0.12, 1.2]} />
        <meshStandardMaterial color="#ffb44e" emissive="#ff8d52" emissiveIntensity={0.38} />
      </mesh>
      <Html position={[0, 0.2, 0.6]} center distanceFactor={7} transform>
        <span className="world-sign">SOKOLINK</span>
      </Html>
    </group>
  );
}

function DeliveryTruck({ curve, animate }: { curve: THREE.CatmullRomCurve3; animate: boolean }) {
  const truck = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!truck.current || !animate) return;
    const point = curve.getPointAt((clock.elapsedTime * 0.035) % 1);
    const direction = curve.getTangentAt((clock.elapsedTime * 0.035) % 1);
    truck.current.position.copy(point);
    truck.current.rotation.y = Math.atan2(direction.x, direction.z);
  });

  return (
    <group ref={truck}>
      <mesh position={[0, 0.19, 0]}>
        <boxGeometry args={[0.6, 0.28, 0.38]} />
        <meshStandardMaterial color="#e6a452" roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.33, -0.1]}>
        <boxGeometry args={[0.28, 0.25, 0.36]} />
        <meshStandardMaterial color="#d7e4cc" roughness={0.55} />
      </mesh>
      {[-1, 1].map((x) => [-1, 1].map((z) => (
        <mesh key={`${x}-${z}`} position={[x * 0.2, 0.075, z * 0.125]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 0.045, 7]} />
          <meshStandardMaterial color="#20211e" roughness={1} />
        </mesh>
      )))}
    </group>
  );
}

function RoadParticles({ curve, animate }: { curve: THREE.CatmullRomCurve3; animate: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current || !animate) return;
    for (let i = 0; i < 36; i += 1) {
      const progress = (i / 36 + clock.elapsedTime * 0.06) % 1;
      const point = curve.getPointAt(progress);
      dummy.position.copy(point);
      dummy.position.y += 0.13 + Math.sin(clock.elapsedTime + i) * 0.035;
      const size = 0.025 + (i % 3) * 0.008;
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 36]}>
      <sphereGeometry args={[1, 5, 4]} />
      <meshBasicMaterial color="#ffc76d" />
    </instancedMesh>
  );
}

function ShambaIsland({ animate }: { animate: boolean }) {
  const island = useRef<THREE.Group>(null);
  const mouse = useRef(new THREE.Vector2());
  const road = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.4, 0.12, 0.7),
      new THREE.Vector3(-2, 0.13, 1.5),
      new THREE.Vector3(-0.8, 0.13, 0.6),
      new THREE.Vector3(0.5, 0.13, 1.2),
      new THREE.Vector3(2.1, 0.13, 0.45),
      new THREE.Vector3(2.6, 0.13, -0.5),
      new THREE.Vector3(1.3, 0.13, -1.2),
    ], true, "catmullrom", 0.4),
    [],
  );

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      mouse.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2,
      );
    };
    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!island.current || !animate) return;
    island.current.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.055 + mouse.current.x * 0.08;
    island.current.rotation.x = mouse.current.y * 0.025 + pointer.y * 0.01;
    island.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.07;
  });

  return (
    <group ref={island} position={[0, -0.85, 0]}>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[4.3, 3.25, 0.95, 9, 1]} />
        <meshStandardMaterial color="#54402d" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[4.25, 3.65, 0.2, 9, 1]} />
        <meshStandardMaterial color="#5e984b" flatShading roughness={1} />
      </mesh>

      <group position={[0, 0.08, 0]}>
        <mesh position={[0, 0.01, 0]}>
          <tubeGeometry args={[road, 100, 0.1, 6, true]} />
          <meshStandardMaterial color="#8d7250" roughness={1} />
        </mesh>
        <FarmPlot position={[-2.3, 0.1, -0.65]} rotation={-0.5} />
        <FarmPlot position={[-0.65, 0.1, -1.2]} rotation={0.35} />
        <FarmPlot position={[-2.6, 0.1, 0.65]} rotation={0.55} />
        <StorageHub />
        <LowPolyTree position={[-3.15, 0.1, -1.15]} scale={1.05} />
        <LowPolyTree position={[-1.5, 0.1, 1.25]} scale={0.82} />
        <LowPolyTree position={[2.8, 0.1, 0.9]} scale={0.9} />
        <LowPolyTree position={[2.65, 0.1, -1.45]} scale={1.1} />
        <LowPolyTree position={[0.1, 0.1, -2.65]} scale={0.95} />
        <DeliveryTruck curve={road} animate={animate} />
        <RoadParticles curve={road} animate={animate} />
      </group>
    </group>
  );
}

function Clouds({ animate }: { animate: boolean }) {
  const clouds = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!clouds.current || !animate) return;
    clouds.current.position.x = Math.sin(clock.elapsedTime * 0.025) * 0.2;
    clouds.current.rotation.y = Math.sin(clock.elapsedTime * 0.02) * 0.025;
  });

  return (
    <group ref={clouds}>
      {[[-5, 3.5, -4], [4, 4.5, -5], [5.5, 2.4, -3.5], [-4, 4.3, -2]].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]}>
          <dodecahedronGeometry args={[0.7 + (index % 2) * 0.3, 0]} />
          <meshStandardMaterial color="#c4d5c3" transparent opacity={0.14} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Fireflies() {
  const particles = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(45 * 3);
    for (let i = 0; i < 45; i += 1) {
      values[i * 3] = (Math.random() - 0.5) * 11;
      values[i * 3 + 1] = Math.random() * 5;
      values[i * 3 + 2] = (Math.random() - 0.5) * 9;
    }
    return values;
  }, []);

  useFrame(({ clock }) => {
    if (particles.current) particles.current.rotation.y = clock.elapsedTime * 0.008;
  });

  return (
    <points ref={particles} position={[0, 0, -2]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffc76d" size={0.055} transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

function SceneContents({ progress, reducedMotion, invalidateScene }: {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
  invalidateScene: MutableRefObject<() => void>;
}) {
  const sunrise = useMemo(() => new THREE.Color("#b17b62"), []);
  const dusk = useMemo(() => new THREE.Color("#714d75"), []);
  const night = useMemo(() => new THREE.Color("#101b34"), []);
  const background = useRef<THREE.Color>(null);
  const targetSky = useRef(new THREE.Color());
  const ambient = useRef<THREE.AmbientLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const cameraTarget = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());
  const desiredLookAt = useRef(new THREE.Vector3());
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidateScene.current = invalidate;
    return () => { invalidateScene.current = () => undefined; };
  }, [invalidate, invalidateScene]);

  useFrame(({ camera, scene }, delta) => {
    const position = THREE.MathUtils.clamp(progress.current, 0, 1) * (cameraStops.length - 1);
    const index = Math.min(Math.floor(position), cameraStops.length - 2);
    const amount = position - index;
    const start = cameraStops[index];
    const end = cameraStops[index + 1];
    cameraPosition.current.lerpVectors(start.position, end.position, amount);
    desiredLookAt.current.lerpVectors(start.target, end.target, amount);
    const cameraEase = reducedMotion ? 1 : 1 - Math.exp(-delta * 1.8);
    camera.position.lerp(cameraPosition.current, cameraEase);
    cameraTarget.current.lerp(desiredLookAt.current, reducedMotion ? 1 : 1 - Math.exp(-delta * 2));
    camera.lookAt(cameraTarget.current);

    if (!background.current) return;
    if (progress.current < 0.5) {
      targetSky.current.lerpColors(sunrise, dusk, progress.current * 2);
    } else {
      targetSky.current.lerpColors(dusk, night, (progress.current - 0.5) * 2);
    }
    background.current.lerp(targetSky.current, reducedMotion ? 1 : 1 - Math.exp(-delta * 1.2));
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(background.current);
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.lerp(1.8, 0.42, progress.current);
    if (sun.current) sun.current.intensity = THREE.MathUtils.lerp(2.2, 0.25, progress.current);
  });

  return (
    <>
      <color ref={background} attach="background" args={["#b17b62"]} />
      <fog attach="fog" args={["#101b18", 10, 24]} />
      <ambientLight ref={ambient} intensity={1.8} />
      <directionalLight ref={sun} position={[-4, 8, 5]} intensity={2.2} color="#ffc982" />
      <pointLight position={[1.2, 1.7, -0.6]} intensity={2.2} distance={6} color="#8dff8a" />
      <Clouds animate={!reducedMotion} />
      {!reducedMotion && <Fireflies />}
      <ShambaIsland animate={!reducedMotion} />
      {!reducedMotion && <Suspense fallback={null}><SceneBloom /></Suspense>}
    </>
  );
}

export default function WorldScene({ progress, reducedMotion, invalidateScene }: {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
  invalidateScene: MutableRefObject<() => void>;
}) {
  return (
    <div className="world-layer" aria-hidden="true">
      <Canvas camera={{ position: [0, 5.2, 12.5], fov: 37 }} dpr={[1, 1.2]} gl={{ antialias: false, powerPreference: "low-power", alpha: false }} frameloop={reducedMotion ? "demand" : "always"}>
        <Suspense fallback={null}>
          <SceneContents progress={progress} reducedMotion={reducedMotion} invalidateScene={invalidateScene} />
        </Suspense>
      </Canvas>
    </div>
  );
}
