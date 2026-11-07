"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { loginLms, LMSUser } from "@/lib/lmsStore";

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenJoin?: () => void;
}

export default function StudentLoginModal({
  isOpen,
  onClose,
  onOpenJoin,
}: StudentLoginModalProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loginSuccessUser, setLoginSuccessUser] = useState<LMSUser | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const result = await loginLms(phone, password);
      setIsLoading(false);

      if (result.success && result.user) {
        setLoginSuccessUser(result.user);
        setTimeout(() => {
          onClose();
          if (result.user?.role === "admin") {
            router.push("/lms/admin");
          } else {
            router.push("/lms/student");
          }
        }, 1200);
      } else {
        setErrorMsg(result.error || "Invalid phone number or password. Please try again.");
      }
    } catch {
      setIsLoading(false);
      setErrorMsg("Failed to authenticate. Please check connection and try again.");
    }
  };

  const handleDemoFill = (role: "student" | "admin") => {
    setErrorMsg("");
    if (role === "student") {
      setPhone("0771234567");
      setPassword("pass123");
    } else {
      setPhone("0719998877");
      setPassword("admin123");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[490px] max-h-[92dvh] overflow-y-auto rounded-3xl border border-[#cddce5] bg-white p-7 text-[#102c45] shadow-2xl shadow-[#102c45]/20 animate-[scaleUp_0.25s_cubic-bezier(0.16,1,0.3,1)] max-sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Subtle Blue Glows in Modal Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-[#007fb8]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 size-56 rounded-full bg-[#0ac9e8]/10 blur-3xl"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-[#cddce5] bg-[#edf2f3] text-[#60768a] hover:bg-[#e2e8f0] hover:text-[#102c45] active:scale-95 transition-all cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {loginSuccessUser ? (
          /* Success Screen */
          <div className="py-6 text-center animate-[fadeIn_0.3s_ease-out]">
            <div className="mx-auto mb-4 flex size-18 items-center justify-center rounded-full bg-[#e8f7f2] text-[#159366] border-2 border-[#38d995] shadow-[0_0_30px_rgba(56,217,149,0.35)]">
              <CheckCircle2 size={40} />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f7f2] border border-[#38d995]/40 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#159366]">
              Role Detected: {loginSuccessUser.role === "admin" ? "Administrator" : "Student"}
            </span>
            <h3 className="mt-3 text-2xl font-black text-[#102c45]">
              Welcome, {loginSuccessUser.fullName}!
            </h3>
            <p className="mt-2 text-sm text-[#60768a]">
              Redirecting you to your{" "}
              <strong className="text-[#007fb8]">
                {loginSuccessUser.role === "admin"
                  ? "Admin Management Portal"
                  : "Student LMS Portal"}
              </strong>
              ...
            </p>
            <div className="mt-5 flex justify-center">
              <div className="size-6 border-2 border-[#007fb8] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          /* Normal Login Form - White & Blue Theme */
          <>
            {/* Header Badge & Title */}
            <div className="mb-6 pr-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3.5 py-1 text-[11px] font-black tracking-wider uppercase text-[#007fb8]">
                <ShieldCheck size={14} className="text-[#007fb8]" />
                LMS Portal Login
              </div>
              <h2 className="mt-3 text-[26px] leading-tight font-black tracking-tight text-[#102c45]">
                Sign In to Your Account
              </h2>
              <p className="mt-1.5 text-[13px] text-[#60768a] leading-relaxed">
                Enter your registered mobile phone or auto-generated Student Index Number.
              </p>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-800">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Phone or Index Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#102c45] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-[#007fb8]" /> Mobile Phone or Index Number
                  </span>
                  <span className="text-[10.5px] font-semibold text-[#007fb8] bg-[#e0f2fe] px-2 py-0.5 rounded-full">
                    Auto Detection
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0771234567 or Index No (54300001)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/60 px-4 py-3 text-base sm:text-sm font-bold text-[#102c45] placeholder-[#94a3b8] outline-none transition-all focus:border-[#007fb8] focus:bg-white focus:ring-3 focus:ring-[#007fb8]/15"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#102c45] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock size={13} className="text-[#007fb8]" /> Password / PIN
                  </span>
                  <span className="text-[10.5px] text-[#159366] font-bold bg-[#e8f7f2] px-2 py-0.5 rounded-full">
                    Encrypted
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/60 px-4 py-3 pr-11 text-base sm:text-sm font-bold text-[#102c45] placeholder-[#94a3b8] outline-none transition-all focus:border-[#007fb8] focus:bg-white focus:ring-3 focus:ring-[#007fb8]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#102c45] transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#007fb8]/30 transition-all hover:opacity-95 hover:shadow-xl active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to LMS Dashboard</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* Quick 1-Click Demo Fill Buttons */}
              <div className="mt-2 rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3.5">
                <div className="mb-2.5 flex items-center justify-between text-[11px] font-bold text-[#102c45]">
                  <span className="flex items-center gap-1.5 text-[#007fb8] font-black">
                    <Sparkles size={13} className="text-[#007fb8]" /> Quick One-Click Testing:
                  </span>
                  <span className="text-[10px] text-[#60768a]">Auto Fills &amp; Tests</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoFill("student")}
                    className="flex flex-col items-start rounded-2xl border border-[#38d995]/40 bg-white p-2.5 text-left transition-all hover:bg-[#e8f7f2] hover:border-[#38d995] active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#159366] uppercase">
                      <GraduationCap size={13} /> Student Demo
                    </span>
                    <span className="text-[12px] font-black text-[#102c45] font-mono truncate w-full mt-0.5">
                      0771234567
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoFill("admin")}
                    className="flex flex-col items-start rounded-2xl border border-[#007fb8]/30 bg-white p-2.5 text-left transition-all hover:bg-[#e0f2fe] hover:border-[#007fb8] active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#007fb8] uppercase">
                      <ShieldCheck size={13} /> Admin Demo
                    </span>
                    <span className="text-[12px] font-black text-[#102c45] font-mono truncate w-full mt-0.5">
                      0719998877
                    </span>
                  </button>
                </div>
              </div>

              {/* Register Callout for Unregistered Users */}
              <div className="mt-1 flex flex-col items-center justify-center gap-2 border-t border-[#cddce5]/70 pt-4 text-center">
                <p className="text-xs text-[#60768a] font-medium">
                  Not registered for Evon Aravinda&apos;s Commerce classes yet?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenJoin) {
                      onOpenJoin();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-4 py-2 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  <Sparkles size={13} />
                  Register for 2026 / 2027 Batches
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
