import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { Bubble3D } from './Bubble3D';
import type { BubbleData } from '../types';

interface OceanSceneProps {
  bubbles: BubbleData[];
  onBubbleClick: (data: BubbleData) => void;
  selectedId: string | null;
}

export const OceanScene: React.FC<OceanSceneProps> = ({ bubbles, onBubbleClick, selectedId }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0
    }}>
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={['#050A18']} />
        <fog attach="fog" args={['#050A18', 10, 40]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={200} scale={20} size={4} speed={0.4} opacity={0.5} color="#93c5fd" />
        
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#60a5fa" />
        <directionalLight position={[0, 0, 5]} intensity={0.5} />

        <OrbitControls 
          enablePan 
          enableZoom 
          minDistance={5} 
          maxDistance={30}
          autoRotate={!selectedId}
          autoRotateSpeed={0.5}
        />

        <Suspense fallback={null}>
          <group>
            {bubbles.map((bubble) => (
              <Bubble3D 
                key={bubble.id} 
                data={bubble} 
                onClick={onBubbleClick}
                isSelected={selectedId === bubble.id}
              />
            ))}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};