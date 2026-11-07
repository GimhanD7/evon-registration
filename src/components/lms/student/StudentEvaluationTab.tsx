"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Trophy,
  Award,
  Medal,
  Sparkles,
  Search,
  BookOpen,
  HelpCircle,
  User as UserIcon,
  Crown,
  ChevronRight,
  Flame,
  CheckCircle2,
  X,
  Target,
  BarChart3,
} from "lucide-react";
import { LMSEvaluation, LMSPaper, LMSQuiz, LMSUser } from "@/data/lmsData";
import { getLmsUsers, getLmsPapers, getLmsQuizzes, getCurrentLmsUser } from "@/lib/lmsStore";
import { calculateLeaderboard, StudentLeaderboardEntry } from "@/lib/leaderboardService";

interface StudentEvaluationTabProps {
  evaluations: LMSEvaluation[];
  currentUser?: LMSUser | null;
  papers?: LMSPaper[];
  quizzes?: LMSQuiz[];
}

export default function StudentEvaluationTab({
  evaluations,
  currentUser: propUser,
  papers: propPapers,
  quizzes: propQuizzes,
}: StudentEvaluationTabProps) {
  const currentUser = propUser || getCurrentLmsUser();
  const papers = propPapers || getLmsPapers();
  const quizzes = propQuizzes || getLmsQuizzes();
  const users = useMemo(() => getLmsUsers(), []);

  // Compute live leaderboard with full exams and quizzes analysis
  const leaderboard = useMemo(() => {
    return calculateLeaderboard(users, papers, quizzes, evaluations);
  }, [users, papers, quizzes, evaluations]);

  // View state: "leaderboard" | "evaluations" | "analytics"
  const [activeSubView, setActiveSubView] = useState<"leaderboard" | "evaluations" | "analytics">("leaderboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [sortBy, setSortBy] = useState<"points" | "examAvg" | "quizAccuracy">("points");
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentLeaderboardEntry | null>(null);

  // Find current student's entry
  const currentStudentEntry = useMemo(() => {
    if (!currentUser) return null;
    const userIndex = (currentUser.indexNo || "").trim().toLowerCase();
    const userName = (currentUser.fullName || "").trim().toLowerCase();
    return leaderboard.find((entry) => {
      const eIdx = (entry.indexNo || "").trim().toLowerCase();
      const eName = (entry.fullName || "").trim().toLowerCase();
      return (userIndex && eIdx === userIndex) || (userName && eName === userName) || entry.id === currentUser.id;
    }) || null;
  }, [leaderboard, currentUser]);

  // Filtered and sorted leaderboard list
  const filteredLeaderboard = useMemo(() => {
    return leaderboard
      .filter((entry) => {
        const matchesSearch =
          entry.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.indexNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.school.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesBatch =
          selectedBatch === "all" ||
          entry.batch.toLowerCase().includes(selectedBatch.toLowerCase());

        return matchesSearch && matchesBatch;
      })
      .sort((a, b) => {
        if (sortBy === "points") return b.totalPoints - a.totalPoints;
        if (sortBy === "examAvg") return b.avgExamScore - a.avgExamScore;
        if (sortBy === "quizAccuracy") return b.quizAccuracy - a.quizAccuracy;
        return 0;
      });
  }, [leaderboard, searchQuery, selectedBatch, sortBy]);

  // Top 3 Podium
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Batch options
  const batches = useMemo(() => {
    const set = new Set<string>();
    leaderboard.forEach((e) => {
      if (e.batch) set.add(e.batch);
    });
    return Array.from(set);
  }, [leaderboard]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & View Switcher */}
      <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] p-6 sm:p-8 text-white shadow-lg shadow-[#007fb8]/20">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#0ac9e8]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 size-60 rounded-full bg-[#38d995]/20 blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
              <Sparkles size={14} className="text-[#38d995]" />
              <span>Academic Performance &amp; Evaluation League</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Leaderboard &amp; Progress Evaluation
            </h2>
            <p className="text-xs sm:text-sm font-medium text-white/80 leading-relaxed">
              Real-time system rankings analyzed across all paper class exam marks, interactive quiz accuracy, and teacher evaluations. Compete, score points, and elevate your commerce rank!
            </p>
          </div>

          {/* Sub-view Nav Pills */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-black/25 p-1.5 backdrop-blur-md self-start md:self-center">
            <button
              type="button"
              onClick={() => setActiveSubView("leaderboard")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubView === "leaderboard"
                  ? "bg-white text-[#102c45] shadow-md shadow-black/10 scale-102"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Trophy size={15} className={activeSubView === "leaderboard" ? "text-[#007fb8]" : ""} />
              Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView("evaluations")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubView === "evaluations"
                  ? "bg-white text-[#102c45] shadow-md shadow-black/10 scale-102"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Award size={15} className={activeSubView === "evaluations" ? "text-[#159366]" : ""} />
              Teacher Feedback
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView("analytics")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubView === "analytics"
                  ? "bg-white text-[#102c45] shadow-md shadow-black/10 scale-102"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <BarChart3 size={15} className={activeSubView === "analytics" ? "text-[#0ac9e8]" : ""} />
              Points Formula
            </button>
          </div>
        </div>

        {/* Logged In Student Fast Status Banner */}
        {currentStudentEntry && (
          <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Your Rank
              </span>
              <div className="mt-0.5 flex items-center gap-1.5 text-xl font-black text-[#38d995]">
                <Crown size={18} />
                <span>#{currentStudentEntry.rank}</span>
                <span className="text-[10px] font-bold text-white/80">of {leaderboard.length}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Total Points (XP)
              </span>
              <div className="mt-0.5 flex items-center gap-1.5 text-xl font-black text-[#0ac9e8]">
                <Flame size={18} />
                <span>{currentStudentEntry.totalPoints} pts</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Exam Average
              </span>
              <div className="mt-0.5 text-xl font-black text-white">
                {currentStudentEntry.avgExamScore}%
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Quiz Accuracy
              </span>
              <div className="mt-0.5 text-xl font-black text-white">
                {currentStudentEntry.quizAccuracy}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SUBVIEW: LEADERBOARD */}
      {activeSubView === "leaderboard" && (
        <div className="space-y-6">
          {/* Top 3 Podium Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end pt-4">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div className="order-2 md:order-1 relative rounded-3xl border-2 border-[#94a3b8]/40 bg-white p-5 text-center shadow-md transition-transform hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-[#f1f5f9] border border-[#94a3b8] px-3 py-0.5 text-[11px] font-black text-[#475569]">
                  <Medal size={14} className="text-[#94a3b8]" />
                  <span>Rank #02</span>
                </div>
                <div className="mt-3 mx-auto size-16 rounded-full border-2 border-[#94a3b8] p-0.5 overflow-hidden bg-[#edf2f3] flex items-center justify-center">
                  {top2.avatarUrl ? (
                    <Image src={top2.avatarUrl} alt={top2.fullName} width={64} height={64} className="size-full object-cover rounded-full" />
                  ) : (
                    <UserIcon size={32} className="text-[#60768a]" />
                  )}
                </div>
                <h3 className="mt-2 text-sm font-black text-[#102c45] truncate">{top2.fullName}</h3>
                <p className="text-[11px] font-bold text-[#60768a] truncate">{top2.school}</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-black text-[#102c45]">
                  <Flame size={14} className="text-[#007fb8]" />
                  <span>{top2.totalPoints} Points</span>
                </div>
                <div className="mt-3 grid grid-cols-2 border-t border-[#cddce5]/60 pt-2 text-[11px]">
                  <div>
                    <span className="text-[#60768a]">Exams</span>
                    <p className="font-black text-[#102c45]">{top2.avgExamScore}%</p>
                  </div>
                  <div>
                    <span className="text-[#60768a]">Quizzes</span>
                    <p className="font-black text-[#159366]">{top2.quizAccuracy}%</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForModal(top2)}
                  className="mt-3 w-full rounded-xl bg-[#edf2f3] py-1.5 text-[11px] font-bold text-[#007fb8] hover:bg-[#e0f2fe] transition-colors cursor-pointer"
                >
                  View Analytics
                </button>
              </div>
            )}

            {/* Rank 1 (Gold Champion - Center Hero) */}
            {top1 && (
              <div className="order-1 md:order-2 relative rounded-3xl border-3 border-[#f59e0b] bg-[linear-gradient(180deg,#fffbeb_0%,#ffffff_100%)] p-6 text-center shadow-xl shadow-[#f59e0b]/15 transition-transform hover:-translate-y-1.5">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-[#f59e0b] px-4 py-1 text-xs font-black text-white shadow-md shadow-[#f59e0b]/40">
                  <Crown size={15} />
                  <span>Rank #01 &bull; Champion</span>
                </div>
                <div className="mt-3 mx-auto size-20 rounded-full border-3 border-[#f59e0b] p-0.5 overflow-hidden bg-white shadow-lg shadow-[#f59e0b]/30 flex items-center justify-center">
                  {top1.avatarUrl ? (
                    <Image src={top1.avatarUrl} alt={top1.fullName} width={80} height={80} className="size-full object-cover rounded-full" />
                  ) : (
                    <UserIcon size={40} className="text-[#f59e0b]" />
                  )}
                </div>
                <h3 className="mt-3 text-base font-black text-[#102c45] truncate">{top1.fullName}</h3>
                <p className="text-xs font-bold text-[#60768a] truncate">{top1.school}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] border border-[#f59e0b]/40 px-3.5 py-1 text-sm font-black text-[#92400e]">
                  <Flame size={16} className="text-[#f59e0b]" />
                  <span>{top1.totalPoints} Total Points</span>
                </div>
                <div className="mt-4 grid grid-cols-2 border-t border-[#fde68a] pt-3 text-xs">
                  <div>
                    <span className="text-[#78716c] font-bold">Exam Avg</span>
                    <p className="text-base font-black text-[#102c45]">{top1.avgExamScore}%</p>
                  </div>
                  <div>
                    <span className="text-[#78716c] font-bold">Quiz Score</span>
                    <p className="text-base font-black text-[#159366]">{top1.quizAccuracy}%</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForModal(top1)}
                  className="mt-4 w-full rounded-2xl bg-[#f59e0b] py-2 text-xs font-black text-white shadow-md shadow-[#f59e0b]/30 hover:bg-[#d97706] transition-colors cursor-pointer"
                >
                  Full Score Analysis
                </button>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div className="order-3 relative rounded-3xl border-2 border-[#d97706]/40 bg-white p-5 text-center shadow-md transition-transform hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-[#fef3c7] border border-[#d97706] px-3 py-0.5 text-[11px] font-black text-[#b45309]">
                  <Medal size={14} className="text-[#d97706]" />
                  <span>Rank #03</span>
                </div>
                <div className="mt-3 mx-auto size-16 rounded-full border-2 border-[#d97706] p-0.5 overflow-hidden bg-[#edf2f3] flex items-center justify-center">
                  {top3.avatarUrl ? (
                    <Image src={top3.avatarUrl} alt={top3.fullName} width={64} height={64} className="size-full object-cover rounded-full" />
                  ) : (
                    <UserIcon size={32} className="text-[#60768a]" />
                  )}
                </div>
                <h3 className="mt-2 text-sm font-black text-[#102c45] truncate">{top3.fullName}</h3>
                <p className="text-[11px] font-bold text-[#60768a] truncate">{top3.school}</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-black text-[#102c45]">
                  <Flame size={14} className="text-[#d97706]" />
                  <span>{top3.totalPoints} Points</span>
                </div>
                <div className="mt-3 grid grid-cols-2 border-t border-[#cddce5]/60 pt-2 text-[11px]">
                  <div>
                    <span className="text-[#60768a]">Exams</span>
                    <p className="font-black text-[#102c45]">{top3.avgExamScore}%</p>
                  </div>
                  <div>
                    <span className="text-[#60768a]">Quizzes</span>
                    <p className="font-black text-[#159366]">{top3.quizAccuracy}%</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForModal(top3)}
                  className="mt-3 w-full rounded-xl bg-[#edf2f3] py-1.5 text-[11px] font-bold text-[#007fb8] hover:bg-[#e0f2fe] transition-colors cursor-pointer"
                >
                  View Analytics
                </button>
              </div>
            )}
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name, index number, or school..."
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 pl-10 pr-4 text-xs font-bold text-[#102c45] placeholder-[#94a3b8] focus:border-[#007fb8] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
                >
                  <option value="all">All Batches ({leaderboard.length})</option>
                  {batches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <div className="flex items-center rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSortBy("points")}
                    className={`rounded-xl px-2.5 py-1.5 cursor-pointer transition-colors ${
                      sortBy === "points" ? "bg-white text-[#007fb8] shadow-xs" : "text-[#60768a]"
                    }`}
                  >
                    Points
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("examAvg")}
                    className={`rounded-xl px-2.5 py-1.5 cursor-pointer transition-colors ${
                      sortBy === "examAvg" ? "bg-white text-[#007fb8] shadow-xs" : "text-[#60768a]"
                    }`}
                  >
                    Exam %
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("quizAccuracy")}
                    className={`rounded-xl px-2.5 py-1.5 cursor-pointer transition-colors ${
                      sortBy === "quizAccuracy" ? "bg-white text-[#007fb8] shadow-xs" : "text-[#60768a]"
                    }`}
                  >
                    Quiz %
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#cddce5] text-[11px] font-black uppercase tracking-wider text-[#60768a]">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Student Details</th>
                    <th className="py-3 px-3 text-center">Exams Avg</th>
                    <th className="py-3 px-3 text-center">Quiz Accuracy</th>
                    <th className="py-3 px-3 text-center">Teacher Grade</th>
                    <th className="py-3 px-3 text-right">System Points</th>
                    <th className="py-3 px-3 text-center">Analytics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f3]">
                  {filteredLeaderboard.map((entry) => {
                    const isCurrentUser =
                      currentUser &&
                      ((currentUser.indexNo && entry.indexNo === currentUser.indexNo) ||
                        entry.id === currentUser.id ||
                        entry.fullName.toLowerCase() === currentUser.fullName.toLowerCase());

                    return (
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          isCurrentUser
                            ? "bg-[#e0f2fe]/60 font-bold hover:bg-[#e0f2fe]/80"
                            : "hover:bg-[#f8fafc]"
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {entry.rank === 1 ? (
                            <span className="flex size-7 items-center justify-center rounded-full bg-[#f59e0b] text-white font-black shadow-xs">
                              1
                            </span>
                          ) : entry.rank === 2 ? (
                            <span className="flex size-7 items-center justify-center rounded-full bg-[#94a3b8] text-white font-black shadow-xs">
                              2
                            </span>
                          ) : entry.rank === 3 ? (
                            <span className="flex size-7 items-center justify-center rounded-full bg-[#d97706] text-white font-black shadow-xs">
                              3
                            </span>
                          ) : (
                            <span className="flex size-7 items-center justify-center rounded-full bg-[#edf2f3] text-[#60768a] font-bold">
                              #{entry.rank}
                            </span>
                          )}
                        </td>

                        {/* Student Details */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-[#102c45] text-white flex items-center justify-center shrink-0 overflow-hidden border border-white shadow-xs">
                              {entry.avatarUrl ? (
                                <Image src={entry.avatarUrl} alt={entry.fullName} width={36} height={36} className="size-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold">
                                  {entry.fullName.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-[#102c45] truncate max-w-[180px]">
                                  {entry.fullName}
                                </span>
                                {isCurrentUser && (
                                  <span className="rounded-full bg-[#007fb8] text-white px-2 py-0.5 text-[9px] font-black uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#60768a] truncate">
                                Index: <strong className="text-[#102c45]">{entry.indexNo}</strong> &bull; {entry.school}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Exams Avg */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-black text-[#102c45] text-sm">
                            {entry.avgExamScore}%
                          </span>
                          <p className="text-[10px] text-[#60768a]">
                            {entry.examsAttended} papers
                          </p>
                        </td>

                        {/* Quiz Accuracy */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-black text-[#159366] text-sm">
                            {entry.quizAccuracy}%
                          </span>
                          <p className="text-[10px] text-[#60768a]">
                            {entry.quizzesAttempted} quizzes
                          </p>
                        </td>

                        {/* Teacher Grade */}
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                              entry.latestPerformanceGrade === "Outstanding"
                                ? "bg-[#e8f7f2] text-[#159366]"
                                : entry.latestPerformanceGrade === "Very Good"
                                ? "bg-[#e0f2fe] text-[#007fb8]"
                                : "bg-[#f1f5f9] text-[#60768a]"
                            }`}
                          >
                            {entry.latestPerformanceGrade || "Active Progress"}
                          </span>
                        </td>

                        {/* Total System Points */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3 py-1 font-black text-[#007fb8]">
                            <Flame size={14} className="text-[#0ac9e8]" />
                            <span>{entry.totalPoints} pts</span>
                          </div>
                        </td>

                        {/* Analytics action */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForModal(entry)}
                            className="rounded-xl border border-[#cddce5] bg-white p-2 text-[#007fb8] hover:bg-[#edf2f3] hover:border-[#007fb8] transition-colors cursor-pointer"
                            title="Inspect detailed results"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBVIEW: TEACHER REMARKS & EVALUATIONS */}
      {activeSubView === "evaluations" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
            <h3 className="text-lg font-black text-[#102c45]">Personalized Progress Evaluations</h3>
            <p className="text-xs text-[#60768a] mt-0.5">
              Verified teacher recommendations, demonstrated strengths, and focus advice published by teacher Evon Aravinda.
            </p>

            <div className="mt-6 space-y-4">
              {evaluations.length === 0 ? (
                <div className="text-center py-12 text-[#60768a]">
                  <Award size={36} className="mx-auto mb-2 text-[#94a3b8]" />
                  <p className="font-bold text-sm">No teacher remarks recorded yet.</p>
                  <p className="text-xs">Your teacher will publish personalized reviews after upcoming model papers.</p>
                </div>
              ) : (
                evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-3xl border border-[#cddce5] bg-[#edf2f3]/40 p-6 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cddce5]/60 pb-4">
                      <div>
                        <span className="text-xs font-bold text-[#007fb8]">{ev.paperOrTerm}</span>
                        <h4 className="text-base font-black text-[#102c45] mt-0.5">
                          Progress Assessment Report
                        </h4>
                      </div>
                      <span className="rounded-full bg-[#e8f7f2] border border-[#38d995]/40 px-3.5 py-1 text-xs font-black text-[#159366] self-start sm:self-auto">
                        Performance: {ev.performanceGrade}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-[#38d995]/50 bg-[#e8f7f2]/60 p-4 space-y-2">
                        <span className="text-xs font-black text-[#159366] uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Demonstrated Strengths
                        </span>
                        <ul className="list-disc pl-4 text-xs font-semibold text-[#102c45] space-y-1">
                          {ev.strengths.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-[#0ac9e8]/40 bg-[#e0f7fa]/60 p-4 space-y-2">
                        <span className="text-xs font-black text-[#008dc4] uppercase tracking-wider flex items-center gap-1.5">
                          <Target size={14} /> Areas for Targeted Growth
                        </span>
                        <ul className="list-disc pl-4 text-xs font-semibold text-[#102c45] space-y-1">
                          {ev.weaknesses.map((w) => (
                            <li key={w}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#cddce5] bg-white p-4 space-y-1.5 shadow-xs">
                      <span className="text-xs font-bold text-[#60768a]">
                        Teacher Remarks by Evon Aravinda:
                      </span>
                      <p className="text-xs font-bold text-[#102c45] leading-relaxed italic">
                        &ldquo;{ev.teacherRemarks}&rdquo;
                      </p>
                      {ev.recommendedAction && (
                        <p className="mt-2 text-xs font-bold text-[#007fb8]">
                          Recommended Action: {ev.recommendedAction}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBVIEW: POINTS FORMULA & ANALYTICS RULES */}
      {activeSubView === "analytics" && (
        <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#102c45]">How System Leaderboard Points are Calculated</h3>
            <p className="text-xs text-[#60768a] mt-0.5">
              Transparent points matrix evaluating academic exam consistency, digital quiz mastery, and teacher progress evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#007fb8]/30 bg-[#e0f2fe]/40 p-5 space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#007fb8] text-white">
                <BookOpen size={20} />
              </div>
              <h4 className="text-sm font-black text-[#102c45]">1. Model Paper Exams</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Every exam paper adds direct points equal to your total score (e.g., scoring 92% awards <strong>+92 points</strong>). Consistent participation across all term papers is rewarded heavily!
              </p>
            </div>

            <div className="rounded-2xl border border-[#159366]/30 bg-[#e8f7f2]/50 p-5 space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#159366] text-white">
                <HelpCircle size={20} />
              </div>
              <h4 className="text-sm font-black text-[#102c45]">2. Interactive Quizzes</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Online multiple-choice questions provide high-frequency revision. Each correct quiz answer awards <strong>5x Multiplier Points</strong> (e.g. 20/20 in a quiz adds <strong>+100 points</strong>).
              </p>
            </div>

            <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#fef3c7]/40 p-5 space-y-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#f59e0b] text-white">
                <Award size={20} />
              </div>
              <h4 className="text-sm font-black text-[#102c45]">3. Teacher Evaluation Bonus</h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Personalized teacher reviews award up to <strong>+60 bonus points</strong> for Outstanding performance, active attendance, and disciplined homework submission.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Detailed Student Analytics Inspection Modal */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#cddce5] bg-white p-6 shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setSelectedStudentForModal(null)}
              className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5] hover:text-[#102c45] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Student Header */}
            <div className="flex items-center gap-4 border-b border-[#cddce5]/60 pb-5">
              <div className="size-16 rounded-full bg-[#102c45] text-white flex items-center justify-center text-xl font-black border-2 border-white shadow-md overflow-hidden">
                {selectedStudentForModal.avatarUrl ? (
                  <Image src={selectedStudentForModal.avatarUrl} alt={selectedStudentForModal.fullName} width={64} height={64} className="size-full object-cover" />
                ) : (
                  selectedStudentForModal.fullName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-[#102c45]">{selectedStudentForModal.fullName}</h3>
                  <span className="rounded-full bg-[#007fb8] text-white px-2.5 py-0.5 text-[10px] font-black">
                    Rank #{selectedStudentForModal.rank}
                  </span>
                </div>
                <p className="text-xs text-[#60768a] mt-0.5">
                  Index: <strong className="text-[#102c45]">{selectedStudentForModal.indexNo}</strong> &bull; {selectedStudentForModal.school}
                </p>
                <p className="text-xs font-bold text-[#007fb8]">{selectedStudentForModal.batch}</p>
              </div>
            </div>

            {/* Core KPI Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3">
                <span className="text-[10px] font-bold text-[#60768a] uppercase">Total Points</span>
                <p className="text-lg font-black text-[#007fb8] mt-0.5">{selectedStudentForModal.totalPoints} pts</p>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3">
                <span className="text-[10px] font-bold text-[#60768a] uppercase">Exam Average</span>
                <p className="text-lg font-black text-[#102c45] mt-0.5">{selectedStudentForModal.avgExamScore}%</p>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3">
                <span className="text-[10px] font-bold text-[#60768a] uppercase">Quiz Accuracy</span>
                <p className="text-lg font-black text-[#159366] mt-0.5">{selectedStudentForModal.quizAccuracy}%</p>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3">
                <span className="text-[10px] font-bold text-[#60768a] uppercase">Evaluations</span>
                <p className="text-lg font-black text-[#f59e0b] mt-0.5">{selectedStudentForModal.evaluationsCount}</p>
              </div>
            </div>

            {/* Exam Papers History */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-[#102c45] flex items-center gap-2">
                <BookOpen size={16} className="text-[#007fb8]" />
                Analyzed Paper Class Exams ({selectedStudentForModal.recentExamScores.length})
              </h4>
              {selectedStudentForModal.recentExamScores.length === 0 ? (
                <p className="text-xs text-[#94a3b8] italic">No exam records found for this student.</p>
              ) : (
                <div className="divide-y divide-[#edf2f3] rounded-2xl border border-[#cddce5] overflow-hidden">
                  {selectedStudentForModal.recentExamScores.map((score, i) => (
                    <div key={i} className="flex items-center justify-between p-3 text-xs bg-white hover:bg-[#f8fafc]">
                      <div>
                        <p className="font-bold text-[#102c45]">{score.paperTitle}</p>
                        <p className="text-[10px] text-[#60768a]">
                          Part 1: {score.part1} | Part 2: {score.part2} | Rank: #{score.rank}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#007fb8]">{score.score} marks</span>
                        <span className="ml-2 rounded-md bg-[#e0f2fe] px-1.5 py-0.5 text-[10px] font-black text-[#007fb8]">
                          Grade {score.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quizzes History */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-[#102c45] flex items-center gap-2">
                <HelpCircle size={16} className="text-[#159366]" />
                Interactive Quizzes Performance
              </h4>
              {selectedStudentForModal.recentQuizScores.length === 0 ? (
                <p className="text-xs text-[#94a3b8] italic">No online quizzes completed yet.</p>
              ) : (
                <div className="divide-y divide-[#edf2f3] rounded-2xl border border-[#cddce5] overflow-hidden">
                  {selectedStudentForModal.recentQuizScores.map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-3 text-xs bg-white hover:bg-[#f8fafc]">
                      <p className="font-bold text-[#102c45]">{q.quizTitle}</p>
                      <span className="font-black text-[#159366]">
                        {q.score} / {q.totalMarks} ({Math.round((q.score / (q.totalMarks || 1)) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudentForModal(null)}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-3 text-xs font-black uppercase text-white shadow-lg cursor-pointer"
            >
              Close Performance Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
