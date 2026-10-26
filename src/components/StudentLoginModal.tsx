"use client";

import React, { useState } from "react";
import { X, Lock, User, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentLoginModal({
  isOpen,
  onClose,
}: StudentLoginModalProps) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [batch, setBatch] = useState("2026");
  const [loggedIn, setLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
  };

  const handleDemoFill = () => {
    setStudentId("EVON-2026-8842");
    setPassword("commerce2026");
    setBatch("2026");
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

        {loggedIn ? (
          <div className="text-center pt-5 pb-5 pl-2.5 pr-2.5">
            <div className="w-[72px] h-[72px] rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center mt-0 mr-auto mb-4.5 ml-auto">
              <CheckCircle2 size={48}  />
            </div>
            <h3 className="text-[length:1.6rem] font-[850] text-[#0f172a] mb-2">Welcome Back, Student!</h3>
            <p className="text-[length:0.95rem] text-[#475569] leading-[1.5] mb-5">
              Redirecting to your student dashboard for{" "}
              <strong>Batch {batch} O/L</strong>...
            </p>
            <div className="bg-[#f8fafc] [border:1px_solid_#e2e8f0] rounded-[12px] p-3.5 text-left text-[length:0.84rem] text-[#334155] leading-[1.6]">
              <div>Student ID: <strong>{studentId || "EVON-2026-8842"}</strong></div>
              <div>Status: Active Enrolled (Theory &amp; Revision)</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoggedIn(false);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-3 bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_60%,_#1e3a8a_100%)] text-[#ffffff] font-semibold text-[length:1rem] pt-[13px] pb-[13px] pl-6.5 pr-6.5 rounded-[var(--radius-pill)] [box-shadow:0_10px_25px_-4px_rgba(29,_78,_216,_0.42)] [transition:all_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] cursor-pointer hover:[transform:translateY(-2px)] hover:[box-shadow:0_16px_32px_-4px_rgba(29,_78,_216,_0.52)] hover:bg-[linear-gradient(135deg,_#0369a1_0%,_#1e40af_60%,_#172554_100%)] w-full mt-4"
            >
              Continue to LMS Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 [background:rgba(14,_165,_233,_0.1)] text-[#0284c7] text-[length:0.72rem] font-extrabold tracking-[1px] pt-1 pb-1 pl-2.5 pr-2.5 rounded-full mb-3">
                <ShieldCheck size={14} /> SECURE LMS PORTAL
              </div>
              <h2 className="text-[length:1.8rem] font-[850] text-[#0f172a] leading-[1.2]">Student Login</h2>
              <p className="text-[length:0.88rem] text-[#64748b] mt-1.5 leading-[1.5]">
                Access your video replays, online model exams, and homework tutes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">
                  <User size={15} /> Student ID or NIC Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EVON-2026-XXXX or 2005XXXXXX"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)] max-sm:text-base"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">
                  <KeyRound size={15} /> Password / Portal PIN
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)] max-sm:text-base"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[length:0.82rem] font-bold text-[#334155] flex items-center gap-1.5">Registered Batch</label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full pt-3 pb-3 pl-3.5 pr-3.5 rounded-[12px] [border:1.5px_solid_#cbd5e1] text-[length:0.92rem] font-[inherit] text-[#0f172a] bg-[#ffffff] [transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [outline:none] focus:[border-color:#1d4ed8] focus:[box-shadow:0_0_0_3px_rgba(29,_78,_216,_0.15)] max-sm:text-base"
                >
                  {/* <option value="2026">2026 O/L Commerce Theory Batch</option>
                  <option value="2025">2025 O/L Speed Revision &amp; Paper</option> */}
                  <option value="2027">2027 O/L Grade 10</option>
                  <option value="2027">2027 O/L Grade 11</option>
                  {/* <option value="special">Special Accounting Masterclass</option> */}
                </select>
              </div>

              <div className="flex items-center justify-between text-[length:0.82rem]">
                <label className="flex items-center gap-1.5 text-[#475569] cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="text-[#0284c7] font-semibold [text-decoration:none] hover:[text-decoration:underline]">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-3 bg-[linear-gradient(135deg,_#0284c7_0%,_#1d4ed8_60%,_#1e3a8a_100%)] text-[#ffffff] font-semibold text-[length:1rem] rounded-[var(--radius-pill)] [box-shadow:0_10px_25px_-4px_rgba(29,_78,_216,_0.42)] [transition:all_0.25s_cubic-bezier(0.16,_1,_0.3,_1)] cursor-pointer hover:[transform:translateY(-2px)] hover:[box-shadow:0_16px_32px_-4px_rgba(29,_78,_216,_0.52)] hover:bg-[linear-gradient(135deg,_#0369a1_0%,_#1e40af_60%,_#172554_100%)] w-full p-3.5 mt-2"
              >
                Sign In to Student Portal ➔
              </button>

              <div className="mt-3.5 pt-2.5 pb-2.5 pl-3.5 pr-3.5 bg-[#f8fafc] rounded-[10px] flex items-center justify-between text-[length:0.78rem] text-[#64748b]">
                <span>Want to test the portal?</span>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-[#1d4ed8] font-bold text-[length:0.78rem] cursor-pointer [text-decoration:underline]"
                >
                  Auto-fill Demo Credentials
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
