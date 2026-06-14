import { Environment, Float, PerspectiveCamera, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import type { MutableRefObject } from 'react';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { DoubleSide, Shape, Vector3 } from 'three';
import flutterLogoUrl from '../assets/flutter-logo.svg?url';
import type { AnchorPosition } from '../hooks/useTwoFingerSpin';
import type { SpinnerVariant } from '../spinnerVariants';

interface SpinnerSceneProps {
  angleRef: MutableRefObject<number>;
  angularVelocityRef: MutableRefObject<number>;
  decay: number;
  anchorPosition: AnchorPosition;
  activeTouchCount: number;
  spinnerSize: number;
  spinnerVariant: SpinnerVariant;
}

function SpinnerModel({
  angleRef,
  angularVelocityRef,
  decay,
  anchorPosition,
  activeTouchCount,
  spinnerSize,
  spinnerVariant
}: SpinnerSceneProps) {
  const groupRef = useRef<Group>(null);
  const targetPositionRef = useRef(new Vector3(0, 0, 0));
  const { viewport } = useThree();

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    angleRef.current += angularVelocityRef.current * delta;
    angularVelocityRef.current *= Math.exp(-decay * delta);

    if (Math.abs(angularVelocityRef.current) < 0.015) {
      angularVelocityRef.current = 0;
    }

    targetPositionRef.current.set(
      anchorPosition.x * viewport.width * 0.5,
      anchorPosition.y * viewport.height * 0.5,
      0
    );

    if (activeTouchCount > 0) {
      groupRef.current.position.copy(targetPositionRef.current);
    } else {
      groupRef.current.position.lerp(targetPositionRef.current, 1 - Math.exp(-8 * delta));
    }

    groupRef.current.rotation.z = angleRef.current;
    groupRef.current.rotation.x = spinnerVariant === 'classic' || spinnerVariant === 'flutter' ? 0 : -0.34;
    groupRef.current.rotation.y = spinnerVariant === 'classic' || spinnerVariant === 'flutter' ? 0 : 0.18;
    groupRef.current.scale.setScalar(spinnerSize);
  });

  return (
    <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.08}>
      <group ref={groupRef}>
        <SpinnerBody variant={spinnerVariant} />
      </group>
    </Float>
  );
}

function SpinnerBody({ variant }: { variant: SpinnerVariant }) {
  switch (variant) {
    case 'orbit':
      return <OrbitSpinner />;
    case 'flutter':
      return <FlutterSpinner />;
    case 'neon':
      return <NeonSpinner />;
    case 'classic':
    default:
      return <ClassicSpinner />;
  }
}

// Solar system: angular speed ∝ 1 / orbitalPeriod (real Keplerian ordering — inner
// planets revolve fast, outer ones drift slowly). `period` is in Earth-years, `orbit`
// is the visual orbital radius, `size` the rendered planet radius.
const ORBIT_TIME_SCALE = 0.5;
const ORBIT_FIT_SCALE = 0.52;
const ORBIT_PLANETS = [
  { name: 'mercury', color: '#9ca3af', emissive: '#3f3f46', period: 0.241, orbit: 0.34, size: 0.038, phase: 0.4, ring: false },
  { name: 'venus', color: '#e6c178', emissive: '#7c5a1e', period: 0.615, orbit: 0.46, size: 0.056, phase: 2.1, ring: false },
  { name: 'earth', color: '#3b82f6', emissive: '#0b3b8c', period: 1.0, orbit: 0.59, size: 0.058, phase: 4.0, ring: false },
  { name: 'mars', color: '#d1542f', emissive: '#7a2410', period: 1.881, orbit: 0.72, size: 0.046, phase: 5.5, ring: false },
  { name: 'jupiter', color: '#d8a878', emissive: '#6b4a28', period: 11.86, orbit: 0.94, size: 0.11, phase: 1.0, ring: false },
  { name: 'saturn', color: '#e3c98c', emissive: '#7a6024', period: 29.46, orbit: 1.16, size: 0.092, phase: 3.2, ring: true },
  { name: 'uranus', color: '#8fe0e6', emissive: '#1d5e66', period: 84.0, orbit: 1.33, size: 0.07, phase: 0.2, ring: false },
  { name: 'neptune', color: '#4060d8', emissive: '#101f6b', period: 164.8, orbit: 1.47, size: 0.068, phase: 5.0, ring: false },
  { name: 'pluto', color: '#b9a896', emissive: '#4a3f33', period: 248.0, orbit: 1.6, size: 0.034, phase: 2.6, ring: false }
] as const;

const NEON_LOBES = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
const NEON_FIT_SCALE = 0.5;

const CLASSIC_LOBE_DISTANCE = 1.04;
const CLASSIC_LOBE_RADIUS = 0.48;
const CLASSIC_HUB_RADIUS = 0.38;
const CLASSIC_WAIST_INSET = 0.26;
const CLASSIC_LOBE_ANGLES = [
  Math.PI / 2,
  Math.PI / 2 + (Math.PI * 2) / 3,
  Math.PI / 2 + (Math.PI * 4) / 3
];

// Tri-lobe fidget-spinner outline: an outer half-circle cap per lobe, joined by
// concave waists (quadratic curves that dip toward the hub) to get the classic
// 3-pointed silhouette with negative space between the arms.
function buildClassicBodyShape() {
  const shape = new Shape();
  const distance = CLASSIC_LOBE_DISTANCE;
  const radius = CLASSIC_LOBE_RADIUS;

  CLASSIC_LOBE_ANGLES.forEach((angle, index) => {
    const cx = Math.cos(angle) * distance;
    const cy = Math.sin(angle) * distance;
    const startAngle = angle - Math.PI / 2;
    const endAngle = angle + Math.PI / 2;

    if (index === 0) {
      shape.moveTo(cx + Math.cos(startAngle) * radius, cy + Math.sin(startAngle) * radius);
    }

    shape.absarc(cx, cy, radius, startAngle, endAngle, false);

    const nextAngle = CLASSIC_LOBE_ANGLES[(index + 1) % CLASSIC_LOBE_ANGLES.length] ?? angle;
    const nextStart = nextAngle - Math.PI / 2;
    const gapAngle = angle + Math.PI / 3;
    shape.quadraticCurveTo(
      Math.cos(gapAngle) * CLASSIC_WAIST_INSET,
      Math.sin(gapAngle) * CLASSIC_WAIST_INSET,
      Math.cos(nextAngle) * distance + Math.cos(nextStart) * radius,
      Math.sin(nextAngle) * distance + Math.sin(nextStart) * radius
    );
  });

  shape.closePath();
  return shape;
}

function ClassicLobeBearing() {
  return (
    <group>
      <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.31, 0.31, 0.13, 64]} />
        <meshStandardMaterial color="#0b1220" metalness={0.62} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <torusGeometry args={[0.3, 0.04, 24, 96]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={1.6}
          metalness={0.3}
          roughness={0.28}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.19]}>
        <torusGeometry args={[0.2, 0.013, 16, 80]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0, 0.19]}>
        <torusGeometry args={[0.12, 0.013, 16, 64]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.08, 32]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.2} />
      </mesh>
    </group>
  );
}

function ClassicCenterHub() {
  return (
    <group>
      <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[CLASSIC_HUB_RADIUS, CLASSIC_HUB_RADIUS, 0.17, 72]} />
        <meshStandardMaterial color="#4aa6d6" metalness={0.96} roughness={0.18} envMapIntensity={1.3} />
      </mesh>
      <mesh position={[0, 0, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.27, 0.31, 0.07, 72]} />
        <meshStandardMaterial color="#5bb6e6" metalness={0.9} roughness={0.15} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[0, 0, 0.22]}>
        <torusGeometry args={[CLASSIC_HUB_RADIUS - 0.02, 0.02, 20, 96]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.2} />
      </mesh>
    </group>
  );
}

function ClassicSpinner() {
  const bodyShape = useMemo(() => buildClassicBodyShape(), []);

  return (
    <group scale={0.58}>
      <mesh position={[0, 0, -0.08]} castShadow receiveShadow>
        <extrudeGeometry
          args={[
            bodyShape,
            {
              depth: 0.16,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 5,
              steps: 1,
              curveSegments: 72
            }
          ]}
        />
        <meshStandardMaterial color="#3f9fd1" metalness={0.95} roughness={0.24} envMapIntensity={1.2} />
      </mesh>
      {CLASSIC_LOBE_ANGLES.map((angle) => (
        <group
          key={angle}
          position={[
            Math.cos(angle) * CLASSIC_LOBE_DISTANCE,
            Math.sin(angle) * CLASSIC_LOBE_DISTANCE,
            0
          ]}
        >
          <ClassicLobeBearing />
        </group>
      ))}
      <ClassicCenterHub />
    </group>
  );
}

function Sun() {
  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={2.6} color="#fff0c8" distance={9} decay={1.1} />
      <mesh>
        <sphereGeometry args={[0.2, 48, 32]} />
        <meshStandardMaterial color="#ffd24a" emissive="#ffae1a" emissiveIntensity={1.7} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.27, 32, 24]} />
        <meshBasicMaterial color="#ffcf6b" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

function OrbitPlanet({ planet }: { planet: (typeof ORBIT_PLANETS)[number] }) {
  return (
    <group position={[planet.orbit, 0, 0]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[planet.size, 32, 24]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.emissive}
          emissiveIntensity={0.4}
          roughness={0.72}
          metalness={0.1}
        />
      </mesh>
      {planet.ring && (
        <mesh rotation={[Math.PI / 2 - 0.5, 0, 0.32]}>
          <ringGeometry args={[planet.size * 1.4, planet.size * 2.4, 64]} />
          <meshStandardMaterial
            color="#e3d3a0"
            emissive="#5a4a20"
            emissiveIntensity={0.32}
            side={DoubleSide}
            transparent
            opacity={0.85}
            roughness={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

function OrbitSpinner() {
  const pivotRefs = useRef<(Group | null)[]>([]);

  useFrame((_, delta) => {
    ORBIT_PLANETS.forEach((planet, index) => {
      const pivot = pivotRefs.current[index];
      if (pivot) {
        pivot.rotation.z += (ORBIT_TIME_SCALE / planet.period) * delta;
      }
    });
  });

  return (
    <group scale={ORBIT_FIT_SCALE}>
      <Sun />
      {ORBIT_PLANETS.map((planet, index) => (
        <group key={planet.name}>
          <mesh>
            <torusGeometry args={[planet.orbit, 0.0035, 8, 192]} />
            <meshBasicMaterial color="#56689a" transparent opacity={0.4} depthWrite={false} />
          </mesh>
          <group
            ref={(element) => {
              pivotRefs.current[index] = element;
            }}
            rotation-z={planet.phase}
          >
            <OrbitPlanet planet={planet} />
          </group>
        </group>
      ))}
    </group>
  );
}

function FlutterSpinner() {
  const flutterLogoTexture = useTexture(flutterLogoUrl);

  return (
    <mesh position={[0, 0, 0.04]}>
      <planeGeometry args={[1.62, 1.96]} />
      <meshBasicMaterial map={flutterLogoTexture} transparent toneMapped={false} />
    </mesh>
  );
}

function NeonTube({ color, intensity = 2.7 }: { color: string; intensity?: number }) {
  return (
    <meshStandardMaterial
      color="#05070b"
      emissive={color}
      emissiveIntensity={intensity}
      toneMapped={false}
      roughness={0.4}
      metalness={0.1}
    />
  );
}

function NeonSpinner() {
  return (
    <group scale={NEON_FIT_SCALE}>
      {NEON_LOBES.map((rotation) => (
        <group key={rotation} rotation-z={rotation}>
          <mesh position={[0, 0.64, 0]}>
            <capsuleGeometry args={[0.052, 1.0, 16, 32]} />
            <NeonTube color="#22d3ee" />
          </mesh>
          <mesh position={[0, 1.24, 0]}>
            <torusGeometry args={[0.24, 0.05, 24, 96]} />
            <NeonTube color="#34e6ff" intensity={3} />
          </mesh>
          <mesh position={[0, 1.24, 0]}>
            <sphereGeometry args={[0.075, 24, 18]} />
            <NeonTube color="#a5f3ff" intensity={3.2} />
          </mesh>
        </group>
      ))}
      <mesh>
        <torusGeometry args={[0.36, 0.06, 28, 128]} />
        <NeonTube color="#f472b6" intensity={3} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.2, 0.04, 24, 96]} />
        <NeonTube color="#c084fc" intensity={2.8} />
      </mesh>
    </group>
  );
}

export function SpinnerScene({
  angleRef,
  angularVelocityRef,
  decay,
  anchorPosition,
  activeTouchCount,
  spinnerSize,
  spinnerVariant
}: SpinnerSceneProps) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 5.2]} fov={38} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} castShadow />
      <pointLight position={[-3, -2, 4]} intensity={0.9} color="#38bdf8" />
      <SpinnerModel
        angleRef={angleRef}
        angularVelocityRef={angularVelocityRef}
        decay={decay}
        anchorPosition={anchorPosition}
        activeTouchCount={activeTouchCount}
        spinnerSize={spinnerSize}
        spinnerVariant={spinnerVariant}
      />
      <mesh position={[0, 0, -0.42]} receiveShadow>
        <circleGeometry args={[2.8, 96]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.05} transparent opacity={0.24} />
      </mesh>
      <Environment preset="city" />
      {spinnerVariant === 'neon' && (
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.65} mipmapBlur radius={0.8} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
