"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sparkles, RotateCw, Eye, X, Layers, Sun, Type } from "lucide-react";
import {
  loadPiwvaFont,
  createSeparate3DLetters,
  SeparateLetterData,
  generateLogoMaps,
} from "./create3DText";

export { generateLogoMaps };

export type LogoMaterialPreset = "gold" | "chrome" | "rosegold" | "obsidian";

interface Logo3DElementProps {
  initialPreset?: LogoMaterialPreset;
  onClose?: () => void;
  isModal?: boolean;
}

export const Logo3DElement: React.FC<Logo3DElementProps> = ({
  initialPreset = "gold",
  onClose,
  isModal = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<LogoMaterialPreset>(initialPreset);
  const [isAutoSpin, setIsAutoSpin] = useState(true);

  const frontMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const sideMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const orbitGroupRef = useRef<THREE.Group | null>(null);
  const lettersRef = useRef<SeparateLetterData[]>([]);

  // Apply preset material colors & properties
  useEffect(() => {
    if (!frontMatRef.current || !sideMatRef.current) return;

    const frontMat = frontMatRef.current;
    const sideMat = sideMatRef.current;

    if (preset === "gold") {
      // 24K Luxury Gold 3D Letters
      frontMat.color.set("#dfb782");
      frontMat.metalness = 0.96;
      frontMat.roughness = 0.12;
      frontMat.clearcoat = 1.0;
      frontMat.clearcoatRoughness = 0.08;

      sideMat.color.set("#b88a4e");
      sideMat.metalness = 0.93;
      sideMat.roughness = 0.22;
      sideMat.clearcoat = 0.7;
    } else if (preset === "chrome") {
      // Liquid Platinum / Diamond Chrome
      frontMat.color.set("#f8fafc");
      frontMat.metalness = 0.98;
      frontMat.roughness = 0.06;
      frontMat.clearcoat = 1.0;
      frontMat.clearcoatRoughness = 0.03;

      sideMat.color.set("#94a3b8");
      sideMat.metalness = 0.96;
      sideMat.roughness = 0.14;
      sideMat.clearcoat = 0.9;
    } else if (preset === "rosegold") {
      // Rose Gold / Pink Copper
      frontMat.color.set("#f09a85");
      frontMat.metalness = 0.93;
      frontMat.roughness = 0.14;
      frontMat.clearcoat = 0.95;
      frontMat.clearcoatRoughness = 0.08;

      sideMat.color.set("#c46f5c");
      sideMat.metalness = 0.9;
      sideMat.roughness = 0.24;
      sideMat.clearcoat = 0.6;
    } else if (preset === "obsidian") {
      // Dark Titanium / Obsidian with Gold Glow
      frontMat.color.set("#ffd166");
      frontMat.metalness = 0.96;
      frontMat.roughness = 0.1;
      frontMat.clearcoat = 1.0;

      sideMat.color.set("#1e293b");
      sideMat.metalness = 0.75;
      sideMat.roughness = 0.25;
      sideMat.clearcoat = 0.8;
    }
  }, [preset]);

  // Main 3D Canvas Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 6.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3;
    controls.maxDistance = 14;
    controls.autoRotate = false;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.2);
    mainLight.position.set(6, 9, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xdbeafe, 2.2);
    rimLight.position.set(-6, -4, -6);
    scene.add(rimLight);

    const warmFill = new THREE.PointLight(0xffedd5, 1.8, 25);
    warmFill.position.set(-4, 3, 5);
    scene.add(warmFill);

    // Floor Soft Shadow
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext("2d");
    if (fCtx) {
      const grad = fCtx.createRadialGradient(256, 256, 20, 256, 256, 240);
      grad.addColorStop(0, "rgba(30, 45, 40, 0.45)");
      grad.addColorStop(0.4, "rgba(30, 45, 40, 0.2)");
      grad.addColorStop(1, "rgba(30, 45, 40, 0)");
      fCtx.fillStyle = grad;
      fCtx.fillRect(0, 0, 512, 512);
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 6),
      new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, depthWrite: false })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.set(0, -1.8, 0);
    scene.add(floorShadow);

    // Master 3D Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    orbitGroupRef.current = masterGroup;

    // Load Font & Create Separate 3D Letters for "Piwva"
    loadPiwvaFont().then((font) => {
      const result = createSeparate3DLetters("Piwva", font, {
        size: 1.15,
        depth: 0.38,
        letterSpacing: 0.16,
        bevelThickness: 0.045,
        bevelSize: 0.026,
        bevelSegments: 8,
        curveSegments: 16,
        frontColor: 0xdfb782,
        sideColor: 0xb88a4e,
        metalness: 0.96,
        roughness: 0.12,
        clearcoat: 1.0,
      });

      frontMatRef.current = result.frontMat;
      sideMatRef.current = result.sideMat;
      lettersRef.current = result.letterDataList;
      masterGroup.add(result.group);
    });

    // Floating Orbit Rings (Delicate Luxury Accents around separate letters)
    const ringGeom = new THREE.TorusGeometry(3.0, 0.014, 16, 100);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfb782,
      metalness: 0.95,
      roughness: 0.1,
      clearcoat: 1.0,
    });
    const ringMesh1 = new THREE.Mesh(ringGeom, ringMat);
    ringMesh1.rotation.x = Math.PI / 3.2;
    ringMesh1.rotation.y = Math.PI / 6;
    masterGroup.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.35, 0.012, 16, 100),
      ringMat
    );
    ringMesh2.rotation.x = -Math.PI / 3.8;
    ringMesh2.rotation.y = -Math.PI / 4.5;
    masterGroup.add(ringMesh2);

    // Ambient Floating Gold Particles
    const particleCount = 60;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 5;
      positions[i + 2] = (Math.random() - 0.5) * 5;
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf6d365,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeom, particleMat);
    masterGroup.add(particlePoints);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      controls.update();

      // Auto-spin if enabled
      if (isAutoSpin) {
        masterGroup.rotation.y += delta * 0.4;
        masterGroup.rotation.x = Math.sin(time * 0.7) * 0.1;
      }

      // Individual Separate 3D Letter Staggered Floating Waves
      lettersRef.current.forEach((letter) => {
        letter.mesh.position.y = letter.baseY + Math.sin(time * 2.2 + letter.phase) * 0.08;
        letter.mesh.rotation.x = Math.sin(time * 1.8 + letter.phase) * 0.06;
        letter.mesh.rotation.z = Math.cos(time * 1.5 + letter.phase) * 0.04;
      });

      // Orbit rings rotation
      ringMesh1.rotation.z += delta * 0.2;
      ringMesh2.rotation.z -= delta * 0.15;

      // Particle subtle shimmer
      particlePoints.rotation.y += delta * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isAutoSpin]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Control Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="pointer-events-auto flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 shadow-lg">
          <Type className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase">
            Separate 3D "Piwva" Letters
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="pointer-events-auto p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white text-slate-700 dark:text-slate-200 backdrop-blur-md border border-white/60 shadow-lg transition-all hover:scale-105"
            title="Close 3D Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Material Presets Selector & Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 pointer-events-none z-10">
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 shadow-2xl">
          <button
            onClick={() => setPreset("gold")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              preset === "gold"
                ? "bg-amber-100 text-amber-900 ring-2 ring-amber-400/60 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300" />
            <span>3D Gold</span>
          </button>

          <button
            onClick={() => setPreset("chrome")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              preset === "chrome"
                ? "bg-slate-200 text-slate-900 ring-2 ring-slate-400/60 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-slate-500 to-slate-200" />
            <span>3D Chrome</span>
          </button>

          <button
            onClick={() => setPreset("rosegold")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              preset === "rosegold"
                ? "bg-rose-100 text-rose-900 ring-2 ring-rose-400/60 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-rose-500 to-orange-200" />
            <span>3D Rose Gold</span>
          </button>

          <button
            onClick={() => setPreset("obsidian")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              preset === "obsidian"
                ? "bg-slate-800 text-amber-400 ring-2 ring-amber-500/60 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-black to-amber-500" />
            <span>Obsidian Noir</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            onClick={() => setIsAutoSpin((prev) => !prev)}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              isAutoSpin
                ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Toggle 360 Auto-Spin"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoSpin ? "animate-spin" : ""}`} />
          </button>
        </div>

        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-3 py-0.5 rounded-full shadow-sm">
          🖱 Drag to rotate in 3D • Scroll to zoom
        </p>
      </div>
    </div>
  );
};
