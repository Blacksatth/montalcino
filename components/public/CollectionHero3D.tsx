"use client";

import { useRef, useState, useEffect, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import type { Collection } from "@/types";
import * as THREE from "three";
import gsap from "gsap";

function SceneContent({
  collection: _collection,
  onScrollProgress,
}: {
  collection: Collection;
  onScrollProgress: (progress: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const { offset } = useScroll();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.02;
      particlesRef.current.rotation.x += delta * 0.01;
    }
  });

  useEffect(() => {
    onScrollProgress(offset);
  }, [offset, onScrollProgress]);

  return (
    <group ref={groupRef}>
      <ParticleSystem ref={particlesRef} count={2000} size={60} />
      <HeroMesh />
    </group>
  );
}

const ParticleSystem = forwardRef<THREE.Points, { count: number; size: number }>(
  ({ count, size }, ref) => {
    const pointsRef = useRef<THREE.Points>(null);
    const positionsRef = useRef<Float32Array | null>(null);
    const velocitiesRef = useRef<Float32Array | null>(null);

    useEffect(() => {
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const radius = size * (0.5 + Math.random() * 0.5);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        velocities[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      }

      positionsRef.current = positions;
      velocitiesRef.current = velocities;

      if (pointsRef.current) {
        pointsRef.current.geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
      }
    }, [count, size]);

    useFrame(() => {
      if (!pointsRef.current || !positionsRef.current || !velocitiesRef.current) return;

      const positions = positionsRef.current;
      const velocities = velocitiesRef.current;

      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        const dist = Math.sqrt(
          positions[i * 3] ** 2 +
            positions[i * 3 + 1] ** 2 +
            positions[i * 3 + 2] ** 2
        );

        if (dist > size) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = size * 0.5;

          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = radius * Math.cos(phi);
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    const combinedRef = (node: THREE.Points | null) => {
      pointsRef.current = node;
      if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<THREE.Points | null>).current = node;
      } else if (typeof ref === "function") {
        ref(node);
      }
    };

    return (
      <points ref={combinedRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(count * 3), 3]}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#D4A574"
          size={0.15}
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    );
  }
);
ParticleSystem.displayName = "ParticleSystem";

function HeroMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      scale={1.5}
      onPointerOver={(e) => {
        e.stopPropagation();
        gsap.to(meshRef.current!.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.3 });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        gsap.to(meshRef.current!.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.3 });
      }}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        color="#1a1a1a"
        metalness={0.3}
        roughness={0.4}
        clearcoat={0.5}
        clearcoatRoughness={0.1}
        transmission={0.1}
        thickness={0.5}
        ior={1.5}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    const progress = scrollProgress;
    camera.position.set(
      0,
      THREE.MathUtils.lerp(0, 3, progress),
      THREE.MathUtils.lerp(5, 15, progress)
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function CollectionHero3D({ collection }: { collection: Collection }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="relative w-full h-full min-h-[60vh] md:min-h-[80vh]">
      <Canvas
        ref={canvasRef}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="absolute inset-0"
      >
        <color attach="background" args={["#0a0a0a"]} />
        <fog attach="fog" args={["#0a0a0a", 1, 50]} />

        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight position={[5, 10, 7]} intensity={2} color="#D4A574" />
        <directionalLight position={[-5, 5, -5]} intensity={1} color="#3a3a3a" />
        <pointLight position={[0, 3, 5]} intensity={1} color="#D4A574" decay={2} />

        <SceneContent collection={collection} onScrollProgress={setScrollProgress} />
        <CameraRig scrollProgress={scrollProgress} />
      </Canvas>

      <div className="relative z-10 absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-6 max-w-4xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40 mb-2">
            Colección
          </p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream leading-tight">
            {collection.name}
          </h1>
          <p className="mt-4 md:mt-6 text-sm md:text-base leading-relaxed text-cream/60 max-w-2xl mx-auto">
            {collection.description}
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none"
        style={{ animationDelay: "2s" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-cream/40"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function CollectionHero3DWrapper({ collection }: { collection: Collection }) {
  return (
    <div style={{ height: "60vh", minHeight: "500px" }}>
      <CollectionHero3D collection={collection} />
    </div>
  );
}