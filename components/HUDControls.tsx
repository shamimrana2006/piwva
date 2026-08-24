"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  Sun,
  Layers,
  Diamond,
  Palette,
  ZoomIn,
  ZoomOut,
  Sliders,
  Move,
} from "lucide-react";
import { TextColorTheme, TEXT_COLOR_THEMES } from "./create3DText";

interface HUDControlsProps {
  isAutoRotate: boolean;
  setIsAutoRotate: (val: boolean | ((prev: boolean) => boolean)) => void;
  isScattered: boolean;
  setIsScattered: (val: boolean | ((prev: boolean) => boolean)) => void;
  lightingTheme: "studio" | "warm" | "cool";
  setLightingTheme: (theme: "studio" | "warm" | "cool") => void;
  textColorTheme: TextColorTheme;
  setTextColorTheme: (theme: TextColorTheme) => void;
  onReset: () => void;
  onOpenLogoModal?: () => void;
  onOpenInspector?: () => void;
  isCtrlHeld?: boolean;
  isSpaceHeld?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const HUDControls: React.FC<HUDControlsProps> = ({
  isAutoRotate,
  setIsAutoRotate,
  isScattered,
  setIsScattered,
  lightingTheme,
  setLightingTheme,
  textColorTheme,
  setTextColorTheme,
  onReset,
  onOpenLogoModal,
  onOpenInspector,
  isCtrlHeld = false,
  isSpaceHeld = false,
  onZoomIn,
  onZoomOut,
}) => {
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(true);
  const themeList = Object.values(TEXT_COLOR_THEMES);

  return (
    <>
      {/* Top Left Brand / Watermark */}
      <div className="absolute top-6 left-6 md:left-8 z-20 select-none">
        <button
          onClick={onOpenLogoModal}
          className="flex items-center space-x-3 p-1.5 pr-4 rounded-2xl bg-white/80 hover:bg-white/95 backdrop-blur-md shadow-sm hover:shadow-md border border-white/60 transition-all group cursor-pointer text-left"
          title="Click to view interactive 3D Logo Showcase"
        >
          <div className="h-11 px-3 py-1 rounded-xl bg-white shadow-inner border border-black/5 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src="/logo/piwva-logo-pp.jpg.jpeg"
              alt="piwva logo"
              className="h-7 w-auto object-contain mix-blend-multiply"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-xl font-bold tracking-tight text-[#3b4746]">
                Piwva
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                3D
              </span>
            </div>
            <p className="text-xs font-medium text-[#6e8582] tracking-wide flex items-center gap-1">
              <span>Inspect 3D Logo</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </p>
          </div>
        </button>
      </div>

      {/* Top Right Live 3D Color Palette Switcher */}
      <div className="absolute top-6 right-6 md:right-8 z-20 flex flex-col items-end gap-2 select-none">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-lg transition-all">
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700">
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">3D Color:</span>
          </div>

          <div className="flex items-center gap-1">
            {themeList.map((item) => {
              const isSelected = textColorTheme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTextColorTheme(item.id)}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-md ring-2 ring-amber-400/80 scale-105"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                  title={`Apply ${item.name} finish`}
                >
                  <span
                    className={`w-3 h-3 rounded-full bg-gradient-to-tr ${item.dotGradient} border border-black/10 shadow-inner`}
                  />
                  <span className="hidden lg:inline">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gesture / Ctrl & Space Mode Hint Pill */}
        <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-xs font-medium text-[#4a5857]">
          <span
            className={`w-2 h-2 rounded-full transition-all ${
              isSpaceHeld
                ? "bg-sky-500 ring-4 ring-sky-400/30 scale-125"
                : isCtrlHeld
                ? "bg-amber-500 ring-4 ring-amber-400/30 scale-125"
                : "bg-emerald-500 animate-pulse"
            }`}
          />
          <span>
            {isSpaceHeld
              ? "🖐️ Artboard Pan Active (Space + Drag to move scene)"
              : isCtrlHeld
              ? "✋ Element Move Active (Ctrl + Drag any 3D card)"
              : "🖐️ Space+Drag to Pan Artboard • Ctrl+Drag to Move Cards • Wheel to Scroll"}
          </span>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 p-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl shadow-slate-900/5 select-none max-w-[95vw] overflow-x-auto">
        {/* Real-time Interaction Mode Status Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-black/5 text-xs font-semibold select-none">
          <span
            className={`w-2 h-2 rounded-full ${
              isSpaceHeld
                ? "bg-sky-500 animate-bounce"
                : isCtrlHeld
                ? "bg-amber-500 animate-bounce"
                : "bg-emerald-500 animate-pulse"
            }`}
          />
          <span className="text-[#334155]">
            {isSpaceHeld ? "Artboard Pan Mode (Space)" : isCtrlHeld ? "Drag 3D Objects Mode (Ctrl)" : "Orbit View Mode"}
          </span>
        </div>

        {/* 3D Layout Coordinates Inspector Panel Button */}
        {onOpenInspector && (
          <button
            onClick={onOpenInspector}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/20 text-amber-900 border border-amber-400/40 hover:from-amber-500/25 hover:to-orange-500/30 transition-all shadow-sm cursor-pointer"
            title="Open Real-time 3D Coordinates Inspector to copy/edit layout data"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>Layout Inspector</span>
          </button>
        )}

        {/* 3D Logo Showcase Modal Button */}
        {onOpenLogoModal && (
          <button
            onClick={onOpenLogoModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/70 hover:bg-white text-slate-700 border border-slate-200/80 transition-all shadow-sm cursor-pointer"
            title="Open 3D Logo Showcase & Inspector"
          >
            <Diamond className="w-3.5 h-3.5 text-amber-600" />
            <span>3D Logo</span>
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center bg-[#f1f5f9]/80 p-0.5 rounded-xl gap-0.5">
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="p-1.5 rounded-lg text-[#475569] hover:text-slate-900 hover:bg-white transition-all"
              title="Zoom Out (Make view smaller)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          )}
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="p-1.5 rounded-lg text-[#475569] hover:text-slate-900 hover:bg-white transition-all"
              title="Zoom In (Make view larger)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Explode / Scatter Toggle */}
        <button
          onClick={() => setIsScattered((prev) => !prev)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isScattered
              ? "bg-[#a88b6b] text-white shadow-md shadow-[#a88b6b]/30"
              : "glass-btn text-[#475569]"
          }`}
          title="Explode/Expand layers in 3D"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isScattered ? "Contract" : "Explode"}</span>
        </button>

        {/* Auto-Rotate Toggle */}
        <button
          onClick={() => setIsAutoRotate((prev) => !prev)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isAutoRotate
              ? "bg-[#a88b6b] text-white shadow-md shadow-[#a88b6b]/30"
              : "glass-btn text-[#475569]"
          }`}
          title="Toggle gentle scene rotation"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rotate</span>
        </button>

        {/* Lighting Preset Cycle */}
        <button
          onClick={() => {
            const next =
              lightingTheme === "studio"
                ? "warm"
                : lightingTheme === "warm"
                ? "cool"
                : "studio";
            setLightingTheme(next);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-btn text-[#475569]"
          title="Cycle Lighting Mood"
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="capitalize">{lightingTheme}</span>
        </button>

        {/* Reset Positions Button */}
        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-btn text-[#475569] hover:text-[#e63946]"
          title="Reset all positions and camera zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Subtle Mobile Gesture Hint */}
      <div className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-[11px] font-medium text-[#4a5857] whitespace-nowrap shadow-sm">
        💡 Drag letters & cards to move • Scroll/Pinch to zoom
      </div>
    </>
  );
};
