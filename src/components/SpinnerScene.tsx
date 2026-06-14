import { Environment, Float, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import { Vector3 } from 'three';
import type { AnchorPosition } from '../hooks/useTwoFingerSpin';

interface SpinnerSceneProps {
  angleRef: React.MutableRefObject<number>;
  angularVelocityRef: React.MutableRefObject<number>;
  decay: number;
  anchorPosition: AnchorPosition;
  activeTouchCount: number;
  spinnerSize: number;
}

function SpinnerModel({
  angleRef,
  angularVelocityRef,
  decay,
  anchorPosition,
  activeTouchCount,
  spinnerSize
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
    groupRef.current.rotation.x = -0.34;
    groupRef.current.rotation.y = 0.18;
    groupRef.current.scale.setScalar(spinnerSize);
  });

  const lobes = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  return (
    <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.08}>
      <group ref={groupRef}>
        {lobes.map((rotation) => (
          <group key={rotation} rotation-z={rotation}>
            <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.28, 1.0, 18, 36]} />
              <meshStandardMaterial color="#e5edf8" metalness={0.82} roughness={0.22} />
            </mesh>
            <mesh position={[0, 1.62, 0.055]} castShadow receiveShadow>
              <torusGeometry args={[0.31, 0.095, 24, 72]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.72} roughness={0.18} />
            </mesh>
            <mesh position={[0, 1.62, 0.055]} castShadow receiveShadow>
              <cylinderGeometry args={[0.18, 0.18, 0.13, 64]} />
              <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.28} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 0, -0.035]} castShadow receiveShadow>
          <cylinderGeometry args={[0.64, 0.64, 0.16, 96]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.92} roughness={0.16} />
        </mesh>
        <mesh position={[0, 0, 0.07]} castShadow receiveShadow>
          <torusGeometry args={[0.43, 0.085, 28, 96]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.12} />
        </mesh>
        <mesh position={[0, 0, 0.105]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.14, 80]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

export function SpinnerScene({
  angleRef,
  angularVelocityRef,
  decay,
  anchorPosition,
  activeTouchCount,
  spinnerSize
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
      />
      <mesh position={[0, 0, -0.42]} receiveShadow>
        <circleGeometry args={[2.8, 96]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.05} transparent opacity={0.24} />
      </mesh>
      <Environment preset="city" />
    </Canvas>
  );
}
