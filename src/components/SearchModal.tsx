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
    <div className="fixed inset-0 [background:rgba(15,_23,_42,_0.6)] [backdrop-filter:blur(8px)] z-[1000] flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div
        className="bg-[#ffffff] rounded-[24px] w-full max-h-[90vh] overflow-y-auto relative [box-shadow:0_25px_60px_-15px_rgba(15,_23,_42,_0.35)] [border:1px_solid_rgba(226,_232,_240,_0.9)] animate-[scaleUp_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] max-[580px]:pt-6 max-[580px]:pb-6 max-[580px]:pl-4.5 max-[580px]:pr-4.5 max-w-[580px] p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 pt-2.5 pb-2.5 pl-3.5 pr-3.5 [border:2px_solid_#3b82f6] rounded-[14px] bg-[#f8fafc]">
          <Search size={20} className="text-[#3b82f6] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search courses, past papers, study guides, recordings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="[border:none] [background:transparent] w-full text-[length:1rem] text-[#0f172a] [outline:none] font-[inherit] max-sm:text-base"
          />
          <button
            type="button"
            onClick={onClose}
            className="bg-[#e2e8f0] [border:none] w-[28px] h-[28px] rounded-full flex items-center justify-center text-[#475569] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">
          <div className="text-[length:0.76rem] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-3">
            {query.trim() ? "Search Results" : "Popular Resources & Courses"}
          </div>

          <div className="flex flex-col gap-2">
            {results.length > 0 ? (
              results.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] bg-[#f8fafc] [border:1px_solid_#f1f5f9] cursor-pointer [transition:all_0.2s_ease] hover:bg-[#eff6ff] hover:[border-color:#bfdbfe] hover:[transform:translateX(3px)]"
                  onClick={() => {
                    onSelectCourse(item.title);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-[8px] bg-[#ffffff] text-[#1d4ed8] flex items-center justify-center shrink-0 [box-shadow:0_2px_6px_rgba(0,_0,_0,_0.05)]">{item.icon}</div>
                    <div className="flex flex-col">
                      <div className="text-[length:0.88rem] font-bold text-[#0f172a]">{item.title}</div>
                      <div className="text-[length:0.72rem] text-[#64748b]">{item.type}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#94a3b8]" />
                </div>
              ))
            ) : (
              <div className="text-center pt-6 pb-6 pl-2.5 pr-2.5 text-[length:0.9rem] text-[#64748b]">
                No materials matching &quot;{query}&quot;. Try searching for &quot;Accounting&quot; or &quot;2026&quot;.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
