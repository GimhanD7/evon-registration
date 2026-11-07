"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Award,
  FileText,
  HelpCircle,
  Lock,
  Phone,
  School,
  Calendar,
  Flame,
  CheckCircle2,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { LMSUser, LMSPaper, LMSQuiz, LMSEvaluation } from "@/data/lmsData";
import { StudentLeaderboardEntry } from "@/lib/leaderboardService";

interface StudentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: StudentLeaderboardEntry | null;
  studentUser?: LMSUser;
  papers: LMSPaper[];
  quizzes: LMSQuiz[];
  evaluations: LMSEvaluation[];
  onOpenEvaluationForm?: (studentId: string) => void;
}

export default function StudentHistoryModal({
  isOpen,
  onClose,
  entry,
  studentUser,
  papers,
  quizzes,
  evaluations,
  onOpenEvaluationForm,
}: StudentHistoryModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"exams" | "quizzes" | "evaluations">("exams");

  if (!isOpen || !entry) return null;

  // Filter student-specific data
  const studentEvaluations = evaluations.filter(
    (ev) => ev.studentId === entry.id || ev.studentId === studentUser?.id
  );

  // Student exam history from leaderboard entry or papers
  const examRecords = entry.recentExamScores.length > 0
    ? entry.recentExamScores
    : papers
        .filter((p) => p.results?.some((r) => r.indexNo === entry.indexNo || r.name === entry.fullName))
        .map((p) => {
          const res = p.results?.find((r) => r.indexNo === entry.indexNo || r.name === entry.fullName);
          const score = Number(res?.totalScore) || 0;
          return {
            paperId: p.id,
            paperTitle: p.title,
            score,
            part1: Number(res?.part1Score) || 0,
            part2: Number(res?.part2Score) || 0,
            grade: res?.grade || (score >= 75 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "S" : "F"),
            rank: res?.rank || 1,
          };
        });

  // Student quiz history
  const quizRecords = entry.recentQuizScores.length > 0
    ? entry.recentQuizScores
    : quizzes
        .filter((q) => q.completed)
        .map((q) => ({
          quizId: q.id,
          quizTitle: q.title,
          score: q.score || 0,
          totalMarks: q.totalMarks || (q.questions.length * 10),
        }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#102c45]/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-[#cddce5] bg-white shadow-2xl overflow-hidden">
        {/* Top Header Card */}
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] p-6 text-white shrink-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#0ac9e8]/20 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 left-1/3 size-48 rounded-full bg-[#38d995]/20 blur-2xl"
          />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Student Avatar */}
              <div className="relative size-16 sm:size-20 shrink-0 rounded-2xl border-2 border-white/40 bg-white/10 overflow-hidden flex items-center justify-center shadow-md">
                {entry.avatarUrl ? (
                  <Image
                    src={entry.avatarUrl}
                    alt={entry.fullName}
                    width={80}
                    height={80}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserIcon size={36} className="text-[#0ac9e8]" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="rounded-full bg-[#0ac9e8]/20 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#0ac9e8] border border-[#0ac9e8]/30">
                    Leaderboard Rank #{entry.rank || 1}
                  </span>
                  <span className="rounded-full bg-[#38d995]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#38d995] border border-[#38d995]/30">
                    {entry.tier}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">{entry.fullName}</h3>
                <p className="text-xs font-bold text-white/80 mt-0.5">
                  Commerce Batch: <span className="text-white font-black">{entry.batch}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/15 text-xs">
            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-2.5">
              <span className="text-[10px] font-bold text-white/70 block uppercase">Total System Points</span>
              <span className="text-base font-black text-[#0ac9e8] flex items-center gap-1 mt-0.5">
                <Flame size={14} className="text-[#38d995]" /> {entry.totalPoints} pts
              </span>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-2.5">
              <span className="text-[10px] font-bold text-white/70 block uppercase">Exam Average</span>
              <span className="text-base font-black text-white mt-0.5 block">{entry.avgExamScore}%</span>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-2.5">
              <span className="text-[10px] font-bold text-white/70 block uppercase">Quiz Accuracy</span>
              <span className="text-base font-black text-[#38d995] mt-0.5 block">{entry.quizAccuracy}%</span>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-2.5">
              <span className="text-[10px] font-bold text-white/70 block uppercase">Exams Sat</span>
              <span className="text-base font-black text-white mt-0.5 block">
                {entry.examsAttended} Papers
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Strip */}
        <div className="bg-[#edf2f3]/70 border-b border-[#cddce5] px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[#60768a] shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            {/* STRICTLY LOCKED INDEX NUMBER DISPLAY */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-900 font-mono font-black text-xs shadow-2xs">
              <Lock size={12} className="text-amber-700" />
              <span>Index No: {entry.indexNo}</span>
              <span className="rounded bg-amber-200/80 px-1 text-[9px] font-black uppercase text-amber-800 ml-1">
                Locked
              </span>
            </div>

            {studentUser?.phone && (
              <div className="inline-flex items-center gap-1.5">
                <Phone size={13} className="text-[#007fb8]" />
                <span className="font-mono text-[#102c45]">{studentUser.phone}</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5">
              <School size={13} className="text-[#159366]" />
              <span>{entry.school}</span>
            </div>

            {studentUser?.enrolledDate && (
              <div className="inline-flex items-center gap-1.5">
                <Calendar size={13} className="text-[#60768a]" />
                <span>Enrolled: {studentUser.enrolledDate}</span>
              </div>
            )}
          </div>

          {onOpenEvaluationForm && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEvaluationForm(entry.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#102c45] px-3.5 py-1 text-[11px] font-black text-white hover:bg-[#007fb8] transition-colors cursor-pointer shadow-xs"
            >
              <Award size={12} /> Record Evaluation
            </button>
          )}
        </div>

        {/* Subtabs Navigation */}
        <div className="border-b border-[#cddce5] px-6 flex items-center gap-6 shrink-0 bg-white">
          <button
            type="button"
            onClick={() => setActiveSubTab("exams")}
            className={`py-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === "exams"
                ? "border-[#007fb8] text-[#007fb8]"
                : "border-transparent text-[#60768a] hover:text-[#102c45]"
            }`}
          >
            <FileText size={14} />
            <span>Exams Results History ({examRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("quizzes")}
            className={`py-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === "quizzes"
                ? "border-[#007fb8] text-[#007fb8]"
                : "border-transparent text-[#60768a] hover:text-[#102c45]"
            }`}
          >
            <HelpCircle size={14} />
            <span>Quizzes History ({quizRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("evaluations")}
            className={`py-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === "evaluations"
                ? "border-[#007fb8] text-[#007fb8]"
                : "border-transparent text-[#60768a] hover:text-[#102c45]"
            }`}
          >
            <Award size={14} />
            <span>Teacher Evaluations ({studentEvaluations.length})</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: EXAMS HISTORY */}
          {activeSubTab === "exams" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#102c45]">Comprehensive Model Exam Results</h4>
                  <p className="text-xs text-[#60768a]">
                    Subject: <strong className="text-[#007fb8]">Commerce (Business &amp; Accounting Studies)</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#60768a] block">Highest Score</span>
                  <span className="text-sm font-black text-[#159366]">{entry.highestExamScore}%</span>
                </div>
              </div>

              {examRecords.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#cddce5] p-8 text-center text-xs font-bold text-[#60768a]">
                  No model examination records found for this student yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#cddce5]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#edf2f3] text-[11px] font-black uppercase text-[#60768a] border-b border-[#cddce5]">
                        <th className="py-2.5 px-3.5">Exam Paper</th>
                        <th className="py-2.5 px-3.5 text-center">Part 1 (MCQ)</th>
                        <th className="py-2.5 px-3.5 text-center">Part 2 (Essay)</th>
                        <th className="py-2.5 px-3.5 text-center">Total Marks</th>
                        <th className="py-2.5 px-3.5 text-center">Grade</th>
                        <th className="py-2.5 px-3.5 text-center">Class Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf2f3]">
                      {examRecords.map((rec, i) => (
                        <tr key={rec.paperId || i} className="hover:bg-[#f8fafc]">
                          <td className="py-3 px-3.5 font-bold text-[#102c45]">
                            <div className="flex items-center gap-2">
                              <FileText size={15} className="text-[#007fb8] shrink-0" />
                              <span>{rec.paperTitle}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-[#60768a]">
                            {rec.part1}/40
                          </td>
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-[#60768a]">
                            {rec.part2}/60
                          </td>
                          <td className="py-3 px-3.5 text-center font-black text-[#102c45]">
                            <span className="inline-block rounded-lg bg-[#edf2f3] px-2 py-0.5 text-xs">
                              {rec.score}%
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                                rec.grade === "A"
                                  ? "bg-[#e8f7f2] text-[#159366] border border-[#38d995]/50"
                                  : rec.grade === "B"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : rec.grade === "C"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              Grade {rec.grade}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center font-black text-[#007fb8]">
                            #{rec.rank}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUIZZES HISTORY */}
          {activeSubTab === "quizzes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#102c45]">Interactive Quizzes &amp; Speed Drills</h4>
                  <p className="text-xs text-[#60768a]">
                    Total Quiz Accuracy: <strong className="text-[#159366]">{entry.quizAccuracy}%</strong>
                  </p>
                </div>
              </div>

              {quizRecords.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#cddce5] p-8 text-center text-xs font-bold text-[#60768a]">
                  No quiz activity recorded for this student yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quizRecords.map((q, idx) => {
                    const pct = Math.round((q.score / (q.totalMarks || 1)) * 100);
                    return (
                      <div
                        key={q.quizId || idx}
                        className="rounded-2xl border border-[#cddce5] bg-white p-4 space-y-2 shadow-2xs hover:border-[#007fb8] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-black text-[#102c45]">{q.quizTitle}</h5>
                          <span className="rounded-full bg-[#e8f7f2] px-2 py-0.5 text-[10px] font-black text-[#159366]">
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-[#60768a]">Score:</span>
                          <span className="font-black text-[#102c45]">
                            {q.score} / {q.totalMarks} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#edf2f3] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[linear-gradient(90deg,#007fb8,#38d995)] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TEACHER EVALUATIONS */}
          {activeSubTab === "evaluations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#102c45]">Teacher Progress Evaluations</h4>
                  <p className="text-xs text-[#60768a]">
                    Personalized feedback from Lead Commerce Educator Evon Aravinda
                  </p>
                </div>
              </div>

              {studentEvaluations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#cddce5] p-8 text-center text-xs font-bold text-[#60768a] space-y-3">
                  <p>No customized evaluation remarks recorded yet for this student.</p>
                  {onOpenEvaluationForm && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEvaluationForm(entry.id);
                      }}
                      className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-5 py-2 text-xs font-black text-white shadow-md hover:scale-102 transition-all cursor-pointer"
                    >
                      Record First Evaluation Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {studentEvaluations.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-2xl border border-[#cddce5] bg-white p-5 space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf2f3] pb-2.5">
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-[#007fb8]" />
                          <span className="text-xs font-black text-[#102c45]">{ev.paperOrTerm}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#60768a]">{ev.date}</span>
                          <span className="rounded-full bg-[#e8f7f2] border border-[#38d995]/50 px-2.5 py-0.5 text-[10px] font-black text-[#159366]">
                            {ev.performanceGrade}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs space-y-2">
                        <div>
                          <strong className="text-[#102c45] block font-bold mb-0.5">Teacher Remarks:</strong>
                          <p className="text-[#60768a] bg-[#edf2f3]/50 p-2.5 rounded-xl italic">
                            &ldquo;{ev.teacherRemarks}&rdquo;
                          </p>
                        </div>

                        {ev.strengths && ev.strengths.length > 0 && (
                          <div>
                            <strong className="text-[#159366] block font-bold mb-0.5">Key Strengths:</strong>
                            <div className="flex flex-wrap gap-1.5">
                              {ev.strengths.map((str, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-lg bg-[#e8f7f2] px-2 py-0.5 text-[10.5px] font-bold text-[#159366]"
                                >
                                  &bull; {str}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {ev.weaknesses && ev.weaknesses.length > 0 && (
                          <div>
                            <strong className="text-amber-700 block font-bold mb-0.5">Growth Focus:</strong>
                            <div className="flex flex-wrap gap-1.5">
                              {ev.weaknesses.map((w, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-800"
                                >
                                  &bull; {w}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {ev.recommendedAction && (
                          <div className="rounded-xl bg-[#e0f2fe]/60 border border-[#007fb8]/30 p-2.5 text-xs text-[#007fb8] font-bold flex items-center gap-2">
                            <TrendingUp size={14} className="shrink-0" />
                            <span>Recommended Action: {ev.recommendedAction}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#cddce5] bg-[#edf2f3]/50 p-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#60768a]">
            <CheckCircle2 size={13} className="text-[#159366]" />
            <span>Evon Aravinda Commerce Education &bull; Verified Academic History</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#102c45] px-6 py-2 text-xs font-black text-white hover:bg-[#007fb8] transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
