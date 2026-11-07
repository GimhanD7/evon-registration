import React from "react";
import { Download } from "lucide-react";
import { LMSPaper } from "@/data/lmsData";
import { useCurrentLmsUser } from "@/lib/lmsStore";

interface StudentPapersTabProps {
  papers: LMSPaper[];
}

export default function StudentPapersTab({ papers }: StudentPapersTabProps) {
  const { user: currentUser } = useCurrentLmsUser();
  const userIndex = (currentUser?.indexNo || "").trim().toLowerCase();
  const userName = (currentUser?.fullName || "").trim().toLowerCase();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
        <h3 className="text-lg font-black text-[#102c45]">Model Exam Worksheets &amp; Scores</h3>
        <p className="text-xs text-[#60768a] mt-0.5">
          Review your model paper submissions, scores, and teacher mark breakdowns.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-[#cddce5] bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#cddce5] bg-[#edf2f3]/60 text-[#60768a] font-extrabold uppercase text-[10px]">
              <th className="py-3.5 pl-4">Paper No &amp; Title</th>
              <th className="py-3.5 text-center">Part 1 (MCQ)</th>
              <th className="py-3.5 text-center">Part 2 (Essay)</th>
              <th className="py-3.5 text-center">Total Score</th>
              <th className="py-3.5 text-center">Grade</th>
              <th className="py-3.5 text-center">Class Rank</th>
              <th className="py-3.5 pr-4 text-right">Worksheet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#cddce5]/50 font-medium">
            {papers.map((p) => {
              const myResult = (p.results || []).find((r) => {
                const rIdx = (r.indexNo || "").trim().toLowerCase();
                const rName = (r.name || "").trim().toLowerCase();
                return (userIndex && rIdx === userIndex) || (userName && rName === userName);
              });

              const hasResult = !!myResult || (!!p.studentScore && (currentUser?.id === "std-001" || userIndex === "53914864"));
              const part1 = myResult ? myResult.part1Score : p.studentScore?.part1;
              const part2 = myResult ? myResult.part2Score : p.studentScore?.part2;
              const total = myResult ? myResult.totalScore : p.studentScore?.total;
              const grade = myResult ? myResult.grade : p.studentScore?.grade;
              const rank = myResult ? myResult.rank : p.studentScore?.rank;

              return (
                <tr key={p.id} className="hover:bg-[#edf2f3]/50 transition-colors">
                  <td className="py-3.5 pl-4 font-black text-[#102c45]">
                    <div>{p.title}</div>
                    <span className="text-[10px] text-[#94a3b8] font-normal">
                      Paper #{p.paperNumber} &bull; {p.month} {p.year}
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-bold text-[#102c45]">
                    {hasResult && part1 !== undefined ? `${part1}/40` : "—"}
                  </td>
                  <td className="py-3.5 text-center font-bold text-[#102c45]">
                    {hasResult && part2 !== undefined ? `${part2}/60` : "—"}
                  </td>
                  <td className="py-3.5 text-center">
                    {hasResult && total !== undefined ? (
                      <>
                        <span className="font-black text-base text-[#102c45]">
                          {total}
                        </span>
                        <span className="text-[10px] text-[#94a3b8]">/100</span>
                      </>
                    ) : (
                      <span className="text-xs text-[#94a3b8] font-semibold">Pending</span>
                    )}
                  </td>
                  <td className="py-3.5 text-center">
                    {hasResult && grade ? (
                      <span className="rounded-full bg-[#e8f7f2] px-2.5 py-0.5 font-black text-[#159366] text-[11px]">
                        {grade}
                      </span>
                    ) : (
                      <span className="text-[#94a3b8]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 text-center font-black text-[#007fb8]">
                    {hasResult && rank ? `#${rank}` : "—"}
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <a
                      href={p.pdfUrl || "#"}
                      download
                      className="inline-flex items-center gap-1 rounded-full border border-[#007fb8]/30 bg-white px-3 py-1 text-xs font-bold text-[#007fb8] hover:bg-[#e0f2fe] transition-colors"
                    >
                      <Download size={13} /> PDF
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
