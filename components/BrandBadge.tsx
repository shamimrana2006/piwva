"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { loadPiwvaFont, createSeparate3DLetters } from "./create3DText";

export const BrandBadge: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    loadPiwvaFont().then((font) => {
      if (!groupRef.current) return;
      const res = createSeparate3DLetters("Piwva", font, {
        size: 0.9,
        depth: 0.3,
        letterSpacing: 0.15,
        bevelThickness: 0.04,
        bevelSize: 0.022,
        bevelSegments: 8,
        curveSegments: 16,
        frontColor: 0xdfb782,
        sideColor: 0xb88a4e,
        metalness: 0.96,
        roughness: 0.12,
        clearcoat: 1.0,
      });
      groupRef.current.add(res.group);
    });
  }, []);

  return (
    <group ref={groupRef} name="BrandBadge">
      {/* Delicate floating gold orbit rings */}
      <mesh rotation={[Math.PI / 3.2, Math.PI / 8, 0]}>
        <torusGeometry args={[2.4, 0.012, 16, 80]} />
        <meshPhysicalMaterial color="#dfb782" metalness={0.95} roughness={0.1} clearcoat={1.0} />
      </mesh>
    </group>
  );
};
