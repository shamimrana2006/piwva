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
import { soundFX } from "../utils/soundEffects";

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
    soundFX.playPop(620);
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const trimesters = [
    {
      stage: "০–৩ মাস",
      title: "৪র্থ ট্রাইমেস্টার: নিরাপদ রূপান্তর ও প্রাথমিক আবিষ্কার",
      subtitle: "শারীরিক অভিযোজন, নিরাপদ ঘুমের রুটিন এবং শান্ত সেন্সরি পরিবেশের ওপর গুরুত্ব দিন।",
      badge: "পর্যায় ১ • নবজাতক",
      highlights: [
        {
          title: "নিরাপদ ঘুমের গোল্ডেন স্ট্যান্ডার্ড",
          desc: "সবসময় শিশুকে চিত করে শক্ত ও সমতল তোষকে শোয়ান। রুমের তাপমাত্রা ২০–২২°C (৬৮–৭২°F) রাখুন।",
          icon: <Moon className="w-5 h-5 text-indigo-400" />,
        },
        {
          title: "প্রাথমিক টামি টাইম অভ্যাস",
          desc: "বাবা-মায়ের বুকের ওপর দিনে ২-৩ বার ২-৩ মিনিট দিয়ে শুরু করুন, যা ঘাড় ও মেরুদণ্ডের পেশি শক্ত করে।",
          icon: <Baby className="w-5 h-5 text-emerald-400" />,
        },
        {
          title: "হাই-কনট্রাস্ট ভিজ্যুয়াল স্টিমুলেশন",
          desc: "নবজাতক ৮-১২ ইঞ্চি দূরত্বের জিনিস স্পষ্টভাবে দেখতে পায়। সাদাকালো নকশা ও প্রাকৃতিক কাঠ মস্তিষ্কের স্নায়ু বিকাশ করে।",
          icon: <Sparkles className="w-5 h-5 text-amber-400" />,
        },
        {
          title: "স্কিন-টু-স্কিন ক্যাঙ্গারু কেয়ার",
          desc: "শরীরের তাপমাত্রা নিয়ন্ত্রণ করে, হৃদস্পন্দন শান্ত রাখে এবং মা-শিশুর সুস্থ মাইক্রোবায়োম গঠন করে।",
          icon: <Heart className="w-5 h-5 text-rose-400" />,
        },
      ],
    },
    {
      stage: "৩–৬ মাস",
      title: "ইন্দ্রিয়ানুভূতি জাগরণ ও শারীরিক মোটর বিকাশ",
      subtitle: "কাত হওয়া, প্রাকৃতিক কাঠের স্পর্শ অনুভব করা এবং মুখের সাহায্যে পরিবেশ চেনা।",
      badge: "পর্যায় ২ • শিশু",
      highlights: [
        {
          title: "সোয়াডল থেকে মুক্ত হওয়ার নিয়ম",
          desc: "শিশু নিজে কাত বা উল্টানোর লক্ষণ দেখালেই সোয়াডল বন্ধ করে দুই হাত মুক্ত রাখুন।",
          icon: <Activity className="w-5 h-5 text-blue-400" />,
        },
        {
          title: "প্রাকৃতিক টিথিং ও মাড়ির আরাম",
          desc: "লালা পড়ার পরিমাণ বাড়ে; ঠান্ডা মসৃণ বিচউড এবং ফুড-গ্রেড সিলিকন রিং চিবানোর সুযোগ দিন।",
          icon: <Smile className="w-5 h-5 text-amber-400" />,
        },
        {
          title: "টামি টাইমের উন্নতি",
          desc: "ধীরে ধীরে দৈনিক ১৫-২০ মিনিট টামি টাইম করান। শিশু সোজা দুই হাতে ভর দিয়ে শরীর তুলতে শুরু করবে।",
          icon: <Baby className="w-5 h-5 text-emerald-400" />,
        },
        {
          title: "দুই হাতে খেলনা ধরার দক্ষতা",
          desc: "হালকা কাঠের র্যাটল ও রঙিন অ্যাবাকাস বিডস দিয়ে হাত ও চোখের নিখুঁত সমন্বয় গড়ে তুলুন।",
          icon: <Layers className="w-5 h-5 text-purple-400" />,
        },
      ],
    },
    {
      stage: "৬–৯ মাস",
      title: "বসা, শক্ত খাবার শুরু ও মানসিক বুদ্ধিমত্তা",
      subtitle: "নিজে নিজে সোজা হয়ে বসা, প্রথম পরিপাক খাদ্য ও সেন্সরি মোটর সমন্বয়।",
      badge: "পর্যায় ৩ • এক্সপ্লোরার",
      highlights: [
        {
          title: "প্রথম শক্ত খাবার ও উইনিং গাইড",
          desc: "মাথা শক্ত করে বসা শিখলে পুষ্টিকর ম্যাশ করা খাবার (মিষ্টি আলু, ডাল, কলা) এক এক করে দিন।",
          icon: <Droplets className="w-5 h-5 text-amber-400" />,
        },
        {
          title: "অবজেক্ট পারমানেন্স ও লুকোচুরি খেলা",
          desc: "কাপড়ের নিচে খেলনা লুকিয়ে খেলাধুলা শিশুর স্মৃতিশক্তি ও জ্ঞানীয় বিকাশকে উদ্দীপিত করে।",
          icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
        },
        {
          title: "স্বাধীনভাবে বসা ও ভারসাম্য",
          desc: "মেঝের নরম ম্যাটে চারপাশে কুশন দিয়ে বসিয়ে ভারসাম্য রক্ষার অনুশীলন করান।",
          icon: <Award className="w-5 h-5 text-emerald-400" />,
        },
        {
          title: "দাঁত ও মুখের নিয়মিত যত্ন",
          desc: "প্রথম দুধের দাঁত উঠলে নরম সিলিকন ফিঙ্গার ব্রাশ ও কুসুম গরম পানি দিয়ে মাড়ি পরিষ্কার করুন।",
          icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
        },
      ],
    },
    {
      stage: "৯–১২ মাস",
      title: "চলাচল, হাতের সূক্ষ্ম নিয়ন্ত্রণ ও আত্মবিশ্বাস",
      subtitle: "হামাগুড়ি, দাঁড়িয়ে ওঠার চেষ্টা, আঙুলের সূক্ষ্ম গ্রিপ এবং সুনির্দিষ্ট ঘুমের রুটিন।",
      badge: "পর্যায় ৪ • চঞ্চল শিশু",
      highlights: [
        {
          title: "টক্সিক উপাদান-মুক্ত বেবি প্রুফিং",
          desc: "ঘরের নাগালের মধ্যে থাকা সব আসবাবপত্র ও খেলনা ১০০% বিপিএ-মুক্ত ও নিরাপদ বিচউডের রাখুন।",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        },
        {
          title: "পিন্সার গ্র্যাসপ দক্ষতা",
          desc: "বুড়ো আঙুল ও তর্জনী দিয়ে ছোট কাঠের ব্লক তুলে সাজানোর খেলা আঙুলের শক্তি বাড়ায়।",
          icon: <Layers className="w-5 h-5 text-amber-400" />,
        },
        {
          title: "সুনির্দিষ্ট ঘুমের রুটিন",
          desc: "রাতে ঘুমের আগে ৩০ মিনিটের প্রশান্তিকর রুটিন (হালকা গোসল, গল্প বলা, ডিম লাইট) বজায় রাখুন।",
          icon: <Moon className="w-5 h-5 text-indigo-400" />,
        },
        {
          title: "কথা বলা ও ছড়া শোনার অভ্যাস",
          desc: "শিশুর সাথে প্রতিদিন কথা বলুন ও সুরেলা ছড়া আবৃত্তি করে প্রথম শব্দ উচ্চারণে সাহায্য করুন।",
          icon: <BookOpen className="w-5 h-5 text-blue-400" />,
        },
      ],
    },
  ];

  const pillars = [
    {
      title: "নিরাপদ ঘুম ও সিডস (SIDS) প্রতিরোধ",
      icon: <Moon className="w-6 h-6 text-indigo-400" />,
      color: "bg-indigo-950/40 border-indigo-800/60",
      badgeColor: "bg-indigo-900/60 text-indigo-300",
      dos: [
        "সবসময় শিশুকে চিত করে শুইয়ে দিন।",
        "শক্ত, সমতল এবং আনতহীন তোষক ব্যবহার করুন।",
        "নার্সারি রুমের তাপমাত্রা ২০–২২°C (৬৮–৭২°F) রাখুন।",
        "প্রথম ৬ মাস মা-বাবার রুমেই শিশুকে নিজের খাটে রাখুন।",
      ],
      donts: [
        "বিছানায় কখনো আলগা বালিশ, কম্বল বা বাম্পার রাখবেন না।",
        "অতিরিক্ত গরম কাপড় পরাবেন না (বুক/ঘাড় চেক করুন)।",
        "সোফা, রিক্লাইনার বা বড়দের বিছানায় একা ঘুম পাড়াবেন না।",
        "ওজনযুক্ত স্লিপস্যাক বা পজিশনিং ওয়েজ ব্যবহার করবেন না।",
      ],
    },
    {
      title: "টামি টাইম ও শারীরিক মোটর বিকাশ",
      icon: <Baby className="w-6 h-6 text-emerald-400" />,
      color: "bg-emerald-950/40 border-emerald-800/60",
      badgeColor: "bg-emerald-900/60 text-emerald-300",
      dos: [
        "প্রথম দিন থেকেই বুকের ওপর ২-৩ মিনিট টামি টাইম করান।",
        "ডায়াপার বদলানোর পর পরিষ্কার সমতল ম্যাটে অভ্যাস করান।",
        "দৃষ্টি আকর্ষণের জন্য সামনে হাই-কনট্রাস্ট কাঠের খেলনা রাখুন।",
        "ধীরে ধীরে দিনে ১৫–২০ মিনিট টামি টাইমে অভ্যস্ত করুন।",
      ],
      donts: [
        "টামি টাইমের সময় শিশুকে কখনো একা ফেলে যাবেন না।",
        "দুধ খাওয়ানোর সাথে সাথে পেটের ওপর উপুড় করবেন না।",
        "শিশু ক্লান্ত থাকলে বা কাঁদলে জোর করে টামি টাইম করাবেন না।",
        "মাথা ঘোরানো বাধাগ্রস্ত করে এমন নরম বালিশ দেবেন না।",
      ],
    },
    {
      title: "কোমল ত্বকের যত্ন ও নার্সারির আবহাওয়া",
      icon: <Droplets className="w-6 h-6 text-amber-400" />,
      color: "bg-amber-950/40 border-amber-800/60",
      badgeColor: "bg-amber-900/60 text-amber-300",
      dos: [
        "১০০% প্রাকৃতিক সুতি কাপড় ও মস্লিন ব্যবহার করুন।",
        "ঘরের আর্দ্রতা ৪৫–৫৫% বজায় রাখুন যাতে শ্বাসনালী সতেজ থাকে।",
        "সপ্তাহে ২–৩ দিন ৩৭°C কুসুম গরম পানিতে গোসল করান।",
        "জিরো-ভিওসি ও রাসায়নিকমুক্ত প্রাকৃতিক বিচউড বেছে নিন।",
      ],
      donts: [
        "কৃত্রিম সুগন্ধি বা কড়া কেমিক্যালযুক্ত সাবান পরিহার করুন।",
        "নবজাতকের সংবেদনশীল ত্বক খসখসে নেট দিয়ে ঘষবেন না।",
        "রুমে সিন্থেটিক রুম ফ্রেশনার স্প্রে করবেন না।",
        "সিন্থেটিক পলিয়েস্টার কাপড় ব্যবহার করবেন না।",
      ],
    },
    {
      title: "কলিক, পেটের গ্যাস ও পরিপাক স্বস্তি",
      icon: <Activity className="w-6 h-6 text-rose-400" />,
      color: "bg-rose-950/40 border-rose-800/60",
      badgeColor: "bg-rose-900/60 text-rose-300",
      dos: [
        "বাইসাইকেল লেগস মুভমেন্ট করিয়ে পেটের গ্যাস বের করুন।",
        "দুধ খাওয়ানোর পর ১৫ মিনিট কাঁধে সোজা রেখে ঢেকুর তোলান।",
        "ঘড়ির কাঁটার দিকে আলতো হাতে পেটে ম্যাসাজ করুন।",
        "মানসিক প্রশান্তির জন্য ক্যাঙ্গারু কেয়ার (স্কিন-টু-স্কিন) দিন।",
      ],
      donts: [
        "খাওয়ানোর সময় তাড়াহুড়ো করবেন না বা বোতলে বাতাস রাখবেন না।",
        "দুধ খাওয়ানোর পরপরই শিশুকে পুরোপুরি চিত করে শোয়াবেন না।",
        "৬ মাসের আগে পানি, মধু বা ভেষজ চা দেবেন না।",
        "শিশুকে জোর করে জোরে ঝাঁকাবেন না।",
      ],
    },
    {
      title: "প্রাকৃতিক টিথিং ও মাড়ির যত্ন",
      icon: <Smile className="w-6 h-6 text-orange-400" />,
      color: "bg-orange-950/40 border-orange-800/60",
      badgeColor: "bg-orange-900/60 text-orange-300",
      dos: [
        "ঠান্ডা মসৃণ বিচউড বা ফুড-গ্রেড সিলিকন টিথার দিন।",
        "পরিষ্কার ভেজা সুতি কাপড় দিয়ে আলতো করে ফোলা মাড়ি মুছুন।",
        "মুখে দেওয়ার সব খেলনা নিয়মিত হালকা গরম পানিতে ধুয়ে নিন।",
        "প্রথম দাঁত ওঠার পর থেকে দুধ খাওয়ানোর পর মাড়ি পরিষ্কার রাখুন।",
      ],
      donts: [
        "বেনজোকেন বা ক্ষতিকর অসাড়কারী টিথিং জেল দেবেন না।",
        "টিথার ডিপ ফ্রিজে রেখে অতিরিক্ত শক্ত করে বরফ করবেন না।",
        "গলায় টিথিং রিং ঝুলিয়ে ঘুম পাড়াবেন না।",
        "ঘুমানোর সময় বোতলে মিষ্টি তরল দিয়ে রাখবেন না।",
      ],
    },
    {
      title: "জরুরি স্বাস্থ্য সতর্কতা লক্ষণ (ক্লিনিক্যাল রেড ফ্ল্যাগ)",
      icon: <AlertCircle className="w-6 h-6 text-red-400" />,
      color: "bg-red-950/40 border-red-800/60",
      badgeColor: "bg-red-900/60 text-red-300",
      dos: [
        "৩ মাসের কম শিশুর তাপমাত্রা ১০০.৪°F (৩৮°C) হলে দ্রুত ডাক্তার দেখান।",
        "২৪ ঘণ্টায় শিশুর ভেজা ডায়াপারের সংখ্যা (কমপক্ষে ৬টি) গুনুন।",
        "শান্ত থাকা অবস্থায় মিনিটে শ্বাসের গতি পর্যবেক্ষণ করুন।",
        "জরুরি প্রয়োজনে শিশু বিশেষজ্ঞ বা হাসপাতালের শরণাপন্ন হন।",
      ],
      donts: [
        "ডাক্তারের পরামর্শ ছাড়া কোনো অ্যান্টিবায়োটিক দেবেন না।",
        "শ্বাসকষ্ট বা বুকের খাঁচা দেবে যাওয়ার লক্ষণ অবহেলা করবেন না।",
        "শিশুর চোখ ও মুখ অতিরিক্ত শুষ্ক হয়ে গেলে দেরি করবেন না।",
        "অতিরিক্ত নিস্তেজ ভাব ও খাবার না খাওয়ার লক্ষণ এড়িয়ে যাবেন না।",
      ],
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 font-sans select-none">
      {/* Section 1: Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Stethoscope className="w-4 h-4 text-amber-400" />
          <span>শিশু বিশেষজ্ঞ অনুমোদিত ক্লিনিক্যাল স্বাস্থ্য নির্দেশিকা</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
          নবজাতকের প্রথম বছরের <span className="text-[#dfb782]">বৈজ্ঞানিক স্বাস্থ্য ও যত্ন</span>
        </h2>
        <p className="text-slate-300 text-base md:text-lg leading-relaxed">
          শিশুর নিরাপদ ঘুম, টামি টাইম, প্রাকৃতিক টিথিং, কলিক নিরাময় এবং সংবেদনশীল মোটর বিকাশের জন্য নির্ভরযোগ্য আন্তর্জাতিক মেডিকেল গাইডলাইন।
        </p>
      </div>

      {/* Section 2: Trimester Milestone Tabs */}
      <div className="mb-24">
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2">
          {trimesters.map((t, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundFX.playPop(550 + idx * 80);
                setActiveTrimester(idx);
              }}
              className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTrimester === idx
                  ? "bg-[#dfb782] text-slate-950 shadow-lg shadow-[#dfb782]/20 scale-105 ring-2 ring-[#dfb782]"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t.stage}</span>
            </button>
          ))}
        </div>

        {/* Active Trimester Card */}
        <div className="p-8 md:p-12 rounded-3xl bg-slate-800/60 border border-slate-700/80 shadow-xl backdrop-blur-md transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-700/60">
            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {trimesters[activeTrimester].badge}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mt-3">
                {trimesters[activeTrimester].title}
              </h3>
              <p className="text-slate-400 text-sm md:text-base mt-1">
                {trimesters[activeTrimester].subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4" />
              <span>১০০% ক্লিনিক্যাল স্ট্যান্ডার্ড</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trimesters[activeTrimester].highlights.map((h, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-700/60 hover:border-[#dfb782]/60 transition-all group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 group-hover:scale-110 transition-transform">
                    {h.icon}
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-[#dfb782] transition-colors">
                    {h.title}
                  </h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: 6 Health Pillars (Do's & Don'ts) */}
      <div className="mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
            শিশু যত্নের ৬টি মৌলিক স্তম্ভ
          </h3>
          <p className="text-slate-300 text-sm md:text-base">
            নিরাপত্তা নিশ্চিত করতে কী করবেন এবং কী পরিহার করবেন তার বিশেষজ্ঞ চেকলিস্ট।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border ${pillar.color} backdrop-blur-md flex flex-col justify-between hover:scale-[1.01] transition-transform`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700">
                    {pillar.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${pillar.badgeColor}`}>
                    গাইডলাইন {idx + 1}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-4">{pillar.title}</h4>

                {/* Do's */}
                <div className="mb-4">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> যা অবশ্যই করবেন (Do's)
                  </h5>
                  <ul className="space-y-2">
                    {pillar.dos.map((d, dIdx) => (
                      <li key={dIdx} className="text-xs text-slate-200 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div>
                  <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> যা পরিহার করবেন (Don'ts)
                  </h5>
                  <ul className="space-y-2">
                    {pillar.donts.map((d, dIdx) => (
                      <li key={dIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-rose-400 font-bold mt-0.5">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Daily Interactive Care Routine Checklist */}
      <div className="mb-24 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span>দৈনিক যত্নের ইন্টারেক্টিভ চেকলিস্ট</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              নবজাতকের প্রতিদিনের স্বাস্থ্য ট্র্যাকার
            </h3>
          </div>
          <div className="text-xs text-slate-300 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-700">
            টিক চিহ্ন দিয়ে আপনার দৈনিক অগ্রগতি চিহ্নিত করুন
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: "sleep", label: "ঘুমের পজিশন: চিত করে শোয়ান ও খালি বিছানা", icon: "😴" },
            { id: "tummy", label: "টামি টাইম: দিনে ১৫ মিনিট অনুশীলন সম্পন্ন", icon: "🧸" },
            { id: "burp", label: "ঢেকুর: খাওয়ার পর ১৫ মিনিট সোজা রাখা", icon: "🍼" },
            { id: "temp", label: "রুম তাপমাত্রা: ২০–২২°C ও আর্দ্রতা সঠিক আছে", icon: "🌡️" },
            { id: "skin", label: "ত্বক ও মাড়ি: সুতি কাপড় দিয়ে পরিষ্কার রাখা", icon: "🌿" },
            { id: "outdoor", label: "দিনের আলো: সকালের প্রাকৃতিক আলো দেখানো", icon: "☀️" },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                checklist[item.id]
                  ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
                  : "bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs md:text-sm font-semibold">{item.label}</span>
              </div>
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  checklist[item.id]
                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                    : "border-slate-600 bg-slate-800"
                }`}
              >
                {checklist[item.id] && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Pediatrician Weekly Newsletter */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 shadow-2xl text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            সাপ্তাহিক শিশু বিশেষজ্ঞ স্বাস্থ্য ক্লাব
          </h3>
          <p className="text-slate-300 text-sm md:text-base mb-6">
            আপনার শিশুর বয়স অনুযায়ী সাপ্তাহিক মাইলস্টোন, পুষ্টি তালিকা ও বিশেষজ্ঞ পরামর্শ পান সরাসরি আপনার ইমেইলে।
          </p>

          {isSubscribed ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>অভিনন্দন! আপনার সাবস্ক্রিপশন সফল হয়েছে। সাপ্তাহিক টিপস শীঘ্রই পাবেন।</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (emailInput.trim()) {
                  soundFX.playChime(1046);
                  setIsSubscribed(true);
                }
              }}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="আপনার ইমেইল ঠিকানা লিখুন..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#dfb782] hover:bg-[#caa16d] text-slate-950 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>যুক্ত হোন</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-[11px] text-slate-500 mt-4">
            🔒 আমরা স্প্যাম করি না। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।
          </p>
        </div>
      </div>
    </div>
  );
};
