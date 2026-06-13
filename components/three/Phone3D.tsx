"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

function useScreenTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 1080;
    const ctx = c.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#040405";
    ctx.fillRect(0, 0, 512, 1080);

    // ambient screen glow
    const g = ctx.createRadialGradient(256, 360, 0, 256, 360, 560);
    g.addColorStop(0, "rgba(255,255,255,0.20)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 1080);

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "300 30px sans-serif";
    ctx.fillText("Total balance", 256, 380);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 110px sans-serif";
    ctx.fillText("$4,820", 256, 490);

    // two stat chips
    const chip = (x: number, label: string, val: string) => {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.roundRect(x, 560, 170, 100, 20);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "300 24px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, x + 22, 600);
      ctx.fillStyle = "#fff";
      ctx.font = "600 34px sans-serif";
      ctx.fillText(val, x + 22, 638);
    };
    chip(70, "Today", "+$320");
    chip(272, "Month", "+$2,940");

    // mini bars
    const bars = [40, 70, 50, 95, 65, 120, 85];
    const bw = 38;
    bars.forEach((h, i) => {
      ctx.fillStyle = `rgba(255,255,255,${0.35 + (h / 120) * 0.55})`;
      const x = 78 + i * 52;
      ctx.beginPath();
      ctx.roundRect(x, 860 - h, bw, h, 8);
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);
}

function PhoneMesh() {
  const group = useRef<THREE.Group>(null);
  const tex = useScreenTexture();

  useFrame((state) => {
    if (!group.current) return;
    const { x, y } = state.pointer;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -0.32 + x * 0.28, 0.06);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0.06 - y * 0.18, 0.06);
  });

  return (
    <group ref={group}>
      {/* body */}
      <RoundedBox args={[2.15, 4.4, 0.24]} radius={0.27} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#0b0b0d"
          metalness={0.65}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.18}
        />
      </RoundedBox>
      {/* polished rim */}
      <RoundedBox args={[2.17, 4.42, 0.2]} radius={0.27} smoothness={5}>
        <meshStandardMaterial color="#2a2a2e" metalness={1} roughness={0.35} />
      </RoundedBox>
      {/* screen */}
      <mesh position={[0, 0, 0.129]}>
        <planeGeometry args={[1.88, 4.08]} />
        {tex ? (
          <meshBasicMaterial map={tex} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#050506" toneMapped={false} />
        )}
      </mesh>
      {/* dynamic island */}
      <mesh position={[0, 1.78, 0.13]}>
        <planeGeometry args={[0.62, 0.16]} />
        <meshBasicMaterial color="#000" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Phone3D() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 8.5], fov: 30 }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 7, 6]} intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 3, -4]} intensity={1.1} />
      <spotLight position={[-2, 6, 4]} angle={0.5} penumbra={1} intensity={12} />
      <Float speed={1.4} rotationIntensity={0.45} floatIntensity={0.9}>
        <PhoneMesh />
      </Float>
      <ContactShadows position={[0, -2.75, 0]} opacity={0.5} scale={11} blur={3} far={4.5} color="#000000" />
    </Canvas>
  );
}
