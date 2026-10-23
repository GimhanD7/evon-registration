"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Medal,
  Search,
  ArrowLeft,
  Printer,
  Sparkles,
  School,
  GraduationCap,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Calendar,
  X,
  Star,
  CheckCircle2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JoinModal from "@/components/JoinModal";
import { resultsData } from "@/data/resultsData";

export default function ResultsPage() {
  const [selectedGradeTab, setSelectedGradeTab] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(
    undefined
  );

  const handleOpenJoin = (courseName?: string) => {
    setSelectedCourse(courseName);
    setIsJoinOpen(true);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const uniqueSchools = useMemo(() => {
    const set = new Set<string>();
    resultsData.forEach((r) => set.add(r.school));
    return Array.from(set).sort();
  }, []);

  const filteredResults = useMemo(() => {
    return resultsData.filter((item) => {
      if (selectedGradeTab !== "all") {
        if (selectedGradeTab === "A9" && item.gradeBadge !== "A9") return false;
        if (selectedGradeTab === "A8" && item.gradeBadge !== "A8") return false;
        if (selectedGradeTab === "A7" && item.gradeBadge !== "A7") return false;
        if (selectedGradeTab === "A" && item.gradeBadge !== "A") return false;
        if (selectedGradeTab === "B" && item.letterGrade !== "B") return false;
        if (selectedGradeTab === "C" && item.letterGrade !== "C") return false;
      }

      if (selectedSchool !== "all" && item.school !== selectedSchool) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSchool = item.school.toLowerCase().includes(q);
        const matchesIndex = item.indexNo.toLowerCase().includes(q);
        return matchesName || matchesSchool || matchesIndex;
      }

      return true;
    });
  }, [selectedGradeTab, selectedSchool, searchQuery]);

  const a9Count = resultsData.filter((r) => r.gradeBadge === "A9").length;
  const a8Count = resultsData.filter((r) => r.gradeBadge === "A8").length;
  const a7Count = resultsData.filter((r) => r.gradeBadge === "A7").length;
  const aGradeCount = resultsData.filter((r) => r.gradeBadge === "A").length;
  const bGradeCount = resultsData.filter((r) => r.letterGrade === "B").length;
  const cGradeCount = resultsData.filter((r) => r.letterGrade === "C").length;

  return (
    <div className="min-h-screen bg-[#edf2f3] text-[#102c45]">
      {/* Header */}
      <Header
        onOpenJoin={() => handleOpenJoin("2027 O/L Commerce Foundation Batch")}
      />

      <main className="py-10 max-sm:py-6">
        <div className="mx-auto w-full max-w-[1240px] px-8 max-sm:px-4">
          {/* Top Navigation Row: Back to Home & Print */}
          <div className="mb-6 flex items-center justify-between print:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/timetable"
                className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow"
              >
                <Calendar size={14} className="text-[#007fb8]" />
                View Class Timetable
              </Link>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow"
              >
                <Printer size={14} />
                Print / Save Results
              </button>
            </div>
          </div>

          {/* Hero Banner: User Signature Theme (#102c45, #007fb8, #0ac9e8, #38d995) */}
          <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(145deg,#102c45_0%,#0c2944_45%,#007fb8_100%)] p-9 text-white shadow-[0_16px_45px_-12px_rgba(16,44,69,0.35)] max-sm:p-6">
            {/* Background Ambient Glows */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#0ac9e8]/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-[#38d995]/20 blur-3xl"
            />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-[720px]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0ac9e8] px-3.5 py-1 text-[11px] font-black tracking-wider text-[#06314b] uppercase shadow-xs">
                    <Sparkles size={13} fill="currentColor" />
                    Official Result Sheet
                  </span>
                  <span className="text-[12px] font-bold tracking-widest text-[#d9edf4] uppercase">
                    G.C.E. O/L Examination
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-5">
                  <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-md shadow-sm">
                    <h1 className="text-[clamp(32px,4vw,56px)] leading-[0.98] font-black tracking-[-2px] text-white uppercase max-sm:text-[28px]">
                      CHAMPIONS IN <br />
                      <span className="text-[#38d995]">2025 O/L</span>
                    </h1>
                  </div>

                  {/* Medal Graphic with Theme Accents */}
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-white/30 bg-gradient-to-b from-white/20 to-white/5 p-4 text-white shadow-xl backdrop-blur-md max-sm:hidden">
                    <div className="flex size-14 items-center justify-center rounded-full border-2 border-[#38d995] bg-[#102c45] font-black text-[28px] text-[#38d995] shadow-inner">
                      A
                    </div>
                    <span className="mt-1 text-[9px] font-black tracking-widest uppercase text-[#d9edf4]">
                      TOP ACHIEVERS
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-[15px] leading-[1.7] text-[#e0ecf3]">
                  English Medium Business &amp; Accounting Studies results with{" "}
                  <strong className="text-white">Evon Aravinda</strong>.
                  Celebrating the stellar achievements of 169+ students across
                  Colombo, Gampaha, Kelaniya, Kadawatha, and islandwide.
                </p>
              </div>

              {/* Statistics Counter Cards (Theme Colors) */}
              <div className="grid grid-cols-2 gap-3 max-sm:w-full">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                  <div className="text-[32px] font-black text-[#0ac9e8]">
                    {resultsData.length}+
                  </div>
                  <div className="text-[11px] font-extrabold uppercase text-[#d9edf4]">
                    Total Achievers
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                  <div className="text-[32px] font-black text-[#38d995]">
                    {a9Count}
                  </div>
                  <div className="text-[11px] font-extrabold uppercase text-[#d9edf4]">
                    9A Champions
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                  <div className="text-[32px] font-black text-white">
                    {a8Count + a7Count}
                  </div>
                  <div className="text-[11px] font-extrabold uppercase text-[#d9edf4]">
                    8A &amp; 7A Scorers
                  </div>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                  <div className="text-[32px] font-black text-[#fef08a]">
                    99.4%
                  </div>
                  <div className="text-[11px] font-extrabold uppercase text-[#d9edf4]">
                    Pass Rate
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Filters & Search Row (Theme Colors) */}
          <div className="mt-8 rounded-3xl border border-[#cddce5] bg-white p-6 shadow-[0_6px_25px_-6px_rgba(16,44,69,0.06)] print:hidden">
            <div className="flex flex-col gap-5">
              {/* Search Bar & School Selector */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[280px]">
                  <Search
                    size={18}
                    className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#007fb8]"
                  />
                  <input
                    type="text"
                    placeholder="Search by student name, school, or index number (e.g. Yashodhini, Ananda, 53560574)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#cddce5] bg-[#edf2f3] py-2.5 pr-10 pl-10 text-[13px] font-medium text-[#102c45] outline-none transition-colors focus:border-[#007fb8] focus:bg-white"
                  />
                  {searchQuery.trim() !== "" && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[#60768a] hover:text-[#102c45]"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <School size={16} className="text-[#007fb8]" />
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="rounded-xl border border-[#cddce5] bg-[#edf2f3] px-3.5 py-2.5 text-[12px] font-bold text-[#102c45] outline-none transition-colors focus:border-[#007fb8] focus:bg-white"
                  >
                    <option value="all">
                      All Schools ({uniqueSchools.length})
                    </option>
                    {uniqueSchools.map((sch) => (
                      <option key={sch} value={sch}>
                        {sch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Grade Filter Tabs with Distinct Theme Styling */}
              <div className="border-t border-[#edf2f7] pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[11px] font-extrabold text-[#60768a] uppercase">
                    Categories:
                  </span>
                  {[
                    {
                      id: "all",
                      label: `All (${resultsData.length})`,
                      activeClass:
                        "bg-[#102c45] text-white shadow-md shadow-[#102c45]/20 scale-105",
                      inactiveClass:
                        "border border-[#cddce5] bg-[#edf2f3] text-[#254967] hover:border-[#007fb8] hover:bg-white",
                    },
                    {
                      id: "A9",
                      label: `9A Champions (${a9Count})`,
                      activeClass:
                        "bg-[linear-gradient(135deg,#102c45_0%,#159366_100%)] text-white shadow-md shadow-[#159366]/30 scale-105 border border-[#38d995]",
                      inactiveClass:
                        "border border-[#38d995]/50 bg-[#e8f7f2] text-[#159366] hover:bg-[#d5f3e7]",
                    },
                    {
                      id: "A8",
                      label: `8A Achievers (${a8Count})`,
                      activeClass:
                        "bg-[#007fb8] text-white shadow-md shadow-[#007fb8]/30 scale-105",
                      inactiveClass:
                        "border border-[#cddce5] bg-[#edf2f3] text-[#007fb8] hover:border-[#007fb8] hover:bg-white",
                    },
                    {
                      id: "A7",
                      label: `7A Achievers (${a7Count})`,
                      activeClass:
                        "bg-[#3e70b3] text-white shadow-md scale-105",
                      inactiveClass:
                        "border border-[#cddce5] bg-[#edf2f3] text-[#254967] hover:border-[#3e70b3] hover:bg-white",
                    },
                    {
                      id: "A",
                      label: `A Grades (${aGradeCount})`,
                      activeClass:
                        "bg-[#007fb8] text-white shadow-md scale-105",
                      inactiveClass:
                        "border border-[#cddce5] bg-[#edf2f3] text-[#254967] hover:border-[#007fb8] hover:bg-white",
                    },
                    {
                      id: "B",
                      label: `B Grades (${bGradeCount})`,
                      activeClass:
                        "bg-[#254967] text-white shadow-md scale-105",
                      inactiveClass:
                        "border border-[#cddce5] bg-[#edf2f3] text-[#60768a] hover:bg-white",
                    },
                    {
                      id: "C",
                      label: `C Grades (${cGradeCount})`,
                      activeClass:
                        "bg-[#60768a] text-white shadow-md scale-105",
                      inactiveClass:
                        "border border-[#cddce5] bg-[#edf2f3] text-[#60768a] hover:bg-white",
                    },
                  ].map((tab) => {
                    const isActive = selectedGradeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedGradeTab(tab.id)}
                        className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-all ${
                          isActive ? tab.activeClass : tab.inactiveClass
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Bar Indicator */}
          {(selectedGradeTab !== "all" ||
            selectedSchool !== "all" ||
            searchQuery.trim() !== "") && (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-[#b9e6fe] bg-[#e0f2fe] px-5 py-2.5 text-[13px] text-[#0369a1] print:hidden">
              <div className="flex flex-wrap items-center gap-2 font-semibold">
                <span>Showing:</span>
                <span className="rounded-md bg-white px-2.5 py-0.5 font-bold shadow-xs text-[#102c45]">
                  {filteredResults.length} Students
                </span>
                {selectedGradeTab !== "all" && (
                  <span className="rounded-md bg-white px-2.5 py-0.5 font-bold shadow-xs text-[#102c45]">
                    Category: {selectedGradeTab}
                  </span>
                )}
                {selectedSchool !== "all" && (
                  <span className="rounded-md bg-white px-2.5 py-0.5 font-bold shadow-xs text-[#102c45]">
                    School: {selectedSchool}
                  </span>
                )}
                {searchQuery.trim() !== "" && (
                  <span className="rounded-md bg-white px-2.5 py-0.5 font-bold shadow-xs text-[#102c45]">
                    Search: &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedGradeTab("all");
                  setSelectedSchool("all");
                  setSearchQuery("");
                }}
                className="font-bold underline hover:text-[#0c4a6e]"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Result Cards Grid with Theme Styling */}
          <div className="mt-8 grid grid-cols-3 gap-4.5 max-xl:grid-cols-2 max-sm:grid-cols-1">
            {filteredResults.length > 0 ? (
              filteredResults.map((st) => {
                const is9A = st.gradeBadge === "A9";
                const is8A = st.gradeBadge === "A8";
                const is7A = st.gradeBadge === "A7";
                const isA = st.letterGrade === "A";
                const isB = st.letterGrade === "B";

                return (
                  <div
                    key={st.id}
                    className="flex items-center gap-3.5 rounded-2xl border border-[#cddce5] bg-white p-3.5 shadow-xs transition-all hover:border-[#007fb8] hover:shadow-[0_10px_25px_-5px_rgba(0,127,184,0.18)] hover:-translate-y-0.5"
                  >
                    {/* Big Letter Box with User Theme Colors */}
                    <div
                      className={`relative flex size-[62px] shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
                        is9A
                          ? "bg-[linear-gradient(145deg,#102c45_0%,#0c2944_45%,#159366_100%)] border-2 border-[#38d995]"
                          : is8A
                          ? "bg-[linear-gradient(145deg,#102c45_0%,#007fb8_100%)] border border-[#0ac9e8]/50"
                          : is7A
                          ? "bg-[#102c45] border border-[#007fb8]/40"
                          : isA
                          ? "bg-[#007fb8]"
                          : isB
                          ? "bg-[#254967]"
                          : "bg-[#60768a]"
                      }`}
                    >
                      {/* Star Badge on top right */}
                      <span
                        className={`absolute top-1 right-1 text-[9px] font-black tracking-tight ${
                          is9A
                            ? "text-[#38d995]"
                            : is8A
                            ? "text-[#0ac9e8]"
                            : "text-[#fef08a]"
                        }`}
                      >
                        ★ {st.gradeBadge}
                      </span>

                      {/* Main Letter */}
                      <span className="text-[34px] font-black leading-none tracking-tight">
                        {st.letterGrade}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="truncate text-[14.5px] font-black tracking-tight text-[#102c45]">
                          {st.name}
                        </h3>
                        {is9A && (
                          <span className="shrink-0 rounded-full bg-[#e8f7f2] px-2 py-0.5 text-[9px] font-black text-[#159366] uppercase">
                            9A
                          </span>
                        )}
                      </div>

                      <p className="truncate text-[12px] font-semibold text-[#60768a]">
                        {st.school}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-[#007fb8]">
                        <span className="rounded border border-[#cddce5] bg-[#edf2f3] px-2 py-0.5 text-[#007fb8]">
                          Index No: {st.indexNo || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 rounded-3xl border border-[#cddce5] bg-white p-12 text-center max-xl:col-span-2 max-sm:col-span-1">
                <p className="text-[16px] font-bold text-[#60768a]">
                  No students matched your search criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeTab("all");
                    setSelectedSchool("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-full bg-[#007fb8] px-6 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#007fb8]/30 transition-transform hover:scale-105"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Bottom Banner: Enroll for Next Year (Theme Colors) */}
          <div className="mt-16 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#102c45_0%,#164466_50%,#007fb8_100%)] p-10 text-white shadow-xl print:hidden max-sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-[680px]">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-[11px] font-black tracking-wider uppercase backdrop-blur-md">
                  <GraduationCap size={14} />
                  2026 / 2027 NEW BATCH REGISTRATIONS
                </div>
                <h2 className="mt-3 text-[26px] font-black tracking-tight max-sm:text-[20px]">
                  Be the Next O/L Commerce Champion
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#cddce5]">
                  Join Evon Aravinda&apos;s physical classes at leading
                  institutes (Sakya, Science Image, Sipsara, Maxford, Vishwa,
                  Maxima, Shiksha, Siyoneth) or islandwide live online sessions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenJoin("2026/2027 O/L Commerce Registration")
                  }
                  className="group inline-flex items-center gap-3 rounded-full bg-[#0ac9e8] py-2 pr-2 pl-6 text-[13px] font-black text-[#06314b] shadow-lg transition-transform hover:scale-105 hover:bg-[#38d995]"
                >
                  Register for 2026/2027
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#06314b] text-white transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={18} strokeWidth={2.5} />
                  </span>
                </button>

                <Link
                  href="/timetable"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-[13px] font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  View Class Timetable
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenLogin={() => {}}
        onOpenJoin={() => handleOpenJoin("Results Inquiry")}
      />

      {/* Join Modal */}
      <JoinModal
        key={selectedCourse ?? "general"}
        isOpen={isJoinOpen}
        initialCourse={selectedCourse}
        onClose={() => {
          setIsJoinOpen(false);
          setSelectedCourse(undefined);
        }}
      />
    </div>
  );
}
