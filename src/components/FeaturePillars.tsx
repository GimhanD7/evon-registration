"use client";

import React from "react";
import { Compass, Lightbulb, Target, Trophy, ArrowRight } from "lucide-react";

interface FeaturePillarsProps {
  onOpenJoin: () => void;
}

export default function FeaturePillars({ onOpenJoin }: FeaturePillarsProps) {
  const pillars = [
    {
      num: "01",
      title: "DISCIPLINE",
      subtitle: "Structured Consistency",
      desc: "Weekly timed assignments, systematic syllabus tracking, and study schedules engineered to ensure peak readiness for the G.C.E. O/L exam.",
      icon: <Compass size={26} className="text-[#0284c7]" />,
      badge: "Foundation",
    },
    {
      num: "02",
      title: "CONCEPT",
      subtitle: "Unmatched Conceptual Clarity",
      desc: "We eliminate rote memorization. Understand business concepts and basic accounting through clear, everyday examples.",
      icon: <Lightbulb size={26} className="text-[#d97706]" />,
      badge: "Understanding",
    },
    {
      num: "03",
      title: "PRACTICE",
      subtitle: "Past & Model Paper Engine",
      desc: "Rigorous paper discussions covering 25+ years of past papers, custom islandwide model papers, and real-time marking criteria analysis.",
      icon: <Target size={26} className="text-[#059669]" />,
      badge: "Mastery",
    },
    {
      num: "04",
      title: "RESULTS",
      subtitle: "Confidence for the O/L Exam",
      desc: "Transforming ambitious students into top performers. Build the understanding, study habits and exam confidence needed for the next stage of school.",
      icon: <Trophy size={26} className="text-[#7c3aed]" />,
      badge: "Success",
    },
  ];

  return (
    <section className="pt-15 pr-0 pb-20 pl-0 relative bg-[linear-gradient(180deg,_rgba(248,_250,_252,_0.4)_0%,_rgba(241,_245,_249,_0.7)_100%)]" id="pillars">
      <div className="w-full max-w-[var(--container-max)] ml-auto mr-auto pl-6 pr-6 max-[640px]:pl-4 max-[640px]:pr-4">
        <div className="text-center max-w-[680px] mt-0 mr-auto mb-12.5 ml-auto">
          <div className="inline-block [background:rgba(14,_165,_233,_0.1)] [border:1px_solid_rgba(14,_165,_233,_0.25)] text-[#0284c7] text-[length:0.75rem] font-extrabold tracking-[1.2px] pt-[5px] pb-[5px] pl-3.5 pr-3.5 rounded-full mb-4 uppercase">THE 4 PILLARS OF EXCELLENCE</div>
          <h2 className="text-[length:2.35rem] font-[850] leading-[1.2] text-[#0f172a] tracking-[-0.8px] mb-4 max-[640px]:text-[length:1.85rem]">
            Why Top Achievers Choose <br />
            <span className="bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_100%)] bg-clip-text [-webkit-text-fill-color:transparent]">Evon Aravinda&apos;s Methodology</span>
          </h2>
          <p className="text-[length:1rem] text-[#64748b] leading-[1.6]">
            A proven 4-stage pedagogical framework designed to turn complex commerce concepts into effortless examination mastery.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(4,_1fr)] gap-6 mb-10 max-[1024px]:grid-cols-[repeat(2,_1fr)] max-[640px]:grid-cols-[1fr]">
          {pillars.map((item, idx) => (
            <div key={idx} className="bg-[#ffffff] [border:1px_solid_rgba(226,_232,_240,_0.9)] rounded-[22px] pt-7 pb-7 pl-6 pr-6 [box-shadow:0_10px_30px_-10px_rgba(15,_23,_42,_0.05)] [transition:all_0.3s_cubic-bezier(0.16,_1,_0.3,_1)] flex flex-col hover:[transform:translateY(-6px)] hover:[box-shadow:0_20px_40px_-12px_rgba(37,_99,_235,_0.14)] hover:[border-color:rgba(147,_197,_253,_0.9)]">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[length:1.6rem] font-black text-[#cbd5e1] [font-variant-numeric:tabular-nums]">{item.num}</span>
                <span className="text-[length:0.7rem] font-bold uppercase tracking-[0.5px] bg-[#f1f5f9] text-[#475569] pt-[3px] pb-[3px] pl-2 pr-2 rounded-[6px]">{item.badge}</span>
              </div>
              <div className="w-[56px] h-[56px] rounded-[16px] bg-[#f8fafc] flex items-center justify-center mb-5 [border:1px_solid_#f1f5f9]">{item.icon}</div>
              <h3 className="text-[length:1.25rem] font-[850] text-[#0f172a] tracking-[0.5px] mb-1">{item.title}</h3>
              <div className="text-[length:0.82rem] font-bold text-[#0284c7] mb-3">{item.subtitle}</div>
              <p className="text-[length:0.88rem] text-[#475569] leading-[1.55]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[linear-gradient(135deg,_#1e3a8a_0%,_#1d4ed8_60%,_#0369a1_100%)] rounded-[20px] pt-5.5 pb-5.5 pl-8 pr-8 flex items-center justify-between text-[#ffffff] [box-shadow:0_16px_36px_-10px_rgba(29,_78,_216,_0.4)] flex-wrap gap-4 max-[640px]:flex-col max-[640px]:text-center max-[640px]:p-5">
          <div className="text-[length:1.15rem] font-bold">
            Ready to experience the smart way to learn Commerce?
          </div>
          <button
            type="button"
            onClick={onOpenJoin}
            className="bg-[#ffffff] text-[#1d4ed8] font-bold text-[length:0.95rem] pt-3 pb-3 pl-6 pr-6 rounded-full [box-shadow:0_4px_14px_rgba(0,_0,_0,_0.15)] [transition:all_0.2s_ease] cursor-pointer hover:bg-[#f8fafc] hover:[transform:translateY(-2px)] hover:[box-shadow:0_8px_20px_rgba(0,_0,_0,_0.2)]"
          >
            Join the Next Batch ➔
          </button>
        </div>
      </div>
    </section>
  );
}
