import { Environment, Float, PerspectiveCamera, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { MutableRefObject } from 'react';
import { useRef } from 'react';
import type { Group } from 'three';
import { Vector3 } from 'three';
import classicSpinnerUrl from '../assets/classic-spinner.svg?url';
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

const lobes = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
const orbitPlanets = [
  { rotation: 0, radius: 0.22, color: '#facc15', emissive: '#854d0e' },
  { rotation: (Math.PI * 2) / 3, radius: 0.18, color: '#22d3ee', emissive: '#155e75' },
  { rotation: (Math.PI * 4) / 3, radius: 0.18, color: '#fb7185', emissive: '#881337' }
] as const;
function Bearing({ accent = '#38bdf8' }: { accent?: string }) {
  return (
    <>
      <mesh position={[0, 0, -0.035]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.64, 0.64, 0.16, 96]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.92} roughness={0.16} />
      </mesh>
      <mesh position={[0, 0, 0.07]} castShadow receiveShadow>
        <torusGeometry args={[0.43, 0.085, 28, 96]} />
        <meshStandardMaterial color={accent} metalness={0.95} roughness={0.12} />
      </mesh>
      <mesh position={[0, 0, 0.105]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.14, 80]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>
    </>
  );
}

function ClassicSpinner() {
  const classicSpinnerTexture = useTexture(classicSpinnerUrl);

  return (
    <mesh position={[0, 0, 0.04]}>
      <planeGeometry args={[2.7, 2.7]} />
      <meshBasicMaterial map={classicSpinnerTexture} transparent toneMapped={false} />
    </mesh>
  );
}

function OrbitSpinner() {
  return (
    <>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.28, 0.018, 12, 160]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#075985" emissiveIntensity={0.45} metalness={0.4} roughness={0.24} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.72, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.68, 0.014, 12, 160]} />
        <meshStandardMaterial color="#c084fc" emissive="#581c87" emissiveIntensity={0.35} metalness={0.32} roughness={0.28} />
      </mesh>
      {orbitPlanets.map((planet) => (
        <group key={planet.rotation} rotation-z={planet.rotation}>
          <mesh position={[0, 1.46, 0.08]} castShadow receiveShadow>
            <sphereGeometry args={[planet.radius, 48, 32]} />
            <meshStandardMaterial
              color={planet.color}
              emissive={planet.emissive}
              emissiveIntensity={0.32}
              metalness={0.28}
              roughness={0.18}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0, 0.11]} castShadow receiveShadow>
        <sphereGeometry args={[0.34, 64, 32]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.28} metalness={0.2} roughness={0.2} />
      </mesh>
      <Bearing accent="#facc15" />
    </>
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

function NeonSpinner() {
  return (
    <>
      {lobes.map((rotation) => (
        <group key={rotation} rotation-z={rotation}>
          <mesh position={[0, 1.08, 0.02]} castShadow receiveShadow>
            <capsuleGeometry args={[0.18, 1.32, 18, 48]} />
            <meshStandardMaterial color="#111827" emissive="#22d3ee" emissiveIntensity={0.26} metalness={0.84} roughness={0.18} />
          </mesh>
          <mesh position={[0, 1.68, 0.07]} castShadow receiveShadow>
            <sphereGeometry args={[0.23, 48, 32]} />
            <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={0.8} metalness={0.5} roughness={0.12} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0, 0.03]} castShadow receiveShadow>
        <torusGeometry args={[1.08, 0.05, 20, 128]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.48} metalness={0.62} roughness={0.14} />
      </mesh>
      <Bearing accent="#a78bfa" />
    </>
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
    </Canvas>
  );
}
