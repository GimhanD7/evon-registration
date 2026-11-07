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
  School,
  Phone,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Printer,
  Trophy,
  IdCard,
  QrCode,
  RotateCcw,
} from "lucide-react";
import { LMSUser } from "@/data/lmsData";
import { updateLmsUser } from "@/lib/lmsStore";
import { printCredentialCardPdf } from "@/lib/pdfPrintService";
import { compressImageFile } from "@/lib/imageCompressor";

interface StudentProfileTabProps {
  currentUser: LMSUser;
  onUpdatePassword: (newPassword: string) => void;
  onUpdateUser?: (user: LMSUser) => void;
}

const AVATAR_PRESETS = [
  { id: "preset-1", label: "Top Student 1", url: "/images/top_student_rank1.jpg" },
  { id: "preset-2", label: "Top Student 2", url: "/images/top_student_rank2.jpg" },
  { id: "preset-3", label: "Top Student 3", url: "/images/top_student_rank3.jpg" },
  { id: "preset-4", label: "Scholar", url: "/images/student1.jpg" },
];

export default function StudentProfileTab({
  currentUser,
  onUpdatePassword,
  onUpdateUser,
}: StudentProfileTabProps) {
  // Editable fields state
  const [fullName, setFullName] = useState(currentUser.fullName || "");
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [parentPhone, setParentPhone] = useState(currentUser.parentPhone || "0777654321");
  const [school, setSchool] = useState(currentUser.school || "Visakha Vidyalaya, Colombo");
  const [batch, setBatch] = useState(currentUser.batch || "2026 O/L Speed Revision & Paper Class");
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || "/images/top_student_rank1.jpg");

  // Feedback messages
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Handle uploading custom photo
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
      setProfileSuccessMsg("Profile photo updated successfully!");
      setTimeout(() => setProfileSuccessMsg(""), 3500);
    } catch {
      alert("Failed to process image. Please try another PNG or JPG image.");
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  // Handle preset avatar selection
  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
    const updated: LMSUser = {
      ...currentUser,
      avatarUrl: url,
    };
    updateLmsUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
    setProfileSuccessMsg("Avatar updated successfully!");
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  // Handle removing custom photo
  const handleRemovePhoto = () => {
    setAvatarUrl("");
    const updated: LMSUser = {
      ...currentUser,
      avatarUrl: "",
    };
    updateLmsUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
    setProfileSuccessMsg("Profile photo removed.");
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  // Handle profile info update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const updated: LMSUser = {
      ...currentUser,
      fullName: fullName.trim(),
      phone: phone.trim(),
      parentPhone: parentPhone.trim(),
      school: school.trim(),
      batch: batch.trim(),
      avatarUrl: avatarUrl,
    };

    updateLmsUser(updated);
    if (onUpdateUser) onUpdateUser(updated);

    setProfileSuccessMsg("Student profile information saved successfully!");
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  // Handle password update
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

    onUpdatePassword(newPassword.trim());
    setPasswordSuccessMsg("Account password updated successfully!");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccessMsg(""), 3500);
  };

  const handlePrintID = () => {
    printCredentialCardPdf(currentUser, "student");
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

          {/* Student Header Details */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#38d995]/50 bg-[#e8f7f2] px-3 py-1 text-[11px] font-black text-[#159366]">
                <span className="size-2 rounded-full bg-[#159366] animate-pulse" />
                Active Student Account
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3 py-1 text-[11px] font-black text-[#007fb8]">
                <GraduationCap size={13} />
                Commerce Stream
              </span>
            </div>

            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#102c45] tracking-tight">
              {fullName}
            </h2>

            <p className="mt-1 text-xs sm:text-sm font-bold text-[#60768a]">
              {school} &bull; <span className="text-[#102c45]">{batch}</span>
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold text-[#60768a]">
              <div className="flex items-center gap-1.5 rounded-xl border border-[#cddce5] bg-[#edf2f3]/60 px-3 py-1.5">
                <IdCard size={15} className="text-[#007fb8]" />
                <span>
                  Index: <strong className="font-mono text-[#102c45]">{currentUser.indexNo || "53914864"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#cddce5] bg-[#edf2f3]/60 px-3 py-1.5">
                <Phone size={15} className="text-[#007fb8]" />
                <span className="font-mono text-[#102c45]">{phone}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#cddce5] bg-[#edf2f3]/60 px-3 py-1.5">
                <Calendar size={15} className="text-[#159366]" />
                <span>Enrolled: {currentUser.enrolledDate}</span>
              </div>
            </div>

            {/* Avatar Presets & Custom Upload Action Bar */}
            <div className="mt-5 pt-4 border-t border-[#cddce5]/60 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="text-[11px] font-bold text-[#60768a] mr-1">
                Choose Photo:
              </span>
              {AVATAR_PRESETS.map((preset) => (
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
                  title="Remove custom photo and use default initials"
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

      {/* Two-Column Grid: Digital Student ID Card & Academic Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Official Student Digital ID Card (Printable) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#102c45] flex items-center gap-2">
              <IdCard size={16} className="text-[#007fb8]" />
              Digital Student Identity Card
            </h3>
            <button
              type="button"
              onClick={handlePrintID}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#cddce5] bg-white px-3 py-1 text-[11px] font-bold text-[#60768a] hover:bg-[#edf2f3] hover:text-[#102c45] transition-colors cursor-pointer shadow-xs print:hidden"
            >
              <Printer size={12} />
              Print ID
            </button>
          </div>

          {/* Actual Card Surface */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#cddce5] bg-white p-5 shadow-md flex flex-col justify-between">
            {/* Top Navy/Ocean Brand Bar */}
            <div className="rounded-2xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] p-3 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-white/20 font-black text-xs text-[#0ac9e8]">
                  EA
                </span>
                <div className="leading-tight">
                  <div className="text-[10px] font-black tracking-wider text-[#0ac9e8] uppercase">
                    Evon Aravinda Education
                  </div>
                  <div className="text-[11px] font-black text-white">
                    Official Student Identity Card
                  </div>
                </div>
              </div>
              <ShieldCheck size={18} className="text-[#38d995]" />
            </div>

            {/* Student Photo & Identity Data */}
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
                    {fullName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-[#007fb8]">
                  Registered Candidate
                </span>
                <h4 className="text-base font-black text-[#102c45] truncate">
                  {fullName}
                </h4>
                <div className="text-[11px] font-bold text-[#60768a] truncate">
                  {school}
                </div>
                <div className="mt-1 font-mono text-xs font-black text-[#102c45]">
                  ID: <span className="text-[#007fb8]">{currentUser.indexNo || "53914864"}</span>
                </div>
              </div>
            </div>

            {/* Card Information Badges */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10.5px] pt-3 border-t border-[#cddce5]/60">
              <div>
                <span className="text-[#60768a] font-bold block">Academic Stream:</span>
                <span className="font-black text-[#102c45]">O/L Commerce</span>
              </div>
              <div>
                <span className="text-[#60768a] font-bold block">Session Batch:</span>
                <span className="font-black text-[#102c45] truncate block">2026 O/L Revision</span>
              </div>
              <div>
                <span className="text-[#60768a] font-bold block">Valid Through:</span>
                <span className="font-black text-[#159366]">2026/2027 Exams</span>
              </div>
              <div>
                <span className="text-[#60768a] font-bold block">Status:</span>
                <span className="font-black text-[#159366] inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-[#159366]" />
                  Verified Active
                </span>
              </div>
            </div>

            {/* Bottom Barcode / Security Footer */}
            <div className="mt-4 pt-3 border-t border-[#cddce5]/60 flex items-center justify-between text-[#60768a]">
              <div className="flex items-center gap-2">
                <QrCode size={26} className="text-[#102c45]" />
                <div className="text-[9px] font-mono leading-none">
                  <div>SEC-AUTH-2026</div>
                  <div className="text-[#007fb8] font-bold">EVON-LK-STUDENT</div>
                </div>
              </div>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#159366]">
                Authorised &bull; Active
              </span>
            </div>
          </div>

          {/* Academic Snapshot Cards */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-[#102c45] uppercase tracking-wider flex items-center gap-1.5">
              <Trophy size={14} className="text-[#f59e0b]" />
              Academic Standing Snapshot
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-center">
                <span className="text-[10px] font-bold text-[#60768a] block">Cumulative Average</span>
                <span className="text-xl font-black text-[#159366] mt-0.5 block">92.0%</span>
                <span className="text-[9px] font-extrabold text-[#159366]">Grade A* (Distinction)</span>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-center">
                <span className="text-[10px] font-bold text-[#60768a] block">Class Standing</span>
                <span className="text-xl font-black text-[#007fb8] mt-0.5 block">Rank #2</span>
                <span className="text-[9px] font-extrabold text-[#007fb8]">Top 1% Islandwide</span>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-center">
                <span className="text-[10px] font-bold text-[#60768a] block">Model Papers</span>
                <span className="text-xl font-black text-[#102c45] mt-0.5 block">3 / 4</span>
                <span className="text-[9px] font-extrabold text-[#60768a]">Graded &amp; Certified</span>
              </div>
              <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 p-3 text-center">
                <span className="text-[10px] font-bold text-[#60768a] block">Live Attendance</span>
                <span className="text-xl font-black text-[#159366] mt-0.5 block">98.5%</span>
                <span className="text-[9px] font-extrabold text-[#159366]">Consistent Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile Information Form & Security Credentials */}
        <div className="lg:col-span-7 space-y-6">
          {/* Detailed Editable Student Information */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#cddce5]/60 mb-5">
              <div>
                <h3 className="text-base font-black text-[#102c45] flex items-center gap-2">
                  <UserIcon size={18} className="text-[#007fb8]" />
                  Personal &amp; Enrollment Details
                </h3>
                <p className="text-xs text-[#60768a] mt-0.5">
                  Update your contact phone, school, and parent details.
                </p>
              </div>
              <span className="rounded-full bg-[#edf2f3] px-3 py-1 text-[10.5px] font-bold text-[#60768a]">
                Verified Enrolled
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter student full name"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Student Mobile (LMS Login ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0771234567"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-mono font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5 flex items-center gap-1.5">
                    <School size={13} className="text-[#007fb8]" />
                    School / Educational Institute *
                  </label>
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Visakha Vidyalaya, Colombo"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#159366]" />
                    Parent / Guardian Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="e.g. 0777654321"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-mono font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Target Batch
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="Batch name"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 px-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102c45] mb-1.5">
                    Student Examination Index No
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.indexNo || "53914864"}
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
                  Account Security &amp; Credentials
                </h3>
                <p className="text-xs text-[#60768a] mt-0.5">
                  Update your account password for portal authentication.
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full border border-[#38d995]/50 bg-[#e8f7f2] px-2.5 py-1 text-[10px] font-black text-[#159366]">
                <ShieldCheck size={13} /> Encrypted
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
                    New Password *
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
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 pr-10 pl-3.5 text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-[#60768a]">
                  Tip: Use numbers and letters for higher security.
                </span>
                <button
                  type="submit"
                  className="rounded-full bg-[#102c45] px-6 py-2.5 text-xs font-black text-white shadow-md hover:bg-[#007fb8] active:scale-95 transition-all cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
