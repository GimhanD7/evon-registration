"use client";

import React from "react";
import { Compass, Lightbulb, Target, Trophy, ArrowUpRight } from "lucide-react";

interface FeaturePillarsProps {
  onOpenJoin: () => void;
}

export default function FeaturePillars({ onOpenJoin }: FeaturePillarsProps) {
  const pillars = [
    {
      num: "01",
      title: "DISCIPLINE",
      subtitle: "Structured Consistency",
      desc: "Weekly timed assignments, syllabus tracking, and study schedules engineered for peak O/L readiness.",
      icon: <Compass size={22} className="text-[#007fb8]" />,
      badge: "Foundation",
    },
    {
      num: "02",
      title: "CONCEPT",
      subtitle: "Unmatched Conceptual Clarity",
      desc: "We eliminate rote memorization. Understand business concepts and basic accounting with real everyday examples.",
      icon: <Lightbulb size={22} className="text-[#f59e0b]" />,
      badge: "Clarity",
    },
    {
      num: "03",
      title: "PRACTICE",
      subtitle: "Past & Model Paper Engine",
      desc: "Rigorous paper discussions covering 25+ years of past papers and real-time marking criteria analysis.",
      icon: <Target size={22} className="text-[#159366]" />,
      badge: "Mastery",
    },
    {
      num: "04",
      title: "RESULTS",
      subtitle: "Confidence for the Exam",
      desc: "Transforming ambitious students into top performers. Build the study habits needed for maximum marks.",
      icon: <Trophy size={22} className="text-[#3e70b3]" />,
      badge: "Success",
    },
  ];

  return (
    <section
      className="relative bg-[linear-gradient(180deg,_rgba(248,_250,_252,_0.5)_0%,_rgba(237,_242,_243,_0.8)_100%)] pt-14 pb-18 max-sm:pt-10 max-sm:pb-12"
      id="pillars"
    >
      <div className="mx-auto w-full max-w-[var(--container-max)] px-6 max-sm:px-3">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-[680px] text-center max-sm:mb-6">
          <div className="mb-3.5 inline-block rounded-full border border-[#cddce5] bg-[#e0f2fe] px-3.5 py-1 text-[11px] font-extrabold tracking-[1.2px] text-[#007fb8] uppercase shadow-xs">
            THE 4 PILLARS OF EXCELLENCE
          </div>
          <h2 className="mb-3 text-[clamp(26px,3.5vw,40px)] leading-[1.15] font-black tracking-[-1px] text-[#102c45] max-sm:text-[22px]">
            Why Top Achievers Choose <br />
            <span className="bg-[linear-gradient(135deg,#007fb8_0%,#0ac9e8_100%)] bg-clip-text text-transparent">
              Evon Aravinda&apos;s Methodology
            </span>
          </h2>
          <p className="text-[14.5px] leading-[1.65] font-medium text-[#60768a] max-sm:text-[12.5px]">
            A proven 4-stage pedagogical framework designed to turn complex commerce concepts into effortless examination mastery.
          </p>
        </div>

        {/* 4 Cards Grid - Exactly 2 Cards Per Row on All Screens (Desktop & Mobile) */}
        <div className="mb-8 grid grid-cols-2 gap-5 max-sm:gap-2.5">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="flex min-w-0 flex-col justify-between rounded-3xl border border-[#cddce5] bg-white p-6 shadow-[0_10px_30px_-10px_rgba(16,44,69,0.06)] transition-all hover:-translate-y-1 hover:border-[#007fb8] hover:shadow-[0_20px_40px_-12px_rgba(0,127,184,0.18)] max-sm:rounded-2xl max-sm:p-3"
            >
              <div>
                {/* Header: Number + Badge */}
                <div className="mb-4 flex items-center justify-between gap-1 max-sm:mb-2">
                  <span className="font-mono text-[22px] font-black text-[#cddce5] tabular-nums max-sm:text-[16px]">
                    {item.num}
                  </span>
                  <span className="truncate rounded-md border border-[#cddce5] bg-[#edf2f3] px-2 py-0.5 text-[9.5px] font-extrabold tracking-[0.5px] text-[#254967] uppercase max-sm:text-[8px] max-sm:px-1 max-sm:py-0.2">
                    {item.badge}
                  </span>
                </div>

                {/* Icon Container */}
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] shadow-xs max-sm:mb-2 max-sm:size-8 max-sm:rounded-xl [&>svg]:max-sm:size-4">
                  {item.icon}
                </div>

                {/* Title & Subtitle */}
                <h3 className="mb-1 text-[18px] font-black tracking-tight text-[#102c45] max-sm:text-[13.5px] max-sm:leading-tight">
                  {item.title}
                </h3>
                <div className="mb-2 text-[12px] font-bold text-[#007fb8] max-sm:mb-1.5 max-sm:text-[10px] max-sm:leading-tight">
                  {item.subtitle}
                </div>

                {/* Description */}
                <p className="text-[13px] leading-[1.55] text-[#60768a] max-sm:text-[10.5px] max-sm:leading-[1.4]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner (Theme Colors Applied) */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[linear-gradient(135deg,#102c45_0%,#164466_50%,#007fb8_100%)] p-7 text-white shadow-[0_16px_36px_-10px_rgba(16,44,69,0.3)] max-sm:flex-col max-sm:p-4 max-sm:text-center">
          <div className="text-[17px] font-black tracking-tight max-sm:text-[14px]">
            Ready to experience the smart way to learn Commerce?
          </div>
          <button
            type="button"
            onClick={onOpenJoin}
            className="group inline-flex items-center gap-3 rounded-full bg-[#0ac9e8] py-2 pr-2 pl-6 text-[12.5px] font-black text-[#06314b] shadow-lg transition-transform hover:scale-105 hover:bg-[#38d995] max-sm:w-full max-sm:justify-between max-sm:text-[11px] max-sm:py-1.5 max-sm:pl-4"
          >
            Join the Next Batch
            <span className="flex size-7 items-center justify-center rounded-full bg-[#06314b] text-white transition-transform group-hover:rotate-45 max-sm:size-6">
              <ArrowUpRight size={16} strokeWidth={2.5} className="max-sm:size-3.5" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
