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
  CheckCircle2,
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
    if (avgExamScore >= 75) return "A (Distinction)";
    if (avgExamScore >= 65) return "B (Very Good)";
    if (avgExamScore >= 50) return "C (Credit Pass)";
    if (avgExamScore >= 35) return "S (Pass)";
    if (avgExamScore > 0) return "W (Referral)";
    return "Pending";
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
  const studentSchool = currentUser?.school || "Evon Commerce Academy";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ======================================================== */}
      {/* 1. PERSONALIZED HERO BANNER                              */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-[linear-gradient(135deg,#102c45_0%,#133758_60%,#007fb8_100%)] p-4 sm:p-6 lg:p-8 text-white shadow-md">
        {/* Ambient background decorative glow circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-60 sm:size-72 rounded-full bg-[#0ac9e8]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 size-48 sm:size-60 rounded-full bg-[#38d995]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          {/* Left: Student Identity & Greeting */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black tracking-wide text-[#0ac9e8] backdrop-blur-md">
              <Sparkles size={13} className="text-[#38d995] animate-pulse shrink-0" />
              <span>G.C.E. O/L COMMERCE SPEED REVISION</span>
              <span className="text-white/40">&bull;</span>
              <span className="text-white/90">ACTIVE ENROLLED</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {currentUser?.avatarUrl ? (
                <div className="relative size-12 sm:size-16 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#0ac9e8]/60 shadow-md shrink-0">
                  <Image
                    src={currentUser.avatarUrl}
                    alt={studentName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-12 sm:size-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white/15 border border-white/25 text-[#0ac9e8] text-lg sm:text-xl font-black shadow-md shrink-0">
                  {studentName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-white break-words">
                  Welcome back, {studentName}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-white/80 font-medium mt-0.5 max-w-xl line-clamp-2 sm:line-clamp-none">
                  You are tracking towards an <span className="text-[#38d995] font-bold">A Distinction</span> in Commerce. Practice today&apos;s model papers and keep your ranking high!
                </p>
              </div>
            </div>

            {/* Student Meta Chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 sm:px-3 py-0.5 sm:py-1 font-bold text-white/90">
                <span className="size-1.5 rounded-full bg-[#0ac9e8]" />
                Index: <span className="font-mono text-white">{studentIndex}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 sm:px-3 py-0.5 sm:py-1 font-bold text-white/90">
                <BookOpen size={12} className="text-[#38d995]" />
                {studentBatch}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 sm:px-3 py-0.5 sm:py-1 font-bold text-white/80 hidden sm:inline-flex">
                <ShieldCheck size={12} className="text-[#f59e0b]" />
                {studentSchool}
              </span>
            </div>
          </div>

          {/* Right: Standing Card & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between sm:justify-center gap-2.5 sm:gap-3 shrink-0 pt-3 lg:pt-0 border-t border-white/10 lg:border-t-0 w-full lg:w-auto">
            {/* Standing Card */}
            <div
              onClick={() => onSelectTab("evaluation")}
              className="group cursor-pointer rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 p-3 sm:p-3.5 backdrop-blur-md transition-all text-left sm:text-right flex items-center justify-between sm:justify-start sm:flex-col gap-2.5 sm:gap-1 w-full sm:w-auto"
            >
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#f59e0b] text-[#102c45] shrink-0">
                  <Trophy size={14} className="stroke-[2.5]" />
                </span>
                <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-white/70">
                  Batch Standing
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-2xl font-black text-white flex items-center justify-end gap-1.5">
                  <span>Rank #{String(currentRank).padStart(2, "0")}</span>
                  <span className="text-xs font-bold text-[#38d995]">
                    ({totalPoints.toLocaleString()} pts)
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#0ac9e8] flex items-center justify-end gap-1 group-hover:underline">
                  <span>{tierName}</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onSelectTab("quizzes")}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#38d995] hover:bg-[#2ec585] text-[#102c45] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-black transition-transform active:scale-95 shadow-sm cursor-pointer"
              >
                <Zap size={14} className="stroke-[2.5]" />
                <span>Start Quiz</span>
              </button>
              {currentUser && (
                <button
                  type="button"
                  onClick={() => printStudentTranscriptPdf(currentUser, papers)}
                  title="Print Official Marksheet Transcript"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 px-3 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Transcript</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FOUR CORE DYNAMIC KPI CARDS                           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {/* KPI 1: Model Papers Attended & Evaluated */}
        <div
          onClick={() => onSelectTab("papers")}
          className="group rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-3.5 sm:p-5 lg:p-6 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl border border-[#007fb8]/20 bg-[#e0f2fe] text-[#007fb8] shadow-xs group-hover:scale-110 transition-transform shrink-0">
              <FileText size={18} strokeWidth={2.4} className="sm:hidden" />
              <FileText size={20} strokeWidth={2.4} className="hidden sm:inline" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-[#edf2f3] text-[#60768a]">
              Papers
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Model Papers
            </span>
            <div className="mt-0.5 sm:mt-1 text-xl sm:text-2xl lg:text-3xl font-black text-[#102c45]">
              {evaluatedPapersCount} <span className="text-xs sm:text-base text-[#60768a] font-bold">/ {totalPapersCount || 5}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#159366]">
              <span className="truncate">Evaluated</span>
              <span className="text-[#007fb8] group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
                View <ChevronRight size={11} />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Quiz Accuracy Rate */}
        <div
          onClick={() => onSelectTab("quizzes")}
          className="group rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-3.5 sm:p-5 lg:p-6 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl border border-[#0ac9e8]/30 bg-[#e0f7fa] text-[#008dc4] shadow-xs group-hover:scale-110 transition-transform shrink-0">
              <HelpCircle size={18} strokeWidth={2.4} className="sm:hidden" />
              <HelpCircle size={20} strokeWidth={2.4} className="hidden sm:inline" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-[#e0f7fa] text-[#008dc4]">
              {completedQuizzesCount}/{quizzes.length || 2} Done
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Quiz Accuracy
            </span>
            <div className="mt-0.5 sm:mt-1 text-xl sm:text-2xl lg:text-3xl font-black text-[#102c45]">
              {quizAccuracy > 0 ? `${quizAccuracy}%` : "100%"}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#007fb8]">
              <span className="truncate">Precision</span>
              <span className="group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
                Play <ChevronRight size={11} />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Class & Batch Rank */}
        <div
          onClick={() => onSelectTab("results")}
          className="group rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-3.5 sm:p-5 lg:p-6 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl border border-[#38d995]/40 bg-[#e8f7f2] text-[#159366] shadow-xs group-hover:scale-110 transition-transform shrink-0">
              <Trophy size={18} strokeWidth={2.4} className="sm:hidden" />
              <Trophy size={20} strokeWidth={2.4} className="hidden sm:inline" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-[#e8f7f2] text-[#159366]">
              {avgGrade.split(" ")[0]} Grade
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Batch Ranking
            </span>
            <div className="mt-0.5 sm:mt-1 text-xl sm:text-2xl lg:text-3xl font-black text-[#102c45]">
              Rank #{String(currentRank).padStart(2, "0")}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#159366]">
              <span className="truncate">{avgExamScore > 0 ? `Avg: ${avgExamScore}%` : "Revision"}</span>
              <span className="text-[#007fb8] group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
                Scores <ChevronRight size={11} />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: LMS Points & Leaderboard */}
        <div
          onClick={() => onSelectTab("evaluation")}
          className="group rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-3.5 sm:p-5 lg:p-6 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl border border-[#f59e0b]/30 bg-[#fef3c7] text-[#d97706] shadow-xs group-hover:scale-110 transition-transform shrink-0">
              <Award size={18} strokeWidth={2.4} className="sm:hidden" />
              <Award size={20} strokeWidth={2.4} className="hidden sm:inline" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#d97706]">
              Top League
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              LMS Points
            </span>
            <div className="mt-0.5 sm:mt-1 text-xl sm:text-2xl lg:text-3xl font-black text-[#102c45]">
              {totalPoints.toLocaleString()} <span className="text-[10px] sm:text-xs font-bold text-[#60768a]">pts</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#d97706]">
              <span className="truncate">{tierName}</span>
              <span className="text-[#007fb8] group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
                League <ChevronRight size={11} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TWO-COLUMN WORKSPACE: Recent Exam & Recommended Quiz  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column: Recent Exam Results & Performance */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-3.5 sm:space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="h-4 sm:h-5 w-1.5 rounded-full bg-[#007fb8]" />
                <h3 className="text-sm sm:text-base font-black text-[#102c45]">Recent Exam Scores</h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab("results")}
                className="text-[11px] sm:text-xs font-bold text-[#007fb8] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Marksheet</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {/* List of Recent Exam Records */}
            {examRecords.length > 0 ? (
              <div className="space-y-2.5 sm:space-y-3">
                {examRecords.slice(0, 3).map((rec) => (
                  <div
                    key={rec.paperId}
                    className="flex items-center justify-between gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#cddce5]/60 bg-[#edf2f3]/50 p-3 sm:p-3.5 hover:bg-[#edf2f3] transition-colors"
                  >
                    <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-[#60768a]">
                        <span>{rec.paperNumber}</span>
                        <span>&bull;</span>
                        <span>{rec.month} {rec.year}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-[#102c45] truncate">
                        {rec.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[#60768a]">
                        <span>Part I: <b className="text-[#102c45]">{rec.part1Score}/40</b></span>
                        <span>&bull;</span>
                        <span>Part II: <b className="text-[#102c45]">{rec.part2Score}/60</b></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-lg font-black text-[#102c45]">
                        {rec.totalScore}%
                      </div>
                      <div className="inline-flex items-center rounded-full bg-[#e8f7f2] px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[#159366]">
                        Grade {rec.grade}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl sm:rounded-2xl border border-dashed border-[#cddce5] bg-[#edf2f3]/40 p-4 sm:p-6 text-center space-y-2">
                <FileText className="mx-auto text-[#007fb8]/40" size={28} />
                <h4 className="text-xs sm:text-sm font-bold text-[#102c45]">No Marks Recorded Yet</h4>
                <p className="text-[11px] sm:text-xs text-[#60768a] max-w-sm mx-auto">
                  Submit your Model Paper worksheet during your weekly class. Teacher Evon will evaluate your marks and publish your results here!
                </p>
                <button
                  type="button"
                  onClick={() => onSelectTab("papers")}
                  className="mt-1 sm:mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/40 bg-white px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs font-bold text-[#007fb8] hover:bg-[#e0f2fe] cursor-pointer"
                >
                  Browse Model Papers
                </button>
              </div>
            )}
          </div>

          {/* Bottom Card Summary */}
          <div className="pt-2 border-t border-[#cddce5]/60 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="font-bold text-[#60768a]">Cumulative Average:</span>
            <span className="font-black text-[#102c45]">{avgExamScore}% &bull; {avgGrade}</span>
          </div>
        </div>

        {/* Right Column: Quizzes & Practice Hub */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-3.5 sm:space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="h-4 sm:h-5 w-1.5 rounded-full bg-[#0ac9e8]" />
                <h3 className="text-sm sm:text-base font-black text-[#102c45]">Recommended Quizzes</h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab("quizzes")}
                className="text-[11px] sm:text-xs font-bold text-[#007fb8] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>All ({quizzes.length})</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {/* List of 2 Quizzes */}
            <div className="space-y-2.5 sm:space-y-3">
              {quizzes.slice(0, 2).map((quiz) => (
                <div
                  key={quiz.id}
                  className="rounded-xl sm:rounded-2xl border border-[#cddce5]/60 bg-[#edf2f3]/50 p-3 sm:p-4 space-y-2.5 sm:space-y-3 hover:bg-[#edf2f3] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-[#008dc4]">
                        <span>{quiz.subject}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-[#60768a]">
                          <Clock size={11} /> {quiz.durationMinutes || 15} mins
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-[#102c45] mt-0.5 truncate">
                        {quiz.title}
                      </h4>
                    </div>

                    {quiz.completed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7f2] px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[#159366] shrink-0">
                        <CheckCircle2 size={11} /> {quiz.score}/{quiz.totalMarks}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[#007fb8] shrink-0">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5 sm:pt-1">
                    <span className="text-[10px] sm:text-[11px] text-[#60768a]">
                      {quiz.questions?.length || 10} MCQs &bull; Instant Scoring
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectTab("quizzes")}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#007fb8] hover:bg-[#006ca0] text-white px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <span>{quiz.completed ? "Re-attempt" : "Launch"}</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Accuracy Footer */}
          <div className="pt-2 border-t border-[#cddce5]/60 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="font-bold text-[#60768a]">Quiz Performance:</span>
            <span className="font-black text-[#007fb8]">
              {quizAccuracy}% Accuracy ({completedQuizzesCount} tests)
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. LIVE CLASS SCHEDULE & TEACHER'S NOTICEBOARD           */}
      {/* ======================================================== */}
      <div className="rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_100%)] p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] border border-[#007fb8]/30 px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-[11px] font-black text-[#007fb8] uppercase">
              <Calendar size={12} />
              <span>Speed Revision Live Schedule</span>
            </div>
            <h3 className="text-sm sm:text-lg font-black text-[#102c45]">
              Every Sunday 12:30 PM &ndash; 03:30 PM (Commerce Paper Class)
            </h3>
            <p className="text-xs sm:text-sm text-[#60768a] leading-relaxed">
              Conducted by <b>Teacher Evon Aravinda</b>. In this session, we discuss Commerce Paper II Structured Essay Section B, focusing on Business Accounting adjustments, Banking instruments, and exam marking schemes.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-bold text-[#102c45] pt-0.5 sm:pt-1">
              <span className="flex items-center gap-1 text-[#159366]">
                <CheckCircle2 size={13} /> Model Paper Provided
              </span>
              <span className="flex items-center gap-1 text-[#007fb8]">
                <CheckCircle2 size={13} /> Live Marking Scheme
              </span>
              <span className="flex items-center gap-1 text-[#d97706]">
                <CheckCircle2 size={13} /> Doubt Clearing
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 sm:gap-2.5 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t border-[#cddce5]/40 lg:border-t-0">
            <button
              type="button"
              onClick={() => onSelectTab("papers")}
              className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#102c45] hover:bg-[#1b4366] text-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs w-full sm:w-auto"
            >
              <Download size={14} /> Download This Week&apos;s Paper
            </button>
            <a
              href="https://wa.me/94771234567?text=Hello%20Teacher%20Evon,%20I%20am%20in%20the%20Speed%20Revision%20Batch."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl border border-[#cddce5] bg-white hover:bg-slate-50 text-[#102c45] px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs w-full sm:w-auto"
            >
              <ExternalLink size={13} /> Official WhatsApp Hotline
            </a>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. RECENT MODEL PAPERS PREVIEW                           */}
      {/* ======================================================== */}
      <div className="rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="h-4 sm:h-5 w-1.5 rounded-full bg-[#007fb8]" />
            <h3 className="text-sm sm:text-base font-black text-[#102c45]">Published Model Papers</h3>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab("papers")}
            className="text-[11px] sm:text-xs font-bold text-[#007fb8] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All ({papers.length})</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {papers.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#cddce5]/60 bg-[#edf2f3]/50 p-3 sm:p-4 hover:bg-[#edf2f3] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-[#60768a]">
                  <span>Paper #{p.paperNumber}</span>
                  <span>&bull;</span>
                  <span>{p.month} {p.year}</span>
                  <span>&bull;</span>
                  <span className="text-[#007fb8] truncate">{p.batch}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-[#102c45] mt-0.5 truncate">{p.title}</h4>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end sm:justify-start pt-1 sm:pt-0">
                {p.pdfUrl && (
                  <a
                    href={p.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#007fb8]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#007fb8] hover:bg-[#e0f2fe] transition-colors cursor-pointer shadow-xs flex-1 sm:flex-initial"
                  >
                    <Download size={12} /> PDF
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => onSelectTab("papers")}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-white border border-[#cddce5] px-3 py-1.5 text-xs font-bold text-[#102c45] hover:bg-slate-100 transition-colors cursor-pointer shadow-xs flex-1 sm:flex-initial"
                >
                  <span>Details</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. QUICK NAVIGATION TILES                                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4">
        <div
          onClick={() => onSelectTab("quizzes")}
          className="group rounded-xl sm:rounded-2xl border border-[#0ac9e8]/30 bg-white hover:bg-[#e0f7fa]/40 p-3 sm:p-4 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-[#e0f7fa] text-[#008dc4] group-hover:scale-110 transition-transform">
            <Zap size={16} strokeWidth={2.4} className="sm:hidden" />
            <Zap size={18} strokeWidth={2.4} className="hidden sm:inline" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[#102c45] mt-2 sm:mt-3">Start Quiz</h4>
          <p className="text-[10px] sm:text-[11px] text-[#60768a] mt-0.5 line-clamp-1">Timed MCQ practice</p>
        </div>

        <div
          onClick={() => onSelectTab("papers")}
          className="group rounded-xl sm:rounded-2xl border border-[#007fb8]/30 bg-white hover:bg-[#e0f2fe]/40 p-3 sm:p-4 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-[#e0f2fe] text-[#007fb8] group-hover:scale-110 transition-transform">
            <FileText size={16} strokeWidth={2.4} className="sm:hidden" />
            <FileText size={18} strokeWidth={2.4} className="hidden sm:inline" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[#102c45] mt-2 sm:mt-3">Model Papers</h4>
          <p className="text-[10px] sm:text-[11px] text-[#60768a] mt-0.5 line-clamp-1">Past papers &amp; schemes</p>
        </div>

        <div
          onClick={() => onSelectTab("results")}
          className="group rounded-xl sm:rounded-2xl border border-[#159366]/30 bg-white hover:bg-[#e8f7f2]/40 p-3 sm:p-4 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-[#e8f7f2] text-[#159366] group-hover:scale-110 transition-transform">
            <Award size={16} strokeWidth={2.4} className="sm:hidden" />
            <Award size={18} strokeWidth={2.4} className="hidden sm:inline" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[#102c45] mt-2 sm:mt-3">Official Results</h4>
          <p className="text-[10px] sm:text-[11px] text-[#60768a] mt-0.5 line-clamp-1">Marksheet &amp; PDF</p>
        </div>

        <div
          onClick={() => onSelectTab("evaluation")}
          className="group rounded-xl sm:rounded-2xl border border-[#f59e0b]/30 bg-white hover:bg-[#fef3c7]/40 p-3 sm:p-4 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-[#fef3c7] text-[#d97706] group-hover:scale-110 transition-transform">
            <Trophy size={16} strokeWidth={2.4} className="sm:hidden" />
            <Trophy size={18} strokeWidth={2.4} className="hidden sm:inline" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[#102c45] mt-2 sm:mt-3">Leaderboard</h4>
          <p className="text-[10px] sm:text-[11px] text-[#60768a] mt-0.5 line-clamp-1">Rankings &amp; badges</p>
        </div>
      </div>
    </div>
  );
}
