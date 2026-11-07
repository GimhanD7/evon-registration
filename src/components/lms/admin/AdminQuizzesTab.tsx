"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { LMSQuiz, QuizQuestion } from "@/data/lmsData";
import { addLmsQuiz, updateLmsQuiz, deleteLmsQuiz } from "@/lib/lmsStore";

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

export default function AdminQuizzesTab({ quizzes, onRefresh }: AdminQuizzesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Accounting Studies");
  const [batch, setBatch] = useState("2026/2027 O/L Commerce");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [questions, setQuestions] = useState<QuestionFormState[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  ]);

  // Open Modal for New Quiz
  const handleOpenCreate = () => {
    setEditingQuizId(null);
    setTitle("");
    setSubject("Accounting Studies");
    setBatch("2026/2027 O/L Commerce");
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

  // Filtered quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.batch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      selectedSubject === "all" ||
      q.subject.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(new Set(quizzes.map((q) => q.subject)));

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

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-6 py-3 text-xs font-black uppercase text-white shadow-lg shadow-[#007fb8]/25 hover:scale-102 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} /> Create New Quiz
        </button>
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

        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
          >
            <option value="all">All Subjects ({quizzes.length})</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
          filteredQuizzes.map((q) => {
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
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
                  >
                    <option value="Accounting Studies">Accounting Studies</option>
                    <option value="Business Studies">Business Studies</option>
                    <option value="Economics">Economics</option>
                    <option value="Commerce Speed Revision">Commerce Speed Revision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#102c45] mb-1">
                    Target Batch *
                  </label>
                  <input
                    type="text"
                    required
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g. 2026/2027 O/L Commerce"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
                  />
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
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] border border-[#007fb8]/30 px-3.5 py-1.5 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus size={14} /> Add Another Question
                  </button>
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
    </div>
  );
}
