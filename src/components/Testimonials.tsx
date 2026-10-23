"use client";

import React from "react";
import { Star, Quote, CheckCircle2 } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Senuri Fernando",
      batch: "2024 O/L Batch • Commerce Student",
      location: "Colombo",
      content:
        "Evon sir made Accounting my favorite subject. His method of breaking down business transactions and ledger entries made even 20-mark essay questions effortless. I scored an A grade with ease!",
      stars: 5,
    },
    {
      name: "Chamindu Bandara",
      batch: "2024 O/L Batch • Commerce Student",
      location: "Kandy",
      content:
        "The model papers were harder than the actual O/L exam! When I sat for the final exam paper, it felt so familiar. Truly the best commerce teacher in Sri Lanka.",
      stars: 5,
    },
    {
      name: "Mrs. Priyanthi Silva",
      batch: "Parent of 2025 O/L Student",
      location: "Gampaha",
      content:
        "As a parent, I am deeply impressed by how Evon sir monitors student attendance and homework. The printed books arriving right at our doorstep is such a relief.",
      stars: 5,
    },
  ];

  return (
    <section className="pt-20 pb-20 pl-0 pr-0 relative bg-[#f8fafc]" id="testimonials">
      <div className="w-full max-w-[var(--container-max)] ml-auto mr-auto pl-6 pr-6 max-[640px]:pl-4 max-[640px]:pr-4">
        <div className="text-center max-w-[680px] mt-0 mr-auto mb-12.5 ml-auto">
          <div className="inline-block [background:rgba(14,_165,_233,_0.1)] [border:1px_solid_rgba(14,_165,_233,_0.25)] text-[#0284c7] text-[length:0.75rem] font-extrabold tracking-[1.2px] pt-[5px] pb-[5px] pl-3.5 pr-3.5 rounded-full mb-4 uppercase">STUDENT EXPERIENCES</div>
          <h2 className="text-[length:2.35rem] font-[850] leading-[1.2] text-[#0f172a] tracking-[-0.8px] mb-4">
            Loved by Students, <br />
            <span className="bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_100%)] bg-clip-text [-webkit-text-fill-color:transparent]">Trusted by Parents</span>
          </h2>
          <p className="text-[length:1rem] text-[#64748b] leading-[1.6]">
            Hear directly from our commerce community on how &apos;Access to Success&apos; redefined their academic journey.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(3,_1fr)] gap-7 max-[960px]:grid-cols-[1fr]">
          {reviews.map((r, idx) => (
            <div key={idx} className="bg-[#ffffff] [border:1px_solid_rgba(226,_232,_240,_0.9)] rounded-[22px] pt-7.5 pb-7.5 pl-6.5 pr-6.5 [box-shadow:0_10px_30px_-10px_rgba(15,_23,_42,_0.05)] flex flex-col [transition:all_0.3s_cubic-bezier(0.16,_1,_0.3,_1)] hover:[transform:translateY(-6px)] hover:[box-shadow:0_20px_40px_-10px_rgba(37,_99,_235,_0.12)] hover:[border-color:rgba(147,_197,_253,_0.8)]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-[3px]">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="#F59E0B"
                      color="#F59E0B"
                    />
                  ))}
                </div>
                <Quote size={24} className="text-[#e2e8f0]" />
              </div>

              <p className="text-[length:0.94rem] leading-[1.65] text-[#334155] italic mb-6 grow">&ldquo;{r.content}&rdquo;</p>

              <div className="flex items-center gap-3.5 [border-top:1px_solid_#f1f5f9] pt-4.5">
                <div className="w-[44px] h-[44px] rounded-full bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_100%)] text-[#ffffff] flex items-center justify-center font-extrabold text-[length:1.1rem] shrink-0">
                  {r.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <div className="text-[length:0.98rem] font-extrabold text-[#0f172a] flex items-center gap-1.5">
                    {r.name}
                    <CheckCircle2 size={14} className="text-[#10b981]" />
                  </div>
                  <div className="text-[length:0.76rem] text-[#0284c7] font-semibold">{r.batch}</div>
                  <div className="text-[length:0.72rem] text-[#64748b]">{r.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
