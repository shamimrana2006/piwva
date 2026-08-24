"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { Cylinder } from "@react-three/drei";

interface ActionCircleProps {
  iconType: "cart" | "heart" | "more";
  position: [number, number, number];
}

const ActionCircle: React.FC<ActionCircleProps> = ({ iconType, position }) => {
  const iconTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#716558";
    ctx.fillStyle = "#716558";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    if (iconType === "cart") {
      // Draw shopping cart
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - 35);
      ctx.lineTo(cx - 30, cy - 35);
      ctx.lineTo(cx - 10, cy + 15);
      ctx.lineTo(cx + 40, cy + 15);
      ctx.lineTo(cx + 55, cy - 20);
      ctx.lineTo(cx - 20, cy - 20);
      ctx.stroke();

      // Wheels
      ctx.beginPath();
      ctx.arc(cx - 5, cy + 38, 10, 0, Math.PI * 2);
      ctx.arc(cx + 32, cy + 38, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (iconType === "heart") {
      // Draw heart
      ctx.beginPath();
      ctx.arc(cx - 22, cy - 14, 22, Math.PI, 0);
      ctx.arc(cx + 22, cy - 14, 22, Math.PI, 0);
      ctx.lineTo(cx, cy + 45);
      ctx.closePath();
      ctx.stroke();
    } else if (iconType === "more") {
      // Draw 3 horizontal dots
      const dots = [-45, 0, 45];
      dots.forEach((dx) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy, 10, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [iconType]);

  const radius = 0.42;
  const height = 0.12;

  return (
    <group position={position}>
      {/* 3D Round Cylinder Disc */}
      <Cylinder
        args={[radius, radius, height, 32]}
        rotation={[Math.PI / 2, 0, 0]}
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
      </Cylinder>

      {/* Front Face with Icon */}
      <mesh position={[0, 0, height / 2 + 0.002]}>
        <circleGeometry args={[radius - 0.02, 32]} />
        {iconTexture ? (
          <meshBasicMaterial map={iconTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#ffffff" />
        )}
      </mesh>
    </group>
  );
};

export const ActionButtons: React.FC = () => {
  return (
    <group name="ActionButtonsGroup">
      <ActionCircle iconType="cart" position={[-0.95, 0, 0]} />
      <ActionCircle iconType="heart" position={[0, 0, 0]} />
      <ActionCircle iconType="more" position={[0.95, 0, 0]} />
    </group>
  );
};
