"use client";

import { ArrowUpRight, Award, CheckCircle2 } from "lucide-react";

interface StatsCounterProps {
  onOpenJoin: () => void;
}

export default function StatsCounter({ onOpenJoin }: StatsCounterProps) {
  return (
    <section
      id="statistics"
      aria-labelledby="results-heading"
      className="scroll-mt-28 bg-[#f8fafb] px-6 py-12 max-sm:px-3.5 max-sm:py-8"
    >
      <div className="mx-auto max-w-[1152px] overflow-hidden rounded-3xl border border-[#cddce5] bg-white shadow-[0_16px_50px_-30px_rgba(16,44,69,0.14)] max-sm:rounded-2xl">
        {/* Top Content Row */}
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] items-center max-md:grid-cols-2 max-md:gap-4 max-md:p-6 max-sm:gap-2.5 max-sm:p-3.5">
          {/* Header Text Block */}
          <div className="p-8 max-md:col-span-2 max-md:p-0 max-sm:mb-1">
            <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-full bg-[#e9f5fb] px-3 py-1 text-[10px] font-extrabold tracking-[1.5px] text-[#007fb8] uppercase border border-[#007fb8]/20">
              <Award size={13} /> English Medium Commerce
            </span>
            <h2
              id="results-heading"
              className="mt-3 text-[clamp(24px,3.2vw,32px)] leading-tight font-black tracking-[-1px] text-[#102c45] max-sm:text-[20px]"
            >
              2025 O/L Exam<br />Results that inspire.
            </h2>
            <p className="mt-2 font-serif text-[16px] leading-relaxed font-semibold text-[#60768a] italic max-sm:text-[13.5px]">
              Winners take it all... and Stand above all...
            </p>
          </div>

          {/* Stat Card 1 */}
          <div className="border-l border-[#e3edf2] px-6 py-8 text-center max-md:border-0 rounded-2xl max-md:bg-[#edf5fa]/80 max-sm:p-3.5 max-sm:border max-sm:border-[#cddce5]/80">
            <p className="text-[clamp(44px,6.5vw,88px)] leading-none font-black tracking-[-3px] sm:tracking-[-4px] text-[#007fb8] max-sm:text-[38px]">
              90<span className="text-[0.55em]">%</span>
            </p>
            <p className="mt-2 text-[16px] font-black text-[#102c45] max-sm:text-[13px]">
              A Passes
            </p>
            <p className="mt-1 text-[11px] font-bold text-[#72859c] max-sm:text-[9.5px]">
              2025 O/L Commerce
            </p>
          </div>

          {/* Stat Card 2 */}
          <div className="border-l border-[#e3edf2] px-6 py-8 text-center max-md:border-0 rounded-2xl max-md:bg-[#edf5fa]/80 max-sm:p-3.5 max-sm:border max-sm:border-[#cddce5]/80">
            <p className="text-[clamp(44px,6.5vw,88px)] leading-none font-black tracking-[-3px] sm:tracking-[-4px] text-[#102c45] max-sm:text-[38px]">
              100<span className="text-[0.55em]">%</span>
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[16px] font-black text-[#102c45] max-sm:text-[13px]">
              <CheckCircle2 size={16} className="text-[#159366] max-sm:size-3.5" />
              Pass Rate
            </p>
            <p className="mt-1 text-[11px] font-bold text-[#72859c] max-sm:text-[9.5px]">
              2025 O/L Commerce
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between gap-4 border-t border-[#e3edf2] bg-[#f0f7fa] px-8 py-4.5 max-sm:flex-col max-sm:items-start max-sm:gap-3 max-sm:px-4 max-sm:py-4">
          <div>
            <p className="text-[12px] font-bold text-[#60768a] max-sm:text-[11px]">
              Let&apos;s All win and win to the Maximum!
            </p>
            <p className="mt-0.5 text-[16px] leading-snug font-black tracking-tight text-[#102c45] max-sm:text-[13.5px]">
              Join us, <span className="font-semibold text-[#007fb8]">where every student achieves Victory!</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenJoin}
            className="group inline-flex shrink-0 items-center justify-between gap-3 rounded-full bg-[#0c2944] py-1.5 pr-1.5 pl-5 text-[12px] font-black text-white shadow-md transition-all hover:bg-[#164466] active:scale-95 max-sm:w-full cursor-pointer"
          >
            Join the Class
            <span className="flex size-8 items-center justify-center rounded-full bg-[#0ac9e8] text-[#06314b] transition-transform group-hover:rotate-45">
              <ArrowUpRight size={17} strokeWidth={2.5} />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
