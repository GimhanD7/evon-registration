"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  FileText,
  HelpCircle,
  Trophy,
  Award,
  Download,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  Zap,
  ExternalLink,
  Printer,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { LMSPaper, LMSEvaluation, LMSQuiz, LMSUser } from "@/data/lmsData";
import { getLmsUsers, getStudentExamResults } from "@/lib/lmsStore";
import { calculateLeaderboard, StudentLeaderboardEntry } from "@/lib/leaderboardService";
import { printStudentTranscriptPdf } from "@/lib/pdfPrintService";

interface StudentOverviewTabProps {
  currentUser?: LMSUser | null;
  papers: LMSPaper[];
  quizzes?: LMSQuiz[];
  evaluations: LMSEvaluation[];
  onSelectTab: (tabId: string) => void;
}

export default function StudentOverviewTab({
  currentUser,
  papers,
  quizzes = [],
  evaluations,
  onSelectTab,
}: StudentOverviewTabProps) {
  // 1. Fetch all students to compute live leaderboard analytics
  const allUsers = useMemo(() => getLmsUsers(), []);

  // 2. Compute live leaderboard entry for current student
  const leaderboard = useMemo(() => {
    return calculateLeaderboard(allUsers, papers, quizzes, evaluations);
  }, [allUsers, papers, quizzes, evaluations]);

  const studentEntry: StudentLeaderboardEntry | undefined = useMemo(() => {
    if (!currentUser) return undefined;
    const userIndex = (currentUser.indexNo || "").trim().toLowerCase();
    const userName = (currentUser.fullName || "").trim().toLowerCase();
    const userId = (currentUser.id || "").trim().toLowerCase();

    return leaderboard.find((entry) => {
      const eIndex = (entry.indexNo || "").trim().toLowerCase();
      const eName = (entry.fullName || "").trim().toLowerCase();
      const eId = (entry.id || "").trim().toLowerCase();
      return (
        (userIndex && eIndex === userIndex) ||
        (userName && eName === userName) ||
        (userId && eId === userId)
      );
    });
  }, [leaderboard, currentUser]);

  // 3. Exam records for this student
  const examRecords = useMemo(() => {
    if (!currentUser) return [];
    return getStudentExamResults(currentUser, papers);
  }, [currentUser, papers]);

  // 4. Computed Metrics
  const evaluatedPapersCount = examRecords.length;
  const totalPapersCount = papers.length;

  const avgExamScore = useMemo(() => {
    if (examRecords.length === 0) return studentEntry?.avgExamScore || 0;
    const sum = examRecords.reduce((acc, r) => acc + (r.totalScore || 0), 0);
    return Math.round((sum / examRecords.length) * 10) / 10;
  }, [examRecords, studentEntry]);

  const avgGrade = useMemo(() => {
    if (avgExamScore >= 75) return "A";
    if (avgExamScore >= 65) return "B";
    if (avgExamScore >= 50) return "C";
    if (avgExamScore >= 35) return "S";
    if (avgExamScore > 0) return "W";
    return "—";
  }, [avgExamScore]);

  // Completed quizzes count
  const completedQuizzesCount = useMemo(() => {
    return quizzes.filter((q) => q.completed).length;
  }, [quizzes]);

  const quizAccuracy = useMemo(() => {
    if (studentEntry && studentEntry.quizzesAttempted > 0) {
      return studentEntry.quizAccuracy;
    }
    const completed = quizzes.filter((q) => q.completed);
    if (completed.length === 0) return 0;
    const totalScore = completed.reduce((acc, q) => acc + (q.score || 0), 0);
    const totalMarks = completed.reduce((acc, q) => acc + (q.totalMarks || 10), 0);
    return totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
  }, [studentEntry, quizzes]);

  // Total points & rank
  const totalPoints = studentEntry?.totalPoints || 1420;
  const currentRank = studentEntry?.rank || 1;
  const tierName = studentEntry?.tier || "Elite Scholar";

  const studentName = currentUser?.fullName || "Student";
  const studentIndex = currentUser?.indexNo || "53914864";
  const studentBatch = currentUser?.batch || "2026 O/L Speed Revision";

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ======================================================== */}
      {/* 1. COMPACT MODERN HERO BANNER                            */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#cddce5] bg-[linear-gradient(135deg,#102c45_0%,#133758_60%,#007fb8_100%)] p-3.5 sm:p-5 text-white shadow-xs">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[#0ac9e8]/15 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Avatar + Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {currentUser?.avatarUrl ? (
              <div className="relative size-10 sm:size-12 rounded-xl overflow-hidden border border-[#0ac9e8]/50 shadow-xs shrink-0">
                <Image
                  src={currentUser.avatarUrl}
                  alt={studentName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-white/15 border border-white/20 text-[#0ac9e8] text-sm sm:text-base font-black shadow-xs shrink-0">
                {studentName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white truncate">
                  Hi, {studentName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#38d995]/20 text-[#38d995] text-[10px] font-black px-1.5 py-0.2 shrink-0">
                  <span className="size-1 rounded-full bg-[#38d995] animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/75 font-medium truncate mt-0.5">
                <span className="font-mono text-white/90">#{studentIndex}</span>
                <span>&bull;</span>
                <span className="truncate">{studentBatch}</span>
              </div>
            </div>
          </div>

          {/* Right: Compact Standing Pill & Quick Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-white/10 sm:border-t-0">
            {/* Standing Glass Pill */}
            <div
              onClick={() => onSelectTab("evaluation")}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1.5 text-xs transition-all cursor-pointer"
            >
              <Trophy size={13} className="text-[#f59e0b] shrink-0" />
              <span className="font-black text-white text-xs">
                Rank #{currentRank}
              </span>
              <span className="text-white/40">&bull;</span>
              <span className="text-[11px] font-bold text-[#0ac9e8]">
                {totalPoints} pts
              </span>
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSelectTab("quizzes")}
                className="inline-flex items-center gap-1 rounded-lg bg-[#38d995] hover:bg-[#2ec585] text-[#102c45] px-2.5 py-1.5 text-xs font-black transition-transform active:scale-95 shadow-2xs cursor-pointer"
              >
                <Zap size={12} className="stroke-[2.5]" />
                <span>Quiz</span>
              </button>
              {currentUser && (
                <button
                  type="button"
                  onClick={() => printStudentTranscriptPdf(currentUser, papers)}
                  title="Print Official Marksheet Transcript"
                  className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/20 text-white border border-white/20 px-2 py-1.5 text-xs font-bold transition-all cursor-pointer"
                >
                  <Printer size={12} />
                  <span className="hidden xs:inline text-[11px]">Print</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FOUR COMPACT MODERN KPI METRIC CARDS                  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* KPI 1: Model Papers */}
        <div
          onClick={() => onSelectTab("papers")}
          className="group rounded-xl border border-[#cddce5] bg-white p-3 shadow-2xs flex flex-col justify-between hover:border-[#007fb8]/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#007fb8]">
              <FileText size={14} strokeWidth={2.4} />
            </span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#edf2f3] text-[#60768a]">
              Papers
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[10px] font-bold text-[#60768a] uppercase">
              Model Papers
            </div>
            <div className="mt-0.5 text-lg sm:text-xl font-black text-[#102c45]">
              {evaluatedPapersCount} <span className="text-xs text-[#60768a] font-normal">/ {totalPapersCount || 5}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-[#159366]">
              <span>Evaluated</span>
              <ChevronRight size={11} className="text-[#007fb8] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* KPI 2: Quiz Accuracy */}
        <div
          onClick={() => onSelectTab("quizzes")}
          className="group rounded-xl border border-[#cddce5] bg-white p-3 shadow-2xs flex flex-col justify-between hover:border-[#0ac9e8]/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e0f7fa] text-[#008dc4]">
              <HelpCircle size={14} strokeWidth={2.4} />
            </span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#e0f7fa] text-[#008dc4]">
              {completedQuizzesCount}/{quizzes.length || 2} Done
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[10px] font-bold text-[#60768a] uppercase">
              Accuracy
            </div>
            <div className="mt-0.5 text-lg sm:text-xl font-black text-[#102c45]">
              {quizAccuracy > 0 ? `${quizAccuracy}%` : "100%"}
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-[#007fb8]">
              <span>Precision</span>
              <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* KPI 3: Batch Ranking */}
        <div
          onClick={() => onSelectTab("results")}
          className="group rounded-xl border border-[#cddce5] bg-white p-3 shadow-2xs flex flex-col justify-between hover:border-[#38d995]/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e8f7f2] text-[#159366]">
              <Trophy size={14} strokeWidth={2.4} />
            </span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#e8f7f2] text-[#159366]">
              Grade {avgGrade}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[10px] font-bold text-[#60768a] uppercase">
              Batch Rank
            </div>
            <div className="mt-0.5 text-lg sm:text-xl font-black text-[#102c45]">
              #{currentRank}
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-[#159366]">
              <span>{avgExamScore > 0 ? `${avgExamScore}% Avg` : "Revision"}</span>
              <ChevronRight size={11} className="text-[#007fb8] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* KPI 4: LMS Points */}
        <div
          onClick={() => onSelectTab("evaluation")}
          className="group rounded-xl border border-[#cddce5] bg-white p-3 shadow-2xs flex flex-col justify-between hover:border-[#f59e0b]/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#fef3c7] text-[#d97706]">
              <Award size={14} strokeWidth={2.4} />
            </span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#fef3c7] text-[#d97706]">
              Top League
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[10px] font-bold text-[#60768a] uppercase">
              LMS Points
            </div>
            <div className="mt-0.5 text-lg sm:text-xl font-black text-[#102c45]">
              {totalPoints} <span className="text-[10px] font-normal text-[#60768a]">pts</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-[#d97706]">
              <span className="truncate">{tierName}</span>
              <ChevronRight size={11} className="text-[#007fb8] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TWO-COLUMN WORKSPACE: Recent Exam & Quizzes           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Left Column: Recent Exam Results */}
        <div className="rounded-xl sm:rounded-2xl border border-[#cddce5] bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[#007fb8]" />
              <h3 className="text-xs sm:text-sm font-black text-[#102c45]">
                Recent Exam Scores
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab("results")}
              className="text-[10px] sm:text-xs font-bold text-[#007fb8] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Marksheet</span>
              <ChevronRight size={12} />
            </button>
          </div>

          {examRecords.length > 0 ? (
            <div className="space-y-2">
              {examRecords.slice(0, 3).map((rec) => (
                <div
                  key={rec.paperId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#cddce5]/60 bg-[#edf2f3]/50 px-3 py-2 hover:bg-[#edf2f3] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-[#60768a]">
                      {rec.paperNumber} &bull; {rec.month} {rec.year}
                    </div>
                    <div className="text-xs font-bold text-[#102c45] truncate">
                      {rec.title}
                    </div>
                    <div className="text-[10px] text-[#60768a]">
                      P1: <b className="text-[#102c45]">{rec.part1Score}</b> &bull; P2: <b className="text-[#102c45]">{rec.part2Score}</b>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#102c45]">
                      {rec.totalScore}%
                    </div>
                    <span className="inline-block rounded-md bg-[#e8f7f2] px-1.5 py-0.2 text-[9px] font-black text-[#159366]">
                      Grade {rec.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#cddce5] bg-[#edf2f3]/30 p-4 text-center space-y-1">
              <p className="text-xs font-bold text-[#102c45]">No Marks Recorded Yet</p>
              <p className="text-[10px] text-[#60768a]">
                Submit your Model Paper worksheet during your weekly class.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-[#cddce5]/50 flex items-center justify-between text-[10px] sm:text-xs">
            <span className="font-medium text-[#60768a]">Average:</span>
            <span className="font-black text-[#102c45]">{avgExamScore}% &bull; Grade {avgGrade}</span>
          </div>
        </div>

        {/* Right Column: Recommended Quizzes */}
        <div className="rounded-xl sm:rounded-2xl border border-[#cddce5] bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-[#0ac9e8]" />
              <h3 className="text-xs sm:text-sm font-black text-[#102c45]">
                Practice Quizzes
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab("quizzes")}
              className="text-[10px] sm:text-xs font-bold text-[#007fb8] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>All ({quizzes.length})</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-2">
            {quizzes.slice(0, 2).map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-lg border border-[#cddce5]/60 bg-[#edf2f3]/50 p-2.5 sm:p-3 hover:bg-[#edf2f3] transition-colors space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#008dc4]">
                      <span>{quiz.subject}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5 text-[#60768a]">
                        <Clock size={10} /> {quiz.durationMinutes || 15}m
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#102c45] truncate">
                      {quiz.title}
                    </div>
                  </div>

                  {quiz.completed ? (
                    <span className="rounded-md bg-[#e8f7f2] px-1.5 py-0.5 text-[9px] font-black text-[#159366] shrink-0">
                      {quiz.score}/{quiz.totalMarks}
                    </span>
                  ) : (
                    <span className="rounded-md bg-[#e0f2fe] px-1.5 py-0.5 text-[9px] font-black text-[#007fb8] shrink-0">
                      Available
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-[#60768a]">
                    {quiz.questions?.length || 10} Questions
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTab("quizzes")}
                    className="inline-flex items-center gap-1 rounded-md bg-[#007fb8] hover:bg-[#006ca0] text-white px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{quiz.completed ? "Re-try" : "Launch"}</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#cddce5]/50 flex items-center justify-between text-[10px] sm:text-xs">
            <span className="font-medium text-[#60768a]">Accuracy:</span>
            <span className="font-black text-[#007fb8]">{quizAccuracy}%</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. COMPACT LIVE CLASS SCHEDULE CARD                      */}
      {/* ======================================================== */}
      <div className="rounded-xl sm:rounded-2xl border border-[#cddce5] bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_100%)] p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1 rounded-full bg-[#e0f2fe] border border-[#007fb8]/30 px-2 py-0.5 text-[9px] font-black text-[#007fb8] uppercase">
              <Calendar size={10} />
              <span>Speed Revision Live Schedule</span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-[#102c45]">
              Every Sunday 12:30 PM &ndash; 03:30 PM
            </h3>
            <p className="text-[11px] text-[#60768a] leading-relaxed line-clamp-2">
              Conducted by <b>Teacher Evon Aravinda</b>. Commerce Paper II Structured Essay discussion, Accounting adjustments, and marking schemes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => onSelectTab("papers")}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#102c45] hover:bg-[#1b4366] text-white px-3 py-1.5 text-xs font-black transition-all cursor-pointer shadow-2xs flex-1 sm:flex-initial"
            >
              <Download size={12} /> Paper
            </button>
            <a
              href="https://wa.me/94771234567?text=Hello%20Teacher%20Evon,%20I%20am%20in%20the%20Speed%20Revision%20Batch."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#cddce5] bg-white hover:bg-slate-50 text-[#102c45] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs flex-1 sm:flex-initial"
            >
              <ExternalLink size={11} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. COMPACT PUBLISHED MODEL PAPERS PREVIEW                */}
      {/* ======================================================== */}
      <div className="rounded-xl sm:rounded-2xl border border-[#cddce5] bg-white p-3.5 sm:p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#007fb8]" />
            <h3 className="text-xs sm:text-sm font-black text-[#102c45]">
              Published Model Papers
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab("papers")}
            className="text-[10px] sm:text-xs font-bold text-[#007fb8] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>All ({papers.length})</span>
            <ChevronRight size={12} />
          </button>
        </div>

        <div className="space-y-1.5">
          {papers.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#cddce5]/60 bg-[#edf2f3]/40 px-3 py-2 hover:bg-[#edf2f3] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-[#60768a]">
                  Paper #{p.paperNumber} &bull; {p.month} {p.year}
                </div>
                <div className="text-xs font-bold text-[#102c45] truncate">
                  {p.title}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {p.pdfUrl && (
                  <a
                    href={p.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-[#007fb8]/30 bg-white px-2 py-1 text-[10px] font-bold text-[#007fb8] hover:bg-[#e0f2fe] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download size={10} /> PDF
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => onSelectTab("papers")}
                  className="inline-flex items-center gap-0.5 rounded-md bg-white border border-[#cddce5] px-2 py-1 text-[10px] font-bold text-[#102c45] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>Open</span>
                  <ChevronRight size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. COMPACT QUICK NAVIGATION TILES                        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <div
          onClick={() => onSelectTab("quizzes")}
          className="group rounded-xl border border-[#0ac9e8]/30 bg-white hover:bg-[#e0f7fa]/40 p-2.5 sm:p-3 transition-all cursor-pointer shadow-2xs flex items-center gap-2"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#e0f7fa] text-[#008dc4] shrink-0">
            <Zap size={14} strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-[#102c45] truncate">Quizzes</h4>
            <p className="text-[9px] text-[#60768a] truncate">MCQ Practice</p>
          </div>
        </div>

        <div
          onClick={() => onSelectTab("papers")}
          className="group rounded-xl border border-[#007fb8]/30 bg-white hover:bg-[#e0f2fe]/40 p-2.5 sm:p-3 transition-all cursor-pointer shadow-2xs flex items-center gap-2"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#007fb8] shrink-0">
            <FileText size={14} strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-[#102c45] truncate">Papers</h4>
            <p className="text-[9px] text-[#60768a] truncate">Worksheets &amp; PDF</p>
          </div>
        </div>

        <div
          onClick={() => onSelectTab("results")}
          className="group rounded-xl border border-[#159366]/30 bg-white hover:bg-[#e8f7f2]/40 p-2.5 sm:p-3 transition-all cursor-pointer shadow-2xs flex items-center gap-2"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#e8f7f2] text-[#159366] shrink-0">
            <Award size={14} strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-[#102c45] truncate">Results</h4>
            <p className="text-[9px] text-[#60768a] truncate">Transcripts</p>
          </div>
        </div>

        <div
          onClick={() => onSelectTab("evaluation")}
          className="group rounded-xl border border-[#f59e0b]/30 bg-white hover:bg-[#fef3c7]/40 p-2.5 sm:p-3 transition-all cursor-pointer shadow-2xs flex items-center gap-2"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#fef3c7] text-[#d97706] shrink-0">
            <Trophy size={14} strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-[#102c45] truncate">Rankings</h4>
            <p className="text-[9px] text-[#60768a] truncate">Leaderboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
