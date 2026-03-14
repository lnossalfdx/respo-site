"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 900;

function createPositions() {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  let seed = 1337;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = rng() * Math.PI * 2;
    const r = rng() * 18;
    pos[i * 3] = Math.cos(theta) * r;
    pos[i * 3 + 1] = (rng() - 0.5) * 30;
    pos[i * 3 + 2] = Math.sin(theta) * 6 - 5;
  }

  return pos;
}

const POSITIONS = createPositions();

export function BackgroundParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Smooth mouse tracking with inertia — strong position AND rotation response
    const px = state.pointer.x;  // -1 to +1
    const py = state.pointer.y;  // -1 to +1

    // Rotation: tilt the field toward the mouse (3D depth feel)
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      px * 0.45,
      0.04
    );
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      -py * 0.3,
      0.04
    );

    // Translation parallax: field moves opposite to mouse (depth illusion)
    pointsRef.current.position.x = THREE.MathUtils.lerp(
      pointsRef.current.position.x,
      -px * 1.8,
      0.04
    );
    pointsRef.current.position.y = THREE.MathUtils.lerp(
      pointsRef.current.position.y,
      -py * 1.2,
      0.04
    );

    // Organic wave: gentle per-particle animation
    const t = state.clock.getElapsedTime();
    const attr = pointsRef.current.geometry.attributes.position;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += Math.sin(t * 0.4 + arr[i3] * 0.3) * 0.003;
      arr[i3] += Math.cos(t * 0.3 + arr[i3 + 1] * 0.2) * 0.002;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[POSITIONS, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#00ff88"
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
