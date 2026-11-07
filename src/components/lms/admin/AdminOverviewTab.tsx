import React from "react";
import {
  Users,
  FileText,
  Trophy,
  MessageSquare,
} from "lucide-react";
import { LMSUser, LMSPaper, LMSQuiz } from "@/data/lmsData";

interface AdminOverviewTabProps {
  users: LMSUser[];
  papers: LMSPaper[];
  quizzes: LMSQuiz[];
  backendStatus: {
    online: boolean;
    database: boolean;
    message: string;
  } | null;
  isCheckingBackend: boolean;
  onCheckBackend: () => void;
  onOpenAddPaper: () => void;
  onOpenAddUser: () => void;
  onSelectTab: (tabId: string) => void;
}

export default function AdminOverviewTab({
  users,
  papers,
  quizzes,
  backendStatus,
  isCheckingBackend,
  onCheckBackend,
  onOpenAddPaper,
  onOpenAddUser,
  onSelectTab,
}: AdminOverviewTabProps) {
  const studentCount = users.filter((u) => u.role === "student").length || 46;

  return (
    <div className="space-y-6">
      {/* 1. ROW OF 4 HOME-THEMED KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Students */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[#007fb8]/20 bg-[#e0f2fe] text-[#007fb8] shadow-xs">
            <Users size={20} strokeWidth={2.4} />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Total Students
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-[#102c45]">
              {studentCount}
            </div>
            <span className="mt-1 inline-block text-[11px] font-bold text-[#159366]">
              Enrolled &bull; Active
            </span>
          </div>
        </div>

        {/* Card 2: Active Papers */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[#0ac9e8]/30 bg-[#e0f7fa] text-[#008dc4] shadow-xs">
            <FileText size={20} strokeWidth={2.4} />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Model Papers
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-[#102c45]">
              {papers.length || 5}
            </div>
            <span className="mt-1 inline-block text-[11px] font-bold text-[#007fb8]">
              Published Revision Sets
            </span>
          </div>
        </div>

        {/* Card 3: Batch Pass Rate */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[#38d995]/40 bg-[#e8f7f2] text-[#159366] shadow-xs">
            <Trophy size={20} strokeWidth={2.4} />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Batch Pass Rate
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-[#102c45]">
              98.4%
            </div>
            <span className="mt-1 inline-block text-[11px] font-bold text-[#159366]">
              O/L Commerce Grade A &bull; B
            </span>
          </div>
        </div>

        {/* Card 4: Quizzes & Feedback */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[#f59e0b]/30 bg-[#fef3c7] text-[#d97706] shadow-xs">
            <MessageSquare size={20} strokeWidth={2.4} />
          </div>
          <div className="mt-4">
            <span className="text-[11px] font-extrabold tracking-wider text-[#60768a] uppercase">
              Quizzes &amp; Evals
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-[#102c45]">
              {quizzes.length || 2}
            </div>
            <span className="mt-1 inline-block text-[11px] font-bold text-[#d97706]">
              Active Modules
            </span>
          </div>
        </div>
      </div>

      {/* 2. TWO SECTION CARDS: Quick Actions & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Quick Actions */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-5 w-1.5 rounded-full bg-[#007fb8]" />
            <h3 className="text-base sm:text-lg font-black text-[#102c45]">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={onOpenAddPaper}
              className="rounded-2xl border border-[#007fb8]/40 bg-white px-4 py-3 text-center text-xs sm:text-sm font-black text-[#007fb8] hover:bg-[#e0f2fe]/60 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              Publish Paper
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("users")}
              className="rounded-2xl border border-[#102c45]/30 bg-white px-4 py-3 text-center text-xs sm:text-sm font-black text-[#102c45] hover:bg-[#edf2f3] transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              View Students
            </button>

            <button
              type="button"
              onClick={() => onSelectTab("evaluations")}
              className="rounded-2xl border border-[#38d995]/40 bg-white px-4 py-3 text-center text-xs sm:text-sm font-black text-[#159366] hover:bg-[#e8f7f2] transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              Record Evaluation
            </button>

            <button
              type="button"
              onClick={onOpenAddUser}
              className="rounded-2xl border border-[#0ac9e8]/40 bg-white px-4 py-3 text-center text-xs sm:text-sm font-black text-[#008dc4] hover:bg-[#e0f7fa] transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              Add Student
            </button>
          </div>
        </div>

        {/* Right: System Health */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1.5 rounded-full bg-[#38d995]" />
              <h3 className="text-base sm:text-lg font-black text-[#102c45]">System Health</h3>
            </div>
            <button
              type="button"
              onClick={onCheckBackend}
              disabled={isCheckingBackend}
              className="text-[11px] font-bold text-[#007fb8] hover:underline cursor-pointer disabled:opacity-50"
            >
              {isCheckingBackend ? "Testing..." : "Test Status"}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-[#edf2f3]/70 px-4 py-3 border border-[#cddce5]/60">
              <span className="text-xs sm:text-sm font-bold text-[#102c45]">Apache PHP API</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-black ${
                  backendStatus?.online ? "bg-[#e8f7f2] text-[#159366]" : "bg-amber-100 text-amber-800"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    backendStatus?.online ? "bg-[#159366] animate-pulse" : "bg-amber-500"
                  }`}
                />
                {backendStatus?.online ? "ONLINE" : "STANDBY (Start XAMPP)"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#edf2f3]/70 px-4 py-3 border border-[#cddce5]/60">
              <span className="text-xs sm:text-sm font-bold text-[#102c45]">MySQL (evon_lms)</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-black ${
                  backendStatus?.database ? "bg-[#e8f7f2] text-[#159366]" : "bg-amber-100 text-amber-800"
                }`}
              >
                {backendStatus?.database ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#edf2f3]/70 px-4 py-3 border border-[#cddce5]/60">
              <span className="text-xs sm:text-sm font-bold text-[#102c45]">Next Scheduled Class</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-xs font-black text-[#007fb8]">
                SUNDAY 12:30 PM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY TABLE */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1.5 rounded-full bg-[#007fb8]" />
            <h3 className="text-base font-black text-[#102c45]">Registered Students Roster</h3>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab("users")}
            className="text-xs font-bold text-[#007fb8] hover:underline cursor-pointer"
          >
            View All ({users.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#cddce5] text-[#60768a] font-extrabold uppercase text-[10px]">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">School</th>
                <th className="pb-3">Role</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cddce5]/50 font-medium">
              {users.slice(0, 5).map((u) => (
                <tr key={u.id} className="hover:bg-[#edf2f3]/50 transition-colors">
                  <td className="py-3 font-bold text-[#102c45]">{u.fullName}</td>
                  <td className="py-3 text-[#60768a] font-mono">{u.phone}</td>
                  <td className="py-3 text-[#60768a]">{u.school || "General Batch"}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        u.role === "admin"
                          ? "bg-[#e0f2fe] text-[#007fb8]"
                          : "bg-[#edf2f3] text-[#60768a]"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159366]">
                      <span className="size-1.5 rounded-full bg-[#159366]" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

