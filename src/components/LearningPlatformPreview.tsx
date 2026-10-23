"use client";

import React, { useState } from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import {
  MonitorPlay,
  FileCheck2,
  Package,
  MessageSquareCheck,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface LearningPlatformPreviewProps {
  onOpenJoin: () => void;
}

export default function LearningPlatformPreview({
  onOpenJoin,
}: LearningPlatformPreviewProps) {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      title: "HD Video Vault & Re-watch",
      desc: "Never miss a concept. Every live lecture is instantly uploaded in full 1080p with speed control (1x to 2x) and chapter timestamps for seamless revision.",
      icon: <MonitorPlay size={20} />,
      points: [
        "Unlimited video re-watch until your final exam date",
        "Time-stamped questions and formula summaries",
        "Zero buffering adaptive cloud CDN streaming",
      ],
    },
    {
      title: "Online MCQ & Timed Mock Exams",
      desc: "Simulate the actual examination hall pressure. Take online multiple-choice tests, get instant results, automated score breakdown, and islandwide percentile rankings.",
      icon: <FileCheck2 size={20} />,
      points: [
        "Instant mark calculation & detailed model solutions",
        "Comparative district and island rank leaderboards",
        "Personalized weak area analytics & suggestions",
      ],
    },
    {
      title: "Doorstep Delivery of Printed Notes",
      desc: "Study without digital eye strain. Complete bound theory booklets, past paper collections, and monthly tutorial packs delivered directly to your home anywhere in Sri Lanka.",
      icon: <Package size={20} />,
      points: [
        "Express islandwide courier tracking via SMS",
        "High-quality full-color print and durable binding",
        "Included free with monthly batch registration",
      ],
    },
    {
      title: "Direct WhatsApp Mentorship & Discussion",
      desc: "Need help with a ledger entry or a business studies question? Get personal clarification directly through our educator support network.",
      icon: <MessageSquareCheck size={20} />,
      points: [
        "Direct voice note and written doubt clarification",
        "Dedicated batch discussion groups",
        "Weekly live Q&A office hours before each exam",
      ],
    },
  ];

  return (
    <section className="pt-20 pb-20 pl-0 pr-0 relative bg-[#ffffff]" id="platform">
      <div className="w-full max-w-[var(--container-max)] ml-auto mr-auto pl-6 pr-6 max-[640px]:pl-4 max-[640px]:pr-4">
        <div className="text-center max-w-[720px] mt-0 mr-auto mb-12.5 ml-auto">
          <div className="inline-block [background:rgba(14,_165,_233,_0.1)] [border:1px_solid_rgba(14,_165,_233,_0.25)] text-[#0284c7] text-[length:0.75rem] font-extrabold tracking-[1.2px] pt-[5px] pb-[5px] pl-3.5 pr-3.5 rounded-full mb-4 uppercase">DIGITAL LEARNING ECOSYSTEM</div>
          <h2 className="text-[length:2.35rem] font-[850] leading-[1.2] text-[#0f172a] tracking-[-0.8px] mb-4 max-[960px]:text-[length:1.85rem]">
            A Complete Learning Platform <br />
            <span className="bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_100%)] bg-clip-text [-webkit-text-fill-color:transparent]">
              Engineered for Modern Commerce Learners
            </span>
          </h2>
          <p className="text-[length:1rem] text-[#64748b] leading-[1.6]">
            Experience a world-class hybrid education environment blending the energy of live teaching with cutting-edge digital study tools.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_1.05fr] gap-10 items-center max-[960px]:grid-cols-[1fr]">
          {/* Left Column: Visual Showcase with students_showcase photo */}
          <div className="relative">
            <div className="relative rounded-[24px] overflow-hidden [box-shadow:0_20px_45px_-12px_rgba(15,_23,_42,_0.15)] [border:1px_solid_rgba(226,_232,_240,_0.9)] [&:hover_.ui-platform-showcaseImg]:[transform:scale(1.02)]">
              <Image
                src="/images/students_showcase.jpg"
                alt="Commerce Students Celebrating Exam Results"
                width={620}
                height={400}
                className="w-full h-auto block object-cover [transition:transform_0.4s_ease] ui-platform-showcaseImg"
              />
              <div className="absolute bottom-5 left-5 right-5 max-sm:bottom-2 max-sm:left-2 max-sm:right-2 max-sm:p-3 max-sm:gap-2 [background:rgba(255,_255,_255,_0.9)] [backdrop-filter:blur(14px)] [-webkit-backdrop-filter:blur(14px)] [border:1.5px_solid_rgba(255,_255,_255,_0.95)] rounded-[16px] pt-3.5 pb-3.5 pl-4.5 pr-4.5 flex items-center gap-3.5 [box-shadow:0_10px_25px_-5px_rgba(15,_23,_42,_0.1)]">
                <div className="w-[44px] h-[44px] rounded-[12px] bg-[#eff6ff] text-[#1d4ed8] flex items-center justify-center shrink-0">
                  <ShieldCheck size={22} className="text-[#1d4ed8]" />
                </div>
                <div className="flex flex-col">
                  <div className="text-[length:0.95rem] font-extrabold text-[#0f172a]">
                    100% Comprehensive Coverage
                  </div>
                  <div className="text-[length:0.75rem] text-[#64748b] font-medium">
                    G.C.E. Ordinary Level National Syllabus
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Feature Tabs */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-3.5 mb-7">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className={twMerge(`bg-[#f8fafc] [border:1px_solid_rgba(226,_232,_240,_0.85)] rounded-[18px] pt-4.5 pb-4.5 pl-5 pr-5 cursor-pointer [transition:all_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] hover:bg-[#ffffff] hover:[border-color:#cbd5e1] hover:[box-shadow:0_8px_20px_-5px_rgba(15,_23,_42,_0.05)] ${
                    activeTab === idx ? "bg-[#ffffff] [border-color:#3b82f6] [box-shadow:0_12px_30px_-8px_rgba(37,_99,_235,_0.12)] [&_.ui-platform-tabIconCircle]:bg-[#1d4ed8] [&_.ui-platform-tabIconCircle]:text-[#ffffff]" : ""
                  }`)}
                  onClick={() => setActiveTab(idx)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-[36px] h-[36px] rounded-[10px] bg-[#eff6ff] text-[#1d4ed8] flex items-center justify-center shrink-0 ui-platform-tabIconCircle">{feat.icon}</div>
                    <div className="text-[length:1.05rem] font-extrabold text-[#0f172a]">{feat.title}</div>
                  </div>
                  <p className="text-[length:0.86rem] text-[#475569] leading-[1.5] pl-12 max-sm:pl-0">{feat.desc}</p>
                  {activeTab === idx && (
                    <div className="mt-3 pl-12 max-sm:pl-0 flex flex-col gap-2 animate-[fadeIn_0.25s_ease-out]">
                      {feat.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2 text-[length:0.82rem] font-semibold text-[#1e293b]">
                          <Check size={15} className="text-[#10b981] shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2.5">
              <button
                type="button"
                onClick={onOpenJoin}
                className="max-w-full inline-flex items-center justify-center gap-3 bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_60%,_#1e3a8a_100%)] text-[#ffffff] font-semibold text-[length:1rem] pt-[13px] pb-[13px] pl-6.5 pr-6.5 rounded-[var(--radius-pill)] [box-shadow:0_10px_25px_-4px_rgba(29,_78,_216,_0.42)] [transition:all_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] cursor-pointer hover:[transform:translateY(-2px)] hover:[box-shadow:0_16px_32px_-4px_rgba(29,_78,_216,_0.52)] hover:bg-[linear-gradient(135deg,_#0369a1_0%,_#1e40af_60%,_#172554_100%)]"
              >
                Access the Student Portal Now ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
