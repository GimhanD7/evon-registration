"use client";

import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sparkles,
  Search,
  Lock,
  Shuffle,
} from "lucide-react";
import { LMSQuiz } from "@/data/lmsData";
import QuizPlayer from "@/components/lms/student/QuizPlayer";
import LmsPagination from "@/components/lms/shared/LmsPagination";

interface StudentQuizzesTabProps {
  quizzes: LMSQuiz[];
  onSaveQuizScore: (quizId: string, score: number, total: number) => void;
}

export default function StudentQuizzesTab({
  quizzes,
  onSaveQuizScore,
}: StudentQuizzesTabProps) {
  const [activeQuiz, setActiveQuiz] = useState<LMSQuiz | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "completed">("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Filtered quizzes list
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.batch.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && q.completed) ||
        (statusFilter === "available" && !q.completed);

      const matchesSubject =
        subjectFilter === "all" ||
        q.subject.toLowerCase() === subjectFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [quizzes, searchQuery, statusFilter, subjectFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedQuizzes = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredQuizzes.slice(start, start + pageSize);
  }, [filteredQuizzes, safePage, pageSize]);

  const completedCount = quizzes.filter((q) => q.completed).length;
  const subjects = Array.from(new Set(quizzes.map((q) => q.subject)));

  if (activeQuiz) {
    return (
      <QuizPlayer
        quiz={activeQuiz}
        onExit={() => setActiveQuiz(null)}
        onSaveScore={onSaveQuizScore}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] p-6 sm:p-8 text-white shadow-lg shadow-[#007fb8]/20">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#0ac9e8]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 size-60 rounded-full bg-[#38d995]/20 blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
              <Sparkles size={14} className="text-[#38d995]" />
              <span>Interactive Speed Revision</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Interactive MCQ Quizzes
            </h2>
            <p className="text-xs sm:text-sm font-medium text-white/80 leading-relaxed">
              Sharpen your accounting double-entry skills and business principles with timed multiple-choice question modules. Earn Leaderboard XP points for each quiz you complete!
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-md text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block">
                Completed
              </span>
              <span className="text-xl font-black text-[#38d995]">
                {completedCount} / {quizzes.length}
              </span>
            </div>

            <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-md text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block">
                Points Multiplier
              </span>
              <span className="text-xl font-black text-[#0ac9e8] flex items-center justify-center gap-1">
                <Flame size={16} /> 5x XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title or topic..."
            className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 pl-10 pr-4 text-xs font-bold text-[#102c45] placeholder-[#94a3b8] focus:border-[#007fb8] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-xl px-3 py-1.5 cursor-pointer transition-colors ${
                statusFilter === "all" ? "bg-white text-[#007fb8] shadow-xs" : "text-[#60768a]"
              }`}
            >
              All ({quizzes.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("available")}
              className={`rounded-xl px-3 py-1.5 cursor-pointer transition-colors ${
                statusFilter === "available" ? "bg-white text-[#007fb8] shadow-xs" : "text-[#60768a]"
              }`}
            >
              Available
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`rounded-xl px-3 py-1.5 cursor-pointer transition-colors ${
                statusFilter === "completed" ? "bg-white text-[#159366] shadow-xs font-black" : "text-[#60768a]"
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-[#cddce5] bg-white p-12 text-center text-[#60768a]">
            <HelpCircle size={36} className="mx-auto mb-2 text-[#94a3b8]" />
            <p className="font-bold text-sm text-[#102c45]">No quizzes matching your criteria.</p>
            <p className="text-xs mt-1">Try adjusting your search filter or check back later.</p>
          </div>
        ) : (
          paginatedQuizzes.map((q) => {
            const isCompleted = !!q.completed;

            return (
              <div
                key={q.id}
                className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5 space-y-4"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-[10px] font-black text-[#007fb8]">
                        {q.subject}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] px-2 py-0.5 text-[9.5px] font-bold text-[#475569]">
                        <Shuffle size={10} className="text-[#007fb8]" /> Shuffled
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] border border-[#f59e0b]/40 px-2.5 py-0.5 text-[10px] font-black text-[#92400e]">
                      <Flame size={12} className="text-[#f59e0b]" /> +100 Points XP
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-[#102c45] mt-2">
                    {q.title}
                  </h4>
                  <p className="text-xs text-[#60768a] mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <BookOpen size={13} className="text-[#007fb8]" />
                      {q.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-[#159366]" />
                      {q.durationMinutes} Minutes Limit
                    </span>
                    <span className="flex items-center gap-1 text-[#d97706] font-bold">
                      <Lock size={12} /> 1 Attempt Only
                    </span>
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="mt-4 pt-4 border-t border-[#cddce5]/60 flex items-center justify-between gap-2">
                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7f2] border border-[#38d995]/50 px-3 py-1 text-xs font-black text-[#159366]">
                        <CheckCircle2 size={14} /> Score: {q.score}% &bull; Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#edf2f3] px-3 py-1 text-xs font-bold text-[#60768a]">
                        <Lock size={12} className="text-[#94a3b8]" /> 1 Attempt Left
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveQuiz(q)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-4 sm:px-5 py-2.5 text-xs font-black uppercase text-white shadow-md shadow-[#007fb8]/25 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                  >
                    {isCompleted ? (
                      <>
                        <BookOpen size={14} /> Review Answers
                      </>
                    ) : (
                      <>
                        Start Shuffled Quiz <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Quizzes Pagination */}
      {filteredQuizzes.length > 0 && (
        <div className="rounded-3xl border border-[#cddce5] bg-white p-4 shadow-xs">
          <LmsPagination
            currentPage={safePage}
            totalItems={filteredQuizzes.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 48]}
            itemName="quizzes"
          />
        </div>
      )}
    </div>
  );
}
