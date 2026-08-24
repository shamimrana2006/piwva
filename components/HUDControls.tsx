"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Layers,
  Diamond,
  Palette,
  ZoomIn,
  ZoomOut,
  Sliders,
  Volume2,
  VolumeX,
  PlayCircle,
} from "lucide-react";
import { TextColorTheme, TEXT_COLOR_THEMES } from "./create3DText";
import { soundFX } from "../utils/soundEffects";

interface HUDControlsProps {
  isAutoRotate: boolean;
  setIsAutoRotate: (val: boolean | ((prev: boolean) => boolean)) => void;
  isScattered: boolean;
  setIsScattered: (val: boolean | ((prev: boolean) => boolean)) => void;
  lightingTheme: "studio" | "warm" | "cool";
  setLightingTheme: (theme: "studio" | "warm" | "cool") => void;
  bgTheme?: "dark-starry" | "light-soft" | "warm-nebula";
  setBgTheme?: (theme: "dark-starry" | "light-soft" | "warm-nebula") => void;
  textColorTheme: TextColorTheme;
  setTextColorTheme: (theme: TextColorTheme) => void;
  onReset: () => void;
  onOpenLogoModal?: () => void;
  onOpenInspector?: () => void;
  onReplayIntro?: () => void;
  isCtrlHeld?: boolean;
  isSpaceHeld?: boolean;
  isMuted?: boolean;
  setIsMuted?: (val: boolean | ((prev: boolean) => boolean)) => void;
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
  bgTheme = "dark-starry",
  setBgTheme,
  textColorTheme,
  setTextColorTheme,
  onReset,
  onOpenLogoModal,
  onOpenInspector,
  onReplayIntro,
  isCtrlHeld = false,
  isSpaceHeld = false,
  isMuted = false,
  setIsMuted,
  onZoomIn,
  onZoomOut,
}) => {
  const themeList = Object.values(TEXT_COLOR_THEMES);

  return (
    <>
      {/* Top Left Brand Watermark & Modal Trigger */}
      <div className="absolute top-5 left-5 md:left-8 z-20 select-none">
        <button
          onClick={() => {
            soundFX.playChime(880);
            onOpenLogoModal?.();
          }}
          className="flex items-center space-x-3 p-1.5 pr-4 rounded-2xl bg-white/85 hover:bg-white backdrop-blur-md shadow-sm hover:shadow-md border border-white/70 transition-all group cursor-pointer text-left"
          title="৩ডি লোগো ও ব্র্যান্ড ইন্সপেক্টর দেখুন"
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
              <h1 className="text-xl font-bold tracking-tight text-[#1e293b]">
                Piwva
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                ৩ডি
              </span>
            </div>
            <p className="text-xs font-medium text-[#64748b] tracking-wide flex items-center gap-1">
              <span>৩ডি লোগো ও ব্র্যান্ড</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </p>
          </div>
        </button>
      </div>

      {/* Top Right Controls (3D Color Switcher & Status Badges) */}
      <div className="absolute top-5 right-5 md:right-8 z-20 flex flex-col items-end gap-2 select-none">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-lg transition-all">
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700">
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">৩ডি রং:</span>
          </div>

          <div className="flex items-center gap-1">
            {themeList.map((item) => {
              const isSelected = textColorTheme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFX.playPop(660);
                    setTextColorTheme(item.id);
                  }}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-md ring-2 ring-amber-400/80 scale-105"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                  title={`${item.nameBengali || item.name} ৩ডি মেটালিক টেক্সচার প্রয়োগ করুন`}
                >
                  <span
                    className={`w-3 h-3 rounded-full bg-gradient-to-tr ${item.dotGradient} border border-black/10 shadow-inner`}
                  />
                  <span className="hidden lg:inline">{item.nameBengali || item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Control Mode Hint Pill (Bengali) */}
        <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/60 shadow-sm text-xs font-medium text-[#334155]">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isSpaceHeld
                ? "bg-sky-500 ring-4 ring-sky-400/30 scale-125"
                : isCtrlHeld
                ? "bg-amber-500 ring-4 ring-amber-400/30 scale-125"
                : "bg-emerald-500 animate-pulse"
            }`}
          />
          <span>
            {isSpaceHeld
              ? "🖐️ আর্টবোর্ড প্যান মোড সক্রিয় (Space চেপে ধরে ড্র্যাগ করে ক্যানভাস সরান)"
              : isCtrlHeld
              ? "✋ ৩ডি উপাদান মুভ মোড সক্রিয় (Ctrl চেপে যেকোনো কার্ড বা খেলনা সরান)"
              : "🖐️ Space+Drag: আর্টবোর্ড প্যান • Ctrl+Drag: কার্ড মুভ • Scroll: স্ক্রল"}
          </span>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 p-2 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-xl shadow-slate-900/5 select-none max-w-[95vw] overflow-x-auto">
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
            {isSpaceHeld ? "আর্টবোর্ড প্যান (Space)" : isCtrlHeld ? "কার্ড ড্র্যাগ মোড (Ctrl)" : "অরবিট মোড"}
          </span>
        </div>

        {/* Replay Cinematic Intro Zoom Button */}
        {onReplayIntro && (
          <button
            onClick={() => {
              soundFX.playWhoosh();
              onReplayIntro();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 transition-all shadow-sm cursor-pointer"
            title="ভিডিও রিলের সিনেম্যাটিক জুম-আউট অ্যানিমেশন পুনরায় দেখুন"
          >
            <PlayCircle className="w-3.5 h-3.5 text-sky-600" />
            <span>জুম রিপ্লে</span>
          </button>
        )}

        {/* 3D Layout Coordinates Inspector Panel Button */}
        {onOpenInspector && (
          <button
            onClick={() => {
              soundFX.playPop(520);
              onOpenInspector();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/20 text-amber-900 border border-amber-400/40 hover:from-amber-500/25 hover:to-orange-500/30 transition-all shadow-sm cursor-pointer"
            title="৩ডি উপাদানসমূহের সঠিক স্থানাঙ্ক পরিদর্শক ও কপি প্যানেল"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>লেআউট পরিদর্শক</span>
          </button>
        )}

        {/* 3D Logo Modal Button */}
        {onOpenLogoModal && (
          <button
            onClick={() => {
              soundFX.playChime(880);
              onOpenLogoModal();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/70 hover:bg-white text-slate-700 border border-slate-200/80 transition-all shadow-sm cursor-pointer"
            title="৩ডি লোগো পরিদর্শন"
          >
            <Diamond className="w-3.5 h-3.5 text-amber-600" />
            <span>৩ডি লোগো</span>
          </button>
        )}

        {/* Sound Toggle Button */}
        {setIsMuted && (
          <button
            onClick={() => {
              if (isMuted) {
                soundFX.setMuted(false);
                soundFX.playChime(880);
              }
              setIsMuted((prev) => !prev);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !isMuted
                ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm"
                : "glass-btn text-[#64748b]"
            }`}
            title={!isMuted ? "শব্দ বন্ধ করুন" : "ইন্টারেক্টিভ শব্দ চালু করুন"}
          >
            {!isMuted ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{!isMuted ? "শব্দ: চালু" : "শব্দ: বন্ধ"}</span>
          </button>
        )}

        {/* Dark/Light Starry Background Toggle */}
        {setBgTheme && (
          <button
            onClick={() => {
              soundFX.playPop(580);
              const next =
                bgTheme === "dark-starry"
                  ? "light-soft"
                  : bgTheme === "light-soft"
                  ? "warm-nebula"
                  : "dark-starry";
              setBgTheme(next);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-btn text-[#334155] cursor-pointer"
            title="নাইট মোড ও জ্বলজ্বলে তারা ব্যাকগ্রাউন্ড পরিবর্তন করুন"
          >
            {bgTheme === "dark-starry" ? (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            ) : bgTheme === "warm-nebula" ? (
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>
              {bgTheme === "dark-starry"
                ? "🌌 নাইট স্কাই"
                : bgTheme === "warm-nebula"
                ? "✨ নেবুলা তারা"
                : "☀️ ডে মোড"}
            </span>
          </button>
        )}

        {/* Zoom In / Out Controls */}
        <div className="flex items-center bg-[#f1f5f9]/80 p-0.5 rounded-xl gap-0.5">
          {onZoomOut && (
            <button
              onClick={() => {
                soundFX.playPop(480);
                onZoomOut();
              }}
              className="p-1.5 rounded-lg text-[#475569] hover:text-slate-900 hover:bg-white transition-all"
              title="জুম আউট (ছোট করুন)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          )}
          {onZoomIn && (
            <button
              onClick={() => {
                soundFX.playPop(680);
                onZoomIn();
              }}
              className="p-1.5 rounded-lg text-[#475569] hover:text-slate-900 hover:bg-white transition-all"
              title="জুম ইন (বড় করুন)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Explode / Contract Toggle */}
        <button
          onClick={() => {
            soundFX.playPop(520);
            setIsScattered((prev) => !prev);
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isScattered
              ? "bg-[#a88b6b] text-white shadow-md shadow-[#a88b6b]/30"
              : "glass-btn text-[#475569]"
          }`}
          title="সব উপাদান ৩ডি স্পেসে ছড়িয়ে দিন / একত্রিত করুন"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isScattered ? "একত্রিত করুন" : "ছড়িয়ে দিন"}</span>
        </button>

        {/* Auto-Rotate Toggle */}
        <button
          onClick={() => {
            soundFX.playPop(620);
            setIsAutoRotate((prev) => !prev);
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isAutoRotate
              ? "bg-[#a88b6b] text-white shadow-md shadow-[#a88b6b]/30"
              : "glass-btn text-[#475569]"
          }`}
          title="স্বয়ংক্রিয় ৩ডি ঘূর্ণন চালু / বন্ধ করুন"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>অটো-ঘূর্ণন</span>
        </button>

        {/* Reset Positions Button */}
        <button
          onClick={() => {
            soundFX.playWhoosh();
            onReset();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-btn text-[#475569] hover:text-[#e63946]"
          title="সকল উপাদানের স্থান ও ক্যামেরা রিসেট করুন"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট ভিউ</span>
        </button>
      </div>

      {/* Mobile Gesture Hint (Bengali) */}
      <div className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[11px] font-medium text-[#334155] whitespace-nowrap shadow-sm border border-white">
        💡 উপাদান সরাতে ড্র্যাগ করুন • জুম করতে পিঞ্চ / স্ক্রল করুন
      </div>
    </>
  );
};
