"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import { Trophy, Star, Award, GraduationCap, Quote } from "lucide-react";

export default function TopRanksShowcase() {
  const rankers = [
    {
      name: "Sachithra Weerasinghe",
      school: "Ananda College, Colombo",
      rank: "Student story",
      quote:
        "Evon sir's speed revision and model exam papers gave me the exact timing strategy required for the real exam. The concepts were crystal clear!",
      badgeColor: "gold",
    },
    {
      name: "Dinithi Jayasuriya",
      school: "Devi Balika Vidyalaya, Colombo",
      rank: "Student story",
      quote:
        "Accounting used to be daunting until I started following Evon sir. His structured notes and past paper breakdown were the true game-changer.",
      badgeColor: "silver",
    },
    {
      name: "Kavindu Wickramasinghe",
      school: "Dharmaraja College, Kandy",
      rank: "Student story",
      quote:
        "Even though I joined through the online platform from Kandy, the live interactive Q&A and doorstep tute delivery felt like physical class!",
      badgeColor: "bronze",
    },
    {
      name: "Tharushi Sandunika",
      school: "Southlands College, Galle",
      rank: "Student story",
      quote:
        "Evon sir's dedication is unparalleled. Every monthly exam was strictly evaluated and given individual feedback on where marks were lost.",
      badgeColor: "bronze",
    },
  ];

  return (
    <section className="pt-20 pb-20 pl-0 pr-0 relative bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]" id="top-ranks">
      <div className="w-full max-w-[var(--container-max)] ml-auto mr-auto pl-6 pr-6 max-[640px]:pl-4 max-[640px]:pr-4">
        <div className="text-center max-w-[680px] mt-0 mr-auto mb-12.5 ml-auto">
          <div className="inline-flex items-center gap-1.5 [background:rgba(245,_158,_11,_0.12)] [border:1px_solid_rgba(245,_158,_11,_0.35)] text-[#b45309] text-[length:0.75rem] font-extrabold tracking-[1.2px] pt-[5px] pb-[5px] pl-3.5 pr-3.5 rounded-full mb-4 uppercase">
            <Trophy size={14} className="text-[#d97706]" /> OUR STUDENTS
          </div>
          <h2 className="text-[length:2.35rem] font-[850] leading-[1.2] text-[#0f172a] tracking-[-0.8px] mb-4 max-[640px]:text-[length:1.85rem]">
            Learning with Confidence <br />
            <span className="bg-[linear-gradient(135deg,_#d97706_0%,_#f59e0b_50%,_#0284c7_100%)] bg-clip-text [-webkit-text-fill-color:transparent]">O/L Student Journeys</span>
          </h2>
          <p className="text-[length:1rem] text-[#64748b] leading-[1.6]">
            Meet students from our Commerce learning community and hear about their experience.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(4,_1fr)] gap-6 max-[1120px]:grid-cols-[repeat(2,_1fr)] max-[640px]:grid-cols-[1fr]">
          {rankers.map((r, idx) => (
            <div key={idx} className="bg-[#ffffff] [border:1px_solid_rgba(226,_232,_240,_0.9)] rounded-[22px] pt-6.5 pb-6.5 pl-5.5 pr-5.5 [box-shadow:0_10px_30px_-10px_rgba(15,_23,_42,_0.05)] flex flex-col [transition:all_0.3s_cubic-bezier(0.16,_1,_0.3,_1)] hover:[transform:translateY(-6px)] hover:[box-shadow:0_20px_42px_-10px_rgba(245,_158,_11,_0.18)] hover:[border-color:rgba(251,_191,_36,_0.8)]">
              <div className="flex items-center justify-between mb-4.5">
                <div
                  className={twMerge(`inline-flex items-center gap-1.5 text-[length:0.78rem] font-extrabold pt-1.5 pb-1.5 pl-3 pr-3 rounded-full ${
                    (r.badgeColor === "gold" ? "bg-[#fef3c7] text-[#b45309] [border:1px_solid_#fde68a]" : r.badgeColor === "silver" ? "bg-[#f1f5f9] text-[#334155] [border:1px_solid_#cbd5e1]" : "bg-[#ffedd5] text-[#c2410c] [border:1px_solid_#fed7aa]")
                  }`)}
                >
                  <Trophy size={16} />
                  <span>{r.rank}</span>
                </div>
                <span className="text-[length:0.74rem] font-bold text-[#0284c7] bg-[#eff6ff] pt-[3px] pb-[3px] pl-2 pr-2 rounded-[6px]">O/L Commerce</span>
              </div>

              <div className="mb-4">
                <h3 className="text-[length:1.12rem] font-extrabold text-[#0f172a] leading-[1.25]">{r.name}</h3>
                <div className="text-[length:0.8rem] text-[#64748b] mt-0.5">{r.school}</div>
                <div className="inline-flex items-center gap-1.5 text-[length:0.72rem] font-semibold text-[#059669] bg-[#ecfdf5] pt-1 pb-1 pl-2 pr-2 rounded-[6px] mt-2 leading-[1.2]">
                  <GraduationCap size={14} />
                  <span>Business &amp; Accounting Studies</span>
                </div>
              </div>

              <div className="relative bg-[#f8fafc] pt-3.5 pr-3.5 pb-3.5 pl-8.5 rounded-[12px] mb-5 grow">
                <Quote size={20} className="absolute top-2.5 left-2 text-[#cbd5e1]" />
                <p className="text-[length:0.82rem] leading-[1.5] text-[#475569] italic">&ldquo;{r.quote}&rdquo;</p>
              </div>

              <div className="flex items-center justify-between [border-top:1px_solid_#f1f5f9] pt-3.5 mt-auto">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={15}
                      fill="#F59E0B"
                      color="#F59E0B"
                    />
                  ))}
                </div>
                <span className="text-[length:0.7rem] font-bold text-[#10b981]">O/L Commerce Student</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
