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
  Lock,
  User,
  FileText,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JoinModal from "@/components/JoinModal";
import StudentLoginModal from "@/components/StudentLoginModal";
import { resultsData } from "@/data/resultsData";
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
  LMSUser,
} from "@/lib/lmsStore";

export default function ResultsPage() {
  const { user: currentUser } = useCurrentLmsUser();
  const [papers, setPapers] = useState(() => getLmsPapers());
  const [allUsers] = useState<LMSUser[]>(() => getLmsUsers());
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(
    undefined
  );

  // Admin inspector state (allows admin to review any student's individual marksheet)
  const [adminSelectedStudentId, setAdminSelectedStudentId] = useState<string>("");
  const [showNationalPublicResults, setShowNationalPublicResults] = useState(false);

  // Filters for public / national results
  const [selectedGradeTab, setSelectedGradeTab] = useState<string>("all");
  const selectedSchool = "all";
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const refresh = () => setPapers(getLmsPapers());
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
    setSelectedCourse(courseName);
    setIsJoinOpen(true);
  };

  // Determine active student for student-specific results view
  const targetStudent: LMSUser | null = useMemo(() => {
    if (!currentUser) return null;
    if (currentUser.role === "student") return currentUser;
    if (currentUser.role === "admin" && adminSelectedStudentId) {
      return allUsers.find((u) => u.id === adminSelectedStudentId) || null;
    }
    return null;
  }, [currentUser, adminSelectedStudentId, allUsers]);

  // Exam records for the active target student
  const studentExamRecords = useMemo(() => {
    if (!targetStudent) return [];
    return getStudentExamResults(targetStudent, papers);
  }, [targetStudent, papers]);

  // Student metrics
  const studentMetrics = useMemo(() => {
    if (!studentExamRecords || studentExamRecords.length === 0) {
      return {
        avgScore: 0,
        grade: "N/A",
        totalSat: 0,
        highestMark: 0,
        bestPaper: "None",
      };
    }
    const total = studentExamRecords.reduce((acc, r) => acc + r.totalScore, 0);
    const avg = Math.round((total / studentExamRecords.length) * 10) / 10;
    const sorted = [...studentExamRecords].sort(
      (a, b) => b.totalScore - a.totalScore
    );
    const highest = sorted[0];

    let overallGrade = "C";
    if (avg >= 75) overallGrade = "A (Distinction)";
    else if (avg >= 65) overallGrade = "B (Very Good)";
    else if (avg >= 50) overallGrade = "C (Credit Pass)";
    else if (avg >= 35) overallGrade = "S (Ordinary Pass)";
    else overallGrade = "F";

    return {
      avgScore: avg,
      grade: overallGrade,
      totalSat: studentExamRecords.length,
      highestMark: highest.totalScore,
      bestPaper: `${highest.paperNumber} (${highest.title})`,
    };
  }, [studentExamRecords]);

  // Print handler
  const handlePrintStudentResults = () => {
    if (targetStudent) {
      printStudentTranscriptPdf(targetStudent, papers);
    }
  };

  const filteredNationalResults = useMemo(() => {
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

  const handlePrintNationalResults = () => {
    printNationalResultsPdf(
      filteredNationalResults,
      selectedGradeTab === "all"
        ? "All Island Distinctions"
        : `Distinction Category: ${selectedGradeTab}`
    );
  };

  const a9Count = resultsData.filter((r) => r.gradeBadge === "A9").length;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#edf2f3] text-[#102c45]">
      {/* Header */}
      <Header
        onOpenJoin={() => handleOpenJoin("2027 O/L Commerce Foundation Batch")}
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
              {targetStudent ? (
                <button
                  type="button"
                  onClick={handlePrintStudentResults}
                  className="inline-flex items-center gap-2 rounded-full bg-[#102c45] px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#007fb8] cursor-pointer"
                >
                  <Printer size={14} />
                  Print Official Marksheet PDF
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePrintNationalResults}
                  className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow"
                >
                  <Printer size={14} />
                  Print Honor Roll
                </button>
              )}
            </div>
          </div>

          {/* ========================================================
             CASE 1: LOGGED-IN STUDENT (SHOWS ONLY LOGGED-IN STUDENT RESULTS)
             ======================================================== */}
          {currentUser && currentUser.role === "student" && targetStudent && (
            <div className="space-y-8 animate-[fadeIn_0.25s_ease-out]">
              {/* STUDENT PERSONAL HERO BANNER */}
              <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(145deg,#102c45_0%,#0c2944_45%,#007fb8_100%)] p-8 sm:p-9 text-white shadow-xl">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#0ac9e8]/25 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-[#38d995]/20 blur-3xl"
                />

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#38d995] px-3.5 py-1 text-[11px] font-black tracking-wider text-[#0c2944] uppercase shadow-xs">
                        <ShieldCheck size={13} />
                        Personal Student Marksheet
                      </span>
                      <span className="text-[12px] font-bold tracking-widest text-[#d9edf4] uppercase">
                        Confidential Results Record
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
                      <div>
                        Mobile Phone:{" "}
                        <strong className="font-mono text-white">{targetStudent.phone}</strong>
                      </div>
                      <div>&bull;</div>
                      <div>
                        Batch: <strong className="text-white">{targetStudent.batch}</strong>
                      </div>
                      {targetStudent.school && (
                        <>
                          <div>&bull;</div>
                          <div>
                            School: <strong className="text-white">{targetStudent.school}</strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cumulative Score Summary Card */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md text-center min-w-[120px]">
                      <span className="text-[10px] font-black uppercase text-[#d9edf4] block">
                        Average Score
                      </span>
                      <strong className="text-3xl font-black text-[#38d995]">
                        {studentMetrics.avgScore}%
                      </strong>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md text-center min-w-[120px]">
                      <span className="text-[10px] font-black uppercase text-[#d9edf4] block">
                        Standing Grade
                      </span>
                      <strong className="text-xl font-black text-white">
                        {studentMetrics.grade}
                      </strong>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md text-center min-w-[110px]">
                      <span className="text-[10px] font-black uppercase text-[#d9edf4] block">
                        Exams Sat
                      </span>
                      <strong className="text-3xl font-black text-[#0ac9e8]">
                        {studentMetrics.totalSat}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* STUDENT EXAM PAPERS MARKSHEET TABLE */}
              <div className="rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cddce5]/60 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-[#102c45]">
                      Model Examination Scores &amp; Academic Breakdowns
                    </h3>
                    <p className="text-xs text-[#60768a] mt-0.5">
                      Showing results evaluated strictly for Student Index{" "}
                      <strong className="font-mono text-[#007fb8]">{targetStudent.indexNo}</strong>.
                    </p>
                  </div>

                  <Link
                    href="/lms/student"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-4 py-2 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all shadow-2xs"
                  >
                    <span>Open Full LMS Student Dashboard</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {studentExamRecords.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-[#cddce5]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#cddce5] bg-[#edf2f3]/70 text-[#60768a] font-extrabold uppercase text-[10px]">
                          <th className="py-3.5 pl-4">Paper No &amp; Title</th>
                          <th className="py-3.5">Exam Month</th>
                          <th className="py-3.5 text-center">Part 1 (MCQ)</th>
                          <th className="py-3.5 text-center">Part 2 (Essay)</th>
                          <th className="py-3.5 text-center">Total Score</th>
                          <th className="py-3.5 text-center">Grade</th>
                          <th className="py-3.5 text-center">Class Rank</th>
                          <th className="py-3.5">Academic Accolade</th>
                          <th className="py-3.5 pr-4 text-right">Paper</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#cddce5]/50 font-medium">
                        {studentExamRecords.map((rec) => (
                          <tr key={rec.paperId} className="hover:bg-[#edf2f3]/40 transition-colors">
                            <td className="py-3.5 pl-4 font-black text-[#102c45]">
                              <div>{rec.title}</div>
                              <span className="text-[10px] text-[#94a3b8] font-mono font-normal">
                                {rec.paperNumber} &bull; {rec.paperCode}
                              </span>
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
                            <td className="py-3.5 font-bold text-[#159366]">
                              {rec.status}
                            </td>
                            <td className="py-3.5 pr-4 text-right">
                              <Link
                                href="/paper-class"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007fb8] hover:underline"
                              >
                                View Paper &rarr;
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* No records entered yet for this student */
                  <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 p-8 text-center space-y-2">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#007fb8] mb-2">
                      <FileText size={22} />
                    </div>
                    <h4 className="text-base font-black text-[#102c45]">
                      Student Profile Registered &amp; Active
                    </h4>
                    <p className="text-xs text-[#60768a] max-w-md mx-auto leading-relaxed">
                      Your LMS profile is confirmed with Index Number{" "}
                      <strong className="font-mono text-[#102c45]">{targetStudent.indexNo}</strong>.
                      Your model paper scores are currently being graded by the academic team.
                      Marks will automatically appear here once published.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
             CASE 2: ADMIN IS LOGGED IN (ADMIN OVERSIGHT INSPECTOR)
             ======================================================== */}
          {currentUser && currentUser.role === "admin" && (
            <div className="space-y-6 mb-8">
              <div className="rounded-3xl border-2 border-[#007fb8]/40 bg-[linear-gradient(135deg,#e0f2fe_0%,#f0f9ff_100%)] p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102c45] px-3 py-0.5 text-[10px] font-black uppercase text-white">
                      <ShieldCheck size={12} className="text-[#38d995]" /> Administrator Oversight Mode
                    </span>
                    <h3 className="text-xl font-black text-[#102c45] mt-1">
                      Student Marksheet Inspector
                    </h3>
                    <p className="text-xs text-[#60768a]">
                      Select any registered student below to inspect their individual exam marksheet and print their official transcript.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={adminSelectedStudentId}
                      onChange={(e) => setAdminSelectedStudentId(e.target.value)}
                      className="rounded-2xl border border-[#007fb8]/40 bg-white px-4 py-2.5 text-xs font-bold text-[#102c45] shadow-sm outline-none focus:border-[#007fb8]"
                    >
                      <option value="">-- Choose a Registered Student --</option>
                      {allUsers
                        .filter((u) => u.role === "student")
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName} ({s.indexNo || s.phone})
                          </option>
                        ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowNationalPublicResults(!showNationalPublicResults)}
                      className="rounded-2xl border border-[#cddce5] bg-white px-4 py-2.5 text-xs font-bold text-[#60768a] hover:text-[#102c45] shadow-xs cursor-pointer"
                    >
                      {showNationalPublicResults ? "Hide National List" : "View National Honor Roll"}
                    </button>
                  </div>
                </div>
              </div>

              {/* If admin picked a student, show that student's marksheet */}
              {targetStudent && (
                <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#007fb8] uppercase">
                        Active Inspection
                      </span>
                      <h4 className="text-lg font-black text-[#102c45]">
                        {targetStudent.fullName} &bull; Index: {targetStudent.indexNo}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handlePrintStudentResults}
                      className="rounded-full bg-[#102c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#007fb8] cursor-pointer shadow-xs"
                    >
                      <Printer size={13} className="inline mr-1.5" />
                      Print Student Transcript
                    </button>
                  </div>

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
                          {studentExamRecords.map((r) => (
                            <tr key={r.paperId}>
                              <td className="py-3 pl-4 font-bold text-[#102c45]">{r.title}</td>
                              <td className="py-3 text-[#60768a]">{r.month} {r.year}</td>
                              <td className="py-3 text-center font-bold text-[#102c45]">{r.part1Score}/40</td>
                              <td className="py-3 text-center font-bold text-[#102c45]">{r.part2Score}/60</td>
                              <td className="py-3 text-center font-black text-[#102c45]">{r.totalScore}%</td>
                              <td className="py-3 text-center">
                                <span className="rounded-full bg-[#e8f7f2] px-2 py-0.5 font-black text-[#159366] text-[10px]">
                                  {r.grade}
                                </span>
                              </td>
                              <td className="py-3 text-center font-black text-[#007fb8]">#{r.rank}</td>
                              <td className="py-3 pr-4 text-[#159366] font-bold">{r.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-[#60768a] text-center py-4">
                      No examination marks entered yet for this student.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
             CASE 3: GUEST VISITOR (NOT LOGGED IN)
             ======================================================== */}
          {!currentUser && (
            <div className="space-y-8 animate-[fadeIn_0.25s_ease-out]">
              {/* SECURE SIGN-IN GATEWAY FOR EXAM RESULTS */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-[#007fb8]/30 bg-gradient-to-br from-[#ffffff] via-[#f0f9ff] to-[#e0f2fe] p-8 sm:p-10 text-center shadow-lg">
                <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[#102c45] text-[#38d995] shadow-md mb-4 border-2 border-[#007fb8]/40">
                  <Lock size={30} />
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#007fb8] border border-[#007fb8]/20">
                  <ShieldCheck size={14} className="text-[#159366]" />
                  Protected Student Examination Records
                </div>

                <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#102c45]">
                  View Your Official Exam Results
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-[#475569] max-w-xl mx-auto leading-relaxed">
                  Examination results, scorecards, and teacher evaluation marks are private to each registered candidate. Please sign in with your <strong>Mobile Phone</strong> or <strong>Student Index Number</strong> to view your marksheet.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl hover:scale-102 active:scale-95 transition-all cursor-pointer"
                  >
                    <User size={15} />
                    <span>Sign In to Access Your Exam Results</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenJoin()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd5e1] bg-white px-6 py-3.5 text-xs font-bold text-[#102c45] shadow-xs hover:border-[#007fb8] hover:text-[#007fb8] active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles size={14} className="text-[#38d995]" />
                    <span>New Student? Register for Classes</span>
                  </button>
                </div>

                {/* Quick Toggle for Public National Honor Roll */}
                <div className="mt-8 border-t border-[#cddce5]/70 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNationalPublicResults(!showNationalPublicResults)}
                    className="text-xs font-bold text-[#007fb8] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>
                      {showNationalPublicResults
                        ? "Hide Public National Honor Roll"
                        : "Looking for 2024/2025 National O/L Top Achievers? View Public Honor Roll"}
                    </span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
             OPTIONAL: NATIONAL PUBLIC HONOR ROLL
             (Only shown if guest clicks toggle, or admin toggles it)
             ======================================================== */}
          {((!currentUser && showNationalPublicResults) ||
            (currentUser?.role === "admin" && showNationalPublicResults)) && (
            <div className="mt-12 space-y-8 animate-[fadeIn_0.25s_ease-out]">
              {/* Hero Banner for National Achievers */}
              <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(145deg,#102c45_0%,#0c2944_45%,#007fb8_100%)] p-9 text-white shadow-xl max-sm:p-6">
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
                        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase">
                          CHAMPIONS IN <br />
                          <span className="text-[#38d995]">2025 O/L</span>
                        </h2>
                      </div>
                    </div>
                  </div>

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
                  </div>
                </div>
              </div>

              {/* Interactive Filters & Search Row */}
              <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs print:hidden">
                <div className="flex flex-col gap-4">
                  <div className="relative w-full">
                    <Search
                      size={18}
                      className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#007fb8]"
                    />
                    <input
                      type="text"
                      placeholder="Search public honors by student name, school, or index..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-[#cddce5] bg-[#edf2f3] py-2.5 pr-10 pl-10 text-[13px] font-medium text-[#102c45] outline-none focus:border-[#007fb8] focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {["all", "A9", "A8", "A7", "A", "B", "C"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSelectedGradeTab(tab)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          selectedGradeTab === tab
                            ? "bg-[#102c45] text-white"
                            : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                        }`}
                      >
                        {tab === "all" ? "All Grades" : `${tab} Distinction`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* National Honor Cards Grid */}
              <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
                {filteredNationalResults.slice(0, 24).map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-3 rounded-2xl border border-[#cddce5] bg-white p-4 shadow-xs"
                  >
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#edf9f3] text-[#159366] font-black text-base border border-[#a6f4ce]">
                      {st.gradeBadge || st.letterGrade}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#102c45] truncate">
                        {st.name}
                      </h4>
                      <p className="text-xs text-[#60768a] truncate">{st.school}</p>
                      <span className="font-mono text-[10px] text-[#007fb8]">
                        Index: {st.indexNo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Banner: Call to Action */}
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
