"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Flame,
  HelpCircle,
  Check,
  Lock,
  Shuffle,
  ShieldAlert,
} from "lucide-react";
import { LMSQuiz, QuizQuestion } from "@/data/lmsData";

interface QuizPlayerProps {
  quiz: LMSQuiz;
  onExit: () => void;
  onSaveScore: (quizId: string, score: number, total: number) => void;
}

// Fisher-Yates array shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Randomize both the question order AND the multiple-choice options (A, B, C, D)
function prepareShuffledQuiz(questions: QuizQuestion[]): QuizQuestion[] {
  const randomizedOptions = questions.map((q) => {
    const correctAnswerText = q.options[q.correctAnswer];
    const shuffledOpts = shuffleArray(q.options);
    const newCorrectIndex = shuffledOpts.indexOf(correctAnswerText);
    return {
      ...q,
      options: shuffledOpts,
      correctAnswer: newCorrectIndex >= 0 ? newCorrectIndex : q.correctAnswer,
    };
  });

  return shuffleArray(randomizedOptions);
}

export default function QuizPlayer({
  quiz,
  onExit,
  onSaveScore,
}: QuizPlayerProps) {
  const isAlreadyCompleted = !!quiz.completed;

  // Shuffle questions and options once when starting
  const activeQuestions = useMemo(() => {
    if (isAlreadyCompleted) {
      return quiz.questions;
    }
    return prepareShuffledQuiz(quiz.questions);
  }, [quiz.questions, isAlreadyCompleted]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(isAlreadyCompleted);
  const [quizScore, setQuizScore] = useState(quiz.score || 0);
  const [correctCount, setCorrectCount] = useState(() => {
    if (isAlreadyCompleted && quiz.score !== undefined) {
      return Math.round((quiz.score / 100) * quiz.questions.length);
    }
    return 0;
  });
  const [earnedPoints, setEarnedPoints] = useState(quiz.score || 0);
  const [isReviewMode, setIsReviewMode] = useState(isAlreadyCompleted);

  // Timer state (seconds)
  const initialSeconds = (quiz.durationMinutes || 15) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(!isAlreadyCompleted);

  const handleSubmitQuiz = useCallback(() => {
    if (isAlreadyCompleted) return;
    setIsTimerRunning(false);

    let correct = 0;
    activeQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct += 1;
      }
    });

    const scorePct = Math.round((correct / activeQuestions.length) * 100);
    const xpPoints = Math.round(scorePct); // 1 point per %

    setCorrectCount(correct);
    setQuizScore(scorePct);
    setEarnedPoints(xpPoints);
    setQuizSubmitted(true);
    onSaveScore(quiz.id, scorePct, 100);
  }, [activeQuestions, selectedAnswers, onSaveScore, quiz.id, isAlreadyCompleted]);

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerRunning || quizSubmitted || isAlreadyCompleted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            handleSubmitQuiz();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, quizSubmitted, isAlreadyCompleted, handleSubmitQuiz]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted || isAlreadyCompleted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const currentQ = activeQuestions[currentQIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = activeQuestions.length;
  const isTimeCritical = secondsRemaining <= 120 && secondsRemaining > 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Timer & Exit */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-[10px] font-black text-[#007fb8]">
              {quiz.subject}
            </span>
            <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[10px] font-bold text-[#60768a]">
              {quiz.batch}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] border border-[#f59e0b]/40 px-2 py-0.5 text-[9.5px] font-black text-[#92400e]">
              <Lock size={11} /> 1 Attempt Only
            </span>
            {!isAlreadyCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7f2] border border-[#38d995]/40 px-2 py-0.5 text-[9.5px] font-black text-[#159366]">
                <Shuffle size={11} /> Shuffled &amp; Randomized
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-[#102c45] mt-1">{quiz.title}</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Timer */}
          {!quizSubmitted && !isAlreadyCompleted && (
            <div
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black border transition-all ${
                isTimeCritical
                  ? "border-red-400 bg-red-50 text-red-700 animate-pulse"
                  : "border-[#007fb8]/30 bg-[#e0f2fe] text-[#007fb8]"
              }`}
            >
              <Clock size={16} />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}

          {isAlreadyCompleted && (
            <div className="flex items-center gap-1.5 rounded-2xl bg-[#edf2f3] px-3.5 py-2 text-xs font-black text-[#60768a] border border-[#cddce5]">
              <Lock size={14} className="text-[#94a3b8]" />
              <span>Attempt Locked</span>
            </div>
          )}

          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-[#cddce5] bg-white px-4 py-2 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] hover:text-[#102c45] transition-colors cursor-pointer"
          >
            Exit Quiz
          </button>
        </div>
      </div>

      {/* 2. QUIZ RESULTS SCREEN */}
      {quizSubmitted && !isReviewMode && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#38d995] bg-[linear-gradient(180deg,#e8f7f2_0%,#ffffff_100%)] p-6 sm:p-8 text-center shadow-lg shadow-[#38d995]/15 space-y-5 animate-fade-in">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#38d995] text-white shadow-lg shadow-[#38d995]/30">
            <Trophy size={40} className="animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#102c45] text-white px-3.5 py-1 text-xs font-black mb-2">
              <Lock size={13} className="text-[#38d995]" />
              <span>One-Time Attempt Finalized</span>
            </div>
            <h4 className="text-3xl sm:text-4xl font-black text-[#102c45]">
              {quizScore}% Score
            </h4>
            <p className="text-xs font-bold text-[#60768a]">
              You answered <strong className="text-[#159366]">{correctCount}</strong> of{" "}
              <strong>{totalQuestions}</strong> questions correctly.
            </p>
          </div>

          {/* Points Bonus Award Card */}
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[#007fb8]/30 bg-[#e0f2fe] px-5 py-2.5 text-sm font-black text-[#007fb8]">
            <Flame size={18} className="text-[#0ac9e8]" />
            <span>+{earnedPoints} XP Points permanently awarded to your Leaderboard standing!</span>
          </div>

          {/* One-time attempt notice */}
          <div className="rounded-2xl border border-[#cddce5] bg-white/80 p-3.5 text-xs text-[#60768a] max-w-md mx-auto">
            <p className="font-bold flex items-center justify-center gap-1.5 text-[#102c45]">
              <ShieldAlert size={14} className="text-[#f59e0b]" />
              Attempt limit: 1 of 1 attempt used.
            </p>
            <p className="text-[11px] mt-0.5">
              This quiz is now locked from further retakes to protect competition integrity. You can review the full answer scheme below anytime.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsReviewMode(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#102c45] px-6 py-3 text-xs font-black uppercase text-white shadow-md hover:bg-[#007fb8] transition-colors cursor-pointer"
            >
              <HelpCircle size={15} /> Review Answers &amp; Explanations
            </button>

            <button
              type="button"
              onClick={onExit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#007fb8_0%,#0ac9e8_100%)] px-6 py-3 text-xs font-black uppercase text-white shadow-md cursor-pointer"
            >
              Return to Quizzes
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE QUESTION PLAYER (When Quiz is in progress) */}
      {!quizSubmitted && currentQ && (
        <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-6">
          {/* Progress Header & Question Navigator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#60768a]">
              <span>
                Question <strong className="text-[#102c45]">{currentQIndex + 1}</strong> of {totalQuestions}
              </span>
              <span>
                Answered: <strong className="text-[#159366]">{answeredCount}</strong> / {totalQuestions}
              </span>
            </div>

            {/* Stepper Navigator Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeQuestions.map((qn, idx) => {
                const isCurrent = currentQIndex === idx;
                const isAnswered = selectedAnswers[qn.id] !== undefined;

                return (
                  <button
                    key={qn.id}
                    type="button"
                    onClick={() => setCurrentQIndex(idx)}
                    className={`size-8 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? "bg-[#007fb8] text-white shadow-md shadow-[#007fb8]/30 scale-105"
                        : isAnswered
                        ? "bg-[#e8f7f2] text-[#159366] border border-[#38d995]/50"
                        : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Text */}
          <div className="rounded-2xl border border-[#cddce5]/60 bg-[#edf2f3]/40 p-5">
            <h4 className="text-base sm:text-lg font-black text-[#102c45] leading-snug">
              Q{currentQIndex + 1}. {currentQ.question}
            </h4>
          </div>

          {/* 4 Shuffled Multiple Choice Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`w-full text-left rounded-2xl border p-4 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-[#007fb8] bg-[#e0f2fe] text-[#007fb8] shadow-sm shadow-[#007fb8]/20 ring-2 ring-[#007fb8]/30"
                      : "border-[#cddce5] bg-white text-[#102c45] hover:bg-[#f8fafc] hover:border-[#007fb8]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-7 items-center justify-center rounded-xl text-xs font-black ${
                        isSelected
                          ? "bg-[#007fb8] text-white"
                          : "bg-[#edf2f3] text-[#60768a]"
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSelected && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#007fb8] text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Stepper Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#cddce5]/60">
            <button
              type="button"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#cddce5] bg-white px-5 py-2.5 text-xs font-bold text-[#102c45] hover:bg-[#edf2f3] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft size={14} /> Previous
            </button>

            {currentQIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#102c45] px-6 py-2.5 text-xs font-black text-white hover:bg-[#007fb8] transition-colors cursor-pointer"
              >
                Next Question <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#159366_0%,#38d995_100%)] px-7 py-2.5 text-xs font-black uppercase text-white shadow-lg shadow-[#159366]/30 hover:scale-102 active:scale-95 transition-all cursor-pointer"
              >
                Submit Final Answers <CheckCircle2 size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. REVIEW MODE (Read-only Answer Scheme with explanations) */}
      {isReviewMode && (
        <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cddce5]/60 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[10px] font-black text-[#60768a] mb-1">
                <Lock size={12} /> Read-only Scheme &bull; One-Time Attempt Used
              </div>
              <h4 className="text-lg font-black text-[#102c45]">Quiz Answer Scheme &amp; Teacher Review</h4>
            </div>

            <button
              type="button"
              onClick={onExit}
              className="rounded-full border border-[#cddce5] bg-white px-5 py-2 text-xs font-bold text-[#102c45] hover:bg-[#edf2f3] cursor-pointer"
            >
              Back to Quizzes
            </button>
          </div>

          <div className="space-y-6">
            {activeQuestions.map((qn, idx) => {
              const studentAnswer = selectedAnswers[qn.id];
              const isCorrect = studentAnswer === qn.correctAnswer;

              return (
                <div
                  key={qn.id}
                  className={`rounded-2xl border p-5 space-y-4 ${
                    isCorrect
                      ? "border-[#38d995]/60 bg-[#e8f7f2]/30"
                      : "border-red-300 bg-red-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-black text-sm text-[#102c45]">
                      Q{idx + 1}. {qn.question}
                    </p>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7f2] border border-[#38d995]/50 px-2.5 py-0.5 text-xs font-black text-[#159366] shrink-0">
                        <CheckCircle2 size={13} /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-300 px-2.5 py-0.5 text-xs font-black text-red-700 shrink-0">
                        <XCircle size={13} /> Incorrect
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    {qn.options.map((opt, oIdx) => {
                      const isOptionSelected = studentAnswer === oIdx;
                      const isOptionCorrect = qn.correctAnswer === oIdx;

                      let style = "border-[#cddce5]/60 bg-white text-[#475569]";
                      if (isOptionCorrect) {
                        style = "border-[#38d995] bg-[#e8f7f2] text-[#159366] font-black ring-1 ring-[#38d995]";
                      } else if (isOptionSelected && !isOptionCorrect) {
                        style = "border-red-400 bg-red-50 text-red-700 font-bold";
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`rounded-xl border p-3 text-xs flex items-center justify-between ${style}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold">({String.fromCharCode(65 + oIdx)})</span>
                            <span>{opt}</span>
                          </div>
                          {isOptionCorrect && (
                            <span className="text-[10px] font-black uppercase text-[#159366]">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isOptionSelected && !isOptionCorrect && (
                            <span className="text-[10px] font-black uppercase text-red-700">
                              ✗ Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {qn.explanation && (
                    <div className="rounded-xl border border-[#007fb8]/20 bg-[#e0f2fe]/50 p-3 text-xs text-[#007fb8] font-semibold space-y-0.5">
                      <strong className="block font-black text-[#007fb8]">💡 Teacher Explanation:</strong>
                      <p>{qn.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onExit}
            className="w-full rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-3 text-xs font-black uppercase text-white shadow-md cursor-pointer"
          >
            Finished Reviewing Scheme
          </button>
        </div>
      )}
    </div>
  );
}
