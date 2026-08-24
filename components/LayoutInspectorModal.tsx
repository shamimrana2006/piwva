"use client";

import React, { useState } from "react";
import { Copy, Check, X, Sliders, Sparkles, Move, Camera, ZoomIn } from "lucide-react";
import { soundFX } from "../utils/soundEffects";

export interface LayoutCoords {
  [id: string]: [number, number, number];
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  distance: number;
}

interface LayoutInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutData: LayoutCoords;
  cameraState?: CameraState;
  isCtrlHeld: boolean;
  activeDraggedId?: string | null;
}

const ELEMENT_LABELS: Record<string, { name: string; icon: string; category: string }> = {
  // Stage 0: Hero Elements & Brand Media
  phone: { name: "স্মার্টফোন ৩ডি অ্যাপ স্ক্রিন", icon: "📱", category: "মূল উপাদান" },
  piwva_logo: { name: "Piwva ৩ডি লেটার লোগো", icon: "👑", category: "ব্র্যান্ডিং" },
  designed_logo_circle: { name: "ডিজাইন করা লোগো মেডেলিয়ন", icon: "🪙", category: "ব্র্যান্ডিং" },
  video_screen_circle: { name: "Piwva ভিডিও রিল ৩ডি স্ক্রিন", icon: "🎬", category: "ব্র্যান্ডিং" },
  color_palette: { name: "নার্সারি ও রুম ক্লাইমেট কার্ড", icon: "🌿", category: "পর্ব ০: নার্সারি" },
  product_card: { name: "শারীরিক ও মস্তিষ্কের বিকাশ কার্ড", icon: "🧸", category: "পর্ব ০: নার্সারি" },
  shop_now_btn: { name: "স্বাস্থ্য নির্দেশিকা বাটন পিল", icon: "🩺", category: "বাটন" },
  action_buttons: { name: "স্বাস্থ্য অ্যাকশন আইকন গ্রুপ", icon: "🔘", category: "বাটন" },

  // Stage 0.5: Sensory & Play
  wooden_blocks: { name: "মন্টেশ্বরী উডেন ব্লকস", icon: "🪵", category: "পর্ব ০.৫: সেন্সরি" },
  baby_rattle: { name: "টিথিং র্যাটল ও খেলনা", icon: "🧸", category: "পর্ব ০.৫: সেন্সরি" },
  card_laughing_photo: { name: "হাসিখুশি শিশুর ফটো কার্ড", icon: "📷", category: "পর্ব ০.৫: সেন্সরি" },
  ring_stacker_3d: { name: "৩ডি কাঠের রিং স্ট্যাকার", icon: "🪵", category: "পর্ব ০.৫: সেন্সরি" },

  // Stage 1: Safe Sleep & SIDS Prevention
  card_sleep_photo: { name: "ঘুমন্ত শিশুর ফটো কার্ড", icon: "📷", category: "পর্ব ১: নিরাপদ ঘুম" },
  card_sleep_tips: { name: "নিরাপদ ঘুমের ৪টি নিয়ম কার্ড", icon: "🌙", category: "পর্ব ১: নিরাপদ ঘুম" },
  moon_nightlight: { name: "৩ডি চাঁদ ও তারা মোবাইল", icon: "⭐", category: "পর্ব ১: নিরাপদ ঘুম" },
  temp_badge: { name: "রুম তাপমাত্রা ও আর্দ্রতা ব্যাজ", icon: "🌡️", category: "পর্ব ১: নিরাপদ ঘুম" },
  swaddle_guide_card: { name: "সোয়াডলিং ও রূপান্তর গাইড", icon: "🌿", category: "পর্ব ১: নিরাপদ ঘুম" },
  circadian_lamp_3d: { name: "৩ডি নার্সারি নাইটলাইট ল্যাম্প", icon: "💡", category: "পর্ব ১: নিরাপদ ঘুম" },

  // Stage 2: Tummy Time, Crawling & Brain
  card_tummy_photo: { name: "টামি টাইম শিশুর ফটো কার্ড", icon: "📷", category: "পর্ব ২: টামি টাইম" },
  card_tummy_tips: { name: "টামি টাইম মাইলস্টোন কার্ড", icon: "🧸", category: "পর্ব ২: টামি টাইম" },
  card_crawling_photo: { name: "হামাগুড়ি দেওয়া শিশুর ফটো", icon: "📷", category: "পর্ব ২: টামি টাইম" },
  parent_review: { name: "শিশু বিশেষজ্ঞের পরামর্শ কার্ড", icon: "⭐", category: "পর্ব ২: টামি টাইম" },
  contrast_card_3d: { name: "হাই-কনট্রাস্ট দৃষ্টি কার্ড", icon: "👀", category: "পর্ব ২: টামি টাইম" },
  wooden_abacus_3d: { name: "৩ডি মন্টেশ্বরী অ্যাবাকাস", icon: "🧮", category: "পর্ব ২: টামি টাইম" },
  milestone_3m_card: { name: "৩ মাসের মাইলস্টোন মেডেলিয়ন", icon: "✨", category: "পর্ব ২: টামি টাইম" },
  milestone_6m_card: { name: "৬ মাসের মাইলস্টোন মেডেলিয়ন", icon: "🌟", category: "পর্ব ২: টামি টাইম" },

  // Stage 3: Teething, Oral Care & Weaning
  card_teething_photo: { name: "টিথিং শিশুর ফটো কার্ড", icon: "📷", category: "পর্ব ৩: টিথিং" },
  card_teething_tips: { name: "টিথিং উপশম গাইড কার্ড", icon: "🦷", category: "পর্ব ৩: টিথিং" },
  silicone_beads_3d: { name: "৩ডি সিলিকন বিডস চেইন", icon: "✨", category: "পর্ব ৩: টিথিং" },
  eco_badge: { name: "১০০% নিরাপদ হেলথ সিল", icon: "🌱", category: "পর্ব ৩: টিথিং" },
  solids_guide_card: { name: "প্রথম শক্ত খাবার উইনিং গাইড", icon: "🥑", category: "পর্ব ৩: টিথিং" },
  wooden_spoon_3d: { name: "৩ডি কাঠের উইনিং চামচ", icon: "🥄", category: "পর্ব ৩: টিথিং" },
  oral_wipe_card: { name: "মাড়ি ও দাঁতের যত্ন কার্ড", icon: "🪥", category: "পর্ব ৩: টিথিং" },
  silicone_star_toy: { name: "৩ডি সিলিকন স্টার খেলনা", icon: "⭐", category: "পর্ব ৩: টিথিং" },

  // Stage 4: Kangaroo Care, Colic Relief & Bonding
  card_mother_photo: { name: "ক্যাঙ্গারু কেয়ার ফটো কার্ড", icon: "📷", category: "পর্ব ৪: ক্যাঙ্গারু কেয়ার" },
  card_colic_tips: { name: "কলিক ও গ্যাস নিরাময় কার্ড", icon: "🍼", category: "পর্ব ৪: ক্যাঙ্গারু কেয়ার" },
  cloud_mobile_3d: { name: "৩ডি ক্লাউড নার্সারি মোবাইল", icon: "☁️", category: "পর্ব ৪: ক্যাঙ্গারু কেয়ার" },
  newsletter_card: { name: "সাপ্তাহিক স্বাস্থ্য ক্লাব কার্ড", icon: "💌", category: "পর্ব ৪: ক্যাঙ্গারু কেয়ার" },
  burping_guide_card: { name: "ঢেকুর তোলানোর ৩ পদ্ধতি কার্ড", icon: "🍼", category: "পর্ব ৪: ক্যাঙ্গারু কেয়ার" },
  massage_oil_card: { name: "শিশুর বডি ম্যাসাজ রুটিন কার্ড", icon: "🌿", category: "পর্ব ৪: ক্যাঙ্গারু কেয়ার" },
  kangaroo_badge: { name: "স্কিন-টু-স্কিন সিল মেডেলিয়ন", icon: "❤️", category: "পর্ব ৪: ক্যাঙ্গারু কেয়ার" },
  heart_shield_3d: { name: "৩ডি হার্ট হেলথ শিল্ড", icon: "🛡️", category: "পর্ব ৪: ক্যাঙ্গারু কেয়ার" },

  // Stage 5: Clinical Warning Signs & Emergencies
  fever_protocol_card: { name: "জরুরি জ্বর সতর্কতা কার্ড", icon: "🚨", category: "পর্ব ৫: জরুরি লক্ষণ" },
  dehydration_card: { name: "ডিহাইড্রেশন সতর্কতা কার্ড", icon: "💧", category: "পর্ব ৫: জরুরি লক্ষণ" },
  breathing_card: { name: "শ্বাসকষ্ট পর্যবেক্ষণ কার্ড", icon: "🫁", category: "পর্ব ৫: জরুরি লক্ষণ" },
  thermometer_3d: { name: "৩ডি থার্মোমিটার মডেল", icon: "🌡️", category: "পর্ব ৫: জরুরি লক্ষণ" },
  stethoscope_badge: { name: "ক্লিনিক্যাল পরামর্শ মেডেলিয়ন", icon: "🩺", category: "পর্ব ৫: জরুরি লক্ষণ" },
  first_aid_kit_3d: { name: "৩ডি নার্সারি ফার্স্ট এইড বক্স", icon: "🩹", category: "পর্ব ৫: জরুরি লক্ষণ" },

  // Stage 6: Certifications & Rhythms
  fsc_wood_seal: { name: "এফএসসি সার্টিফাইড সিল", icon: "🌲", category: "পর্ব ৬: মানদণ্ড" },
  bpa_free_seal: { name: "বিপিএ-মুক্ত সিকিউরিটি সিল", icon: "🛡️", category: "পর্ব ৬: মানদণ্ড" },
  daily_rhythm_card: { name: "দৈনিক কেয়ার রুটিন কার্ড", icon: "⏰", category: "পর্ব ৬: মানদণ্ড" },
  bath_time_card: { name: "কুসুম গরম গোসল গাইড কার্ড", icon: "🛁", category: "পর্ব ৬: মানদণ্ড" },
  piwva_gold_crest: { name: "Piwva গোল্ড রয়্যাল ক্রেস্ট", icon: "👑", category: "পর্ব ৬: মানদণ্ড" },
  pediatric_club_seal: { name: "মেডিকেল বোর্ড সিল মেডেলিয়ন", icon: "🩺", category: "পর্ব ৬: মানদণ্ড" },
};

export const LayoutInspectorModal: React.FC<LayoutInspectorModalProps> = ({
  isOpen,
  onClose,
  layoutData,
  cameraState,
  isCtrlHeld,
  activeDraggedId,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("সবগুলো");

  if (!isOpen) return null;

  const categories = ["সবগুলো", ...Array.from(new Set(Object.values(ELEMENT_LABELS).map((e) => e.category)))];

  const filteredElements = Object.entries(layoutData).filter(([id]) => {
    if (selectedCategory === "সবগুলো") return true;
    const cat = ELEMENT_LABELS[id]?.category || "অন্যান্য";
    return cat === selectedCategory;
  });

  const generateJSON = () => {
    const payload = {
      camera: cameraState || {
        position: [18.62, 9.99, 16.72],
        target: [0.0, 0.0, 0.0],
        fov: 34.0,
        distance: 26.95,
      },
      elements: layoutData,
    };
    return JSON.stringify(payload, null, 2);
  };

  const handleCopy = (format: "json" | "js") => {
    soundFX.playPop(720);
    const content = generateJSON();
    navigator.clipboard.writeText(content);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn select-text">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>৩ডি লেআউট ও ক্যামেরা স্থানাঙ্ক পরিদর্শক</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  লাইভ আপডেট
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                ক্যানভাসে উপাদানগুলো ড্র্যাগ করার সাথে সাথে স্থানাঙ্ক রিয়েল-টাইমে পরিবর্তিত হয়
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.playPop(420);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Camera State Bar */}
        {cameraState && (
          <div className="px-6 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Camera className="w-3.5 h-3.5" /> ক্যামেরা স্থানাঙ্ক:
              </span>
              <span>
                Pos: [{cameraState.position.join(", ")}]
              </span>
              <span className="text-slate-400">
                Target: [{cameraState.target.join(", ")}]
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span>FOV: {cameraState.fov}°</span>
              <span className="text-emerald-400">দূরত্ব: {cameraState.distance}m</span>
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-50 border-b border-slate-200/60 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundFX.playPop(520);
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Coordinates Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredElements.map(([id, coords]) => {
              const meta = ELEMENT_LABELS[id] || { name: id, icon: "📦", category: "অন্যান্য" };
              const isActive = activeDraggedId === id;

              return (
                <div
                  key={id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/60 shadow-md scale-[1.02]"
                      : "bg-white border-slate-200/80 hover:border-amber-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{meta.icon}</span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[170px]" title={meta.name}>
                        {meta.name}
                      </span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold animate-pulse">
                        ড্র্যাগ হচ্ছে
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-700">
                    <div>
                      <span className="text-red-500 font-semibold">X:</span> {coords[0]}
                    </div>
                    <div>
                      <span className="text-green-600 font-semibold">Y:</span> {coords[1]}
                    </div>
                    <div>
                      <span className="text-blue-500 font-semibold">Z:</span> {coords[2]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>মোট ৫৪টি উপাদান সক্রিয়</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy("json")}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md cursor-pointer"
            >
              {copiedFormat === "json" ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>কপি সফল হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>সম্পূর্ণ JSON কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
