"use client";

import React, { useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { generateLogoMaps } from "./create3DText";

interface PhoneModelProps {
  isDarkMode?: boolean;
}

export const PhoneModel: React.FC<PhoneModelProps> = ({ isDarkMode = false }) => {
  // Create high-res dynamic procedural canvas texture for the phone screen
  const [screenTexture, setScreenTexture] = useState<THREE.CanvasTexture | null>(null);
  const [logoMaps, setLogoMaps] = useState<{
    diffuseTex: THREE.CanvasTexture;
    bumpTex: THREE.CanvasTexture;
    normalTex: THREE.CanvasTexture;
    roughTex: THREE.CanvasTexture;
  } | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load logo, baby hero and abacus images into screen texture
    const logoImg = new Image();
    logoImg.src = "/logo/piwva-logo-transparent.png";

    const babyImg = new Image();
    babyImg.src = "/images/baby_hero.jpg";

    const abacusImg = new Image();
    abacusImg.src = "/images/abacus.jpg";

    const onImgLoad = () => {
      renderScreen();
    };

    logoImg.onload = () => {
      const generated = generateLogoMaps(logoImg);
      if (generated) setLogoMaps(generated);
      onImgLoad();
    };
    babyImg.onload = onImgLoad;
    abacusImg.onload = onImgLoad;

    // Fallback if images take time
    const renderScreen = () => {
      // 1. Screen Background (Warm sand/cream tone)
      ctx.fillStyle = "#eeddc8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Status Bar
      ctx.fillStyle = "#2d3748";
      ctx.font = "bold 28px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("9:41", 60, 60);

      // Status icons (battery, wifi, signal simulation)
      ctx.fillStyle = "#2d3748";
      // Wifi icon arc
      ctx.beginPath();
      ctx.arc(880, 50, 16, Math.PI * 1.2, Math.PI * 1.8);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#2d3748";
      ctx.stroke();

      // Battery pill
      ctx.strokeStyle = "#2d3748";
      ctx.lineWidth = 3;
      ctx.strokeRect(920, 38, 44, 22);
      ctx.fillStyle = "#2d3748";
      ctx.fillRect(924, 42, 30, 14);
      ctx.fillRect(964, 44, 4, 10);

      // 2. App Top Header
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        const lh = 56;
        const lw = (logoImg.naturalWidth / logoImg.naturalHeight) * lh;
        ctx.drawImage(logoImg, 60, 95, lw, lh);
      } else {
        ctx.fillStyle = "#2d3748";
        ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Piwva", 60, 140);
      }

      // Header Icons (Search, Cart, Menu)
      // Cart icon
      ctx.font = "32px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("🛒", 880, 140);
      ctx.fillText("⋮", 940, 140);

      // 3. Hero Banner Card with Baby Image
      const bannerX = 40;
      const bannerY = 180;
      const bannerW = 944;
      const bannerH = 680;
      const radius = 40;

      ctx.save();
      // Rounded rect clip for banner
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, radius);
      ctx.clip();

      if (babyImg.complete && babyImg.naturalWidth > 0) {
        ctx.drawImage(babyImg, bannerX, bannerY, bannerW, bannerH);
      } else {
        ctx.fillStyle = "#d2c1ad";
        ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      }

      // Subtle warm gradient overlay on banner
      const grad = ctx.createLinearGradient(bannerX, bannerY + 300, bannerX, bannerY + bannerH);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(70, 50, 35, 0.65)");
      ctx.fillStyle = grad;
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

      // Banner Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 8;
      ctx.fillText("PURE & GENTLE CARE", bannerX + 40, bannerY + bannerH - 120);
      ctx.font = "26px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Sustainable Wooden Toys & Nursery", bannerX + 40, bannerY + bannerH - 65);
      ctx.shadowBlur = 0;

      // Small "SHOP NOW" button in banner
      const bBtnW = 180;
      const bBtnH = 50;
      const bBtnX = bannerX + bannerW - bBtnW - 40;
      const bBtnY = bannerY + bannerH - 95;
      ctx.fillStyle = "#dfb782";
      ctx.beginPath();
      ctx.roundRect(bBtnX, bBtnY, bBtnW, bBtnH, 25);
      ctx.fill();
      ctx.fillStyle = "#2d3748";
      ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SHOP NOW", bBtnX + bBtnW / 2, bBtnY + 32);

      ctx.restore();

      // 4. "NEW IN" Section
      ctx.textAlign = "left";
      ctx.fillStyle = "#2d3748";
      ctx.font = "bold 38px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Featured Baby Essentials", 60, 920);

      ctx.fillStyle = "#718096";
      ctx.font = "22px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Handcrafted with non-toxic natural beechwood", 60, 960);

      // 5. Product Grid (2 columns)
      const colW = 445;
      const colH = 680;
      const col1X = 40;
      const col2X = 539;
      const gridY = 1040;

      // Card 1 (Left)
      renderProductCard(col1X, gridY, colW, colH, "Wooden Abacus", "$39.00", abacusImg);
      // Card 2 (Right)
      renderProductCard(col2X, gridY, colW, colH, "Sensory Rattle", "$24.00", abacusImg);

      // 6. Pagination / Dot Indicators
      const dotY = 1820;
      const dotsX = [470, 500, 530, 560];
      dotsX.forEach((x, i) => {
        ctx.beginPath();
        if (i === 1) {
          // Active pill
          ctx.fillStyle = "#a88b6b";
          ctx.roundRect(x - 8, dotY - 5, 26, 10, 5);
          ctx.fill();
        } else {
          ctx.fillStyle = "#c5b7a7";
          ctx.arc(x, dotY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Bottom Home Indicator Bar
      ctx.fillStyle = "#a88b6b";
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - 120, 2010, 240, 10, 5);
      ctx.fill();

      // Create Three.js Texture
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      setScreenTexture(tex);
    };

    const renderProductCard = (
      x: number,
      y: number,
      w: number,
      h: number,
      title: string,
      price: string,
      img: HTMLImageElement
    ) => {
      ctx.save();
      // White card background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 28);
      ctx.fill();

      // Inner image container
      const imgPad = 18;
      const imgW = w - imgPad * 2;
      const imgH = 400;
      const imgX = x + imgPad;
      const imgY = y + imgPad;

      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 20);
      ctx.clip();

      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
      } else {
        ctx.fillStyle = "#f0ebe1";
        ctx.fillRect(imgX, imgY, imgW, imgH);
      }
      ctx.restore();

      // Product details
      // Color selector dots
      const dotColors = ["#e63946", "#3a86ff", "#00b4d8", "#fb8500"];
      const dotRadius = 8;
      const dotStartX = x + 30;
      const dotYPos = y + imgH + 45;
      dotColors.forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(dotStartX + i * 26, dotYPos, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Title & Price
      ctx.textAlign = "left";
      ctx.fillStyle = "#3f3f3f";
      ctx.font = "600 28px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(title, x + 30, y + imgH + 110);

      ctx.fillStyle = "#8a7d6e";
      ctx.font = "bold 30px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(price, x + 30, y + imgH + 160);

      // Heart outline icon
      ctx.strokeStyle = "#a88b6b";
      ctx.lineWidth = 3;
      const hX = x + w - 45;
      const hY = y + imgH + 140;
      ctx.beginPath();
      ctx.arc(hX - 8, hY - 6, 8, Math.PI, 0);
      ctx.arc(hX + 8, hY - 6, 8, Math.PI, 0);
      ctx.lineTo(hX, hY + 14);
      ctx.closePath();
      ctx.stroke();
    };

    // Trigger initial render
    renderScreen();
  }, []);

  // Phone Dimensions
  const phoneWidth = 3.6;
  const phoneHeight = 7.4;
  const phoneDepth = 0.34;
  const cornerRadius = 0.45;

  return (
    <group name="Smartphone3D">
      {/* Phone Outer Chassis (Matte Ceramic White with subtle chamfer) */}
      <RoundedBox
        args={[phoneWidth, phoneHeight, phoneDepth]}
        radius={cornerRadius}
        smoothness={8}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#fcfdfd"
          roughness={0.18}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </RoundedBox>

      {/* Phone Screen Glass with UI Texture */}
      <mesh position={[0, 0, phoneDepth / 2 + 0.005]} receiveShadow>
        <planeGeometry args={[phoneWidth - 0.22, phoneHeight - 0.22]} />
        {screenTexture ? (
          <meshBasicMaterial map={screenTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#eeddc8" roughness={0.3} />
        )}
      </mesh>

      {/* Screen Glare / Sheen Overlay */}
      <mesh position={[0, 0, phoneDepth / 2 + 0.008]}>
        <planeGeometry args={[phoneWidth - 0.22, phoneHeight - 0.22]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={0.05}
          transmission={0.9}
          reflectivity={0.5}
        />
      </mesh>

      {/* Top Speaker Grille */}
      <mesh position={[0, phoneHeight / 2 - 0.22, phoneDepth / 2 + 0.009]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.025, 0.35, 8, 16]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* Front Camera Lens */}
      <mesh position={[0.45, phoneHeight / 2 - 0.22, phoneDepth / 2 + 0.009]}>
        <circleGeometry args={[0.04, 24]} />
        <meshStandardMaterial color="#1a202c" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Bottom USB-C Port */}
      <mesh position={[0, -phoneHeight / 2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.035, 0.28, 4, 16]} />
        <meshStandardMaterial color="#3f4a56" roughness={0.7} metalness={0.6} />
      </mesh>

      {/* Bottom Speaker Holes (Left & Right) */}
      {[-0.6, -0.45, -0.3, 0.3, 0.45, 0.6].map((x, idx) => (
        <mesh key={idx} position={[x, -phoneHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
          <meshStandardMaterial color="#3f4a56" roughness={0.7} metalness={0.5} />
        </mesh>
      ))}

      {/* Physical 3D Gold & Glass Piwva Emblem on Back of Phone */}
      <group position={[0, 0.6, -phoneDepth / 2 - 0.035]} rotation={[0, Math.PI, 0]}>
        <RoundedBox args={[1.8, 0.65, 0.06]} radius={0.16} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#ffffff" roughness={0.12} metalness={0.05} clearcoat={0.85} />
        </RoundedBox>
        <RoundedBox args={[1.84, 0.69, 0.05]} radius={0.17} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#dfb782" roughness={0.12} metalness={0.95} clearcoat={1.0} />
        </RoundedBox>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[1.72, 0.58, 32, 16]} />
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
        <RoundedBox args={[1.78, 0.62, 0.02]} radius={0.14} smoothness={4} position={[0, 0, 0.045]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.86} transparent={true} roughness={0.04} ior={1.5} />
        </RoundedBox>
      </group>

      {/* Physical 3D Piwva Chip on Front Screen Top Header */}
      <group position={[-phoneWidth / 2 + 0.72, phoneHeight / 2 - 0.54, phoneDepth / 2 + 0.025]}>
        <RoundedBox args={[0.92, 0.34, 0.035]} radius={0.08} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#ffffff" roughness={0.12} metalness={0.05} clearcoat={0.8} />
        </RoundedBox>
        <RoundedBox args={[0.95, 0.37, 0.03]} radius={0.09} smoothness={6} castShadow>
          <meshPhysicalMaterial color="#dfb782" roughness={0.15} metalness={0.92} clearcoat={1.0} />
        </RoundedBox>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.86, 0.3, 32, 16]} />
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
        <RoundedBox args={[0.88, 0.32, 0.015]} radius={0.07} smoothness={4} position={[0, 0, 0.03]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.85} transparent={true} roughness={0.05} ior={1.5} />
        </RoundedBox>
      </group>

      {/* Side Buttons (Power & Volume) */}
      <mesh position={[phoneWidth / 2 + 0.01, 1.2, 0]}>
        <boxGeometry args={[0.03, 0.8, 0.08]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-phoneWidth / 2 - 0.01, 1.5, 0]}>
        <boxGeometry args={[0.03, 0.6, 0.08]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-phoneWidth / 2 - 0.01, 0.7, 0]}>
        <boxGeometry args={[0.03, 0.6, 0.08]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
};
