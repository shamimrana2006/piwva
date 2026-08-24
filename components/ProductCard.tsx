"use client";

import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { generateLogoMaps, createRoundedPlaneGeometry } from "./create3DText";

export const ProductCard: React.FC = () => {
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

    // 2. Abacus Product Image
    const abacusImg = new Image();
    abacusImg.src = "/images/abacus.jpg";

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1050;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderCard = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1024, 1050);

      const pad = 40;
      const imgW = 1024 - pad * 2;
      const imgH = 620;

      // Top Tag
      ctx.fillStyle = "#fef3c7";
      ctx.beginPath();
      ctx.roundRect(1024 - pad - 320, pad + 10, 310, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#92400e";
      ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("★ BESTSELLER • AGES 0-3", 1024 - pad - 165, pad + 38);

      // Product Image
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad, pad + 65, imgW, imgH, 32);
      ctx.clip();

      if (abacusImg.complete && abacusImg.naturalWidth > 0) {
        ctx.drawImage(abacusImg, pad, pad + 65, imgW, imgH);
      } else {
        ctx.fillStyle = "#f5eee6";
        ctx.fillRect(pad, pad + 65, imgW, imgH);

        ctx.strokeStyle = "#b88a4e";
        ctx.lineWidth = 18;
        ctx.strokeRect(pad + 60, pad + 120, imgW - 120, imgH - 120);

        const rowY = [pad + 200, pad + 300, pad + 400, pad + 500];
        const beadCols = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];
        rowY.forEach((y, rIdx) => {
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(pad + 70, y);
          ctx.lineTo(pad + imgW - 70, y);
          ctx.stroke();

          for (let b = 0; b < 6; b++) {
            ctx.beginPath();
            ctx.arc(pad + 160 + b * 100, y, 24, 0, Math.PI * 2);
            ctx.fillStyle = beadCols[rIdx % beadCols.length];
            ctx.fill();
          }
        });
      }
      ctx.restore();

      // Eco Seal on image
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.roundRect(pad + 25, pad + imgH - 10, 260, 48, 24);
      ctx.fill();
      ctx.fillStyle = "#15803d";
      ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🌱 100% Beechwood", pad + 155, pad + imgH + 21);

      // Color selection dots
      const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];
      const dotY = pad + imgH + 115;
      colors.forEach((col, i) => {
        ctx.beginPath();
        ctx.arc(pad + 15 + i * 44, dotY, 14, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });

      // Product Title
      ctx.fillStyle = "#2d3748";
      ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Montessori Wooden Abacus", pad + 15, dotY + 70);

      // Subtitle
      ctx.fillStyle = "#718096";
      ctx.font = "24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Sensory motor skills & counting beads for babies", pad + 15, dotY + 112);

      // Price & Stock
      ctx.fillStyle = "#b88a4e";
      ctx.font = "bold 46px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("$39.00", pad + 15, dotY + 175);

      ctx.fillStyle = "#a0aec0";
      ctx.font = "28px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("$49.00", pad + 195, dotY + 175);
      ctx.strokeStyle = "#a0aec0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pad + 190, dotY + 165);
      ctx.lineTo(pad + 285, dotY + 165);
      ctx.stroke();

      // Rating Stars
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("⭐⭐⭐⭐⭐ 4.9", pad + 330, dotY + 175);
      ctx.fillStyle = "#718096";
      ctx.font = "22px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("(380+ reviews)", pad + 540, dotY + 175);

      // Wishlist Heart Button
      const heartX = 1024 - pad - 60;
      const heartY = dotY + 140;
      ctx.fillStyle = "#fee2e2";
      ctx.beginPath();
      ctx.arc(heartX, heartY, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ef4444";
      ctx.font = "32px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("❤️", heartX, heartY + 2);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      setTexture(tex);
    };

    abacusImg.onload = renderCard;
    renderCard();
  }, []);

  const width = 3.3;
  const height = 3.4;
  const depth = 0.09;

  return (
    <group name="ProductCard">
      <RoundedBox
        args={[width, height, depth]}
        radius={0.22}
        smoothness={6}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.16}
          metalness={0.05}
          clearcoat={0.3}
          clearcoatRoughness={0.15}
        />
      </RoundedBox>

      {/* Front Face with Product Image Texture */}
      <mesh position={[0, 0, depth / 2 + 0.008]}>
        <primitive object={createRoundedPlaneGeometry(width - 0.02, height - 0.02, 0.21, 16)} attach="geometry" />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#ffffff" />
        )}
      </mesh>

      {/* Attached Physical 3D Piwva Stamp Emblem */}
      <group position={[-width / 2 + 0.8, height / 2 - 0.38, depth / 2 + 0.035]}>
        <RoundedBox args={[1.15, 0.44, 0.06]} radius={0.12} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#ffffff" roughness={0.12} metalness={0.05} clearcoat={0.85} />
        </RoundedBox>
        <RoundedBox args={[1.18, 0.47, 0.045]} radius={0.13} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#dfb782" roughness={0.12} metalness={0.95} clearcoat={1.0} />
        </RoundedBox>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[1.08, 0.38, 32, 16]} />
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
        <RoundedBox args={[1.12, 0.41, 0.02]} radius={0.11} smoothness={4} position={[0, 0, 0.048]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.86} transparent={true} roughness={0.04} ior={1.5} />
        </RoundedBox>
      </group>
    </group>
  );
};
