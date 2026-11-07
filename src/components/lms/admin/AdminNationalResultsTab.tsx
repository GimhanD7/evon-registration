"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Award,
  Trophy,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Upload,
  Download,
  X,
  Sparkles,
  FileSpreadsheet,
  Check,
  Star,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { StudentResult } from "@/data/resultsData";
import {
  getNationalResultsFromBackend,
  addOrUpdateNationalResult,
  bulkAddNationalResults,
  deleteNationalResult,
} from "@/lib/lmsStore";
import { logActivity } from "@/lib/activityLogService";
import LmsPagination from "@/components/lms/shared/LmsPagination";

interface AdminNationalResultsTabProps {
  onSuccess?: () => void;
}

export default function AdminNationalResultsTab({ onSuccess }: AdminNationalResultsTabProps) {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025]);
  const [latestYear, setLatestYear] = useState<number>(2025);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [championsOnly, setChampionsOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentResult | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSchool, setFormSchool] = useState("");
  const [formIndex, setFormIndex] = useState("");
  const [formYear, setFormYear] = useState<number>(2026);
  const [formGradeBadge, setFormGradeBadge] = useState<StudentResult["gradeBadge"]>("A9");
  const [formLetterGrade, setFormLetterGrade] = useState<StudentResult["letterGrade"]>("A");
  const [formIsChampion, setFormIsChampion] = useState<boolean>(false);
  const [formQuote, setFormQuote] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Bulk Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<Partial<StudentResult>[]>([]);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getNationalResultsFromBackend();
      setResults(data.results);
      if (data.availableYears && data.availableYears.length > 0) {
        setAvailableYears(data.availableYears);
      }
      if (data.latestYear) {
        setLatestYear(data.latestYear);
        setFormYear(data.latestYear);
      }
    } catch {
      setStatusMsg({ type: "error", text: "Failed to connect to backend database." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("lms_national_results_change", handleUpdate);
    return () => {
      window.removeEventListener("lms_national_results_change", handleUpdate);
    };
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return results.filter((r) => {
      if (selectedYear !== "all") {
        const itemYear = r.year || 2025;
        if (itemYear !== selectedYear) return false;
      }
      if (selectedGrade !== "all" && r.gradeBadge !== selectedGrade) {
        return false;
      }
      if (championsOnly && !r.isTopChampion) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.school.toLowerCase().includes(q) ||
          r.indexNo.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [results, selectedYear, selectedGrade, championsOnly, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedList = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, safePage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const targetResults = selectedYear === "all" ? results : results.filter((r) => (r.year || 2025) === selectedYear);
    const total = targetResults.length;
    const a9 = targetResults.filter((r) => r.gradeBadge === "A9").length;
    const champions = targetResults.filter((r) => r.isTopChampion).length;
    const distinctions = targetResults.filter((r) => ["A9", "A8", "A7", "A"].includes(r.gradeBadge)).length;
    return { total, a9, champions, distinctions };
  }, [results, selectedYear]);

  // Modal Handlers
  const openAddModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormSchool("");
    setFormIndex("");
    setFormYear(latestYear || 2026);
    setFormGradeBadge("A9");
    setFormLetterGrade("A");
    setFormIsChampion(false);
    setFormQuote("");
    setFormAvatar("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: StudentResult) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormSchool(item.school);
    setFormIndex(item.indexNo);
    setFormYear(item.year || 2025);
    setFormGradeBadge(item.gradeBadge);
    setFormLetterGrade(item.letterGrade);
    setFormIsChampion(Boolean(item.isTopChampion));
    setFormQuote(item.quote || "");
    setFormAvatar(item.avatarImage || "");
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formIndex.trim()) {
      alert("Please provide Student Name and Index Number.");
      return;
    }

    setIsSubmitting(true);
    const success = await addOrUpdateNationalResult({
      id: editingItem?.id,
      name: formName.trim(),
      school: formSchool.trim(),
      indexNo: formIndex.trim(),
      year: formYear,
      gradeBadge: formGradeBadge,
      letterGrade: formLetterGrade,
      isTopChampion: formIsChampion,
      quote: formQuote.trim() || undefined,
      avatarImage: formAvatar.trim() || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      logActivity(
        editingItem ? "National Result Updated" : "National Result Added",
        "exam",
        `Saved distinction record for "${formName.trim()}" (${formGradeBadge}, ${formYear} O/L)`,
        null,
        "success"
      );
      setIsAddModalOpen(false);
      setStatusMsg({
        type: "success",
        text: editingItem ? `Updated result for "${formName}".` : `Added "${formName}" to National Results.`,
      });
      loadData();
      onSuccess?.();
      setTimeout(() => setStatusMsg(null), 5000);
    } else {
      alert("Failed to save national result. Please check database connection.");
    }
  };

  const handleDelete = async (item: StudentResult) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" (Index: ${item.indexNo}) from National Results?`)) {
      return;
    }
    const success = await deleteNationalResult(item.id);
    if (success) {
      logActivity(
        "National Result Deleted",
        "exam",
        `Removed distinction record for "${item.name}" (Index: ${item.indexNo})`,
        null,
        "warning"
      );
      setStatusMsg({ type: "success", text: `Deleted "${item.name}" from National Results.` });
      loadData();
      onSuccess?.();
      setTimeout(() => setStatusMsg(null), 4000);
    } else {
      alert("Failed to delete record.");
    }
  };

  // CSV Parsing
  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setUploadError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        if (lines.length <= 1) {
          setUploadError("CSV file is empty or missing data rows.");
          return;
        }

        const parsed: Partial<StudentResult>[] = [];
        // Header line skipped
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (cols.length >= 3) {
            const name = cols[0];
            const school = cols[1];
            const indexNo = cols[2];
            const year = cols[3] && !isNaN(parseInt(cols[3])) ? parseInt(cols[3]) : latestYear;
            const badge = (cols[4] || "A9") as StudentResult["gradeBadge"];
            const letter = (cols[5] || "A") as StudentResult["letterGrade"];
            const isTop = cols[6] === "1" || cols[6]?.toLowerCase() === "true" || cols[6]?.toLowerCase() === "yes";

            if (name && indexNo) {
              parsed.push({
                name,
                school,
                indexNo,
                year,
                gradeBadge: badge,
                letterGrade: letter,
                isTopChampion: isTop,
              });
            }
          }
        }
        setParsedPreview(parsed);
      } catch {
        setUploadError("Failed to parse CSV file. Ensure standard format.");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkUploadSubmit = async () => {
    if (parsedPreview.length === 0) return;
    setIsSubmitting(true);
    const res = await bulkAddNationalResults(parsedPreview);
    setIsSubmitting(false);

    if (res.success) {
      logActivity(
        "National Results Bulk Import",
        "exam",
        `Imported ${res.count} national distinction achievers via CSV into database`,
        null,
        "success"
      );
      setIsUploadModalOpen(false);
      setCsvFile(null);
      setParsedPreview([]);
      setStatusMsg({
        type: "success",
        text: `Successfully uploaded ${res.count} national results into MySQL!`,
      });
      loadData();
      onSuccess?.();
      setTimeout(() => setStatusMsg(null), 6000);
    } else {
      setUploadError("Bulk upload failed. Verify database connectivity.");
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      "Student Name,School,Index Number,Exam Year,Grade Badge,Letter Grade,Top Champion\n" +
      "Hasal Samaranayake,Ananda College Colombo,53519028,2026,A9,A,1\n" +
      "Yashodhini Vihara,Devi Balika Vidyalaya,53560574,2026,A9,A,1\n" +
      "Vidun Wickramasinghe,Sumedha College Gampaha,53914473,2026,A8,A,0\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "national_results_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-xs">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#007fb8]/15 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#007fb8]">
              <Award size={13} />
              National Honors &amp; Distinction Achievers
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-[#102c45] tracking-tight">
              Manage National O/L Results
            </h2>
            <p className="mt-0.5 text-xs text-[#60768a]">
              Manage island-wide 9A champions, top rankers, and distinction achievers displayed on the Home and Results pages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-[#007fb8]/20 hover:scale-102 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Achiever</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCsvFile(null);
                setParsedPreview([]);
                setUploadError("");
                setIsUploadModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#007fb8]/40 bg-[#e0f2fe] px-4 py-2.5 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              <Upload size={14} />
              <span>Upload CSV / Excel</span>
            </button>

            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              title="Refresh national results from MySQL database"
              className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-3.5 py-2.5 text-xs font-black text-[#102c45] hover:bg-[#edf2f3] transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-[#007fb8]" : "text-[#007fb8]"} />
              <span>Refresh</span>
            </button>

            <a
              href="/results"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#cddce5] bg-[#edf2f3] px-3.5 py-2.5 text-xs font-bold text-[#102c45] hover:bg-[#cddce5] transition-all cursor-pointer"
            >
              <span>View Live Page</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`mt-4 flex items-center justify-between gap-3 rounded-2xl p-3 text-xs font-bold border transition-all ${
              statusMsg.type === "success"
                ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"
                : "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === "success" ? (
                <CheckCircle2 size={16} className="text-[#159366] shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-[#dc2626] shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
            <button type="button" onClick={() => setStatusMsg(null)} className="p-1 hover:opacity-75 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* KPI Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-xs text-center">
          <span className="text-[10.5px] font-bold text-[#60768a] block">Total Achievers</span>
          <span className="text-2xl font-black text-[#102c45] mt-1 block">{stats.total}</span>
          <span className="text-[9.5px] font-bold text-[#007fb8]">
            {selectedYear === "all" ? "Across All Years" : `Year ${selectedYear} O/L`}
          </span>
        </div>
        <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-xs text-center">
          <span className="text-[10.5px] font-bold text-[#60768a] block">9A Champions</span>
          <span className="text-2xl font-black text-[#159366] mt-1 block">{stats.a9}</span>
          <span className="text-[9.5px] font-bold text-[#159366]">Perfect 9A Achievers</span>
        </div>
        <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-xs text-center">
          <span className="text-[10.5px] font-bold text-[#60768a] block">Top Featured Champions</span>
          <span className="text-2xl font-black text-[#f59e0b] mt-1 block">{stats.champions}</span>
          <span className="text-[9.5px] font-bold text-[#f59e0b]">Shown on Home Page</span>
        </div>
        <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-xs text-center">
          <span className="text-[10.5px] font-bold text-[#60768a] block">Distinctions (A/A8/A7)</span>
          <span className="text-2xl font-black text-[#007fb8] mt-1 block">{stats.distinctions}</span>
          <span className="text-[9.5px] font-bold text-[#007fb8]">Merit Passes</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-4">
        {/* Filter Controls Row */}
        <div className="flex flex-col gap-3.5 pb-4 border-b border-[#cddce5]/60">
          {/* Year Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#60768a] mr-1">Exam Year:</span>
              <button
                type="button"
                onClick={() => setSelectedYear("all")}
                className={`rounded-full px-3.5 py-1 text-xs font-black transition-all cursor-pointer ${
                  selectedYear === "all"
                    ? "bg-[#102c45] text-white shadow-xs"
                    : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                }`}
              >
                All Years ({results.length})
              </button>
              {availableYears.map((yr) => {
                const count = results.filter((r) => (r.year || 2025) === yr).length;
                return (
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
                    {yr} O/L ({count})
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setChampionsOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black transition-all cursor-pointer border ${
                championsOnly
                  ? "bg-[#fffbeb] border-[#fde68a] text-[#b45309]"
                  : "bg-white border-[#cddce5] text-[#60768a] hover:bg-[#edf2f3]"
              }`}
            >
              <Trophy size={13} className={championsOnly ? "text-[#f59e0b]" : ""} />
              <span>Top Champions Only</span>
            </button>
          </div>

          {/* Search & Grade Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#60768a]" />
              <input
                type="text"
                placeholder="Search student by name, school, or index..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 pl-10 pr-4 py-2 text-xs font-bold text-[#102c45] outline-none focus:border-[#007fb8] focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {["all", "A9", "A8", "A7", "A", "B", "C"].map((gb) => (
                <button
                  key={gb}
                  type="button"
                  onClick={() => setSelectedGrade(gb)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                    selectedGrade === gb
                      ? "bg-[#007fb8] text-white shadow-xs"
                      : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                  }`}
                >
                  {gb === "all" ? "All Grades" : gb}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#cddce5] text-[#60768a] font-black uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">School</th>
                <th className="py-3 px-3 text-center">Index No</th>
                <th className="py-3 px-3 text-center">Year</th>
                <th className="py-3 px-3 text-center">Grade Badge</th>
                <th className="py-3 px-3 text-center">Home Showcase</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cddce5]/60 font-bold text-[#102c45]">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#60768a]">
                    No national achievers found matching your current filter. Click &quot;Add Achiever&quot; to publish records.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const globalIdx = (safePage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3 px-3 text-[#60768a]">{globalIdx}</td>
                      <td className="py-3 px-3">
                        <div className="font-black text-[#102c45]">{item.name}</div>
                        {item.quote && (
                          <div className="text-[10.5px] font-normal text-[#60768a] italic truncate max-w-xs">
                            &quot;{item.quote}&quot;
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#60768a]">{item.school}</td>
                      <td className="py-3 px-3 text-center font-mono font-black text-[#007fb8]">
                        {item.indexNo}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="rounded-lg bg-[#edf2f3] px-2 py-0.5 text-[10.5px] font-bold text-[#254967]">
                          {item.year || 2025}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                            item.gradeBadge === "A9"
                              ? "bg-[#e8f7f2] text-[#159366] border-[#38d995]"
                              : item.gradeBadge === "A8"
                              ? "bg-[#e0f2fe] text-[#007fb8] border-[#007fb8]/30"
                              : "bg-[#edf2f3] text-[#102c45] border-[#cddce5]"
                          }`}
                        >
                          {item.gradeBadge} Distinction
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.isTopChampion ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#fffbeb] border border-[#fde68a] px-2 py-0.5 text-[10px] font-black text-[#b45309]">
                            <Star size={10} fill="currentColor" /> Top Champion
                          </span>
                        ) : (
                          <span className="text-[#94a3b8] text-[10px] font-medium">&mdash;</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit"
                            className="size-7 rounded-lg border border-[#cddce5] bg-white hover:bg-[#edf2f3] flex items-center justify-center text-[#102c45] cursor-pointer"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete"
                            className="size-7 rounded-lg border border-red-200 bg-red-50 hover:bg-red-500 hover:text-white flex items-center justify-center text-red-600 transition-colors cursor-pointer"
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

        {/* Pagination */}
        <LmsPagination
          currentPage={safePage}
          totalItems={filteredList.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[15, 30, 50, 100]}
          itemName="achievers"
        />
      </div>

      {/* MODAL 1: ADD / EDIT ACHIEVER */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-2xl text-[#102c45]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-[#cddce5] bg-[#edf2f3] p-1.5 text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-[#cddce5]/60 mb-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white">
                <Award size={18} />
              </span>
              <div>
                <h3 className="text-base font-black text-[#102c45]">
                  {editingItem ? "Edit National Achiever" : "Add National O/L Achiever"}
                </h3>
                <p className="text-xs text-[#60768a]">
                  Published publicly on the Home Page and National Results Roll.
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#102c45] mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yashodhini Vihara"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 px-3.5 py-2.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1">School *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Devi Balika Vidyalaya"
                    value={formSchool}
                    onChange={(e) => setFormSchool(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 px-3.5 py-2.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1">Index Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 53560574"
                    value={formIndex}
                    onChange={(e) => setFormIndex(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 px-3.5 py-2.5 text-xs font-bold font-mono text-[#007fb8] focus:bg-white focus:border-[#007fb8] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1">Exam Year *</label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2030}
                    value={formYear}
                    onChange={(e) => setFormYear(parseInt(e.target.value) || 2026)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 px-3.5 py-2.5 text-xs font-black text-[#102c45] focus:bg-white focus:border-[#007fb8] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1">Grade Badge *</label>
                  <select
                    value={formGradeBadge}
                    onChange={(e) => setFormGradeBadge(e.target.value as StudentResult["gradeBadge"])}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 px-3 py-2.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] outline-none cursor-pointer"
                  >
                    <option value="A9">A9 (9A Pass)</option>
                    <option value="A8">A8 (8A Pass)</option>
                    <option value="A7">A7 (7A Pass)</option>
                    <option value="A">A Distinction</option>
                    <option value="B">B Pass</option>
                    <option value="C">C Pass</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1">Letter Grade</label>
                  <select
                    value={formLetterGrade}
                    onChange={(e) => setFormLetterGrade(e.target.value as StudentResult["letterGrade"])}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 px-3 py-2.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] outline-none cursor-pointer"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>

              {/* Top Champion Switch */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40">
                <input
                  type="checkbox"
                  id="chk-top-champion"
                  checked={formIsChampion}
                  onChange={(e) => setFormIsChampion(e.target.checked)}
                  className="size-4 accent-[#007fb8] rounded cursor-pointer"
                />
                <label htmlFor="chk-top-champion" className="text-xs font-bold text-[#102c45] cursor-pointer">
                  Feature as Top Champion on Home Page Showcase
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102c45] mb-1">
                  Testimonial Quote <span className="text-[#60768a] font-normal">(Optional, displayed on Home Page)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Evon sir's speed revision and model exam papers gave me the exact timing strategy..."
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-xs font-medium text-[#102c45] focus:bg-white focus:border-[#007fb8] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102c45] mb-1">
                  Avatar Image URL <span className="text-[#60768a] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. /images/top_student_rank1.jpg"
                  value={formAvatar}
                  onChange={(e) => setFormAvatar(e.target.value)}
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 px-3.5 py-2.5 text-xs font-medium text-[#102c45] focus:bg-white focus:border-[#007fb8] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#cddce5]/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-full border border-[#cddce5] bg-white px-4 py-2 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-5 py-2 text-xs font-black text-white shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : editingItem ? "Update Result" : "Publish Result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK UPLOAD CSV */}
      {isUploadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-2xl text-[#102c45]"
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
                <h3 className="text-base font-black text-[#102c45]">Bulk Upload National Results (CSV)</h3>
                <p className="text-xs text-[#60768a]">
                  Upload hundreds of island distinction achievers instantly via CSV.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#e0f2fe] border border-[#007fb8]/30">
                <span className="text-xs font-bold text-[#007fb8]">Need a starting template?</span>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="inline-flex items-center gap-1 rounded-full bg-[#007fb8] text-white px-3 py-1 text-[11px] font-black hover:bg-[#102c45] cursor-pointer"
                >
                  <Download size={12} />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-[#cddce5] p-6 text-center hover:bg-[#edf2f3]/50 hover:border-[#007fb8] transition-all cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCsvSelect}
                  accept=".csv,text/csv"
                  className="hidden"
                />
                <Upload size={24} className="mx-auto text-[#007fb8] mb-2" />
                <p className="text-xs font-bold text-[#102c45]">
                  {csvFile ? csvFile.name : "Click to select a .CSV spreadsheet file"}
                </p>
                <span className="text-[10.5px] text-[#60768a] mt-1 block">
                  Columns: Student Name, School, Index Number, Exam Year, Grade Badge, Letter Grade, Top Champion
                </span>
              </div>

              {uploadError && (
                <div className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 border border-red-200">
                  {uploadError}
                </div>
              )}

              {parsedPreview.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#159366] flex items-center gap-1">
                    <CheckCircle2 size={13} /> {parsedPreview.length} Valid Rows Parsed:
                  </span>
                  <div className="max-h-40 overflow-y-auto border border-[#cddce5] rounded-xl text-[11px] p-2 bg-[#f8fafc] space-y-1">
                    {parsedPreview.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-center justify-between font-mono text-[10.5px]">
                        <span>{p.name} ({p.school})</span>
                        <span className="font-bold text-[#007fb8]">{p.gradeBadge} &bull; {p.year}</span>
                      </div>
                    ))}
                    {parsedPreview.length > 5 && (
                      <div className="text-[#60768a] text-[10px] text-center pt-1 italic">
                        + {parsedPreview.length - 5} more records ready to import...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#cddce5]/60">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-full border border-[#cddce5] bg-white px-4 py-2 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedPreview.length === 0 || isSubmitting}
                  onClick={handleBulkUploadSubmit}
                  className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-5 py-2 text-xs font-black text-white shadow-md hover:opacity-95 disabled:opacity-40 cursor-pointer"
                >
                  {isSubmitting ? "Importing to Database..." : `Import ${parsedPreview.length} Records`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
