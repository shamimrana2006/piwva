"use client";

import React, { useState } from "react";
import { Copy, Check, X, Sliders, Sparkles, Move, Camera, ZoomIn } from "lucide-react";

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
  phone: { name: "Newborn Health App Screen", icon: "📱", category: "Core" },
  piwva_logo: { name: "Piwva 3D Logo Letters", icon: "👑", category: "Branding" },
  designed_logo_circle: { name: "Designed Logo JPEG Medallion", icon: "🪙", category: "Branding" },
  video_screen_circle: { name: "Piwva Video Reel (MP4)", icon: "🎬", category: "Branding" },
  color_palette: { name: "Nursery & Skin Climate Card", icon: "🌿", category: "Stage 0: Hero" },
  product_card: { name: "Motor & Sensory Health Card", icon: "🧸", category: "Stage 0: Hero" },
  shop_now_btn: { name: "Pediatric Health Guide Pill", icon: "🩺", category: "Buttons" },
  action_buttons: { name: "Health Action Icons (Doc/Heart)", icon: "🔘", category: "Buttons" },

  // Stage 0.5: Sensory & Play
  wooden_blocks: { name: "Montessori Wooden Blocks", icon: "🪵", category: "Stage 0.5: Sensory" },
  baby_rattle: { name: "Teething Rattle & Sensory Toy", icon: "🧸", category: "Stage 0.5: Sensory" },
  card_laughing_photo: { name: "Laughing Baby Photo Card", icon: "📷", category: "Stage 0.5: Sensory" },
  ring_stacker_3d: { name: "3D Wooden Ring Stacker", icon: "🪵", category: "Stage 0.5: Sensory" },

  // Stage 1: Safe Sleep & SIDS Prevention
  card_sleep_photo: { name: "Sleeping Baby Photo Card", icon: "📷", category: "Stage 1: Safe Sleep" },
  card_sleep_tips: { name: "Safe Sleep Guidelines Card", icon: "🌙", category: "Stage 1: Safe Sleep" },
  moon_nightlight: { name: "3D Moon & Stars Mobile", icon: "⭐", category: "Stage 1: Safe Sleep" },
  temp_badge: { name: "Climate & Humidity Medallion", icon: "🌡️", category: "Stage 1: Safe Sleep" },
  swaddle_guide_card: { name: "Swaddle Safety Guide Card", icon: "🌿", category: "Stage 1: Safe Sleep" },
  circadian_lamp_3d: { name: "3D Nursery Nightlight Lamp", icon: "💡", category: "Stage 1: Safe Sleep" },

  // Stage 2: Tummy Time, Crawling & Brain
  card_tummy_photo: { name: "Tummy Time Baby Photo Card", icon: "📷", category: "Stage 2: Tummy Time" },
  card_tummy_tips: { name: "Tummy Time Milestone Card", icon: "🧸", category: "Stage 2: Tummy Time" },
  card_crawling_photo: { name: "Crawling Baby Photo Card", icon: "📷", category: "Stage 2: Tummy Time" },
  parent_review: { name: "Pediatric Endorsement Card", icon: "⭐", category: "Stage 2: Tummy Time" },
  contrast_card_3d: { name: "High-Contrast Visual Card", icon: "👀", category: "Stage 2: Tummy Time" },
  wooden_abacus_3d: { name: "3D Montessori Abacus Model", icon: "🧮", category: "Stage 2: Tummy Time" },
  milestone_3m_card: { name: "3-Month Milestones Badge", icon: "✨", category: "Stage 2: Tummy Time" },
  milestone_6m_card: { name: "6-Month Milestones Badge", icon: "🌟", category: "Stage 2: Tummy Time" },

  // Stage 3: Teething, Oral Care & Weaning
  card_teething_photo: { name: "Teething Baby Photo Card", icon: "📷", category: "Stage 3: Teething" },
  card_teething_tips: { name: "Teething Guidelines Card", icon: "🦷", category: "Stage 3: Teething" },
  silicone_beads_3d: { name: "3D Silicone Teether Chain", icon: "✨", category: "Stage 3: Teething" },
  eco_badge: { name: "100% Newborn Safe Health Seal", icon: "🌱", category: "Stage 3: Teething" },
  solids_guide_card: { name: "Weaning & Solids Guide Card", icon: "🥑", category: "Stage 3: Teething" },
  wooden_spoon_3d: { name: "3D Wooden Weaning Spoon", icon: "🥄", category: "Stage 3: Teething" },
  oral_wipe_card: { name: "Oral & Gum Care Card", icon: "🪥", category: "Stage 3: Teething" },
  silicone_star_toy: { name: "3D Silicone Star Teether", icon: "⭐", category: "Stage 3: Teething" },

  // Stage 4: Kangaroo Care, Colic Relief & Bonding
  card_mother_photo: { name: "Kangaroo Care Baby Photo Card", icon: "📷", category: "Stage 4: Bonding" },
  card_colic_tips: { name: "Colic & Gas Relief Card", icon: "🍼", category: "Stage 4: Bonding" },
  cloud_mobile_3d: { name: "3D Cloud Nursery Mobile", icon: "☁️", category: "Stage 4: Bonding" },
  newsletter_card: { name: "Pediatrician Health Tips Card", icon: "💌", category: "Stage 4: Bonding" },
  burping_guide_card: { name: "Burping Techniques Guide Card", icon: "🍼", category: "Stage 4: Bonding" },
  massage_oil_card: { name: "Infant Massage Routine Card", icon: "🌿", category: "Stage 4: Bonding" },
  kangaroo_badge: { name: "Kangaroo Care Bonding Seal", icon: "❤️", category: "Stage 4: Bonding" },
  heart_shield_3d: { name: "3D Heart Health Shield", icon: "🛡️", category: "Stage 4: Bonding" },

  // Stage 5: Clinical Warning Signs & Emergencies
  fever_protocol_card: { name: "Infant Fever Protocol Card", icon: "🚨", category: "Stage 5: Clinical" },
  dehydration_card: { name: "Dehydration Warning Signs Card", icon: "💧", category: "Stage 5: Clinical" },
  breathing_card: { name: "Respiratory Distress Card", icon: "🫁", category: "Stage 5: Clinical" },
  thermometer_3d: { name: "3D Pediatric Thermometer", icon: "🌡️", category: "Stage 5: Clinical" },
  stethoscope_badge: { name: "Clinical Advisory Badge", icon: "🩺", category: "Stage 5: Clinical" },
  first_aid_kit_3d: { name: "3D Nursery First Aid Box", icon: "🩹", category: "Stage 5: Clinical" },

  // Stage 6: Certifications & Rhythms
  fsc_wood_seal: { name: "FSC Beechwood Certified Seal", icon: "🌲", category: "Stage 6: Safety" },
  bpa_free_seal: { name: "BPA & Phthalate Free Seal", icon: "🛡️", category: "Stage 6: Safety" },
  daily_rhythm_card: { name: "Daily Care Rhythm Card", icon: "⏰", category: "Stage 6: Safety" },
  bath_time_card: { name: "Bathing & Water Care Card", icon: "🛁", category: "Stage 6: Safety" },
  piwva_gold_crest: { name: "Piwva Gold Royal Crest", icon: "👑", category: "Stage 6: Safety" },
  pediatric_club_seal: { name: "Pediatric Advisory Board Seal", icon: "🩺", category: "Stage 6: Safety" },
};

export const LayoutInspectorModal: React.FC<LayoutInspectorModalProps> = ({
  isOpen,
  onClose,
  layoutData,
  cameraState = { position: [18.62, 9.99, 16.72], target: [0, 0, 0], fov: 34, distance: 26.95 },
  isCtrlHeld,
  activeDraggedId,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<"json" | "code" | null>(null);

  if (!isOpen) return null;

  const fullData = {
    camera: {
      position: cameraState.position,
      target: cameraState.target,
      fov: cameraState.fov,
      distance: cameraState.distance,
    },
    elements: layoutData,
  };

  const handleCopyJSON = () => {
    const formatted = JSON.stringify(fullData, null, 2);
    navigator.clipboard.writeText(formatted);
    setCopiedFormat("json");
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleCopyCode = () => {
    let output = "{\n";
    output += "  camera: {\n";
    output += `    position: [${cameraState.position[0].toFixed(2)}, ${cameraState.position[1].toFixed(2)}, ${cameraState.position[2].toFixed(2)}],\n`;
    output += `    target: [${cameraState.target[0].toFixed(2)}, ${cameraState.target[1].toFixed(2)}, ${cameraState.target[2].toFixed(2)}],\n`;
    output += `    fov: ${cameraState.fov.toFixed(1)},\n`;
    output += `    distance: ${cameraState.distance.toFixed(2)},\n`;
    output += "  },\n";
    output += "  elements: {\n";
    Object.entries(layoutData).forEach(([key, [x, y, z]]) => {
      output += `    ${key}: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}],\n`;
    });
    output += "  },\n";
    output += "}";
    navigator.clipboard.writeText(output);
    setCopiedFormat("code");
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/80 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10 bg-white/50 dark:bg-slate-800/50">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              3D Layout & Zoom Inspector
            </h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Hold <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold">Ctrl</kbd> to drag • Scroll wheel to zoom
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Live Mode Status Banner */}
      <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isCtrlHeld
                ? "bg-amber-500 ring-4 ring-amber-400/40 scale-125"
                : "bg-emerald-500 animate-pulse"
            }`}
          />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {isCtrlHeld ? "Drag Mode Active (Ctrl Held)" : "Orbit & Zoom View Mode"}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          {Object.keys(layoutData).length} Elements Tracked
        </span>
      </div>

      {/* Camera & Zoom Real-Time Card */}
      <div className="px-5 py-3 bg-gradient-to-r from-amber-50/80 to-yellow-50/60 dark:from-amber-950/20 dark:to-yellow-950/20 border-b border-amber-200/40 dark:border-amber-700/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 dark:text-amber-300">
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>Live Camera & Zoom State</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400">
            <ZoomIn className="w-3 h-3 text-amber-600" />
            <span>Distance: {cameraState.distance.toFixed(2)}</span>
            <span className="text-amber-400 dark:text-amber-600">•</span>
            <span>FOV: {cameraState.fov.toFixed(0)}°</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
            <p className="text-[10px] font-sans font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Camera Pos [X, Y, Z]</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              [{cameraState.position[0].toFixed(2)}, {cameraState.position[1].toFixed(2)}, {cameraState.position[2].toFixed(2)}]
            </p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
            <p className="text-[10px] font-sans font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Orbit Target [X, Y, Z]</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              [{cameraState.target[0].toFixed(2)}, {cameraState.target[1].toFixed(2)}, {cameraState.target[2].toFixed(2)}]
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Coordinates List */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pt-1 pb-0.5">
          3D Object Coordinates
        </p>
        {Object.entries(layoutData).map(([id, [x, y, z]]) => {
          const meta = ELEMENT_LABELS[id] || { name: id, icon: "📦", category: "Object" };
          const isBeingDragged = activeDraggedId === id;

          return (
            <div
              key={id}
              className={`pt-2.5 first:pt-0 flex items-center justify-between transition-all rounded-xl p-1.5 ${
                isBeingDragged
                  ? "bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-400/60 shadow-sm"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <span className="text-base select-none">{meta.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {meta.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">id: {id}</p>
                </div>
              </div>

              {/* Coordinates Pill */}
              <div className="flex items-center space-x-1.5 font-mono text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50">
                  X:{x.toFixed(2)}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
                  Y:{y.toFixed(2)}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50">
                  Z:{z.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy Actions Footer */}
      <div className="p-4 border-t border-black/5 dark:border-white/10 bg-slate-50/90 dark:bg-slate-800/90 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJSON}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Copy Zoom, Camera & Object Coordinates as JSON"
          >
            {copiedFormat === "json" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>All Data Copied (JSON)!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>📋 Copy All (Zoom + Drag) JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyCode}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Copy Zoom, Camera & Object Coordinates as TypeScript config"
          >
            {copiedFormat === "code" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>TS Config Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>📋 Copy TS Code</span>
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
          💡 Zoom & drag as you like, then click Copy to send everything (zoom, camera, positions) to chat!
        </p>
      </div>
    </div>
  );
};
