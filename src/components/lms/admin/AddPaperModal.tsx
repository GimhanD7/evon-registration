import React, { useState } from "react";
import { X, FilePlus } from "lucide-react";
import { LMSPaper } from "@/data/lmsData";
import { useLmsBatches, COMMERCE_SUBJECT } from "@/lib/lmsStore";

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaper: (paperData: Omit<LMSPaper, "id">) => LMSPaper;
  nextPaperNumber: number;
  onSuccess: () => void;
}

export default function AddPaperModal({
  isOpen,
  onClose,
  onAddPaper,
  nextPaperNumber,
  onSuccess,
}: AddPaperModalProps) {
  const { batches: dbBatches } = useLmsBatches();
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState("May");
  const [marks, setMarks] = useState(100);
  const [batch, setBatch] = useState(dbBatches[0] || "2026/2027 O/L Commerce");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddPaper({
      paperNumber: nextPaperNumber,
      title: title.trim(),
      batch,
      subject: COMMERCE_SUBJECT,
      month,
      year: 2026,
      totalMarks: Number(marks) || 100,
      durationMinutes: 120,
      status: "published",
    });

    setTitle("");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-md rounded-3xl border border-[#cddce5] bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#007fb8]">
              <FilePlus size={16} />
            </span>
            <h3 className="text-base font-black text-[#102c45]">Publish Model Exam Paper</h3>
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
            <label className="block font-bold text-[#102c45] mb-1">Paper Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Model Paper #06 - Final Accounts Adjustments"
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#102c45] mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#102c45] mb-1">Total Marks</label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#102c45] mb-1">Target Commerce Batch</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3 font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none cursor-pointer"
            >
              {dbBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
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
              Publish Paper
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

