import React, { useState, useMemo, useEffect } from "react";
import { Award, Trophy, Flame, Search, Eye, ExternalLink } from "lucide-react";
import { LMSUser, LMSEvaluation } from "@/data/lmsData";
import { getLmsPapers, getLmsQuizzes, getLmsEvaluations } from "@/lib/lmsStore";
import { calculateLeaderboard, StudentLeaderboardEntry } from "@/lib/leaderboardService";
import StudentHistoryModal from "@/components/lms/admin/StudentHistoryModal";
import LmsPagination from "@/components/lms/shared/LmsPagination";

interface AdminEvaluationsTabProps {
  students: LMSUser[];
  onAddEvaluation: (evalData: Omit<LMSEvaluation, "id">) => LMSEvaluation;
  onSuccess: () => void;
}

export default function AdminEvaluationsTab({
  students,
  onAddEvaluation,
  onSuccess,
}: AdminEvaluationsTabProps) {
  const [studentId, setStudentId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [recommendedAction, setRecommendedAction] = useState(
    "Focus on weekly model paper problem sets."
  );
  const [searchLeaderboard, setSearchLeaderboard] = useState("");
  const [selectedEntryForHistory, setSelectedEntryForHistory] = useState<StudentLeaderboardEntry | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setDataVersion((v) => v + 1);
    window.addEventListener("lms_evaluations_change", handleUpdate);
    window.addEventListener("lms_papers_change", handleUpdate);
    window.addEventListener("lms_quizzes_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("lms_evaluations_change", handleUpdate);
      window.removeEventListener("lms_papers_change", handleUpdate);
      window.removeEventListener("lms_quizzes_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const papers = useMemo(() => getLmsPapers(), [dataVersion]);
  const quizzes = useMemo(() => getLmsQuizzes(), [dataVersion]);
  const evaluations = useMemo(() => getLmsEvaluations(), [dataVersion]);

  const leaderboard = useMemo(() => {
    return calculateLeaderboard(students, papers, quizzes, evaluations);
  }, [students, papers, quizzes, evaluations]);

  const filteredLeaderboard = useMemo(() => {
    if (!searchLeaderboard.trim()) return leaderboard;
    const q = searchLeaderboard.toLowerCase();
    return leaderboard.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.indexNo.toLowerCase().includes(q) ||
        e.school.toLowerCase().includes(q)
    );
  }, [leaderboard, searchLeaderboard]);

  const totalPages = Math.max(1, Math.ceil(filteredLeaderboard.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLeaderboard = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredLeaderboard.slice(start, start + pageSize);
  }, [filteredLeaderboard, safePage, pageSize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !remarks.trim()) {
      alert("Please select a student and enter teacher remarks.");
      return;
    }

    onAddEvaluation({
      studentId,
      paperOrTerm: "Monthly Comprehensive Review",
      date: new Date().toISOString().split("T")[0],
      attendanceRate: 95,
      strengths: strengths.split(",").map((s) => s.trim()).filter(Boolean),
      weaknesses: weaknesses.split(",").map((w) => w.trim()).filter(Boolean),
      teacherRemarks: remarks.trim(),
      recommendedAction: recommendedAction.trim(),
      performanceGrade: "Very Good",
    });

    setRemarks("");
    setStrengths("");
    setWeaknesses("");
    alert("Student evaluation successfully recorded and published to student dashboard!");
    onSuccess();
  };

  const handleOpenEvaluationForStudent = (targetStudentId: string) => {
    setStudentId(targetStudentId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1.5 rounded-full bg-[#159366]" />
          <div>
            <h3 className="text-lg font-black text-[#102c45]">Record Teacher Evaluation</h3>
            <p className="text-xs text-[#60768a]">
              Personalized remarks recorded here appear immediately on the student’s evaluation dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#102c45] mb-1">Select Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
            >
              <option value="">-- Choose Enrolled Student --</option>
              {students.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.phone}) &bull; {u.school || "General"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#102c45] mb-1">
                Key Strengths (comma-separated)
              </label>
              <input
                type="text"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="e.g. Journal entries, Double entry principles"
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#102c45] mb-1">
                Growth Areas (comma-separated)
              </label>
              <input
                type="text"
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder="e.g. Bank reconciliation speed, Balance sheet adjustments"
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#102c45] mb-1">
              Teacher Remarks by Evon Aravinda
            </label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
              placeholder="Detailed assessment of conceptual understanding, worksheet accuracy, and exam strategy..."
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#102c45] mb-1">
              Recommended Action Plan
            </label>
            <input
              type="text"
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-[#007fb8]/20 hover:scale-101 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Award size={15} /> Save &amp; Publish Evaluation
          </button>
        </form>
      </div>

      {/* Admin View: Live System Points & Leaderboard */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[#102c45] flex items-center gap-2">
              <Trophy size={18} className="text-[#f59e0b]" /> System Academic Leaderboard &amp; Points Overview
            </h3>
            <p className="text-xs text-[#60768a] mt-0.5">
              Live ranking of all {leaderboard.length} enrolled students. <span className="text-[#007fb8] font-bold">Click any student row to inspect complete exam results history and profile summary.</span>
            </p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={searchLeaderboard}
              onChange={(e) => setSearchLeaderboard(e.target.value)}
              placeholder="Filter leaderboard..."
              className="rounded-xl border border-[#cddce5] bg-[#edf2f3]/50 py-1.5 pl-8 pr-3 text-xs font-bold text-[#102c45] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#cddce5] text-[11px] font-black uppercase text-[#60768a]">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Index No</th>
                <th className="py-2.5 px-3 text-center">Exam Avg</th>
                <th className="py-2.5 px-3 text-center">Quiz %</th>
                <th className="py-2.5 px-3 text-center">Evaluation Grade</th>
                <th className="py-2.5 px-3 text-right">System Points</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f3]">
              {paginatedLeaderboard.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelectedEntryForHistory(e)}
                  className="group hover:bg-[#e0f2fe]/40 transition-colors cursor-pointer"
                  title="Click to view full exam history and student profile summary"
                >
                  <td className="py-3 px-3 font-black text-[#102c45]">
                    {e.rank === 1 ? "🥇 #1" : e.rank === 2 ? "🥈 #2" : e.rank === 3 ? "🥉 #3" : `#${e.rank}`}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#102c45]">
                    <div className="flex items-center gap-2">
                      <span className="group-hover:text-[#007fb8] transition-colors">{e.fullName}</span>
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-[#007fb8] transition-opacity" />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#60768a] font-mono">{e.indexNo}</td>
                  <td className="py-3 px-3 text-center font-bold text-[#102c45]">{e.avgExamScore}%</td>
                  <td className="py-3 px-3 text-center font-bold text-[#159366]">{e.quizAccuracy}%</td>
                  <td className="py-3 px-3 text-center">
                    <span className="rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-bold text-[#007fb8]">
                      {e.latestPerformanceGrade || "Pending"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-[#007fb8]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e0f2fe] px-2.5 py-0.5 group-hover:bg-[#007fb8] group-hover:text-white transition-colors">
                      <Flame size={12} className="text-[#0ac9e8] group-hover:text-amber-300" /> {e.totalPoints} pts
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSelectedEntryForHistory(e);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-[#007fb8]/30 bg-white px-2.5 py-1 text-[10.5px] font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye size={12} />
                      <span>History</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leaderboard Pagination Bar */}
        <LmsPagination
          currentPage={safePage}
          totalItems={filteredLeaderboard.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[15, 30, 60, 100]}
          itemName="students ranked"
        />
      </div>

      {/* Complete Student Exam Results History & Profile Summary Modal */}
      <StudentHistoryModal
        isOpen={selectedEntryForHistory !== null}
        onClose={() => setSelectedEntryForHistory(null)}
        entry={selectedEntryForHistory}
        studentUser={students.find((s) => s.id === selectedEntryForHistory?.id || s.indexNo === selectedEntryForHistory?.indexNo)}
        papers={papers}
        quizzes={quizzes}
        evaluations={evaluations}
        onOpenEvaluationForm={handleOpenEvaluationForStudent}
      />
    </div>
  );
}

