"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Star, GraduationCap, Quote, ArrowUpRight, Sparkles } from "lucide-react";

export default function TopRanksShowcase() {
  const rankers = [
    {
      name: "Sachithra Weerasinghe",
      school: "Ananda College, Colombo",
      rank: "Top Achiever",
      quote:
        "Evon sir's speed revision and model exam papers gave me the exact timing strategy required for the real exam. The concepts were crystal clear!",
      badgeColor: "gold",
    },
    {
      name: "Dinithi Jayasuriya",
      school: "Devi Balika Vidyalaya, Colombo",
      rank: "Top Achiever",
      quote:
        "Accounting used to be daunting until I started following Evon sir. His structured notes and past paper breakdown were the true game-changer.",
      badgeColor: "silver",
    },
    {
      name: "Kavindu Wickramasinghe",
      school: "Dharmaraja College, Kandy",
      rank: "Top Achiever",
      quote:
        "Even though I joined through the online platform from Kandy, the live interactive Q&A and doorstep tute delivery felt like physical class!",
      badgeColor: "bronze",
    },
    {
      name: "Tharushi Sandunika",
      school: "Southlands College, Galle",
      rank: "Top Achiever",
      quote:
        "Evon sir's dedication is unparalleled. Every monthly exam was strictly evaluated and given individual feedback on where marks were lost.",
      badgeColor: "bronze",
    },
  ];

  return (
    <section
      className="relative bg-[linear-gradient(180deg,#f8fafc_0%,#edf2f3_100%)] pt-18 pb-20 max-sm:pt-12 max-sm:pb-14"
      id="results"
    >
      <div className="mx-auto w-full max-w-[var(--container-max)] px-6 max-sm:px-4">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-[680px] text-center max-sm:mb-8">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3.5 py-1 text-[11px] font-extrabold tracking-[1.2px] text-[#007fb8] uppercase shadow-xs">
            <Trophy size={14} className="text-[#007fb8]" /> 2025 O/L EXAM RESULTS
          </div>
          <h2 className="mb-4 text-[clamp(28px,3.5vw,42px)] leading-[1.15] font-black tracking-[-1px] text-[#102c45]">
            Champions in Commerce <br />
            <span className="bg-[linear-gradient(135deg,#007fb8_0%,#0ac9e8_100%)] bg-clip-text text-transparent">
              2025 O/L High Achievers
            </span>
          </h2>
          <p className="text-[15px] leading-[1.65] font-medium text-[#60768a] max-sm:text-[13px]">
            Over 50+ students achieved 9A&apos;s and 169+ secured top passes in English Medium Business &amp; Accounting Studies.
          </p>
        </div>

        {/* Responsive student cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-sm:gap-4">
          {rankers.map((r, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-3xl border border-[#cddce5] bg-white p-6 shadow-[0_10px_30px_-10px_rgba(16,44,69,0.06)] transition-all hover:-translate-y-1 hover:border-[#007fb8] hover:shadow-[0_20px_40px_-12px_rgba(0,127,184,0.18)] max-sm:rounded-2xl max-sm:p-3.5"
            >
              <div>
                {/* Card Top: Rank Badge & Stream Tag */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 max-sm:mb-2.5">
                  <div className="inline-flex items-center gap-1 rounded-full border border-[#38d995]/50 bg-[#e8f7f2] px-2.5 py-1 text-[11px] font-extrabold text-[#159366] max-sm:text-[9px] max-sm:px-2 max-sm:py-0.5">
                    <Trophy size={13} className="text-[#159366] max-sm:size-3" />
                    <span>{r.rank}</span>
                  </div>
                  <span className="rounded-md border border-[#cddce5] bg-[#edf2f3] px-2 py-0.5 text-[10.5px] font-bold text-[#007fb8] max-sm:text-[9px]">
                    O/L Commerce
                  </span>
                </div>

                {/* Student Info */}
                <div className="mb-3.5 max-sm:mb-2">
                  <h3 className="text-[17px] font-black leading-snug text-[#102c45] max-sm:text-[13.5px]">
                    {r.name}
                  </h3>
                  <div className="text-[12px] font-semibold text-[#60768a] max-sm:text-[10.5px]">
                    {r.school}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#edf5fa] px-2 py-0.5 text-[10.5px] font-bold text-[#007fb8] max-sm:text-[9px] max-sm:mt-1">
                    <GraduationCap size={13} className="max-sm:size-3" />
                    <span>Business &amp; Accounting Studies</span>
                  </div>
                </div>

                {/* Quote Box */}
                <div className="relative mb-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 pl-7 text-[12.5px] leading-[1.5] text-[#475569] italic max-sm:mb-2.5 max-sm:p-2 max-sm:pl-6 max-sm:text-[10.5px] max-sm:leading-[1.4]">
                  <Quote
                    size={15}
                    className="absolute top-2 left-2 text-[#94a3b8] max-sm:size-3 max-sm:top-1.5 max-sm:left-1.5"
                  />
                  <p className="line-clamp-3">{r.quote}</p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-auto flex items-center justify-between border-t border-[#f1f5f9] pt-3 max-sm:pt-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={14}
                      fill="#f59e0b"
                      color="#f59e0b"
                      className="max-sm:size-3"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-black text-[#159366] max-sm:text-[9px]">
                  9A Batch
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Full Results Page */}
        <div className="mt-12 text-center max-sm:mt-8">
          <Link
            href="/results"
            className="group inline-flex items-center gap-3 rounded-full bg-[#102c45] py-2 pr-2 pl-6 text-[13px] font-black text-white shadow-xl transition-all hover:scale-105 hover:bg-[#007fb8] max-sm:text-[11.5px] max-sm:py-1.5 max-sm:pl-4"
          >
            <span>View Full 2025 Results Sheet (169+ Champions)</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-[#0ac9e8] text-[#06314b] transition-transform group-hover:rotate-45 max-sm:size-6">
              <ArrowUpRight size={16} strokeWidth={2.5} className="max-sm:size-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
