"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { HUDControls } from "@/components/HUDControls";
import { TextColorTheme } from "@/components/create3DText";
import { LayoutInspectorModal, LayoutCoords, CameraState } from "@/components/LayoutInspectorModal";
import { NewbornHealthGuideSections } from "@/components/NewbornHealthGuideSections";

// Dynamic import of 3D Scene to prevent SSR Canvas hydration mismatch
const Scene = dynamic(
  () => import("@/components/Scene").then((mod) => mod.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#c5d5d3]">
        <div className="w-12 h-12 rounded-2xl border-4 border-[#a88b6b]/30 border-t-[#a88b6b] animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-[#4a5857] uppercase animate-pulse">
          Loading 3D Canvas...
        </p>
      </div>
    ),
  }
);

// Dynamic import of 3D Logo Element Showcase Modal
const Logo3DElement = dynamic(
  () => import("@/components/Logo3DElement").then((mod) => mod.Logo3DElement),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    ),
  }
);

export default function Home() {
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isScattered, setIsScattered] = useState<boolean>(false);
  const [lightingTheme, setLightingTheme] = useState<"studio" | "warm" | "cool">("studio");
  const [textColorTheme, setTextColorTheme] = useState<TextColorTheme>("gold");
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [zoomTrigger, setZoomTrigger] = useState<number>(0);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isCtrlHeld, setIsCtrlHeld] = useState<boolean>(false);
  const [isSpaceHeld, setIsSpaceHeld] = useState<boolean>(false);
  const [layoutData, setLayoutData] = useState<LayoutCoords>({});
  const [cameraState, setCameraState] = useState<CameraState | undefined>(undefined);
  const [activeDraggedId, setActiveDraggedId] = useState<string | null>(null);

  const handleReset = () => {
    setIsScattered(false);
    setIsAutoRotate(false);
    setResetTrigger((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    setZoomTrigger((prev) => (prev <= 0 ? 1 : prev + 1));
  };

  const handleZoomOut = () => {
    setZoomTrigger((prev) => (prev >= 0 ? -1 : prev - 1));
  };

  const handleLayoutChange = (
    layout: LayoutCoords,
    activeId?: string | null,
    cam?: CameraState
  ) => {
    setLayoutData(layout);
    if (activeId !== undefined) {
      setActiveDraggedId(activeId);
    }
    if (cam) {
      setCameraState(cam);
    }
  };

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine current 3D Stage name based on scroll depth (7 distinct stages in Bengali/English)
  const getStageInfo = () => {
    if (scrollProgress < 0.12) {
      return { stage: "Stage 0", title: "🌿 নার্সারি ও ব্র্যান্ড রিল", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    } else if (scrollProgress < 0.26) {
      return { stage: "Stage 1", title: "🌙 নিরাপদ ঘুম ও সিডস প্রতিরোধ", color: "bg-blue-100 text-blue-800 border-blue-300" };
    } else if (scrollProgress < 0.42) {
      return { stage: "Stage 2", title: "🧸 টামি টাইম ও শারীরিক মোটর বিকাশ", color: "bg-amber-100 text-amber-800 border-amber-300" };
    } else if (scrollProgress < 0.58) {
      return { stage: "Stage 3", title: "🦷 টিথিং, মাড়ির যত্ন ও প্রথম উইনিং", color: "bg-purple-100 text-purple-800 border-purple-300" };
    } else if (scrollProgress < 0.74) {
      return { stage: "Stage 4", title: "❤️ ক্যাঙ্গারু কেয়ার ও কলিক উপশম", color: "bg-rose-100 text-rose-800 border-rose-300" };
    } else if (scrollProgress < 0.88) {
      return { stage: "Stage 5", title: "🚨 জরুরি স্বাস্থ্য সতর্কতা লক্ষণ", color: "bg-red-100 text-red-800 border-red-300" };
    } else {
      return { stage: "Stage 6", title: "🏆 এফএসসি সার্টিফাইড ও দৈনিক রুটিন", color: "bg-teal-100 text-teal-800 border-teal-300" };
    }
  };

  const currentStage = getStageInfo();

  return (
    <main className="relative min-h-screen w-full bg-[#c5d5d3] overflow-x-hidden selection:bg-[#dfb782]/30">
      {/* Top Scroll Progress Line */}
      <div
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-[#dfb782] via-[#15803d] to-[#38bdf8] z-50 transition-all duration-150"
        style={{ width: `${Math.round(scrollProgress * 100)}%` }}
      />

      {/* Fixed 3D Canvas Viewport */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Scene
          isAutoRotate={isAutoRotate}
          isScattered={isScattered}
          lightingTheme={lightingTheme}
          textColorTheme={textColorTheme}
          resetTrigger={resetTrigger}
          zoomTrigger={zoomTrigger}
          onLayoutChange={handleLayoutChange}
          onCtrlChange={setIsCtrlHeld}
          onSpaceChange={setIsSpaceHeld}
        />
      </div>

      {/* Floating Live 3D Stage Tracker Badge */}
      <div className="fixed top-4 left-6 z-40 hidden sm:flex items-center gap-2.5">
        <div className={`px-4 py-2 rounded-2xl border backdrop-blur-md shadow-md text-xs font-bold transition-all duration-300 flex items-center gap-2 ${currentStage.color}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{currentStage.stage}: {currentStage.title}</span>
        </div>
      </div>

      {/* Floating HUD Controls */}
      <HUDControls
        isAutoRotate={isAutoRotate}
        setIsAutoRotate={setIsAutoRotate}
        isScattered={isScattered}
        setIsScattered={setIsScattered}
        lightingTheme={lightingTheme}
        setLightingTheme={setLightingTheme}
        textColorTheme={textColorTheme}
        setTextColorTheme={setTextColorTheme}
        onReset={handleReset}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        onOpenInspector={() => setIsInspectorOpen((prev) => !prev)}
        isCtrlHeld={isCtrlHeld}
        isSpaceHeld={isSpaceHeld}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Tall Virtual Scroll Journey Track for 50+ 3D Stream */}
      <div className="relative z-10 pointer-events-none h-[900vh] flex flex-col justify-between">
        {/* Top Hint */}
        <div className="pt-24 flex justify-center">
          <div className="bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border border-white shadow-sm text-xs font-bold text-[#2d3748] uppercase tracking-wider flex items-center gap-2 animate-bounce">
            <span>Scroll down to explore 50+ 3D newborn health cards, video reels & baby photos ↓</span>
          </div>
        </div>

        {/* Midpoint Scroll Indicators */}
        <div className="flex flex-col items-center gap-3 text-center opacity-60">
          <span className="text-xs font-bold text-[#2d3748] tracking-widest uppercase">
            3D Continuous Journey ({Math.round(scrollProgress * 100)}%)
          </span>
        </div>
      </div>

      {/* 3D Layout Positions & Camera Zoom Inspector Popup */}
      <LayoutInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        layoutData={layoutData}
        cameraState={cameraState}
        isCtrlHeld={isCtrlHeld}
        activeDraggedId={activeDraggedId}
      />

      {/* 3D Logo Showcase Modal / Closeup Inspector */}
      {isLogoModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLogoModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/45 backdrop-blur-md transition-opacity duration-300"
        >
          <div className="relative w-full max-w-4xl h-[600px] max-h-[88vh] rounded-3xl bg-[#c5d5d3]/95 border border-white/70 shadow-2xl overflow-hidden flex flex-col">
            <Logo3DElement onClose={() => setIsLogoModalOpen(false)} isModal={true} />
          </div>
        </div>
      )}

      {/* Detailed Newborn Baby Health Guide Chapters & Clinical Articles at Page End */}
      <div className="relative z-20">
        <NewbornHealthGuideSections />
      </div>
    </main>
  );
}
