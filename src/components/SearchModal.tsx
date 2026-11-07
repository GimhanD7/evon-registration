"use client";

import React, { useState } from "react";
import { X, Search, FileText, BookOpen, Video, ArrowRight } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (name: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectCourse,
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const searchableItems = [
    { title: "2026 O/L Accounting Full Theory Batch", type: "Course", icon: <BookOpen size={16} /> },
    { title: "2025 O/L Speed Revision & 25-Year Past Papers", type: "Course", icon: <BookOpen size={16} /> },
    { title: "2027 O/L Commerce Foundation Beginner Batch", type: "Course", icon: <BookOpen size={16} /> },
    { title: "O/L Basic Accounting Study Guide", type: "Study Pack", icon: <FileText size={16} /> },
    { title: "O/L Business Studies Practice Questions", type: "Study Pack", icon: <FileText size={16} /> },
    { title: "O/L Business & Accounting Studies Model Paper", type: "Past Paper", icon: <FileText size={16} /> },
    { title: "G.C.E. O/L Accounting 2024 Model Paper with Scheme", type: "Model Exam", icon: <FileText size={16} /> },
    { title: "Recorded Live Session: Balancing Ledger Accounts", type: "Video Replay", icon: <Video size={16} /> },
  ];

  const results = query.trim()
    ? searchableItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      )
    : searchableItems.slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[560px] max-h-[92dvh] overflow-y-auto rounded-3xl border border-[#cddce5] bg-white p-6 text-[#102c45] shadow-2xl animate-[scaleUp_0.25s_cubic-bezier(0.16,1,0.3,1)] max-sm:p-4.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 rounded-2xl border-2 border-[#007fb8] bg-[#f8fafc] px-4 py-2.5 shadow-xs">
          <Search size={18} className="text-[#007fb8] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search batches, past papers, ledger drills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-base sm:text-sm font-semibold text-[#102c45] outline-none placeholder-[#94a3b8]"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-full bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1] hover:text-[#102c45] active:scale-95 transition-all cursor-pointer"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5">
          <div className="text-[11px] font-black tracking-wider text-[#64748b] uppercase mb-3">
            {query.trim() ? "Search Results" : "Popular Resources & Batches"}
          </div>

          <div className="flex flex-col gap-2">
            {results.length > 0 ? (
              results.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-[#edf2f3] bg-[#f8fafc] p-3 cursor-pointer transition-all hover:bg-[#edf9f3] hover:border-[#a6f4ce] hover:translate-x-1 active:scale-[0.99]"
                  onClick={() => {
                    onSelectCourse(item.title);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#cddce5] text-[#007fb8] shadow-xs">
                      {item.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="truncate text-xs font-bold text-[#102c45]">{item.title}</div>
                      <div className="text-[10px] font-semibold text-[#007fb8] uppercase">{item.type}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#94a3b8] shrink-0 ml-2" />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#64748b]">
                No materials matching &quot;{query}&quot;. Try searching for &quot;Accounting&quot; or &quot;2026&quot;.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
