"use client";

import React from "react";
import {
  LayoutDashboard,
  // FileText,
  HelpCircle,
  Trophy,
  Award,
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
  counts,
}: StudentMobileBottomNavProps) {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      fullLabel: "Dashboard Overview",
      icon: LayoutDashboard,
      count: undefined,
    },
    // {
    //   id: "papers",
    //   label: "Papers",
    //   fullLabel: "Model Papers",
    //   icon: FileText,
    //   count: counts?.papers ?? 6,
    // },
    {
      id: "quizzes",
      label: "Quizzes",
      fullLabel: "Interactive Quizzes",
      icon: HelpCircle,
      count: counts?.quizzes ?? 2,
    },
    {
      id: "results",
      label: "Results",
      fullLabel: "Exam Results",
      icon: Trophy,
      count: undefined,
    },
    {
      id: "evaluation",
      label: "Evaluation",
      fullLabel: "Teacher Evaluation",
      icon: Award,
      count: counts?.evaluations ?? 0,
    },
    {
      id: "profile",
      label: "Profile",
      fullLabel: "My Profile",
      icon: UserIcon,
      count: undefined,
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Student LMS Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-[100] w-full max-w-full border-t border-[#cddce5]/90 bg-white/98 shadow-[0_-8px_30px_rgba(16,44,69,0.12)] backdrop-blur-2xl transition-all md:hidden pb-[max(8px,env(safe-area-inset-bottom))] pt-2 px-1 rounded-t-3xl"
    >
      <div className="mx-auto grid w-full max-w-[480px] grid-cols-5 items-end gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-label={item.fullLabel}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? "text-[#007fb8] font-black"
                  : "text-[#60768a] font-semibold hover:text-[#102c45]"
              }`}
            >
              {/* Icon Container with active pill highlight */}
              <span
                className={`relative flex size-8 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-[#007fb8] text-white shadow-sm shadow-[#007fb8]/35 scale-105"
                    : "group-hover:bg-[#f1f5f9] text-[#60768a]"
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.4 : 2} />

                {/* Badge count pill matching sidebar design */}
                {item.count !== undefined && (
                  <span
                    className={`absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8.5px] font-black leading-none border shadow-xs ${
                      isActive
                        ? "bg-white text-[#007fb8] border-white"
                        : "bg-[#f1f5f9] text-[#60768a] border-[#e2e8f0]"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </span>

              {/* Text label */}
              <span className="mt-1 w-full truncate text-center text-[9px] leading-tight tracking-tight">
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
