"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

export const ShopNowButton: React.FC = () => {
  const btnTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#a88b6b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "2px";
    ctx.fillText("SHOP NOW", canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const width = 2.4;
  const height = 0.55;
  const depth = 0.1;

  return (
    <group name="ShopNowButton">
      <RoundedBox
        args={[width, height, depth]}
        radius={0.24}
        smoothness={8}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#a88b6b"
          roughness={0.25}
          metalness={0.08}
          clearcoat={0.2}
        />
      </RoundedBox>

      <mesh position={[0, 0, depth / 2 + 0.002]}>
        <planeGeometry args={[width - 0.04, height - 0.04]} />
        {btnTexture ? (
          <meshBasicMaterial map={btnTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#a88b6b" />
        )}
      </mesh>
    </group>
  );
};
