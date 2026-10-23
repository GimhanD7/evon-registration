"use client";

import { ArrowUpRight, Award, CheckCircle2 } from "lucide-react";

interface StatsCounterProps {
  onOpenJoin: () => void;
}

export default function StatsCounter({ onOpenJoin }: StatsCounterProps) {
  return (
    <section id="results" aria-labelledby="results-heading" className="scroll-mt-28 bg-[#f8fafb] px-6 py-16 max-sm:px-4 max-sm:py-10">
      <div className="mx-auto max-w-[1152px] overflow-hidden rounded-[28px] border border-[#dce6ec] bg-white shadow-[0_16px_50px_-30px_rgba(12,41,68,0.2)]">
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center max-md:grid-cols-2 max-[400px]:grid-cols-1">
          <div className="p-9 max-md:col-span-2 max-[400px]:col-span-1 max-md:pb-6 max-sm:p-6">
            <span className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-[#e9f5fb] px-3 py-1.5 text-[10px] font-bold tracking-[1.5px] text-[#007fb8] uppercase">
              <Award size={14} /> English Medium Commerce
            </span>
            <h2 id="results-heading" className="mt-5 text-[32px] leading-tight font-black tracking-[-1px] text-[#102c45] max-sm:text-[28px]">2025 O/L Exam<br />Results that inspire.</h2>
            <p className="mt-4 font-serif text-[19px] leading-relaxed font-semibold text-[#60768a] italic">Winners take it all...<br />and Stand above all...</p>
          </div>
          <div className="mx-0 border-l border-[#e3edf2] px-7 py-8 text-center max-md:border-l-0 max-sm:px-3">
            <p className="text-[clamp(64px,7vw,96px)] leading-none font-black tracking-[-5px] text-[#007fb8] max-sm:text-[clamp(48px,15vw,64px)]">90<span className="text-[0.55em]">%</span></p>
            <p className="mt-3 text-[18px] font-extrabold text-[#102c45]">A Passes</p>
            <p className="mt-1.5 text-[11px] font-medium text-[#72859c]">2025 O/L Commerce Exam</p>
          </div>
          <div className="border-l border-[#e3edf2] px-7 py-8 text-center max-sm:px-3 max-[400px]:border-t max-[400px]:border-l-0">
            <p className="text-[clamp(64px,7vw,96px)] leading-none font-black tracking-[-5px] text-[#102c45] max-sm:text-[clamp(48px,15vw,64px)]">100<span className="text-[0.55em]">%</span></p>
            <p className="mt-3 flex items-center justify-center gap-2 text-[18px] font-extrabold text-[#102c45]"><CheckCircle2 size={18} className="text-[#159366]" /> Pass Rate</p>
            <p className="mt-1.5 text-[11px] font-medium text-[#72859c]">2025 O/L Commerce Exam</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-6 border-t border-[#e3edf2] bg-[#f0f7fa] px-9 py-6 max-sm:flex-col max-sm:items-start max-sm:gap-4 max-sm:px-6">
          <div>
            <p className="text-[13px] font-semibold text-[#60768a]">Let&apos;s All win and win to the Maximum!</p>
            <p className="mt-1 text-[20px] leading-snug font-bold tracking-[-0.4px] text-[#102c45]">Join us, <span className="font-medium">to the class where everyone achieves Victory!</span></p>
          </div>
          <button type="button" onClick={onOpenJoin} className="group inline-flex shrink-0 items-center gap-4 rounded-full bg-[#0c2944] py-1.5 pr-1.5 pl-6 text-[12px] font-bold text-white transition-colors hover:bg-[#164466]">
            Join us
            <span className="flex size-10 items-center justify-center rounded-full bg-[#0ac9e8] text-[#06314b] transition-transform group-hover:rotate-45"><ArrowUpRight size={21} /></span>
          </button>
        </div>
      </div>
    </section>
  );
}
