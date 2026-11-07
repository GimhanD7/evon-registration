"use client";

import React from "react";
import {
  LayoutDashboard,
  Award,
  GraduationCap,
  Trophy,
  User as UserIcon,
} from "lucide-react";

interface StudentMobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  counts?: {
    papers?: number;
    quizzes?: number;
    evaluations?: number;
  };
}

export default function StudentMobileBottomNav({
  activeTab,
  onSelectTab,
}: StudentMobileBottomNavProps) {
  const isOverviewActive = activeTab === "overview";
  const isResultsActive = activeTab === "results";
  const isQuizzesActive = activeTab === "quizzes";
  const isLeaderboardActive = activeTab === "evaluation";
  const isProfileActive = activeTab === "profile";

  return (
    <nav
      role="navigation"
      aria-label="Student LMS Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-[100] w-full max-w-full border-t border-[#cddce5]/90 bg-white/98 shadow-[0_-8px_30px_rgba(16,44,69,0.12)] backdrop-blur-2xl transition-all md:hidden pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 px-2 rounded-t-3xl"
    >
      <div className="mx-auto grid w-full max-w-[480px] grid-cols-5 items-end">
        {/* 1. Dashboard Overview */}
        <button
          type="button"
          onClick={() => onSelectTab("overview")}
          aria-label="Dashboard Overview"
          aria-current={isOverviewActive ? "page" : undefined}
          className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 cursor-pointer ${
            isOverviewActive
              ? "text-[#007fb8] font-black"
              : "text-[#60768a] font-medium hover:text-[#102c45]"
          }`}
        >
          <span
            className={`flex size-8 items-center justify-center rounded-full transition-all ${
              isOverviewActive
                ? "bg-[#e0f2fe] scale-105"
                : "group-hover:bg-[#f1f5f9]"
            }`}
          >
            <LayoutDashboard
              size={18}
              strokeWidth={isOverviewActive ? 2.5 : 2}
            />
          </span>
          <span className="mt-0.5 w-full truncate text-center text-[9px] sm:text-[10px] leading-tight tracking-tight">
            Overview
          </span>
          {isOverviewActive && (
            <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
          )}
        </button>

        {/* 2. Exam Results */}
        <button
          type="button"
          onClick={() => onSelectTab("results")}
          aria-label="Exam Results"
          aria-current={isResultsActive ? "page" : undefined}
          className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 cursor-pointer ${
            isResultsActive
              ? "text-[#007fb8] font-black"
              : "text-[#60768a] font-medium hover:text-[#102c45]"
          }`}
        >
          <span
            className={`flex size-8 items-center justify-center rounded-full transition-all ${
              isResultsActive
                ? "bg-[#e0f2fe] scale-105"
                : "group-hover:bg-[#f1f5f9]"
            }`}
          >
            <Award size={18} strokeWidth={isResultsActive ? 2.5 : 2} />
          </span>
          <span className="mt-0.5 w-full truncate text-center text-[9px] sm:text-[10px] leading-tight tracking-tight">
            Results
          </span>
          {isResultsActive && (
            <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
          )}
        </button>

        {/* 3. Hero Center Button: Interactive Quizzes (matches Image 1 raised circle design) */}
        <div className="relative -mt-4 sm:-mt-5 flex min-w-0 max-w-full flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => onSelectTab("quizzes")}
            aria-label="Interactive Quizzes"
            aria-current={isQuizzesActive ? "page" : undefined}
            className="group flex w-full min-w-0 flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <span
              className={`relative flex size-10 sm:size-11 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white shadow-[0_8px_20px_-3px_rgba(0,127,184,0.55)] transition-transform ${
                isQuizzesActive
                  ? "scale-110 ring-2 ring-[#007fb8]/40"
                  : "group-hover:scale-105"
              }`}
            >
              <GraduationCap
                size={20}
                strokeWidth={2.3}
                className="text-[#0ac9e8] transition-transform group-hover:rotate-12"
              />
              {/* Green indicator badge matching Image 1 */}
              <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#38d995] opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-[#38d995]" />
              </span>
            </span>
            <span
              className={`mt-1 w-full truncate text-center text-[9px] sm:text-[10px] font-black tracking-tight ${
                isQuizzesActive ? "text-[#007fb8]" : "text-[#102c45]"
              }`}
            >
              Quizzes
            </span>
            {isQuizzesActive && (
              <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
            )}
          </button>
        </div>

        {/* 4. Points Leaderboard */}
        <button
          type="button"
          onClick={() => onSelectTab("evaluation")}
          aria-label="Points Leaderboard"
          aria-current={isLeaderboardActive ? "page" : undefined}
          className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 cursor-pointer ${
            isLeaderboardActive
              ? "text-[#007fb8] font-black"
              : "text-[#60768a] font-medium hover:text-[#102c45]"
          }`}
        >
          <span
            className={`flex size-8 items-center justify-center rounded-full transition-all ${
              isLeaderboardActive
                ? "bg-[#e0f2fe] scale-105"
                : "group-hover:bg-[#f1f5f9]"
            }`}
          >
            <Trophy
              size={18}
              strokeWidth={isLeaderboardActive ? 2.5 : 2}
            />
          </span>
          <span className="mt-0.5 w-full truncate text-center text-[9px] sm:text-[10px] leading-tight tracking-tight">
            Leaderboard
          </span>
          {isLeaderboardActive && (
            <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
          )}
        </button>

        {/* 5. My Profile */}
        <button
          type="button"
          onClick={() => onSelectTab("profile")}
          aria-label="My Profile"
          aria-current={isProfileActive ? "page" : undefined}
          className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 cursor-pointer ${
            isProfileActive
              ? "text-[#007fb8] font-black"
              : "text-[#60768a] font-medium hover:text-[#102c45]"
          }`}
        >
          <span
            className={`flex size-8 items-center justify-center rounded-full transition-all ${
              isProfileActive
                ? "bg-[#e0f2fe] scale-105"
                : "group-hover:bg-[#f1f5f9]"
            }`}
          >
            <UserIcon
              size={18}
              strokeWidth={isProfileActive ? 2.5 : 2}
            />
          </span>
          <span className="mt-0.5 w-full truncate text-center text-[9px] sm:text-[10px] leading-tight tracking-tight">
            Profile
          </span>
          {isProfileActive && (
            <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
          )}
        </button>
      </div>
    </nav>
  );
}
