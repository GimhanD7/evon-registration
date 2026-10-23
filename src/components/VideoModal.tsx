"use client";

import React from "react";
import { X, Play, BookOpen, CheckCircle, Award } from "lucide-react";

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
    <div className="fixed inset-0 [background:rgba(15,_23,_42,_0.6)] [backdrop-filter:blur(8px)] z-[1000] flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div
        className="bg-[#ffffff] rounded-[24px] w-full max-h-[90vh] overflow-y-auto pt-9 pb-9 pl-8 pr-8 relative [box-shadow:0_25px_60px_-15px_rgba(15,_23,_42,_0.35)] [border:1px_solid_rgba(226,_232,_240,_0.9)] animate-[scaleUp_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] max-[580px]:pt-6 max-[580px]:pb-6 max-[580px]:pl-4.5 max-[580px]:pr-4.5 max-w-[680px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-[36px] h-[36px] rounded-full bg-[#f1f5f9] text-[#475569] flex items-center justify-center [transition:all_0.2s_ease] cursor-pointer z-[10] hover:bg-[#e2e8f0] hover:text-[#0f172a]"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 [background:rgba(14,_165,_233,_0.1)] text-[#0284c7] text-[length:0.72rem] font-extrabold tracking-[1px] pt-1 pb-1 pl-2.5 pr-2.5 rounded-full mb-3">
            <Award size={14} /> FREE SAMPLE MASTERCLASS
          </div>
          <h2 className="text-[length:1.8rem] font-[850] text-[#0f172a] leading-[1.2]">Understanding Basic Accounting</h2>
          <p className="text-[length:0.88rem] text-[#64748b] mt-1.5 leading-[1.5]">
            Explore O/L accounting concepts with clear examples, guided practice and step-by-step explanations from Evon Aravinda.
          </p>
        </div>

        {/* Video Player Mockup */}
        <div className="mb-5">
          <div className="relative w-full h-[280px] bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_100%)] rounded-[16px] overflow-hidden flex items-center justify-center [box-shadow:0_14px_30px_-8px_rgba(0,_0,_0,_0.3)]">
            <div className="absolute top-3.5 left-3.5 [background:rgba(0,_0,_0,_0.6)] [backdrop-filter:blur(8px)] text-[#38bdf8] text-[length:0.72rem] font-bold pt-1 pb-1 pl-2.5 pr-2.5 rounded-[6px] tracking-[0.5px]">HD 1080p • LIVE CLASS PREVIEW</div>
            <div className="w-[64px] h-[64px] rounded-full bg-[#1d4ed8] flex items-center justify-center pl-1 [box-shadow:0_0_30px_rgba(29,_78,_216,_0.8)] cursor-pointer [transition:transform_0.2s_ease] hover:[transform:scale(1.1)]">
              <Play size={28} fill="#ffffff" color="#ffffff" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 pt-3 pb-3 pl-4 pr-4 bg-[linear-gradient(to_top,_rgba(0,_0,_0,_0.8)_0%,_transparent_100%)]">
              <div className="text-[#ffffff] text-[length:0.82rem] font-semibold mb-1.5">
                O/L Commerce: Recording Transactions &amp; Balancing Ledgers
              </div>
              <div className="w-full h-[4px] [background:rgba(255,_255,_255,_0.25)] rounded-full overflow-hidden">
                <div className="w-[42%] h-full bg-[#38bdf8]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mb-6 bg-[#f8fafc] p-4 rounded-[14px]">
          <div className="flex items-center gap-2.5 text-[length:0.86rem] text-[#334155] font-medium">
            <CheckCircle size={16} className="text-[#10b981] shrink-0" />
            <span>Recording Business Transactions Made Simple</span>
          </div>
          <div className="flex items-center gap-2.5 text-[length:0.86rem] text-[#334155] font-medium">
            <CheckCircle size={16} className="text-[#10b981] shrink-0" />
            <span>Eliminating Common Mistakes in Ledger Balancing</span>
          </div>
          <div className="flex items-center gap-2.5 text-[length:0.86rem] text-[#334155] font-medium">
            <CheckCircle size={16} className="text-[#10b981] shrink-0" />
            <span>Building Confidence with O/L Multiple Choice Questions</span>
          </div>
        </div>

        <div >
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenJoin();
            }}
            className="inline-flex items-center justify-center gap-3 bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_60%,_#1e3a8a_100%)] text-[#ffffff] font-semibold text-[length:1rem] rounded-[var(--radius-pill)] [box-shadow:0_10px_25px_-4px_rgba(29,_78,_216,_0.42)] [transition:all_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] cursor-pointer hover:[transform:translateY(-2px)] hover:[box-shadow:0_16px_32px_-4px_rgba(29,_78,_216,_0.52)] hover:bg-[linear-gradient(135deg,_#0369a1_0%,_#1e40af_60%,_#172554_100%)] w-full p-3.5"
          >
            Enroll in Full Course to Unlock All Units ➔
          </button>
        </div>
      </div>
    </div>
  );
}
