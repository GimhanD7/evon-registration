"use client";

import React from "react";
import { X, Play, CheckCircle, Award } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenJoin: () => void;
}

export default function VideoModal({
  isOpen,
  onClose,
  onOpenJoin,
}: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[620px] max-h-[92dvh] overflow-y-auto rounded-3xl border border-[#cddce5] bg-white p-7 text-[#102c45] shadow-2xl animate-[scaleUp_0.25s_cubic-bezier(0.16,1,0.3,1)] max-sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5] hover:text-[#102c45] active:scale-95 transition-all cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="mb-5 pr-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3 py-1 text-[11px] font-extrabold text-[#007fb8] uppercase">
            <Award size={13} /> FREE SAMPLE MASTERCLASS
          </div>
          <h2 className="mt-2 text-2xl font-black text-[#102c45] leading-tight max-sm:text-xl">
            Understanding Basic Accounting
          </h2>
          <p className="mt-1 text-xs text-[#60768a]">
            Explore O/L accounting concepts with clear examples, guided practice and step-by-step explanations from Evon Aravinda.
          </p>
        </div>

        {/* Video Player Mockup */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-[#cddce5] shadow-md">
          <div className="relative aspect-video w-full bg-[#0c2944] flex items-center justify-center">
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[#38d995] text-[10.5px] font-bold px-2.5 py-0.5 rounded-md border border-white/20">
              HD 1080p • LIVE CLASS PREVIEW
            </div>
            <div className="flex size-14 items-center justify-center rounded-full bg-[#007fb8] text-white shadow-xl shadow-[#007fb8]/50 transition-transform hover:scale-110 active:scale-95 cursor-pointer">
              <Play size={24} fill="#ffffff" color="#ffffff" className="ml-1" />
            </div>
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/30 to-transparent">
              <div className="text-white text-xs font-bold truncate">
                O/L Commerce: Recording Transactions &amp; Balancing Ledgers
              </div>
              <div className="mt-1.5 h-1 w-full bg-white/25 rounded-full overflow-hidden">
                <div className="w-[42%] h-full bg-[#0ac9e8]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mb-5 bg-[#f8fafc] border border-[#cddce5]/70 p-4 rounded-2xl text-xs text-[#334155] font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-[#159366] shrink-0" />
            <span>Recording Business Transactions Made Simple</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-[#159366] shrink-0" />
            <span>Eliminating Common Mistakes in Ledger Balancing</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-[#159366] shrink-0" />
            <span>Building Confidence with O/L Multiple Choice Questions</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenJoin();
          }}
          className="w-full rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all cursor-pointer hover:shadow-xl"
        >
          Enroll in Full Batch to Unlock All Lessons ➔
        </button>
      </div>
    </div>
  );
}
