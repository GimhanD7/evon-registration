"use client";

import Image from "next/image";
import { ArrowUpRight, BookOpen, Play, Sparkles } from "lucide-react";
import educatorCutout from "../../public/images/educator-cutout.png";

interface HeroProps {
  onOpenJoin: () => void;
  onOpenVideo: () => void;
  onOpenCourses: () => void;
}

export default function Hero({
  onOpenJoin,
  onOpenVideo,
  onOpenCourses,
}: HeroProps) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate -mt-[88px] min-h-[800px] overflow-hidden bg-[#edf2f3] pt-[180px] pb-20 lg:min-h-[min(900px,100svh)] max-lg:pt-[140px] max-lg:pb-0 max-md:mt-0 max-md:pt-8 max-sm:pt-6"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-44 -left-40 -z-10 size-[600px] rounded-full bg-[#7daac6]/25 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[54%] bg-[#3e75b6] [clip-path:polygon(25%_0,100%_0,100%_100%,44%_100%,0_29%)] max-lg:top-auto max-lg:h-[540px] max-lg:w-full max-lg:[clip-path:polygon(22%_0,100%_0,100%_100%,0_100%,0_25%)] max-sm:h-[clamp(340px,110vw,450px)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 -right-4 -z-10 w-[54%] bg-[linear-gradient(160deg,#007fba_0%,#007bb6_40%,#00acd4_41%,#008dc4_100%)] [clip-path:polygon(26%_0,100%_0,100%_100%,46%_100%,0_30%)] max-lg:top-auto max-lg:h-[525px] max-lg:w-full max-lg:[clip-path:polygon(24%_0,100%_0,100%_100%,0_100%,0_27%)] max-sm:h-[clamp(325px,106vw,435px)]" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 h-40 w-24 bg-[#007fba] [clip-path:polygon(0_0,100%_100%,0_100%)] max-lg:hidden" />

      <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-2 px-8 max-lg:grid-cols-1 max-sm:px-4">
        <div className="relative z-10 min-w-0 max-w-[570px] pb-5 max-lg:max-w-[640px] max-lg:pb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe]/80 px-3.5 py-1 text-[11px] leading-5 font-extrabold tracking-[1.5px] text-[#007fb8] uppercase backdrop-blur-sm max-sm:mb-3.5 max-sm:text-[9.5px]">
            <BookOpen size={14} strokeWidth={2.5} />
            English Medium O/L Commerce
          </div>

          <h1 id="hero-heading" className="text-[clamp(44px,6.2vw,84px)] leading-[0.98] font-black tracking-[-3px] sm:tracking-[-5px] text-[#102c45]">
            Your future.<br />
            Starts with<br />
            <span className="bg-[linear-gradient(135deg,#007fb8_0%,#0ac9e8_100%)] bg-clip-text text-transparent">Commerce.</span>
          </h1>

          <div className="mt-4 flex items-center gap-2.5 sm:gap-3">
            <span aria-hidden="true" className="h-0.5 w-8 shrink-0 bg-[#00b7dd] sm:w-10" />
            <p className="text-[11.5px] font-black tracking-[2px] text-[#007fb8] uppercase max-sm:text-[10px] max-sm:tracking-[1.2px]">
              Winners take it all... and Stand above all...
            </p>
          </div>

          <div className="mt-7 max-w-[460px] border-t border-[#cddce5] pt-5 max-sm:mt-5 max-sm:pt-4">
            <p className="text-[15px] leading-[1.75] font-medium text-[#60768a] max-sm:text-[13.5px]">
              Clear concepts. Confident answers. A brighter future.
              Build an unshakable foundation in O/L Business &amp; Accounting Studies with
              <strong> Evon Aravinda</strong> — across 8 physical halls or islandwide online.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 max-[480px]:flex-col max-[480px]:items-stretch">
              <button
                type="button"
                id="hero-join-now-btn"
                onClick={onOpenJoin}
                className="group inline-flex items-center justify-between gap-4 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-2 pr-2 pl-6 text-[13px] font-extrabold text-white shadow-lg shadow-[#007fb8]/25 transition-all hover:scale-102 active:scale-95 cursor-pointer max-[480px]:justify-between"
              >
                Join Next Class
                <span className="flex size-9 items-center justify-center rounded-full bg-[#0ac9e8] text-[#06314b] transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={20} strokeWidth={2.5} />
                </span>
              </button>
              <button
                type="button"
                id="hero-explore-courses-btn"
                onClick={onOpenCourses}
                className="group inline-flex items-center justify-between gap-4 rounded-full border border-[#b6cad9] bg-white/80 backdrop-blur-md py-2 pr-2 pl-6 text-[13px] font-bold text-[#254967] shadow-xs transition-all hover:bg-white active:scale-95 cursor-pointer max-[480px]:justify-between"
              >
                View Timetable
                <span className="flex size-9 items-center justify-center rounded-full bg-[#d9edf4] text-[#007fb8] transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={20} strokeWidth={2.5} />
                </span>
              </button>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={onOpenVideo}
                className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white/60 backdrop-blur-sm px-4 py-2 text-[12px] font-extrabold text-[#102c45] shadow-2xs transition-all hover:border-[#007fb8] hover:text-[#007fb8] active:scale-95 cursor-pointer"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-[#007fb8] text-white">
                  <Play size={10} fill="currentColor" className="ml-0.5" />
                </span>
                Watch 1-Min Sample Masterclass
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none relative min-h-[560px] lg:hidden max-sm:min-h-[clamp(340px,110vw,450px)]" aria-hidden="true" />
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 h-[90%] w-[51%] max-lg:right-[4%] max-lg:h-[530px] max-lg:w-[85%] max-sm:right-[-5%] max-sm:h-[clamp(330px,108vw,440px)] max-sm:w-full">
        <Image
          src={educatorCutout}
          alt="Evon Aravinda, your O/L Commerce educator"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 51vw"
          className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_65%,transparent_100%)] [filter:drop-shadow(-15px_8px_25px_rgba(0,43,83,0.12))]"
        />
      </div>

      <div className="absolute right-[5%] bottom-8 z-10 text-right text-white max-lg:right-6 max-lg:bottom-6 max-sm:right-4 max-sm:bottom-4">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-[9px] font-bold tracking-[1.8px] uppercase backdrop-blur-sm">
          <Sparkles size={12} /> Access to Success
        </div>
        <p className="text-[26px] leading-tight font-extrabold tracking-[-0.8px] max-sm:text-[20px]">Evon Aravinda</p>
        <p className="mt-1 text-[10px] font-medium tracking-[2px] text-white/80 uppercase max-sm:text-[9px]">Your Commerce mentor</p>
      </div>
    </section>
  );
}
