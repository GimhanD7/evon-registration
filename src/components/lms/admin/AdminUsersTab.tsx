"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Lock,
  ShieldCheck,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { LMSUser } from "@/data/lmsData";
import { useLmsBatches } from "@/lib/lmsStore";
import DeletePinModal from "@/components/lms/admin/DeletePinModal";
import LmsPagination from "@/components/lms/shared/LmsPagination";

interface AdminUsersTabProps {
  users: LMSUser[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddUser: () => void;
  onToggleStatus: (user: LMSUser) => void;
  onUpdateUser: (updatedUser: LMSUser) => void;
  onDeleteUser: (id: string, name: string) => void;
}

export default function AdminUsersTab({
  users,
  searchQuery,
  onSearchChange,
  onOpenAddUser,
  onToggleStatus,
  onUpdateUser,
  onDeleteUser,
}: AdminUsersTabProps) {
  const { batches: dbBatches } = useLmsBatches();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | "student" | "admin">("all");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("all");

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<LMSUser | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"student" | "admin">("student");
  const [editBatch, setEditBatch] = useState("");
  const [editSchool, setEditSchool] = useState("");
  const [editParentPhone, setEditParentPhone] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive" | "pending">("active");
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete PIN Security Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        (u.school && u.school.toLowerCase().includes(q)) ||
        (u.indexNo && u.indexNo.toLowerCase().includes(q));

      const matchesRole =
        selectedRoleFilter === "all" || u.role === selectedRoleFilter;

      const matchesBatch =
        selectedBatchFilter === "all" ||
        (u.batch && u.batch.toLowerCase() === selectedBatchFilter.toLowerCase());

      return matchesSearch && matchesRole && matchesBatch;
    });
  }, [users, searchQuery, selectedRoleFilter, selectedBatchFilter]);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRoleFilter, selectedBatchFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleOpenEdit = (user: LMSUser) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditPhone(user.phone);
    setEditPassword(user.password || "pass123");
    setEditRole(user.role === "admin" ? "admin" : "student");
    setEditBatch(user.batch || dbBatches[0] || "2026/2027 O/L Commerce");
    setEditSchool(user.school || "");
    setEditParentPhone(user.parentPhone || "");
    setEditStatus(user.status || "active");
    setShowPassword(false);
    setSaveSuccessMsg("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Notice: editingUser.indexNo is preserved permanently without modification
    const updated: LMSUser = {
      ...editingUser,
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      password: editPassword.trim(),
      role: editRole,
      batch: editBatch,
      school: editSchool.trim(),
      parentPhone: editParentPhone.trim(),
      status: editStatus,
      // indexNo is permanently locked and protected
      indexNo: editingUser.indexNo,
    };

    onUpdateUser(updated);
    setSaveSuccessMsg(`User "${updated.fullName}" updated successfully!`);
    setTimeout(() => {
      setEditingUser(null);
      setSaveSuccessMsg("");
    }, 1200);
  };

  const handleTriggerDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmProtectedDelete = () => {
    if (deleteTarget) {
      onDeleteUser(deleteTarget.id, deleteTarget.name);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3 py-0.5 text-[11px] font-black text-[#007fb8] mb-2">
            <ShieldCheck size={13} />
            <span>Master Account Directory</span>
          </div>
          <h3 className="text-xl font-black text-[#102c45]">Users Management</h3>
          <p className="text-xs text-[#60768a] mt-0.5">
            Manage credentials, Commerce batch enrollments, and roles. Permanent Index Numbers are strictly protected from modification.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddUser}
          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-5 py-2.5 text-xs font-black uppercase text-white shadow-md shadow-[#007fb8]/25 hover:scale-102 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} /> Add New User
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, phone, school, or permanent index..."
            className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/60 py-2.5 pl-11 pr-4 text-xs font-bold text-[#102c45] placeholder-[#94a3b8] focus:border-[#007fb8] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value as "all" | "student" | "admin")}
            className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">Students ({users.filter((u) => u.role === "student").length})</option>
            <option value="admin">Administrators ({users.filter((u) => u.role === "admin").length})</option>
          </select>

          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 text-xs font-bold text-[#102c45] focus:border-[#007fb8] focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Batches</option>
            {dbBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Users Table */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#cddce5] text-[#60768a] font-extrabold uppercase text-[10px]">
                <th className="pb-3 pl-2">User / Role</th>
                <th className="pb-3">Permanent Index</th>
                <th className="pb-3">Phone (Login)</th>
                <th className="pb-3">Batch &amp; School</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cddce5]/50 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#60768a]">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#edf2f3]/40 transition-colors">
                    {/* User & Role */}
                    <td className="py-3 pl-2 font-black text-[#102c45]">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#007fb8]/10 text-[#007fb8] text-xs font-black">
                          {u.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-[#102c45]">{u.fullName}</p>
                          <span
                            className={`inline-block rounded-md px-1.5 py-0.2 text-[9.5px] font-black uppercase tracking-wider ${
                              u.role === "admin"
                                ? "bg-[#102c45] text-[#38d995]"
                                : "bg-[#e0f2fe] text-[#007fb8]"
                            }`}
                          >
                            {u.role === "admin" ? "Master Admin" : "Student"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Permanent Index Number */}
                    <td className="py-3">
                      {u.indexNo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] border border-[#cbd5e1] px-2.5 py-1 font-mono text-[11px] font-black text-[#1e293b]">
                          <Lock size={11} className="text-[#64748b]" />
                          {u.indexNo}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94a3b8] italic">No Index (Admin)</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3 text-[#102c45] font-mono text-xs font-bold">
                      {u.phone}
                    </td>

                    {/* Batch & School */}
                    <td className="py-3 text-[#60768a]">
                      <p className="font-bold text-[#102c45] truncate max-w-[180px]">
                        {u.batch || "General Commerce"}
                      </p>
                      <span className="block text-[10px] text-[#94a3b8] truncate max-w-[180px]">
                        {u.school || "Faculty Institute"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(u)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black cursor-pointer transition-colors ${
                          u.status === "active"
                            ? "bg-[#e8f7f2] text-[#159366] hover:bg-[#d1fae5]"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {u.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="rounded-xl border border-[#cddce5] bg-white p-1.5 text-[#007fb8] hover:bg-[#e0f2fe] transition-colors cursor-pointer shadow-2xs"
                          title="Edit User Data"
                        >
                          <Edit3 size={14} />
                        </button>

                        {u.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => handleTriggerDelete(u.id, u.fullName)}
                            className="rounded-xl border border-[#cddce5] bg-white p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer shadow-2xs"
                            title="Protected Delete (Requires PIN)"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* User Pagination Bar */}
        <LmsPagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
          itemName="registered users"
        />
      </div>

      {/* 4. EDIT USER MODAL (INDEX NUMBER STRICTLY LOCKED) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-lg rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-2xl space-y-5 my-6 animate-[scaleUp_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#007fb8]">
                  <Edit3 size={16} />
                </span>
                <div>
                  <h4 className="text-sm font-black text-[#102c45]">Edit User Credentials</h4>
                  <p className="text-[11px] text-[#60768a]">
                    Permanent Index Number is immutable and locked.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-lg p-1 text-[#94a3b8] hover:bg-[#edf2f3] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="flex items-center gap-2 rounded-2xl bg-[#e8f7f2] border border-[#38d995] p-3 text-xs font-black text-[#159366]">
                <CheckCircle2 size={16} />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* PERMANENT INDEX NUMBER (STRICTLY LOCKED) */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Lock size={12} className="text-amber-700" />
                    Permanent Index Number (Locked)
                  </label>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9.5px] font-black text-amber-800">
                    System Protected
                  </span>
                </div>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={editingUser.indexNo || "N/A (Administrator)"}
                  className="w-full rounded-xl border border-amber-300 bg-white/90 py-2 px-3 font-mono text-xs font-black text-amber-950 cursor-not-allowed select-all"
                />
                <p className="text-[10px] text-amber-800 font-medium">
                  Index numbers are strictly locked to protect historical exam records, leaderboard XP points, and student integrity.
                </p>
              </div>

              {/* Full Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102c45] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102c45] mb-1">User Role *</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as "student" | "admin")}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102c45] mb-1">Mobile Phone (Login) *</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102c45] mb-1">LMS Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 pl-3 pr-9 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#60768a] hover:text-[#102c45] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Batch & School */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102c45] mb-1">Commerce Batch *</label>
                  <select
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none cursor-pointer"
                  >
                    {dbBatches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#102c45] mb-1">School</label>
                  <input
                    type="text"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    placeholder="e.g. Visakha Vidyalaya"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Parent Phone & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102c45] mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    placeholder="e.g. 0777654321"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102c45] mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "active" | "inactive" | "pending")}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none cursor-pointer"
                  >
                    <option value="active">Active (Access Granted)</option>
                    <option value="inactive">Inactive (Suspended)</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#cddce5]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-full border border-[#cddce5] px-4 py-2 font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-6 py-2 font-black text-white shadow-md shadow-[#007fb8]/25 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. PROTECTED DELETE PIN CONFIRMATION MODAL */}
      <DeletePinModal
        isOpen={!!deleteTarget}
        title={`Remove User "${deleteTarget?.name}"?`}
        description="This will permanently delete this student account and revoke portal access. Please authorize using your Administrator Delete Security PIN."
        actionButtonText="Authorize & Delete User"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmProtectedDelete}
      />
    </div>
  );
}
