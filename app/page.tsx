"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { HUDControls } from "@/components/HUDControls";
import {
  LayoutInspectorModal,
  LayoutCoords,
  CameraState,
} from "@/components/LayoutInspectorModal";
import { Logo3DElement } from "@/components/Logo3DElement";
import { TextColorTheme } from "@/components/create3DText";
import { NewbornHealthGuideSections } from "@/components/NewbornHealthGuideSections";
import { Volume2 } from "lucide-react";

// Dynamic import for Scene to prevent SSR issues with Three.js
const Scene = dynamic(
  () => import("@/components/Scene").then((mod) => mod.Scene),
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
  const [bgTheme, setBgTheme] = useState<"dark-starry" | "light-soft" | "warm-nebula">("dark-starry");
  const [textColorTheme, setTextColorTheme] = useState<TextColorTheme>("gold");
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [zoomTrigger, setZoomTrigger] = useState<number>(0);
  const [replayIntroTrigger, setReplayIntroTrigger] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
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

  const handleReplayIntro = () => {
    setReplayIntroTrigger((prev) => prev + 1);
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
  const track3DRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (track3DRef.current) {
        const trackHeight = track3DRef.current.offsetHeight - window.innerHeight;
        if (trackHeight > 0) {
          const p = Math.min(1.0, Math.max(0, window.scrollY / trackHeight));
          setScrollProgress(p);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine current 3D Stage name based on scroll depth (7 distinct stages in Bengali)
  const getStageInfo = () => {
    if (scrollProgress < 0.12) {
      return { stage: "পর্ব ০", title: "🌿 নার্সারি ও ব্র্যান্ড ভিডিও রিল", color: "bg-emerald-100/90 text-emerald-800 border-emerald-300" };
    } else if (scrollProgress < 0.26) {
      return { stage: "পর্ব ১", title: "🌙 নিরাপদ ঘুম ও সিডস প্রতিরোধ", color: "bg-blue-100/90 text-blue-800 border-blue-300" };
    } else if (scrollProgress < 0.42) {
      return { stage: "পর্ব ২", title: "🧸 টামি টাইম ও শারীরিক মোটর বিকাশ", color: "bg-amber-100/90 text-amber-800 border-amber-300" };
    } else if (scrollProgress < 0.58) {
      return { stage: "পর্ব ৩", title: "🦷 টিথিং, মাড়ির যত্ন ও প্রথম উইনিং", color: "bg-purple-100/90 text-purple-800 border-purple-300" };
    } else if (scrollProgress < 0.74) {
      return { stage: "পর্ব ৪", title: "❤️ ক্যাঙ্গারু কেয়ার ও কলিক উপশম", color: "bg-rose-100/90 text-rose-800 border-rose-300" };
    } else if (scrollProgress < 0.88) {
      return { stage: "পর্ব ৫", title: "🚨 জরুরি স্বাস্থ্য সতর্কতা লক্ষণ", color: "bg-red-100/90 text-red-800 border-red-300" };
    } else {
      return { stage: "পর্ব ৬", title: "🏆 এফএসসি সার্টিফাইড ও দৈনিক রুটিন", color: "bg-teal-100/90 text-teal-800 border-teal-300" };
    }
  };

  const currentStage = getStageInfo();

  return (
    <main className={`relative min-h-screen w-full ${bgTheme === "dark-starry" ? "bg-[#0c1517]" : bgTheme === "warm-nebula" ? "bg-[#181412]" : "bg-[#c5d5d3]"} overflow-x-hidden selection:bg-[#dfb782]/30 transition-colors duration-500`}>
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
          bgTheme={bgTheme}
          textColorTheme={textColorTheme}
          resetTrigger={resetTrigger}
          zoomTrigger={zoomTrigger}
          replayIntroTrigger={replayIntroTrigger}
          isMuted={isMuted}
          scrollProgress={scrollProgress}
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
        bgTheme={bgTheme}
        setBgTheme={setBgTheme}
        textColorTheme={textColorTheme}
        setTextColorTheme={setTextColorTheme}
        onReset={handleReset}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        onOpenInspector={() => setIsInspectorOpen((prev) => !prev)}
        onReplayIntro={handleReplayIntro}
        isCtrlHeld={isCtrlHeld}
        isSpaceHeld={isSpaceHeld}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Tall Virtual Scroll Journey Track for 54 3D Stream (Exclusively controls 3D journey) */}
      <div
        ref={track3DRef}
        className="relative z-10 pointer-events-none h-[1100vh] flex flex-col justify-between"
      >
        {/* Top Hint (Bengali) */}
        <div className="pt-24 flex justify-center">
          <div className="bg-white/85 backdrop-blur-md px-5 py-2 rounded-full border border-white shadow-sm text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-2 animate-bounce">
            <span>নিচে স্ক্রল করে ৫৪+ ৩ডি স্বাস্থ্য কার্ড, ভিডিও রিল ও শিশুর ছবি আবিষ্কার করুন ↓</span>
          </div>
        </div>

        {/* Midpoint Scroll Indicators */}
        <div className="flex flex-col items-center gap-3 text-center opacity-70">
          <span className="text-xs font-bold text-white bg-slate-900/60 backdrop-blur-md px-4 py-1 rounded-full border border-white/20 tracking-wider">
            ৩ডি উপাদান স্ক্রল সমাপ্তি: {Math.round(scrollProgress * 100)}%
          </span>
        </div>

        {/* Bottom Journey Complete Hint */}
        <div className="pb-16 flex justify-center">
          <div className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-white shadow-md text-xs font-bold text-[#15803d] tracking-wider flex items-center gap-2">
            <span>🏆 ৫৪টি ৩ডি উপাদান সমাপ্ত • নিচে বিস্তারিত স্বাস্থ্য গাইড দেখুন ↓</span>
          </div>
        </div>
      </div>

      {/* Complete Bengali Newborn Health & Pediatrician Guide Sections */}
      <div className="relative z-10 pointer-events-auto bg-slate-900/95 text-white backdrop-blur-2xl border-t border-slate-700/60 shadow-2xl">
        <NewbornHealthGuideSections />
      </div>

      {/* 3D Logo Showcase Modal Dialog */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl h-[650px] bg-gradient-to-b from-slate-900 via-[#162220] to-slate-950 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <Logo3DElement
              initialPreset="gold"
              isModal={true}
              onClose={() => setIsLogoModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3D Layout Coordinates & Camera Inspector Modal */}
      <LayoutInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        layoutData={layoutData}
        cameraState={cameraState}
        isCtrlHeld={isCtrlHeld}
        activeDraggedId={activeDraggedId}
      />
    </main>
  );
}
