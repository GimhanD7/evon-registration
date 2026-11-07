"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Search,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  getActivityLogs,
  clearActivityLogs,
  LMSActivityLog,
} from "@/lib/activityLogService";
import DeletePinModal from "@/components/lms/admin/DeletePinModal";
import LmsPagination from "@/components/lms/shared/LmsPagination";

export default function AdminActivityLogTab() {
  const [logs, setLogs] = useState<LMSActivityLog[]>(() => getActivityLogs());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    const refresh = () => setLogs(getActivityLogs());
    window.addEventListener("lms_activity_logs_change", refresh);
    return () => window.removeEventListener("lms_activity_logs_change", refresh);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" || log.category === categoryFilter;

      const matchesRole = roleFilter === "all" || log.userRole === roleFilter;

      return matchesSearch && matchesCategory && matchesRole;
    });
  }, [logs, searchQuery, categoryFilter, roleFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, roleFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = ["ID", "Timestamp", "User", "Role", "Category", "Action", "Details", "IP Address", "Device"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.userName.replace(/"/g, '""')}"`,
      l.userRole,
      l.category,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress.replace(/"/g, '""')}"`,
      `"${l.device.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `evon_lms_activity_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmClearLogs = () => {
    clearActivityLogs();
    setLogs([]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3 py-0.5 text-[11px] font-black text-[#007fb8] mb-2">
            <Activity size={13} />
            <span>Audit Trail &amp; Surveillance</span>
          </div>
          <h3 className="text-xl font-black text-[#102c45]">Users Activity Log</h3>
          <p className="text-xs text-[#60768a] mt-0.5">
            Real-time chronological activity audit tracking logins, quiz submissions, exam inspections, and administrator operations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-xs font-black text-[#102c45] shadow-xs hover:bg-[#edf2f3] active:scale-95 transition-all cursor-pointer"
          >
            <Download size={14} className="text-[#007fb8]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-black text-red-600 shadow-xs hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity by user, action, IP, or details..."
            className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/60 py-2.5 pl-11 pr-4 text-xs font-bold text-[#102c45] placeholder-[#94a3b8] focus:border-[#007fb8] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Event Categories</option>
            <option value="auth">Logins &amp; Auth</option>
            <option value="quiz">Quizzes Taken</option>
            <option value="exam">Exams &amp; Results</option>
            <option value="user_management">User Management</option>
            <option value="security">Security &amp; PIN</option>
            <option value="system">Google Drive &amp; Backups</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All User Roles</option>
            <option value="student">Student Events</option>
            <option value="admin">Admin Operations</option>
            <option value="system">System Background</option>
          </select>
        </div>
      </div>

      {/* 3. Activity Logs List Table */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#cddce5] text-[#60768a] font-extrabold uppercase text-[10px]">
                <th className="pb-3 pl-2">Time / Status</th>
                <th className="pb-3">User &amp; Role</th>
                <th className="pb-3">Action &amp; Category</th>
                <th className="pb-3">Activity Description</th>
                <th className="pb-3 pr-2 text-right">IP &amp; Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cddce5]/50 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#60768a]">
                    No activity logs recorded matching your filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedTime = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const formattedDate = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });

                  return (
                    <tr key={log.id} className="hover:bg-[#edf2f3]/40 transition-colors">
                      {/* Time & Status */}
                      <td className="py-3 pl-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {log.status === "success" && (
                            <CheckCircle2 size={15} className="text-[#159366] shrink-0" />
                          )}
                          {log.status === "warning" && (
                            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                          )}
                          {log.status === "info" && (
                            <Info size={15} className="text-[#007fb8] shrink-0" />
                          )}
                          <div>
                            <p className="font-mono text-xs font-black text-[#102c45]">{formattedTime}</p>
                            <span className="text-[10px] text-[#94a3b8]">{formattedDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* User & Role */}
                      <td className="py-3">
                        <p className="font-bold text-[#102c45] truncate max-w-[170px]">{log.userName}</p>
                        <span
                          className={`inline-block rounded-md px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider ${
                            log.userRole === "admin"
                              ? "bg-[#102c45] text-[#38d995]"
                              : log.userRole === "system"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-[#e0f2fe] text-[#007fb8]"
                          }`}
                        >
                          {log.userRole}
                        </span>
                      </td>

                      {/* Action & Category */}
                      <td className="py-3">
                        <p className="font-black text-[#102c45]">{log.action}</p>
                        <span className="inline-block rounded-full bg-[#f1f5f9] border border-[#e2e8f0] px-2 py-0.5 text-[9.5px] font-bold text-[#60768a]">
                          {log.category}
                        </span>
                      </td>

                      {/* Activity Description */}
                      <td className="py-3 text-[#60768a] max-w-sm">
                        <p className="line-clamp-2 text-xs leading-relaxed">{log.details}</p>
                      </td>

                      {/* IP & Device */}
                      <td className="py-3 pr-2 text-right font-mono text-[11px] text-[#60768a]">
                        <p className="font-bold text-[#102c45]">{log.ipAddress}</p>
                        <span className="text-[10px] text-[#94a3b8] truncate block max-w-[180px] ml-auto">
                          {log.device}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Activity Logs Pagination */}
        <LmsPagination
          currentPage={currentPage}
          totalItems={filteredLogs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[15, 30, 60, 100]}
          itemName="audit log events"
        />
      </div>

      {/* Clear Logs PIN Confirmation Modal */}
      <DeletePinModal
        isOpen={isClearModalOpen}
        title="Clear Activity Audit Logs?"
        description="This will purge all user surveillance and session audit logs permanently. Authorize with your Administrator Delete PIN."
        actionButtonText="Purge All Logs"
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearLogs}
      />
    </div>
  );
}
