import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

function PixelCubes({ count = 50 }) {
  const meshRef = useRef();
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1);
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2);
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#00D4FF"
        sizeAttenuation={false}
        transparent
        opacity={0.6}
      />
    </points>
  );
}

function MoodOrb({ currentMood }) {
  const meshRef = useRef();
  const moodColors = {
    happy: '#FFB700',
    sad: '#00D4FF', 
    excited: '#FF006E',
    calm: '#00F5A0',
    romantic: '#FF006E',
    confused: '#9D4EDD'
  };

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5);
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3);
    }
  });

  const color = currentMood ? moodColors[currentMood] : '#00D4FF';

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <icosahedronGeometry args={[0.8, 2]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

export default function ThreeDBackground({ currentMood, isVisible = true }) {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      opacity: 0.6
    }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#FF006E" />
        
        <Stars radius={100} depth={50} count={800} factor={3} fade speed={1} />
        <PixelCubes count={100} />
        <MoodOrb currentMood={currentMood} />
      </Canvas>
    </div>
  );
}
