"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import LmsPagination from "@/components/lms/shared/LmsPagination";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  Clock,
  BookOpen,
  Search,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Sparkles,
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle,
  Check,
  FolderPlus,
} from "lucide-react";
import { LMSQuiz, QuizQuestion } from "@/data/lmsData";
import {
  addLmsQuiz,
  updateLmsQuiz,
  deleteLmsQuiz,
  useLmsBatches,
  COMMERCE_SUBJECT,
} from "@/lib/lmsStore";
import {
  parseQuizExcelFile,
  downloadSampleQuizTemplate,
  ParseExcelResult,
} from "@/lib/quizExcelParser";

interface AdminQuizzesTabProps {
  quizzes: LMSQuiz[];
  onRefresh?: () => void;
}

interface QuestionFormState {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
}

export const COMMERCE_SUBJECTS = ["Commerce"];

export default function AdminQuizzesTab({ quizzes, onRefresh }: AdminQuizzesTabProps) {
  const { batches: dbBatches, addBatch } = useLmsBatches();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  // Quick Add Batch Dialog
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchInput, setNewBatchInput] = useState("");
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(COMMERCE_SUBJECT);
  const [batch, setBatch] = useState(dbBatches[0] || "2026/2027 O/L Commerce");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [questions, setQuestions] = useState<QuestionFormState[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  ]);

  // Excel Import Modal State
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [excelResult, setExcelResult] = useState<ParseExcelResult | null>(null);
  const [excelDefaultTitle, setExcelDefaultTitle] = useState("");
  const [excelDefaultSubject, setExcelDefaultSubject] = useState(COMMERCE_SUBJECT);
  const [excelDefaultBatch, setExcelDefaultBatch] = useState(dbBatches[0] || "2026/2027 O/L Commerce");
  const [excelDefaultDuration, setExcelDefaultDuration] = useState(15);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelSuccessMsg, setExcelSuccessMsg] = useState<string | null>(null);
  const [previewQuizIndex, setPreviewQuizIndex] = useState<number | null>(0);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const manualExcelInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenExcelModal = () => {
    setExcelFile(null);
    setExcelResult(null);
    setExcelError(null);
    setExcelSuccessMsg(null);
    setExcelDefaultTitle("");
    setExcelDefaultSubject(COMMERCE_SUBJECT);
    setExcelDefaultBatch(dbBatches[0] || "2026/2027 O/L Commerce");
    setExcelDefaultDuration(15);
    setPreviewQuizIndex(0);
    setIsExcelModalOpen(true);
  };

  const handleCloseExcelModal = () => {
    setIsExcelModalOpen(false);
    setExcelFile(null);
    setExcelResult(null);
    setExcelError(null);
  };

  const processExcelFile = async (file: File) => {
    setExcelFile(file);
    setExcelError(null);
    setExcelSuccessMsg(null);
    setIsParsingExcel(true);
    try {
      const result = await parseQuizExcelFile(file, {
        title: excelDefaultTitle.trim() || undefined,
        subject: excelDefaultSubject,
        batch: excelDefaultBatch,
        durationMinutes: excelDefaultDuration,
      });

      if (result.errors.length > 0 && result.quizzes.length === 0) {
        setExcelError(result.errors.join(" "));
        setExcelResult(null);
      } else {
        setExcelResult(result);
        setPreviewQuizIndex(0);
      }
    } catch (err) {
      setExcelError(
        `Failed to parse Excel file: ${err instanceof Error ? err.message : String(err)}`
      );
      setExcelResult(null);
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
    e.target.value = "";
  };

  const handleConfirmExcelImport = () => {
    if (!excelResult || excelResult.quizzes.length === 0) return;

    let importedCount = 0;
    for (const q of excelResult.quizzes) {
      addLmsQuiz({
        title: q.title,
        subject: q.subject,
        batch: q.batch,
        durationMinutes: q.durationMinutes,
        questions: q.questions,
      });
      importedCount++;
    }

    if (onRefresh) onRefresh();

    setExcelSuccessMsg(
      `Successfully added ${importedCount} quiz${
        importedCount > 1 ? "zes" : ""
      } with ${excelResult.totalQuestions} questions to the student portal!`
    );

    setTimeout(() => {
      handleCloseExcelModal();
    }, 1800);
  };

  const handleManualExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseQuizExcelFile(file, {
        title,
        subject,
        batch,
        durationMinutes,
      });

      if (result.quizzes.length > 0 && result.quizzes[0].questions.length > 0) {
        const first = result.quizzes[0];
        const newQuestions: QuestionFormState[] = first.questions.map((qn) => ({
          question: qn.question,
          options: [
            qn.options[0] || "",
            qn.options[1] || "",
            qn.options[2] || "",
            qn.options[3] || "",
          ],
          correctAnswer: qn.correctAnswer,
          explanation: qn.explanation || "",
        }));

        setQuestions(newQuestions);
        if (!title.trim() && first.title) {
          setTitle(first.title);
        }
      }
    } catch (err) {
      alert(`Could not parse questions: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      e.target.value = "";
    }
  };

  const handleSaveNewBatch = async () => {
    const trimmed = newBatchInput.trim();
    if (!trimmed) return;
    setIsSavingBatch(true);
    try {
      await addBatch(trimmed);
      setBatch(trimmed);
      setExcelDefaultBatch(trimmed);
      setNewBatchInput("");
      setShowAddBatchModal(false);
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Open Modal for New Quiz
  const handleOpenCreate = () => {
    setEditingQuizId(null);
    setTitle("");
    setSubject(COMMERCE_SUBJECT);
    setBatch(dbBatches[0] || "2026/2027 O/L Commerce");
    setDurationMinutes(15);
    setQuestions([
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
    setIsModalOpen(true);
  };

  // Open Modal for Editing Existing Quiz
  const handleOpenEdit = (q: LMSQuiz) => {
    setEditingQuizId(q.id);
    setTitle(q.title);
    setSubject(q.subject);
    setBatch(q.batch);
    setDurationMinutes(q.durationMinutes);
    setQuestions(
      q.questions.map((qn) => ({
        question: qn.question,
        options: [
          qn.options[0] || "",
          qn.options[1] || "",
          qn.options[2] || "",
          qn.options[3] || "",
        ],
        correctAnswer: qn.correctAnswer,
        explanation: qn.explanation || "",
      }))
    );
    setIsModalOpen(true);
  };

  // Question manipulation
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert("A quiz must have at least one question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, question: text } : q))
    );
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOpts = [...q.options] as [string, string, string, string];
        newOpts[optIdx] = val;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleCorrectAnswerChange = (qIdx: number, correctIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, correctAnswer: correctIdx } : q))
    );
  };

  const handleExplanationChange = (qIdx: number, expl: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, explanation: expl } : q))
    );
  };

  // Save Quiz
  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a quiz title.");
      return;
    }

    // Validation: ensure questions are filled
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Question #${i + 1} prompt cannot be empty.`);
        return;
      }
      for (let o = 0; o < 4; o++) {
        if (!q.options[o].trim()) {
          alert(`Question #${i + 1} option ${o + 1} cannot be empty.`);
          return;
        }
      }
    }

    const compiledQuestions: QuizQuestion[] = questions.map((q, i) => ({
      id: `q-${Date.now()}-${i}`,
      question: q.question.trim(),
      options: q.options.map((opt) => opt.trim()),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation.trim() || "Review relevant textbook module for detailed accounting concepts.",
    }));

    if (editingQuizId) {
      const existing = quizzes.find((q) => q.id === editingQuizId);
      if (existing) {
        updateLmsQuiz({
          ...existing,
          title: title.trim(),
          subject: subject.trim(),
          batch: batch.trim(),
          durationMinutes: Number(durationMinutes) || 15,
          questions: compiledQuestions,
        });
      }
      alert("Quiz successfully updated!");
    } else {
      addLmsQuiz({
        title: title.trim(),
        subject: subject.trim(),
        batch: batch.trim(),
        durationMinutes: Number(durationMinutes) || 15,
        questions: compiledQuestions,
      });
      alert("New interactive quiz published to students!");
    }

    setIsModalOpen(false);
    if (onRefresh) onRefresh();
  };

  // Delete Quiz
  const handleDeleteQuiz = (id: string, quizTitle: string) => {
    if (window.confirm(`Are you sure you want to delete quiz "${quizTitle}"?`)) {
      deleteLmsQuiz(id);
      if (onRefresh) onRefresh();
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.batch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject =
        selectedSubject === "all" ||
        q.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesBatch =
        selectedBatch === "all" ||
        q.batch.toLowerCase() === selectedBatch.toLowerCase();
      return matchesSearch && matchesSubject && matchesBatch;
    });
  }, [quizzes, searchQuery, selectedSubject, selectedBatch]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedBatch]);

  // Paginated Quizzes slice
  const paginatedQuizzes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuizzes.slice(start, start + pageSize);
  }, [filteredQuizzes, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* 1. Top Header Card */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e0f2fe] px-3.5 py-1 text-xs font-black text-[#007fb8] mb-2">
            <Sparkles size={13} className="text-[#0ac9e8]" />
            <span>Interactive MCQ Revision Modules</span>
          </div>
          <h3 className="text-xl font-black text-[#102c45]">MCQ Quizzes Manager</h3>
          <p className="text-xs text-[#60768a] mt-0.5">
            Create, manage, and publish timed multiple-choice questions for instant student practice and automated grading.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenExcelModal}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#107c41]/35 bg-[#f0fdf4] px-5 py-3 text-xs font-black uppercase text-[#107c41] shadow-xs hover:bg-[#dcfce7] active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <FileSpreadsheet size={16} className="text-[#107c41]" />
            <span>Import from Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-6 py-3 text-xs font-black uppercase text-white shadow-lg shadow-[#007fb8]/25 hover:scale-102 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} /> Create New Quiz
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title, subject, or batch..."
            className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 pl-10 pr-4 text-xs font-bold text-[#102c45] placeholder-[#94a3b8] focus:border-[#007fb8] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">Subject: Commerce</option>
            <option value="Commerce">Commerce</option>
          </select>

          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Batches ({dbBatches.length})</option>
            {dbBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAddBatchModal(true)}
            className="inline-flex items-center gap-1 rounded-2xl border border-[#007fb8]/30 bg-[#e0f2fe] px-3 py-2.5 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-colors cursor-pointer"
            title="Add a new Commerce batch to the database"
          >
            <FolderPlus size={14} />
            <span className="hidden sm:inline">Add Batch</span>
          </button>
        </div>
      </div>

      {/* 3. Quizzes List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cddce5] bg-white p-12 text-center text-[#60768a]">
            <HelpCircle size={40} className="mx-auto mb-2 text-[#94a3b8]" />
            <h4 className="text-base font-black text-[#102c45]">No Quizzes Found</h4>
            <p className="text-xs mt-1">Click &ldquo;Create New Quiz&rdquo; to build your first interactive multiple-choice test.</p>
          </div>
        ) : (
          paginatedQuizzes.map((q) => {
            const isExpanded = expandedQuizId === q.id;

            return (
              <div
                key={q.id}
                className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs transition-all hover:shadow-md space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cddce5]/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-[10px] font-black text-[#007fb8]">
                        {q.subject}
                      </span>
                      <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[10px] font-bold text-[#60768a]">
                        {q.batch}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-[#102c45] mt-1.5">{q.title}</h4>
                    <p className="text-xs text-[#60768a] mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <BookOpen size={13} className="text-[#007fb8]" />
                        {q.questions.length} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[#159366]" />
                        {q.durationMinutes} Minutes Limit
                      </span>
                      <span className="flex items-center gap-1 font-bold text-[#159366]">
                        <CheckCircle2 size={13} />
                        Live in Student Portal
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setExpandedQuizId(isExpanded ? null : q.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#cddce5] bg-[#edf2f3]/60 px-3 py-1.5 text-xs font-bold text-[#102c45] hover:bg-[#cddce5] transition-colors cursor-pointer"
                    >
                      {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                      {isExpanded ? "Hide Questions" : "Preview"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(q)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#007fb8]/30 bg-[#e0f2fe] px-3 py-1.5 text-xs font-bold text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit3 size={14} /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuiz(q.id, q.title)}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {/* Expandable Question Inspector */}
                {isExpanded && (
                  <div className="space-y-4 pt-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-[#60768a]">
                      Questions &amp; Verified Answer Scheme ({q.questions.length}):
                    </h5>
                    <div className="divide-y divide-[#cddce5]/50">
                      {q.questions.map((qn, idx) => (
                        <div key={qn.id} className="py-3 text-xs space-y-2">
                          <p className="font-black text-[#102c45]">
                            Q{idx + 1}. {qn.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3">
                            {qn.options.map((opt, oIdx) => {
                              const isCorrect = oIdx === qn.correctAnswer;
                              return (
                                <div
                                  key={opt}
                                  className={`rounded-xl p-2.5 border text-xs ${
                                    isCorrect
                                      ? "border-[#38d995] bg-[#e8f7f2] font-black text-[#159366]"
                                      : "border-[#cddce5]/60 bg-[#edf2f3]/40 text-[#475569]"
                                  }`}
                                >
                                  <span className="font-bold mr-1.5">({String.fromCharCode(65 + oIdx)})</span>
                                  {opt} {isCorrect && "✓ (Correct Answer)"}
                                </div>
                              );
                            })}
                          </div>
                          {qn.explanation && (
                            <p className="text-[11px] text-[#007fb8] font-bold pl-3 italic">
                              💡 Teacher Note: {qn.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Quizzes Pagination */}
        {filteredQuizzes.length > 0 && (
          <div className="rounded-3xl border border-[#cddce5] bg-white p-4 shadow-xs">
            <LmsPagination
              currentPage={currentPage}
              totalItems={filteredQuizzes.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[6, 12, 24, 48]}
              itemName="quizzes"
            />
          </div>
        )}
      </div>

      {/* 4. CREATE / EDIT QUIZ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5] hover:text-[#102c45] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3 py-0.5 text-xs font-black text-[#007fb8] mb-1">
                <HelpCircle size={14} />
                <span>{editingQuizId ? "Edit Quiz Module" : "New Quiz Creator"}</span>
              </div>
              <h3 className="text-2xl font-black text-[#102c45]">
                {editingQuizId ? "Update Interactive Quiz" : "Build Interactive MCQ Quiz"}
              </h3>
              <p className="text-xs text-[#60768a] mt-0.5">
                Set quiz properties, add multiple-choice options, mark the correct answer, and add teacher explanations.
              </p>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-6">
              {/* Meta Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-[#102c45] mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Accounting Quick Drill: Trial Balance & Error Detection"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#102c45] mb-1">
                    Subject Track *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-[#102c45]">
                      Target Commerce Batch (Database) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddBatchModal(true)}
                      className="text-[11px] font-black text-[#007fb8] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={12} /> Add Batch
                    </button>
                  </div>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {dbBatches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#102c45] mb-1">
                    Duration Limit (Minutes) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-5 pt-3 border-t border-[#cddce5]">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-[#102c45] flex items-center gap-2">
                    <BookOpen size={18} className="text-[#007fb8]" />
                    Quiz Questions ({questions.length})
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="file"
                      ref={manualExcelInputRef}
                      accept=".xlsx, .xls, .csv"
                      onChange={handleManualExcelImport}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => manualExcelInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] border border-[#107c41]/30 px-3 py-1.5 text-xs font-black text-[#107c41] hover:bg-[#dcfce7] transition-colors cursor-pointer"
                      title="Upload an Excel sheet to fill questions into this quiz"
                    >
                      <FileSpreadsheet size={14} /> Import from Excel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] border border-[#007fb8]/30 px-3.5 py-1.5 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus size={14} /> Add Another Question
                    </button>
                  </div>
                </div>

                {questions.map((qn, qIdx) => (
                  <div
                    key={qIdx}
                    className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/35 p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#102c45] text-white px-3 py-1 text-xs font-black">
                        Question #{qIdx + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </div>

                    {/* Question Prompt */}
                    <div>
                      <label className="block text-xs font-bold text-[#102c45] mb-1">
                        Question Prompt *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={qn.question}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                        placeholder="Type the question text here..."
                        className="w-full rounded-2xl border border-[#cddce5] bg-white p-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:outline-none"
                      />
                    </div>

                    {/* 4 Options */}
                    <div>
                      <label className="block text-xs font-bold text-[#102c45] mb-2">
                        Multiple Choice Options (Select radio for correct answer) *
                      </label>
                      <div className="space-y-2">
                        {qn.options.map((opt, optIdx) => {
                          const isCorrect = qn.correctAnswer === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2.5 rounded-2xl border p-2 bg-white transition-all ${
                                isCorrect ? "border-[#38d995] ring-2 ring-[#38d995]/30 bg-[#e8f7f2]/30" : "border-[#cddce5]"
                              }`}
                            >
                              <label className="flex items-center gap-1.5 cursor-pointer pl-2">
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                                  className="accent-[#159366] size-4 cursor-pointer"
                                />
                                <span className={`text-xs font-black ${isCorrect ? "text-[#159366]" : "text-[#60768a]"}`}>
                                  ({String.fromCharCode(65 + optIdx)})
                                </span>
                              </label>

                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                                className="flex-1 rounded-xl border-none py-1.5 px-2 text-xs font-bold text-[#102c45] focus:outline-none bg-transparent"
                              />

                              {isCorrect && (
                                <span className="rounded-full bg-[#e8f7f2] px-2 py-0.5 text-[9.5px] font-black text-[#159366] shrink-0">
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Teacher Explanation */}
                    <div>
                      <label className="block text-xs font-bold text-[#60768a] mb-1">
                        Teacher Explanation (Shown to students in review mode)
                      </label>
                      <input
                        type="text"
                        value={qn.explanation}
                        onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                        placeholder="e.g. In ledger entries, asset increases are recorded on the debit side..."
                        className="w-full rounded-2xl border border-[#cddce5] bg-white py-2 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#cddce5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-[#cddce5] px-5 py-2.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-7 py-2.5 text-xs font-black uppercase text-white shadow-lg shadow-[#007fb8]/25 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                >
                  {editingQuizId ? "Save Changes" : "Publish Quiz Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. EXCEL IMPORT MODAL */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-[scaleUp_0.2s_ease-out]">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#cddce5]/60 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f0fdf4] border border-[#107c41]/30 px-3 py-1 text-xs font-black text-[#107c41] mb-2">
                  <FileSpreadsheet size={14} className="text-[#107c41]" />
                  <span>Bulk MCQ Importer</span>
                </div>
                <h3 className="text-xl font-black text-[#102c45]">
                  Import Quizzes from Excel Sheet
                </h3>
                <p className="text-xs text-[#60768a] mt-0.5">
                  Upload an Excel (.xlsx, .xls) or CSV sheet with your questions, options, and answers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadSampleQuizTemplate}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#107c41]/30 bg-[#f0fdf4] px-3.5 py-2 text-xs font-bold text-[#107c41] hover:bg-[#dcfce7] transition-all cursor-pointer shadow-2xs"
                  title="Download a pre-filled Excel template"
                >
                  <Download size={13} />
                  <span className="hidden sm:inline">Sample Template</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseExcelModal}
                  className="rounded-full p-2 text-[#94a3b8] hover:bg-[#edf2f3] hover:text-[#102c45] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Success Toast / Error Banner */}
            {excelSuccessMsg && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-[#e8f7f2] border border-[#38d995] p-4 text-xs font-black text-[#159366]">
                <CheckCircle2 size={18} className="shrink-0 text-[#159366]" />
                <span>{excelSuccessMsg}</span>
              </div>
            )}

            {excelError && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-[#fee2e2] border border-[#ef4444]/40 p-4 text-xs font-bold text-[#991b1b]">
                <AlertCircle size={18} className="shrink-0 text-[#ef4444] mt-0.5" />
                <div className="flex-1">
                  <p className="font-black">Import Notice</p>
                  <p className="mt-0.5 text-xs text-[#991b1b]">{excelError}</p>
                </div>
              </div>
            )}

            {/* File Upload Zone */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {!excelFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const dropped = e.dataTransfer.files?.[0];
                    if (dropped) processExcelFile(dropped);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                    isDraggingFile
                      ? "border-[#107c41] bg-[#f0fdf4]"
                      : "border-[#cddce5] bg-[#edf2f3]/40 hover:border-[#107c41] hover:bg-[#f0fdf4]/50"
                  }`}
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-white border border-[#cddce5] shadow-xs text-[#107c41] group-hover:scale-105 group-hover:border-[#107c41]/40 transition-transform">
                    <Upload size={24} />
                  </div>
                  <h4 className="text-sm font-black text-[#102c45] mt-3">
                    Drag & Drop your Excel file or <span className="text-[#007fb8] underline">browse</span>
                  </h4>
                  <p className="text-xs text-[#60768a] mt-1">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV spreadsheets.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-[#60768a]">
                    <span className="rounded-md bg-white px-2 py-0.5 border border-[#cddce5]">Question</span>
                    <span className="rounded-md bg-white px-2 py-0.5 border border-[#cddce5]">Option A, B, C, D</span>
                    <span className="rounded-md bg-white px-2 py-0.5 border border-[#cddce5]">Correct Answer (A/B/C/D)</span>
                    <span className="rounded-md bg-white px-2 py-0.5 border border-[#cddce5]">Explanation (Optional)</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#cddce5] bg-[#f8fafc] p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#107c41] border border-[#107c41]/30">
                      <FileSpreadsheet size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#102c45] truncate">
                        {excelFile.name}
                      </p>
                      <p className="text-[11px] text-[#60768a]">
                        {(excelFile.size / 1024).toFixed(1)} KB &bull;{" "}
                        {excelResult ? (
                          <span className="text-[#159366] font-bold">
                            Parsed: {excelResult.quizzes.length} quiz(zes), {excelResult.totalQuestions} questions
                          </span>
                        ) : isParsingExcel ? (
                          <span className="text-[#007fb8] font-bold">Parsing spreadsheet...</span>
                        ) : (
                          "Ready"
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border border-[#cddce5] bg-white px-3.5 py-1.5 text-xs font-bold text-[#102c45] hover:bg-[#edf2f3] cursor-pointer shrink-0"
                  >
                    Change File
                  </button>
                </div>
              )}
            </div>

            {/* Target Settings (Used as fallback when columns aren't in Excel) */}
            <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/30 p-4 space-y-3">
              <span className="text-xs font-black text-[#102c45] block">
                Default Target Quiz Information (Applied if not specified in spreadsheet columns):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#60768a] mb-1">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={excelDefaultTitle}
                    onChange={(e) => setExcelDefaultTitle(e.target.value)}
                    placeholder="Auto from file name"
                    className="w-full rounded-xl border border-[#cddce5] bg-white py-1.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#60768a] mb-1">
                    Subject Track
                  </label>
                  <select
                    value={excelDefaultSubject}
                    onChange={(e) => setExcelDefaultSubject(e.target.value)}
                    className="w-full rounded-xl border border-[#cddce5] bg-white py-1.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:outline-none cursor-pointer"
                  >
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-[#60768a]">
                      Commerce Batch (Database)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddBatchModal(true)}
                      className="text-[10px] font-black text-[#007fb8] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={11} /> Add
                    </button>
                  </div>
                  <select
                    value={excelDefaultBatch}
                    onChange={(e) => setExcelDefaultBatch(e.target.value)}
                    className="w-full rounded-xl border border-[#cddce5] bg-white py-1.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:outline-none cursor-pointer"
                  >
                    {dbBatches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#60768a] mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={excelDefaultDuration}
                    onChange={(e) => setExcelDefaultDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#cddce5] bg-white py-1.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Parsed Preview Area */}
            {excelResult && excelResult.quizzes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#60768a] flex items-center gap-1.5">
                    <Check size={14} className="text-[#159366]" />
                    Parsed Preview ({excelResult.quizzes.length} Quizzes Found &bull; {excelResult.totalQuestions} Questions)
                  </h4>
                </div>

                {/* Quizzes Selector if Multiple */}
                {excelResult.quizzes.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {excelResult.quizzes.map((q, qIndex) => (
                      <button
                        key={q.tempId}
                        type="button"
                        onClick={() => setPreviewQuizIndex(qIndex)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                          previewQuizIndex === qIndex
                            ? "bg-[#102c45] text-white shadow-xs"
                            : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                        }`}
                      >
                        {q.title} ({q.questions.length})
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Preview Quiz Questions */}
                {(() => {
                  const activeQuiz =
                    excelResult.quizzes[previewQuizIndex ?? 0] || excelResult.quizzes[0];
                  if (!activeQuiz) return null;

                  return (
                    <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/30 p-4 space-y-3 max-h-72 overflow-y-auto">
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-[#60768a]">
                        <span className="font-black text-[#102c45]">
                          Quiz: {activeQuiz.title}
                        </span>
                        <span>
                          {activeQuiz.subject} &bull; {activeQuiz.batch} &bull; {activeQuiz.durationMinutes} Mins
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {activeQuiz.questions.map((qn, qIdx) => (
                          <div
                            key={qn.id}
                            className="rounded-xl border border-[#cddce5] bg-white p-3 space-y-2 text-xs"
                          >
                            <p className="font-black text-[#102c45]">
                              {qIdx + 1}. {qn.question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {qn.options.map((opt, optIdx) => {
                                const isCorrect = qn.correctAnswer === optIdx;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] ${
                                      isCorrect
                                        ? "bg-[#e8f7f2] font-black text-[#159366] border border-[#38d995]/50"
                                        : "bg-[#f8fafc] text-[#60768a] border border-[#e2e8f0]"
                                    }`}
                                  >
                                    <span className="font-bold">
                                      ({String.fromCharCode(65 + optIdx)})
                                    </span>
                                    <span className="truncate">{opt}</span>
                                    {isCorrect && (
                                      <CheckCircle2 size={12} className="ml-auto text-[#159366] shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {qn.explanation && (
                              <p className="text-[10px] font-medium text-[#60768a] italic">
                                Note: {qn.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#cddce5]">
              <button
                type="button"
                onClick={handleCloseExcelModal}
                className="rounded-full border border-[#cddce5] px-5 py-2.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!excelResult || excelResult.quizzes.length === 0 || isParsingExcel}
                onClick={handleConfirmExcelImport}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#107c41_0%,#159366_100%)] px-7 py-2.5 text-xs font-black uppercase text-white shadow-lg shadow-[#159366]/25 hover:scale-102 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <FileSpreadsheet size={15} />
                <span>
                  Confirm & Import ({excelResult?.totalQuestions ?? 0} Questions)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADD COMMERCE BATCH TO DATABASE DIALOG */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#cddce5] bg-white p-6 shadow-2xl space-y-4 animate-[scaleUp_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#007fb8]">
                  <FolderPlus size={16} />
                </span>
                <div>
                  <h4 className="text-sm font-black text-[#102c45]">
                    Add Commerce Batch to Database
                  </h4>
                  <p className="text-[11px] text-[#60768a]">
                    This batch will immediately appear in all dropdowns and sync to MySQL.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBatchModal(false)}
                className="rounded-lg p-1 text-[#94a3b8] hover:bg-[#edf2f3] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#102c45] mb-1">
                  Batch Name / Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newBatchInput}
                  onChange={(e) => setNewBatchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveNewBatch();
                    }
                  }}
                  placeholder="e.g. 2028 O/L Commerce Elite Batch"
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="rounded-full border border-[#cddce5] px-4 py-2 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newBatchInput.trim() || isSavingBatch}
                  onClick={handleSaveNewBatch}
                  className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-5 py-2 text-xs font-black uppercase text-white shadow-md shadow-[#007fb8]/25 hover:scale-102 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingBatch ? "Saving..." : "Save to Database"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
