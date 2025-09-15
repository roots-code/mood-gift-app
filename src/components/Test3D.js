import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function RotatingCube() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00D4FF" />
    </mesh>
  );
}

export default function Test3D() {
  return (
    <div style={{ width: '400px', height: '400px' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <RotatingCube />
      </Canvas>
    </div>
  );
}
