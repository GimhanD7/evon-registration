import React from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { LMSUser } from "@/data/lmsData";

interface AdminStudentsTabProps {
  users: LMSUser[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddUser: () => void;
  onToggleStatus: (user: LMSUser) => void;
  onDeleteUser: (id: string, name: string) => void;
}

export default function AdminStudentsTab({
  users,
  searchQuery,
  onSearchChange,
  onOpenAddUser,
  onToggleStatus,
  onDeleteUser,
}: AdminStudentsTabProps) {
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      (u.school && u.school.toLowerCase().includes(q)) ||
      (u.indexNo && u.indexNo.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
        <div>
          <h3 className="text-lg font-black text-[#102c45]">Student Account Management</h3>
          <p className="text-xs text-[#60768a] mt-0.5">
            Verify admissions, monitor batch enrollments, and configure access passwords.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddUser}
          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-[#007fb8]/25 hover:scale-102 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add New Student
        </button>
      </div>

      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by student name, phone number, school, or index..."
            className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/60 py-2.5 pl-11 pr-4 text-xs font-bold text-[#102c45] placeholder-[#94a3b8] focus:border-[#007fb8] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#cddce5] text-[#60768a] font-extrabold uppercase text-[10px]">
                <th className="pb-3 pl-2">Student</th>
                <th className="pb-3">Phone / Index</th>
                <th className="pb-3">Batch &amp; School</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cddce5]/50 font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#edf2f3]/50 transition-colors">
                  <td className="py-3 pl-2 font-black text-[#102c45]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-full bg-[#007fb8]/10 text-[#007fb8] text-xs font-bold">
                        {u.fullName.charAt(0)}
                      </div>
                      <span>{u.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-[#60768a] font-mono text-[11px]">
                    {u.phone}
                    {u.indexNo && (
                      <span className="block text-[10px] text-[#94a3b8]">
                        Idx: {u.indexNo}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-[#60768a]">
                    <span className="font-bold text-[#102c45]">
                      {u.school || "General"}
                    </span>
                    <span className="block text-[10px] text-[#94a3b8] truncate max-w-[180px]">
                      {u.batch}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(u)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black cursor-pointer ${
                        u.status === "active"
                          ? "bg-[#e8f7f2] text-[#159366] hover:bg-[#d1fae5]"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="py-3 pr-2 text-right">
                    {u.role !== "admin" && (
                      <button
                        type="button"
                        onClick={() => onDeleteUser(u.id, u.fullName)}
                        className="rounded-xl p-1 text-[#94a3b8] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove student"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
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

