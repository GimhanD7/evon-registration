"use client";

import Image from "next/image";
import { ArrowUpRight, BookOpen, Play, Sparkles } from "lucide-react";

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
      className="relative isolate -mt-[88px] min-h-[800px] overflow-hidden bg-[#edf2f3] pt-[180px] pb-20 lg:min-h-[min(900px,100svh)] max-lg:pt-[140px] max-lg:pb-0 max-md:mt-0 max-md:pt-10 max-sm:pt-8"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-44 -left-40 -z-10 size-[600px] rounded-full bg-[#7daac6]/25 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[54%] bg-[#3e75b6] [clip-path:polygon(25%_0,100%_0,100%_100%,44%_100%,0_29%)] max-lg:top-auto max-lg:h-[540px] max-lg:w-full max-lg:[clip-path:polygon(22%_0,100%_0,100%_100%,0_100%,0_25%)] max-sm:h-[clamp(340px,110vw,450px)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 -right-4 -z-10 w-[54%] bg-[linear-gradient(160deg,#007fba_0%,#007bb6_40%,#00acd4_41%,#008dc4_100%)] [clip-path:polygon(26%_0,100%_0,100%_100%,46%_100%,0_30%)] max-lg:top-auto max-lg:h-[525px] max-lg:w-full max-lg:[clip-path:polygon(24%_0,100%_0,100%_100%,0_100%,0_27%)] max-sm:h-[clamp(325px,106vw,435px)]" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 h-40 w-24 bg-[#007fba] [clip-path:polygon(0_0,100%_100%,0_100%)] max-lg:hidden" />

      <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-2 px-8 max-lg:grid-cols-1 max-sm:px-6">
        <div className="relative z-10 min-w-0 max-w-[570px] pb-5 max-lg:max-w-[640px] max-lg:pb-12">
          <div className="mb-7 flex items-center gap-2 text-[11px] leading-5 font-extrabold tracking-[2px] text-[#3e75b6] uppercase max-sm:mb-5 max-sm:text-[9px] max-sm:tracking-[1.2px]">
            <BookOpen size={15} strokeWidth={2.5} />
            English Medium O/L Commerce
          </div>

          <h1 id="hero-heading" className="text-[clamp(58px,5.8vw,84px)] leading-[0.98] font-black tracking-[-5px] text-[#102c45] max-sm:text-[clamp(40px,12vw,56px)] max-sm:tracking-[-3px]">
            Your future.<br />
            Starts with<br />
            <span className="text-[#007fb8]">Commerce.</span>
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-10 shrink-0 bg-[#00b7dd]" />
            <p className="text-[12px] font-extrabold tracking-[2.6px] text-[#007fb8] uppercase max-sm:text-[10px] max-sm:tracking-[1.8px]">Winners take it all... and Stand above all...</p>
          </div>

          <div className="mt-9 max-w-[460px] border-t border-[#cddce5] pt-6 max-sm:mt-7 max-sm:pt-5">
            <p className="text-[15px] leading-[1.8] font-medium text-[#60768a] max-sm:text-[14px]">
              Clear concepts. Confident answers. A brighter future.
              Build a strong foundation in O/L Business & Accounting Studies with
              Evon Aravinda — wherever you learn.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 max-[420px]:flex-col max-[420px]:items-stretch">
              <button
                type="button"
                id="hero-join-now-btn"
                onClick={onOpenJoin}
                className="group inline-flex items-center justify-between gap-4 rounded-full bg-[#3e70b3] py-1.5 pr-1.5 pl-6 text-[13px] font-bold text-white transition-colors hover:bg-[#285c9f]"
              >
                Join the class
                <span className="flex size-10 items-center justify-center rounded-full bg-[#0ac9e8] text-[#06314b] transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={22} strokeWidth={2} />
                </span>
              </button>
              <button
                type="button"
                id="hero-explore-courses-btn"
                onClick={onOpenCourses}
                className="group inline-flex items-center justify-between gap-4 rounded-full border border-[#b6cad9] bg-white/55 py-1.5 pr-1.5 pl-6 text-[13px] font-bold text-[#254967] transition-colors hover:bg-white"
              >
                Explore courses
                <span className="flex size-10 items-center justify-center rounded-full bg-[#d9edf4] text-[#007fb8] transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={22} strokeWidth={2} />
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenVideo}
              className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold text-[#60768a] transition-colors hover:text-[#007fb8]"
            >
              <Play size={13} fill="currentColor" /> Take a look inside the classroom
            </button>
          </div>
        </div>

        <div className="pointer-events-none relative min-h-[560px] lg:hidden max-sm:min-h-[clamp(340px,110vw,450px)]" aria-hidden="true" />
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 h-[90%] w-[51%] max-lg:right-[4%] max-lg:h-[530px] max-lg:w-[85%] max-sm:right-[-5%] max-sm:h-[clamp(330px,108vw,440px)] max-sm:w-full">
        <Image
          src="/images/educator-cutout.png"
          alt="Evon Aravinda, your O/L Commerce educator"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 51vw"
          className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_65%,transparent_100%)] [filter:drop-shadow(-15px_8px_25px_rgba(0,43,83,0.12))]"
        />
      </div>

      <div className="absolute right-[5%] bottom-8 z-10 text-right text-white max-lg:right-6 max-lg:bottom-6">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-[9px] font-bold tracking-[1.8px] uppercase backdrop-blur-sm">
          <Sparkles size={12} /> Access to Success
        </div>
        <p className="text-[26px] leading-tight font-extrabold tracking-[-0.8px] max-sm:text-[23px]">Evon Aravinda</p>
        <p className="mt-1 text-[10px] font-medium tracking-[2px] text-white/80 uppercase">Your Commerce mentor</p>
      </div>
    </section>
  );
}
