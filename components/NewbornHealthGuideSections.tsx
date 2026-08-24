"use client";

import React, { useState } from "react";
import {
  Heart,
  ShieldCheck,
  Moon,
  Sun,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Baby,
  Smile,
  Thermometer,
  Droplets,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Stethoscope,
  Send,
} from "lucide-react";

export const NewbornHealthGuideSections: React.FC = () => {
  const [activeTrimester, setActiveTrimester] = useState<number>(0);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    sleep: true,
    tummy: false,
    burp: true,
    temp: true,
    skin: false,
    outdoor: false,
  });
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const trimesters = [
    {
      stage: "0–3 Months",
      title: "The 4th Trimester: Safe Transition & Discovery",
      subtitle: "Focus on physiological adaptation, safe sleep routines, and sensory calm.",
      badge: "Stage 1 • Newborn",
      highlights: [
        {
          title: "Safe Sleep Gold Standard",
          desc: "Always sleep on back in a bare crib with a firm flat mattress. Keep room at 20–22°C (68–72°F).",
          icon: <Moon className="w-5 h-5 text-indigo-600" />,
        },
        {
          title: "Early Tummy Time",
          desc: "Start with 2–3 minutes on parents' chest 2–3 times a day to build neck and shoulder muscles.",
          icon: <Baby className="w-5 h-5 text-emerald-600" />,
        },
        {
          title: "High-Contrast Visuals",
          desc: "Infants can only focus 8–12 inches away. High-contrast shapes and natural wood stimulate neural pathways.",
          icon: <Sparkles className="w-5 h-5 text-amber-600" />,
        },
        {
          title: "Skin-to-Skin Kangaroo Care",
          desc: "Regulates infant body temperature, stabilizes heart rate, and promotes healthy microbiome transfer.",
          icon: <Heart className="w-5 h-5 text-rose-600" />,
        },
      ],
    },
    {
      stage: "3–6 Months",
      title: "Sensory Awakening & Motor Milestones",
      subtitle: "Rolling over, grasping natural textures, and early oral discovery.",
      badge: "Stage 2 • Infant",
      highlights: [
        {
          title: "Rolling Safety & Swaddle Transition",
          desc: "Transition out of tight swaddles with arms free as soon as baby shows signs of rolling over.",
          icon: <Activity className="w-5 h-5 text-blue-600" />,
        },
        {
          title: "Natural Teething Comfort",
          desc: "Salivation increases; offer chilled smooth natural beechwood and food-grade silicone rings.",
          icon: <Smile className="w-5 h-5 text-amber-600" />,
        },
        {
          title: "Tummy Time Progression",
          desc: "Build up to 15–20 minutes daily. Baby will begin pushing up on straight arms and pivoting.",
          icon: <Baby className="w-5 h-5 text-emerald-600" />,
        },
        {
          title: "Two-Handed Object Exploration",
          desc: "Introduce lightweight wooden rattles and sensory abacus beads to develop hand-eye coordination.",
          icon: <Layers className="w-5 h-5 text-purple-600" />,
        },
      ],
    },
    {
      stage: "6–9 Months",
      title: "Sitting, Solids & Cognitive Exploration",
      subtitle: "Independent sitting, digestive milestones, and sensory motor coordination.",
      badge: "Stage 3 • Explorer",
      highlights: [
        {
          title: "Introduction to First Solids",
          desc: "When baby sits upright with head control, introduce single-ingredient nutrient-dense purees or soft finger foods.",
          icon: <Droplets className="w-5 h-5 text-amber-600" />,
        },
        {
          title: "Object Permanence Play",
          desc: "Play peek-a-boo and hiding toys under cloths to foster working memory and cognitive discovery.",
          icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
        },
        {
          title: "Independent Sitting & Balance",
          desc: "Support floor playtime with surrounding soft cushions while baby practices upright balance.",
          icon: <Award className="w-5 h-5 text-emerald-600" />,
        },
        {
          title: "Active Teething Support",
          desc: "Primary incisors emerge; keep gums clean with a soft silicone fingertip brush and cool wooden toys.",
          icon: <ShieldCheck className="w-5 h-5 text-rose-600" />,
        },
      ],
    },
    {
      stage: "9–12 Months",
      title: "Mobility, Pincer Grasp & Independence",
      subtitle: "Crawling, pulling to stand, fine motor precision, and established sleep hygiene.",
      badge: "Stage 4 • Active Baby",
      highlights: [
        {
          title: "Non-Toxic Baby Proofing",
          desc: "Ensure all reachable floor furniture and toys are 100% zero-VOC, BPA-free, and securely anchored.",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
        },
        {
          title: "Pincer Grasp Mastery",
          desc: "Practicing picking up small items and wooden sorting blocks refines dexterity and finger strength.",
          icon: <Layers className="w-5 h-5 text-amber-600" />,
        },
        {
          title: "Circadian Rhythm Stability",
          desc: "Establish a consistent 30-minute calming bedtime routine (bath, story, dim warm lighting).",
          icon: <Moon className="w-5 h-5 text-indigo-600" />,
        },
        {
          title: "Responsive Language & Song",
          desc: "Narrate daily activities and sing repetitive rhymes to lay the foundation for first words.",
          icon: <BookOpen className="w-5 h-5 text-blue-600" />,
        },
      ],
    },
  ];

  const pillars = [
    {
      title: "Safe Sleep & SIDS Prevention",
      icon: <Moon className="w-6 h-6 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-100",
      badgeColor: "bg-indigo-100 text-indigo-800",
      dos: [
        "Always place baby on their back to sleep.",
        "Use a firm, flat, non-inclined crib mattress.",
        "Keep nursery room temperature at 20–22°C (68–72°F).",
        "Room share with parents for at least the first 6 months.",
      ],
      donts: [
        "Never use soft pillows, loose blankets, or crib bumpers.",
        "Do not over-bundle baby (check neck/chest for overheating).",
        "Never let baby sleep on a couch, recliner, or adult bed.",
        "Avoid weighted sleep sacks and positional wedges.",
      ],
    },
    {
      title: "Tummy Time & Motor Development",
      icon: <Baby className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-100",
      badgeColor: "bg-emerald-100 text-emerald-800",
      dos: [
        "Start with 2–3 minutes on parent's chest from day one.",
        "Practice on a clean, firm mat after diaper changes.",
        "Place high-contrast wooden toys in direct visual line.",
        "Gradually build to 15–20 minutes of daily tummy time.",
      ],
      donts: [
        "Never leave baby unattended during tummy time.",
        "Do not practice immediately after a heavy feeding.",
        "Do not force tummy time if baby is overtired or crying.",
        "Avoid overly soft pillows that restrict head movement.",
      ],
    },
    {
      title: "Gentle Newborn Skin & Nursery Air",
      icon: <Droplets className="w-6 h-6 text-amber-600" />,
      color: "bg-amber-50 border-amber-100",
      badgeColor: "bg-amber-100 text-amber-800",
      dos: [
        "Use 100% breathable organic cotton for clothes and bedding.",
        "Maintain 45–55% nursery humidity for healthy airways.",
        "Limit full baths to 2–3 times weekly in lukewarm water (37°C).",
        "Choose zero-VOC, natural non-toxic wooden nursery furniture.",
      ],
      donts: [
        "Avoid chemical detergents with artificial fragrances and dyes.",
        "Do not vigorously scrub sensitive newborn skin with loofahs.",
        "Do not expose baby to harsh chemical air fresheners.",
        "Avoid synthetic polyester fabrics that trap excess heat.",
      ],
    },
    {
      title: "Colic, Gas & Digestion Relief",
      icon: <Activity className="w-6 h-6 text-rose-600" />,
      color: "bg-rose-50 border-rose-100",
      badgeColor: "bg-rose-100 text-rose-800",
      dos: [
        "Gently bicycle baby's legs to release trapped intestinal gas.",
        "Hold baby upright against your chest for 15 mins after feeding.",
        "Perform clockwise circular tummy massages with gentle pressure.",
        "Practice kangaroo skin-to-skin contact for emotional calming.",
      ],
      donts: [
        "Do not rush feedings or leave bottle nipples half-filled with air.",
        "Never lay baby flat on their back right after a full feed.",
        "Do not give honey, herbal teas, or water before 6 months.",
        "Avoid aggressive shaking or forceful bouncing movements.",
      ],
    },
    {
      title: "Safe Teething & Oral Milestones",
      icon: <Smile className="w-6 h-6 text-orange-600" />,
      color: "bg-orange-50 border-orange-100",
      badgeColor: "bg-orange-100 text-orange-800",
      dos: [
        "Offer chilled natural FSC beechwood or food-grade silicone rings.",
        "Gently massage swollen gums with a clean, damp cotton gauze.",
        "Keep chin and neck dry with soft organic bibs to prevent rash.",
        "Begin brushing first primary teeth with a soft silicone brush.",
      ],
      donts: [
        "Never use numbing gels containing benzocaine or lidocaine.",
        "Avoid amber necklaces (pose severe choking and strangulation risks).",
        "Do not freeze teething toys rock-hard (can bruise gums).",
        "Avoid plastic teething toys containing BPA, lead, or phthalates.",
      ],
    },
    {
      title: "Sensory Balance & Sleep Hygiene",
      icon: <Sun className="w-6 h-6 text-cyan-600" />,
      color: "bg-cyan-50 border-cyan-100",
      badgeColor: "bg-cyan-100 text-cyan-800",
      dos: [
        "Expose baby to natural daylight in the morning to set body clock.",
        "Dim lights and lower noise 30 minutes before nighttime sleep.",
        "Use low-pitch continuous white/pink noise at safe decibels (<50dB).",
        "Maintain predictable, soothing bedtime steps every evening.",
      ],
      donts: [
        "Avoid exposing infants to digital screens, tablets, and blue light.",
        "Do not overstimulate baby when they show rubbing eyes / yawning cues.",
        "Do not place white noise machines directly inside the infant's crib.",
        "Avoid loud, chaotic environments right before scheduled nap times.",
      ],
    },
  ];

  const warningSigns = [
    {
      title: "Fever in Infants (<3 Months)",
      desc: "Any rectal temperature of 100.4°F (38.0°C) or higher in a baby under 3 months is a medical emergency requiring immediate pediatrician evaluation.",
      icon: <Thermometer className="w-6 h-6 text-red-600" />,
      tag: "Immediate Doctor Call",
      tagColor: "bg-red-100 text-red-700",
    },
    {
      title: "Respiratory Distress",
      desc: "Fast breathing (>60 breaths per min), chest indrawing/retractions (skin sucking in around ribs), flaring nostrils, or grunting sounds during exhalation.",
      icon: <Activity className="w-6 h-6 text-orange-600" />,
      tag: "Urgent Assessment",
      tagColor: "bg-orange-100 text-orange-700",
    },
    {
      title: "Dehydration Indicators",
      desc: "Fewer than 6 wet diapers in 24 hours (after day 5), sunken soft spot (fontanelle) on top of head, absence of tears when crying, dry lips/mouth.",
      icon: <Droplets className="w-6 h-6 text-amber-600" />,
      tag: "Hydration Check",
      tagColor: "bg-amber-100 text-amber-700",
    },
    {
      title: "Severe Lethargy or Inconsolability",
      desc: "Baby is difficult to wake up, refuses to feed across multiple sessions, or exhibits continuous high-pitched inconsolable crying for hours.",
      icon: <AlertCircle className="w-6 h-6 text-purple-600" />,
      tag: "Clinical Evaluation",
      tagColor: "bg-purple-100 text-purple-700",
    },
  ];

  const dailySchedule = [
    {
      time: "07:00 AM",
      title: "Gentle Morning Wake-up & First Feed",
      desc: "Open nursery blinds for natural light. Diaper change, full feeding, and 15 mins upright cuddle.",
      icon: "☀️",
    },
    {
      time: "08:30 AM",
      title: "Morning Tummy Time & High-Contrast Visuals",
      desc: "3–5 mins of active floor tummy time with wooden rattle and high-contrast flashcards.",
      icon: "🧸",
    },
    {
      time: "09:30 AM",
      title: "Morning Nap (Safe Sleep Protocol)",
      desc: "Swaddle (or sleep sack), quiet nursery, white noise machine at 45dB, on back in bare crib.",
      icon: "😴",
    },
    {
      time: "11:30 AM",
      title: "Midday Feeding & Gentle Baby Massage",
      desc: "Second feed, followed by gentle clockwise tummy massage and bicycle leg movements for colic prevention.",
      icon: "🌿",
    },
    {
      time: "02:00 PM",
      title: "Afternoon Fresh Air Stroll & Sensory Play",
      desc: "Shaded outdoor stroller walk (weather permitting), tactile exploration of natural beechwood beads.",
      icon: "🌳",
    },
    {
      time: "06:30 PM",
      title: "Evening Wind-Down & Lukewarm Bath",
      desc: "Gentle 37°C water bath, organic cotton pat-down, dim warm lighting, bedtime story or lullaby.",
      icon: "🌙",
    },
  ];

  return (
    <div className="w-full bg-[#fbf9f5] text-[#2d3748] relative z-10">
      {/* 1. CHAPTER: THE 4 TRIMESTERS ROADMAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#e2d9cd]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e9dfd1] text-[#6b553e] text-xs font-bold uppercase tracking-widest mb-4">
            <Calendar className="w-4 h-4 text-[#9c7f60]" />
            Developmental Health Milestones
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d3748] tracking-tight font-serif">
            The 4 Golden Trimesters of Infant Health
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64748b]">
            Evidence-based pediatric guidelines crafted to support your baby&apos;s physical, cognitive, and sensory well-being from newborn to 12 months.
          </p>

          {/* Stage Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 rounded-2xl bg-[#ede4d8] max-w-2xl mx-auto">
            {trimesters.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTrimester(idx)}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activeTrimester === idx
                    ? "bg-[#ffffff] text-[#2d3748] shadow-md scale-[1.02]"
                    : "text-[#718096] hover:text-[#2d3748] hover:bg-white/40"
                }`}
              >
                {t.stage}
              </button>
            ))}
          </div>
        </div>

        {/* Active Trimester Card */}
        <div className="rounded-3xl bg-white border border-[#e8ded1] shadow-xl p-6 sm:p-10 transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[#f1e9df] gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#f4ebe1] text-[#8c6d4f] text-xs font-bold uppercase tracking-wider mb-2">
                {trimesters[activeTrimester].badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#2d3748] font-serif">
                {trimesters[activeTrimester].title}
              </h3>
              <p className="text-[#64748b] mt-1 text-sm sm:text-base">
                {trimesters[activeTrimester].subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#8c6d4f] bg-[#fbf7f2] px-4 py-2 rounded-xl border border-[#ebdccf] self-start md:self-auto">
              <Stethoscope className="w-4 h-4 text-[#b88a4e]" />
              Pediatric Verified
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trimesters[activeTrimester].highlights.map((h, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#faf7f2] border border-[#eee5d8] hover:border-[#dfcaa7] hover:shadow-md transition-all duration-200 flex gap-4 items-start"
              >
                <div className="p-3 rounded-xl bg-white shadow-sm border border-[#e5dacf] shrink-0">
                  {h.icon}
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#2d3748] mb-1">{h.title}</h4>
                  <p className="text-sm text-[#5a6b7c] leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CHAPTER: 6 PEDIATRIC HEALTH PILLARS (DOs & DONTs) */}
      <section className="bg-[#f5efe6] py-20 border-t border-b border-[#e2d9cd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8ded0] text-[#6b553e] text-xs font-bold uppercase tracking-widest mb-4">
              <ShieldCheck className="w-4 h-4 text-[#9c7f60]" />
              Daily Clinical Guidelines
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d3748] font-serif tracking-tight">
              The 6 Cornerstones of Newborn Health
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#64748b]">
              Clear, practical DOs and DON&apos;Ts recommended by pediatric specialists to safeguard your infant&apos;s daily routines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-[#e8ded1] shadow-lg overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`p-6 border-b border-[#f1e9df] flex items-center justify-between ${p.color}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-sm">{p.icon}</div>
                    <h3 className="font-bold text-lg text-[#2d3748]">{p.title}</h3>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  {/* DOs */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recommended (DOs)
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#4a5568]">
                      {p.dos.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* DONTs */}
                  <div className="pt-4 border-t border-[#f4eee6]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 mb-3">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Avoid (DON&apos;Ts)
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#4a5568]">
                      {p.donts.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CHAPTER: PEDIATRICIAN WARNING SIGNS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-[#263238] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle background ambient ring */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider mb-4 border border-red-500/30">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Emergency & Clinical Protocol
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
              When to Contact Your Pediatrician
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-300">
              Trust your parental instinct. If your baby exhibits any of the following clinical warning signs, seek immediate medical guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {warningSigns.map((w, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-white/10">{w.icon}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${w.tagColor}`}>
                    {w.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{w.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CHAPTER: DAILY NEWBORN CARE SCHEDULE & CHECKLIST */}
      <section className="bg-[#f4efe8] py-20 border-t border-[#e2d9cd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Daily Schedule Timeline */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8ded0] text-[#6b553e] text-xs font-bold uppercase tracking-widest mb-4">
                <Clock className="w-4 h-4 text-[#9c7f60]" />
                Circadian & Care Rhythm
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d3748] font-serif mb-4">
                Sample Newborn Daily Care Rhythm
              </h2>
              <p className="text-[#64748b] text-sm sm:text-base mb-8">
                Infants thrive on predictable soothing cues. Here is an ideal day-flow balancing feeding, tummy time, and sleep.
              </p>

              <div className="space-y-4">
                {dailySchedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-[#e8dfd2] shadow-sm flex items-start gap-4 hover:border-[#dfcca9] transition-all"
                  >
                    <div className="text-2xl p-2 rounded-xl bg-[#faf6f0] shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#b45309] uppercase tracking-wider">
                          {item.time}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-[#2d3748] mt-0.5">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-[#64748b] mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Daily Milestone Checklist */}
            <div className="lg:col-span-5 sticky top-8">
              <div className="rounded-3xl bg-white border border-[#e8ded1] shadow-xl p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-[#f1e9df] mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-[#2d3748] font-serif">
                      Daily Care Checklist
                    </h3>
                    <p className="text-xs text-[#718096] mt-0.5">Track your newborn&apos;s key daily needs</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Interactive
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "sleep", label: "Safe Sleep Setup: Bare crib, firm flat mattress, room temp 20–22°C" },
                    { id: "tummy", label: "Completed 3–5 min gentle tummy time session" },
                    { id: "burp", label: "Burped & held upright 15 mins after feeds" },
                    { id: "temp", label: "Checked neck & chest for ideal body warmth" },
                    { id: "skin", label: "Hydrated delicate skin & cleaned neck folds" },
                    { id: "outdoor", label: "15 min natural daylight / outdoor stroll" },
                  ].map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleCheck(task.id)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        checklist[task.id]
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-[#faf8f5] border-[#eae0d4] text-[#4a5568] hover:bg-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          checklist[task.id]
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {checklist[task.id] && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-snug">
                        {task.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Pediatrician Health Club Signup */}
                <div className="mt-8 pt-6 border-t border-[#f1e9df]">
                  <h4 className="font-bold text-sm text-[#2d3748] mb-1">
                    📩 Get Free Weekly Pediatric Guides
                  </h4>
                  <p className="text-xs text-[#718096] mb-3">
                    Age-tailored sleep routines, milestone trackers & nutrition advice.
                  </p>
                  {isSubscribed ? (
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                      ✓ You are subscribed! Check your inbox for your Newborn Health PDF.
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (emailInput.trim()) setIsSubscribed(true);
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="parents.email@health.com"
                        required
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#ded3c5] text-xs focus:outline-none focus:ring-2 focus:ring-[#9c7f60]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-[#9c7f60] text-white text-xs font-bold hover:bg-[#856b50] transition-colors flex items-center gap-1 shrink-0"
                      >
                        Join
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CHAPTER: NON-TOXIC CERTIFICATIONS & FOOTER */}
      <footer className="bg-[#1f2937] text-white pt-16 pb-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-gray-800 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-1">🌱</div>
              <h5 className="font-bold text-sm text-white">100% FSC Beechwood</h5>
              <p className="text-xs text-gray-400 mt-0.5">Sustainably harvested non-toxic wood</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-1">🛡️</div>
              <h5 className="font-bold text-sm text-white">BPA & Lead Free</h5>
              <p className="text-xs text-gray-400 mt-0.5">ASTM F963 & EN71 certified safe</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-1">🩺</div>
              <h5 className="font-bold text-sm text-white">Pediatric Approved</h5>
              <p className="text-xs text-gray-400 mt-0.5">Oral & sensory milestone verified</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl mb-1">🌿</div>
              <h5 className="font-bold text-sm text-white">Zero VOC Finishes</h5>
              <p className="text-xs text-gray-400 mt-0.5">100% clean nursery air safety</p>
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif font-bold text-[#dfb782]">Piwva</span>
              <span>— Evidence-Based Newborn Nursery & Pediatric Milestone Essentials.</span>
            </div>
            <p>© {new Date().getFullYear()} Piwva Health & Nursery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
