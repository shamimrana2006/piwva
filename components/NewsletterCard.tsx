"use client";

import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { generateLogoMaps, createRoundedPlaneGeometry } from "./create3DText";

export const NewsletterCard: React.FC = () => {
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

    // 2. Card Canvas Texture
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 820;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#a88b6b";
    ctx.fillRect(0, 0, 1024, 820);

    // Top Tag
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(60, 45, 280, 42, 21);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎁 NEW PARENTS CLUB", 200, 73);

    // Illustrated Sprout / Leaves
    const iX = 120;
    const iY = 180;
    ctx.strokeStyle = "#f5eee6";
    ctx.fillStyle = "#f5eee6";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(iX, iY - 60);
    ctx.lineTo(iX, iY + 60);
    ctx.stroke();

    const drawLeaf = (lx: number, ly: number, angle: number, size: number) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size * 0.7, -size * 0.4, size, 0);
      ctx.quadraticCurveTo(size * 0.7, size * 0.4, 0, 0);
      ctx.fill();
      ctx.restore();
    };
    drawLeaf(iX - 10, iY - 25, -Math.PI * 0.75, 60);
    drawLeaf(iX - 10, iY + 15, -Math.PI * 0.85, 55);
    drawLeaf(iX + 10, iY - 40, -Math.PI * 0.25, 60);
    drawLeaf(iX + 10, iY, -Math.PI * 0.15, 65);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("LET'S STAY IN TOUCH", iX + 100, iY - 10);
    ctx.fillStyle = "#f5eee6";
    ctx.font = "24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Get 15% OFF your first baby order + nursery guide.", iX + 100, iY + 32);

    // Email Input Field
    const inX = 60;
    const inY = 360;
    const inW = 1024 - inX * 2;
    const inH = 110;
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.beginPath();
    ctx.roundRect(inX, inY, inW, inH, inH / 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 30px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("your.email@babylove.com", inX + 45, inY + 68);

    // Send Arrow Button inside Input
    const btnR = 42;
    const btnX = inX + inW - btnR - 18;
    const btnY = inY + inH / 2;
    ctx.fillStyle = "#dfb782";
    ctx.beginPath();
    ctx.arc(btnX, btnY, btnR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2d3748";
    ctx.font = "bold 34px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("➔", btnX, btnY);

    // Trust Badges
    const bY2 = 560;
    ctx.fillStyle = "#f5eee6";
    ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("✓ 100% Non-Toxic Beechwood", 60, bY2);
    ctx.fillText("✓ Pediatrician Approved", 400, bY2);
    ctx.fillText("✓ Safe for Newborns", 720, bY2);

    // Social Media Icons
    const sY = 690;
    const sStartX = 100;
    const sGap = 120;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(sStartX - 28, sY - 28, 56, 56, 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sStartX, sY, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sStartX + 15, sY - 15, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("f", sStartX + sGap, sY);

    ctx.font = "bold italic 56px serif";
    ctx.fillText("P", sStartX + sGap * 2, sY);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    setTexture(tex);
  }, []);

  const width = 3.8;
  const height = 2.9;
  const depth = 0.09;

  return (
    <group name="NewsletterCard">
      <RoundedBox
        args={[width, height, depth]}
        radius={0.24}
        smoothness={6}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#a88b6b"
          roughness={0.22}
          metalness={0.05}
          clearcoat={0.25}
          clearcoatRoughness={0.15}
        />
      </RoundedBox>

      <mesh position={[0, 0, depth / 2 + 0.008]}>
        <primitive object={createRoundedPlaneGeometry(width - 0.02, height - 0.02, 0.23, 16)} attach="geometry" />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#a88b6b" />
        )}
      </mesh>

      {/* Attached Physical 3D Piwva Emblem on Newsletter Card */}
      <group position={[width / 2 - 0.82, height / 2 - 0.42, depth / 2 + 0.035]}>
        <RoundedBox args={[1.25, 0.45, 0.06]} radius={0.12} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#ffffff" roughness={0.12} metalness={0.05} clearcoat={0.85} />
        </RoundedBox>
        <RoundedBox args={[1.28, 0.48, 0.045]} radius={0.13} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#e2e8f0" roughness={0.12} metalness={0.95} clearcoat={1.0} />
        </RoundedBox>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[1.18, 0.38, 32, 16]} />
          {logoMaps ? (
            <meshPhysicalMaterial
              map={logoMaps.diffuseTex}
              bumpMap={logoMaps.bumpTex}
              normalMap={logoMaps.normalTex}
              roughnessMap={logoMaps.roughTex}
              color="#ffffff"
              metalness={0.88}
              roughness={0.14}
              clearcoat={1.0}
              transparent={true}
            />
          ) : (
            <meshStandardMaterial color="#ffffff" />
          )}
        </mesh>
        <RoundedBox args={[1.22, 0.42, 0.02]} radius={0.11} smoothness={4} position={[0, 0, 0.048]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.86} transparent={true} roughness={0.04} ior={1.5} />
        </RoundedBox>
      </group>
    </group>
  );
};
