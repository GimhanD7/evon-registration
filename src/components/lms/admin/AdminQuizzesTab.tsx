import React from "react";
import { LMSQuiz } from "@/data/lmsData";

interface AdminQuizzesTabProps {
  quizzes: LMSQuiz[];
}

export default function AdminQuizzesTab({ quizzes }: AdminQuizzesTabProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
        <h3 className="text-lg font-black text-[#102c45]">Interactive MCQ Quizzes</h3>
        <p className="text-xs text-[#60768a] mt-0.5">
          Quizzes published for instant student self-testing and rapid revision.
        </p>
      </div>

      <div className="space-y-4">
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#007fb8]">{q.subject}</span>
                <h4 className="text-base font-black text-[#102c45] mt-0.5">{q.title}</h4>
              </div>
              <span className="text-xs font-bold text-[#60768a]">
                {q.questions.length} Questions &bull; {q.durationMinutes} Mins
              </span>
            </div>

            <div className="divide-y divide-[#cddce5]/50 pt-2">
              {q.questions.map((qn, idx) => (
                <div key={qn.id} className="py-3 text-xs space-y-1.5">
                  <p className="font-black text-[#102c45]">
                    Q{idx + 1}. {qn.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 text-[#60768a]">
                    {qn.options.map((opt, oIdx) => (
                      <div
                        key={opt}
                        className={`rounded-xl p-2.5 border ${
                          oIdx === qn.correctAnswer
                            ? "border-[#38d995] bg-[#e8f7f2] font-black text-[#159366]"
                            : "border-[#cddce5]/60 bg-[#edf2f3]/50"
                        }`}
                      >
                        {opt} {oIdx === qn.correctAnswer && "✓ Correct"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

