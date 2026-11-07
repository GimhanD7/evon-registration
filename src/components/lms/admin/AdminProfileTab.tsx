"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Monitor,
  Smartphone,
  Laptop,
  Sparkles,
  ShieldAlert,
  Check,
  Activity,
  X,
} from "lucide-react";
import { LMSUser } from "@/data/lmsData";
import { updateLmsUser } from "@/lib/lmsStore";
import { printCredentialCardPdf } from "@/lib/pdfPrintService";
import { compressImageFile } from "@/lib/imageCompressor";
import { getActivityLogs, logActivity, LMSActivityLog } from "@/lib/activityLogService";

interface AdminProfileTabProps {
  currentUser: LMSUser;
  totalStudents?: number;
  totalPapers?: number;
  totalQuizzes?: number;
  onUpdatePassword?: (newPassword: string) => void;
  onUpdateUser?: (user: LMSUser) => void;
}

const ADMIN_AVATAR_PRESETS = [
  { id: "educator-1", label: "Official Portrait", category: "Official", url: "/images/educator.jpg" },
  { id: "educator-2", label: "Lecture Session", category: "Classroom", url: "/images/classroom-lecture.jpg" },
  { id: "educator-3", label: "Seminar Hall", category: "Lecture", url: "/images/seminar-hall.jpg" },
  { id: "educator-4", label: "Exam Hall Session", category: "Academic", url: "/images/paper-session.jpg" },
  { id: "educator-5", label: "Award Ceremony", category: "Events", url: "/images/real-class-award.jpg" },
  { id: "educator-6", label: "Commerce Class Group", category: "Community", url: "/images/real-class-selfie.jpg" },
  { id: "educator-7", label: "Scholar Distinction #1", category: "Scholars", url: "/images/top_student_rank1.jpg" },
  { id: "educator-8", label: "Scholar Distinction #2", category: "Scholars", url: "/images/top_student_rank2.jpg" },
  { id: "educator-9", label: "Scholar Distinction #3", category: "Scholars", url: "/images/top_student_rank3.jpg" },
  { id: "educator-10", label: "Commerce Students Showcase", category: "Scholars", url: "/images/students_showcase.jpg" },
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
  const [deviceSuccessMsg, setDeviceSuccessMsg] = useState("");

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatarCategory, setSelectedAvatarCategory] = useState<string>("all");

  // Log History State
  const [adminLogs, setAdminLogs] = useState<LMSActivityLog[]>(() =>
    getActivityLogs().slice(0, 8)
  );

  // Devices History State
  const [sessions, setSessions] = useState([
    {
      id: "sess-cur",
      name: "Current Workstation",
      deviceType: "desktop",
      os: "Windows 11 Pro 64-bit",
      browser: "Google Chrome 128.0",
      ip: "127.0.0.1 (Localhost / XAMPP)",
      location: "Colombo, Sri Lanka",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "sess-2",
      name: "Lecture Hall Laptop",
      deviceType: "laptop",
      os: "macOS Sonoma 14.5",
      browser: "Apple Safari 17.5",
      ip: "192.168.1.105",
      location: "Negombo, Sri Lanka",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "sess-3",
      name: "Faculty Mobile Device",
      deviceType: "mobile",
      os: "iOS 17.6 (iPhone 15 Pro)",
      browser: "Mobile Safari",
      ip: "112.134.195.42",
      location: "Gampaha, Sri Lanka",
      lastActive: "Yesterday at 21:15",
      isCurrent: false,
    },
  ]);

  useEffect(() => {
    const handleLogUpdate = () => {
      setAdminLogs(getActivityLogs().slice(0, 8));
    };
    window.addEventListener("lms_activity_logs_change", handleLogUpdate);
    return () => window.removeEventListener("lms_activity_logs_change", handleLogUpdate);
  }, []);

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
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
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-3.5 py-1.5 text-[11px] font-black text-white shadow-xs hover:scale-102 transition-all cursor-pointer"
              >
                <Sparkles size={12} className="text-[#0ac9e8]" />
                <span>Choose Photo &amp; Avatar Gallery</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5">
                {ADMIN_AVATAR_PRESETS.slice(0, 5).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`group relative size-8 rounded-full border-2 overflow-hidden transition-all cursor-pointer ${
                      avatarUrl === preset.url
                        ? "border-[#007fb8] scale-110 shadow-md shadow-[#007fb8]/30"
                        : "border-white hover:border-[#0ac9e8] opacity-80 hover:opacity-100"
                    }`}
                    title={preset.label}
                  >
                    <Image
                      src={preset.url}
                      alt={preset.label}
                      width={32}
                      height={32}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>

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

          {/* 3. Devices History & Active Sessions */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#cddce5]/60">
              <div>
                <h3 className="text-base font-black text-[#102c45] flex items-center gap-2">
                  <Monitor size={18} className="text-[#007fb8]" />
                  Active Devices &amp; Login History
                </h3>
                <p className="text-xs text-[#60768a] mt-0.5">
                  Surveillance of current session and authenticated administrator devices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSessions((prev) => prev.filter((s) => s.isCurrent));
                  setDeviceSuccessMsg("All other active device sessions terminated successfully.");
                  logActivity(
                    "Admin Remote Sessions Terminated",
                    "security",
                    "Terminated secondary active login sessions.",
                    currentUser,
                    "warning"
                  );
                  setTimeout(() => setDeviceSuccessMsg(""), 3500);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <ShieldAlert size={13} />
                <span>Terminate Other Sessions</span>
              </button>
            </div>

            {deviceSuccessMsg && (
              <div className="rounded-2xl border border-[#38d995] bg-[#e8f7f2] p-3 text-xs font-black text-[#159366] flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>{deviceSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    sess.isCurrent
                      ? "border-[#007fb8]/40 bg-[#e0f2fe]/30"
                      : "border-[#cddce5] bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-white border border-[#cddce5] flex items-center justify-center shrink-0 shadow-2xs">
                      {sess.deviceType === "desktop" ? (
                        <Monitor size={20} className="text-[#007fb8]" />
                      ) : sess.deviceType === "laptop" ? (
                        <Laptop size={20} className="text-[#102c45]" />
                      ) : (
                        <Smartphone size={20} className="text-[#159366]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-[#102c45]">{sess.name}</span>
                        {sess.isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7f2] border border-[#38d995]/50 px-2 py-0.5 text-[9.5px] font-black text-[#159366]">
                            <span className="size-1.5 rounded-full bg-[#159366] animate-pulse" />
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#60768a] mt-0.5">
                        {sess.os} &bull; {sess.browser}
                      </p>
                      <p className="text-[10.5px] text-[#94a3b8] font-mono mt-0.5">
                        IP: {sess.ip} &bull; {sess.location}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Last Active</span>
                    <span className="text-xs font-black text-[#102c45]">{sess.lastActive}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Log History & Activity Trail */}
          <div className="rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#cddce5]/60">
              <div>
                <h3 className="text-base font-black text-[#102c45] flex items-center gap-2">
                  <Activity size={18} className="text-[#007fb8]" />
                  Administrator Log History
                </h3>
                <p className="text-xs text-[#60768a] mt-0.5">
                  Recent system events and administrative operations recorded for this account.
                </p>
              </div>
              <span className="rounded-full bg-[#edf2f3] px-3 py-1 text-[11px] font-bold text-[#60768a]">
                Showing last {adminLogs.length} events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#cddce5] text-[10.5px] font-black uppercase text-[#60768a]">
                    <th className="py-2 px-2.5">Timestamp</th>
                    <th className="py-2 px-2.5">Action</th>
                    <th className="py-2 px-2.5">Details</th>
                    <th className="py-2 px-2.5 text-center">Category</th>
                    <th className="py-2 px-2.5 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f3]">
                  {adminLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f8fafc]">
                      <td className="py-2.5 px-2.5 text-[11px] font-mono text-[#60768a] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-2.5 font-bold text-[#102c45]">{log.action}</td>
                      <td className="py-2.5 px-2.5 text-[#60768a] max-w-xs truncate">{log.details}</td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span className="rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-bold text-[#007fb8]">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-[11px] text-[#60768a]">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* AVATAR IMAGES GALLERY MODAL */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102c45]/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#cddce5] bg-white p-6 sm:p-7 shadow-2xl space-y-5">
            <input
              type="file"
              ref={modalFileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center justify-between pb-3 border-b border-[#cddce5]">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#007fb8]" />
                <h3 className="text-lg font-black text-[#102c45]">Choose Profile Photo &amp; Avatar</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="rounded-full p-1.5 text-[#60768a] hover:bg-[#edf2f3] hover:text-[#102c45] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {["all", "Official", "Classroom", "Lecture", "Events", "Scholars"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedAvatarCategory(cat)}
                  className={`rounded-full px-3 py-1 font-bold text-xs transition-colors cursor-pointer ${
                    selectedAvatarCategory === cat
                      ? "bg-[#102c45] text-white"
                      : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Avatar Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto p-1">
              {ADMIN_AVATAR_PRESETS.filter(
                (p) => selectedAvatarCategory === "all" || p.category === selectedAvatarCategory
              ).map((preset) => {
                const isSelected = avatarUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      handleSelectPreset(preset.url);
                      setIsAvatarModalOpen(false);
                    }}
                    className={`relative rounded-2xl border-2 p-2 flex flex-col items-center gap-2 transition-all cursor-pointer group ${
                      isSelected
                        ? "border-[#007fb8] bg-[#e0f2fe]/40 shadow-md shadow-[#007fb8]/20"
                        : "border-[#cddce5] bg-white hover:border-[#0ac9e8] hover:bg-[#edf2f3]/50"
                    }`}
                  >
                    <div className="relative size-16 rounded-full overflow-hidden border-2 border-white shadow-xs">
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        width={64}
                        height={64}
                        className="size-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#007fb8]/40 flex items-center justify-center">
                          <Check size={20} className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-[#102c45] text-center line-clamp-1">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Upload Strip inside modal */}
            <div className="pt-3 border-t border-[#cddce5] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => modalFileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="inline-flex items-center gap-2 rounded-full border border-[#007fb8] bg-[#e0f2fe] px-4 py-2 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload size={14} />
                <span>Upload Custom Photo from Device</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="rounded-full bg-[#102c45] px-5 py-2 text-xs font-black text-white hover:bg-[#007fb8] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
