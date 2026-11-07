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
  Flame,
  CheckCircle2,
  X,
  Target,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { LMSEvaluation, LMSPaper, LMSQuiz, LMSUser } from "@/data/lmsData";
import { getLmsUsers, getLmsPapers, getLmsQuizzes, getCurrentLmsUser } from "@/lib/lmsStore";
import { calculateLeaderboard } from "@/lib/leaderboardService";

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

  // Compute live leaderboard with system points
  const leaderboard = useMemo(() => {
    return calculateLeaderboard(users, papers, quizzes, evaluations);
  }, [users, papers, quizzes, evaluations]);

  // View state: "leaderboard" | "evaluations" | "analytics"
  const [activeSubView, setActiveSubView] = useState<"leaderboard" | "evaluations" | "analytics">("leaderboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [showMyScoreModal, setShowMyScoreModal] = useState(false);

  // Find current student's entry
  const currentStudentEntry = useMemo(() => {
    if (!currentUser) return null;
    const userIndex = (currentUser.indexNo || "").trim().toLowerCase();
    const userName = (currentUser.fullName || "").trim().toLowerCase();
    return (
      leaderboard.find((entry) => {
        const eIdx = (entry.indexNo || "").trim().toLowerCase();
        const eName = (entry.fullName || "").trim().toLowerCase();
        return (
          (userIndex && eIdx === userIndex) ||
          (userName && eName === userName) ||
          entry.id === currentUser.id
        );
      }) || null
    );
  }, [leaderboard, currentUser]);

  // Filtered leaderboard: ONLY points and ranks displayed
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
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [leaderboard, searchQuery, selectedBatch]);

  // Top 3 Podium
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Unique Batch options
  const batches = useMemo(() => {
    const set = new Set<string>();
    leaderboard.forEach((e) => {
      if (e.batch) set.add(e.batch);
    });
    return Array.from(set);
  }, [leaderboard]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Header Banner & View Switcher (Mobile Optimized) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] p-4 sm:p-6 md:p-8 text-white shadow-lg shadow-[#007fb8]/20">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#0ac9e8]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 size-60 rounded-full bg-[#38d995]/20 blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-bold backdrop-blur-md">
              <Sparkles size={13} className="text-[#38d995]" />
              <span>Academic Points League</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
              Student Leaderboard
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-white/80 leading-relaxed">
              Official system points league ranking for all enrolled students. Points are accumulated from exam papers, online revision quizzes, and teacher evaluations.
            </p>
          </div>

          {/* Sub-view Nav Pills (Horizontally scrollable on mobile) */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-black/25 p-1 backdrop-blur-md self-start md:self-center overflow-x-auto max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActiveSubView("leaderboard")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeSubView === "leaderboard"
                  ? "bg-white text-[#102c45] shadow-md shadow-black/10 scale-102"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Trophy size={14} className={activeSubView === "leaderboard" ? "text-[#007fb8]" : ""} />
              Points Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView("evaluations")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeSubView === "evaluations"
                  ? "bg-white text-[#102c45] shadow-md shadow-black/10 scale-102"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Award size={14} className={activeSubView === "evaluations" ? "text-[#159366]" : ""} />
              Teacher Feedback
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView("analytics")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeSubView === "analytics"
                  ? "bg-white text-[#102c45] shadow-md shadow-black/10 scale-102"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <BarChart3 size={14} className={activeSubView === "analytics" ? "text-[#0ac9e8]" : ""} />
              Points Rules
            </button>
          </div>
        </div>

        {/* Logged In Student Fast Status Banner */}
        {currentStudentEntry && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="rounded-2xl bg-white/10 p-2.5 sm:p-3 backdrop-blur-md">
              <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-white/70">
                Your Rank
              </span>
              <div className="mt-0.5 flex items-center gap-1 text-base sm:text-xl font-black text-[#38d995]">
                <Crown size={16} />
                <span>#{currentStudentEntry.rank}</span>
                <span className="text-[10px] font-bold text-white/80">/ {leaderboard.length}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-2.5 sm:p-3 backdrop-blur-md">
              <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-white/70">
                Your Points (XP)
              </span>
              <div className="mt-0.5 flex items-center gap-1 text-base sm:text-xl font-black text-[#0ac9e8]">
                <Flame size={16} />
                <span>{currentStudentEntry.totalPoints} pts</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-2.5 sm:p-3 backdrop-blur-md">
              <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-white/70">
                Your Tier
              </span>
              <div className="mt-0.5 text-xs sm:text-sm font-black text-white truncate">
                {currentStudentEntry.tier}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-2 sm:p-3 backdrop-blur-md flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowMyScoreModal(true)}
                className="w-full rounded-xl bg-white/20 hover:bg-white/30 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black text-white transition-colors cursor-pointer border border-white/30"
              >
                My Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. SUBVIEW: POINTS ONLY LEADERBOARD */}
      {activeSubView === "leaderboard" && (
        <div className="space-y-4 sm:space-y-6">
          {/* MOBILE-SPECIFIC 3-PILLAR PODIUM (Compact side-by-side design on screens < 768px) */}
          <div className="block md:hidden">
            <div className="relative rounded-3xl border border-[#cddce5] bg-white p-4 shadow-sm">
              <div className="text-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#60768a]">
                  Top 3 League Leaders
                </span>
              </div>

              <div className="flex items-end justify-center gap-2 max-w-[360px] mx-auto">
                {/* Rank 2 (Silver) */}
                {top2 && (
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className="relative mb-1">
                      <div className="size-12 rounded-full border-2 border-[#94a3b8] p-0.5 overflow-hidden bg-[#edf2f3] flex items-center justify-center shadow-sm">
                        {top2.avatarUrl ? (
                          <Image src={top2.avatarUrl} alt={top2.fullName} width={48} height={48} className="size-full object-cover rounded-full" />
                        ) : (
                          <UserIcon size={24} className="text-[#60768a]" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center size-4 rounded-full bg-[#94a3b8] text-white text-[9px] font-black shadow-xs">
                        2
                      </span>
                    </div>

                    <p className="text-[11px] font-black text-[#102c45] truncate w-full px-1">
                      {top2.fullName.split(" ")[0]}
                    </p>
                    <div className="inline-flex items-center gap-0.5 text-[10px] font-black text-[#007fb8] mt-0.5">
                      <Flame size={11} className="text-[#0ac9e8]" />
                      <span>{top2.totalPoints} pts</span>
                    </div>

                    {/* Silver Pillar */}
                    <div className="w-full mt-2 rounded-t-xl bg-[linear-gradient(180deg,#f1f5f9_0%,#cbd5e1_100%)] h-16 flex flex-col items-center justify-center text-[#475569] border-t-2 border-x border-[#94a3b8]">
                      <span className="text-xl font-black text-[#64748b]">2</span>
                      <span className="text-[8.5px] font-bold text-[#64748b] uppercase">Silver</span>
                    </div>
                  </div>
                )}

                {/* Rank 1 (Gold Champion - Tallest Pillar) */}
                {top1 && (
                  <div className="flex-1 flex flex-col items-center text-center -mt-4">
                    <Crown size={20} className="text-[#f59e0b] animate-bounce mb-0.5" />
                    <div className="relative mb-1">
                      <div className="size-14 rounded-full border-2 border-[#f59e0b] p-0.5 overflow-hidden bg-white flex items-center justify-center shadow-md ring-2 ring-[#f59e0b]/40">
                        {top1.avatarUrl ? (
                          <Image src={top1.avatarUrl} alt={top1.fullName} width={56} height={56} className="size-full object-cover rounded-full" />
                        ) : (
                          <UserIcon size={28} className="text-[#f59e0b]" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center size-5 rounded-full bg-[#f59e0b] text-white text-[10px] font-black shadow-xs">
                        1
                      </span>
                    </div>

                    <p className="text-xs font-black text-[#102c45] truncate w-full px-1">
                      {top1.fullName.split(" ")[0]}
                    </p>
                    <div className="inline-flex items-center gap-0.5 text-[11px] font-black text-[#b45309] mt-0.5">
                      <Flame size={12} className="text-[#f59e0b]" />
                      <span>{top1.totalPoints} pts</span>
                    </div>

                    {/* Gold Pillar */}
                    <div className="w-full mt-2 rounded-t-xl bg-[linear-gradient(180deg,#fef3c7_0%,#fde68a_100%)] h-22 flex flex-col items-center justify-center text-[#92400e] border-t-2 border-x border-[#f59e0b]">
                      <span className="text-2xl font-black text-[#b45309]">1</span>
                      <span className="text-[9px] font-black text-[#92400e] uppercase">Champion</span>
                    </div>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {top3 && (
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className="relative mb-1">
                      <div className="size-12 rounded-full border-2 border-[#d97706] p-0.5 overflow-hidden bg-[#edf2f3] flex items-center justify-center shadow-sm">
                        {top3.avatarUrl ? (
                          <Image src={top3.avatarUrl} alt={top3.fullName} width={48} height={48} className="size-full object-cover rounded-full" />
                        ) : (
                          <UserIcon size={24} className="text-[#60768a]" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center size-4 rounded-full bg-[#d97706] text-white text-[9px] font-black shadow-xs">
                        3
                      </span>
                    </div>

                    <p className="text-[11px] font-black text-[#102c45] truncate w-full px-1">
                      {top3.fullName.split(" ")[0]}
                    </p>
                    <div className="inline-flex items-center gap-0.5 text-[10px] font-black text-[#d97706] mt-0.5">
                      <Flame size={11} className="text-[#d97706]" />
                      <span>{top3.totalPoints} pts</span>
                    </div>

                    {/* Bronze Pillar */}
                    <div className="w-full mt-2 rounded-t-xl bg-[linear-gradient(180deg,#ffedd5_0%,#fed7aa_100%)] h-13 flex flex-col items-center justify-center text-[#9a3412] border-t-2 border-x border-[#d97706]">
                      <span className="text-lg font-black text-[#c2410c]">3</span>
                      <span className="text-[8.5px] font-bold text-[#9a3412] uppercase">Bronze</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DESKTOP 3-CARD PODIUM (Visible on md: ≥768px) */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 items-end pt-4">
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
                <span className="mt-1 inline-block text-[10px] font-extrabold text-[#007fb8] uppercase">
                  {top2.tier}
                </span>

                <div className="mt-4 pt-3 border-t border-[#cddce5]/60">
                  <span className="text-[10px] font-bold text-[#60768a] uppercase tracking-wider block">
                    Accumulated Points
                  </span>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] border border-[#007fb8]/30 px-4 py-1.5 text-base font-black text-[#007fb8]">
                    <Flame size={16} className="text-[#0ac9e8]" />
                    <span>{top2.totalPoints} Points</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold Champion - Center Hero) */}
            {top1 && (
              <div className="order-1 md:order-2 relative rounded-3xl border-3 border-[#f59e0b] bg-[linear-gradient(180deg,#fffbeb_0%,#ffffff_100%)] p-6 text-center shadow-xl shadow-[#f59e0b]/15 transition-transform hover:-translate-y-1.5">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-[#f59e0b] px-4 py-1 text-xs font-black text-white shadow-md shadow-[#f59e0b]/40">
                  <Crown size={15} />
                  <span>Rank #01 &bull; League Champion</span>
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
                <span className="mt-1 inline-block text-[11px] font-black text-[#b45309] uppercase tracking-wide">
                  {top1.tier}
                </span>

                <div className="mt-4 pt-3 border-t border-[#fde68a]">
                  <span className="text-[10px] font-bold text-[#92400e] uppercase tracking-wider block">
                    Total System Points
                  </span>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#fef3c7] border border-[#f59e0b]/40 px-5 py-2 text-lg font-black text-[#92400e] shadow-xs">
                    <Flame size={20} className="text-[#f59e0b]" />
                    <span>{top1.totalPoints} Total Points</span>
                  </div>
                </div>
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
                <span className="mt-1 inline-block text-[10px] font-extrabold text-[#d97706] uppercase">
                  {top3.tier}
                </span>

                <div className="mt-4 pt-3 border-t border-[#cddce5]/60">
                  <span className="text-[10px] font-bold text-[#60768a] uppercase tracking-wider block">
                    Accumulated Points
                  </span>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] border border-[#d97706]/30 px-4 py-1.5 text-base font-black text-[#b45309]">
                    <Flame size={16} className="text-[#d97706]" />
                    <span>{top3.totalPoints} Points</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search & Batch Filters */}
          <div className="rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-3.5 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name, index, school..."
                  className="w-full rounded-xl sm:rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 text-xs font-bold text-[#102c45] placeholder-[#94a3b8] focus:border-[#007fb8] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 sm:py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
                >
                  <option value="all">All Batches ({leaderboard.length})</option>
                  {batches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <div className="hidden sm:flex rounded-2xl bg-[#e0f2fe] border border-[#007fb8]/20 px-3.5 py-2 text-xs font-black text-[#007fb8] items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck size={14} /> Points Only League
                </div>
              </div>
            </div>

            {/* MOBILE-FRIENDLY CARD LIST (Visible on screens < 768px: Zero Horizontal Scroll!) */}
            <div className="block md:hidden space-y-2 pt-1">
              {filteredLeaderboard.map((entry) => {
                const isCurrentUser =
                  currentUser &&
                  ((currentUser.indexNo && entry.indexNo === currentUser.indexNo) ||
                    entry.id === currentUser.id ||
                    entry.fullName.toLowerCase() === currentUser.fullName.toLowerCase());

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isCurrentUser
                        ? "bg-[#e0f2fe]/70 border-[#007fb8] shadow-sm"
                        : "bg-white border-[#cddce5]/80 hover:bg-[#f8fafc]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {/* Rank Badge */}
                      <div className="shrink-0">
                        {entry.rank === 1 ? (
                          <span className="flex size-7 items-center justify-center rounded-full bg-[#f59e0b] text-white font-black text-xs shadow-xs">
                            1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="flex size-7 items-center justify-center rounded-full bg-[#94a3b8] text-white font-black text-xs shadow-xs">
                            2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="flex size-7 items-center justify-center rounded-full bg-[#d97706] text-white font-black text-xs shadow-xs">
                            3
                          </span>
                        ) : (
                          <span className="flex size-7 items-center justify-center rounded-full bg-[#edf2f3] text-[#60768a] font-black text-[11px]">
                            #{entry.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="size-8 rounded-full bg-[#102c45] text-white flex items-center justify-center shrink-0 overflow-hidden border border-white shadow-xs">
                        {entry.avatarUrl ? (
                          <Image src={entry.avatarUrl} alt={entry.fullName} width={32} height={32} className="size-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold">
                            {entry.fullName.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-black text-[#102c45] text-xs truncate">
                            {entry.fullName}
                          </p>
                          {isCurrentUser && (
                            <span className="rounded-full bg-[#007fb8] text-white px-1.5 py-0.2 text-[8px] font-black uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#60768a] truncate">
                          {entry.school || entry.batch}
                        </p>
                      </div>
                    </div>

                    {/* Points Pill */}
                    <div className="shrink-0 text-right">
                      <div className="inline-flex items-center gap-1 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-2.5 py-1 text-xs font-black text-[#007fb8]">
                        <Flame size={13} className="text-[#0ac9e8]" />
                        <span>{entry.totalPoints} pts</span>
                      </div>
                      <span className="block text-[8.5px] font-bold text-[#60768a] text-right mt-0.5">
                        {entry.tier.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP LEADERBOARD TABLE (Visible on md: ≥768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#cddce5] text-[11px] font-black uppercase tracking-wider text-[#60768a]">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Registered Batch</th>
                    <th className="py-3 px-3 text-center">League Tier</th>
                    <th className="py-3 px-3 text-right">System Points</th>
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

                        {/* Registered Batch */}
                        <td className="py-3.5 px-3 text-xs font-bold text-[#475569]">
                          {entry.batch}
                        </td>

                        {/* League Tier */}
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[10px] font-black ${
                              entry.rank === 1
                                ? "bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]/40"
                                : entry.rank <= 3
                                ? "bg-[#f1f5f9] text-[#475569] border border-[#94a3b8]/40"
                                : entry.rank <= 10
                                ? "bg-[#e0f2fe] text-[#007fb8] border border-[#007fb8]/30"
                                : "bg-[#edf2f3] text-[#60768a]"
                            }`}
                          >
                            {entry.tier}
                          </span>
                        </td>

                        {/* System Points Only */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3.5 py-1.5 font-black text-[#007fb8]">
                            <Flame size={15} className="text-[#0ac9e8]" />
                            <span className="text-sm">{entry.totalPoints} pts</span>
                          </div>
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
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-4 sm:p-6 shadow-xs">
            <h3 className="text-base sm:text-lg font-black text-[#102c45]">Personalized Progress Evaluations</h3>
            <p className="text-[11px] sm:text-xs text-[#60768a] mt-0.5">
              Verified teacher recommendations, demonstrated strengths, and focus advice published by teacher Evon Aravinda.
            </p>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              {evaluations.length === 0 ? (
                <div className="text-center py-10 sm:py-12 text-[#60768a]">
                  <Award size={32} className="mx-auto mb-2 text-[#94a3b8]" />
                  <p className="font-bold text-xs sm:text-sm">No teacher remarks recorded yet.</p>
                  <p className="text-[11px] sm:text-xs">Your teacher will publish personalized reviews after upcoming model papers.</p>
                </div>
              ) : (
                evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-[#edf2f3]/40 p-4 sm:p-6 space-y-4 sm:space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cddce5]/60 pb-3 sm:pb-4">
                      <div>
                        <span className="text-[11px] sm:text-xs font-bold text-[#007fb8]">{ev.paperOrTerm}</span>
                        <h4 className="text-sm sm:text-base font-black text-[#102c45] mt-0.5">
                          Progress Assessment Report
                        </h4>
                      </div>
                      <span className="rounded-full bg-[#e8f7f2] border border-[#38d995]/40 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-black text-[#159366] self-start sm:self-auto">
                        Performance: {ev.performanceGrade}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="rounded-2xl border border-[#38d995]/50 bg-[#e8f7f2]/60 p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                        <span className="text-[11px] sm:text-xs font-black text-[#159366] uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 size={13} /> Demonstrated Strengths
                        </span>
                        <ul className="list-disc pl-4 text-xs font-semibold text-[#102c45] space-y-1">
                          {ev.strengths.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-[#0ac9e8]/40 bg-[#e0f7fa]/60 p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                        <span className="text-[11px] sm:text-xs font-black text-[#008dc4] uppercase tracking-wider flex items-center gap-1.5">
                          <Target size={13} /> Areas for Targeted Growth
                        </span>
                        <ul className="list-disc pl-4 text-xs font-semibold text-[#102c45] space-y-1">
                          {ev.weaknesses.map((w) => (
                            <li key={w}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#cddce5] bg-white p-3.5 sm:p-4 space-y-1 sm:space-y-1.5 shadow-xs">
                      <span className="text-[11px] sm:text-xs font-bold text-[#60768a]">
                        Teacher Remarks by Evon Aravinda:
                      </span>
                      <p className="text-xs font-bold text-[#102c45] leading-relaxed italic">
                        &ldquo;{ev.teacherRemarks}&rdquo;
                      </p>
                      {ev.recommendedAction && (
                        <p className="mt-1.5 text-xs font-bold text-[#007fb8]">
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

      {/* 4. SUBVIEW: POINTS FORMULA */}
      {activeSubView === "analytics" && (
        <div className="rounded-2xl sm:rounded-3xl border border-[#cddce5] bg-white p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#102c45]">How System Leaderboard Points are Calculated</h3>
            <p className="text-[11px] sm:text-xs text-[#60768a] mt-0.5">
              Individual test results remain confidential. All students are ranked solely by overall points earned across exams, quizzes, and teacher evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
            <div className="rounded-2xl border border-[#007fb8]/30 bg-[#e0f2fe]/40 p-4 sm:p-5 space-y-1.5 sm:space-y-2">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-[#007fb8] text-white">
                <BookOpen size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#102c45]">1. Model Paper Exams</h4>
              <p className="text-[11px] sm:text-xs text-[#475569] leading-relaxed">
                Marks scored in each paper class exam convert directly to points (e.g. 92 marks = <strong>+92 points</strong>).
              </p>
            </div>

            <div className="rounded-2xl border border-[#159366]/30 bg-[#e8f7f2]/50 p-4 sm:p-5 space-y-1.5 sm:space-y-2">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-[#159366] text-white">
                <HelpCircle size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#102c45]">2. Interactive Quizzes</h4>
              <p className="text-[11px] sm:text-xs text-[#475569] leading-relaxed">
                Online multiple-choice questions provide high-frequency revision with a <strong>5x Multiplier</strong> per correct score.
              </p>
            </div>

            <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#fef3c7]/40 p-4 sm:p-5 space-y-1.5 sm:space-y-2">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-[#f59e0b] text-white">
                <Award size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#102c45]">3. Teacher Evaluation Bonus</h4>
              <p className="text-[11px] sm:text-xs text-[#475569] leading-relaxed">
                Consistent attendance and active participation award up to <strong>+60 bonus points</strong> from teacher Evon Aravinda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Personal Score Details Modal (For Logged-in Student Only) */}
      {showMyScoreModal && currentStudentEntry && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#cddce5] bg-white p-5 sm:p-6 shadow-2xl space-y-5 sm:space-y-6">
            <button
              type="button"
              onClick={() => setShowMyScoreModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 flex size-8 items-center justify-center rounded-full bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5] hover:text-[#102c45] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Student Header */}
            <div className="flex items-center gap-3 sm:gap-4 border-b border-[#cddce5]/60 pb-4 sm:pb-5">
              <div className="size-14 sm:size-16 rounded-full bg-[#102c45] text-white flex items-center justify-center text-lg sm:text-xl font-black border-2 border-white shadow-md overflow-hidden shrink-0">
                {currentStudentEntry.avatarUrl ? (
                  <Image src={currentStudentEntry.avatarUrl} alt={currentStudentEntry.fullName} width={64} height={64} className="size-full object-cover" />
                ) : (
                  currentStudentEntry.fullName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-[#102c45] truncate">{currentStudentEntry.fullName}</h3>
                  <span className="rounded-full bg-[#007fb8] text-white px-2 py-0.5 text-[9px] font-black">
                    Rank #{currentStudentEntry.rank}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#60768a] mt-0.5 truncate">
                  Index: <strong className="text-[#102c45]">{currentStudentEntry.indexNo}</strong> &bull; {currentStudentEntry.school}
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-[#007fb8]">{currentStudentEntry.batch}</p>
              </div>
            </div>

            {/* Core KPI Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
              <div className="rounded-2xl border border-[#007fb8]/30 bg-[#e0f2fe]/50 p-2.5 sm:p-3">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-[#60768a] uppercase">Total Points</span>
                <p className="text-base sm:text-lg font-black text-[#007fb8] mt-0.5">{currentStudentEntry.totalPoints} pts</p>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-2.5 sm:p-3">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-[#60768a] uppercase">Exam Average</span>
                <p className="text-base sm:text-lg font-black text-[#102c45] mt-0.5">{currentStudentEntry.avgExamScore}%</p>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-2.5 sm:p-3">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-[#60768a] uppercase">Quiz Accuracy</span>
                <p className="text-base sm:text-lg font-black text-[#159366] mt-0.5">{currentStudentEntry.quizAccuracy}%</p>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-2.5 sm:p-3">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-[#60768a] uppercase">Evaluations</span>
                <p className="text-base sm:text-lg font-black text-[#f59e0b] mt-0.5">{currentStudentEntry.evaluationsCount}</p>
              </div>
            </div>

            {/* Exam Papers History */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-[#102c45] flex items-center gap-1.5 sm:gap-2">
                <BookOpen size={15} className="text-[#007fb8]" />
                Your Exam Papers History
              </h4>
              {currentStudentEntry.recentExamScores.length === 0 ? (
                <p className="text-xs text-[#94a3b8] italic">No exam records found yet.</p>
              ) : (
                <div className="divide-y divide-[#edf2f3] rounded-2xl border border-[#cddce5] overflow-hidden">
                  {currentStudentEntry.recentExamScores.map((score, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 text-xs bg-white hover:bg-[#f8fafc]">
                      <div>
                        <p className="font-bold text-[#102c45] text-xs">{score.paperTitle}</p>
                        <p className="text-[10px] text-[#60768a]">
                          Part 1: {score.part1} | Part 2: {score.part2} | Rank: #{score.rank}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-black text-[#007fb8]">{score.score} marks</span>
                        <span className="ml-1.5 rounded-md bg-[#e0f2fe] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black text-[#007fb8]">
                          Grade {score.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMyScoreModal(false)}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-2.5 sm:py-3 text-xs font-black uppercase text-white shadow-lg cursor-pointer"
            >
              Close My Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
