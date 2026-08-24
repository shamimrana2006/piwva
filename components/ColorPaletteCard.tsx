"use client";

import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { generateLogoMaps, createRoundedPlaneGeometry } from "./create3DText";

export const ColorPaletteCard: React.FC = () => {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [logoMaps, setLogoMaps] = useState<{
    diffuseTex: THREE.CanvasTexture;
    bumpTex: THREE.CanvasTexture;
    normalTex: THREE.CanvasTexture;
    roughTex: THREE.CanvasTexture;
  } | null>(null);

  useEffect(() => {
    // 1. Logo Maps for 3D Emblem
    const logoImg = new Image();
    logoImg.src = "/logo/piwva-logo-transparent.png";
    logoImg.onload = () => {
      const generated = generateLogoMaps(logoImg);
      if (generated) setLogoMaps(generated);
    };

    // 2. Card Texture
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 580;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card Header
    ctx.fillStyle = "#2d3748";
    ctx.font = "bold 32px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🌿 ORGANIC NURSERY PALETTE", 45, 60);

    ctx.fillStyle = "#718096";
    ctx.font = "22px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("100% Non-Toxic • Plant-Based Dyes • Hypoallergenic", 45, 95);

    const swatches = [
      { color: "#d4a373", name: "Warm Caramel", label: "#d4a373" },
      { color: "#faebd7", name: "Organic Oat", label: "#faebd7" },
      { color: "#78866b", name: "Eucalyptus Sage", label: "#78866b" },
    ];

    const swatchW = 280;
    const swatchH = 320;
    const swatchY = 125;
    const gap = 38;
    const startX = (canvas.width - (3 * swatchW + 2 * gap)) / 2;

    swatches.forEach((swatch, i) => {
      const x = startX + i * (swatchW + gap);
      ctx.fillStyle = swatch.color;
      ctx.beginPath();
      ctx.roundRect(x, swatchY, swatchW, swatchH, 24);
      ctx.fill();

      // Border around swatch
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#2d3748";
      ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(swatch.name, x + swatchW / 2, swatchY + swatchH + 45);

      ctx.fillStyle = "#a0aec0";
      ctx.font = "bold 22px monospace";
      ctx.fillText(swatch.label, x + swatchW / 2, swatchY + swatchH + 78);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    setTexture(tex);
  }, []);

  const width = 3.3;
  const height = 1.85;
  const depth = 0.08;

  return (
    <group name="ColorPaletteCard">
      {/* 3D Rounded White Base */}
      <RoundedBox
        args={[width, height, depth]}
        radius={0.16}
        smoothness={6}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.15}
          metalness={0.05}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>

      {/* Front Face with Swatches Texture */}
      <mesh position={[0, 0, depth / 2 + 0.008]}>
        <primitive object={createRoundedPlaneGeometry(width - 0.02, height - 0.02, 0.15, 16)} attach="geometry" />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#ffffff" />
        )}
      </mesh>

      {/* Attached Physical 3D Piwva Badge */}
      <group position={[-width / 2 + 0.8, height / 2 + 0.28, depth / 2 + 0.02]}>
        <RoundedBox args={[1.15, 0.42, 0.05]} radius={0.1} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#ffffff" roughness={0.12} metalness={0.05} clearcoat={0.8} />
        </RoundedBox>
        <RoundedBox args={[1.18, 0.45, 0.04]} radius={0.11} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#dfb782" roughness={0.15} metalness={0.92} clearcoat={1.0} />
        </RoundedBox>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.08, 0.36, 32, 16]} />
          {logoMaps ? (
            <meshPhysicalMaterial
              map={logoMaps.diffuseTex}
              bumpMap={logoMaps.bumpTex}
              normalMap={logoMaps.normalTex}
              roughnessMap={logoMaps.roughTex}
              color="#e2bf8c"
              metalness={0.92}
              roughness={0.14}
              clearcoat={1.0}
              transparent={true}
            />
          ) : (
            <meshStandardMaterial color="#e2bf8c" />
          )}
        </mesh>
        <RoundedBox args={[1.12, 0.39, 0.02]} radius={0.09} smoothness={4} position={[0, 0, 0.045]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.85} transparent={true} roughness={0.05} ior={1.5} />
        </RoundedBox>
      </group>
    </group>
  );
};
