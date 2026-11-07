import React, { useMemo } from "react";
import { Printer } from "lucide-react";
import { LMSUser, LMSPaper } from "@/data/lmsData";
import { printStudentTranscriptPdf } from "@/lib/pdfPrintService";
import { getStudentExamResults } from "@/lib/lmsStore";

interface StudentResultsTabProps {
  currentUser: LMSUser;
  papers: LMSPaper[];
}

export default function StudentResultsTab({
  currentUser,
  papers,
}: StudentResultsTabProps) {
  const records = useMemo(() => {
    return getStudentExamResults(currentUser);
  }, [currentUser]);

  const cumulativeAvg = useMemo(() => {
    if (records.length === 0) return "N/A";
    const sum = records.reduce((acc, r) => acc + r.totalScore, 0);
    return (sum / records.length).toFixed(1) + "%";
  }, [records]);

  const avgGrade = useMemo(() => {
    if (records.length === 0) return "Pending";
    const sum = records.reduce((acc, r) => acc + r.totalScore, 0);
    const avg = sum / records.length;
    if (avg >= 75) return "A (Distinction)";
    if (avg >= 65) return "B (Very Good)";
    if (avg >= 50) return "C (Credit Pass)";
    if (avg >= 35) return "S (Pass)";
    return "F";
  }, [records]);

  return (
    <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-[#102c45]">
            Official Results Sheet &amp; Transcripts
          </h3>
          <p className="text-xs text-[#60768a] mt-0.5">
            Verified marksheet for Evon Aravinda Commerce Education Speed Revision.
          </p>
        </div>
        <button
          type="button"
          onClick={() => printStudentTranscriptPdf(currentUser, papers)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#cddce5] px-4 py-2 text-xs font-bold text-[#102c45] hover:bg-[#edf2f3] cursor-pointer"
        >
          <Printer size={14} /> Print Transcript
        </button>
      </div>

      <div className="rounded-3xl border border-[#cddce5] bg-[#edf2f3]/50 p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#60768a] font-bold">Student Name</span>
            <p className="font-black text-[#102c45]">{currentUser.fullName}</p>
          </div>
          <div>
            <span className="text-[#60768a] font-bold">Index Number</span>
            <p className="font-black text-[#102c45] font-mono">
              {currentUser.indexNo || "Registered"}
            </p>
          </div>
          <div>
            <span className="text-[#60768a] font-bold">Batch</span>
            <p className="font-black text-[#102c45]">{currentUser.batch}</p>
          </div>
          <div>
            <span className="text-[#60768a] font-bold">Cumulative Average</span>
            <p className="font-black text-[#159366] text-sm">
              {cumulativeAvg} ({avgGrade})
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-[#cddce5]">
        {records.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#cddce5] bg-[#edf2f3]/60 text-[#60768a] font-extrabold uppercase text-[10px]">
                <th className="py-3 pl-4">Exam Paper</th>
                <th className="py-3">Date</th>
                <th className="py-3 text-center">Part 1</th>
                <th className="py-3 text-center">Part 2</th>
                <th className="py-3 text-center">Total Score</th>
                <th className="py-3 text-center">Grade</th>
                <th className="py-3 pr-4 text-right">Ranking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cddce5]/50 font-medium">
              {records.map((r) => (
                <tr key={r.paperId}>
                  <td className="py-3 pl-4 font-black text-[#102c45]">{r.title}</td>
                  <td className="py-3 text-[#60768a]">
                    {r.month} {r.year}
                  </td>
                  <td className="py-3 text-center text-[#102c45]">
                    {r.part1Score}/40
                  </td>
                  <td className="py-3 text-center text-[#102c45]">
                    {r.part2Score}/60
                  </td>
                  <td className="py-3 text-center font-black text-[#102c45]">
                    {r.totalScore}%
                  </td>
                  <td className="py-3 text-center">
                    <span className="rounded-full bg-[#e8f7f2] px-2 py-0.5 font-black text-[#159366] text-[10px]">
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-black text-[#007fb8]">
                    #{r.rank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-xs text-[#60768a]">
            No exam marks recorded yet for index number {currentUser.indexNo}.
          </div>
        )}
      </div>
    </div>
  );
}
