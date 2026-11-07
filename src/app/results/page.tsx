"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  ArrowLeft,
  Printer,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Calendar,
  ShieldCheck,
  User,
  FileText,
  CheckCircle2,
  Trophy,
  Star,
  Quote,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JoinModal from "@/components/JoinModal";
import StudentLoginModal from "@/components/StudentLoginModal";
import {
  printNationalResultsPdf,
  printStudentTranscriptPdf,
} from "@/lib/pdfPrintService";
import {
  useCurrentLmsUser,
  getStudentExamResults,
  getLmsPapers,
  getLmsUsers,
  syncPapersFromBackend,
  getNationalResultsFromBackend,
  LMSUser,
  StudentResult,
} from "@/lib/lmsStore";
import { resultsData as initialNationalResults } from "@/data/resultsData";

export default function ResultsPage() {
  const { user: currentUser } = useCurrentLmsUser();
  const [papers, setPapers] = useState(() => getLmsPapers());
  const [allUsers] = useState<LMSUser[]>(() => getLmsUsers());
  const [nationalResults, setNationalResults] = useState<StudentResult[]>(() => initialNationalResults);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(undefined);

  // Tab switcher: "national" (public honor roll, default for everyone) or "student" (model paper scorecard)
  const [activeTab, setActiveTab] = useState<"national" | "student">("national");

  // Admin inspector state
  const [adminSelectedStudentId, setAdminSelectedStudentId] = useState<string>("");

  // Guest student lookup state (by index number or phone)
  const [guestLookupQuery, setGuestLookupQuery] = useState<string>("");
  const [searchedStudent, setSearchedStudent] = useState<LMSUser | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters for national honor roll
  const [selectedGradeTab, setSelectedGradeTab] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025]);
  const [latestExamYear, setLatestExamYear] = useState<number>(2025);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let active = true;
    const refresh = () => setPapers(getLmsPapers());
    refresh();
    syncPapersFromBackend().then(() => {
      if (active) refresh();
    });

    const loadNational = () => {
      getNationalResultsFromBackend().then((res) => {
        if (active && res) {
          if (res.results && res.results.length > 0) {
            setNationalResults(res.results);
          }
          if (res.availableYears && res.availableYears.length > 0) {
            setAvailableYears(res.availableYears);
          }
          if (res.latestYear) {
            setLatestExamYear(res.latestYear);
          }
        }
      });
    };

    loadNational();

    window.addEventListener("lms_papers_change", refresh);
    window.addEventListener("lms_national_results_change", loadNational);
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.removeEventListener("lms_papers_change", refresh);
      window.removeEventListener("lms_national_results_change", loadNational);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const handleOpenJoin = (courseName?: string) => {
    setSelectedCourse(courseName);
    setIsJoinOpen(true);
  };

  // Determine active target student for individual paper results
  const targetStudent: LMSUser | null = useMemo(() => {
    if (currentUser?.role === "student") return currentUser;
    if (currentUser?.role === "admin" && adminSelectedStudentId) {
      return allUsers.find((u) => u.id === adminSelectedStudentId) || null;
    }
    if (searchedStudent) return searchedStudent;
    return null;
  }, [currentUser, adminSelectedStudentId, allUsers, searchedStudent]);

  // Exam records for target student
  const studentExamRecords = useMemo(() => {
    if (!targetStudent) return [];
    return getStudentExamResults(targetStudent, papers);
  }, [targetStudent, papers]);

  // Handle guest lookup by Index No or Phone
  const handleGuestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = guestLookupQuery.trim().toLowerCase();
    setHasSearched(true);
    if (!q) {
      setSearchedStudent(null);
      return;
    }
    const found = allUsers.find(
      (u) =>
        (u.indexNo && u.indexNo.toLowerCase() === q) ||
        (u.phone && u.phone.replace(/\D/g, "") === q.replace(/\D/g, ""))
    );
    setSearchedStudent(found || null);
  };

  // Filtered National Results
  const filteredNationalResults = useMemo(() => {
    return nationalResults.filter((item) => {
      if (selectedYear !== "all") {
        const yr = item.year || 2025;
        if (yr !== selectedYear) return false;
      }

      if (selectedGradeTab !== "all") {
        if (selectedGradeTab === "A9" && item.gradeBadge !== "A9") return false;
        if (selectedGradeTab === "A8" && item.gradeBadge !== "A8") return false;
        if (selectedGradeTab === "A7" && item.gradeBadge !== "A7") return false;
        if (selectedGradeTab === "A" && item.gradeBadge !== "A") return false;
        if (selectedGradeTab === "B" && item.letterGrade !== "B") return false;
        if (selectedGradeTab === "C" && item.letterGrade !== "C") return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSchool = item.school.toLowerCase().includes(q);
        const matchesIndex = (item.indexNo || "").toLowerCase().includes(q);
        return matchesName || matchesSchool || matchesIndex;
      }

      return true;
    });
  }, [nationalResults, selectedYear, selectedGradeTab, searchQuery]);

  // Overall Statistics
  const a9Count = useMemo(
    () => nationalResults.filter((r) => r.gradeBadge === "A9").length,
    [nationalResults]
  );
  const totalCount = nationalResults.length;

  const handlePrintNationalResults = () => {
    printNationalResultsPdf(
      filteredNationalResults,
      selectedGradeTab === "all"
        ? `All Island Distinctions (${selectedYear !== "all" ? selectedYear : "All Years"})`
        : `Distinction Category: ${selectedGradeTab} (${selectedYear !== "all" ? selectedYear : "All Years"})`
    );
  };

  const handlePrintStudentResults = () => {
    if (targetStudent) {
      printStudentTranscriptPdf(targetStudent, papers);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#edf2f3] text-[#102c45]">
      {/* Header */}
      <Header
        onOpenJoin={() => handleOpenJoin("2026/2027 O/L Commerce Registration")}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <main className="py-10 max-sm:py-6">
        <div className="mx-auto w-full max-w-[1240px] px-8 max-sm:px-4">
          {/* Top Navigation Row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/paper-class"
                className="inline-flex items-center gap-2 rounded-full border border-[#a6f4ce] bg-[#edf9f3] px-4 py-2 text-[12px] font-bold text-[#12845b] shadow-xs transition-all hover:bg-[#e0f7eb] hover:shadow-sm"
              >
                <Award size={14} className="text-[#159366]" />
                All Model Papers Series
              </Link>
              <Link
                href="/timetable"
                className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow"
              >
                <Calendar size={14} className="text-[#007fb8]" />
                Class Timetable
              </Link>

              {activeTab === "student" && targetStudent ? (
                <button
                  type="button"
                  onClick={handlePrintStudentResults}
                  className="inline-flex items-center gap-2 rounded-full bg-[#102c45] px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#007fb8] cursor-pointer"
                >
                  <Printer size={14} />
                  Print Marksheet PDF
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePrintNationalResults}
                  className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow cursor-pointer"
                >
                  <Printer size={14} />
                  Print Honor Roll
                </button>
              )}
            </div>
          </div>

          {/* Tab Switcher: National Champions vs Individual Marksheet */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#cddce5] bg-white p-3 shadow-xs print:hidden">
            <div className="inline-flex p-1 bg-[#edf2f3] rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("national")}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all cursor-pointer ${
                  activeTab === "national"
                    ? "bg-[#102c45] text-white shadow-sm"
                    : "text-[#60768a] hover:text-[#102c45]"
                }`}
              >
                <Trophy size={14} className={activeTab === "national" ? "text-[#38d995]" : ""} />
                <span>All-Island National Champions ({totalCount}+)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("student")}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all cursor-pointer ${
                  activeTab === "student"
                    ? "bg-[#102c45] text-white shadow-sm"
                    : "text-[#60768a] hover:text-[#102c45]"
                }`}
              >
                <FileText size={14} className={activeTab === "student" ? "text-[#0ac9e8]" : ""} />
                <span>Check Model Paper Marksheets</span>
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 text-xs font-bold text-[#60768a]">
              <CheckCircle2 size={15} className="text-[#159366]" />
              <span>Public Results Open to All Visitors &bull; No Login Required</span>
            </div>
          </div>

          {/* ========================================================
             ADMIN OVERSIGHT INSPECTOR (WHEN LOGGED IN AS ADMIN)
             ======================================================== */}
          {currentUser && currentUser.role === "admin" && (
            <div className="mb-8 rounded-3xl border-2 border-[#007fb8]/40 bg-[linear-gradient(135deg,#e0f2fe_0%,#f0f9ff_100%)] p-6 shadow-sm print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102c45] px-3 py-0.5 text-[10px] font-black uppercase text-white">
                    <ShieldCheck size={12} className="text-[#38d995]" /> Administrator Oversight Mode
                  </span>
                  <h3 className="text-xl font-black text-[#102c45] mt-1">
                    Student Marksheet Inspector
                  </h3>
                  <p className="text-xs text-[#60768a]">
                    Select any registered candidate to inspect their official scores or switch to the National Results tab to manage distinction achievers.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={adminSelectedStudentId}
                    onChange={(e) => {
                      setAdminSelectedStudentId(e.target.value);
                      if (e.target.value) setActiveTab("student");
                    }}
                    className="rounded-2xl border border-[#007fb8]/40 bg-white px-4 py-2.5 text-xs font-bold text-[#102c45] shadow-sm outline-none focus:border-[#007fb8]"
                  >
                    <option value="">-- Inspect a Registered Student --</option>
                    {allUsers
                      .filter((u) => u.role === "student")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.indexNo || s.phone})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
             TAB 1: NATIONAL DISTINCTION ACHIEVERS (OPEN TO ALL USERS)
             ======================================================== */}
          {activeTab === "national" && (
            <div className="space-y-8 animate-[fadeIn_0.25s_ease-out]">
              {/* HERO BANNER */}
              <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(145deg,#102c45_0%,#0c2944_45%,#007fb8_100%)] p-9 text-white shadow-xl max-sm:p-6">
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
                        National Honor Roll
                      </span>
                      <span className="text-[12px] font-bold tracking-widest text-[#d9edf4] uppercase">
                        G.C.E. O/L Examination
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-5">
                      <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-md shadow-sm">
                        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                          CHAMPIONS IN <br />
                          <span className="text-[#38d995]">
                            {selectedYear !== "all" ? `${selectedYear} O/L` : `${latestExamYear} O/L`}
                          </span>
                        </h2>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-[#d9edf4] leading-relaxed max-w-xl">
                      Official all-island business &amp; accounting studies distinction achievers and 9A distinction holders guided by Evon Aravinda.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-sm:w-full">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                      <div className="text-[32px] font-black text-[#0ac9e8]">
                        {filteredNationalResults.length}+
                      </div>
                      <div className="text-[11px] font-extrabold uppercase text-[#d9edf4]">
                        Distinction Achievers
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
                  </div>
                </div>
              </div>

              {/* FILTERS & SEARCH TOOLBAR */}
              <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs print:hidden">
                <div className="flex flex-col gap-4">
                  {/* Year Tabs */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-[#cddce5]/60 pb-3">
                    <span className="text-xs font-bold text-[#60768a] mr-1">Exam Year:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedYear("all")}
                      className={`rounded-full px-3.5 py-1 text-xs font-black transition-all cursor-pointer ${
                        selectedYear === "all"
                          ? "bg-[#007fb8] text-white shadow-xs"
                          : "bg-[#edf2f3] text-[#102c45] hover:bg-[#cddce5]"
                      }`}
                    >
                      All Results ({nationalResults.length})
                    </button>
                    {availableYears.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setSelectedYear(yr)}
                        className={`rounded-full px-3.5 py-1 text-xs font-black transition-all cursor-pointer ${
                          selectedYear === yr
                            ? "bg-[#007fb8] text-white shadow-xs"
                            : "bg-[#edf2f3] text-[#102c45] hover:bg-[#cddce5]"
                        }`}
                      >
                        {yr} O/L
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full">
                    <Search
                      size={18}
                      className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#007fb8]"
                    />
                    <input
                      type="text"
                      placeholder="Search distinction achievers by student name, school, or index number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-[#cddce5] bg-[#edf2f3] py-2.5 pr-10 pl-10 text-[13px] font-medium text-[#102c45] outline-none focus:border-[#007fb8] focus:bg-white"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-bold text-[#94a3b8] hover:text-[#102c45]"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Grade Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {["all", "A9", "A8", "A7", "A", "B", "C"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSelectedGradeTab(tab)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          selectedGradeTab === tab
                            ? "bg-[#102c45] text-white shadow-xs"
                            : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                        }`}
                      >
                        {tab === "all" ? "All Grades" : `${tab} Distinction`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACHIEVERS CARDS GRID (ALL RESULTS ON ONE PAGE - 3 COLUMNS) */}
              {filteredNationalResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#60768a] px-1">
                    <span>
                      Showing all <strong className="text-[#102c45] font-black">{filteredNationalResults.length}</strong> distinction results
                    </span>
                    <span>All Island Honors</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3.5 max-xl:grid-cols-2 max-sm:grid-cols-1">
                    {filteredNationalResults.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center gap-3.5 rounded-2xl border border-[#d8e2eb] bg-white px-4 py-3.5 shadow-none hover:border-[#007fb8] hover:shadow-xs transition-all"
                      >
                        {/* Left Distinction Badge matching user screenshot */}
                        <div
                          className={`flex size-11 sm:size-12 items-center justify-center rounded-xl font-bold text-sm sm:text-base shrink-0 ${
                            st.gradeBadge === "A9" || st.gradeBadge === "A8" || st.gradeBadge === "A7" || st.gradeBadge === "A"
                              ? "bg-[#e8f7f0] text-[#059669] border border-[#a7f3d0]"
                              : st.letterGrade === "B" || st.gradeBadge === "B"
                              ? "bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {st.gradeBadge || st.letterGrade}
                        </div>

                        {/* Right Student Information matching user screenshot */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-[14.5px] sm:text-[15px] text-[#102a43] truncate leading-tight">
                            {st.name}
                          </h4>
                          <p className="text-[12px] sm:text-[12.5px] text-[#627d98] truncate leading-tight mt-1">
                            {st.school}
                          </p>
                          <div className="text-[11px] sm:text-[11.5px] text-[#829ab1] font-normal leading-tight mt-1">
                            Index: {st.indexNo}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-[#cddce5] bg-white p-12 text-center space-y-3">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#edf2f3] text-[#60768a]">
                    <Search size={24} />
                  </div>
                  <h4 className="text-lg font-black text-[#102c45]">No Achievers Found</h4>
                  <p className="text-xs text-[#60768a] max-w-sm mx-auto">
                    No distinction students matched your active filter or search query. Try choosing another grade badge or clearing your search.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedGradeTab("all");
                      setSelectedYear("all");
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-[#102c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#007fb8] transition-all cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* QUICK LOOKUP PROMPT FOR ENROLLED STUDENTS */}
              <div className="rounded-3xl border border-[#007fb8]/30 bg-[linear-gradient(135deg,#f0f9ff_0%,#e0f2fe_100%)] p-6 shadow-sm print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#102c45] text-[#38d995] shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[#102c45]">
                        Enrolled in Current Paper Classes?
                      </h4>
                      <p className="text-xs text-[#60768a]">
                        Look up your monthly model paper marksheet, rank in class, and teacher evaluation comments.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("student")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#102c45] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#007fb8] cursor-pointer transition-all"
                  >
                    <span>Check Model Exam Marksheet</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
             TAB 2: INDIVIDUAL STUDENT MODEL PAPER SCORECARD
             ======================================================== */}
          {activeTab === "student" && (
            <div className="space-y-8 animate-[fadeIn_0.25s_ease-out]">
              {/* If target student identified (either logged-in or searched) */}
              {targetStudent ? (
                <div className="space-y-8">
                  {/* STUDENT PERSONAL HERO BANNER */}
                  <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(145deg,#102c45_0%,#0c2944_45%,#007fb8_100%)] p-8 sm:p-9 text-white shadow-xl">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#0ac9e8]/25 blur-3xl"
                    />

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#38d995] px-3.5 py-1 text-[11px] font-black tracking-wider text-[#0c2944] uppercase shadow-xs">
                            <ShieldCheck size={13} />
                            Candidate Marksheet
                          </span>
                          <span className="text-[12px] font-bold tracking-widest text-[#d9edf4] uppercase">
                            Official Model Exam Record
                          </span>
                        </div>

                        <h1 className="mt-3 text-3xl sm:text-4xl font-black text-white">
                          {targetStudent.fullName}
                        </h1>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#d9edf4]">
                          <div>
                            Index No:{" "}
                            <strong className="font-mono text-white text-sm bg-white/10 px-2 py-0.5 rounded-md border border-white/20">
                              {targetStudent.indexNo || "Registered"}
                            </strong>
                          </div>
                          <div>&bull;</div>
                          <div>School: {targetStudent.school || "Commerce Student"}</div>
                          <div>&bull;</div>
                          <div>Batch: {targetStudent.batch || "2026 O/L Revision"}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handlePrintStudentResults}
                          className="inline-flex items-center gap-2 rounded-full bg-[#0ac9e8] px-5 py-2.5 text-xs font-black text-[#06314b] shadow-md hover:bg-[#38d995] cursor-pointer transition-all"
                        >
                          <Printer size={14} />
                          Print Official Marksheet
                        </button>
                        {searchedStudent && !currentUser && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchedStudent(null);
                              setHasSearched(false);
                              setGuestLookupQuery("");
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 cursor-pointer"
                          >
                            Look Up Another Student
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EXAM RESULTS TABLE */}
                  <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-4">
                    <h3 className="text-lg font-black text-[#102c45]">
                      Published Paper Class Results
                    </h3>

                    {studentExamRecords.length > 0 ? (
                      <div className="overflow-x-auto rounded-2xl border border-[#cddce5]">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#cddce5] bg-[#edf2f3]/70 text-[#60768a] font-extrabold uppercase text-[10px]">
                              <th className="py-3 pl-4">Paper</th>
                              <th className="py-3">Date</th>
                              <th className="py-3 text-center">Part 1</th>
                              <th className="py-3 text-center">Part 2</th>
                              <th className="py-3 text-center">Total</th>
                              <th className="py-3 text-center">Grade</th>
                              <th className="py-3 text-center">Rank</th>
                              <th className="py-3 pr-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#cddce5]/50 font-medium">
                            {studentExamRecords.map((rec) => (
                              <tr key={rec.paperId} className="hover:bg-[#f8fafc]">
                                <td className="py-3.5 pl-4 font-bold text-[#102c45]">
                                  {rec.title}
                                </td>
                                <td className="py-3.5 text-[#60768a]">
                                  {rec.month} {rec.year}
                                </td>
                                <td className="py-3.5 text-center font-bold text-[#102c45]">
                                  {rec.part1Score}/40
                                </td>
                                <td className="py-3.5 text-center font-bold text-[#102c45]">
                                  {rec.part2Score}/60
                                </td>
                                <td className="py-3.5 text-center">
                                  <span className="font-black text-base text-[#102c45]">
                                    {rec.totalScore}
                                  </span>
                                  <span className="text-[10px] text-[#94a3b8]">/100</span>
                                </td>
                                <td className="py-3.5 text-center">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 font-black text-[11px] ${
                                      rec.grade === "A"
                                        ? "bg-[#e8f7f2] text-[#159366]"
                                        : rec.grade === "B"
                                        ? "bg-[#e0f2fe] text-[#007fb8]"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    Grade {rec.grade}
                                  </span>
                                </td>
                                <td className="py-3.5 text-center font-black text-[#007fb8]">
                                  #{rec.rank}
                                </td>
                                <td className="py-3.5 pr-4 font-bold text-[#159366]">
                                  {rec.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 p-8 text-center space-y-2">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#007fb8] mb-2">
                          <FileText size={22} />
                        </div>
                        <h4 className="text-base font-black text-[#102c45]">
                          Student Profile Registered &amp; Active
                        </h4>
                        <p className="text-xs text-[#60768a] max-w-md mx-auto leading-relaxed">
                          Your profile is active with Index Number{" "}
                          <strong className="font-mono text-[#102c45]">
                            {targetStudent.indexNo || "Registered"}
                          </strong>.
                          Your monthly model paper marks will appear here immediately once teacher grading is published.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* GUEST LOOKUP FORM (SEARCH BY INDEX NUMBER OR PHONE) */
                <div className="rounded-3xl border border-[#cddce5] bg-white p-8 sm:p-10 text-center shadow-sm space-y-6">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#007fb8]">
                    <Search size={26} />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-2xl font-black text-[#102c45]">
                      Search Model Exam Marksheet
                    </h3>
                    <p className="text-xs text-[#60768a] leading-relaxed">
                      Enter your <strong>Student Index Number</strong> or registered <strong>Mobile Phone</strong> to view your monthly scores and class ranking.
                    </p>
                  </div>

                  <form onSubmit={handleGuestSearch} className="max-w-md mx-auto flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 53560574 or 0771234567"
                      value={guestLookupQuery}
                      onChange={(e) => setGuestLookupQuery(e.target.value)}
                      className="flex-1 rounded-2xl border border-[#cddce5] bg-[#edf2f3] px-4 py-3 text-xs font-bold text-[#102c45] outline-none focus:border-[#007fb8] focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="rounded-2xl bg-[#102c45] px-6 py-3 text-xs font-bold text-white hover:bg-[#007fb8] transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      Find Scores
                    </button>
                  </form>

                  {hasSearched && !searchedStudent && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 max-w-md mx-auto text-xs text-amber-800 space-y-1">
                      <p className="font-bold">No candidate matched &ldquo;{guestLookupQuery}&rdquo;.</p>
                      <p className="text-[11px] text-amber-700">
                        Please verify your index number, or sign in to your student account below.
                      </p>
                    </div>
                  )}

                  <div className="border-t border-[#f1f5f9] pt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsLoginOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-5 py-2.5 text-xs font-bold text-[#102c45] hover:border-[#007fb8] hover:text-[#007fb8] cursor-pointer transition-all"
                    >
                      <User size={14} />
                      <span>Sign In with Password</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("national")}
                      className="inline-flex items-center gap-2 rounded-full bg-[#102c45] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#007fb8] cursor-pointer transition-all"
                    >
                      <Trophy size={14} className="text-[#38d995]" />
                      <span>View All-Island National Champions</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOTTOM REGISTRATION CTA */}
          <div className="mt-14 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#102c45_0%,#164466_50%,#007fb8_100%)] p-8 text-white shadow-xl print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-[680px]">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-[11px] font-black tracking-wider uppercase backdrop-blur-md">
                  <GraduationCap size={14} />
                  2026 / 2027 NEW BATCH REGISTRATIONS
                </div>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Be the Next O/L Commerce Champion
                </h3>
                <p className="mt-1.5 text-xs text-[#cddce5] leading-relaxed">
                  Enroll in Evon Aravinda&apos;s physical paper classes at Sakya, Science Image, Sipsara, Maxford, Vishwa, or live islandwide Zoom sessions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenJoin("2026/2027 O/L Commerce Registration")}
                className="inline-flex items-center gap-2 rounded-full bg-[#0ac9e8] px-6 py-3 text-xs font-black text-[#06314b] shadow-lg hover:bg-[#38d995] active:scale-95 transition-all cursor-pointer"
              >
                <span>Register for 2026 / 2027 Batches</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenLogin={() => setIsLoginOpen(true)}
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
        onOpenLogin={() => {
          setIsJoinOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenJoin={() => {
          setIsLoginOpen(false);
          setIsJoinOpen(true);
        }}
      />
    </div>
  );
}
