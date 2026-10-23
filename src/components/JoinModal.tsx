"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Sparkles, Send, BookOpen } from "lucide-react";

interface JoinModalProps {
  isOpen: boolean;
  initialCourse?: string;
  onClose: () => void;
}

export default function JoinModal({
  isOpen,
  initialCourse,
  onClose,
}: JoinModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [examYear, setExamYear] = useState(initialCourse?.match(/\b202[567]\b/)?.[0] ?? "2026");
  const [medium, setMedium] = useState("English Medium");
  const [mode, setMode] = useState("Islandwide Online (Live + Recordings)");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 [background:rgba(15,_23,_42,_0.6)] [backdrop-filter:blur(8px)] z-[1000] flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div
        className="bg-[#ffffff] rounded-[24px] w-full max-w-[500px] max-h-[90vh] overflow-y-auto pt-9 pb-9 pl-8 pr-8 relative [box-shadow:0_25px_60px_-15px_rgba(15,_23,_42,_0.35)] [border:1px_solid_rgba(226,_232,_240,_0.9)] animate-[scaleUp_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] max-[580px]:pt-6 max-[580px]:pb-6 max-[580px]:pl-4.5 max-[580px]:pr-4.5"
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

        {submitted ? (
          <div className="text-center pt-5 pb-5 pl-2.5 pr-2.5">
            <div className="w-[72px] h-[72px] rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center mt-0 mr-auto mb-4.5 ml-auto">
              <CheckCircle2 size={48}  />
            </div>
            <h3 className="text-[length:1.6rem] font-[850] text-[#0f172a] mb-2">Registration Successful!</h3>
            <p className="text-[length:0.95rem] text-[#475569] leading-[1.5] mb-5">
              Thank you, <strong>{name}</strong>! Your application for{" "}
              <strong>{examYear} O/L Commerce ({medium})</strong> has been received.
            </p>
            <div className="bg-[#f8fafc] [border:1px_solid_#e2e8f0] rounded-[12px] p-3.5 text-left text-[length:0.84rem] text-[#334155] leading-[1.6]">
              <div>Delivery District: <strong>{district}</strong></div>
              <div>Learning Mode: <strong>{mode}</strong></div>
              <div  className="mt-1.5 text-[#0284c7]">
                Our admissions team will send your batch Telegram/WhatsApp group link and student portal credentials to <strong>{phone}</strong> within 30 minutes.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-3 bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_60%,_#1e3a8a_100%)] text-[#ffffff] font-semibold text-[length:1rem] pt-[13px] pb-[13px] pl-6.5 pr-6.5 rounded-[var(--radius-pill)] [box-shadow:0_10px_25px_-4px_rgba(29,_78,_216,_0.42)] [transition:all_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] cursor-pointer hover:[transform:translateY(-2px)] hover:[box-shadow:0_16px_32px_-4px_rgba(29,_78,_216,_0.52)] hover:bg-[linear-gradient(135deg,_#0369a1_0%,_#1e40af_60%,_#172554_100%)] w-full mt-4"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 [background:rgba(14,_165,_233,_0.1)] text-[#0284c7] text-[length:0.72rem] font-extrabold tracking-[1px] pt-1 pb-1 pl-2.5 pr-2.5 rounded-full mb-3">
                <Sparkles size={14} /> NEW BATCH ADMISSIONS
              </div>
              <h2 className="text-[length:1.8rem] font-[850] text-[#0f172a] leading-[1.2]">Join Access to Success</h2>
              <p className="text-[length:0.88rem] text-[#64748b] mt-1.5 leading-[1.5]">
                {initialCourse
                  ? `Selected Course: ${initialCourse}`
                  : "Register for Evon Aravinda's 2025/2026/2027 O/L Commerce Batches."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">Full Name of Student *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)]"
                />
              </div>

              <div className="grid grid-cols-[1fr_1fr] gap-3.5 max-[580px]:grid-cols-[1fr]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="07X XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">Target Exam Year *</label>
                  <select
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value)}
                    className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)]"
                  >
                    <option value="2026">2026 O/L</option>
                    <option value="2025">2025 O/L Revision</option>
                    <option value="2027">2027 O/L Beginner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr] gap-3.5 max-[580px]:grid-cols-[1fr]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">Medium *</label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)]"
                  >
                    <option value="English Medium">English Medium</option>
                    <option value="Sinhala Medium">Sinhala Medium</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">District *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)]"
                  >
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Matale">Matale</option>
                    <option value="Galle">Galle</option>
                    <option value="Matara">Matara</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Other">Other District (Islandwide)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">School / College Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananda College, Royal College, Devi Balika"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">Preferred Learning Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)]"
                >
                  <option value="Sakya - Kiribathgoda">
                    Sakya - Kiribathgoda
                  </option>
                  <option value="Science Image - Kadawatha">
                    Science Image - Kadawatha
                  </option>
                  <option value="Sipsara - Gampaha">
                    Sipsara - Gampaha
                  </option>
                  <option value="Maxford - Ganemulla">
                    Maxford - Ganemulla
                  </option>
                  <option value="Vishwa - Nittambuwa">
                    Vishwa - Nittambuwa
                  </option>
                  <option value="Maxima - Gampaha">
                    Maxima - Gampaha
                  </option>
                  <option value="Shiksha - Sapugaskanda">
                    Shiksha - Sapugaskanda
                  </option>
                  <option value="Siyoneth - Ragama">
                    Siyoneth - Ragama
                  </option>
                  <option value="Islandwide Online (Live Zoom + Recordings)">
                    Islandwide Online (Live Zoom + HD Recordings)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-3 bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_60%,_#1e3a8a_100%)] text-[#ffffff] font-semibold text-[length:1rem] rounded-[var(--radius-pill)] [box-shadow:0_10px_25px_-4px_rgba(29,_78,_216,_0.42)] [transition:all_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] cursor-pointer hover:[transform:translateY(-2px)] hover:[box-shadow:0_16px_32px_-4px_rgba(29,_78,_216,_0.52)] hover:bg-[linear-gradient(135deg,_#0369a1_0%,_#1e40af_60%,_#172554_100%)] w-full p-3.5 mt-3"
              >
                Submit Registration ➔
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
