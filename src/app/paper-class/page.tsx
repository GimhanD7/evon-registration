"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  ArrowLeft,
  Printer,
  Sparkles,
  GraduationCap,
  X,
  ShieldCheck,
  Award,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JoinModal from "@/components/JoinModal";
import StudentLoginModal from "@/components/StudentLoginModal";
import {
  PaperClassItem,
  PaperStudentResult,
} from "@/data/paperClassData";
import { printExamResultsPdf } from "@/lib/pdfPrintService";
import { LMSPaper } from "@/data/lmsData";
import {
  useCurrentLmsUser,
  getCombinedModelPapers,
  syncPapersFromBackend,
} from "@/lib/lmsStore";

export default function PaperClassResultsPage() {
  const { user: currentUser } = useCurrentLmsUser();
  const [papers, setPapers] = useState<PaperClassItem[]>(() => getCombinedModelPapers());
  const [selectedPaperId, setSelectedPaperId] = useState<string>("paper-01");
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(
    undefined
  );

  const [selectedStudentForModal, setSelectedStudentForModal] = useState<{
    student: PaperStudentResult;
    paper: PaperClassItem;
  } | null>(null);

  useEffect(() => {
    const refresh = () => setPapers(getCombinedModelPapers());
    refresh();
    syncPapersFromBackend().then(() => refresh());

    window.addEventListener("lms_papers_change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("lms_papers_change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const handleOpenJoin = (courseName?: string) => {
    setSelectedCourse(courseName || "2026 O/L Speed Revision & Paper Class");
    setIsJoinOpen(true);
  };

  // Active selected paper
  const activePaper = useMemo(() => {
    if (selectedPaperId === "all") return papers[0];
    return papers.find((p) => p.id === selectedPaperId) || papers[0];
  }, [selectedPaperId, papers]);

  // Logged-in student's personal score in active paper
  const myResult = useMemo(() => {
    if (!currentUser || !activePaper) return null;
    const userIndex = (currentUser.indexNo || "").trim().toLowerCase();
    const userName = currentUser.fullName.trim().toLowerCase();
    return (activePaper.results || []).find((r) => {
      const rIdx = (r.indexNo || "").trim().toLowerCase();
      const rName = (r.name || "").trim().toLowerCase();
      return (userIndex && rIdx === userIndex) || (userName && rName === userName);
    });
  }, [currentUser, activePaper]);

  const handlePrint = () => {
    if (activePaper) {
      printExamResultsPdf(activePaper as unknown as LMSPaper);
    }
  };

  // Top 3 Students of the active paper for the Podium
  const top3Students = useMemo(() => {
    if (!activePaper || !activePaper.results) return [];
    return activePaper.results.filter((r) => r.rank <= 3).sort((a, b) => a.rank - b.rank);
  }, [activePaper]);

  // Overall statistics
  const totalStudentsEvaluated = useMemo(() => {
    return papers.reduce((acc, p) => acc + p.totalCandidates, 0);
  }, [papers]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#edf2f3] text-[#102c45]">
      {/* Navigation Header */}
      <Header
        onOpenJoin={() =>
          handleOpenJoin("2026 O/L Speed Revision & Paper Class")
        }
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <main className="py-8 max-sm:py-5">
        <div className="mx-auto w-full max-w-[1240px] px-6 max-sm:px-4">
          
          {/* Top Quick Actions Row */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-xs transition-all hover:border-[#007fb8] hover:text-[#007fb8]"
              >
                <ArrowLeft size={14} />
                Back to Home
              </Link>
              <Link
                href="/results"
                className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-xs transition-all hover:border-[#007fb8] hover:text-[#007fb8]"
              >
                <Trophy size={14} className="text-[#f59e0b]" />
                All-Island O/L Results
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-xs transition-all hover:border-[#007fb8] hover:text-[#007fb8]"
              >
                <Printer size={14} />
                Print PDF
              </button>
            </div>
          </div>

          {/* Hero Banner: Strictly Brand Theme */}
          <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(145deg,#102c45_0%,#0c2944_50%,#007fb8_100%)] p-8 text-white shadow-[0_16px_45px_-12px_rgba(16,44,69,0.35)] max-sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#0ac9e8]/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-[#38d995]/20 blur-3xl"
            />

            <div className="relative z-10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#a6f4ce] backdrop-blur-md">
                <Sparkles size={14} className="text-[#38d995]" />
                Official Paper Class Results &amp; Champions Portal
              </div>

              <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Paper-Wise{" "}
                    <span className="bg-[linear-gradient(135deg,#38d995_0%,#0ac9e8_100%)] bg-clip-text text-transparent">
                      Highest Marks
                    </span>{" "}
                    &amp; Champions
                  </h1>
                  <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#cddce5] sm:text-sm">
                    Review islandwide model paper assessments with strictly audited
                    government marking schemes. Top 3 student champions are publicly
                    honored below.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenJoin()}
                      className="inline-flex items-center gap-2 rounded-full bg-[#38d995] px-5 py-2.5 text-xs font-black text-[#0c2944] shadow-md transition-all hover:bg-[#2fc483] hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <GraduationCap size={15} />
                      Join Next Paper Class
                    </button>
                  </div>
                </div>

                {/* Right Hero Metric Card */}
                <div className="lg:col-span-4">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#a6f4ce]">
                        Peak Achievement
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f59e0b]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#fbbf24]">
                        <Trophy size={11} /> 100/100 Perfect
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                        100
                      </span>
                      <span className="text-xl font-bold text-[#cddce5]">
                        / 100
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#e0eee7]">
                      Full marks achieved in Islandwide Model Paper #1 with flawless MCQ (40/40) &amp; Essay (60/60).
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#cddce5]">
                      <span>Total Scripts Graded:</span>
                      <span className="font-extrabold text-white">
                        {totalStudentsEvaluated.toLocaleString()}+ Islandwide
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Paper Navigation Tabs */}
          <div className="mt-6 flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-thin">
            <div className="flex items-center gap-2">
              {papers.map((paper) => {
                const isSelected = selectedPaperId === paper.id;
                return (
                  <button
                    key={paper.id}
                    type="button"
                    onClick={() => setSelectedPaperId(paper.id)}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0c2944] text-white shadow-sm ring-2 ring-[#38d995]"
                        : "border border-[#cddce5] bg-white text-[#60768a] hover:border-[#007fb8] hover:text-[#102c45]"
                    }`}
                  >
                    <span>{paper.paperNumber}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        isSelected
                          ? "bg-[#38d995] text-[#0c2944]"
                          : "bg-[#edf2f3] text-[#159366]"
                      }`}
                    >
                      Top: {paper.highestMark}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LOGGED IN STUDENT'S PERSONAL RESULT BANNER */}
          {myResult && activePaper && (
            <div className="mt-6 rounded-3xl border-2 border-[#159366]/40 bg-[linear-gradient(135deg,#edf9f3_0%,#e0f7eb_100%)] p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#159366] text-white shadow-md">
                    <Award size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#159366] bg-white px-3 py-0.5 rounded-full border border-[#159366]/30">
                      Your Verified Score • {activePaper.paperNumber}
                    </span>
                    <h3 className="text-xl font-black text-[#102c45] mt-1">{myResult.name}</h3>
                    <p className="text-xs text-[#60768a]">
                      Index Number: <strong className="font-mono text-[#007fb8]">{myResult.indexNo}</strong> &bull; {myResult.school}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-center">
                  <div className="rounded-2xl bg-white px-4 py-2 border border-[#a6f4ce] shadow-xs">
                    <span className="text-[10px] font-bold text-[#60768a] block">Part 1 (MCQ)</span>
                    <strong className="text-base font-black text-[#102c45]">{myResult.part1Score}/40</strong>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-2 border border-[#a6f4ce] shadow-xs">
                    <span className="text-[10px] font-bold text-[#60768a] block">Part 2 (Essay)</span>
                    <strong className="text-base font-black text-[#102c45]">{myResult.part2Score}/60</strong>
                  </div>
                  <div className="rounded-2xl bg-white px-5 py-2 border-2 border-[#159366] shadow-xs">
                    <span className="text-[10px] font-black text-[#159366] block">Total Score</span>
                    <strong className="text-2xl font-black text-[#102c45]">{myResult.totalScore}%</strong>
                  </div>
                  <div className="rounded-2xl bg-[#102c45] text-white px-4 py-2 shadow-xs">
                    <span className="text-[10px] font-bold text-[#38d995] block">Rank</span>
                    <strong className="text-lg font-black text-white">#{myResult.rank}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: TOP 3 STUDENTS PODIUM & DETAILS */}
          <section className="mt-8">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf9f3] px-3 py-1 text-xs font-extrabold text-[#159366] border border-[#a6f4ce]">
                  <Trophy size={13} className="text-[#f59e0b]" />
                  Paper Champions Hall
                </span>
                <h2 className="mt-1.5 text-2xl font-black tracking-tight text-[#102c45] sm:text-3xl">
                  {activePaper.paperNumber} - Top 3 Highest Marks Champions
                </h2>
                <p className="mt-1 text-xs text-[#60768a]">
                  These top 3 student performances are publicly honored. Full marks breakdown: MCQ Section I + Structured Section II.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#254967]">
                <span className="inline-block size-2 rounded-full bg-[#38d995]" />
                {activePaper.title}
              </div>
            </div>

            {/* Top 3 Cards Grid - Center 1st Place, Left 2nd Place, Right 3rd Place */}
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
              {/* 2nd Place Card (Silver) */}
              {top3Students[1] && (
                <div className="order-2 md:order-1 flex flex-col justify-between rounded-3xl border-2 border-[#cddce5] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#007fb8] hover:shadow-md">
                  <div>
                    {/* Rank Badge */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#edf2f3] px-3 py-1 text-xs font-black text-[#254967] border border-[#cddce5]">
                        🥈 Rank 2 • 2nd Place
                      </span>
                      <span className="rounded-full bg-[#edf9f3] px-2 py-0.5 text-[10px] font-bold text-[#159366]">
                        Grade A*
                      </span>
                    </div>

                    {/* Student Image with Ring */}
                    <div className="mt-5 flex justify-center">
                      <div className="relative size-28 overflow-hidden rounded-full border-4 border-[#007fb8] shadow-md">
                        <Image
                          src={top3Students[1].avatarImage || "/images/top_student_rank2.jpg"}
                          alt={top3Students[1].name}
                          width={112}
                          height={112}
                          className="size-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-black text-[#102c45]">
                        {top3Students[1].name}
                      </h3>
                      <p className="text-xs font-medium text-[#60768a]">
                        {top3Students[1].school}
                      </p>
                      <div className="mt-1 font-mono text-[11px] font-semibold text-[#007fb8]">
                        Index: {top3Students[1].indexNo}
                      </div>
                    </div>

                    {/* Marks Box */}
                    <div className="mt-4 rounded-2xl border border-[#cddce5] bg-[#edf2f3]/60 p-3.5 text-center">
                      <div className="text-3xl font-black text-[#102c45]">
                        {top3Students[1].totalScore}{" "}
                        <span className="text-xs font-bold text-[#60768a]">/ 100</span>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-4 text-xs font-bold text-[#254967] border-t border-[#cddce5] pt-2">
                        <span>MCQ: {top3Students[1].part1Score}/40</span>
                        <span>•</span>
                        <span>Essay: {top3Students[1].part2Score}/60</span>
                      </div>
                    </div>

                    {top3Students[1].achievement && (
                      <div className="mt-3 text-center text-[11px] font-bold text-[#159366]">
                        ★ {top3Students[1].achievement}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStudentForModal({
                        student: top3Students[1],
                        paper: activePaper,
                      })
                    }
                    className="mt-5 w-full rounded-full border border-[#007fb8] bg-white py-2 text-xs font-bold text-[#007fb8] transition-colors hover:bg-[#007fb8] hover:text-white cursor-pointer"
                  >
                    View Scorecard
                  </button>
                </div>
              )}

              {/* 1st Place Card (Gold Centerpiece) */}
              {top3Students[0] && (
                <div className="order-1 md:order-2 relative flex flex-col justify-between rounded-3xl border-2 border-[#159366] bg-[linear-gradient(180deg,#ffffff_0%,#edf9f3_100%)] p-6 shadow-lg ring-2 ring-[#38d995]/50 transition-all hover:-translate-y-1">
                  {/* Gold Ribbon */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[linear-gradient(135deg,#f59e0b_0%,#d97706_100%)] px-4 py-0.5 text-[11px] font-black text-white shadow-md flex items-center gap-1.5">
                    <Trophy size={13} />
                    PAPER CHAMPION 1ST
                  </div>

                  <div>
                    {/* Header */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-black text-[#d97706] border border-[#f59e0b]/40">
                        🥇 Island 1st Rank
                      </span>
                      <span className="rounded-full bg-[#159366] px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                        Grade A*
                      </span>
                    </div>

                    {/* Large Student Image with Ring */}
                    <div className="mt-4 flex justify-center">
                      <div className="relative size-32 overflow-hidden rounded-full border-4 border-[#38d995] shadow-lg ring-4 ring-[#159366]/20">
                        <Image
                          src={top3Students[0].avatarImage || "/images/top_student_rank1.jpg"}
                          alt={top3Students[0].name}
                          width={128}
                          height={128}
                          className="size-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="mt-4 text-center">
                      <h3 className="text-xl font-black text-[#102c45]">
                        {top3Students[0].name}
                      </h3>
                      <p className="text-xs font-medium text-[#60768a]">
                        {top3Students[0].school}
                      </p>
                      <div className="mt-1 font-mono text-[11px] font-bold text-[#159366]">
                        Index: {top3Students[0].indexNo}
                      </div>
                    </div>

                    {/* Marks Box */}
                    <div className="mt-4 rounded-2xl border border-[#a6f4ce] bg-white p-4 text-center shadow-xs">
                      <div className="text-4xl font-black text-[#102c45]">
                        {top3Students[0].totalScore}{" "}
                        <span className="text-xs font-bold text-[#60768a]">/ 100</span>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-4 text-xs font-bold text-[#159366] border-t border-[#edf2f3] pt-2">
                        <span>MCQ: {top3Students[0].part1Score}/40 (Full)</span>
                        <span>•</span>
                        <span>Essay: {top3Students[0].part2Score}/60</span>
                      </div>
                    </div>

                    {top3Students[0].achievement && (
                      <div className="mt-3 text-center text-xs font-black text-[#159366]">
                        ★ {top3Students[0].achievement}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStudentForModal({
                        student: top3Students[0],
                        paper: activePaper,
                      })
                    }
                    className="mt-5 w-full rounded-full bg-[#159366] py-2.5 text-xs font-black text-white shadow-md transition-all hover:bg-[#12845b] hover:shadow-lg cursor-pointer"
                  >
                    View Verified Champion Scorecard
                  </button>
                </div>
              )}

              {/* 3rd Place Card (Bronze) */}
              {top3Students[2] && (
                <div className="order-3 flex flex-col justify-between rounded-3xl border-2 border-[#cddce5] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#007fb8] hover:shadow-md">
                  <div>
                    {/* Rank Badge */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#edf2f3] px-3 py-1 text-xs font-black text-[#254967] border border-[#cddce5]">
                        🥉 Rank 3 • 3rd Place
                      </span>
                      <span className="rounded-full bg-[#edf9f3] px-2 py-0.5 text-[10px] font-bold text-[#159366]">
                        Grade A*
                      </span>
                    </div>

                    {/* Student Image with Ring */}
                    <div className="mt-5 flex justify-center">
                      <div className="relative size-28 overflow-hidden rounded-full border-4 border-[#0ac9e8] shadow-md">
                        <Image
                          src={top3Students[2].avatarImage || "/images/top_student_rank3.jpg"}
                          alt={top3Students[2].name}
                          width={112}
                          height={112}
                          className="size-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-black text-[#102c45]">
                        {top3Students[2].name}
                      </h3>
                      <p className="text-xs font-medium text-[#60768a]">
                        {top3Students[2].school}
                      </p>
                      <div className="mt-1 font-mono text-[11px] font-semibold text-[#0ac9e8]">
                        Index: {top3Students[2].indexNo}
                      </div>
                    </div>

                    {/* Marks Box */}
                    <div className="mt-4 rounded-2xl border border-[#cddce5] bg-[#edf2f3]/60 p-3.5 text-center">
                      <div className="text-3xl font-black text-[#102c45]">
                        {top3Students[2].totalScore}{" "}
                        <span className="text-xs font-bold text-[#60768a]">/ 100</span>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-4 text-xs font-bold text-[#254967] border-t border-[#cddce5] pt-2">
                        <span>MCQ: {top3Students[2].part1Score}/40</span>
                        <span>•</span>
                        <span>Essay: {top3Students[2].part2Score}/60</span>
                      </div>
                    </div>

                    {top3Students[2].achievement && (
                      <div className="mt-3 text-center text-[11px] font-bold text-[#159366]">
                        ★ {top3Students[2].achievement}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStudentForModal({
                        student: top3Students[2],
                        paper: activePaper,
                      })
                    }
                    className="mt-5 w-full rounded-full border border-[#007fb8] bg-white py-2 text-xs font-bold text-[#007fb8] transition-colors hover:bg-[#007fb8] hover:text-white cursor-pointer"
                  >
                    View Scorecard
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Section: Register Call to Action */}
          <section className="mt-12 overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] p-8 text-white shadow-xl sm:p-9">
            <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
              <div>
                <span className="inline-block rounded-full bg-[#38d995]/20 px-3 py-1 text-xs font-bold text-[#a6f4ce]">
                  Batch Admissions Open
                </span>
                <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  Ready to Achieve the Highest Marks in Your School?
                </h3>
                <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#cddce5]">
                  Enroll in the upcoming 2026/2027 O/L Commerce Paper Class &amp;
                  Speed Revision. Printed model papers delivered right to your home.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleOpenJoin("2026 O/L Speed Revision & Paper Class")
                }
                className="shrink-0 rounded-full bg-[#38d995] px-7 py-3.5 text-xs font-black text-[#0c2944] shadow-md transition-all hover:bg-[#2fc483] hover:scale-105 active:scale-95 cursor-pointer"
              >
                Register for Paper Class Today
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenJoin={() =>
          handleOpenJoin("2026 O/L Speed Revision & Paper Class")
        }
      />

      {/* STUDENT SCORECARD / PERFORMANCE CERTIFICATE MODAL */}
      {selectedStudentForModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedStudentForModal(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#cddce5] bg-white p-7 text-[#102c45] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setSelectedStudentForModal(null)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5] hover:text-[#102c45] cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#edf9f3] text-[#159366] border border-[#a6f4ce]">
                <Trophy size={20} />
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#159366]">
                  Official Performance Record
                </span>
                <h4 className="text-base font-black text-[#102c45]">
                  Student Performance Certificate
                </h4>
              </div>
            </div>

            {/* Student Info Box with Photo */}
            <div className="mt-5 rounded-2xl border border-[#cddce5] bg-[#edf2f3]/60 p-4">
              <div className="flex items-center gap-3.5">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full border-2 border-[#159366]">
                  {selectedStudentForModal.student.avatarImage ? (
                    <Image
                      src={selectedStudentForModal.student.avatarImage}
                      alt={selectedStudentForModal.student.name}
                      width={56}
                      height={56}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-[#102c45] text-sm font-bold text-white">
                      {selectedStudentForModal.student.avatarInitials}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="truncate text-base font-black text-[#102c45]">
                    {selectedStudentForModal.student.name}
                  </h5>
                  <p className="truncate text-xs text-[#60768a]">
                    {selectedStudentForModal.student.school}
                  </p>
                  <span className="mt-1 inline-block font-mono text-[10px] font-bold text-[#007fb8]">
                    Index: {selectedStudentForModal.student.indexNo}
                  </span>
                </div>
              </div>
            </div>

            {/* Paper Title & Marks Breakdown */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-[#60768a]">
                Examination:
              </div>
              <div className="text-xs font-bold text-[#102c45]">
                {selectedStudentForModal.paper.paperNumber}:{" "}
                {selectedStudentForModal.paper.title}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-[#cddce5] bg-[#f8fafc] p-3">
                <span className="text-[10px] font-semibold text-[#60768a]">
                  Part I (MCQ)
                </span>
                <div className="mt-1 text-lg font-black text-[#102c45]">
                  {selectedStudentForModal.student.part1Score} / 40
                </div>
              </div>

              <div className="rounded-xl border border-[#cddce5] bg-[#f8fafc] p-3">
                <span className="text-[10px] font-semibold text-[#60768a]">
                  Part II (Essay)
                </span>
                <div className="mt-1 text-lg font-black text-[#102c45]">
                  {selectedStudentForModal.student.part2Score} / 60
                </div>
              </div>

              <div className="rounded-xl border border-[#a6f4ce] bg-[#edf9f3] p-3">
                <span className="text-[10px] font-bold text-[#159366]">
                  Total Mark
                </span>
                <div className="mt-1 text-xl font-black text-[#159366]">
                  {selectedStudentForModal.student.totalScore}%
                </div>
              </div>
            </div>

            {/* Achievement Accolade */}
            <div className="mt-4 rounded-xl bg-[#edf9f3] border border-[#a6f4ce] p-3 text-xs text-[#159366] flex items-center justify-between">
              <span className="font-bold">
                Rank #{selectedStudentForModal.student.rank} in Class
              </span>
              <span className="font-black">
                {selectedStudentForModal.student.achievement || "Distinction Award"}
              </span>
            </div>

            {/* Verified Footer */}
            <div className="mt-5 pt-3.5 border-t border-[#edf2f3] flex items-center justify-between text-xs text-[#60768a]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#159366]" />
                <span className="text-[11px] font-medium">Evon Aravinda Education Verified</span>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0c2944] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#164466] cursor-pointer"
              >
                <Printer size={12} /> Print Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Class Modal */}
      <JoinModal
        key={selectedCourse ?? "paper-class"}
        isOpen={isJoinOpen}
        initialCourse={selectedCourse}
        onClose={() => {
          setIsJoinOpen(false);
          setSelectedCourse(undefined);
        }}
      />

      {/* Main LMS Login Modal */}
      <StudentLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}
