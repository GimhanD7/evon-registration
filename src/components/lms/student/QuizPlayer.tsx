import React, { useState } from "react";
import { LMSQuiz } from "@/data/lmsData";

interface QuizPlayerProps {
  quiz: LMSQuiz;
  onExit: () => void;
  onSaveScore: (quizId: string, score: number, total: number) => void;
}

export default function QuizPlayer({
  quiz,
  onExit,
  onSaveScore,
}: QuizPlayerProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / quiz.questions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);
    onSaveScore(quiz.id, scorePct, 100);
  };

  return (
    <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-4">
        <div>
          <span className="text-xs font-bold text-[#007fb8]">{quiz.subject}</span>
          <h3 className="text-lg font-black text-[#102c45]">{quiz.title}</h3>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="rounded-full border border-[#cddce5] px-4 py-1.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
        >
          Exit Quiz
        </button>
      </div>

      {quizSubmitted && (
        <div className="rounded-3xl border border-[#38d995] bg-[#e8f7f2] p-6 text-center space-y-1">
          <span className="text-xs font-black text-[#159366] uppercase tracking-wider">
            Quiz Completed!
          </span>
          <div className="text-3xl font-black text-[#102c45]">{quizScore}%</div>
          <p className="text-xs font-semibold text-[#159366]">
            Your score has been saved to your student profile.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {quiz.questions.map((qn, idx) => (
          <div
            key={qn.id}
            className="space-y-3 rounded-2xl border border-[#cddce5]/60 bg-[#edf2f3]/50 p-5"
          >
            <p className="font-black text-sm text-[#102c45]">
              Q{idx + 1}. {qn.question}
            </p>
            <div className="space-y-2">
              {qn.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[qn.id] === oIdx;
                const isCorrect = qn.correctAnswer === oIdx;
                let btnClass = "border-[#cddce5] bg-white text-[#102c45] hover:bg-[#edf2f3]";

                if (quizSubmitted) {
                  if (isCorrect) {
                    btnClass = "border-[#38d995] bg-[#e8f7f2] text-[#159366] font-black";
                  } else if (isSelected && !isCorrect) {
                    btnClass = "border-red-400 bg-red-50 text-red-800 font-black";
                  }
                } else if (isSelected) {
                  btnClass = "border-[#007fb8] bg-[#e0f2fe] text-[#007fb8] font-black";
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={quizSubmitted}
                    onClick={() => handleSelectOption(qn.id, oIdx)}
                    className={`w-full text-left rounded-2xl border p-3 text-xs transition-all cursor-pointer ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!quizSubmitted && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-3 text-xs font-black text-white shadow-md shadow-[#007fb8]/25 hover:opacity-95 transition-all cursor-pointer"
        >
          Submit Answers &amp; Check Results
        </button>
      )}
    </div>
  );
}

