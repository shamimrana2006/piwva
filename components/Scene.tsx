"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  loadPiwvaFont,
  create3DTextMesh,
  createSeparate3DLetters,
  SeparateLetterData,
  generateLogoMaps,
  TextColorTheme,
  TEXT_COLOR_THEMES,
} from "./create3DText";
import { LayoutCoords, CameraState } from "./LayoutInspectorModal";
import { soundFX } from "../utils/soundEffects";

interface SceneProps {
  isAutoRotate: boolean;
  isScattered: boolean;
  lightingTheme: "studio" | "warm" | "cool";
  bgTheme?: "dark-starry" | "light-soft" | "warm-nebula";
  textColorTheme?: TextColorTheme;
  resetTrigger: number;
  zoomTrigger?: number;
  replayIntroTrigger?: number;
  isMuted?: boolean;
  onVideoAudioBlocked?: (isBlocked: boolean) => void;
  onLayoutChange?: (
    layout: LayoutCoords,
    activeDraggedId?: string | null,
    cameraState?: CameraState
  ) => void;
  onCtrlChange?: (isHeld: boolean) => void;
  onSpaceChange?: (isHeld: boolean) => void;
}

interface DraggableObjectData {
  id: string;
  name: string;
  mesh: THREE.Group;
  initialPos: THREE.Vector3;
  initialRot: THREE.Euler;
  scatterOffset: THREE.Vector3;
  targetPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  basePos: THREE.Vector3;
  floatSpeed: number;
  floatAmp: number;
  rotFloatAmp: number;
  phase: number;
  isHovered: boolean;
}

// Helper to create rounded beveled boxes
function createRoundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
  smoothness: number = 8
) {
  const shape = new THREE.Shape();
  const eps = 0.00001;
  const r = Math.min(radius, width / 2 - eps, height / 2 - eps);
  const w = width / 2;
  const h = height / 2;

  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(w, h - r);
  shape.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-w + r, h);
  shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w, -h + r);
  shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);

  const bevel = Math.min(0.015, depth * 0.15, r * 0.15);
  const extrudeDepth = Math.max(0.01, depth - bevel * 2);

  const extrudeSettings = {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelSegments: smoothness,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: smoothness,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

// Helper to create rounded 2D planes with exact matching UVs
function createRoundedPlaneGeometry(
  width: number,
  height: number,
  radius: number,
  smoothness: number = 16
): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  const eps = 0.00001;
  const r = Math.min(radius, width / 2 - eps, height / 2 - eps);
  const w = width / 2;
  const h = height / 2;

  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(w, h - r);
  shape.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-w + r, h);
  shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w, -h + r);
  shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);

  const geom = new THREE.ShapeGeometry(shape, smoothness);

  const pos = geom.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uvs[i * 2] = (x + w) / width;
    uvs[i * 2 + 1] = (y + h) / height;
  }
  geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return geom;
}

const BENGALI_FONT = "'Hind Siliguri', 'Noto Sans Bengali', 'Plus Jakarta Sans', sans-serif";

export const Scene: React.FC<SceneProps> = ({
  isAutoRotate,
  isScattered,
  lightingTheme,
  bgTheme = "dark-starry",
  textColorTheme = "gold",
  resetTrigger,
  zoomTrigger,
  replayIntroTrigger,
  isMuted = false,
  onVideoAudioBlocked,
  onLayoutChange,
  onCtrlChange,
  onSpaceChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableObjects = useRef<DraggableObjectData[]>([]);
  const activeDragged = useRef<DraggableObjectData | null>(null);
  const isDraggingAny = useRef(false);
  const isCtrlHeldRef = useRef(false);
  const isSpaceHeldRef = useRef(false);
  const isPanningArtboardRef = useRef(false);
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Intro Animation Tracking
  const isIntroActiveRef = useRef(true);
  const introTimeRef = useRef(0);

  // Material refs
  const textFrontMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const textSideMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const textRingMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const particleMatRef = useRef<THREE.PointsMaterial | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // State refs
  const isAutoRotateRef = useRef(isAutoRotate);
  isAutoRotateRef.current = isAutoRotate;

  const isScatteredRef = useRef(isScattered);
  isScatteredRef.current = isScattered;

  const lightingThemeRef = useRef(lightingTheme);
  lightingThemeRef.current = lightingTheme;

  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);

  // Mute / Unmute SoundFX and Video Audio
  useEffect(() => {
    soundFX.setMuted(isMuted);
    if (introAudioRef.current) {
      introAudioRef.current.muted = isMuted;
      introAudioRef.current.volume = isMuted ? 0 : 1.0;
    }
  }, [isMuted]);

  // Update Background Theme Color
  useEffect(() => {
    if (!sceneRef.current) return;
    if (bgTheme === "dark-starry") {
      sceneRef.current.background = new THREE.Color("#0c1517");
    } else if (bgTheme === "warm-nebula") {
      sceneRef.current.background = new THREE.Color("#181412");
    } else {
      sceneRef.current.background = new THREE.Color("#c5d5d3");
    }
  }, [bgTheme]);

  // Handle Replay Intro Animation Trigger
  useEffect(() => {
    if (replayIntroTrigger !== undefined && replayIntroTrigger > 0) {
      isIntroActiveRef.current = true;
      introTimeRef.current = 0;
      soundFX.playWhoosh();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      if (introAudioRef.current) {
        introAudioRef.current.currentTime = 0;
        introAudioRef.current.muted = isMuted;
        introAudioRef.current.volume = isMuted ? 0 : 1.0;
        if (!isMuted) {
          introAudioRef.current.play().catch(() => {});
        }
      }
    }
  }, [replayIntroTrigger, isMuted]);

  // Update 3D Text colors dynamically
  useEffect(() => {
    const themeDef = TEXT_COLOR_THEMES[textColorTheme] || TEXT_COLOR_THEMES.gold;
    if (textFrontMatRef.current) {
      textFrontMatRef.current.color.set(themeDef.frontColor);
      textFrontMatRef.current.metalness = themeDef.metalness;
      textFrontMatRef.current.roughness = themeDef.roughness;
      textFrontMatRef.current.clearcoat = themeDef.clearcoat;
    }
    if (textSideMatRef.current) {
      textSideMatRef.current.color.set(themeDef.sideColor);
      textSideMatRef.current.metalness = Math.max(0.7, themeDef.metalness - 0.03);
      textSideMatRef.current.roughness = Math.min(0.3, themeDef.roughness + 0.08);
      textSideMatRef.current.clearcoat = themeDef.clearcoat * 0.7;
    }
    if (textRingMatRef.current) {
      textRingMatRef.current.color.set(themeDef.ringColor);
    }
    if (particleMatRef.current) {
      particleMatRef.current.color.set(themeDef.particleColor);
    }
  }, [textColorTheme]);

  // Update Scatter positions
  useEffect(() => {
    draggableObjects.current.forEach((obj) => {
      if (isScattered) {
        obj.targetPos.set(
          obj.initialPos.x + obj.scatterOffset.x,
          obj.initialPos.y + obj.scatterOffset.y,
          obj.initialPos.z + obj.scatterOffset.z
        );
      } else {
        obj.targetPos.copy(obj.basePos);
      }
    });
    soundFX.playPop(440);
  }, [isScattered]);

  // Handle Zoom Trigger
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (zoomTrigger === undefined || zoomTrigger === 0) return;

    const factor = zoomTrigger > 0 ? 0.88 : 1.15;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    const newDist = Math.max(7, Math.min(42, dir.length() * factor));
    dir.setLength(newDist);
    camera.position.copy(controls.target).add(dir);
    controls.update();
    soundFX.playChime(660, 0.25);
  }, [zoomTrigger]);

  // Handle Reset Trigger
  useEffect(() => {
    if (resetTrigger > 0) {
      draggableObjects.current.forEach((obj) => {
        obj.basePos.copy(obj.initialPos);
        obj.targetPos.copy(obj.initialPos);
      });
      if (controlsRef.current && cameraRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        cameraRef.current.position.set(18.62, 9.99, 16.72);
        controlsRef.current.update();
      }
      soundFX.playWhoosh();
    }
  }, [resetTrigger]);

  // Update Lighting Moods
  useEffect(() => {
    if (!ambientLightRef.current || !keyLightRef.current || !fillLightRef.current) return;

    if (lightingTheme === "warm") {
      ambientLightRef.current.color.set("#fffaf0");
      ambientLightRef.current.intensity = 0.95;
      keyLightRef.current.color.set("#ffe8d6");
      keyLightRef.current.intensity = 2.0;
      fillLightRef.current.color.set("#faedcd");
    } else if (lightingTheme === "cool") {
      ambientLightRef.current.color.set("#f0fdf4");
      ambientLightRef.current.intensity = 0.85;
      keyLightRef.current.color.set("#e0f2fe");
      keyLightRef.current.intensity = 1.7;
      fillLightRef.current.color.set("#bae6fd");
    } else {
      ambientLightRef.current.color.set("#ffffff");
      ambientLightRef.current.intensity = 0.9;
      keyLightRef.current.color.set("#ffffff");
      keyLightRef.current.intensity = 1.8;
      fillLightRef.current.color.set("#e2e8f0");
    }
  }, [lightingTheme]);

  // Main Three.js Scene Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgTheme === "dark-starry" ? "#0c1517" : bgTheme === "warm-nebula" ? "#181412" : "#c5d5d3");
    sceneRef.current = scene;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    // START CAMERA POSITION: Exact User Intro Zoom Coordinates
    camera.position.set(-4.42, 6.07, 9.11);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 7;
    controls.maxDistance = 45;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.target.set(-5.24, 2.97, -0.07); // Exact user intro target
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.enableZoom = false; // Zoom via Ctrl + wheel
    controlsRef.current = controls;

    // Start whoosh audio
    setTimeout(() => soundFX.playWhoosh(), 200);

    // =========================================================================
    // ANIMATED 3D STARFIELD & COSMIC NEBULA DUST SYSTEM
    // =========================================================================
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 110;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 180;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 15;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.3,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Floating Cosmic Dust Particles
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 350;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 60;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xdfb782,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(10, 16, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.7);
    fillLight.position.set(-10, 8, 8);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0xcbd5e1, 0.4);
    rimLight.position.set(0, -10, -10);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Contact Shadow
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(256, 256, 10, 256, 256, 240);
      grad.addColorStop(0, "rgba(35, 55, 50, 0.38)");
      grad.addColorStop(0.35, "rgba(35, 55, 50, 0.22)");
      grad.addColorStop(0.7, "rgba(35, 55, 50, 0.08)");
      grad.addColorStop(1, "rgba(35, 55, 50, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 512, 512);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0.3, -3.8, 0);
    scene.add(shadowPlane);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    draggableObjects.current = [];

    const registerDraggable = (
      group: THREE.Group,
      initialPos: [number, number, number],
      initialRot: [number, number, number],
      scatterOffset: [number, number, number],
      floatSpeed = 1.3,
      floatAmp = 0.08,
      rotFloatAmp = 0.03,
      id = "",
      name = ""
    ) => {
      const data: DraggableObjectData = {
        id,
        name,
        mesh: group,
        initialPos: new THREE.Vector3(...initialPos),
        initialRot: new THREE.Euler(...initialRot),
        scatterOffset: new THREE.Vector3(...scatterOffset),
        targetPos: new THREE.Vector3(...initialPos),
        currentPos: new THREE.Vector3(...initialPos),
        basePos: new THREE.Vector3(...initialPos),
        floatSpeed,
        floatAmp,
        rotFloatAmp,
        phase: Math.random() * Math.PI * 2,
        isHovered: false,
      };

      group.position.copy(data.currentPos);
      group.rotation.copy(data.initialRot);
      rootGroup.add(group);
      draggableObjects.current.push(data);
      return data;
    };

    const baseTilt: [number, number, number] = [-0.62, 0.42, 0.4];

    // Shared 3D Emblem Builder
    let sharedLogoMaps: {
      diffuseTex: THREE.CanvasTexture;
      bumpTex: THREE.CanvasTexture;
      normalTex: THREE.CanvasTexture;
      roughTex: THREE.CanvasTexture;
    } | null = null;

    const logoMaterialsToUpdate: THREE.MeshPhysicalMaterial[] = [];

    const create3DEmblemBadge = (
      width: number,
      height: number,
      depth: number,
      radius: number,
      theme: "gold" | "white" | "dark" = "gold",
      textSize = 0.26
    ) => {
      const group = new THREE.Group();

      const baseMesh = new THREE.Mesh(
        createRoundedBoxGeometry(width, height, depth, radius, 6),
        new THREE.MeshPhysicalMaterial({
          color: theme === "dark" ? 0x18181b : theme === "white" ? 0xffffff : 0xfcfdfd,
          roughness: 0.12,
          metalness: theme === "dark" ? 0.2 : 0.05,
          clearcoat: 0.85,
        })
      );
      baseMesh.castShadow = true;
      group.add(baseMesh);

      const rimMesh = new THREE.Mesh(
        createRoundedBoxGeometry(width + 0.03, height + 0.03, depth - 0.015, radius + 0.015, 6),
        new THREE.MeshPhysicalMaterial({
          color: theme === "white" ? 0xe2e8f0 : 0xdfb782,
          metalness: 0.95,
          roughness: 0.12,
          clearcoat: 1.0,
        })
      );
      rimMesh.castShadow = true;
      group.add(rimMesh);

      const logoMat = new THREE.MeshPhysicalMaterial({
        color: theme === "white" ? 0xffffff : 0xe2bf8c,
        metalness: theme === "white" ? 0.85 : 0.92,
        roughness: 0.14,
        clearcoat: 1.0,
        bumpScale: 0.045,
        transparent: true,
        opacity: 0.25,
      });

      if (sharedLogoMaps) {
        logoMat.map = sharedLogoMaps.diffuseTex;
        logoMat.bumpMap = sharedLogoMaps.bumpTex;
        logoMat.normalMap = sharedLogoMaps.normalTex;
        logoMat.roughnessMap = sharedLogoMaps.roughTex;
      }
      logoMaterialsToUpdate.push(logoMat);

      const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.06, height - 0.06, 32, 16), logoMat);
      logoPlane.position.set(0, 0, depth / 2 + 0.003);
      group.add(logoPlane);

      loadPiwvaFont().then((font) => {
        const text3D = create3DTextMesh("Piwva", font, {
          size: textSize,
          depth: Math.max(0.04, textSize * 0.35),
          bevelThickness: Math.max(0.008, textSize * 0.08),
          bevelSize: Math.max(0.005, textSize * 0.05),
          bevelSegments: 6,
          curveSegments: 12,
          frontColor: theme === "white" ? 0xffffff : 0xdfb782,
          sideColor: theme === "white" ? 0xd1d5db : 0xc49b64,
          metalness: theme === "white" ? 0.88 : 0.95,
          roughness: 0.12,
          clearcoat: 1.0,
        });
        text3D.mesh.position.set(0, -textSize * 0.05, depth / 2 + (textSize * 0.35) / 2 + 0.015);
        group.add(text3D.mesh);
      });

      return { group, logoMat };
    };

    const bLogoImg = new Image();
    bLogoImg.src = "/logo/piwva-logo-transparent.png";
    bLogoImg.onload = () => {
      const maps = generateLogoMaps(bLogoImg);
      if (maps) {
        sharedLogoMaps = maps;
        logoMaterialsToUpdate.forEach((mat) => {
          mat.map = maps.diffuseTex;
          mat.bumpMap = maps.bumpTex;
          mat.normalMap = maps.normalTex;
          mat.roughnessMap = maps.roughTex;
          mat.needsUpdate = true;
        });
      }
    };

    // =========================================================================
    // HELPER: 3D PHOTO CARD GENERATOR (WITH BENGALI TEXT)
    // =========================================================================
    const create3DPhotoCard = (
      imageSrc: string,
      titleBengali: string,
      badgeBengali: string,
      subTextBengali: string,
      badgeBg = "#dcfce7",
      badgeColor = "#15803d",
      width = 3.6,
      height = 3.8,
      depth = 0.09
    ) => {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(
        createRoundedBoxGeometry(width, height, depth, 0.22, 6),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.16, clearcoat: 0.35 })
      );
      mesh.castShadow = true;
      group.add(mesh);

      const badge = create3DEmblemBadge(1.05, 0.38, 0.05, 0.1, "gold");
      badge.group.position.set(-width / 2 + 0.72, height / 2 - 0.32, depth / 2 + 0.03);
      group.add(badge.group);

      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;

      const img = new Image();
      img.src = imageSrc;

      const renderCard = () => {
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1024, 1080);

        const pad = 40;
        const imgW = 1024 - pad * 2;
        const imgH = 680;

        ctx.fillStyle = badgeBg;
        ctx.beginPath();
        ctx.roundRect(1024 - pad - 390, pad + 10, 380, 52, 26);
        ctx.fill();
        ctx.fillStyle = badgeColor;
        ctx.font = `bold 22px ${BENGALI_FONT}`;
        ctx.textAlign = "center";
        ctx.fillText(badgeBengali, 1024 - pad - 200, pad + 44);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(pad, pad + 75, imgW, imgH, 28);
        ctx.clip();
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, pad, pad + 75, imgW, imgH);
        } else {
          ctx.fillStyle = "#faebd7";
          ctx.fillRect(pad, pad + 75, imgW, imgH);
        }
        const pGrad = ctx.createLinearGradient(pad, pad + 500, pad, pad + 75 + imgH);
        pGrad.addColorStop(0, "rgba(0,0,0,0)");
        pGrad.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = pGrad;
        ctx.fillRect(pad, pad + 75, imgW, imgH);
        ctx.restore();

        ctx.fillStyle = "#1e293b";
        ctx.font = `bold 44px ${BENGALI_FONT}`;
        ctx.textAlign = "left";
        ctx.fillText(titleBengali, pad + 10, pad + imgH + 145);

        ctx.fillStyle = "#64748b";
        ctx.font = `500 25px ${BENGALI_FONT}`;
        ctx.fillText(subTextBengali, pad + 10, pad + imgH + 195);

        ctx.fillStyle = "#15803d";
        ctx.font = `bold 22px ${BENGALI_FONT}`;
        ctx.fillText("✓ শিশু বিশেষজ্ঞদের সুপারিশকৃত • নিরাপদ মানদণ্ড", pad + 10, pad + imgH + 250);

        tex.needsUpdate = true;
      };

      img.addEventListener("load", renderCard);
      renderCard();

      const face = new THREE.Mesh(
        createRoundedPlaneGeometry(width - 0.02, height - 0.02, 0.21, 16),
        new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
      );
      face.position.set(0, 0, depth / 2 + 0.008);
      group.add(face);

      return group;
    };

    // =========================================================================
    // HELPER: 3D HEALTH TIPS CARD GENERATOR (BENGALI)
    // =========================================================================
    const create3DHealthCard = (
      titleBengali: string,
      categoryBadgeBengali: string,
      bulletsBengali: string[],
      accentColor = "#15803d",
      accentBg = "#dcfce7",
      width = 3.6,
      height = 3.4,
      depth = 0.09
    ) => {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(
        createRoundedBoxGeometry(width, height, depth, 0.22, 6),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, clearcoat: 0.35 })
      );
      mesh.castShadow = true;
      group.add(mesh);

      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 980;
      const ctx = canvas.getContext("2d");
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;

      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1024, 980);
        const pad = 45;

        ctx.fillStyle = accentBg;
        ctx.beginPath();
        ctx.roundRect(pad, pad, 420, 52, 26);
        ctx.fill();
        ctx.fillStyle = accentColor;
        ctx.font = `bold 22px ${BENGALI_FONT}`;
        ctx.textAlign = "center";
        ctx.fillText(categoryBadgeBengali, pad + 210, pad + 35);

        ctx.fillStyle = "#1e293b";
        ctx.font = `bold 44px ${BENGALI_FONT}`;
        ctx.textAlign = "left";
        ctx.fillText(titleBengali, pad, pad + 120);

        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(pad, pad + 155, 1024 - pad * 2, 3);

        const startY = pad + 215;
        bulletsBengali.forEach((b, idx) => {
          const y = startY + idx * 110;

          ctx.fillStyle = accentBg;
          ctx.beginPath();
          ctx.arc(pad + 25, y + 10, 22, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = accentColor;
          ctx.font = `bold 20px ${BENGALI_FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText((idx + 1).toString(), pad + 25, y + 10);

          ctx.fillStyle = "#334155";
          ctx.font = `bold 26px ${BENGALI_FONT}`;
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(b.split(":")[0], pad + 65, y + 10);

          if (b.includes(":")) {
            ctx.fillStyle = "#64748b";
            ctx.font = `500 23px ${BENGALI_FONT}`;
            ctx.fillText(b.split(":")[1].trim(), pad + 65, y + 44, 1024 - pad * 2 - 70);
          }
        });

        const botY = 890;
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.roundRect(pad, botY, 1024 - pad * 2, 52, 26);
        ctx.fill();
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.font = `bold 20px ${BENGALI_FONT}`;
        ctx.textAlign = "center";
        ctx.fillText("✓ শিশু বিশেষজ্ঞদের অনুমোদিত বৈজ্ঞানিক গাইডলাইন", 512, botY + 34);
      }

      tex.needsUpdate = true;
      const face = new THREE.Mesh(
        createRoundedPlaneGeometry(width - 0.02, height - 0.02, 0.21, 16),
        new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
      );
      face.position.set(0, 0, depth / 2 + 0.008);
      group.add(face);

      return group;
    };

    // Cylindrical Medallion
    const create3DCylinderMedallion = (icon: string, titleBengali: string, subtitleBengali: string, sub2Bengali: string, goldBorder = true, rad = 0.85) => {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rad, rad, 0.08, 32),
        new THREE.MeshPhysicalMaterial({ color: 0xdfb782, metalness: 0.95, roughness: 0.12, clearcoat: 1.0 })
      );
      mesh.rotation.x = Math.PI / 2;
      group.add(mesh);

      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(256, 256, 240, 0, Math.PI * 2);
        ctx.fill();
        if (goldBorder) {
          ctx.strokeStyle = "#dfb782";
          ctx.lineWidth = 14;
          ctx.stroke();
        }
        ctx.fillStyle = "#15803d";
        ctx.font = "bold 80px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(icon, 256, 150);

        ctx.fillStyle = "#1e293b";
        ctx.font = `bold 32px ${BENGALI_FONT}`;
        ctx.fillText(titleBengali, 256, 255);

        ctx.fillStyle = "#0284c7";
        ctx.font = `bold 24px ${BENGALI_FONT}`;
        ctx.fillText(subtitleBengali, 256, 310);

        ctx.fillStyle = "#64748b";
        ctx.font = `500 20px ${BENGALI_FONT}`;
        ctx.fillText(sub2Bengali, 256, 360);
      }
      const tex = new THREE.CanvasTexture(canvas);
      const face = new THREE.Mesh(new THREE.CircleGeometry(rad - 0.04, 32), new THREE.MeshBasicMaterial({ map: tex }));
      face.position.set(0, 0, 0.048);
      group.add(face);
      return group;
    };

    // Crescent Moon Mobile
    const create3DMoonMobile = () => {
      const group = new THREE.Group();
      const moonMesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.22, 24, 64, Math.PI * 1.25),
        new THREE.MeshPhysicalMaterial({ color: 0xdfb782, metalness: 0.9, roughness: 0.15, clearcoat: 1.0 })
      );
      moonMesh.rotation.z = -Math.PI / 4;
      group.add(moonMesh);

      [-0.6, 0, 0.6].forEach((sx, idx) => {
        const star = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.24, 0.05, 5),
          new THREE.MeshPhysicalMaterial({ color: idx === 1 ? 0xfef08a : 0xfaedcd, metalness: 0.8 })
        );
        star.rotation.x = Math.PI / 2;
        star.position.set(sx, -1.2 - (idx % 2) * 0.3, 0);
        group.add(star);
      });
      return group;
    };

    // Ring Stacker
    const create3DRingStacker = () => {
      const group = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.25, 32), new THREE.MeshPhysicalMaterial({ color: 0xdfb782, roughness: 0.3 }));
      group.add(base);

      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 24), new THREE.MeshPhysicalMaterial({ color: 0xc49b64, roughness: 0.3 }));
      peg.position.y = 0.9;
      group.add(peg);

      const ringCols = [0x78866b, 0xccd5ae, 0xf4a261, 0xfaedcd, 0xe76f51];
      const ringSizes = [0.75, 0.65, 0.55, 0.45, 0.35];
      ringSizes.forEach((rad, i) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(rad, 0.12, 20, 48),
          new THREE.MeshPhysicalMaterial({ color: ringCols[i], roughness: 0.25, clearcoat: 0.4 })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.25 + i * 0.28;
        group.add(ring);
      });

      const topSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), new THREE.MeshPhysicalMaterial({ color: 0xdfb782, metalness: 0.85 }));
      topSphere.position.y = 0.25 + ringSizes.length * 0.28 + 0.12;
      group.add(topSphere);
      return group;
    };

    // Silicone Chain
    const create3DSiliconeChain = () => {
      const group = new THREE.Group();
      const beadCols = [0xdfb782, 0xccd5ae, 0xf4a261, 0xfaedcd, 0x78866b, 0xdfb782];
      beadCols.forEach((c, idx) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.3 }));
        b.position.set((idx - 2.5) * 0.45, Math.sin(idx * 0.8) * 0.2, 0);
        group.add(b);
      });
      return group;
    };

    // Cloud Mobile
    const create3DCloudMobile = () => {
      const group = new THREE.Group();
      const cloudMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, clearcoat: 0.6 });
      const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), cloudMat);
      const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24), cloudMat);
      c2.position.set(-0.6, -0.15, 0);
      const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), cloudMat);
      c3.position.set(0.6, -0.1, 0);
      group.add(c1, c2, c3);
      return group;
    };

    // =========================================================================
    // STAGE 0: TOP HERO (Y: +4 to -2) - [8 Elements]
    // =========================================================================

    // 1. Phone with Bengali UI
    const phoneGroup = new THREE.Group();
    const phoneMesh = new THREE.Mesh(
      createRoundedBoxGeometry(3.6, 7.4, 0.34, 0.45, 8),
      new THREE.MeshPhysicalMaterial({ color: 0xfcfdfd, roughness: 0.18, metalness: 0.1, clearcoat: 0.3 })
    );
    phoneGroup.add(phoneMesh);
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1024;
    screenCanvas.height = 2048;
    const sContext = screenCanvas.getContext("2d");
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    const babyImg = new Image();
    babyImg.src = "/images/baby_hero.jpg";
    const renderScreenUI = () => {
      if (!sContext) return;
      sContext.fillStyle = "#f8f5f0";
      sContext.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

      sContext.fillStyle = "#2d3748";
      sContext.font = `bold 28px ${BENGALI_FONT}`;
      sContext.fillText("৯:৪১", 60, 60);

      sContext.font = `bold 42px ${BENGALI_FONT}`;
      sContext.textAlign = "left";
      sContext.fillText("Piwva • শিশুর স্বাস্থ্য ও যত্ন", 60, 140);

      const bX = 40, bY = 180, bW = 944, bH = 680;
      sContext.save();
      sContext.beginPath();
      sContext.roundRect(bX, bY, bW, bH, 40);
      sContext.clip();
      if (babyImg.complete && babyImg.naturalWidth > 0) {
        sContext.drawImage(babyImg, bX, bY, bW, bH);
      } else {
        sContext.fillStyle = "#78866b";
        sContext.fillRect(bX, bY, bW, bH);
      }
      const grad = sContext.createLinearGradient(bX, bY + 200, bX, bY + bH);
      grad.addColorStop(0, "rgba(20, 35, 30, 0.1)");
      grad.addColorStop(1, "rgba(20, 35, 30, 0.9)");
      sContext.fillStyle = grad;
      sContext.fillRect(bX, bY, bW, bH);

      sContext.fillStyle = "#e9d8a6";
      sContext.beginPath();
      sContext.roundRect(bX + 40, bY + bH - 220, 360, 48, 24);
      sContext.fill();
      sContext.fillStyle = "#5c4018";
      sContext.font = `bold 22px ${BENGALI_FONT}`;
      sContext.textAlign = "center";
      sContext.fillText("🩺 শিশু বিশেষজ্ঞদের স্বাস্থ্য টিপস", bX + 220, bY + bH - 188);

      sContext.fillStyle = "#ffffff";
      sContext.font = `bold 46px ${BENGALI_FONT}`;
      sContext.textAlign = "left";
      sContext.fillText("নবজাতকের স্বাস্থ্য ও যত্ন নির্দেশিকা", bX + 40, bY + bH - 120);
      sContext.fillStyle = "#e2e8f0";
      sContext.font = `500 26px ${BENGALI_FONT}`;
      sContext.fillText("নিরাপদ ঘুম, টামি টাইম ও কলিক উপশমের সঠিক নিয়ম", bX + 40, bY + bH - 68);
      sContext.restore();

      const cats = ["😴 নিরাপদ ঘুম", "🍼 কলিক উপশম", "🌿 কোমল ত্বক", "🧸 টামি টাইম"];
      let cX = 40;
      cats.forEach((cat) => {
        const cW = 220;
        sContext.fillStyle = "#ffffff";
        sContext.beginPath();
        sContext.roundRect(cX, 890, cW, 60, 30);
        sContext.fill();
        sContext.strokeStyle = "#e2e8f0";
        sContext.lineWidth = 2;
        sContext.stroke();
        sContext.fillStyle = "#2d3748";
        sContext.font = `bold 22px ${BENGALI_FONT}`;
        sContext.textAlign = "center";
        sContext.fillText(cat, cX + cW / 2, 930);
        cX += cW + 16;
      });

      const drawTipCard = (x: number, y: number, w: number, h: number, icon: string, title: string, sub: string, bullets: string[], badge: string, bg: string, col: string) => {
        sContext.save();
        sContext.fillStyle = "#ffffff";
        sContext.beginPath();
        sContext.roundRect(x, y, w, h, 30);
        sContext.fill();
        sContext.strokeStyle = "#e9ecef";
        sContext.lineWidth = 2;
        sContext.stroke();

        sContext.fillStyle = bg;
        sContext.beginPath();
        sContext.roundRect(x + 24, y + 24, w - 48, 46, 23);
        sContext.fill();
        sContext.fillStyle = col;
        sContext.font = `bold 20px ${BENGALI_FONT}`;
        sContext.textAlign = "center";
        sContext.fillText(badge, x + w / 2, y + 55);

        sContext.fillStyle = "#2d3748";
        sContext.font = "38px sans-serif";
        sContext.textAlign = "left";
        sContext.fillText(icon, x + 24, y + 130);
        sContext.font = `bold 30px ${BENGALI_FONT}`;
        sContext.fillText(title, x + 80, y + 125);

        sContext.fillStyle = "#64748b";
        sContext.font = `500 22px ${BENGALI_FONT}`;
        sContext.fillText(sub, x + 24, y + 172);

        sContext.fillStyle = "#edf2f7";
        sContext.fillRect(x + 24, y + 195, w - 48, 2);

        sContext.fillStyle = "#334155";
        sContext.font = `500 22px ${BENGALI_FONT}`;
        bullets.forEach((bullet, idx) => {
          sContext.fillText(bullet, x + 24, y + 240 + idx * 46);
        });
        sContext.restore();
      };

      drawTipCard(40, 1070, 445, 680, "😴", "নিরাপদ ঘুম", "সিডস প্রতিরোধ গাইড", [
        "• সবসময় চিত করে শোয়ান",
        "• শক্ত ও সমতল তোষক ব্যবহার",
        "• তাপমাত্রা ২০–২২°C রাখুন",
        "• আলগা বালিশ বা কম্বল বর্জন",
        "• প্রথম ৬ মাস রুম শেয়ারিং",
      ], "✓ নিরাপদ ঘুম প্রোটোকল", "#dcfce7", "#15803d");

      drawTipCard(539, 1070, 445, 680, "🧸", "টামি টাইম", "শারীরিক বিকাশ", [
        "• শুরুতে দিনে ২–৩ মিনিট করান",
        "• ঘাড় ও মেরুদণ্ডের শক্তি বাড়ে",
        "• মাথার পেছনের চ্যাপ্টা হওয়া রোধ",
        "• ঘুম থেকে ওঠার পর অভ্যাস",
        "• ধীরে ধীরে ১৫–২০ মিনিট করুন",
      ], "✓ মোটর ডেভেলপমেন্ট", "#fef3c7", "#92400e");

      screenTex.needsUpdate = true;
    };
    babyImg.addEventListener("load", renderScreenUI);
    renderScreenUI();

    const screenPlane = new THREE.Mesh(createRoundedPlaneGeometry(3.36, 7.16, 0.38, 16), new THREE.MeshBasicMaterial({ map: screenTex }));
    screenPlane.position.set(0, 0, 0.175);
    phoneGroup.add(screenPlane);
    registerDraggable(phoneGroup, [-8.54, -0.1, 4.48], baseTilt, [0, 0, -1.0], 1.0, 0.04, 0.015, "phone", "Smartphone 3D Mockup");

    // 2. 3D Piwva Letters
    const piwvaTextGroup = new THREE.Group();
    let separateLettersList: SeparateLetterData[] = [];
    const activeColorDef = TEXT_COLOR_THEMES[textColorTheme] || TEXT_COLOR_THEMES.gold;
    loadPiwvaFont().then((font) => {
      const res = createSeparate3DLetters("Piwva", font, {
        size: 0.92,
        depth: 0.32,
        letterSpacing: 0.15,
        bevelThickness: 0.04,
        bevelSize: 0.022,
        frontColor: activeColorDef.frontColor,
        sideColor: activeColorDef.sideColor,
      });
      separateLettersList = res.letterDataList;
      textFrontMatRef.current = res.frontMat;
      textSideMatRef.current = res.sideMat;
      piwvaTextGroup.add(res.group);
    });
    const textRing = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.012, 16, 80), new THREE.MeshPhysicalMaterial({ color: activeColorDef.ringColor, metalness: 0.95 }));
    textRing.rotation.x = Math.PI / 3.2;
    piwvaTextGroup.add(textRing);
    const piwvaHitbox = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.8, 1.0), new THREE.MeshBasicMaterial({ visible: false }));
    piwvaTextGroup.add(piwvaHitbox);
    registerDraggable(piwvaTextGroup, [0.15, 1.23, 1.98], [-0.55, 0.38, 0.35], [1.6, 2.2, 1.5], 1.7, 0.07, 0.025, "piwva_logo", "Piwva 3D Logo Letters");

    // 3. User Designed Circular Logo JPEG Medallion
    const designedLogoGroup = new THREE.Group();
    const logoJpgMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.25, 0.12, 48),
      new THREE.MeshPhysicalMaterial({ color: 0xdfb782, metalness: 0.95, roughness: 0.12, clearcoat: 1.0 })
    );
    logoJpgMesh.rotation.x = Math.PI / 2;
    designedLogoGroup.add(logoJpgMesh);

    const logoJpgCanvas = document.createElement("canvas");
    logoJpgCanvas.width = 512;
    logoJpgCanvas.height = 512;
    const lCtx = logoJpgCanvas.getContext("2d");
    const logoJpgTex = new THREE.CanvasTexture(logoJpgCanvas);
    logoJpgTex.colorSpace = THREE.SRGBColorSpace;
    const designedLogoImg = new Image();
    designedLogoImg.src = "/images/logo/piwva-logo-pp.jpg.jpeg";
    const renderDesignedLogo = () => {
      if (!lCtx) return;
      lCtx.save();
      lCtx.beginPath();
      lCtx.arc(256, 256, 240, 0, Math.PI * 2);
      lCtx.clip();
      if (designedLogoImg.complete && designedLogoImg.naturalWidth > 0) {
        lCtx.drawImage(designedLogoImg, 0, 0, 512, 512);
      } else {
        lCtx.fillStyle = "#dfb782";
        lCtx.fillRect(0, 0, 512, 512);
      }
      lCtx.restore();
      lCtx.strokeStyle = "#dfb782";
      lCtx.lineWidth = 16;
      lCtx.beginPath();
      lCtx.arc(256, 256, 242, 0, Math.PI * 2);
      lCtx.stroke();
      logoJpgTex.needsUpdate = true;
    };
    designedLogoImg.addEventListener("load", renderDesignedLogo);
    renderDesignedLogo();

    const logoJpgFace = new THREE.Mesh(new THREE.CircleGeometry(1.2, 48), new THREE.MeshBasicMaterial({ map: logoJpgTex }));
    logoJpgFace.position.set(0, 0, 0.068);
    designedLogoGroup.add(logoJpgFace);
    registerDraggable(designedLogoGroup, [-0.2, -1.8, 3.8], baseTilt, [0, 1.0, 1.0], 1.4, 0.08, 0.03, "designed_logo_circle", "Piwva Designed Logo Medallion");

    // 4. MP4 Video Screen (ZOOM HERO START ELEMENT)
    const video = document.createElement("video");
    video.src = "/images/logo/short-reals.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.autoplay = true;
    video.muted = true; // Video element is always muted to guarantee 100% visual playback across all browsers
    video.defaultMuted = true;
    video.preload = "auto";
    videoRef.current = video;

    const startVideo = () => {
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    };
    video.addEventListener("canplay", startVideo, { once: true });
    video.load();
    startVideo();

    // Independent Audio Track for the first 2.5 seconds
    const introAudio = new Audio("/images/logo/short-reals.mp4");
    introAudio.preload = "auto";
    introAudio.volume = isMuted ? 0 : 1.0;
    introAudioRef.current = introAudio;

    const playIntroAudio = () => {
      if (!isMuted && isIntroActiveRef.current) {
        introAudio.volume = 1.0;
        const p = introAudio.play();
        if (p !== undefined) {
          p.then(() => {
            onVideoAudioBlocked?.(false);
          }).catch(() => {
            onVideoAudioBlocked?.(true);
          });
        }
      }
    };
    introAudio.addEventListener("canplaythrough", playIntroAudio, { once: true });
    playIntroAudio();

    // Enable sound on first user gesture if browser blocked initial autoplay audio
    const enableAudioOnGesture = () => {
      if (introAudioRef.current && isIntroActiveRef.current && !isMuted) {
        introAudioRef.current.volume = 1.0;
        introAudioRef.current.play().catch(() => {});
        onVideoAudioBlocked?.(false);
      }
    };
    window.addEventListener("pointerdown", enableAudioOnGesture);
    window.addEventListener("keydown", enableAudioOnGesture);
    window.addEventListener("touchstart", enableAudioOnGesture);
    window.addEventListener("click", enableAudioOnGesture);

    const videoTex = new THREE.VideoTexture(video);
    videoTex.colorSpace = THREE.SRGBColorSpace;
    videoTex.minFilter = THREE.LinearFilter;
    videoTex.magFilter = THREE.LinearFilter;

    const videoGroup = new THREE.Group();
    const videoBezel = new THREE.Mesh(
      createRoundedBoxGeometry(2.4, 3.4, 0.12, 0.35, 8),
      new THREE.MeshPhysicalMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2, clearcoat: 0.9 })
    );
    videoGroup.add(videoBezel);

    const videoRim = new THREE.Mesh(
      createRoundedBoxGeometry(2.46, 3.46, 0.1, 0.38, 8),
      new THREE.MeshPhysicalMaterial({ color: 0xdfb782, metalness: 0.95, roughness: 0.12, clearcoat: 1.0 })
    );
    videoGroup.add(videoRim);

    const videoScreen = new THREE.Mesh(
      createRoundedPlaneGeometry(2.26, 3.26, 0.3, 16),
      new THREE.MeshBasicMaterial({ map: videoTex })
    );
    videoScreen.position.set(0, 0, 0.068);
    videoGroup.add(videoScreen);
    registerDraggable(videoGroup, [-4.8, 3.8, 2.2], baseTilt, [-1.2, 1.0, 1.0], 1.3, 0.07, 0.025, "video_screen_circle", "Piwva Baby Video Reel");

    // 5. Nursery Climate Card (Bengali)
    const palCard = create3DHealthCard("নার্সারি ও রুমের সঠিক আবহাওয়া", "🌿 ১০০% নিরাপদ ও স্বাস্থ্যকর পরিবেশ", [
      "রুমের আবহাওয়া: তাপমাত্রা ২০–২২°C ও আর্দ্রতা ৪৫–৫৫% রাখুন।",
      "কোমল ত্বকের যত্ন: ১০০% অর্গানিক সুতি কাপড় ত্বকের আর্দ্রতা বজায় রাখে।",
      "জিরো-ভিওসি বিচউড: কোনো ক্ষতিকর রঙ বা টক্সিক কেমিক্যাল নেই।",
    ], "#15803d", "#dcfce7", 3.4, 3.2);
    registerDraggable(palCard, [5.25, 0.59, 1.28], [-0.56, 0.38, 0.36], [-2.6, 1.8, 1.4], 1.3, 0.08, 0.03, "color_palette", "Nursery Climate Card");

    // 6. Motor Milestones Card (Bengali)
    const motorCard = create3DHealthCard("শারীরিক ও মস্তিষ্কের বিকাশ", "🩺 শিশু বিশেষজ্ঞ নির্দেশিকা • ০–৬ মাস", [
      "দৈনিক টামি টাইম: ঘাড়ের পেশি ও মেরুদণ্ডের শক্তি বৃদ্ধি করে।",
      "দৃষ্টিশক্তি বিকাশ: ৮–১২ ইঞ্চি দূর থেকে আকর্ষণীয় খেলনা দেখান।",
      "মাড়ির আরাম: ঠান্ডা খাঁটি বিচউড মাড়ির চুলকানি ও ব্যথা কমায়।",
    ], "#b45309", "#fef3c7", 3.4, 3.2);
    registerDraggable(motorCard, [5.82, 2.96, -5.65], [-0.58, 0.4, 0.38], [-2.6, -1.6, 1.8], 1.5, 0.1, 0.035, "product_card", "Motor & Sensory Health Card");

    // 7. Health Guide Button Pill (Bengali)
    const snGroup = new THREE.Group();
    const snMesh = new THREE.Mesh(createRoundedBoxGeometry(3.0, 0.65, 0.1, 0.26, 8), new THREE.MeshPhysicalMaterial({ color: 0x94785c, roughness: 0.25 }));
    snGroup.add(snMesh);
    const snCanvas = document.createElement("canvas");
    snCanvas.width = 750;
    snCanvas.height = 160;
    const snCtx = snCanvas.getContext("2d");
    if (snCtx) {
      snCtx.fillStyle = "#8c6d4f";
      snCtx.fillRect(0, 0, 750, 160);
      snCtx.fillStyle = "#ffffff";
      snCtx.font = `bold 36px ${BENGALI_FONT}`;
      snCtx.textAlign = "center";
      snCtx.fillText("শিশুর স্বাস্থ্য নির্দেশিকা →", 375, 65);
      snCtx.fillStyle = "#fde68a";
      snCtx.font = `bold 22px ${BENGALI_FONT}`;
      snCtx.fillText("নবজাতকের বৈজ্ঞানিক যত্ন ও টিপস (০-৬ মাস)", 375, 115);
    }
    const snTex = new THREE.CanvasTexture(snCanvas);
    const snFace = new THREE.Mesh(createRoundedPlaneGeometry(2.98, 0.63, 0.25, 16), new THREE.MeshBasicMaterial({ map: snTex }));
    snFace.position.set(0, 0, 0.058);
    snGroup.add(snFace);
    registerDraggable(snGroup, [-0.18, 4.84, 4.33], [-0.56, 0.38, 0.36], [2.4, 1.2, 1.6], 1.4, 0.06, 0.02, "shop_now_btn", "Health Guide Pill Button");

    // 8. Action Icons
    const actsGroup = new THREE.Group();
    const actGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 32);
    actGeom.rotateX(Math.PI / 2);
    const actMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, clearcoat: 0.4 });
    ["🩺", "❤️", "🌿"].forEach((ic, i) => {
      const bMesh = new THREE.Mesh(actGeom, actMat);
      bMesh.position.set((i - 1) * 0.95, 0, 0);
      actsGroup.add(bMesh);
      const icCanvas = document.createElement("canvas");
      icCanvas.width = 128;
      icCanvas.height = 128;
      const icCtx = icCanvas.getContext("2d");
      if (icCtx) {
        icCtx.fillStyle = "#ffffff";
        icCtx.fillRect(0, 0, 128, 128);
        icCtx.font = "56px sans-serif";
        icCtx.textAlign = "center";
        icCtx.textBaseline = "middle";
        icCtx.fillText(ic, 64, 64);
      }
      const icTex = new THREE.CanvasTexture(icCanvas);
      const icFace = new THREE.Mesh(new THREE.CircleGeometry(0.38, 32), new THREE.MeshBasicMaterial({ map: icTex }));
      icFace.position.set((i - 1) * 0.95, 0, 0.06);
      actsGroup.add(icFace);
    });
    registerDraggable(actsGroup, [-7.32, -1.73, 5.79], baseTilt, [-1.5, -1.2, 1.0], 1.1, 0.05, 0.02, "action_buttons", "Health Action Icons");

    // =========================================================================
    // STAGE 0.5: SENSORY & LAUGHING BABY (Y: -4 to -9) - [4 Elements]
    // =========================================================================

    // 9. Wooden Blocks
    const blocksGroup = new THREE.Group();
    const block1 = new THREE.Mesh(createRoundedBoxGeometry(0.95, 0.95, 0.95, 0.12, 6), new THREE.MeshPhysicalMaterial({ color: 0xdfb782, roughness: 0.28, metalness: 0.08 }));
    blocksGroup.add(block1);
    const block2 = new THREE.Mesh(createRoundedBoxGeometry(0.8, 0.8, 0.8, 0.1, 6), new THREE.MeshPhysicalMaterial({ color: 0xccd5ae, roughness: 0.3 }));
    block2.position.set(0.65, -0.45, 0.25);
    blocksGroup.add(block2);
    registerDraggable(blocksGroup, [-4.7, -4.5, 2.0], [-0.45, 0.35, 0.25], [-3.0, 0.5, 1.8], 1.6, 0.09, 0.03, "wooden_blocks", "Montessori Wooden Blocks");

    // 10. Baby Rattle
    const rattleGroup = new THREE.Group();
    const rattleTorus = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.12, 24, 64), new THREE.MeshPhysicalMaterial({ color: 0xdfb782, roughness: 0.25, clearcoat: 0.6 }));
    rattleGroup.add(rattleTorus);
    [0xf4a261, 0xccd5ae, 0xe76f51, 0xfaedcd].forEach((col, idx) => {
      const angle = (idx / 4) * Math.PI * 2;
      const bMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 24), new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.35 }));
      bMesh.position.set(Math.cos(angle) * 0.85, Math.sin(angle) * 0.85, 0);
      rattleGroup.add(bMesh);
    });
    registerDraggable(rattleGroup, [4.8, -4.8, 1.8], [-0.48, 0.36, 0.3], [3.0, 2.2, 1.6], 1.8, 0.08, 0.025, "baby_rattle", "Baby Rattle & Teether");

    // 11. Laughing Baby Photo (Bengali)
    const laughingCard = create3DPhotoCard(
      "/images/baby_laughing.jpg",
      "সেন্সরি খেলা ও হাসিখুশি বিকাশ",
      "🧸 ৬–৯ মাস শারীরিক বৃদ্ধি",
      "প্রাকৃতিক কাঠের খেলনা হাতের সূক্ষ্ম মোটর স্কিল বাড়ায়",
      "#fef3c7",
      "#92400e"
    );
    registerDraggable(laughingCard, [5.5, -7.5, 3.2], baseTilt, [-1.2, 1.0, 1.0], 1.4, 0.08, 0.03, "card_laughing_photo", "Laughing Baby Photo Card");

    // 12. Ring Stacker
    const ringStacker = create3DRingStacker();
    registerDraggable(ringStacker, [-0.2, -8.2, 4.2], [-0.4, 0.35, 0.2], [0, 1.2, 1.0], 1.5, 0.08, 0.03, "ring_stacker_3d", "3D Wooden Ring Stacker");

    // =========================================================================
    // STAGE 1: SAFE SLEEP & SIDS PROTOCOL (Y: -13 to -22) - [6 Elements]
    // =========================================================================

    // 13. Sleeping Baby Photo (Bengali)
    const sleepPhotoCard = create3DPhotoCard(
      "/images/baby_sleep.jpg",
      "নিরাপদ ঘুমের গোল্ডেন স্ট্যান্ডার্ড",
      "🌙 সিডস (SIDS) প্রতিরোধ",
      "চিত করে শোয়ান • ২০–২২°C রুম • শক্ত সমতল তোষক",
      "#dbeafe",
      "#1d4ed8"
    );
    registerDraggable(sleepPhotoCard, [-5.5, -14.5, 3.2], baseTilt, [1.5, 1.0, 1.0], 1.3, 0.08, 0.03, "card_sleep_photo", "Sleeping Baby Photo Card");

    // 14. Safe Sleep Tips (Bengali)
    const sleepTipsCard = create3DHealthCard("নিরাপদ ঘুমের ৪টি মৌলিক নিয়ম", "😴 ০–১২ মাস বয়সের প্রোটোকল", [
      "সবসময় চিত করে শোয়ান: সিডস (SIDS) ঝুঁকি ৮০% পর্যন্ত হ্রাস পায়।",
      "খালি বিছানার নিয়ম: বিছানায় কোনো আলগা বালিশ, খেলনা বা তোশক রাখবেন না।",
      "তাপমাত্রা ২০–২২°C: শিশুর অতিরিক্ত গরম হওয়া প্রতিরোধ করে।",
      "রুম শেয়ারিং: প্রথম ৬ মাস শিশুকে নিজের রুমের পাশে রাখুন।",
    ], "#3b82f6", "#dbeafe");
    registerDraggable(sleepTipsCard, [4.8, -15.0, 1.5], baseTilt, [-1.5, -1.0, 1.2], 1.4, 0.07, 0.025, "card_sleep_tips", "Safe Sleep Guidelines Card");

    // 15. Moon Mobile
    const moonMobile = create3DMoonMobile();
    registerDraggable(moonMobile, [-0.2, -16.2, 4.0], [-0.4, 0.3, 0.2], [0, 1.5, 1.0], 1.6, 0.09, 0.03, "moon_nightlight", "3D Moon & Stars Mobile");

    // 16. Climate Medallion (Bengali)
    const tempBadge = create3DCylinderMedallion("🌡️", "২০–২২°C", "৪৫–৫৫% আর্দ্রতা", "শ্বাসনালী সুরক্ষা");
    registerDraggable(tempBadge, [8.2, -14.0, -1.5], baseTilt, [-1.0, 1.2, 1.0], 1.2, 0.08, 0.02, "temp_badge", "Climate & Humidity Medallion");

    // 17. Swaddle Safety Card (Bengali)
    const swaddleCard = create3DHealthCard("সোয়াডলিং ও রূপান্তর গাইড", "🌿 নিরাপদ সোয়াডল নিয়ম", [
      "বুকে আঁটসাঁট, নিতম্বে আলগা: শিশুর হিপ ডিসপ্লাসিয়া রোধ করে।",
      "কাত হওয়ার লক্ষণ পেলে হাত খোলা: শিশু নিজে কাত হতে পারলে হাত মুক্ত রাখুন।",
      "১০০% সুতি মস্লিন কাপড়: অতিরিক্ত তাপ তৈরি হওয়া প্রতিরোধ করে।",
    ], "#0d9488", "#ccfbf1");
    registerDraggable(swaddleCard, [-7.8, -19.5, 1.0], baseTilt, [1.0, 1.0, 1.0], 1.3, 0.07, 0.02, "swaddle_guide_card", "Swaddle Safety Guide Card");

    // 18. Circadian Lamp
    const lampGroup = new THREE.Group();
    const lampDome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xfef08a, transmission: 0.7, roughness: 0.1 }));
    lampDome.position.y = 0.3;
    lampGroup.add(lampDome);
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.3, 32), new THREE.MeshPhysicalMaterial({ color: 0xdfb782, roughness: 0.3 }));
    lampGroup.add(lampBase);
    registerDraggable(lampGroup, [1.5, -20.2, 3.5], [-0.3, 0.2, 0.1], [0, 1.0, 1.0], 1.5, 0.07, 0.02, "circadian_lamp_3d", "3D Nursery Nightlight Lamp");

    // =========================================================================
    // STAGE 2: TUMMY TIME, CRAWLING & BRAIN (Y: -26 to -38) - [8 Elements]
    // =========================================================================

    // 19. Tummy Photo (Bengali)
    const tummyPhotoCard = create3DPhotoCard(
      "/images/baby_tummy.jpg",
      "দৈনিক টামি টাইম রুটিন",
      "🧸 শারীরিক মোটর বিকাশ",
      "প্রতিদিন ৩–৫ মিনিট • ঘাড়, কাঁধ ও মেরুদণ্ডের শক্তি বাড়ায়",
      "#fef3c7",
      "#92400e"
    );
    registerDraggable(tummyPhotoCard, [5.2, -27.0, 2.8], baseTilt, [-1.5, 1.0, 1.0], 1.4, 0.08, 0.03, "card_tummy_photo", "Tummy Time Baby Photo Card");

    // 20. Tummy Tips (Bengali)
    const tummyTipsCard = create3DHealthCard("টামি টাইমের মূল লক্ষ্য ও নিয়ম", "🍼 ০–৬ মাস শারীরিক বিকাশ", [
      "বুকে শোয়ানো শুরু: জন্মের পর থেকেই বাবার বা মায়ের বুকে ২-৩ মিনিট রাখুন।",
      "প্লে-ম্যাটে অভ্যাস: ধীরে ধীরে দিনে ১৫-২০ মিনিট টামি টাইম করান।",
      "দৃষ্টি আকর্ষণ: ৮-১২ ইঞ্চি দূরে আকর্ষণীয় খেলনা রেখে মাথা তোলার উৎসাহ দিন।",
      "মাথার আকার সুরক্ষা: নিয়মিত টামি টাইম শিশুর মাথার চ্যাপ্টা হওয়া রোধ করে।",
    ], "#ea580c", "#ffedd5");
    registerDraggable(tummyTipsCard, [1.26, -29.29, 2.43], baseTilt, [1.5, -1.0, 1.2], 1.3, 0.07, 0.025, "card_tummy_tips", "Tummy Time Milestone Card");

    // 21. Crawling Baby Photo (Bengali)
    const crawlingPhotoCard = create3DPhotoCard(
      "/images/baby_crawling.jpg",
      "হামাগুড়ি ও চলাচলের বিকাশ",
      "⚡ ৮–১১ মাস মোবিলিটি",
      "ক্রস-ল্যাটারাল মুভমেন্ট মস্তিষ্কের উভয় অংশের সংযোগ বাড়ায়",
      "#e0e7ff",
      "#3730a3"
    );
    registerDraggable(crawlingPhotoCard, [-6.8, -32.5, 1.5], baseTilt, [1.2, 1.0, 1.0], 1.4, 0.08, 0.03, "card_crawling_photo", "Crawling Baby Photo Card");

    // 22. Pediatrician Endorsement (Bengali)
    const reviewCard = create3DHealthCard("শিশু বিশেষজ্ঞের ক্লিনিক্যাল সুপারিশ", "⭐ ৫.০ মেডিকেল পরামর্শ", [
      "ডা. সারা মিলার, এমডি: বোর্ড সার্টিফাইড শিশু বিশেষজ্ঞ।",
      "ক্লিনিক্যাল মানদণ্ড: প্রাকৃতিক বিচউড ও পরিষ্কার ঘরের পরিবেশ।",
      "প্রাথমিক বিকাশ: শিশুর স্নায়বিক বুদ্ধিমত্তা বৃদ্ধিতে সহায়ক।",
    ], "#15803d", "#dcfce7");
    registerDraggable(reviewCard, [6.5, -33.5, 0.5], baseTilt, [-1.2, 1.0, 1.0], 1.2, 0.07, 0.02, "parent_review", "Pediatric Endorsement Card");

    // 23. High-Contrast Vision (Bengali)
    const contrastCard = create3DHealthCard("হাই-কনট্রাস্ট দৃষ্টিশক্তি গাইড", "👀 স্নায়বিক উদ্দীপনা", [
      "কালো ও সাদা জ্যামিতিক নকশা: রেটিনা ও অপটিক নার্ভকে উদ্দীপিত করে।",
      "৮–১২ ইঞ্চি দূরত্ব: নবজাতকের স্পষ্ট দেখার আদর্শ দূরত্ব।",
      "ধীর মুভমেন্ট: খেলনাগুলো আস্তে আস্তে ডানে-বামে সরান।",
    ], "#1e293b", "#f1f5f9");
    registerDraggable(contrastCard, [0.0, -34.8, 3.8], baseTilt, [0, 1.0, 1.0], 1.5, 0.08, 0.025, "contrast_card_3d", "High-Contrast Visual Card");

    // 24. Abacus 3D
    const abacus3D = new THREE.Group();
    const abFrame = new THREE.Mesh(createRoundedBoxGeometry(2.2, 1.8, 0.15, 0.1, 6), new THREE.MeshPhysicalMaterial({ color: 0xdfb782, roughness: 0.3 }));
    abacus3D.add(abFrame);
    [-0.4, 0, 0.4].forEach((y, r) => {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8, 16), new THREE.MeshBasicMaterial({ color: 0x94a3b8 }));
      wire.rotation.z = Math.PI / 2;
      wire.position.y = y;
      abacus3D.add(wire);
      [-0.5, -0.2, 0.1, 0.4].forEach((x, b) => {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshPhysicalMaterial({ color: [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b][(r + b) % 4] }));
        bead.position.set(x, y, 0);
        abacus3D.add(bead);
      });
    });
    registerDraggable(abacus3D, [-4.5, -36.5, 2.5], baseTilt, [1.0, 0.5, 1.0], 1.6, 0.08, 0.03, "wooden_abacus_3d", "3D Montessori Abacus Model");

    // 25 & 26. Milestones Badges (Bengali)
    const m3Badge = create3DCylinderMedallion("✨", "৩ মাসের লক্ষ্য", "ঘাড় শক্ত ও হাসিমুখ", "মেডিকেল চেক", true, 0.75);
    registerDraggable(m3Badge, [4.8, -37.2, 1.2], baseTilt, [-1.0, 1.0, 1.0], 1.3, 0.07, 0.02, "milestone_3m_card", "3-Month Milestones Badge");

    const m6Badge = create3DCylinderMedallion("🌟", "৬ মাসের লক্ষ্য", "সাপোর্ট নিয়ে বসা", "মোটর মাইলস্টোন", true, 0.75);
    registerDraggable(m6Badge, [-0.5, -38.5, 3.5], baseTilt, [0, 1.0, 1.0], 1.4, 0.08, 0.025, "milestone_6m_card", "6-Month Milestones Badge");

    // =========================================================================
    // STAGE 3: TEETHING, ORAL HEALTH & WEANING (Y: -43 to -56) - [8 Elements]
    // =========================================================================

    // 27. Teething Photo (Bengali)
    const teethingPhotoCard = create3DPhotoCard(
      "/images/baby_teething.jpg",
      "প্রাকৃতিক টিথিং ও মাড়ির আরাম",
      "🦷 মুখের প্রাথমিক স্বাস্থ্য",
      "মসৃণ খাঁটি বিচউড ও ফুড-গ্রেড সিলিকন মাড়ির ব্যথা কমায়",
      "#fef3c7",
      "#b45309"
    );
    registerDraggable(teethingPhotoCard, [-5.4, -44.0, 3.2], baseTilt, [1.5, 1.0, 1.0], 1.4, 0.08, 0.03, "card_teething_photo", "Teething Baby Photo Card");

    // 28. Teething Tips (Bengali)
    const teethingTipsCard = create3DHealthCard("টিথিং উপশমের নিরাপদ উপায়", "🌱 নিরাপদ টিথিং প্রোটোকল", [
      "ঠান্ডা প্রাকৃতিক বিচউড: ঠান্ডা কাঠ মাড়ির ফোলাভাব ও ব্যথা কমায়।",
      "ফুড-গ্রেড সিলিকন রিং: টেক্সচার্ড সিলিকন শিশুর কামড়ানোর ইচ্ছা পূরণ করে।",
      "ক্ষতিকর জেল বর্জন: বেনজোকেনযুক্ত অসাড়কারী জেল কখনো দেবেন না।",
      "মুখের পরিচ্ছন্নতা: প্রথম দাঁতের আগেই পরিষ্কার ভেজা গজ দিয়ে মাড়ি মুছুন।",
    ], "#15803d", "#dcfce7");
    registerDraggable(teethingTipsCard, [4.9, -45.2, 2.0], baseTilt, [-1.5, -1.0, 1.2], 1.3, 0.07, 0.025, "card_teething_tips", "Teething Guidelines Card");

    // 29. Silicone Chain
    const siliconeChain = create3DSiliconeChain();
    registerDraggable(siliconeChain, [0.1, -46.5, 4.0], [-0.4, 0.35, 0.2], [0, 1.0, 1.0], 1.5, 0.08, 0.025, "silicone_beads_3d", "3D Silicone Teether Chain");

    // 30. Eco Badge (Bengali)
    const ecoBadge = create3DCylinderMedallion("🌱", "১০০% নিরাপদ", "এফএসসি বিচউড", "টক্সিক উপাদান-মুক্ত");
    registerDraggable(ecoBadge, [8.4, -44.5, -1.0], baseTilt, [-1.0, 1.2, 1.0], 1.5, 0.08, 0.025, "eco_badge", "100% Newborn Safe Health Seal");

    // 31. Solids Guide (Bengali)
    const solidsCard = create3DHealthCard("প্রথম শক্ত খাবার ও উইনিং গাইড", "🥑 ৬+ মাস পুষ্টি শুরু", [
      "মাথা শক্ত করে বসা: কোনো সাপোর্ট ছাড়াই সোজা হয়ে বসতে পারা।",
      "আয়রনসমৃদ্ধ প্রথম খাবার: ম্যাশ করা অ্যাভোকাডো, মিষ্টি আলু, ডাল।",
      "নতুন খাবারের নিয়ম: প্রতি ৩-৫ দিনে একটি করে নতুন খাবার দিন।",
    ], "#16a34a", "#dcfce7");
    registerDraggable(solidsCard, [-7.2, -50.5, 1.2], baseTilt, [1.0, 1.0, 1.0], 1.3, 0.07, 0.02, "solids_guide_card", "Weaning & Solids Guide Card");

    // 32. Wooden Spoon
    const spoonGroup = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.6, 16), new THREE.MeshPhysicalMaterial({ color: 0xdfb782, roughness: 0.25 }));
    handle.position.y = 0.8;
    spoonGroup.add(handle);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshPhysicalMaterial({ color: 0xdfb782, roughness: 0.25 }));
    bowl.scale.set(1.0, 1.4, 0.4);
    spoonGroup.add(bowl);
    registerDraggable(spoonGroup, [6.5, -51.2, 1.8], [0.4, -0.3, 0.5], [1.0, 0, 1.0], 1.6, 0.08, 0.03, "wooden_spoon_3d", "3D Wooden Weaning Spoon");

    // 33. Oral Hygiene (Bengali)
    const oralWipeCard = create3DHealthCard("মাড়ি ও দাঁতের যত্ন প্রোটোকল", "🪥 দৈনিক মুখের পরিচ্ছন্নতা", [
      "দুধের পর মাড়ি পরিষ্কার: সকালে ও রাতে দুধ খাওয়ানোর পর মাড়ি মুছে দিন।",
      "সিলিকন ফিঙ্গার ব্রাশ: প্রথম দাঁত উঠলে নরম ব্রাশ ব্যবহার করুন।",
      "শুধুমাত্র পানি: ঘুমানোর সময় বোতলে কোনো মিষ্টি পানীয় দেবেন না।",
    ], "#0284c7", "#e0f2fe");
    registerDraggable(oralWipeCard, [0.0, -52.8, 3.6], baseTilt, [0, 1.0, 1.0], 1.4, 0.08, 0.025, "oral_wipe_card", "Oral & Gum Care Card");

    // 34. Silicone Star Toy
    const starToy = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.15, 5), new THREE.MeshPhysicalMaterial({ color: 0xf4a261, roughness: 0.35, clearcoat: 0.3 }));
    starToy.rotation.x = Math.PI / 2;
    const starToyGroup = new THREE.Group();
    starToyGroup.add(starToy);
    registerDraggable(starToyGroup, [-4.5, -54.5, 2.5], baseTilt, [-0.5, 1.0, 1.0], 1.5, 0.08, 0.025, "silicone_star_toy", "3D Silicone Star Teether");

    // =========================================================================
    // STAGE 4: KANGAROO CARE, COLIC & BONDING (Y: -60 to -72) - [8 Elements]
    // =========================================================================

    // 35. Mother Kangaroo Photo (Bengali)
    const motherPhotoCard = create3DPhotoCard(
      "/images/baby_mother.jpg",
      "ক্যাঙ্গারু কেয়ার ও স্কিন-টু-স্কিন",
      "❤️ আবেগময় আত্মিক বন্ধন",
      "শরীরের তাপমাত্রা নিয়ন্ত্রণ করে ও সুস্থ মাইক্রোবায়োম গড়ে তোলে",
      "#ffe4e6",
      "#e11d48"
    );
    registerDraggable(motherPhotoCard, [5.0, -61.0, 3.0], baseTilt, [-1.5, 1.0, 1.0], 1.4, 0.08, 0.03, "card_mother_photo", "Kangaroo Care Baby Photo Card");

    // 36. Colic Relief (Bengali)
    const colicTipsCard = create3DHealthCard("কলিক ও পেটের গ্যাস নিরাময়", "🍼 পরিপাকতন্ত্রের আরাম", [
      "বাইসাইকেল লেগস এক্সারসাইজ: পেটে আটকে থাকা বাতাস বের করে দেয়।",
      "১৫ মিনিট সোজা রেখে ঢেকুর: দুধ খাওয়ানোর পর কাঁধে সোজা রাখুন।",
      "ঘড়ির কাঁটার দিকে পেটে ম্যাসাজ: কলিক ও পেটের ক্র্যাম্প দূর করে।",
      "স্কিন-টু-স্কিন স্পর্শ: মা-বাবার উষ্ণতা শিশুর মানসিক চাপ কমায়।",
    ], "#9333ea", "#f3e8ff");
    registerDraggable(colicTipsCard, [-5.2, -62.5, 2.5], baseTilt, [1.5, -1.0, 1.2], 1.3, 0.07, 0.025, "card_colic_tips", "Colic & Gas Relief Card");

    // 37. Cloud Mobile
    const cloudMobile = create3DCloudMobile();
    registerDraggable(cloudMobile, [0.0, -64.0, 4.0], [-0.4, 0.35, 0.2], [0, 1.0, 1.0], 1.5, 0.08, 0.03, "cloud_mobile_3d", "3D Cloud Nursery Mobile");

    // 38. Newsletter Card (Bengali)
    const newsCard = create3DHealthCard("সাপ্তাহিক স্বাস্থ্য টিপস ক্লাব", "💌 নিয়মিত স্বাস্থ্য পরামর্শ", [
      "বয়স উপযোগী টিপস: প্রতি সপ্তাহের বিশেষ মাইলস্টোন গাইড।",
      "বিশেষজ্ঞদের উত্তর: শিশুর বিকাশ সংক্রান্ত যেকোনো প্রশ্নের সমাধান।",
      "নিরাপদ খাদ্য তালিকা: ৬ মাস পরবর্তী স্বাস্থ্যকর পুষ্টি নির্দেশিকা।",
    ], "#b45309", "#fef3c7", 3.8, 3.2);
    registerDraggable(newsCard, [8.2, -61.5, -0.5], baseTilt, [-1.0, 1.2, 1.0], 1.2, 0.09, 0.03, "newsletter_card", "Pediatrician Health Tips Card");

    // 39. Burping Techniques (Bengali)
    const burpingCard = create3DHealthCard("ঢেকুর তোলানোর ৩টি সহজ পদ্ধতি", "🍼 ফিডিং কমফোর্ট", [
      "কাঁধের ওপর নিয়ে: হাতের তালু দিয়ে আলতো চাপড় দিন।",
      "বসা অবস্থায় থুতনি ধরে: শিশুকে সামনের দিকে ঝুঁকিয়ে পিঠে হাত বুলান।",
      "কোলের ওপর উপুড় করে: পেটের ওপর নরম সাপোর্ট দিয়ে পিঠে মালিশ করুন।",
    ], "#d97706", "#fef3c7");
    registerDraggable(burpingCard, [-7.5, -67.5, 1.5], baseTilt, [1.0, 1.0, 1.0], 1.3, 0.07, 0.02, "burping_guide_card", "Burping Techniques Guide Card");

    // 40. Massage Routine (Bengali)
    const massageCard = create3DHealthCard("শিশুর বডি ম্যাসাজ রুটিন", "🌿 প্রশান্তি ও আরামদায়ক ঘুম", [
      "হালকা গরম প্রাকৃতিক তেল: হাইপোঅ্যালার্জেনিক উদ্ভিজ্জ তেল ব্যবহার করুন।",
      "আই-লাভ-ইউ স্ট্রোক: কোলন বরাবর আলতো হাতে মালিশ করুন।",
      "ঘুমের আগের প্রস্তুতি: হার্ট রেট শান্ত করে গভীর ঘুমে সাহায্য করে।",
    ], "#059669", "#d1fae5");
    registerDraggable(massageCard, [6.5, -68.2, 1.2], baseTilt, [-1.0, 1.0, 1.0], 1.4, 0.08, 0.025, "massage_oil_card", "Infant Massage Routine Card");

    // 41. Kangaroo Badge (Bengali)
    const kangarooBadge = create3DCylinderMedallion("❤️", "স্কিন-টু-স্কিন", "হৃদস্পন্দন নিয়ন্ত্রণ", "আবেগময় বন্ধন");
    registerDraggable(kangarooBadge, [-0.2, -69.5, 3.8], baseTilt, [0, 1.0, 1.0], 1.5, 0.08, 0.025, "kangaroo_badge", "Kangaroo Care Bonding Seal");

    // 42. Heart Shield
    const heartShield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.12, 6),
      new THREE.MeshPhysicalMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.2, clearcoat: 0.8 })
    );
    heartShield.rotation.x = Math.PI / 2;
    const heartShieldGroup = new THREE.Group();
    heartShieldGroup.add(heartShield);
    registerDraggable(heartShieldGroup, [-4.5, -71.0, 2.8], baseTilt, [-0.5, 1.0, 1.0], 1.6, 0.08, 0.03, "heart_shield_3d", "3D Heart Health Shield");

    // =========================================================================
    // STAGE 5: CLINICAL WARNING SIGNS & EMERGENCIES (Y: -76 to -88) - [6 Elements]
    // =========================================================================

    // 43. Fever Protocol (Bengali)
    const feverCard = create3DHealthCard("নবজাতকের জ্বর সতর্কতা গাইড", "🚨 জরুরি মেডিকেল প্রোটোকল", [
      "৩ মাসের কম বয়স: তাপমাত্রা ১০০.৪°F (৩৮°C) হলে দ্রুত ডাক্তার দেখান।",
      "সঠিক থার্মোমিটার: নবজাতকের ক্ষেত্রে ডিজিটাল থার্মোমিটার ব্যবহার করুন।",
      "অ্যাসপিরিন নিষিদ্ধ: ডাক্তারের পরামর্শ ছাড়া কোনো ওষুধ দেবেন না।",
    ], "#dc2626", "#fee2e2");
    registerDraggable(feverCard, [-5.5, -77.0, 3.0], baseTilt, [1.2, 1.0, 1.0], 1.3, 0.08, 0.03, "fever_protocol_card", "Infant Fever Protocol Card");

    // 44. Dehydration Checklist (Bengali)
    const dehydrationCard = create3DHealthCard("ডিহাইড্রেশনের ক্লিনিক্যাল লক্ষণ", "💧 পানিশূন্যতা চেকলিস্ট", [
      "প্রস্রাবের পরিমাণ: ২৪ ঘণ্টায় ৬ বারের কম ডায়াপার ভেজা।",
      "মাথার তালু দেবে যাওয়া: মাথার নরম অংশটি বসে বা দেবে যাওয়া।",
      "শুষ্ক মুখ ও চোখ: কান্নার সময় চোখে পানি না আসা এবং মুখ শুষ্ক থাকা।",
    ], "#0284c7", "#e0f2fe");
    registerDraggable(dehydrationCard, [5.2, -78.2, 2.0], baseTilt, [-1.2, 1.0, 1.0], 1.4, 0.07, 0.025, "dehydration_card", "Dehydration Warning Signs Card");

    // 45. Respiratory Signs (Bengali)
    const breathingCard = create3DHealthCard("শ্বাসকষ্টের সতর্কতা সংকেত", "🫁 শ্বাসপ্রশ্বাস পর্যবেক্ষণ", [
      "দ্রুত শ্বাসপ্রশ্বাস: মিনিটে ৬০ বারের বেশি দ্রুত শ্বাস নেওয়া।",
      "বুকের খাঁচা দেবে যাওয়া: শ্বাসের সাথে বুকের চামড়া ভেতরে ঢুকে যাওয়া।",
      "নাকের ছিদ্র ফুলে ওঠা ও গোঙানি: দ্রুত শিশু হাসপাতালে যাওয়ার জরুরি লক্ষণ।",
    ], "#b91c1c", "#fee2e2");
    registerDraggable(breathingCard, [0.0, -81.5, 3.8], baseTilt, [0, 1.0, 1.0], 1.5, 0.08, 0.025, "breathing_card", "Respiratory Distress Card");

    // 46. Thermometer 3D
    const thermoGroup = new THREE.Group();
    const thermoBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 1.2, 16, 16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1 }));
    thermoBody.rotation.z = Math.PI / 4;
    thermoGroup.add(thermoBody);
    const thermoTip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16), new THREE.MeshPhysicalMaterial({ color: 0xdfb782, metalness: 0.95 }));
    thermoTip.rotation.z = Math.PI / 4;
    thermoTip.position.set(-0.55, -0.55, 0);
    thermoGroup.add(thermoTip);
    registerDraggable(thermoGroup, [-6.8, -83.5, 1.8], [0.2, 0.3, 0.4], [1.0, 0, 1.0], 1.6, 0.08, 0.03, "thermometer_3d", "3D Pediatric Thermometer");

    // 47. Stethoscope Badge (Bengali)
    const stethBadge = create3DCylinderMedallion("🩺", "ক্লিনিক্যাল পরামর্শ", "শিশু বিশেষজ্ঞ অনুমোদিত", "সঠিক চিকিৎসা মানদণ্ড");
    registerDraggable(stethBadge, [6.8, -84.2, 1.2], baseTilt, [-1.0, 1.0, 1.0], 1.3, 0.07, 0.02, "stethoscope_badge", "Clinical Advisory Badge");

    // 48. First Aid Box
    const kitGroup = new THREE.Group();
    const kitBox = new THREE.Mesh(createRoundedBoxGeometry(1.6, 1.2, 0.8, 0.15, 6), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, clearcoat: 0.4 }));
    kitGroup.add(kitBox);
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.02), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    cross1.position.z = 0.41;
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.02), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    cross2.position.z = 0.41;
    kitGroup.add(cross1, cross2);
    registerDraggable(kitGroup, [-0.2, -86.5, 3.6], [-0.4, 0.3, 0.2], [0, 1.0, 1.0], 1.5, 0.08, 0.025, "first_aid_kit_3d", "3D Nursery First Aid Box");

    // =========================================================================
    // STAGE 6: CERTIFICATIONS, RHYTHMS & CREST (Y: -90 to -105) - [6 Elements]
    // =========================================================================

    // 49. FSC Wood Seal (Bengali)
    const fscSeal = create3DCylinderMedallion("🌲", "১০০% প্রাকৃতিক", "এফএসসি বিচউড", "লেড ও কেমিক্যাল-মুক্ত");
    registerDraggable(fscSeal, [-5.5, -92.0, 3.0], baseTilt, [1.0, 1.0, 1.0], 1.4, 0.08, 0.025, "fsc_wood_seal", "FSC Beechwood Certified Seal");

    // 50. BPA-Free Seal (Bengali)
    const bpaSeal = create3DCylinderMedallion("🛡️", "বিপিএ-মুক্ত", "ল্যাব টেস্টে নিরাপদ", "শিশুর শতভাগ সুরক্ষা");
    registerDraggable(bpaSeal, [5.5, -93.2, 2.0], baseTilt, [-1.0, 1.0, 1.0], 1.3, 0.07, 0.025, "bpa_free_seal", "BPA & Phthalate Free Seal");

    // 51. Daily Rhythm Card (Bengali)
    const rhythmCard = create3DHealthCard("নবজাতকের দৈনিক যত্নের রুটিন", "⏰ নিয়মমাফিক জীবনধারা", [
      "সকালের আলো ও ফিডিং: দিনের আলোয় পর্দা খুলে শিশুকে জাগান।",
      "টামি টাইম ও খেলা: সক্রিয় সময়ে ৩-৫ মিনিট খেলাধুলা করান।",
      "রাতের রুটিন: কুসুম গরম পানিতে গোসল, হালকা আলো ও শান্ত পরিবেশ।",
    ], "#6366f1", "#e0e7ff");
    registerDraggable(rhythmCard, [0.0, -96.5, 3.8], baseTilt, [0, 1.0, 1.0], 1.5, 0.08, 0.025, "daily_rhythm_card", "Daily Care Rhythm Card");

    // 52. Bathing Card (Bengali)
    const bathCard = create3DHealthCard("কুসুম গরম পানিতে গোসলের নিয়ম", "🛁 নিরাপদ গোসল গাইড", [
      "পানির তাপমাত্রা ৩৭°C: কনুই দিয়ে আগে পানির উষ্ণতা পরীক্ষা করুন।",
      "নাড়ি শুকাতে স্পঞ্জ বাথ: নাড়ি কাটার অংশটি সবসময় শুকনো রাখুন।",
      "সপ্তাহে ২–৩ দিন: প্রতিদিন গোসল না করিয়ে নরম কাপড় দিয়ে মুছুন।",
    ], "#0284c7", "#e0f2fe");
    registerDraggable(bathCard, [-6.5, -99.5, 1.8], baseTilt, [1.0, 1.0, 1.0], 1.3, 0.07, 0.02, "bath_time_card", "Bathing & Water Care Card");

    // 53. Piwva Gold Crest (Bengali)
    const crestBadge = create3DCylinderMedallion("👑", "PIWVA এক্সিলেন্স", "অর্গানিক ও নিরাপদ যত্ন", "মন্টেশ্বরী স্ট্যান্ডার্ড", true, 0.95);
    registerDraggable(crestBadge, [6.2, -100.5, 1.2], baseTilt, [-1.0, 1.0, 1.0], 1.4, 0.08, 0.025, "piwva_gold_crest", "Piwva Gold Royal Crest");

    // 54. Pediatric Board Seal (Bengali)
    const boardSeal = create3DCylinderMedallion("🩺", "মেডিকেল বোর্ড", "শিশু বিশেষজ্ঞ সিল", "ক্লিনিক্যাল সুরক্ষা", true, 0.85);
    registerDraggable(boardSeal, [-0.2, -103.5, 3.5], baseTilt, [0, 1.0, 1.0], 1.5, 0.08, 0.025, "pediatric_club_seal", "Pediatric Advisory Board Seal");

    // =========================================================================
    // INTERACTIVE DRAG & CONTROLS SETUP (WITH SPACEBAR ARTBOARD PANNING!)
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane();
    const planeIntersect = new THREE.Vector3();
    const dragOffset = new THREE.Vector3();

    const findTargetData = (obj: THREE.Object3D | null): DraggableObjectData | null => {
      let curr: THREE.Object3D | null = obj;
      while (curr && curr !== scene && curr !== rootGroup) {
        const found = draggableObjects.current.find((d) => d.mesh === curr);
        if (found) return found;
        curr = curr.parent;
      }
      return null;
    };

    const emitLayout = (activeId: string | null = null) => {
      if (!onLayoutChange) return;
      const layout: LayoutCoords = {};
      draggableObjects.current.forEach((d) => {
        layout[d.id] = [
          parseFloat(d.mesh.position.x.toFixed(2)),
          parseFloat(d.mesh.position.y.toFixed(2)),
          parseFloat(d.mesh.position.z.toFixed(2)),
        ];
      });
      const camPos: [number, number, number] = [
        parseFloat(camera.position.x.toFixed(2)),
        parseFloat(camera.position.y.toFixed(2)),
        parseFloat(camera.position.z.toFixed(2)),
      ];
      const camTarget: [number, number, number] = [
        parseFloat(controls.target.x.toFixed(2)),
        parseFloat(controls.target.y.toFixed(2)),
        parseFloat(controls.target.z.toFixed(2)),
      ];
      const dist = parseFloat(camera.position.distanceTo(controls.target).toFixed(2));
      const cameraState: CameraState = {
        position: camPos,
        target: camTarget,
        fov: parseFloat(camera.fov.toFixed(1)),
        distance: dist,
      };
      onLayoutChange(layout, activeId, cameraState);
    };

    setTimeout(() => emitLayout(null), 100);

    const onControlsChange = () => {
      emitLayout(activeDragged.current?.id || null);
    };
    controls.addEventListener("change", onControlsChange);

    const updateCtrlState = (held: boolean) => {
      if (isCtrlHeldRef.current !== held) {
        isCtrlHeldRef.current = held;
        onCtrlChange?.(held);
        controls.enableRotate = !held && !isSpaceHeldRef.current && !isIntroActiveRef.current;
        controls.enablePan = !held && !isSpaceHeldRef.current && !isIntroActiveRef.current;
        if (!held && !isDraggingAny.current && !isSpaceHeldRef.current) {
          renderer.domElement.style.cursor = "default";
          draggableObjects.current.forEach((d) => (d.isHovered = false));
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Spacebar Hand Tool / Artboard Pan
      if (e.code === "Space" || e.key === " ") {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          if (!isSpaceHeldRef.current) {
            isSpaceHeldRef.current = true;
            onSpaceChange?.(true);
            controls.enableRotate = false;
            controls.enablePan = false;
            renderer.domElement.style.cursor = "grab";
          }
        }
      }

      // Ctrl / Cmd Object Drag Mode
      if (e.key === "Control" || e.key === "Meta" || e.ctrlKey || e.metaKey) {
        updateCtrlState(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        if (isSpaceHeldRef.current) {
          isSpaceHeldRef.current = false;
          isPanningArtboardRef.current = false;
          onSpaceChange?.(false);
          controls.enableRotate = !isCtrlHeldRef.current && !isIntroActiveRef.current;
          controls.enablePan = !isCtrlHeldRef.current && !isIntroActiveRef.current;
          renderer.domElement.style.cursor = isCtrlHeldRef.current ? "grab" : "default";
        }
      }

      if (e.key === "Control" || e.key === "Meta" || (!e.ctrlKey && !e.metaKey)) {
        updateCtrlState(false);
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    const getPointerPos = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: -((clientY - rect.top) / rect.height) * 2 + 1,
        clientX,
        clientY,
      };
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const pos = getPointerPos(e);

      // 1. If Space is held: Start Illustrator / Blender style Artboard Panning
      if (isSpaceHeldRef.current) {
        isPanningArtboardRef.current = true;
        lastPointerPos.current = { x: pos.clientX, y: pos.clientY };
        renderer.domElement.style.cursor = "grabbing";
        soundFX.playPop(580);
        return;
      }

      // 2. If Ctrl is held: Start Individual Element Dragging
      const isCtrl = "ctrlKey" in e ? e.ctrlKey || e.metaKey || isCtrlHeldRef.current : isCtrlHeldRef.current;
      if (!isCtrl) return;

      mouse.set(pos.x, pos.y);
      raycaster.setFromCamera(mouse, camera);

      const allGroups = draggableObjects.current.map((d) => d.mesh);
      const intersects = raycaster.intersectObjects(allGroups, true);
      if (intersects.length > 0) {
        const targetData = findTargetData(intersects[0].object);
        if (targetData) {
          activeDragged.current = targetData;
          isDraggingAny.current = true;

          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);
          dragPlane.setFromNormalAndCoplanarPoint(camDir.negate(), targetData.mesh.position);

          if (raycaster.ray.intersectPlane(dragPlane, planeIntersect)) {
            dragOffset.copy(targetData.mesh.position).sub(planeIntersect);
          }

          renderer.domElement.style.cursor = "grabbing";
          soundFX.playPop(620);
          emitLayout(targetData.id);
        }
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const pos = getPointerPos(e);

      // 1. Handle Artboard Pan (Space + Drag)
      if (isPanningArtboardRef.current && isSpaceHeldRef.current) {
        const dx = pos.clientX - lastPointerPos.current.x;
        const dy = pos.clientY - lastPointerPos.current.y;
        lastPointerPos.current = { x: pos.clientX, y: pos.clientY };

        const dist = camera.position.distanceTo(controls.target);
        const factor = (dist * Math.tan((camera.fov * Math.PI) / 360) * 2) / window.innerHeight;

        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        const panRight = new THREE.Vector3().crossVectors(camera.up, camDir.clone().negate()).normalize();
        const panUp = camera.up.clone().normalize();

        const panDelta = panRight.clone().multiplyScalar(-dx * factor).add(panUp.clone().multiplyScalar(dy * factor));

        camera.position.add(panDelta);
        controls.target.add(panDelta);
        controls.update();
        emitLayout();
        return;
      }

      // 2. Handle Individual Object Move (Ctrl + Drag)
      const isCtrl = "ctrlKey" in e ? e.ctrlKey || e.metaKey || isCtrlHeldRef.current : isCtrlHeldRef.current;
      mouse.set(pos.x, pos.y);
      raycaster.setFromCamera(mouse, camera);

      if (activeDragged.current && isDraggingAny.current) {
        if (raycaster.ray.intersectPlane(dragPlane, planeIntersect)) {
          const newPos = planeIntersect.clone().add(dragOffset);
          activeDragged.current.targetPos.copy(newPos);
          activeDragged.current.basePos.copy(newPos);
          emitLayout(activeDragged.current.id);
        }
      } else if (isSpaceHeldRef.current) {
        renderer.domElement.style.cursor = "grab";
      } else if (isCtrl) {
        const allGroups = draggableObjects.current.map((d) => d.mesh);
        const intersects = raycaster.intersectObjects(allGroups, true);
        if (intersects.length > 0) {
          const targetData = findTargetData(intersects[0].object);
          if (targetData) {
            if (!targetData.isHovered) {
              soundFX.playChime(780, 0.2);
            }
            renderer.domElement.style.cursor = "grab";
            draggableObjects.current.forEach((d) => (d.isHovered = d === targetData));
          } else {
            renderer.domElement.style.cursor = "default";
            draggableObjects.current.forEach((d) => (d.isHovered = false));
          }
        } else {
          renderer.domElement.style.cursor = "default";
          draggableObjects.current.forEach((d) => (d.isHovered = false));
        }
      } else {
        draggableObjects.current.forEach((d) => (d.isHovered = false));
        renderer.domElement.style.cursor = "default";
      }
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (isPanningArtboardRef.current) {
        isPanningArtboardRef.current = false;
        renderer.domElement.style.cursor = isSpaceHeldRef.current ? "grab" : "default";
        soundFX.playPop(480);
      }

      if (activeDragged.current) {
        emitLayout(null);
        activeDragged.current = null;
        isDraggingAny.current = false;
        soundFX.playPop(520);
        const isCtrl = "ctrlKey" in e ? e.ctrlKey || e.metaKey || isCtrlHeldRef.current : isCtrlHeldRef.current;
        renderer.domElement.style.cursor = isCtrl ? "grab" : isSpaceHeldRef.current ? "grab" : "default";
      }
    };

    const onWheel = (e: WheelEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey || isCtrlHeldRef.current;
      if (isCtrl) {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 1.08 : 0.92;
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        const currentDist = offset.length();
        const newDist = Math.max(controls.minDistance, Math.min(controls.maxDistance, currentDist * factor));
        offset.setLength(newDist);
        camera.position.copy(controls.target).add(offset);
        controls.update();
        emitLayout(activeDragged.current?.id || null);
        soundFX.playChime(e.deltaY > 0 ? 520 : 740, 0.2);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onPointerDown);
    dom.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Continuous 3D Scroll Stream
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    const onWindowScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetScrollProgress = window.scrollY / maxScroll;
      }
    };
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    onWindowScroll();

    // =========================================================================
    // CINEMATIC INTRO ZOOM-OUT ANIMATION TARGETS (EXACT USER COORDINATES)
    // =========================================================================
    const INTRO_START_POS = new THREE.Vector3(-4.42, 6.07, 9.11);
    const INTRO_START_TARGET = new THREE.Vector3(-5.24, 2.97, -0.07);

    // Intermediate gentle drift target after 3s (keeps logo/video close & in focus)
    const SLOW_DRIFT_POS = new THREE.Vector3(-4.65, 6.25, 9.6);
    const SLOW_DRIFT_TARGET = new THREE.Vector3(-5.15, 2.92, -0.05);

    const DEFAULT_CAM_POS = new THREE.Vector3(18.62, 9.99, 16.72);
    const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 0, 0);

    // Render & Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // 1. Cinematic Intro Camera Zoom-out Animation (First 4s Video + Audio -> Then Video Only & Zoom Out)
      if (isIntroActiveRef.current) {
        introTimeRef.current += delta;
        const t = introTimeRef.current;

        const SLOW_PHASE_DURATION = 4.0; // First 4.0 seconds with video + audio
        const FULL_ZOOM_DURATION = 2.8; // 2.8 seconds of full zoom out transition
        const TOTAL_DURATION = SLOW_PHASE_DURATION + FULL_ZOOM_DURATION;

        // Audio Management: Only first 4.0s has audio, after 4.0s audio is strictly muted/paused!
        if (introAudioRef.current) {
          if (t < SLOW_PHASE_DURATION && !isMuted) {
            if (introAudioRef.current.paused) {
              introAudioRef.current.play().catch(() => {});
            }
            introAudioRef.current.volume = 1.0;
          } else {
            introAudioRef.current.volume = 0;
            if (!introAudioRef.current.paused) {
              introAudioRef.current.pause();
            }
          }
        }

        if (t < SLOW_PHASE_DURATION) {
          // Phase 1: First 4.0 seconds - VERY SLOW zoom out (Video + Audio)
          const p = t / SLOW_PHASE_DURATION;
          const ease = 1 - Math.pow(1 - p, 2); // gentle quad ease
          camera.position.lerpVectors(INTRO_START_POS, SLOW_DRIFT_POS, ease);
          controls.target.lerpVectors(INTRO_START_TARGET, SLOW_DRIFT_TARGET, ease);
        } else if (t <= TOTAL_DURATION) {
          // Phase 2: Full zoom out transition (Video continues looping silently!)
          const p = (t - SLOW_PHASE_DURATION) / FULL_ZOOM_DURATION;
          const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // smooth cubic ease in-out
          camera.position.lerpVectors(SLOW_DRIFT_POS, DEFAULT_CAM_POS, ease);
          controls.target.lerpVectors(SLOW_DRIFT_TARGET, DEFAULT_CAM_TARGET, ease);
        } else {
          // Finished: Enable full user controls, audio stopped, video loops silently forever
          isIntroActiveRef.current = false;
          if (introAudioRef.current) {
            introAudioRef.current.volume = 0;
            introAudioRef.current.pause();
          }
          camera.position.copy(DEFAULT_CAM_POS);
          controls.target.copy(DEFAULT_CAM_TARGET);
          controls.enableRotate = !isCtrlHeldRef.current && !isSpaceHeldRef.current;
          controls.enablePan = !isCtrlHeldRef.current && !isSpaceHeldRef.current;
        }
        controls.update();
      }

      // Smooth Inertial Scroll Progress
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.08;
      rootGroup.position.y = currentScrollProgress * 104.0;

      // Twinkling Starfield & Cosmic Dust Animation
      starField.rotation.y += delta * 0.02;
      starField.rotation.x = Math.sin(time * 0.2) * 0.05;
      dustParticles.rotation.y -= delta * 0.03;
      dustParticles.position.y = Math.sin(time * 0.5) * 0.6;

      if (!isIntroActiveRef.current) {
        controls.enableRotate = !isCtrlHeldRef.current && !isSpaceHeldRef.current;
        controls.enablePan = !isCtrlHeldRef.current && !isSpaceHeldRef.current;
        controls.update();

        if (isAutoRotateRef.current) {
          rootGroup.rotation.y += delta * 0.25;
        } else if (!isCtrlHeldRef.current && !isSpaceHeldRef.current) {
          const targetRotY = (mouse.x * Math.PI) / 24;
          const targetRotX = (-mouse.y * Math.PI) / 28;
          rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, targetRotY, delta * 3);
          rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, targetRotX, delta * 3);
        }
      }

      draggableObjects.current.forEach((obj) => {
        const isThisDragged = activeDragged.current === obj;

        const floatY = isThisDragged ? 0 : Math.sin(time * obj.floatSpeed + obj.phase) * obj.floatAmp;
        const floatRotZ = isThisDragged ? 0 : Math.cos(time * obj.floatSpeed * 0.8 + obj.phase) * obj.rotFloatAmp;
        const floatRotX = isThisDragged ? 0 : Math.sin(time * obj.floatSpeed * 0.7 + obj.phase) * (obj.rotFloatAmp * 0.6);

        const destPos = obj.targetPos.clone();
        destPos.y += floatY;
        if (obj.isHovered && !isThisDragged) {
          destPos.z += 0.15;
        }

        obj.currentPos.lerp(destPos, Math.min(1, delta * 10));
        obj.mesh.position.copy(obj.currentPos);

        obj.mesh.rotation.x = THREE.MathUtils.lerp(obj.mesh.rotation.x, obj.initialRot.x + floatRotX, delta * 8);
        obj.mesh.rotation.y = THREE.MathUtils.lerp(obj.mesh.rotation.y, obj.initialRot.y, delta * 8);
        obj.mesh.rotation.z = THREE.MathUtils.lerp(obj.mesh.rotation.z, obj.initialRot.z + floatRotZ, delta * 8);

        const targetScale = obj.isHovered && !isThisDragged ? 1.03 : 1;
        obj.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 12);
      });

      separateLettersList.forEach((letter) => {
        letter.mesh.position.y = letter.baseY + Math.sin(time * 2.4 + letter.phase) * 0.09;
        letter.mesh.rotation.x = Math.sin(time * 1.8 + letter.phase) * 0.06;
        letter.mesh.rotation.z = Math.cos(time * 1.5 + letter.phase) * 0.04;
      });

      if (textRing) {
        textRing.rotation.z += delta * 0.25;
      }

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      dom.removeEventListener("mousedown", onPointerDown);
      dom.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      dom.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      renderer.dispose();
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full relative cursor-default" />;
};
