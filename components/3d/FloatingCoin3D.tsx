"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Coin() {
    const meshRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group ref={meshRef} position={[0, 0.5, 0]}>
                <mesh>
                    <cylinderGeometry args={[1, 1, 0.15, 32]} />
                    <MeshDistortMaterial
                        color="#E85A5A"
                        emissive="#E85A5A"
                        emissiveIntensity={0.5}
                        metalness={0.9}
                        roughness={0.1}
                        distort={0.1}
                        speed={2}
                    />
                </mesh>
                {/* Inner ring */}
                <mesh position={[0, 0, 0.08]}>
                    <ringGeometry args={[0.3, 0.6, 32]} />
                    <meshStandardMaterial
                        color="#4ADE80"
                        emissive="#4ADE80"
                        emissiveIntensity={0.8}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* "A" symbol on coin */}
                <mesh position={[0, 0, 0.09]}>
                    <planeGeometry args={[0.4, 0.4]} />
                    <meshStandardMaterial
                        color="#4ADE80"
                        emissive="#4ADE80"
                        emissiveIntensity={1}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
            </group>
        </Float>
    );
}

function RetroGrid() {
    const gridRef = useRef<THREE.GridHelper>(null);

    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 1;
        }
    });

    return (
        <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <gridHelper
                ref={gridRef}
                args={[20, 20, '#E85A5A', '#1a1a2e']}
                rotation={[Math.PI / 2, 0, 0]}
            />
        </group>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#E85A5A" />
            <pointLight position={[-10, 5, 5]} intensity={0.5} color="#4ADE80" />
            <spotLight
                position={[0, 5, 0]}
                intensity={1}
                angle={0.3}
                penumbra={1}
                color="#E85A5A"
            />
            <Coin />
            <RetroGrid />
            <fog attach="fog" args={['#050505', 5, 15]} />
        </>
    );
}

export const FloatingCoin3D = () => {
    return (
        <div className="w-full h-64 relative">
            <Canvas
                camera={{ position: [0, 2, 5], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <Scene />
            </Canvas>
            {/* Glow overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-void-black via-transparent to-transparent" />
        </div>
    );
};
