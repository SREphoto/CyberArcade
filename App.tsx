
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { TetrisEngine } from './components/World/TetrisEngine';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { useStore } from './store';
import { ViewMode, GRID_HEIGHT, GRID_WIDTH, GameMode } from './types';

const CameraController = () => {
  const { camera } = useThree();
  const viewMode = useStore(state => state.viewMode);
  
  useFrame((state, delta) => {
    let targetPos = new THREE.Vector3(0, 10, 20);
    let lookTarget = new THREE.Vector3(0, 10, 0);

    switch (viewMode) {
      case ViewMode.CLASSIC:
        targetPos.set(0, GRID_HEIGHT / 2, 22);
        lookTarget.set(0, GRID_HEIGHT / 2, 0);
        break;
      case ViewMode.WELL:
        targetPos.set(0, 15, 30);
        lookTarget.set(0, 5, -50);
        break;
      case ViewMode.ISOMETRIC:
        targetPos.set(15, 25, 20);
        lookTarget.set(0, 8, 0);
        break;
    }

    camera.position.lerp(targetPos, delta * 4);
    camera.lookAt(lookTarget);
  });
  
  return null;
};

function App() {
  const { tick, level, status, mode } = useStore();

  useEffect(() => {
    if (status !== 'PLAYING') return;
    const interval = setInterval(() => {
      tick();
    }, mode === GameMode.DIGDUG ? 200 : Math.max(100, 800 - (level - 1) * 100));
    return () => clearInterval(interval);
  }, [status, level, tick, mode]);

  return (
    <div className="relative w-full h-screen bg-[#050011] overflow-hidden select-none">
      <HUD />
      <Canvas
        shadows
        dpr={[1, 1.5]} 
        gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 10, 20], fov: 50 }}
      >
        <CameraController />
        <Suspense fallback={null}>
            <Environment />
            <TetrisEngine />
            <Effects />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
