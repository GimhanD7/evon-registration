"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  User as UserIcon,
  Camera,
  Upload,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Phone,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Printer,
  IdCard,
  QrCode,
  RotateCcw,
  Briefcase,
} from "lucide-react";
import { LMSUser } from "@/data/lmsData";
import { updateLmsUser } from "@/lib/lmsStore";
import { printCredentialCardPdf } from "@/lib/pdfPrintService";
import { compressImageFile } from "@/lib/imageCompressor";

interface AdminProfileTabProps {
  currentUser: LMSUser;
  totalStudents?: number;
  totalPapers?: number;
  totalQuizzes?: number;
  onUpdatePassword?: (newPassword: string) => void;
  onUpdateUser?: (user: LMSUser) => void;
}

const ADMIN_AVATAR_PRESETS = [
  { id: "educator-1", label: "Official Portrait", url: "/images/educator.jpg" },
  { id: "educator-2", label: "Lecture Session", url: "/images/classroom-lecture.jpg" },
  { id: "educator-3", label: "Seminar Hall", url: "/images/seminar-hall.jpg" },
  { id: "educator-4", label: "Exam Hall", url: "/images/paper-session.jpg" },
];

export default function AdminProfileTab({
  currentUser,
  totalStudents = 12,
  totalPapers = 4,
  totalQuizzes = 3,
  onUpdatePassword,
  onUpdateUser,
}: AdminProfileTabProps) {
  // Form fields
  const [fullName, setFullName] = useState(currentUser.fullName || "Evon Aravinda");
  const [phone, setPhone] = useState(currentUser.phone || "0719998877");
  const [email, setEmail] = useState("admin@evon.lk");
  const [school, setSchool] = useState(currentUser.school || "Main Faculty & Commerce Department");
  const [batch, setBatch] = useState(currentUser.batch || "Lead Educator & Master Admin");
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || "/images/educator.jpg");

  // Feedback states
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Upload custom photo from disk
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Please select an image smaller than 10MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Auto-compress and scale down to lightweight avatar (~15KB)
      // This eliminates localStorage QuotaExceededError completely
      const compressedDataUrl = await compressImageFile(file, 240, 0.75);
      setAvatarUrl(compressedDataUrl);
      const updated: LMSUser = {
        ...currentUser,
        avatarUrl: compressedDataUrl,
      };
      updateLmsUser(updated);
      if (onUpdateUser) onUpdateUser(updated);
      setProfileSuccessMsg("Administrator profile photo updated successfully!");
      setTimeout(() => setProfileSuccessMsg(""), 3500);
    } catch {
      alert("Failed to process image. Please try another PNG or JPG image.");
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  // Select preset avatar
  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
    const updated: LMSUser = {
      ...currentUser,
      avatarUrl: url,
    };
    updateLmsUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
    setProfileSuccessMsg("Administrator avatar updated!");
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  // Reset custom photo
  const handleRemovePhoto = () => {
    setAvatarUrl("");
    const updated: LMSUser = {
      ...currentUser,
      avatarUrl: "",
    };
    updateLmsUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
    setProfileSuccessMsg("Profile photo reset to initials.");
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  // Save profile info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const updated: LMSUser = {
      ...currentUser,
      fullName: fullName.trim(),
      phone: phone.trim(),
      school: school.trim(),
      batch: batch.trim(),
      avatarUrl: avatarUrl,
    };

    updateLmsUser(updated);
    if (onUpdateUser) onUpdateUser(updated);

    setProfileSuccessMsg("Administrator profile information saved successfully!");
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  // Password update
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg("");
    setPasswordSuccessMsg("");

    if (!newPassword.trim()) {
      setPasswordErrorMsg("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    if (onUpdatePassword) {
      onUpdatePassword(newPassword.trim());
    } else {
      updateLmsUser({ ...currentUser, password: newPassword.trim() });
    }

    setPasswordSuccessMsg("Administrator password updated successfully!");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccessMsg(""), 3500);
  };

  const handlePrintID = () => {
    printCredentialCardPdf(currentUser, "admin");
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Custom Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Profile Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-8 shadow-xs">
        {/* Ambient Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#0ac9e8]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 left-1/3 size-64 rounded-full bg-[#38d995]/15 blur-3xl"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Main Profile Photo with Hover Overlay */}
          <div className="relative group shrink-0">
            <div className="relative size-28 sm:size-32 rounded-full border-4 border-white bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white shadow-xl shadow-[#007fb8]/30 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  width={128}
                  height={128}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <UserIcon size={56} className="text-[#0ac9e8]" strokeWidth={2} />
              )}
            </div>

            {/* Quick Upload Button on Avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              title="Upload New Profile Photo"
              className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white shadow-md shadow-[#007fb8]/30 border-2 border-white hover:scale-110 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
            >
              <Camera size={16} className="text-[#0ac9e8]" />
            </button>
          </div>

          {/* Administrator Header Details */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/40 bg-[#e0f2fe] px-3.5 py-1 text-[11px] font-black text-[#007fb8] uppercase tracking-wider shadow-2xs">
                <ShieldCheck size={14} className="text-[#0ac9e8]" />
                Master Administrator &bull; Verified
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#38d995]/50 bg-[#e8f7f2] px-3 py-1 text-[11px] font-black text-[#159366]">
                <GraduationCap size={13} />
                Lead Commerce Faculty
              </span>
            </div>

            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#102c45] tracking-tight">
              {fullName}
            </h2>

            <p className="mt-1 text-xs sm:text-sm font-bold text-[#60768a]">
              Head of Commerce Education &bull; <span className="text-[#102c45]">System Superuser</span>
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold text-[#60768a]">
              <div className="flex items-center gap-1.5 rounded-xl border border-[#cddce5] bg-[#edf2f3]/60 px-3 py-1.5">
                <IdCard size={15} className="text-[#007fb8]" />
                <span>
                  Admin ID: <strong className="font-mono text-[#102c45]">ADM-EVON-01</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#cddce5] bg-[#edf2f3]/60 px-3 py-1.5">
                <Phone size={15} className="text-[#007fb8]" />
                <span className="font-mono text-[#102c45]">{phone}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#cddce5] bg-[#edf2f3]/60 px-3 py-1.5">
                <Calendar size={15} className="text-[#159366]" />
                <span>System Active Since: {currentUser.enrolledDate || "2024-01-01"}</span>
              </div>
            </div>

            {/* Avatar Presets & Custom Upload Action Bar */}
            <div className="mt-5 pt-4 border-t border-[#cddce5]/60 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="text-[11px] font-bold text-[#60768a] mr-1">
                Choose Photo:
              </span>
              {ADMIN_AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`group relative size-9 rounded-full border-2 overflow-hidden transition-all cursor-pointer ${
                    avatarUrl === preset.url
                      ? "border-[#007fb8] scale-110 shadow-md shadow-[#007fb8]/30"
                      : "border-white hover:border-[#0ac9e8] opacity-80 hover:opacity-100"
                  }`}
                  title={preset.label}
                >
                  <Image
                    src={preset.url}
                    alt={preset.label}
                    width={36}
                    height={36}
                    className="size-full object-cover"
                  />
                </button>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/40 bg-[#e0f2fe] px-3 py-1.5 text-[11px] font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Upload size={12} />
                <span>{isUploadingPhoto ? "Processing..." : "Upload Custom"}</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1 rounded-full border border-[#cddce5] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#60768a] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                  title="Reset to default initials"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Success Notification */}
      {profileSuccessMsg && (
        <div className="rounded-2xl border border-[#38d995] bg-[#e8f7f2] p-4 text-xs font-black text-[#159366] flex items-center gap-2 shadow-xs animate-[fadeIn_0.3s_ease-out]">
          <CheckCircle2 size={16} />
          <span>{profileSuccessMsg}</span>
        </div>
      )}

      {/* Two-Column Grid: Faculty ID Card & Control Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Official Faculty & Administrator Credential Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#102c45] flex items-center gap-2">
              <IdCard size={16} className="text-[#007fb8]" />
              Official Administrator Credential
            </h3>
            <button
              type="button"
              onClick={handlePrintID}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#cddce5] bg-white px-3 py-1 text-[11px] font-bold text-[#60768a] hover:bg-[#edf2f3] hover:text-[#102c45] transition-colors cursor-pointer shadow-xs print:hidden"
            >
              <Printer size={12} />
              Print Card
            </button>
          </div>

          {/* Actual Card Surface */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#cddce5] bg-white p-5 shadow-md flex flex-col justify-between">
            {/* Top Navy/Ocean Brand Bar */}
            <div className="rounded-2xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] p-3.5 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-white/20 font-black text-sm text-[#0ac9e8]">
                  EA
                </span>
                <div className="leading-tight">
                  <div className="text-[10px] font-black tracking-wider text-[#0ac9e8] uppercase">
                    Evon Aravinda Academy
                  </div>
                  <div className="text-[12px] font-black text-white">
                    Master Faculty Credential
                  </div>
                </div>
              </div>
              <ShieldCheck size={20} className="text-[#38d995]" />
            </div>

            {/* Administrator Photo & Identity Data */}
            <div className="mt-4 flex items-center gap-4">
              <div className="relative size-20 rounded-2xl border-2 border-[#007fb8] overflow-hidden bg-[#102c45] shrink-0 shadow-sm">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    width={80}
                    height={80}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center font-black text-white text-xl">
                    EA
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-[#007fb8]">
                  Lead Educator &amp; Admin
                </span>
                <h4 className="text-base font-black text-[#102c45] truncate">
                  {fullName}
                </h4>
                <div className="text-[11px] font-bold text-[#60768a] truncate">
                  {school}
                </div>
                <div className="mt-1 font-mono text-xs font-black text-[#102c45]">
                  ID: <span className="text-[#007fb8]">ADM-EVON-01</span>
                </div>
              </div>
            </div>

            {/* Card Information Badges */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10.5px] pt-3 border-t border-[#cddce5]/60">
              <div>
                <span className="text-[#60768a] font-bold block">Privilege Level:</span>
                <span className="font-black text-[#102c45]">Super Administrator</span>
              </div>
              <div>
                <span className="text-[#60768a] font-bold block">Faculty:</span>
                <span className="font-black text-[#102c45] truncate block">Business Studies</span>
              </div>
              <div>
                <span className="text-[#60768a] font-bold block">Active Authority:</span>
                <span className="font-black text-[#159366]">Full Master Access</span>
              </div>
              <div>
                <span className="text-[#60768a] font-bold block">Status:</span>
                <span className="font-black text-[#159366] inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-[#159366]" />
                  Verified Permanent
                </span>
              </div>
            </div>

            {/* Bottom Barcode / Security Footer */}
            <div className="mt-4 pt-3 border-t border-[#cddce5]/60 flex items-center justify-between text-[#60768a]">
              <div className="flex items-center gap-2">
                <QrCode size={26} className="text-[#102c45]" />
                <div className="text-[9px] font-mono leading-none">
                  <div>SEC-ROOT-AUTH</div>
                  <div className="text-[#007fb8] font-bold">EVON-ADMIN-MASTER</div>
                </div>
              </div>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#159366]">
                Root Access &bull; Verified
              </span>
            </div>
          </div>

          {/* System Management Metrics Snapshot */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-[#102c45] uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} className="text-[#007fb8]" />
              System Management Overview
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-center">
                <span className="text-[10px] font-bold text-[#60768a] block">Enrolled Students</span>
                <span className="text-xl font-black text-[#007fb8] mt-0.5 block">{totalStudents}</span>
                <span className="text-[9px] font-extrabold text-[#007fb8]">Active Registered</span>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-center">
                <span className="text-[10px] font-bold text-[#60768a] block">Model Papers</span>
                <span className="text-xl font-black text-[#102c45] mt-0.5 block">{totalPapers}</span>
                <span className="text-[9px] font-extrabold text-[#60768a]">Published &bull; Active</span>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-center">
                <span className="text-[10px] font-bold text-[#60768a] block">Speed Quizzes</span>
                <span className="text-xl font-black text-[#159366] mt-0.5 block">{totalQuizzes}</span>
                <span className="text-[9px] font-extrabold text-[#159366]">Interactive MCQ</span>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-center">
                <span className="text-[10px] font-bold text-[#60768a] block">Backend Link</span>
                <span className="text-xl font-black text-[#159366] mt-0.5 block">Online</span>
                <span className="text-[9px] font-extrabold text-[#159366]">MySQL &bull; XAMPP</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile Information Form & Security Credentials */}
        <div className="lg:col-span-7 space-y-6">
          {/* Detailed Editable Administrator Information */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#cddce5]/60 mb-5">
              <div>
                <h3 className="text-base font-black text-[#102c45] flex items-center gap-2">
                  <UserIcon size={18} className="text-[#007fb8]" />
                  Faculty &amp; Account Credentials
                </h3>
                <p className="text-xs text-[#60768a] mt-0.5">
                  Update your contact phone, email, and faculty affiliation.
                </p>
              </div>
              <span className="rounded-full bg-[#edf2f3] px-3 py-1 text-[10.5px] font-bold text-[#60768a]">
                Root Admin
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Administrator Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Evon Aravinda"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Mobile Phone (Admin Login ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0719998877"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-mono font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Faculty Department / Center
                  </label>
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Main Faculty & Commerce Department"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Official Admin Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@evon.lk"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Faculty Title / Designation
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="Lead Educator"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Permanent Admin Identifier
                  </label>
                  <input
                    type="text"
                    disabled
                    value="ADM-EVON-01 (Verified Master Root)"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/30 py-2.5 px-3.5 text-xs font-mono font-bold text-[#60768a] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-7 py-2.5 text-xs font-black text-white shadow-md shadow-[#007fb8]/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                >
                  Save Profile Information
                </button>
              </div>
            </form>
          </div>

          {/* Account Security & Password Update Section */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#cddce5]/60 mb-5">
              <div>
                <h3 className="text-base font-black text-[#102c45] flex items-center gap-2">
                  <Lock size={18} className="text-[#007fb8]" />
                  Administrator Security &amp; Credentials
                </h3>
                <p className="text-xs text-[#60768a] mt-0.5">
                  Update your master account password for the admin portal.
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full border border-[#38d995]/50 bg-[#e8f7f2] px-2.5 py-1 text-[10px] font-black text-[#159366]">
                <ShieldCheck size={13} /> Master Security
              </span>
            </div>

            {passwordSuccessMsg && (
              <div className="mb-4 rounded-2xl border border-[#38d995] bg-[#e8f7f2] p-3.5 text-xs font-black text-[#159366] flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-black text-red-600 flex items-center gap-2">
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    New Master Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 pr-10 pl-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#60768a] hover:text-[#102c45] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Confirm New Master Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new master password"
                      className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 pr-10 pl-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-[#60768a]">
                  Root Administrator credential protection.
                </span>
                <button
                  type="submit"
                  className="rounded-full bg-[#102c45] px-6 py-2.5 text-xs font-black text-white shadow-md hover:bg-[#007fb8] active:scale-95 transition-all cursor-pointer"
                >
                  Update Master Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
