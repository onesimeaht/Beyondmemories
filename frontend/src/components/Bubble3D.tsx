import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Billboard } from '@react-three/drei';
import { Mesh, TextureLoader, DoubleSide } from 'three';
import { BubbleData } from '../types';

interface Bubble3DProps {
  data: BubbleData;
  onClick: (data: BubbleData) => void;
  isSelected: boolean;
}

export const Bubble3D: React.FC<Bubble3DProps> = ({ data, onClick, isSelected }) => {
  const bubbleRef = useRef<Mesh>(null);
  const imageRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.setCrossOrigin('anonymous');
    
    console.log('🔄 Tentative de chargement:', data.mainImage);
    
    loader.load(
      data.mainImage,
      (loadedTexture) => {
        console.log('✅ Texture chargée avec succès:', data.mainImage);
        setTexture(loadedTexture);
        setError(false);
      },
      undefined,
      (err) => {
        console.error('❌ Erreur de chargement de texture:', err);
        setError(true);
      }
    );

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [data.mainImage]);

  useFrame((state, delta) => {
    if (bubbleRef.current) {
      const targetScale = hovered ? data.size * 1.15 : data.size;
      const currentScale = bubbleRef.current.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * delta * 5;
      bubbleRef.current.scale.set(newScale, newScale, newScale);
      bubbleRef.current.rotation.y += delta * 0.1;
    }
    
    // L'image regarde toujours la caméra
    if (imageRef.current && state.camera) {
      imageRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <Float 
      speed={1.5} 
      rotationIntensity={0.5} 
      floatIntensity={0.5} 
      position={data.position as [number, number, number]}
    >
      <group 
        onClick={(e) => {
          e.stopPropagation();
          onClick(data);
        }}
        onPointerOver={() => { 
          document.body.style.cursor = 'pointer'; 
          setHovered(true); 
        }}
        onPointerOut={() => { 
          document.body.style.cursor = 'auto'; 
          setHovered(false); 
        }}
      >
        {/* Bulle transparente */}
        <mesh ref={bubbleRef}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial 
            color={texture ? "#60a5fa" : (error ? "#ff6b6b" : "#a5b4fc")}
            transmission={0.7}
            opacity={0.25}
            transparent
            roughness={0}
            metalness={0.1}
            ior={1.5}
            thickness={0.5}
          />
        </mesh>

        {/* Image circulaire - MÊME TAILLE QUE LA SPHÈRE (rayon = 1) */}
        {texture && !error && (
          <mesh ref={imageRef} position={[0, 0, 0]}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial 
              map={texture}
              toneMapped={false}
              side={DoubleSide}
            />
          </mesh>
        )}

        {/* Cercle d'erreur */}
        {error && (
          <mesh position={[0, 0, 0]}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial color="#ff4444" side={DoubleSide} />
          </mesh>
        )}

        {/* Cercle de chargement */}
        {!texture && !error && (
          <mesh position={[0, 0, 0]}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial color="#ffbb00" side={DoubleSide} />
          </mesh>
        )}

        {/* Nom en dessous */}
        <Billboard position={[0, -data.size - 0.5, 0]}>
          <Text
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
            fillOpacity={hovered ? 1 : 0.7}
          >
            {data.name}
          </Text>
        </Billboard>

        {/* Reflet lumineux */}
        {texture && (
          <mesh position={[0.35, 0.35, 0.5]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial 
              color="white"
              transparent
              opacity={0.7}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
};