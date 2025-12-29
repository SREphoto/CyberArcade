
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarField: React.FC = () => {
  const count = 2000;
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

const MovingGrid: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame((state, delta) => {
        if (meshRef.current) {
             (meshRef.current.material as THREE.MeshBasicMaterial).map?.offset.set(0, state.clock.elapsedTime * 0.1);
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[500, 500, 50, 50]} />
            <meshBasicMaterial 
                color="#220044" 
                wireframe 
                transparent 
                opacity={0.2} 
            />
        </mesh>
    );
};

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#050011']} />
      <fog attach="fog" args={['#050011', 20, 100]} />
      
      <ambientLight intensity={0.4} color="#400080" />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#00ffff" />
      
      <StarField />
      <MovingGrid />
    </>
  );
};
