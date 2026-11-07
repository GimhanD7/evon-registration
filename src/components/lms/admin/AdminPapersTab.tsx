"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Trophy,
  Plus,
  Upload,
  Search,
  FileSpreadsheet,
  Download,
  Printer,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  Calendar,
  Clock,
  Layers,
  Database,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { LMSPaper, PaperStudentResult } from "@/data/lmsData";
import {
  updateLmsPaperResults,
  updateLmsSingleResult,
  addLmsPaperResult,
  deleteLmsPaperResult,
  deleteLmsPaper,
  seedDatabase,
  syncPapersFromBackend,
  getLmsUsers,
  generateAutoStatus,
} from "@/lib/lmsStore";
import { printExamResultsPdf } from "@/lib/pdfPrintService";

interface AdminPapersTabProps {
  papers: LMSPaper[];
  onOpenAddPaper: () => void;
  onRefresh?: () => void;
}

export default function AdminPapersTab({
  papers,
  onOpenAddPaper,
  onRefresh,
}: AdminPapersTabProps) {
  // View mode: Results Leaderboard or Exam Papers Cards
  const [viewMode, setViewMode] = useState<"leaderboard" | "papers">("leaderboard");

  // Selected Exam
  const [selectedPaperId, setSelectedPaperId] = useState<string>(
    papers[0]?.id || "paper-01"
  );

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScoreFilter, setSelectedScoreFilter] = useState("all");

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Target paper for modals
  const [modalTargetPaperId, setModalTargetPaperId] = useState<string>(
    papers[0]?.id || "paper-01"
  );

  // Manual Add Form State
  const [manualIndexNo, setManualIndexNo] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualSchool, setManualSchool] = useState("");
  const [manualPart1, setManualPart1] = useState<number>(38);
  const [manualPart2, setManualPart2] = useState<number>(54);
  const [manualAchievement, setManualAchievement] = useState("");

  // Edit Student Result State
  const [editingResult, setEditingResult] = useState<PaperStudentResult | null>(null);
  const [editPart1, setEditPart1] = useState<number>(0);
  const [editPart2, setEditPart2] = useState<number>(0);
  const [editName, setEditName] = useState<string>("");
  const [editSchool, setEditSchool] = useState<string>("");
  const [editAchievement, setEditAchievement] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string>("");

  // Upload Excel / CSV State
  interface PreviewResultItem extends Omit<PaperStudentResult, "id" | "rank"> {
    isDbMatched?: boolean;
    isDuplicate?: boolean;
    duplicateReason?: string;
  }

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<PreviewResultItem[]>([]);
  const [uploadMode, setUploadMode] = useState<"replace" | "append">("append");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Database Sync state
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [dbSyncMsg, setDbSyncMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSyncDatabase = async () => {
    setIsSyncingDb(true);
    setDbSyncMsg(null);
    try {
      const res = await seedDatabase();
      if (res.success) {
        const counts = res.counts;
        const countSummary = counts
          ? `${counts.papers} Papers, ${counts.paper_results} Results, ${counts.users} Users saved in MySQL.`
          : "";
        setDbSyncMsg({
          type: "success",
          text: `Database synchronized successfully! ${countSummary}`,
        });
        await syncPapersFromBackend();
        onRefresh?.();
      } else {
        setDbSyncMsg({
          type: "error",
          text: res.message || "Failed to sync with MySQL database. Please ensure MySQL is running in XAMPP.",
        });
      }
    } catch (err: unknown) {
      setDbSyncMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Error connecting to database backend.",
      });
    } finally {
      setIsSyncingDb(false);
      setTimeout(() => setDbSyncMsg(null), 8000);
    }
  };

  // Active Exam
  const activePaper = useMemo(() => {
    return papers.find((p) => p.id === selectedPaperId) || papers[0];
  }, [papers, selectedPaperId]);

  // All results for the active exam
  const examResults: PaperStudentResult[] = useMemo(() => {
    if (!activePaper) return [];
    return activePaper.results || [];
  }, [activePaper]);

  // Top 3 Champions of this exam
  const top3Students = useMemo(() => {
    return examResults.filter((r) => r.rank <= 3).sort((a, b) => a.rank - b.rank);
  }, [examResults]);

  // Filtered leaderboard list
  const filteredResults = useMemo(() => {
    let list = [...examResults];

    // Score filter
    if (selectedScoreFilter !== "all") {
      if (selectedScoreFilter === "100") {
        list = list.filter((r) => r.totalScore === 100);
      } else if (selectedScoreFilter === "95-99") {
        list = list.filter((r) => r.totalScore >= 95 && r.totalScore < 100);
      } else if (selectedScoreFilter === "90-94") {
        list = list.filter((r) => r.totalScore >= 90 && r.totalScore < 95);
      } else if (selectedScoreFilter === "80-89") {
        list = list.filter((r) => r.totalScore >= 80 && r.totalScore < 90);
      } else if (selectedScoreFilter === "below-80") {
        list = list.filter((r) => r.totalScore < 80);
      }
    }

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.school.toLowerCase().includes(q) ||
          r.indexNo.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => a.rank - b.rank);
  }, [examResults, selectedScoreFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (!examResults.length) {
      return { total: 0, highest: 0, average: 0, distinctions: 0 };
    }
    const total = examResults.length;
    const highest = Math.max(...examResults.map((r) => r.totalScore));
    const avg =
      examResults.reduce((sum, r) => sum + r.totalScore, 0) / total;
    const distinctions = examResults.filter(
      (r) => r.grade === "A*" || r.grade === "A"
    ).length;
    return {
      total,
      highest,
      average: Number(avg.toFixed(1)),
      distinctions,
    };
  }, [examResults]);

  // Helper to compute grade from total
  const computeGrade = (total: number): "A*" | "A" | "B" | "C" => {
    if (total >= 95) return "A*";
    if (total >= 75) return "A";
    if (total >= 65) return "B";
    return "C";
  };

  // Open manual modal for a specific paper
  const openManualModalForPaper = (paperId: string) => {
    setModalTargetPaperId(paperId);
    setIsManualModalOpen(true);
  };

  // Auto-detect student profile from database when typing Index No
  const handleManualIndexChange = (val: string) => {
    setManualIndexNo(val);
    const clean = val.trim().toLowerCase();
    if (clean) {
      const allUsers = getLmsUsers();
      const matched = allUsers.find(
        (u) =>
          (u.indexNo && u.indexNo.trim().toLowerCase() === clean) ||
          (u.phone && u.phone.trim().toLowerCase() === clean) ||
          u.id.toLowerCase() === clean ||
          u.id.toLowerCase() === `std-${clean}`
      );
      if (matched) {
        setManualName(matched.fullName);
        if (matched.school) setManualSchool(matched.school);
      }
    }
  };

  // Open upload modal for a specific paper
  const openUploadModalForPaper = (paperId: string) => {
    setModalTargetPaperId(paperId);
    setUploadError("");
    setUploadSuccessMsg("");
    setParsedPreview([]);
    setCsvFile(null);
    setIsUploadModalOpen(true);
  };

  const handleTargetPaperChange = (paperId: string) => {
    setModalTargetPaperId(paperId);
    if (parsedPreview.length > 0) {
      setParsedPreview(markDuplicatesInList(parsedPreview, paperId, uploadMode));
    }
  };

  const handleUploadModeChange = (mode: "append" | "replace") => {
    setUploadMode(mode);
    if (parsedPreview.length > 0) {
      setParsedPreview(markDuplicatesInList(parsedPreview, modalTargetPaperId || selectedPaperId, mode));
    }
  };

  const duplicateRowsCount = useMemo(() => {
    return parsedPreview.filter((r) => r.isDuplicate).length;
  }, [parsedPreview]);

  const uniqueRowsCount = useMemo(() => {
    return parsedPreview.filter((r) => !r.isDuplicate).length;
  }, [parsedPreview]);

  // Re-evaluates duplicate records in parsed preview based on target paper and mode
  const markDuplicatesInList = (
    list: PreviewResultItem[],
    targetPaperId: string,
    mode: "append" | "replace"
  ): PreviewResultItem[] => {
    const targetPaper = papers.find((p) => p.id === targetPaperId);
    const existingIndexMap = new Set(
      (targetPaper?.results || []).map((r) => r.indexNo.trim().toLowerCase())
    );
    const seenInFile = new Set<string>();

    return list.map((item) => {
      const cleanIdx = item.indexNo.trim().toLowerCase();
      let isDuplicate = false;
      let duplicateReason = "";

      if (seenInFile.has(cleanIdx)) {
        isDuplicate = true;
        duplicateReason = "Repeated in upload file";
      } else if (mode === "append" && existingIndexMap.has(cleanIdx)) {
        isDuplicate = true;
        duplicateReason = "Already in this exam";
      }

      if (!isDuplicate) {
        seenInFile.add(cleanIdx);
      }

      return {
        ...item,
        isDuplicate,
        duplicateReason,
      };
    });
  };

  // Check if manual index number already exists in selected paper
  const isManualIndexDuplicate = useMemo(() => {
    const targetId = modalTargetPaperId || selectedPaperId;
    const targetPaper = papers.find((p) => p.id === targetId);
    if (!targetPaper || !manualIndexNo.trim()) return false;
    return (targetPaper.results || []).some(
      (r) => r.indexNo.trim().toLowerCase() === manualIndexNo.trim().toLowerCase()
    );
  }, [papers, modalTargetPaperId, selectedPaperId, manualIndexNo]);

  // Handle Manual Add Submit - prevents duplicate index numbers
  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = modalTargetPaperId || selectedPaperId;
    if (!targetId || !manualName.trim() || !manualIndexNo.trim()) return;

    if (isManualIndexDuplicate) {
      alert(`Student with Index No "${manualIndexNo}" is already in this exam paper. Index numbers cannot be duplicated.`);
      return;
    }

    const p1 = Math.min(40, Math.max(0, Number(manualPart1) || 0));
    const p2 = Math.min(60, Math.max(0, Number(manualPart2) || 0));
    const total = p1 + p2;
    const grade = computeGrade(total);

    const initials = manualName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    addLmsPaperResult(targetId, {
      name: manualName.trim(),
      school: manualSchool.trim() || "Commerce Batch",
      indexNo: manualIndexNo.trim(),
      part1Score: p1,
      part2Score: p2,
      totalScore: total,
      grade,
      achievement: manualAchievement.trim() || generateAutoStatus(total, p1, p2),
      avatarInitials: initials,
    });

    if (onRefresh) onRefresh();

    // Reset & close
    setManualName("");
    setManualIndexNo("");
    setManualSchool("");
    setManualPart1(38);
    setManualPart2(54);
    setManualAchievement("");
    setIsManualModalOpen(false);
  };

  // Open Edit Modal for a Student
  const openEditResultModal = (student: PaperStudentResult) => {
    setEditingResult(student);
    setEditPart1(student.part1Score);
    setEditPart2(student.part2Score);
    setEditName(student.name);
    setEditSchool(student.school || "");
    setEditAchievement(student.achievement || "");
    setEditSuccessMsg("");
  };

  // Handle Save Edit Result
  const handleSaveEditResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    const p1 = Math.min(40, Math.max(0, Number(editPart1) || 0));
    const p2 = Math.min(60, Math.max(0, Number(editPart2) || 0));
    const total = p1 + p2;
    const grade = computeGrade(total);

    setIsSavingEdit(true);
    try {
      updateLmsSingleResult(selectedPaperId, {
        ...editingResult,
        name: editName.trim() || editingResult.name,
        school: editSchool.trim() || editingResult.school,
        part1Score: p1,
        part2Score: p2,
        totalScore: total,
        grade,
        achievement: editAchievement.trim() || generateAutoStatus(total, p1, p2, editingResult.rank),
      });

      setEditSuccessMsg("Marks updated successfully! Recalculating ranks...");
      setTimeout(() => {
        setEditingResult(null);
        setIsSavingEdit(false);
        setEditSuccessMsg("");
        onRefresh?.();
      }, 600);
    } catch {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete Result
  const handleDeleteResult = (student: PaperStudentResult) => {
    if (!activePaper) return;
    if (
      confirm(
        `Are you sure you want to remove ${student.name} (Rank #${student.rank}) from this exam?`
      )
    ) {
      deleteLmsPaperResult(activePaper.id, student.id);
      if (onRefresh) onRefresh();
    }
  };

  // Handle Delete Exam Paper
  const handleDeletePaper = (paper: LMSPaper) => {
    if (
      confirm(
        `Are you sure you want to delete Exam Paper #${paper.paperNumber}: "${paper.title}"?\nThis will remove the exam and all its student results.`
      )
    ) {
      deleteLmsPaper(paper.id);
      if (selectedPaperId === paper.id) {
        const remaining = papers.filter((p) => p.id !== paper.id);
        if (remaining.length > 0) {
          setSelectedPaperId(remaining[0].id);
        }
      }
      if (onRefresh) onRefresh();
    }
  };

  // Download Sample CSV Template (Only Index No, Part 1, and Part 2 needed!)
  const handleDownloadTemplate = () => {
    const templateContent =
      "Index No,Part 1 (MCQ /40),Part 2 (Essay /60)\n" +
      "53914864,38,58\n" +
      "53914865,36,54\n" +
      "53914866,35,50\n" +
      "53914867,34,48\n" +
      "53560574,40,60\n" +
      "53511450,39,57\n" +
      "53884191,37,55\n";

    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "evon_exam_results_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle CSV file selection and parsing with automatic database user retrieval
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");
    setUploadSuccessMsg("");
    if (!file) return;

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");

        if (lines.length < 2) {
          setUploadError("CSV file must have a header row and at least one student data row.");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const getCol = (possibleNames: string[]) => {
          return headers.findIndex((h) =>
            possibleNames.some((p) => h.includes(p))
          );
        };

        const idxIndex = getCol(["index", "candidate", "id"]);
        const idxP1 = getCol(["part 1", "part1", "mcq", "p1"]);
        const idxP2 = getCol(["part 2", "part2", "essay", "p2"]);
        const idxName = getCol(["name", "student", "full name"]);
        const idxSchool = getCol(["school", "college", "institute"]);
        const idxAch = getCol(["achievement", "badge", "award"]);

        const allUsers = getLmsUsers();
        const rawParsed: PreviewResultItem[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (row.length < 2 || !row.some((cell) => cell !== "")) continue;

          // 1. Get Student Index Number
          const indexNo = (idxIndex !== -1 ? row[idxIndex] : row[0]) || "";
          if (!indexNo) continue;

          // 2. Automatically retrieve student profile from system database users
          const cleanIdx = indexNo.trim().toLowerCase();
          const matchedUser = allUsers.find(
            (u) =>
              (u.indexNo && u.indexNo.trim().toLowerCase() === cleanIdx) ||
              (u.phone && u.phone.trim().toLowerCase() === cleanIdx) ||
              u.id.toLowerCase() === cleanIdx ||
              u.id.toLowerCase() === `std-${cleanIdx}`
          );

          const studentName = matchedUser
            ? matchedUser.fullName
            : (idxName !== -1 && row[idxName] ? row[idxName] : `Candidate ${indexNo}`);

          const school = matchedUser && matchedUser.school
            ? matchedUser.school
            : (idxSchool !== -1 && row[idxSchool] ? row[idxSchool] : "Commerce Faculty");

          const avatarImage = matchedUser?.avatarUrl;

          // 3. Get Part 1 (MCQ) & Part 2 (Essay)
          let p1 = idxP1 !== -1 ? Number(row[idxP1]) || 0 : (row[1] !== undefined ? Number(row[1]) || 0 : 35);
          let p2 = idxP2 !== -1 ? Number(row[idxP2]) || 0 : (row[2] !== undefined ? Number(row[2]) || 0 : 50);

          p1 = Math.min(40, Math.max(0, p1));
          p2 = Math.min(60, Math.max(0, p2));
          const total = Math.min(100, Math.max(0, p1 + p2));
          const grade = computeGrade(total);

          const achievement = idxAch !== -1 && row[idxAch]?.trim() ? row[idxAch].trim() : generateAutoStatus(total, p1, p2);
          const initials = studentName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ST";

          rawParsed.push({
            name: studentName,
            indexNo,
            school,
            part1Score: p1,
            part2Score: p2,
            totalScore: total,
            grade,
            achievement: achievement || undefined,
            avatarInitials: initials,
            avatarImage,
            isDbMatched: !!matchedUser,
          });
        }

        if (rawParsed.length === 0) {
          setUploadError("Could not parse any valid student records. Please check the template.");
          return;
        }

        // Apply duplicate detection against target paper and file repeats
        const evaluated = markDuplicatesInList(rawParsed, modalTargetPaperId || selectedPaperId, uploadMode);
        setParsedPreview(evaluated);
      } catch {
        setUploadError("Failed to parse CSV file. Please verify CSV formatting.");
      }
    };
    reader.readAsText(file);
  };

  // Commit CSV results to selected target exam - ONLY unique records are stored, duplicates are ignored!
  const handleCommitUpload = () => {
    const targetId = modalTargetPaperId || selectedPaperId;
    const target = papers.find((p) => p.id === targetId);
    if (!target || !parsedPreview.length) return;

    // Filter out duplicates: only unique records are stored
    const uniqueToImport = parsedPreview.filter((item) => !item.isDuplicate);
    const ignoredDuplicatesCount = parsedPreview.length - uniqueToImport.length;

    if (uniqueToImport.length === 0) {
      setUploadError("All student records in this file are duplicates of existing records and were skipped. No new data to import.");
      return;
    }

    const formattedParsed: PaperStudentResult[] = uniqueToImport.map((item, idx) => ({
      ...item,
      id: `imported-${Date.now()}-${idx}`,
      rank: 1,
    }));

    let finalResults: PaperStudentResult[] = [];
    if (uploadMode === "replace") {
      finalResults = formattedParsed;
    } else {
      const currentList = target.results || [];
      finalResults = [...currentList, ...formattedParsed];
    }

    updateLmsPaperResults(target.id, finalResults);
    if (onRefresh) onRefresh();

    let successText = `Successfully stored ${formattedParsed.length} unique student results to ${target.title}!`;
    if (ignoredDuplicatesCount > 0) {
      successText += ` (${ignoredDuplicatesCount} duplicate index numbers were automatically ignored and not stored).`;
    }

    setUploadSuccessMsg(successText);
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setParsedPreview([]);
      setCsvFile(null);
      setUploadSuccessMsg("");
    }, 2200);
  };

  const handlePrint = () => {
    if (activePaper) {
      printExamResultsPdf(activePaper);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header with Dual View Tabs */}
      <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-xs">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#0ac9e8]/15 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#007fb8]">
              <Trophy size={13} />
              Examination &amp; Results System
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#102c45] tracking-tight">
              Manage Exams &amp; Student Results
            </h2>
            <p className="mt-0.5 text-xs text-[#60768a]">
              Publish monthly model papers, add student results, upload bulk spreadsheets, and view leaderboards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenAddPaper}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-[#007fb8]/20 hover:scale-102 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Publish New Paper</span>
            </button>

            <button
              type="button"
              onClick={() => openUploadModalForPaper(selectedPaperId)}
              className="inline-flex items-center gap-2 rounded-full border border-[#007fb8]/40 bg-[#e0f2fe] px-4 py-2.5 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              <Upload size={14} />
              <span>Upload Excel / CSV</span>
            </button>

            <button
              type="button"
              onClick={() => openManualModalForPaper(selectedPaperId)}
              className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2.5 text-xs font-black text-[#102c45] hover:bg-[#edf2f3] transition-all cursor-pointer shadow-xs"
            >
              <UserCheck size={14} className="text-[#159366]" />
              <span>Add Result Manually</span>
            </button>

            <button
              type="button"
              onClick={handleSyncDatabase}
              disabled={isSyncingDb}
              title="Store and synchronize all papers and exam results with MySQL database (XAMPP)"
              className="inline-flex items-center gap-2 rounded-full border border-[#102c45]/30 bg-[#102c45]/5 px-3.5 py-2.5 text-xs font-black text-[#102c45] hover:bg-[#102c45] hover:text-white transition-all cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <Database size={14} className={isSyncingDb ? "animate-spin text-[#007fb8]" : "text-[#007fb8]"} />
              <span>{isSyncingDb ? "Syncing..." : "Sync DB (MySQL)"}</span>
            </button>
          </div>
        </div>

        {/* Database Status Message Banner */}
        {dbSyncMsg && (
          <div
            className={`mt-4 flex items-center justify-between gap-3 rounded-2xl p-3.5 text-xs font-bold border transition-all ${
              dbSyncMsg.type === "success"
                ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"
                : "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
            }`}
          >
            <div className="flex items-center gap-2">
              {dbSyncMsg.type === "success" ? (
                <CheckCircle2 size={16} className="text-[#159366] shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-[#dc2626] shrink-0" />
              )}
              <span>{dbSyncMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setDbSyncMsg(null)}
              className="p-1 hover:opacity-75 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* View Switcher: Leaderboard vs Exam Papers */}
        <div className="mt-6 pt-4 border-t border-[#cddce5]/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#edf2f3] p-1 rounded-2xl border border-[#cddce5]">
            <button
              type="button"
              onClick={() => setViewMode("leaderboard")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                viewMode === "leaderboard"
                  ? "bg-white text-[#102c45] shadow-xs"
                  : "text-[#60768a] hover:text-[#102c45]"
              }`}
            >
              <Trophy size={14} className={viewMode === "leaderboard" ? "text-[#f59e0b]" : ""} />
              <span>Results Leaderboard</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("papers")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                viewMode === "papers"
                  ? "bg-white text-[#102c45] shadow-xs"
                  : "text-[#60768a] hover:text-[#102c45]"
              }`}
            >
              <Layers size={14} className={viewMode === "papers" ? "text-[#007fb8]" : ""} />
              <span>All Exam Papers ({papers.length})</span>
            </button>
          </div>

          <div className="text-xs font-bold text-[#60768a]">
            {papers.length} Papers Active &bull;{" "}
            {papers.reduce((acc, p) => acc + (p.results?.length || 0), 0)} Total Graded Results
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: ALL EXAM PAPERS GRID (When viewMode === 'papers')
         ========================================================================= */}
      {viewMode === "papers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#102c45] flex items-center gap-2">
              <FileText size={16} className="text-[#007fb8]" />
              Published Model Exam Papers &amp; Worksheets
            </h3>
            <button
              type="button"
              onClick={onOpenAddPaper}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3.5 py-1 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Add New Paper</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {papers.map((p) => {
              const candidateCount = p.results?.length || 0;
              const topScore = p.results?.length ? Math.max(...p.results.map((r) => r.totalScore)) : null;

              return (
                <div
                  key={p.id}
                  className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[#007fb8] transition-all"
                >
                  <div>
                    {/* Header: Paper # and Status */}
                    <div className="flex items-center justify-between text-xs font-bold text-[#60768a]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#007fb8]" />
                        Paper #{p.paperNumber} &bull; {p.month} {p.year}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-[#e8f7f2] px-2.5 py-0.5 text-[10px] text-[#159366] font-black uppercase">
                          {p.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePaper(p)}
                          title="Delete Paper"
                          className="size-6 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Paper Title */}
                    <h4 className="mt-3 text-base font-black text-[#102c45] leading-snug">
                      {p.title}
                    </h4>

                    {/* Metadata */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-[#60768a]">
                      <span>{p.subject}</span>
                      <span>&bull;</span>
                      <span>{p.totalMarks} Marks</span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {p.durationMinutes} Mins
                      </span>
                    </div>

                    {/* Stats pill */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded-xl bg-[#e0f2fe] border border-[#007fb8]/30 px-3 py-1 text-xs font-black text-[#007fb8]">
                        {candidateCount} Candidates Evaluated
                      </span>
                      {topScore !== null && (
                        <span className="rounded-xl bg-[#e8f7f2] border border-[#38d995]/40 px-3 py-1 text-xs font-black text-[#159366] flex items-center gap-1">
                          <Trophy size={12} />
                          Top: {topScore}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3.5 border-t border-[#cddce5]/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaperId(p.id);
                        setViewMode("leaderboard");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-3.5 py-1.5 text-xs font-black text-white hover:opacity-95 cursor-pointer shadow-xs"
                    >
                      <Trophy size={12} />
                      <span>View Results</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openManualModalForPaper(p.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#cddce5] bg-[#edf2f3] px-3 py-1.5 text-[11px] font-bold text-[#102c45] hover:bg-[#e2e8f0] cursor-pointer"
                      >
                        <Plus size={11} /> Add Result
                      </button>
                      <button
                        type="button"
                        onClick={() => openUploadModalForPaper(p.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#007fb8]/30 bg-white px-3 py-1.5 text-[11px] font-bold text-[#007fb8] hover:bg-[#e0f2fe] cursor-pointer"
                      >
                        <Upload size={11} /> Excel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* "+ Publish New Paper" Quick Action Card */}
            <div
              onClick={onOpenAddPaper}
              className="rounded-3xl border-2 border-dashed border-[#cddce5] bg-[#f8fafc] p-6 text-center hover:bg-[#edf2f3]/70 hover:border-[#007fb8] transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] group"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white border border-[#cddce5] text-[#007fb8] group-hover:scale-110 shadow-xs transition-transform">
                <Plus size={24} />
              </div>
              <h4 className="mt-3 text-sm font-black text-[#102c45]">
                Publish Another Exam Paper
              </h4>
              <p className="mt-1 text-xs text-[#60768a] max-w-xs">
                Create Paper #{papers.length + 1} with custom topics, total marks, and exam duration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: RESULTS LEADERBOARD (When viewMode === 'leaderboard')
         ========================================================================= */}
      {viewMode === "leaderboard" && (
        <>
          {/* EXAM SELECTOR DROPDOWN BAR */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Dropdown Left side */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="size-9 rounded-2xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white flex items-center justify-center shadow-xs">
                    <FileText size={18} />
                  </div>
                  <div>
                    <label htmlFor="exam-selector-dropdown" className="text-[10px] font-black uppercase tracking-wider text-[#60768a] block">
                      Select Exam Paper:
                    </label>
                    <span className="text-xs font-black text-[#102c45]">
                      {papers.length} Assessments Available
                    </span>
                  </div>
                </div>

                {/* The Dropdown Select Menu */}
                <div className="relative flex-1 max-w-xl">
                  <select
                    id="exam-selector-dropdown"
                    value={selectedPaperId}
                    onChange={(e) => setSelectedPaperId(e.target.value)}
                    className="w-full appearance-none rounded-2xl border-2 border-[#007fb8]/30 bg-[#edf2f3]/40 hover:bg-white focus:bg-white py-2.5 sm:py-3 pl-4 pr-10 text-xs sm:text-sm font-black text-[#102c45] focus:border-[#007fb8] focus:outline-none focus:ring-4 focus:ring-[#007fb8]/15 transition-all shadow-xs cursor-pointer"
                  >
                    {papers.map((p) => {
                      const count = p.results?.length || 0;
                      return (
                        <option key={p.id} value={p.id} className="text-[#102c45] font-bold py-2">
                          Paper #{p.paperNumber} • {p.month} ({count} Candidate{count === 1 ? "" : "s"} Graded) — {p.title}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#007fb8]">
                    <ChevronDown size={18} />
                  </div>
                </div>

                {/* Quick Prev / Next Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const idx = papers.findIndex((p) => p.id === selectedPaperId);
                      if (idx > 0) setSelectedPaperId(papers[idx - 1].id);
                    }}
                    disabled={papers.findIndex((p) => p.id === selectedPaperId) <= 0}
                    title="Previous Exam"
                    className="size-9 rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 hover:bg-white hover:border-[#007fb8] text-[#102c45] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = papers.findIndex((p) => p.id === selectedPaperId);
                      if (idx >= 0 && idx < papers.length - 1) setSelectedPaperId(papers[idx + 1].id);
                    }}
                    disabled={papers.findIndex((p) => p.id === selectedPaperId) >= papers.length - 1}
                    title="Next Exam"
                    className="size-9 rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 hover:bg-white hover:border-[#007fb8] text-[#102c45] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons Right Side */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openUploadModalForPaper(selectedPaperId)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3.5 py-2 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all cursor-pointer shadow-2xs"
                >
                  <Upload size={13} />
                  <span>Upload Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => openManualModalForPaper(selectedPaperId)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#cddce5] bg-white px-3.5 py-2 text-xs font-bold text-[#102c45] hover:bg-[#edf2f3] hover:border-[#007fb8] transition-all cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  <span>Add Result</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAddPaper}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-3.5 py-2 text-xs font-black text-white hover:opacity-95 transition-all cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  <span>Publish Exam</span>
                </button>
              </div>
            </div>

            {/* Quick overview strip of currently active exam paper */}
            {activePaper && (
              <div className="pt-2 border-t border-[#cddce5]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-xl bg-[#102c45] px-2.5 py-1 text-[11px] font-black text-white">
                    Paper #{activePaper.paperNumber}
                  </span>
                  <span className="font-extrabold text-[#102c45]">
                    {activePaper.title}
                  </span>
                  <span className="text-[#60768a] font-bold">
                    &bull; {activePaper.month} {activePaper.year}
                  </span>
                  <span className="rounded-xl bg-[#e0f2fe] border border-[#007fb8]/30 px-2.5 py-0.5 text-[11px] font-black text-[#007fb8]">
                    {activePaper.results?.length || 0} Candidates Graded
                  </span>
                  {stats.highest > 0 && (
                    <span className="rounded-xl bg-[#e8f7f2] border border-[#38d995]/40 px-2.5 py-0.5 text-[11px] font-black text-[#159366]">
                      Top Mark: {stats.highest}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] font-bold text-[#60768a]">
                  <span>Total: <strong className="text-[#102c45]">{activePaper.totalMarks} Marks</strong></span>
                  <span>&bull;</span>
                  <span>Time: <strong className="text-[#102c45]">{activePaper.durationMinutes} Mins</strong></span>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => setViewMode("papers")}
                    className="text-[#007fb8] hover:underline font-black cursor-pointer inline-flex items-center gap-1"
                  >
                    <Layers size={12} />
                    View All Paper Cards
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TOP 3 STUDENTS PODIUM SHOWCASE */}
          {top3Students.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#102c45] flex items-center gap-2">
                  <Trophy size={16} className="text-[#f59e0b]" />
                  Paper #{activePaper?.paperNumber} Islandwide Champions Podium
                </h3>
                <span className="text-xs font-bold text-[#60768a]">
                  Top 3 Highest Scorers
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {/* 2nd Place Silver Card */}
                {top3Students[1] && (
                  <div className="order-2 md:order-1 rounded-3xl border-2 border-[#cddce5] bg-white p-5 shadow-xs flex flex-col justify-between hover:border-[#007fb8] transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#edf2f3] px-2.5 py-1 text-[11px] font-black text-[#254967] border border-[#cddce5]">
                          🥈 Rank #2 &bull; 2nd Place
                        </span>
                        <span className="rounded-full bg-[#e8f7f2] px-2 py-0.5 text-[10px] font-black text-[#159366]">
                          Grade {top3Students[1].grade}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-3.5">
                        <div className="relative size-14 rounded-2xl border-2 border-[#007fb8] overflow-hidden bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white font-black text-sm flex items-center justify-center shrink-0">
                          {top3Students[1].avatarImage ? (
                            <Image
                              src={top3Students[1].avatarImage}
                              alt={top3Students[1].name}
                              width={56}
                              height={56}
                              className="size-full object-cover"
                            />
                          ) : (
                            top3Students[1].avatarInitials
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-[#102c45] truncate">
                            {top3Students[1].name}
                          </h4>
                          <p className="text-[11px] font-bold text-[#60768a] truncate">
                            {top3Students[1].school}
                          </p>
                          <span className="font-mono text-[10px] font-black text-[#007fb8]">
                            ID: {top3Students[1].indexNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#cddce5]/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#60768a]">
                        MCQ: {top3Students[1].part1Score}/40 &bull; Essay: {top3Students[1].part2Score}/60
                      </span>
                      <span className="text-xl font-black text-[#102c45]">
                        {top3Students[1].totalScore}%
                      </span>
                    </div>
                  </div>
                )}

                {/* 1st Place Gold Centerpiece */}
                {top3Students[0] && (
                  <div className="order-1 md:order-2 rounded-3xl border-2 border-[#f59e0b] bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)] p-6 shadow-md ring-2 ring-[#f59e0b]/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#f59e0b_0%,#d97706_100%)] px-3 py-1 text-[11px] font-black text-white shadow-xs">
                          <Trophy size={13} /> 🥇 Island 1st Champion
                        </span>
                        <span className="rounded-full bg-[#159366] px-2.5 py-0.5 text-[10.5px] font-black text-white">
                          Grade {top3Students[0].grade}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <div className="relative size-16 rounded-2xl border-3 border-[#f59e0b] overflow-hidden bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white font-black text-base flex items-center justify-center shrink-0 shadow-md">
                          {top3Students[0].avatarImage ? (
                            <Image
                              src={top3Students[0].avatarImage}
                              alt={top3Students[0].name}
                              width={64}
                              height={64}
                              className="size-full object-cover"
                            />
                          ) : (
                            top3Students[0].avatarInitials
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-black text-[#102c45] truncate">
                            {top3Students[0].name}
                          </h4>
                          <p className="text-xs font-bold text-[#60768a] truncate">
                            {top3Students[0].school}
                          </p>
                          <span className="font-mono text-xs font-black text-[#d97706]">
                            Index: {top3Students[0].indexNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f59e0b]/30 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#b45309]">
                        MCQ: {top3Students[0].part1Score}/40 (Full) &bull; Essay: {top3Students[0].part2Score}/60
                      </span>
                      <span className="text-2xl font-black text-[#d97706]">
                        {top3Students[0].totalScore}%
                      </span>
                    </div>
                  </div>
                )}

                {/* 3rd Place Bronze Card */}
                {top3Students[2] && (
                  <div className="order-3 rounded-3xl border-2 border-[#cddce5] bg-white p-5 shadow-xs flex flex-col justify-between hover:border-[#007fb8] transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#edf2f3] px-2.5 py-1 text-[11px] font-black text-[#254967] border border-[#cddce5]">
                          🥉 Rank #3 &bull; 3rd Place
                        </span>
                        <span className="rounded-full bg-[#e8f7f2] px-2 py-0.5 text-[10px] font-black text-[#159366]">
                          Grade {top3Students[2].grade}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-3.5">
                        <div className="relative size-14 rounded-2xl border-2 border-[#0ac9e8] overflow-hidden bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white font-black text-sm flex items-center justify-center shrink-0">
                          {top3Students[2].avatarImage ? (
                            <Image
                              src={top3Students[2].avatarImage}
                              alt={top3Students[2].name}
                              width={56}
                              height={56}
                              className="size-full object-cover"
                            />
                          ) : (
                            top3Students[2].avatarInitials
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-[#102c45] truncate">
                            {top3Students[2].name}
                          </h4>
                          <p className="text-[11px] font-bold text-[#60768a] truncate">
                            {top3Students[2].school}
                          </p>
                          <span className="font-mono text-[10px] font-black text-[#0ac9e8]">
                            ID: {top3Students[2].indexNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#cddce5]/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#60768a]">
                        MCQ: {top3Students[2].part1Score}/40 &bull; Essay: {top3Students[2].part2Score}/60
                      </span>
                      <span className="text-xl font-black text-[#102c45]">
                        {top3Students[2].totalScore}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exam Analytics KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-xs text-center">
              <span className="text-[10.5px] font-bold text-[#60768a] block">Candidates Graded</span>
              <span className="text-2xl font-black text-[#102c45] mt-1 block">{stats.total}</span>
              <span className="text-[9.5px] font-bold text-[#007fb8]">Active in Leaderboard</span>
            </div>
            <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-xs text-center">
              <span className="text-[10.5px] font-bold text-[#60768a] block">Highest Score</span>
              <span className="text-2xl font-black text-[#159366] mt-1 block">{stats.highest}%</span>
              <span className="text-[9.5px] font-bold text-[#159366]">Island Rank 1 Mark</span>
            </div>
            <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-xs text-center">
              <span className="text-[10.5px] font-bold text-[#60768a] block">Exam Class Average</span>
              <span className="text-2xl font-black text-[#007fb8] mt-1 block">{stats.average}%</span>
              <span className="text-[9.5px] font-bold text-[#007fb8]">Overall Mean Mark</span>
            </div>
            <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-xs text-center">
              <span className="text-[10.5px] font-bold text-[#60768a] block">Distinctions (A/A*)</span>
              <span className="text-2xl font-black text-[#f59e0b] mt-1 block">{stats.distinctions}</span>
              <span className="text-[9.5px] font-bold text-[#f59e0b]">High Achievers</span>
            </div>
          </div>

          {/* Main Leaderboard Table Card */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-xs space-y-5">
            {/* Leaderboard Header & Action Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#cddce5]/60 pb-4">
              <div>
                <h3 className="text-base font-black text-[#102c45] flex items-center gap-2">
                  <Trophy size={18} className="text-[#007fb8]" />
                  Exam #{activePaper?.paperNumber} Official Results Leaderboard
                </h3>
                <p className="text-xs text-[#60768a] mt-0.5">
                  Ranked list of evaluated candidates with Index numbers, school details, and component scores.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#cddce5] bg-white px-3.5 py-1.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] hover:text-[#102c45] transition-colors cursor-pointer shadow-xs"
                >
                  <Printer size={13} />
                  <span>Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3.5 py-1.5 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all cursor-pointer shadow-2xs"
                >
                  <Download size={13} />
                  <span>Download CSV Template</span>
                </button>
              </div>
            </div>

            {/* Search Bar & Score Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#60768a]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name, school, index no..."
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 pr-4 pl-9 text-xs font-bold text-[#102c45] placeholder-[#94a3b8] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#102c45]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Score Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: "All Results", value: "all" },
                  { label: "100% Perfect", value: "100" },
                  { label: "95-99%", value: "95-99" },
                  { label: "90-94%", value: "90-94" },
                  { label: "80-89%", value: "80-89" },
                  { label: "< 80%", value: "below-80" },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setSelectedScoreFilter(f.value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedScoreFilter === f.value
                        ? "bg-[#007fb8] text-white shadow-xs font-black"
                        : "border border-[#cddce5] bg-white text-[#60768a] hover:border-[#007fb8] hover:text-[#102c45]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#cddce5]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#cddce5] bg-[#edf2f3]/70 font-black text-[#102c45]">
                    <th className="py-3.5 pl-5 pr-3 text-center w-16">Rank</th>
                    <th className="py-3.5 px-3">Student Name</th>
                    <th className="py-3.5 px-3">School / Institute</th>
                    <th className="py-3.5 px-3">Student ID / Index No</th>
                    <th className="py-3.5 px-3 text-center">Part I (MCQ /40)</th>
                    <th className="py-3.5 px-3 text-center">Part II (Essay /60)</th>
                    <th className="py-3.5 px-3 text-center">Total Mark</th>
                    <th className="py-3.5 px-3 text-center">Grade</th>
                    <th className="py-3.5 px-3 text-center">Academic Status</th>
                    <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cddce5]/50">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-[#60768a]">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle size={24} className="text-[#94a3b8]" />
                          <p className="font-bold text-xs">No exam results match your filter.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedScoreFilter("all");
                            }}
                            className="text-xs font-black text-[#007fb8] hover:underline"
                          >
                            Reset Search Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((student) => {
                      const isTop1 = student.rank === 1;
                      const isTop2 = student.rank === 2;
                      const isTop3 = student.rank === 3;

                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors hover:bg-[#edf2f3]/60 ${
                            isTop1 ? "bg-[#fffbeb]/50 font-bold" : ""
                          }`}
                        >
                          {/* Rank Column */}
                          <td className="py-3 pl-5 pr-3 text-center font-black">
                            {isTop1 ? (
                              <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#fef3c7] text-[#d97706] border border-[#f59e0b]/40 text-sm shadow-xs">
                                🥇
                              </span>
                            ) : isTop2 ? (
                              <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#edf2f3] text-[#254967] border border-[#cddce5] text-sm shadow-xs">
                                🥈
                              </span>
                            ) : isTop3 ? (
                              <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#edf2f3] text-[#254967] border border-[#cddce5] text-sm shadow-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="inline-flex size-6 items-center justify-center rounded-lg bg-[#edf2f3] text-[#60768a] font-bold text-[11px]">
                                #{student.rank}
                              </span>
                            )}
                          </td>

                          {/* Name with Avatar */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="size-8 rounded-full border border-[#cddce5] bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white text-[11px] font-black flex items-center justify-center shrink-0 overflow-hidden">
                                {student.avatarImage ? (
                                  <Image
                                    src={student.avatarImage}
                                    alt={student.name}
                                    width={32}
                                    height={32}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  student.avatarInitials
                                )}
                              </div>
                              <div>
                                <span className="font-black text-[#102c45] block">
                                  {student.name}
                                </span>
                                {student.achievement && (
                                  <span className="text-[10px] font-bold text-[#159366]">
                                    ★ {student.achievement}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* School */}
                          <td className="py-3 px-3 font-bold text-[#60768a]">
                            {student.school}
                          </td>

                          {/* Index No */}
                          <td className="py-3 px-3 font-mono font-bold text-[#007fb8]">
                            <span className="rounded-lg bg-[#e0f2fe]/80 border border-[#007fb8]/30 px-2 py-0.5 text-[11px]">
                              {student.indexNo}
                            </span>
                          </td>

                          {/* MCQ Score */}
                          <td className="py-3 px-3 text-center font-bold text-[#102c45]">
                            {student.part1Score} / 40
                          </td>

                          {/* Essay Score */}
                          <td className="py-3 px-3 text-center font-bold text-[#102c45]">
                            {student.part2Score} / 60
                          </td>

                          {/* Total Mark */}
                          <td className="py-3 px-3 text-center font-black text-sm text-[#102c45]">
                            <span
                              className={`rounded-xl px-2.5 py-1 ${
                                student.totalScore >= 95
                                  ? "bg-[#e8f7f2] text-[#159366] font-black"
                                  : student.totalScore >= 75
                                  ? "bg-[#e0f2fe] text-[#007fb8] font-bold"
                                  : "bg-[#edf2f3] text-[#102c45]"
                              }`}
                            >
                              {student.totalScore}%
                            </span>
                          </td>

                          {/* Grade Badge */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                                student.grade === "A*"
                                  ? "border-[#38d995] bg-[#e8f7f2] text-[#159366]"
                                  : student.grade === "A"
                                  ? "border-[#007fb8]/40 bg-[#e0f2fe] text-[#007fb8]"
                                  : "border-[#cddce5] bg-[#edf2f3] text-[#60768a]"
                              }`}
                            >
                              Grade {student.grade}
                            </span>
                          </td>

                          {/* Academic Status (Auto-Generated by System) */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                                student.totalScore >= 95 || student.rank <= 3
                                  ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
                                  : student.totalScore >= 75
                                  ? "bg-[#e8f7f2] text-[#159366] border-[#38d995]/40"
                                  : student.totalScore >= 65
                                  ? "bg-[#e0f2fe] text-[#007fb8] border-[#007fb8]/30"
                                  : student.totalScore >= 50
                                  ? "bg-[#fef3c7] text-[#92400e] border-[#fde68a]"
                                  : student.totalScore >= 35
                                  ? "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]"
                                  : "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
                              }`}
                            >
                              {student.achievement || generateAutoStatus(student.totalScore, student.part1Score, student.part2Score, student.rank)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 pr-5 pl-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditResultModal(student)}
                                title="Edit Student Marks & Details"
                                className="size-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-[#007fb8] hover:bg-[#e0f2fe] border border-transparent hover:border-[#007fb8]/30 transition-all cursor-pointer"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteResult(student)}
                                title="Remove from Leaderboard"
                                className="size-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between text-xs text-[#60768a] pt-2">
              <span>
                Displaying <strong className="text-[#102c45]">{filteredResults.length}</strong> of{" "}
                <strong className="text-[#102c45]">{examResults.length}</strong> candidates evaluated.
              </span>
              <span className="font-bold text-[#159366]">
                Audited Government Marking Scheme Verified
              </span>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          MODAL 1: ADD EXAM RESULT MANUALLY
         ========================================================================= */}
      {isManualModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsManualModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-2xl text-[#102c45]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-[#cddce5] bg-[#edf2f3] p-1.5 text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-[#cddce5]/60 mb-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white">
                <Plus size={18} />
              </span>
              <div>
                <h3 className="text-base font-black text-[#102c45]">
                  Add Student Exam Result Manually
                </h3>
                <p className="text-xs text-[#60768a]">
                  Record marks directly into the selected exam paper leaderboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              {/* Exam Paper Dropdown Selector */}
              <div>
                <label className="block text-xs font-bold text-[#102c45] mb-1">
                  Target Exam Paper *
                </label>
                <select
                  value={modalTargetPaperId}
                  onChange={(e) => {
                    if (e.target.value === "CREATE_NEW") {
                      setIsManualModalOpen(false);
                      onOpenAddPaper();
                    } else {
                      setModalTargetPaperId(e.target.value);
                    }
                  }}
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>
                      Paper #{p.paperNumber}: {p.title} ({p.month} {p.year})
                    </option>
                  ))}
                  <option value="CREATE_NEW">+ Publish New Exam Paper...</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#102c45]">
                      Student Examination Index No *
                    </label>
                    <span className="text-[10px] font-bold text-[#007fb8]">
                      Auto-detects from database
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={manualIndexNo}
                    onChange={(e) => handleManualIndexChange(e.target.value)}
                    placeholder="e.g. 53914864 or 53914871"
                    className={`w-full rounded-2xl border bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-mono font-bold focus:bg-white focus:outline-none ${
                      isManualIndexDuplicate
                        ? "border-red-400 text-red-600 focus:border-red-500"
                        : "border-[#cddce5] text-[#102c45] focus:border-[#007fb8]"
                    }`}
                  />
                  {isManualIndexDuplicate ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-2.5 py-1">
                      <AlertCircle size={13} className="shrink-0 text-red-500" />
                      <span>Index No already exists in this exam. One paper cannot repeat index numbers.</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-[10px] text-[#60768a]">
                      Type a registered index number to auto-fill student name and school.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Anuki Perera"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102c45] mb-1">
                  School / Educational Institute *
                </label>
                <input
                  type="text"
                  required
                  value={manualSchool}
                  onChange={(e) => setManualSchool(e.target.value)}
                  placeholder="e.g. Sirimavo Bandaranaike Vidyalaya"
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1">
                    Part I (MCQ / 40) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    required
                    value={manualPart1}
                    onChange={(e) => setManualPart1(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1">
                    Part II (Essay / 60) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={manualPart2}
                    onChange={(e) => setManualPart2(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none text-center"
                  />
                </div>
              </div>

              {/* Live Preview of Computed Total, Grade & Auto-Generated Status */}
              <div className="rounded-2xl border border-[#38d995]/50 bg-[#e8f7f2] p-3.5 space-y-2.5 text-xs font-bold text-[#159366]">
                <div className="flex items-center justify-between">
                  <span>
                    Calculated Total:{" "}
                    <strong className="text-base font-black text-[#102c45]">
                      {manualPart1 + manualPart2} / 100
                    </strong>
                  </span>
                  <span className="rounded-full bg-[#159366] px-2.5 py-0.5 text-white font-black text-[11px]">
                    Grade {computeGrade(manualPart1 + manualPart2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#38d995]/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#60768a] uppercase tracking-wider">
                    Auto-Generated System Status:
                  </span>
                  <span className="rounded-lg bg-white border border-[#38d995]/40 px-2.5 py-0.5 font-black text-[#159366] text-[11px] shadow-2xs">
                    {manualAchievement.trim() || generateAutoStatus(manualPart1 + manualPart2, manualPart1, manualPart2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102c45] mb-1">
                  Custom Status Override (Optional)
                </label>
                <input
                  type="text"
                  value={manualAchievement}
                  onChange={(e) => setManualAchievement(e.target.value)}
                  placeholder={`Leave empty for auto: "${generateAutoStatus(manualPart1 + manualPart2, manualPart1, manualPart2)}"`}
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-[#60768a]">
                  System automatically generates the official academic status from component marks and leaderboard rank.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="rounded-full border border-[#cddce5] bg-white px-5 py-2.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isManualIndexDuplicate || !manualName.trim() || !manualIndexNo.trim()}
                  className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-[#007fb8]/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isManualIndexDuplicate ? "Duplicate Index Number" : "Add to Leaderboard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: UPLOAD EXCEL / CSV EXAM RESULTS
         ========================================================================= */}
      {isUploadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-2xl text-[#102c45]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-[#cddce5] bg-[#edf2f3] p-1.5 text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-[#cddce5]/60 mb-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white">
                <FileSpreadsheet size={18} />
              </span>
              <div>
                <h3 className="text-base font-black text-[#102c45]">
                  Bulk Upload Exam Results (Excel / CSV)
                </h3>
                <p className="text-xs text-[#60768a]">
                  Import spreadsheet results directly into any published exam paper.
                </p>
              </div>
            </div>

            {/* Target Paper Selector in Upload Modal */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#102c45] mb-1">
                Target Exam Paper for Upload *
              </label>
              <select
                value={modalTargetPaperId}
                onChange={(e) => {
                  if (e.target.value === "CREATE_NEW") {
                    setIsUploadModalOpen(false);
                    onOpenAddPaper();
                  } else {
                    handleTargetPaperChange(e.target.value);
                  }
                }}
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
              >
                {papers.map((p) => (
                  <option key={p.id} value={p.id}>
                    Paper #{p.paperNumber}: {p.title} ({p.results?.length || 0} current candidates)
                  </option>
                ))}
                <option value="CREATE_NEW">+ Publish New Paper for this upload...</option>
              </select>
            </div>

            {/* Auto-matching notice banner */}
            <div className="mb-4 rounded-2xl border border-[#007fb8]/30 bg-[#e0f2fe]/60 p-3.5 text-xs text-[#007fb8] flex items-start gap-2.5">
              <Database size={16} className="shrink-0 mt-0.5 text-[#007fb8]" />
              <div className="leading-relaxed">
                <span className="font-black text-[#102c45]">Database Auto-Lookup: </span>
                Your Excel / CSV file only needs 3 columns: <strong className="text-[#007fb8]">Index No</strong>, <strong className="text-[#007fb8]">Part 1 (MCQ /40)</strong>, and <strong className="text-[#007fb8]">Part 2 (Essay /60)</strong>. Student Names, Schools, and Batches are automatically retrieved from the system database.
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt,.tsv"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadSuccessMsg && (
              <div className="mb-4 rounded-2xl border border-[#38d995] bg-[#e8f7f2] p-4 text-xs font-black text-[#159366] flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                <CheckCircle2 size={16} />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {uploadError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-black text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-[#007fb8]/40 bg-[#f8fafc] p-6 text-center hover:bg-[#edf2f3] transition-colors cursor-pointer group"
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#007fb8] group-hover:scale-105 transition-transform">
                <Upload size={22} />
              </div>
              <h4 className="mt-3 text-xs font-black text-[#102c45]">
                {csvFile ? csvFile.name : "Click to select or drop CSV / Excel Spreadsheet"}
              </h4>
              <p className="mt-1 text-[11px] text-[#60768a]">
                Accepts .csv exported from Microsoft Excel, Numbers, or Google Sheets.
              </p>
            </div>

            {/* Template Download Prompt */}
            <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-[#60768a] bg-[#edf2f3]/50 p-3 rounded-2xl border border-[#cddce5]">
              <span>Need the required column format?</span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs font-black text-[#007fb8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download size={13} />
                Download CSV Template
              </button>
            </div>

            {/* Import Mode: Replace vs Append */}
            <div className="mt-4 flex items-center gap-4 text-xs font-bold text-[#102c45]">
              <span className="text-[#60768a]">Import Mode:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMode"
                  value="append"
                  checked={uploadMode === "append"}
                  onChange={() => handleUploadModeChange("append")}
                  className="text-[#007fb8]"
                />
                <span>Append to Existing</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMode"
                  value="replace"
                  checked={uploadMode === "replace"}
                  onChange={() => handleUploadModeChange("replace")}
                  className="text-[#007fb8]"
                />
                <span className="text-red-600">Replace All Current</span>
              </label>
            </div>

            {/* Duplicate Detection Alert */}
            {duplicateRowsCount > 0 && (
              <div className="mt-3.5 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-black text-amber-800">
                    {duplicateRowsCount} Duplicate {duplicateRowsCount === 1 ? "Item" : "Items"} Detected:
                  </span>{" "}
                  The repeated student index numbers highlighted in amber below already exist in this exam (or were repeated in the file). They will be <strong>automatically ignored and NOT saved to the database</strong>. Only the <strong>{uniqueRowsCount} unique records</strong> will be stored.
                </div>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedPreview.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#102c45]">
                    Previewing {parsedPreview.length} Parsed Rows ({uniqueRowsCount} Unique to Store, {duplicateRowsCount} Duplicates Skipped):
                  </span>
                  <span className="text-[11px] font-bold text-[#159366]">
                    {uniqueRowsCount} Ready to Store
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-2xl border border-[#cddce5] text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#edf2f3] sticky top-0 font-bold text-[#60768a]">
                      <tr>
                        <th className="py-2 pl-3">Index No</th>
                        <th className="py-2 px-2">Student Name (from DB)</th>
                        <th className="py-2 px-2">School</th>
                        <th className="py-2 px-2 text-center">Part 1</th>
                        <th className="py-2 px-2 text-center">Part 2</th>
                        <th className="py-2 px-2 text-center">Total</th>
                        <th className="py-2 pr-3 text-center">Database Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cddce5]/50">
                      {parsedPreview.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            row.isDuplicate
                              ? "bg-amber-50/70 border-l-4 border-l-amber-500"
                              : "hover:bg-[#f8fafc]"
                          }
                        >
                          <td
                            className={`py-2 pl-3 font-mono font-bold ${
                              row.isDuplicate ? "text-amber-800 line-through" : "text-[#007fb8]"
                            }`}
                          >
                            {row.indexNo}
                          </td>
                          <td className="py-2 px-2 font-bold text-[#102c45]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={row.isDuplicate ? "line-through text-slate-500" : ""}>
                                {row.name}
                              </span>
                              {row.isDbMatched && !row.isDuplicate && (
                                <span className="inline-flex items-center rounded-full bg-[#f0fdf4] px-1.5 py-0.5 text-[9px] font-black text-[#159366] border border-[#bbf7d0]">
                                  ✓ DB User
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className={`py-2 px-2 truncate max-w-[140px] ${
                              row.isDuplicate ? "text-slate-400" : "text-[#60768a]"
                            }`}
                          >
                            {row.school}
                          </td>
                          <td
                            className={`py-2 px-2 text-center ${
                              row.isDuplicate ? "text-slate-400" : "font-semibold"
                            }`}
                          >
                            {row.part1Score}/40
                          </td>
                          <td
                            className={`py-2 px-2 text-center ${
                              row.isDuplicate ? "text-slate-400" : "font-semibold"
                            }`}
                          >
                            {row.part2Score}/60
                          </td>
                          <td
                            className={`py-2 px-2 text-center font-black ${
                              row.isDuplicate ? "text-slate-400 line-through" : "text-[#159366]"
                            }`}
                          >
                            {row.totalScore}%
                          </td>
                          <td className="py-2 pr-3 text-center">
                            {row.isDuplicate ? (
                              <span
                                className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-black"
                                title={row.duplicateReason}
                              >
                                <AlertTriangle size={10} /> Skipped ({row.duplicateReason})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] text-[#159366] border border-[#bbf7d0] px-2 py-0.5 text-[10px] font-black">
                                ✓ Will Store
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-[#cddce5]/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setParsedPreview([]);
                  setCsvFile(null);
                }}
                className="rounded-full border border-[#cddce5] bg-white px-5 py-2.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={uniqueRowsCount === 0}
                onClick={handleCommitUpload}
                className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-[#007fb8]/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uniqueRowsCount > 0
                  ? `Store ${uniqueRowsCount} Unique Records${duplicateRowsCount > 0 ? ` (Skip ${duplicateRowsCount} Duplicates)` : ""}`
                  : "No Unique Records to Store"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: EDIT STUDENT MARKS & EVALUATION
         ========================================================================= */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#cddce5] bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white flex items-center justify-center shadow-xs">
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#102c45]">
                    Edit Student Marks &amp; Score
                  </h3>
                  <p className="text-xs text-[#60768a]">
                    Paper #{activePaper?.paperNumber} &bull; {activePaper?.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingResult(null)}
                className="size-8 rounded-full border border-[#cddce5] text-[#60768a] hover:bg-[#edf2f3] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Student ID Card Badge inside Modal */}
            <div className="mt-4 rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-full border border-[#007fb8] bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white text-xs font-black flex items-center justify-center shrink-0">
                  {editingResult.avatarInitials}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-[#102c45] block truncate">
                    {editingResult.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#60768a] block truncate">
                    {editingResult.school}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="rounded-lg bg-[#e0f2fe] border border-[#007fb8]/30 px-2.5 py-1 text-xs font-black font-mono text-[#007fb8] block">
                  ID: {editingResult.indexNo}
                </span>
                <span className="text-[10px] font-bold text-[#60768a] block mt-0.5">
                  Current Rank: #{editingResult.rank}
                </span>
              </div>
            </div>

            {/* Success message banner */}
            {editSuccessMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] p-3 text-xs font-bold text-[#159366]">
                <CheckCircle2 size={16} />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveEditResult} className="mt-4 space-y-4">
              {/* Name & School edit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#102c45] mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#cddce5] bg-white py-2 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#102c45] mb-1">
                    School / Educational Institute
                  </label>
                  <input
                    type="text"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-white py-2 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Marks Section */}
              <div className="rounded-2xl border border-[#cddce5] bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#102c45]">
                    Assessment Component Scores
                  </span>
                  <span className="text-[10px] font-bold text-[#60768a]">
                    Total Max: 100 Marks
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#102c45] mb-1">
                      Part I (MCQ) <span className="text-[#007fb8]">/ 40</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={editPart1}
                      onChange={(e) => setEditPart1(Math.min(40, Math.max(0, Number(e.target.value) || 0)))}
                      required
                      className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 py-2.5 px-3 text-sm font-black text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#102c45] mb-1">
                      Part II (Essay) <span className="text-[#007fb8]">/ 60</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={editPart2}
                      onChange={(e) => setEditPart2(Math.min(60, Math.max(0, Number(e.target.value) || 0)))}
                      required
                      className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 py-2.5 px-3 text-sm font-black text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Preview Strip */}
                {(() => {
                  const p1 = Math.min(40, Math.max(0, Number(editPart1) || 0));
                  const p2 = Math.min(60, Math.max(0, Number(editPart2) || 0));
                  const tot = p1 + p2;
                  const gr = computeGrade(tot);
                  const autoStat = generateAutoStatus(tot, p1, p2, editingResult.rank);
                  return (
                    <div className="mt-2 rounded-xl bg-[linear-gradient(135deg,#edf2f3_0%,#e0f2fe_100%)] p-3 border border-[#cddce5] space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#60768a] uppercase block">
                            Calculated Total
                          </span>
                          <span className="text-xl font-black text-[#102c45]">
                            {tot} <span className="text-xs text-[#60768a] font-bold">/ 100 ({tot}%)</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-[#60768a] uppercase block">
                            Official Grade
                          </span>
                          <span className="inline-block rounded-lg bg-[#159366] text-white px-2.5 py-0.5 text-xs font-black shadow-2xs">
                            Grade {gr}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#cddce5]/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#60768a] uppercase">
                          System Auto-Generated Status:
                        </span>
                        <span className="rounded-lg bg-white border border-[#007fb8]/30 px-2 py-0.5 text-[11px] font-black text-[#007fb8]">
                          {editAchievement.trim() || autoStat}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Special Recognition / Award Title */}
              <div>
                <label className="block text-[11px] font-bold text-[#102c45] mb-1">
                  Custom Status Override (Optional)
                </label>
                <input
                  type="text"
                  value={editAchievement}
                  onChange={(e) => setEditAchievement(e.target.value)}
                  placeholder="Leave empty to use the system auto-generated status"
                  className="w-full rounded-2xl border border-[#cddce5] bg-white py-2.5 px-3 text-xs font-bold text-[#102c45] placeholder-[#94a3b8] focus:border-[#007fb8] focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#cddce5]/60 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="rounded-full border border-[#cddce5] bg-white px-5 py-2.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-[#007fb8]/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? "Saving Changes..." : "Save Marks & Recalculate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
