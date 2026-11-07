import React from "react";
import {
  FileText,
  HelpCircle,
  Trophy,
  MessageSquare,
  Download,
} from "lucide-react";
import { LMSPaper, LMSEvaluation } from "@/data/lmsData";

interface StudentOverviewTabProps {
  papers: LMSPaper[];
  evaluations: LMSEvaluation[];
  onSelectTab: (tabId: string) => void;
}

export default function StudentOverviewTab({
  papers,
  evaluations,
  onSelectTab,
}: StudentOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. ROW OF 4 HOME-THEMED KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Model Papers */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[#007fb8]/20 bg-[#e0f2fe] text-[#007fb8] shadow-xs">
            <FileText size={20} strokeWidth={2.4} />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Model Papers
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-[#102c45]">
              {papers.length || 5}
            </div>
            <span className="mt-1 inline-block text-[11px] font-bold text-[#159366]">
              Marks Evaluated
            </span>
          </div>
        </div>

        {/* Card 2: Quiz Accuracy */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[#0ac9e8]/30 bg-[#e0f7fa] text-[#008dc4] shadow-xs">
            <HelpCircle size={20} strokeWidth={2.4} />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Quiz Accuracy
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-[#102c45]">
              89%
            </div>
            <span className="mt-1 inline-block text-[11px] font-bold text-[#007fb8]">
              Above Batch Average
            </span>
          </div>
        </div>

        {/* Card 3: Class Ranking */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[#38d995]/40 bg-[#e8f7f2] text-[#159366] shadow-xs">
            <Trophy size={20} strokeWidth={2.4} />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Class Ranking
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-[#102c45]">
              Rank #04
            </div>
            <span className="mt-1 inline-block text-[11px] font-bold text-[#159366]">
              Speed Revision Batch
            </span>
          </div>
        </div>

        {/* Card 4: Teacher Feedback */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[#f59e0b]/30 bg-[#fef3c7] text-[#d97706] shadow-xs">
            <MessageSquare size={20} strokeWidth={2.4} />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Evaluations
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-[#102c45]">
              {evaluations.length || 1}
            </div>
            <span className="mt-1 inline-block text-[11px] font-bold text-[#d97706]">
              Grade: Very Good
            </span>
          </div>
        </div>
      </div>

      {/* 2. TWO SECTION CARDS: Quick Actions & Academic Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Quick Actions */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-5 w-1.5 rounded-full bg-[#007fb8]" />
            <h3 className="text-base sm:text-lg font-black text-[#102c45]">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => onSelectTab("quizzes")}
              className="rounded-2xl border border-[#007fb8]/40 bg-white px-4 py-3 text-center text-xs sm:text-sm font-black text-[#007fb8] hover:bg-[#e0f2fe]/60 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              Start Quiz
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("papers")}
              className="rounded-2xl border border-[#102c45]/30 bg-white px-4 py-3 text-center text-xs sm:text-sm font-black text-[#102c45] hover:bg-[#edf2f3] transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              View Papers
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("results")}
              className="rounded-2xl border border-[#38d995]/40 bg-white px-4 py-3 text-center text-xs sm:text-sm font-black text-[#159366] hover:bg-[#e8f7f2] transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              Check Results
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("profile")}
              className="rounded-2xl border border-[#0ac9e8]/40 bg-white px-4 py-3 text-center text-xs sm:text-sm font-black text-[#008dc4] hover:bg-[#e0f7fa] transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              My Profile
            </button>
          </div>
        </div>

        {/* Right: Academic Status */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-5 w-1.5 rounded-full bg-[#38d995]" />
            <h3 className="text-base sm:text-lg font-black text-[#102c45]">Academic Status</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-[#edf2f3]/70 px-4 py-3 border border-[#cddce5]/60">
              <span className="text-xs sm:text-sm font-bold text-[#102c45]">Student Status</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f7f2] px-2.5 py-0.5 text-xs font-black text-[#159366]">
                <span className="size-2 rounded-full bg-[#159366] animate-pulse" /> ACTIVE &bull; ENROLLED
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#edf2f3]/70 px-4 py-3 border border-[#cddce5]/60">
              <span className="text-xs sm:text-sm font-bold text-[#102c45]">Next Paper Session</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-xs font-black text-[#007fb8]">
                SUNDAY 12:30 PM
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#edf2f3]/70 px-4 py-3 border border-[#cddce5]/60">
              <span className="text-xs sm:text-sm font-bold text-[#102c45]">Target Examination</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f7fa] px-2.5 py-0.5 text-xs font-black text-[#008dc4]">
                2026 O/L COMMERCE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT PAPERS PREVIEW */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1.5 rounded-full bg-[#007fb8]" />
            <h3 className="text-base font-black text-[#102c45]">Recent Model Papers</h3>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab("papers")}
            className="text-xs font-bold text-[#007fb8] hover:underline cursor-pointer"
          >
            View All ({papers.length})
          </button>
        </div>

        <div className="space-y-3">
          {papers.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#cddce5]/60 bg-[#edf2f3]/50 p-4 hover:bg-[#edf2f3] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#60768a]">
                  <span>Paper #{p.paperNumber}</span>
                  <span>&bull;</span>
                  <span>
                    {p.month} {p.year}
                  </span>
                </div>
                <h4 className="text-sm font-black text-[#102c45] mt-0.5">{p.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab("papers")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-white px-3.5 py-1.5 text-xs font-bold text-[#007fb8] hover:bg-[#e0f2fe] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
              >
                <Download size={13} /> Worksheet &amp; PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

