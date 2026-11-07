import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { LMSUser } from "@/data/lmsData";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: {
    fullName: string;
    phone: string;
    password?: string;
    role: "student";
    batch?: string;
    school?: string;
    indexNo?: string;
    parentPhone?: string;
    status: "active";
  }) => LMSUser;
  onSuccess: () => void;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onAddUser,
  onSuccess,
}: AddStudentModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [indexNo, setIndexNo] = useState("");
  const [batch, setBatch] = useState("2026 O/L Speed Revision & Paper Class");
  const [password, setPassword] = useState("pass123");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddUser({
      fullName: name.trim(),
      phone: phone.trim(),
      school: school.trim(),
      indexNo: indexNo.trim() || undefined,
      batch: batch.trim(),
      password: password.trim() || "pass123",
      role: "student",
      status: "active",
    });

    setName("");
    setPhone("");
    setSchool("");
    setIndexNo("");
    setPassword("pass123");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-md rounded-3xl border border-[#cddce5] bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e0f7fa] text-[#008dc4]">
              <UserPlus size={16} />
            </span>
            <h3 className="text-base font-black text-[#102c45]">Add New Student Account</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-[#94a3b8] hover:bg-[#edf2f3] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#102c45] mb-1">Student Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nethmi Rajapaksha"
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#102c45] mb-1">Mobile Phone (LMS Login)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0771234567"
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#102c45] mb-1">School</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Anula Vidyalaya"
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#102c45] mb-1">
                Index Number <span className="text-[10px] text-[#007fb8] font-normal">(Auto-generated if empty)</span>
              </label>
              <input
                type="text"
                value={indexNo}
                onChange={(e) => setIndexNo(e.target.value)}
                placeholder="Leave blank to auto-generate"
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#102c45] mb-1">Batch Enrolled</label>
            <input
              type="text"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#102c45] mb-1">Initial Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#cddce5] px-4 py-2 font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-5 py-2 font-black text-white hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
            >
              Create Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

