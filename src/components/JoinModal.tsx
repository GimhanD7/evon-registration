"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CheckCircle2,
  Sparkles,
  User,
  Phone,
  MapPin,
  School,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { registerLmsStudent, setCurrentLmsUser, LMSUser, useLmsBatches } from "@/lib/lmsStore";
import { logActivity } from "@/lib/activityLogService";
import {
  validateFullName,
  validateWhatsAppPhone,
  validatePassword,
  validateSchool,
} from "@/lib/validation";

interface JoinModalProps {
  isOpen: boolean;
  initialCourse?: string;
  onClose: () => void;
  onOpenLogin?: () => void;
}

export default function JoinModal({
  isOpen,
  initialCourse,
  onClose,
  onOpenLogin,
}: JoinModalProps) {
  const router = useRouter();
  const { batches: dbBatches } = useLmsBatches();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [school, setSchool] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [selectedBatch, setSelectedBatch] = useState<string>(() => {
    if (initialCourse && dbBatches.includes(initialCourse)) return initialCourse;
    return dbBatches[0] || "2026/2027 O/L Commerce";
  });
  const [medium, setMedium] = useState("English Medium");
  const [mode, setMode] = useState("Islandwide Online (Live + Recordings)");

  useEffect(() => {
    if (initialCourse && dbBatches.length > 0) {
      const match = dbBatches.find(
        (b) =>
          b.toLowerCase().includes(initialCourse.toLowerCase()) ||
          initialCourse.toLowerCase().includes(b.toLowerCase())
      );
      if (match) setSelectedBatch(match);
    }
  }, [initialCourse, dbBatches]);

  // State after submission
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [registeredIndexNo, setRegisteredIndexNo] = useState("");
  const [registeredUser, setRegisteredUser] = useState<LMSUser | null>(null);
  const [copiedIndex, setCopiedIndex] = useState(false);
  const [showSavedPassword, setShowSavedPassword] = useState(false);

  // Field Touched & Validation State
  const [touched, setTouched] = useState<{
    name?: boolean;
    phone?: boolean;
    password?: boolean;
    school?: boolean;
  }>({});

  const nameValidation = useMemo(() => validateFullName(name), [name]);
  const phoneValidation = useMemo(() => validateWhatsAppPhone(phone), [phone]);
  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const schoolValidation = useMemo(() => validateSchool(school, false), [school]);

  const handleBlur = (field: "name" | "phone" | "password" | "school") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Mark all fields as touched for visual feedback
    setTouched({ name: true, phone: true, password: true, school: true });

    if (!nameValidation.valid) {
      setErrorMessage(nameValidation.error || "Please enter student's full name.");
      return;
    }
    if (!phoneValidation.valid) {
      setErrorMessage(phoneValidation.error || "Please enter a valid WhatsApp mobile number.");
      return;
    }
    if (!passwordValidation.valid) {
      setErrorMessage(passwordValidation.error || "Please create a password of at least 4 characters.");
      return;
    }
    if (!schoolValidation.valid) {
      setErrorMessage(schoolValidation.error || "Please enter student's school name.");
      return;
    }

    const cleanName = name.trim();
    const cleanPhone = phoneValidation.normalized || phone.trim();
    const cleanPass = password.trim();

    setIsLoading(true);

    try {
      const batchTitle = selectedBatch || dbBatches[0] || "2026/2027 O/L Commerce";

      const result = await registerLmsStudent({
        fullName: cleanName,
        phone: cleanPhone,
        password: cleanPass,
        batch: batchTitle,
        school: school.trim() || `${district} District School`,
      });

      setIsLoading(false);

      if (result.success && result.user) {
        setRegisteredIndexNo(result.user.indexNo || result.indexNo || "");
        setRegisteredUser(result.user);
        setSubmitted(true);
        logActivity(
          "New Student Registration",
          "user_management",
          `Registered account: ${result.user.fullName} (${result.user.phone}) • Batch: ${result.user.batch}`,
          result.user,
          "success"
        );
      } else {
        setErrorMessage(
          result.error ||
            "Registration could not be completed. Please check your details and try again."
        );
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    }
  };

  const handleCopyIndex = () => {
    if (!registeredIndexNo) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(registeredIndexNo);
    }
    setCopiedIndex(true);
    setTimeout(() => setCopiedIndex(false), 2200);
  };

  const handleGoToLms = () => {
    if (registeredUser) {
      setCurrentLmsUser(registeredUser);
    }
    onClose();
    router.push("/lms/student");
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setName("");
    setPhone("");
    setPassword("");
    setSchool("");
    setErrorMessage("");
    setRegisteredIndexNo("");
    setRegisteredUser(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[530px] max-h-[92dvh] overflow-y-auto rounded-3xl border border-[#cddce5] bg-white p-7 text-[#102c45] shadow-2xl animate-[scaleUp_0.25s_cubic-bezier(0.16,1,0.3,1)] max-sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5] hover:text-[#102c45] active:scale-95 transition-all cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {submitted ? (
          /* ========================================================
             SUCCESS SCREEN WITH PROMINENT AUTO-GENERATED INDEX NUMBER
             ======================================================== */
          <div className="py-2 text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#edf9f3] text-[#159366] border-2 border-[#38d995]/50 shadow-md">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f7f2] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#159366]">
                <ShieldCheck size={13} /> LMS Registration Confirmed
              </div>
              <h3 className="mt-2 text-2xl font-black text-[#102c45]">
                Welcome, {name}!
              </h3>
              <p className="mt-1 text-xs text-[#60768a]">
                Your student profile has been created and registered in the LMS portal.
              </p>
            </div>

            {/* HIGHLIGHTED UNIQUE INDEX NUMBER CARD */}
            <div className="rounded-2xl border-2 border-[#007fb8]/40 bg-[linear-gradient(135deg,#f0f9ff_0%,#e0f2fe_100%)] p-5 text-center shadow-md relative overflow-hidden">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#007fb8] flex items-center justify-center gap-1.5">
                <Sparkles size={14} className="text-[#0ac9e8]" />
                Official Student Index Number
              </div>

              <div className="my-2.5 flex items-center justify-center gap-2">
                <span className="font-mono text-3xl sm:text-4xl font-black tracking-wider text-[#102c45] bg-white px-4 py-1.5 rounded-2xl border border-[#007fb8]/30 shadow-inner">
                  {registeredIndexNo || "54300001"}
                </span>

                <button
                  type="button"
                  onClick={handleCopyIndex}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#102c45] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#007fb8] active:scale-95 transition-all cursor-pointer"
                  title="Copy Index Number"
                >
                  {copiedIndex ? (
                    <>
                      <Check size={14} className="text-[#38d995]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] font-bold text-[#254967] leading-relaxed">
                This is your unique, non-duplicating examination &amp; LMS index number.
                Please write it down or take a screenshot!
              </p>
            </div>

            {/* CREDENTIALS SUMMARY */}
            <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/70 p-4 text-left text-xs text-[#334155] space-y-2">
              <div className="font-black text-[#102c45] border-b border-[#cddce5]/70 pb-1.5 flex items-center justify-between">
                <span>LMS Portal Login Credentials</span>
                <span className="text-[10px] text-[#159366] font-bold">Status: Active</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#60768a] block">Index Number:</span>
                  <strong className="font-mono text-[#102c45]">{registeredIndexNo}</strong>
                </div>
                <div>
                  <span className="text-[#60768a] block">Phone / Login ID:</span>
                  <strong className="font-mono text-[#102c45]">{phone}</strong>
                </div>
                <div className="col-span-2 flex items-center justify-between pt-1 border-t border-[#cddce5]/50">
                  <div>
                    <span className="text-[#60768a] block">LMS Password:</span>
                    <strong className="font-mono text-[#102c45]">
                      {showSavedPassword ? password : "•".repeat(Math.max(password.length, 6))}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSavedPassword(!showSavedPassword)}
                    className="text-[11px] text-[#007fb8] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {showSavedPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showSavedPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleGoToLms}
                className="w-full rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all cursor-pointer hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>Enter LMS Student Portal</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full rounded-full border border-[#cddce5] bg-white py-2.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] hover:text-[#102c45] transition-all cursor-pointer"
              >
                Close &amp; Return to Home
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             STUDENT REGISTRATION FORM
             ======================================================== */
          <>
            <div className="mb-4 pr-8">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3 py-1 text-[11px] font-extrabold text-[#007fb8] uppercase">
                <Sparkles size={13} /> Official Student LMS Enrollment
              </div>
              <h2 className="mt-2 text-2xl font-black text-[#102c45] leading-tight">
                Join Access to Success
              </h2>
              <p className="mt-1 text-xs text-[#60768a]">
                Register for Evon Aravinda&apos;s O/L Commerce Classes. Your unique Index Number will be auto-generated upon submission.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                  {errorMessage.includes("already registered") && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenLogin) onOpenLogin();
                      }}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-black text-[#007fb8] underline cursor-pointer"
                    >
                      Click here to Log In directly &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#254967] flex items-center gap-1.5">
                    <User size={13} className="text-[#007fb8]" /> Full Name of Student *
                  </label>
                  {touched.name && (
                    nameValidation.valid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159366]">
                        <CheckCircle2 size={12} /> Valid Name
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                        <AlertCircle size={12} /> {nameValidation.error}
                      </span>
                    )
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!touched.name) setTouched((prev) => ({ ...prev, name: true }));
                  }}
                  onBlur={() => handleBlur("name")}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-xs font-medium text-[#102c45] outline-none transition-colors ${
                    touched.name
                      ? nameValidation.valid
                        ? "border-[#38d995] bg-[#edf9f3]/40 focus:border-[#159366]"
                        : "border-red-400 bg-red-50/40 focus:border-red-500"
                      : "border-[#cddce5] bg-[#f8fafc] focus:border-[#007fb8] focus:bg-white"
                  }`}
                />
              </div>

              {/* Mobile Phone & Password Row */}
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {/* WhatsApp Phone */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#254967] flex items-center gap-1.5">
                      <Phone size={13} className="text-[#007fb8]" /> WhatsApp Phone *
                    </label>
                    {touched.phone && (
                      phoneValidation.valid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159366]">
                          <CheckCircle2 size={12} /> Valid WhatsApp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                          <AlertCircle size={12} /> Invalid Phone
                        </span>
                      )
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="07X XXX XXXX (10 digits)"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (!touched.phone) setTouched((prev) => ({ ...prev, phone: true }));
                    }}
                    onBlur={() => handleBlur("phone")}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-xs font-medium text-[#102c45] outline-none transition-colors ${
                      touched.phone
                        ? phoneValidation.valid
                          ? "border-[#38d995] bg-[#edf9f3]/40 focus:border-[#159366]"
                          : "border-red-400 bg-red-50/40 focus:border-red-500"
                        : "border-[#cddce5] bg-[#f8fafc] focus:border-[#007fb8] focus:bg-white"
                    }`}
                  />
                  {touched.phone && !phoneValidation.valid ? (
                    <p className="text-[10.5px] font-semibold text-red-600 flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      <span>{phoneValidation.error}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#60768a]">
                      10 digits starting with 07 (e.g. 0771234567)
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#254967] flex items-center gap-1.5">
                      <Lock size={13} className="text-[#007fb8]" /> LMS Password *
                    </label>
                    {touched.password && (
                      passwordValidation.valid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159366]">
                          <CheckCircle2 size={12} /> Valid Password
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                          <AlertCircle size={12} /> Too Short
                        </span>
                      )
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min. 4 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (!touched.password) setTouched((prev) => ({ ...prev, password: true }));
                      }}
                      onBlur={() => handleBlur("password")}
                      className={`w-full rounded-xl border px-3.5 py-2.5 pr-9 text-base sm:text-xs font-medium text-[#102c45] outline-none transition-colors ${
                        touched.password
                          ? passwordValidation.valid
                            ? "border-[#38d995] bg-[#edf9f3]/40 focus:border-[#159366]"
                            : "border-red-400 bg-red-50/40 focus:border-red-500"
                          : "border-[#cddce5] bg-[#f8fafc] focus:border-[#007fb8] focus:bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#60768a] hover:text-[#102c45] cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {touched.password && !passwordValidation.valid ? (
                    <p className="text-[10.5px] font-semibold text-red-600 flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      <span>{passwordValidation.error}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#60768a]">
                      Min. 4 characters required for LMS access
                    </p>
                  )}
                </div>
              </div>

              {/* Target Batch & Medium */}
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#254967] flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-[#007fb8]" /> Commerce Batch Enrolled *
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full rounded-xl border border-[#38d995]/60 bg-[#edf9f3]/30 px-3.5 py-2.5 text-base sm:text-xs font-bold text-[#102c45] outline-none transition-colors focus:border-[#159366] focus:bg-white cursor-pointer"
                  >
                    {dbBatches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#254967]">Medium *</label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="w-full rounded-xl border border-[#cddce5] bg-[#f8fafc] px-3.5 py-2.5 text-base sm:text-xs font-bold text-[#102c45] outline-none transition-colors focus:border-[#007fb8] focus:bg-white"
                  >
                    <option value="English Medium">English Medium</option>
                  </select>
                </div>
              </div>

              {/* District & School */}
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#254967] flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#007fb8]" /> District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-[#cddce5] bg-[#f8fafc] px-3.5 py-2.5 text-base sm:text-xs font-bold text-[#102c45] outline-none transition-colors focus:border-[#007fb8] focus:bg-white cursor-pointer"
                  >
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Galle">Galle</option>
                    <option value="Matara">Matara</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Other">Other District (Islandwide)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#254967] flex items-center gap-1.5">
                      <School size={13} className="text-[#007fb8]" /> School Name
                    </label>
                    {school && schoolValidation.valid && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159366]">
                        <CheckCircle2 size={12} />
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Royal College, Colombo"
                    value={school}
                    onChange={(e) => {
                      setSchool(e.target.value);
                      if (!touched.school) setTouched((prev) => ({ ...prev, school: true }));
                    }}
                    onBlur={() => handleBlur("school")}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-xs font-medium text-[#102c45] outline-none transition-colors ${
                      touched.school && !schoolValidation.valid
                        ? "border-red-400 bg-red-50/40 focus:border-red-500"
                        : "border-[#cddce5] bg-[#f8fafc] focus:border-[#007fb8] focus:bg-white"
                    }`}
                  />
                  {touched.school && !schoolValidation.valid && (
                    <p className="text-[10.5px] font-semibold text-red-600 flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      <span>{schoolValidation.error}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Preferred Learning Mode */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#254967]">Preferred Learning Mode *</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full rounded-xl border border-[#cddce5] bg-[#f8fafc] px-3.5 py-2.5 text-base sm:text-xs font-bold text-[#102c45] outline-none transition-colors focus:border-[#007fb8] focus:bg-white"
                >
                  <option value="Islandwide Online (Live Zoom + HD Recordings)">
                    Islandwide Online (Live Zoom + HD Recordings)
                  </option>
                  <option value="Sakya - Kiribathgoda">Sakya - Kiribathgoda</option>
                  <option value="Science Image - Kadawatha">Science Image - Kadawatha</option>
                  <option value="Sipsara - Gampaha">Sipsara - Gampaha</option>
                  <option value="Maxford - Ganemulla">Maxford - Ganemulla</option>
                  <option value="Vishwa - Nittambuwa">Vishwa - Nittambuwa</option>
                  <option value="Maxima - Gampaha">Maxima - Gampaha</option>
                  <option value="Shiksha - Sapugaskanda">Shiksha - Sapugaskanda</option>
                  <option value="Siyoneth - Ragama">Siyoneth - Ragama</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all cursor-pointer hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Generating Index Number &amp; Registering...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Submit Registration &amp; Get Index Number</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#60768a] mt-0.5">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenLogin) onOpenLogin();
                  }}
                  className="font-bold text-[#007fb8] hover:underline cursor-pointer"
                >
                  Sign In with Phone or Index Number &rarr;
                </button>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
