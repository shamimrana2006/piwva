import * as THREE from "three";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

let cachedFont: Font | null = null;
let fontLoadingPromise: Promise<Font> | null = null;

export type TextColorTheme =
  | "gold"
  | "chrome"
  | "rosegold"
  | "sapphire"
  | "emerald"
  | "amethyst"
  | "obsidian";

export interface ColorThemeDefinition {
  id: TextColorTheme;
  name: string;
  frontColor: number | string;
  sideColor: number | string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  glowColor: string;
  dotGradient: string;
  ringColor: number | string;
  particleColor: number | string;
}

export const TEXT_COLOR_THEMES: Record<TextColorTheme, ColorThemeDefinition> = {
  gold: {
    id: "gold",
    name: "24K Gold",
    frontColor: 0xdfb782,
    sideColor: 0xb88a4e,
    metalness: 0.96,
    roughness: 0.12,
    clearcoat: 1.0,
    glowColor: "#dfb782",
    dotGradient: "from-amber-600 to-yellow-300",
    ringColor: 0xdfb782,
    particleColor: 0xf6d365,
  },
  chrome: {
    id: "chrome",
    name: "Liquid Chrome",
    frontColor: 0xf8fafc,
    sideColor: 0x94a3b8,
    metalness: 0.98,
    roughness: 0.06,
    clearcoat: 1.0,
    glowColor: "#94a3b8",
    dotGradient: "from-slate-400 to-slate-100",
    ringColor: 0xe2e8f0,
    particleColor: 0xffffff,
  },
  rosegold: {
    id: "rosegold",
    name: "Rose Gold",
    frontColor: 0xfb7185,
    sideColor: 0xc46f5c,
    metalness: 0.93,
    roughness: 0.14,
    clearcoat: 0.95,
    glowColor: "#fb7185",
    dotGradient: "from-rose-500 to-pink-200",
    ringColor: 0xfb7185,
    particleColor: 0xfecdd3,
  },
  sapphire: {
    id: "sapphire",
    name: "Sapphire Blue",
    frontColor: 0x38bdf8,
    sideColor: 0x0284c7,
    metalness: 0.95,
    roughness: 0.1,
    clearcoat: 1.0,
    glowColor: "#38bdf8",
    dotGradient: "from-blue-600 to-cyan-300",
    ringColor: 0x38bdf8,
    particleColor: 0x7dd3fc,
  },
  emerald: {
    id: "emerald",
    name: "Emerald Jade",
    frontColor: 0x34d399,
    sideColor: 0x059669,
    metalness: 0.94,
    roughness: 0.12,
    clearcoat: 1.0,
    glowColor: "#34d399",
    dotGradient: "from-emerald-600 to-teal-300",
    ringColor: 0x34d399,
    particleColor: 0x6ee7b7,
  },
  amethyst: {
    id: "amethyst",
    name: "Amethyst Violet",
    frontColor: 0xc084fc,
    sideColor: 0x7e22ce,
    metalness: 0.94,
    roughness: 0.12,
    clearcoat: 1.0,
    glowColor: "#c084fc",
    dotGradient: "from-purple-600 to-pink-300",
    ringColor: 0xc084fc,
    particleColor: 0xe9d5ff,
  },
  obsidian: {
    id: "obsidian",
    name: "Obsidian Noir",
    frontColor: 0xffd166,
    sideColor: 0x1e293b,
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 0.9,
    glowColor: "#ffd166",
    dotGradient: "from-black to-amber-500",
    ringColor: 0xffd166,
    particleColor: 0xffd166,
  },
};

/**
 * Loads and caches the 3D typeface font for Piwva logo text.
 */
export function loadPiwvaFont(): Promise<Font> {
  if (cachedFont) return Promise.resolve(cachedFont);
  if (fontLoadingPromise) return fontLoadingPromise;

  const loader = new FontLoader();
  fontLoadingPromise = new Promise((resolve, reject) => {
    loader.load(
      "/fonts/helvetiker_bold.typeface.json",
      (font) => {
        cachedFont = font;
        resolve(font);
      },
      undefined,
      (err) => reject(err)
    );
  });
  return fontLoadingPromise;
}

export interface Text3DOptions {
  size?: number;
  depth?: number;
  letterSpacing?: number;
  bevelThickness?: number;
  bevelSize?: number;
  bevelSegments?: number;
  curveSegments?: number;
  frontColor?: string | number;
  sideColor?: string | number;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
}

export interface SeparateLetterData {
  mesh: THREE.Mesh;
  char: string;
  index: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
}

/**
 * Creates individual separate 3D letter meshes for each character with real geometric depth.
 */
export function createSeparate3DLetters(
  word: string,
  font: Font,
  options: Text3DOptions = {}
) {
  const size = options.size ?? 0.85;
  const depth = options.depth ?? 0.3;
  const letterSpacing = options.letterSpacing ?? 0.14;
  const bevelThickness = options.bevelThickness ?? 0.038;
  const bevelSize = options.bevelSize ?? 0.022;
  const bevelSegments = options.bevelSegments ?? 8;
  const curveSegments = options.curveSegments ?? 16;

  const group = new THREE.Group();
  const letterDataList: SeparateLetterData[] = [];

  const geoms: TextGeometry[] = [];
  const widths: number[] = [];

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const geom = new TextGeometry(char, {
      font,
      size,
      depth,
      curveSegments,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelOffset: 0,
      bevelSegments,
    });
    geom.computeBoundingBox();
    const bb = geom.boundingBox!;
    const w = bb.max.x - bb.min.x;
    geoms.push(geom);
    widths.push(w);
  }

  const totalW = widths.reduce((sum, w) => sum + w, 0) + (word.length - 1) * letterSpacing;
  let currentX = -totalW / 2;

  const frontMat = new THREE.MeshPhysicalMaterial({
    color: options.frontColor ?? 0xdfb782,
    metalness: options.metalness ?? 0.95,
    roughness: options.roughness ?? 0.12,
    clearcoat: options.clearcoat ?? 1.0,
    clearcoatRoughness: 0.08,
  });

  const sideMat = new THREE.MeshPhysicalMaterial({
    color: options.sideColor ?? 0xc49b64,
    metalness: options.metalness ?? 0.92,
    roughness: (options.roughness ?? 0.12) + 0.08,
    clearcoat: (options.clearcoat ?? 1.0) * 0.7,
  });

  for (let i = 0; i < word.length; i++) {
    const geom = geoms[i];
    const w = widths[i];

    geom.center();
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, [frontMat, sideMat]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const posX = currentX + w / 2;
    const posY = 0;
    const posZ = 0;
    mesh.position.set(posX, posY, posZ);

    group.add(mesh);

    letterDataList.push({
      mesh,
      char: word[i],
      index: i,
      baseX: posX,
      baseY: posY,
      baseZ: posZ,
      phase: i * 0.65,
    });

    currentX += w + letterSpacing;
  }

  return { group, letterDataList, frontMat, sideMat };
}

/**
 * Creates true extruded 3D Text Geometry with real geometric depth and bevels.
 */
export function create3DTextMesh(
  text: string,
  font: Font,
  options: Text3DOptions = {}
) {
  const size = options.size ?? 0.5;
  const depth = options.depth ?? 0.15;
  const bevelThickness = options.bevelThickness ?? 0.025;
  const bevelSize = options.bevelSize ?? 0.015;
  const bevelSegments = options.bevelSegments ?? 6;
  const curveSegments = options.curveSegments ?? 12;

  const geom = new TextGeometry(text, {
    font,
    size,
    depth,
    curveSegments,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelOffset: 0,
    bevelSegments,
  });
  geom.center();
  geom.computeVertexNormals();

  const frontMat = new THREE.MeshPhysicalMaterial({
    color: options.frontColor ?? 0xdfb782,
    metalness: options.metalness ?? 0.95,
    roughness: options.roughness ?? 0.12,
    clearcoat: options.clearcoat ?? 1.0,
    clearcoatRoughness: 0.08,
  });

  const sideMat = new THREE.MeshPhysicalMaterial({
    color: options.sideColor ?? 0xc49b64,
    metalness: options.metalness ?? 0.92,
    roughness: (options.roughness ?? 0.12) + 0.06,
    clearcoat: (options.clearcoat ?? 1.0) * 0.7,
  });

  const mesh = new THREE.Mesh(geom, [frontMat, sideMat]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return { mesh, geom, frontMat, sideMat };
}

/**
 * Procedural Normal Map & Bump Map Generator from Transparent Image
 */
export function generateLogoMaps(img: HTMLImageElement) {
  const width = 1024;
  const height = 340;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Draw source logo
  ctx.clearRect(0, 0, width, height);
  const targetW = width * 0.82;
  const targetH = (img.naturalHeight / img.naturalWidth) * targetW;
  const targetX = (width - targetW) / 2;
  const targetY = (height - targetH) / 2;
  ctx.drawImage(img, targetX, targetY, targetW, targetH);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 2. Diffuse / Color Map Canvas
  const diffuseCanvas = document.createElement("canvas");
  diffuseCanvas.width = width;
  diffuseCanvas.height = height;
  const dCtx = diffuseCanvas.getContext("2d")!;
  dCtx.drawImage(canvas, 0, 0);

  // 3. Bump / Height Map Canvas (Blurred Alpha for smooth embossed relief)
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext("2d")!;
  const bumpImgData = bCtx.createImageData(width, height);
  const bData = bumpImgData.data;

  // 4. Normal Map Canvas (Sobel Filter for crisp 3D bevels)
  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = width;
  normalCanvas.height = height;
  const nCtx = normalCanvas.getContext("2d")!;
  const normalImgData = nCtx.createImageData(width, height);
  const nData = normalImgData.data;

  // 5. Roughness & Metalness Canvas
  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rCtx = roughCanvas.getContext("2d")!;
  const roughImgData = rCtx.createImageData(width, height);
  const rData = roughImgData.data;

  // Fill height map based on alpha
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    bData[i] = alpha;
    bData[i + 1] = alpha;
    bData[i + 2] = alpha;
    bData[i + 3] = 255;

    rData[i] = alpha > 20 ? 35 : 220;
    rData[i + 1] = alpha > 20 ? 240 : 10;
    rData[i + 2] = 255;
    rData[i + 3] = 255;
  }
  bCtx.putImageData(bumpImgData, 0, 0);
  rCtx.putImageData(roughImgData, 0, 0);

  // Compute Normal Map via Sobel operator on height
  const getH = (x: number, y: number) => {
    const cx = Math.max(0, Math.min(width - 1, x));
    const cy = Math.max(0, Math.min(height - 1, y));
    return bData[(cy * width + cx) * 4] / 255;
  };

  const strength = 3.5;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const tl = getH(x - 1, y - 1);
      const t = getH(x, y - 1);
      const tr = getH(x + 1, y - 1);
      const l = getH(x - 1, y);
      const r = getH(x + 1, y);
      const bl = getH(x - 1, y + 1);
      const b = getH(x, y + 1);
      const br = getH(x + 1, y + 1);

      const dX = (tr + 2 * r + br - (tl + 2 * l + bl)) * strength;
      const dY = (bl + 2 * b + br - (tl + 2 * t + tr)) * strength;
      const dZ = 1.0;

      const len = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
      const nX = (dX / len) * 0.5 + 0.5;
      const nY = (-dY / len) * 0.5 + 0.5;
      const nZ = (dZ / len) * 0.5 + 0.5;

      nData[idx] = Math.round(nX * 255);
      nData[idx + 1] = Math.round(nY * 255);
      nData[idx + 2] = Math.round(nZ * 255);
      nData[idx + 3] = 255;
    }
  }
  nCtx.putImageData(normalImgData, 0, 0);

  const diffuseTex = new THREE.CanvasTexture(diffuseCanvas);
  diffuseTex.colorSpace = THREE.SRGBColorSpace;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  const normalTex = new THREE.CanvasTexture(normalCanvas);
  const roughTex = new THREE.CanvasTexture(roughCanvas);

  return { diffuseTex, bumpTex, normalTex, roughTex };
}

// Helper to create rounded 2D planes with exact matching UVs
export function createRoundedPlaneGeometry(
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

  // Generate exact 0..1 UV coordinates across the plane
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
