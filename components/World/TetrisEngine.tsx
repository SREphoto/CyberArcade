
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox, Cylinder, Sphere, Icosahedron, Torus, Box } from '@react-three/drei';
import { useStore } from '../../store';
import { GRID_HEIGHT, GRID_WIDTH, TETROMINOS, ViewMode, GameMode } from '../../types';

const ArcadeModel: React.FC<{ type: string, position: [number, number, number], facing?: [number, number] }> = ({ type, position, facing = [0, 1] }) => {
  const color = TETROMINOS[type]?.color || '#ffffff';
  
  const Model = () => {
    switch (type) {
      case 'S_HEAD':
        return (
          <group rotation={[0, Math.atan2(facing[0], facing[1]), 0]}>
            <RoundedBox args={[0.8, 0.8, 0.9]} radius={0.2}>
               <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
            </RoundedBox>
            <mesh position={[0.2, 0.2, 0.4]}>
               <sphereGeometry args={[0.1, 8, 8]} />
               <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.2, 0.2, 0.4]}>
               <sphereGeometry args={[0.1, 8, 8]} />
               <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      case 'S_BODY':
        return (
          <Sphere args={[0.4, 16, 16]}>
             <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
          </Sphere>
        );
      case 'S_FOOD':
        return (
          <group>
             <Icosahedron args={[0.4, 1]}>
                <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} />
             </Icosahedron>
             <Torus args={[0.6, 0.02, 12, 24]} rotation={[Math.PI/2, 0, 0]}>
                <meshBasicMaterial color="#ff00ff" transparent opacity={0.5} />
             </Torus>
          </group>
        );
      case 'C_SEGMENT':
        return (
          <group>
             <Sphere args={[0.45, 12, 12]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
             </Sphere>
             {/* Legs */}
             {[0, 1, 2, 3].map(i => (
                <mesh key={i} rotation={[0, 0, (i % 2 === 0 ? 1 : -1) * 0.5]} position={[(i % 2 === 0 ? 0.4 : -0.4), -0.2, 0]}>
                   <boxGeometry args={[0.3, 0.1, 0.1]} />
                   <meshBasicMaterial color={color} />
                </mesh>
             ))}
          </group>
        );
      case 'C_MUSHROOM':
        return (
          <group position={[0, -0.2, 0]}>
             <Cylinder args={[0.2, 0.3, 0.4, 8]}>
                <meshStandardMaterial color="#ffffff" />
             </Cylinder>
             <Sphere args={[0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} position={[0, 0.2, 0]}>
                <meshStandardMaterial color="#ffea00" />
             </Sphere>
          </group>
        );
      case 'C_BLASTER':
        return (
          <group>
             <Box args={[0.8, 0.3, 0.8]} position={[0, -0.2, 0]}>
                <meshStandardMaterial color="#ffffff" metalness={0.9} />
             </Box>
             <Cylinder args={[0.1, 0.1, 0.5]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.3]}>
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
             </Cylinder>
          </group>
        );
      case 'C_BULLET':
        return (
          <Cylinder args={[0.05, 0.05, 0.6]} rotation={[Math.PI/2, 0, 0]}>
             <meshBasicMaterial color="#00ffff" />
          </Cylinder>
        );
      case 'D_DIGDUG':
        return (
          <group rotation={[0, Math.atan2(facing[0], facing[1]), 0]}>
            <RoundedBox args={[0.6, 0.7, 0.5]} radius={0.1}>
              <meshStandardMaterial color="#ffffff" />
            </RoundedBox>
            <Sphere args={[0.35, 12, 12]} position={[0, 0.35, 0]}>
               <meshStandardMaterial color="#00aaff" />
            </Sphere>
            <Cylinder args={[0.05, 0.05, 0.4]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.3]}>
               <meshStandardMaterial color="#888888" />
            </Cylinder>
          </group>
        );
      case 'D_DIRT':
        return (
          <Box args={[0.98, 0.98, 0.98]}>
            <meshStandardMaterial color={color} roughness={1} metalness={0} />
          </Box>
        );
      case 'D_ROCK':
        return (
          <group>
             <Icosahedron args={[0.45, 1]}>
                <meshStandardMaterial color="#444444" flatShading />
             </Icosahedron>
          </group>
        );
      case 'D_POOKA':
        return (
          <group>
            <Sphere args={[0.4, 16, 16]}>
              <meshStandardMaterial color="#ff1744" />
            </Sphere>
            <Box args={[0.6, 0.2, 0.2]} position={[0, 0.1, 0.3]}>
               <meshStandardMaterial color="#ffea00" />
            </Box>
          </group>
        );
      case 'D_FYGAR':
        return (
          <group scale={[1, 0.6, 1.2]}>
             <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.2}>
                <meshStandardMaterial color="#00e676" />
             </RoundedBox>
             <Icosahedron args={[0.2, 0]} position={[0, 0.4, 0]}>
                <meshStandardMaterial color="#ffea00" />
             </Icosahedron>
          </group>
        );
      case 'B_BOTTOM':
        return (
          <group position={[0, -0.1, 0]}>
            <Cylinder args={[0.48, 0.42, 0.35, 20]} position={[0, 0, 0]}>
              <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
            </Cylinder>
            <Torus args={[0.46, 0.05, 12, 24]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.17, 0]}>
              <meshStandardMaterial color="#8b4513" roughness={0.9} />
            </Torus>
          </group>
        );
      case 'B_MEAT':
        return (
          <group>
            <Cylinder args={[0.46, 0.46, 0.25, 16]}>
              <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
            </Cylinder>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.47]}>
               <planeGeometry args={[0.6, 0.02]} />
               <meshBasicMaterial color="#ff4400" transparent opacity={0.6} />
            </mesh>
          </group>
        );
      case 'B_LETTUCE':
        return (
          <group scale={[1.2, 0.4, 1.2]}>
            <Icosahedron args={[0.4, 1]} rotation={[0.2, 0.5, 0]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} flatShading />
            </Icosahedron>
          </group>
        );
      case 'B_TOP':
        return (
          <group position={[0, -0.1, 0]}>
            <Sphere args={[0.48, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} scale={[1, 0.75, 1]}>
               <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
            </Sphere>
            {useMemo(() => [
              [0.1, 0.35, 0.2], [-0.15, 0.32, 0.1], [0.2, 0.28, -0.1], 
              [-0.2, 0.25, -0.2]
            ].map((pos, i) => (
              <mesh key={i} position={pos as [number, number, number]}>
                <sphereGeometry args={[0.02, 6, 6]} />
                <meshStandardMaterial color="#f5deb3" />
              </mesh>
            )), [])}
          </group>
        );
      default:
        return (
          <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.1}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
          </RoundedBox>
        );
    }
  };

  return (
    <group position={position}>
       <Model />
    </group>
  );
};

const LegoBlock: React.FC<{ position: [number, number, number], color: string, isLego: boolean }> = ({ position, color, isLego }) => {
  return (
    <group position={position}>
      <RoundedBox args={[0.95, 0.95, 0.95]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      {isLego && (
        <group position={[0, 0.45, 0]}>
          {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map((pos, i) => (
            <Cylinder key={i} args={[0.15, 0.15, 0.2, 12]} position={[pos[0], 0.1, pos[1]]}>
               <meshStandardMaterial color={color} />
            </Cylinder>
          ))}
        </group>
      )}
    </group>
  );
};

export const TetrisEngine: React.FC = () => {
  const { grid, activePiece, viewMode, mode, currentBlueprint, snakeBody, bullets } = useStore();
  const isLego = mode === GameMode.LEGO;
  const isArcade = [GameMode.BURGERTIME, GameMode.DIGDUG, GameMode.SNAKE, GameMode.CENTIPEDE].includes(mode);

  const renderedGrid = useMemo(() => {
    const blocks = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const typeId = grid[y][x];
        if (typeId) {
          const pos: [number, number, number] = [x - GRID_WIDTH / 2 + 0.5, GRID_HEIGHT - y - 0.5, 0];
          if (isArcade) {
            blocks.push(<ArcadeModel key={`grid-${x}-${y}`} type={typeId} position={pos} />);
          } else {
            const color = TETROMINOS[typeId]?.color || '#ffffff';
            blocks.push(<LegoBlock key={`grid-${x}-${y}`} position={pos} color={color} isLego={isLego} />);
          }
        }
      }
    }
    return blocks;
  }, [grid, isLego, isArcade]);

  const renderedActive = useMemo(() => {
    if (!activePiece) return null;
    const typeId = activePiece.type;
    return activePiece.shape.map((row, y) => 
      row.map((value, x) => {
        if (!value) return null;
        const pos: [number, number, number] = [
            (activePiece.pos[0] + x) - GRID_WIDTH / 2 + 0.5, 
            GRID_HEIGHT - (activePiece.pos[1] + y) - 0.5, 
            0
        ];
        if (isArcade) {
           return <ArcadeModel key={`active-${x}-${y}`} type={typeId} position={pos} facing={activePiece.facing} />;
        } else {
           const color = TETROMINOS[typeId].color;
           return <LegoBlock key={`active-${x}-${y}`} position={pos} color={color} isLego={isLego} />;
        }
      })
    );
  }, [activePiece, isLego, isArcade]);

  const renderedSnake = useMemo(() => {
    return snakeBody.map((segment, i) => {
       const pos: [number, number, number] = [segment[0] - GRID_WIDTH / 2 + 0.5, GRID_HEIGHT - segment[1] - 0.5, 0];
       return <ArcadeModel key={`snake-${i}`} type="S_BODY" position={pos} />;
    });
  }, [snakeBody]);

  const renderedBullets = useMemo(() => {
    return bullets.map((b) => {
       const pos: [number, number, number] = [b.pos[0] - GRID_WIDTH / 2 + 0.5, GRID_HEIGHT - b.pos[1] - 0.5, 0];
       return <ArcadeModel key={b.id} type="C_BULLET" position={pos} />;
    });
  }, [bullets]);

  const renderedBlueprint = useMemo(() => {
    if (!isLego || !currentBlueprint) return null;
    const bHeight = currentBlueprint.shape.length;
    const bWidth = currentBlueprint.shape[0].length;
    const startX = Math.floor((GRID_WIDTH - bWidth) / 2);
    return currentBlueprint.shape.map((row, y) => 
      row.map((val, x) => {
        if (!val) return null;
        return (
          <mesh key={`bp-${x}-${y}`} position={[startX + x - GRID_WIDTH / 2 + 0.5, bHeight - y - 1 + 0.5, 0.1]}>
             <boxGeometry args={[0.9, 0.9, 0.1]} />
             <meshBasicMaterial color="#ffffff" transparent opacity={0.2} wireframe />
          </mesh>
        );
      })
    );
  }, [isLego, currentBlueprint]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetRot = viewMode === ViewMode.WELL ? -Math.PI / 2 : 0;
    const targetZ = viewMode === ViewMode.WELL ? -30 : 0;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRot, delta * 5);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 5);
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, GRID_HEIGHT / 2, -0.6]}>
        <planeGeometry args={[GRID_WIDTH + 0.2, GRID_HEIGHT + 0.2]} />
        <meshBasicMaterial color="#1a0b2e" transparent opacity={0.5} />
      </mesh>
      <gridHelper 
        args={[GRID_HEIGHT, GRID_HEIGHT, '#8800ff', '#220044']} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, GRID_HEIGHT / 2, -0.55]}
        scale={[GRID_WIDTH / GRID_HEIGHT, 1, 1]}
      />
      {renderedGrid}
      {renderedActive}
      {renderedSnake}
      {renderedBullets}
      {renderedBlueprint}
    </group>
  );
};
