import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { LMSQuiz } from "@/data/lmsData";
import QuizPlayer from "@/components/lms/student/QuizPlayer";

interface StudentQuizzesTabProps {
  quizzes: LMSQuiz[];
  onSaveQuizScore: (quizId: string, score: number, total: number) => void;
}

export default function StudentQuizzesTab({
  quizzes,
  onSaveQuizScore,
}: StudentQuizzesTabProps) {
  const [activeQuiz, setActiveQuiz] = useState<LMSQuiz | null>(null);

  if (activeQuiz) {
    return (
      <QuizPlayer
        quiz={activeQuiz}
        onExit={() => setActiveQuiz(null)}
        onSaveScore={onSaveQuizScore}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
        <h3 className="text-lg font-black text-[#102c45]">Interactive MCQ Quizzes</h3>
        <p className="text-xs text-[#60768a] mt-0.5">
          Test your speed, knowledge, and accounting principles with timed MCQ modules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-[#007fb8]">{q.subject}</span>
              <h4 className="text-base font-black text-[#102c45] mt-1">{q.title}</h4>
              <p className="text-xs text-[#60768a] mt-1">
                {q.questions.length} Questions &bull; {q.durationMinutes} Minutes
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#cddce5]/60 flex items-center justify-between">
              <span className="text-xs font-black text-[#159366]">
                {q.completed ? "Completed • 89%" : "Available Now"}
              </span>
              <button
                type="button"
                onClick={() => setActiveQuiz(q)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-4 py-2 text-xs font-black text-white shadow-md shadow-[#007fb8]/25 hover:scale-102 transition-all cursor-pointer"
              >
                {q.completed ? "Retake Quiz" : "Start Quiz"} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

