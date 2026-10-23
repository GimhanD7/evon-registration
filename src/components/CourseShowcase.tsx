"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Video,
  FileCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface CourseShowcaseProps {
  onOpenJoin: (courseName?: string) => void;
}

export default function CourseShowcase({ onOpenJoin }: CourseShowcaseProps) {
  const [filter, setFilter] = useState("all");

  const courses = [
    {
      id: "acc-2026",
      title: "2026 O/L Business & Accounting Studies",
      category: "2026",
      badge: "High Demand",
      medium: "English Medium",
      schedule: "Every Saturday • 8:00 AM - 1:00 PM",
      mode: "Islandwide Online (Live) & Physical Halls",
      features: [
        "Step-by-Step O/L Theory & Accounting Practice",
        "Printed Monthly Tutes Delivered to Your Doorstep",
        "HD Class Recordings with Unlimited Re-watch",
        "Monthly Timed Accounting Model Examination",
      ],
      fee: "Rs. 3,500 / month",
      isPopular: true,
    },
    {
      id: "bs-2026",
      title: "2026 O/L Commerce Theory Class",
      category: "2026",
      badge: "Comprehensive",
      medium: "English Medium",
      schedule: "Every Sunday • 8:00 AM - 12:30 PM",
      mode: "Islandwide Online (Live) & Physical Halls",
      features: [
        "Structured Case Study Solving Methodology",
        "Key Terminology & Mark Scheme Mind Maps",
        "Monthly Speed Writing & Essay Evaluations",
        "Exclusive Short Notes & Memory Sheets",
      ],
      fee: "Rs. 3,500 / month",
      isPopular: false,
    },
    {
      id: "rev-2025",
      title: "2025 O/L Speed Revision & Paper Class",
      category: "2025",
      badge: "Intensive",
      medium: "English Medium",
      schedule: "Every Wednesday • 3:30 PM - 7:30 PM",
      mode: "Islandwide Online + Live Zoom Discussion",
      features: [
        "25 Years Past Papers In-Depth Analysis",
        "10 Islandwide High-Yield Model Papers",
        "Individual Mark Allocation & Mistake Audits",
        "O/L Exam Time-Management Practice",
      ],
      fee: "Rs. 4,000 / month",
      isPopular: true,
    },
    {
      id: "econ-2026",
      title: "2026 O/L Accounting Practice Class",
      category: "2026",
      badge: "Concept Driven",
      medium: "English Medium",
      schedule: "Every Friday • 3:30 PM - 7:00 PM",
      mode: "Islandwide Online (Live)",
      features: [
        "Basic Accounting Concepts Made Simple",
        "Transactions, Ledgers & Financial Statements",
        "MCQ Elimination & Smart Guessing Strategies",
        "Structured Essay Writing Framework",
      ],
      fee: "Rs. 3,500 / month",
      isPopular: false,
    },
    {
      id: "found-2027",
      title: "2027 O/L Commerce Foundation Batch",
      category: "2027",
      badge: "New Batch",
      medium: "English Medium",
      schedule: "Every Sunday • 2:00 PM - 5:30 PM",
      mode: "Islandwide Online + Physical",
      features: [
        "Grade 10 & 11 Commerce Fundamentals",
        "Debit/Credit Foundations Made Crystal Clear",
        "Free Starter Kit & Printed Textbook Included",
        "Direct Mentorship with Evon Aravinda",
      ],
      fee: "Rs. 3,000 / month",
      isPopular: false,
    },
    {
      id: "combo-triple",
      title: "Complete O/L Commerce Study Package",
      category: "combo",
      badge: "Best Value",
      medium: "English Medium",
      schedule: "Full Weekly Schedule Access",
      mode: "All Access Islandwide",
      features: [
        "Access to O/L Commerce Theory & Revision Classes",
        "Comprehensive All-in-One Islandwide Delivery",
        "Priority VIP Doubt Clearance on WhatsApp",
        "Personalized Study Planner & Progress Tracking",
      ],
      fee: "Rs. 9,000 / month (Save 15%)",
      isPopular: true,
    },
  ];

  const filteredCourses =
    filter === "all"
      ? courses
      : courses.filter((c) => c.category === filter || (filter === "popular" && c.isPopular));

  return (
    <section className="pt-20 pb-20 pl-0 pr-0 relative bg-[#ffffff]" id="courses">
      <div className="w-full max-w-[var(--container-max)] ml-auto mr-auto pl-6 pr-6 max-[640px]:pl-4 max-[640px]:pr-4">
        <div className="text-center max-w-[720px] mt-0 mr-auto mb-12.5 ml-auto">
          <div className="inline-block [background:rgba(14,_165,_233,_0.1)] [border:1px_solid_rgba(14,_165,_233,_0.25)] text-[#0284c7] text-[length:0.75rem] font-extrabold tracking-[1.2px] pt-[5px] pb-[5px] pl-3.5 pr-3.5 rounded-full mb-4 uppercase">ACADEMIC PROGRAMS</div>
          <h2 className="text-[length:2.35rem] font-[850] leading-[1.2] text-[#0f172a] tracking-[-0.8px] mb-4 max-[720px]:text-[length:1.85rem]">
            Master O/L Commerce <br />
            <span className="bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_100%)] bg-clip-text [-webkit-text-fill-color:transparent]">Explore Our Signature Courses</span>
          </h2>
          <p className="text-[length:1rem] text-[#64748b] leading-[1.6] mb-7.5">
            Whether you need foundation theory, intensive speed revision, or past paper analysis, we have the ideal batch tailored for your G.C.E. O/L success.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {[
              { id: "all", label: "All Courses" },
              { id: "2026", label: "2026 O/L Theory" },
              { id: "2025", label: "2025 O/L Revision" },
              { id: "2027", label: "2027 O/L Foundation" },
              { id: "combo", label: "Complete Package" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={twMerge(`bg-[#f1f5f9] text-[#475569] text-[length:0.88rem] font-semibold pt-2 pb-2 pl-4.5 pr-4.5 rounded-full [border:1px_solid_transparent] [transition:all_0.2s_ease] cursor-pointer hover:bg-[#e2e8f0] hover:text-[#0f172a] ${
                  filter === tab.id ? "bg-[#1d4ed8] text-[#ffffff] [border-color:#1d4ed8] [box-shadow:0_4px_12px_rgba(29,_78,_216,_0.3)]" : ""
                }`)}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div id="timetable" className="scroll-mt-28 grid grid-cols-[repeat(3,_1fr)] gap-7 max-[1080px]:grid-cols-[repeat(2,_1fr)] max-[720px]:grid-cols-[1fr]">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className={twMerge(`bg-[#ffffff] [border:1px_solid_rgba(226,_232,_240,_0.9)] rounded-[22px] p-7 [box-shadow:0_10px_30px_-10px_rgba(15,_23,_42,_0.05)] flex flex-col relative [transition:all_0.3s_cubic-bezier(0.16,_1,_0.3,_1)] hover:[transform:translateY(-6px)] hover:[box-shadow:0_20px_45px_-12px_rgba(37,_99,_235,_0.14)] hover:[border-color:rgba(147,_197,_253,_0.9)] ${
                c.isPopular ? "[border-color:#3b82f6] [box-shadow:0_14px_35px_-8px_rgba(37,_99,_235,_0.12)]" : ""
              }`)}
            >
              {c.isPopular && (
                <div className="absolute top-[-13px] left-7 bg-[linear-gradient(135deg,_#f59e0b_0%,_#d97706_100%)] text-[#ffffff] text-[length:0.72rem] font-extrabold pt-1 pb-1 pl-3 pr-3 rounded-full flex items-center gap-[5px] [box-shadow:0_4px_12px_rgba(217,_119,_6,_0.35)]">
                  <Sparkles size={13} /> Most Recommended
                </div>
              )}

              <div className="flex items-center justify-between mb-4 mt-1.5">
                <span className="text-[length:0.75rem] font-bold bg-[#eff6ff] text-[#1d4ed8] pt-1 pb-1 pl-2.5 pr-2.5 rounded-[6px]">{c.badge}</span>
                <span className="text-[length:0.72rem] font-semibold text-[#64748b] bg-[#f8fafc] pt-1 pb-1 pl-2 pr-2 rounded-[6px]">{c.medium}</span>
              </div>

              <h3 className="text-[length:1.25rem] font-extrabold text-[#0f172a] leading-[1.35] mb-4">{c.title}</h3>

              <div className="flex flex-col gap-2 p-3 bg-[#f8fafc] rounded-[12px] mb-5">
                <div className="flex items-center gap-2 text-[length:0.8rem] text-[#475569] font-medium">
                  <Calendar size={15} className="text-[#0284c7] shrink-0" />
                  <span>{c.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-[length:0.8rem] text-[#475569] font-medium">
                  <Video size={15} className="text-[#0284c7] shrink-0" />
                  <span>{c.mode}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mb-6.5 grow">
                {c.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-[length:0.84rem] text-[#334155] leading-[1.4]">
                    <CheckCircle2 size={16} className="text-[#10b981] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between [border-top:1px_solid_#f1f5f9] pt-4.5 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[length:0.7rem] text-[#64748b] font-medium uppercase">Course Investment</span>
                  <span className="text-[length:1.05rem] font-[850] text-[#0f172a]">{c.fee}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenJoin(c.title)}
                  className="inline-flex items-center gap-1.5 bg-[#eff6ff] text-[#1d4ed8] text-[length:0.88rem] font-bold pt-2.5 pb-2.5 pl-4.5 pr-4.5 rounded-full [border:1px_solid_rgba(191,_219,_254,_0.8)] [transition:all_0.2s_ease] cursor-pointer hover:bg-[#1d4ed8] hover:text-[#ffffff] hover:[border-color:#1d4ed8] hover:[box-shadow:0_4px_14px_rgba(29,_78,_216,_0.35)]"
                >
                  Enroll Now <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
