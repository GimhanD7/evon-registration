"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Calendar,
  Trophy,
  GraduationCap,
  Phone,
  Sparkles,
  Camera,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  // FileText,
  HelpCircle,
  User as UserIcon,
} from "lucide-react";
import StudentLoginModal from "@/components/StudentLoginModal";
import { getCurrentLmsUser, LMSUser } from "@/lib/lmsStore";

interface HeaderProps {
  onOpenJoin: () => void;
  onOpenLogin?: () => void;
}

const navItems = [
  { name: "Home", href: "/#hero", icon: Home },
  { name: "Timetable", href: "/timetable", icon: Calendar },
  { name: "Paper Class", href: "/paper-class", icon: BookOpen, badge: "Top Marks" },
  { name: "Class Photos", href: "/gallery", icon: Camera },
  { name: "Results", href: "/results", icon: Trophy },
  { name: "Reviews", href: "/#student-videos", icon: Sparkles },
  { name: "Contact", href: "/#contact", icon: Phone },
];

export default function Header({ onOpenJoin, onOpenLogin }: HeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalLoginOpen, setInternalLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<LMSUser | null>(null);
  const [activeTab, setActiveTab] = useState("Home");
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = () => {
      setCurrentUser(getCurrentLmsUser());
    };
    checkUser();
    window.addEventListener("lms_auth_change", checkUser);
    return () => window.removeEventListener("lms_auth_change", checkUser);
  }, []);

  const handleOpenLogin = () => {
    setMobileMenuOpen(false);
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      setInternalLoginOpen(true);
    }
  };

  const handleLmsAction = () => {
    setMobileMenuOpen(false);
    if (currentUser) {
      if (currentUser.role === "admin") {
        router.push("/lms/admin");
      } else {
        router.push("/lms/student");
      }
    } else {
      handleOpenLogin();
    }
  };

  const isHomeActive = pathname === "/";
  const isTimetableActive = pathname === "/timetable";
  const isResultsActive = pathname === "/results";
  const isPaperClassActive = pathname === "/paper-class";
  const isGalleryActive = pathname === "/gallery";
  const isLmsActive = pathname.startsWith("/lms");

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top Mobile Bar - Sleek App Header on Mobile Phones */}
      <div className="sticky top-0 z-[110] flex w-full max-w-full items-center justify-between gap-2 overflow-hidden border-b border-[#cddce5]/70 bg-white/95 px-3 py-2.5 backdrop-blur-xl md:hidden shadow-xs">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2"
          onClick={() => {
            setActiveTab("Home");
            setMobileMenuOpen(false);
          }}
        >
          <span
            aria-hidden="true"
            className="flex size-8 sm:size-9 shrink-0 flex-col items-center justify-center rounded-xl bg-[linear-gradient(145deg,#a6f4ce_0%,#38d995_55%,#19b978_100%)] text-white shadow-xs"
          >
            <span className="text-[15px] sm:text-[17px] leading-none font-black tracking-tight">EA</span>
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] sm:text-[14px] leading-tight font-black tracking-tight text-[#102c45]">
              Access to Success
            </span>
            <span className="truncate text-[9px] sm:text-[9.5px] leading-tight font-bold text-[#007fb8]">
              Evon Aravinda Commerce
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* LMS Button on Mobile Header */}
          <button
            type="button"
            onClick={handleLmsAction}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#cddce5] bg-[#f8fafc] px-2.5 py-1.5 text-[10.5px] font-black text-[#102c45] shadow-2xs transition-all hover:border-[#007fb8] hover:text-[#007fb8] active:scale-95 cursor-pointer"
          >
            <ShieldCheck size={13} className="text-[#007fb8]" />
            <span>{currentUser ? (currentUser.role === "admin" ? "Admin" : "LMS") : "LMS"}</span>
            {currentUser && <span className="size-1.5 rounded-full bg-[#38d995]" />}
          </button>
          <button
            type="button"
            onClick={onOpenJoin}
            className="shrink-0 rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-2.5 py-1.5 text-[10.5px] font-black text-white shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            2027 Batch
          </button>
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full border border-[#cddce5] bg-[#f8fafc] text-[#102c45] active:scale-95 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Top Header Bar - Visible on desktop/tablet */}
      <header className="sticky top-0 z-[100] bg-transparent px-6 py-2.5 max-md:hidden">
        <div className="relative mx-auto max-w-[1152px]">
          <div className="flex min-h-[68px] items-center justify-between gap-6 rounded-full border border-white bg-white/95 py-2.5 pr-[18px] pl-[18px] shadow-[0_8px_32px_-16px_rgba(16,67,48,0.14)] backdrop-blur-xl max-[640px]:min-h-[60px] max-[640px]:gap-2 max-[640px]:px-3">
            {/* Logo */}
            <Link
              href="/"
              id="logo-brand"
              aria-label="Access to Success home"
              className="flex shrink-0 items-center gap-3 max-[640px]:gap-2"
              onClick={() => {
                setActiveTab("Home");
                setMobileMenuOpen(false);
              }}
            >
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 flex-col items-center justify-center rounded-[13px] bg-[linear-gradient(145deg,#a6f4ce_0%,#38d995_55%,#19b978_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] max-[640px]:size-9"
              >
                <span className="text-[20px] leading-none font-black tracking-[-1px]">
                  EA
                </span>
                <span className="mt-0.5 text-[6px] leading-none font-extrabold tracking-[0.4px]">
                  EDUCATION
                </span>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5 max-[420px]:hidden">
                <span className="text-[17px] leading-tight font-bold tracking-[-0.4px] text-[#102c45] max-[640px]:text-[12px]">
                  Access to Success
                </span>
                <span className="text-[12px] leading-tight font-medium text-[#72859c] max-[640px]:text-[9px]">
                  with Evon Aravinda
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              aria-label="Main navigation"
              className="flex items-center gap-5 max-[1100px]:hidden"
            >
              {navItems.map((item) => {
                const isItemActive =
                  (item.href === "/paper-class" && isPaperClassActive) ||
                  (item.href === "/results" && isResultsActive) ||
                  (item.href === "/timetable" && isTimetableActive) ||
                  (item.href === "/gallery" && isGalleryActive) ||
                  (item.href === "/#hero" && isHomeActive && activeTab === "Home") ||
                  activeTab === item.name;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isItemActive ? "page" : undefined}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap py-2 text-[12px] font-medium transition-all ${isItemActive
                        ? "font-bold text-[#159366]"
                        : "text-[#3d5069] hover:text-[#159366] focus-visible:text-[#159366]"
                      }`}
                    onClick={() => setActiveTab(item.name)}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="rounded-full bg-[#e8faf1] px-1.5 py-0.5 text-[9px] font-extrabold text-[#159366] border border-[#a6f4ce]/80 shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Top Right Action Buttons */}
            <div className="flex shrink-0 items-center gap-2.5 max-[640px]:gap-2">
              <button
                type="button"
                onClick={handleLmsAction}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2.5 text-[12px] font-black transition-all active:scale-95 cursor-pointer shadow-xs ${isLmsActive || currentUser
                    ? "border-[#007fb8] bg-[#e0f2fe] text-[#007fb8]"
                    : "border-[#cddce5] bg-[#f8fafc] text-[#102c45] hover:border-[#007fb8] hover:text-[#007fb8]"
                  }`}
              >
                <ShieldCheck size={16} className="text-[#007fb8]" />
                <span>
                  {currentUser
                    ? currentUser.role === "admin"
                      ? "Admin LMS"
                      : "Student LMS"
                    : "LMS Portal"}
                </span>
                {currentUser && (
                  <span className="size-2 rounded-full bg-[#38d995] animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJoin();
                }}
                className="min-h-11 rounded-full bg-[#0c2944] px-[22px] py-3 text-[12px] leading-4 font-bold text-white shadow-[0_4px_9px_-4px_rgba(12,41,68,0.3)] transition-colors hover:bg-[#164466] active:scale-95 cursor-pointer max-[640px]:max-w-[145px] max-[640px]:px-3.5 max-[640px]:py-2 max-[640px]:text-[10px]"
              >
                2027 New Register
              </button>

              <button
                type="button"
                id="mobile-nav-toggle"
                aria-label={
                  mobileMenuOpen ? "Close navigation" : "Open navigation"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hidden size-11 shrink-0 items-center justify-center rounded-full text-[#102c45] transition-colors hover:bg-[#edf9f3] max-[1100px]:flex cursor-pointer"
              >
                {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex flex-col bg-black/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-[85%] max-w-[340px] flex-col justify-between bg-white p-5 shadow-2xl animate-[scaleUp_0.25s_cubic-bezier(0.16,1,0.3,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between border-b border-[#edf2f3] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#102c45] text-white">
                    <span className="text-[16px] font-black text-[#38d995]">EA</span>
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-[#102c45]">Access to Success</h3>
                    <p className="text-[10.5px] font-semibold text-[#007fb8]">Evon Aravinda</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex size-9 items-center justify-center rounded-full bg-[#f1f5f9] text-[#60768a]"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-4 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const ItemIcon = item.icon;
                  const isItemActive =
                    (item.href === "/paper-class" && isPaperClassActive) ||
                    (item.href === "/results" && isResultsActive) ||
                    (item.href === "/timetable" && isTimetableActive) ||
                    (item.href === "/gallery" && isGalleryActive) ||
                    (item.href === "/#hero" && isHomeActive && activeTab === "Home") ||
                    activeTab === item.name;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        setActiveTab(item.name);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-[13.5px] font-bold transition-all ${isItemActive
                          ? "bg-[#edf9f3] text-[#12845b]"
                          : "text-[#102c45] hover:bg-[#f8fafc]"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <ItemIcon size={18} className={isItemActive ? "text-[#159366]" : "text-[#007fb8]"} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span className="rounded-full bg-[#159366] px-2 py-0.5 text-[9.5px] font-black text-white">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight size={15} className="text-[#94a3b8]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="border-t border-[#edf2f3] pt-4">
              <button
                type="button"
                onClick={handleLmsAction}
                className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#cddce5] bg-[#f8fafc] py-3 text-center text-xs font-black text-[#102c45] shadow-2xs transition-all hover:border-[#007fb8] hover:text-[#007fb8] active:scale-95 cursor-pointer"
              >
                <ShieldCheck size={16} className="text-[#007fb8]" />
                {currentUser
                  ? currentUser.role === "admin"
                    ? "Open Admin LMS Dashboard"
                    : "Open Student LMS Dashboard"
                  : "Student & Admin LMS Portal"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJoin();
                }}
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-3 text-center text-xs font-black text-white shadow-md active:scale-95 cursor-pointer"
              >
                Register for 2026/2027 Classes
              </button>
              <p className="mt-2 text-center text-[11px] font-medium text-[#94a3b8]">
                8 Physical Institutes • Online LMS Batch
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Auto-Flexing Bottom Navigation Bar Strictly Locked to Mobile Screen Width */}
      <div
        role="navigation"
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-[100] w-full max-w-full border-t border-[#cddce5] bg-white/98 shadow-[0_-8px_30px_rgba(16,44,69,0.12)] backdrop-blur-2xl transition-all md:hidden pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 px-1 rounded-t-2xl sm:rounded-t-3xl"
      >
        {currentUser && currentUser.role === "student" ? (
          /* Student Logged In: Dynamic LMS Mobile Nav Bar (Matches LMS Functions) */
          <div className="mx-auto grid w-full max-w-[480px] grid-cols-6 items-end gap-0.5">
            {/* 1. Dashboard Overview */}
            <Link
              href="/lms/student?tab=overview"
              className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 ${pathname === "/lms/student"
                  ? "text-[#007fb8] font-black"
                  : "text-[#60768a] font-semibold hover:text-[#102c45]"
                }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl transition-all ${pathname === "/lms/student"
                    ? "bg-[#007fb8] text-white shadow-sm shadow-[#007fb8]/35 scale-105"
                    : "group-hover:bg-[#f1f5f9] text-[#60768a]"
                  }`}
              >
                <LayoutDashboard size={17} strokeWidth={pathname === "/lms/student" ? 2.4 : 2} />
              </span>
              <span className="mt-1 w-full truncate text-center text-[9px] leading-tight tracking-tight">
                Overview
              </span>
              {pathname === "/lms/student" && (
                <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
              )}
            </Link>

            {/* 2. Model Papers (Commented for now) */}
            {/* <Link
              href="/lms/student?tab=papers"
              className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 ${pathname === "/paper-class"
                  ? "text-[#007fb8] font-black"
                  : "text-[#60768a] font-semibold hover:text-[#102c45]"
                }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl transition-all ${pathname === "/paper-class"
                    ? "bg-[#007fb8] text-white shadow-sm shadow-[#007fb8]/35 scale-105"
                    : "group-hover:bg-[#f1f5f9] text-[#60768a]"
                  }`}
              >
                <FileText size={17} strokeWidth={pathname === "/paper-class" ? 2.4 : 2} />
              </span>
              <span className="mt-1 w-full truncate text-center text-[9px] leading-tight tracking-tight">
                Papers
              </span>
              {pathname === "/paper-class" && (
                <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
              )}
            </Link> */}

            {/* 3. Interactive Quizzes */}
            <Link
              href="/lms/student?tab=quizzes"
              className="group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 text-[#60768a] font-semibold hover:text-[#102c45]"
            >
              <span className="flex size-8 items-center justify-center rounded-xl transition-all group-hover:bg-[#f1f5f9] text-[#60768a]">
                <HelpCircle size={17} strokeWidth={2} />
              </span>
              <span className="mt-1 w-full truncate text-center text-[9px] leading-tight tracking-tight">
                Quizzes
              </span>
            </Link>

            {/* 4. Exam Results */}
            <Link
              href="/results"
              className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 ${pathname === "/results"
                  ? "text-[#007fb8] font-black"
                  : "text-[#60768a] font-semibold hover:text-[#102c45]"
                }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl transition-all ${pathname === "/results"
                    ? "bg-[#007fb8] text-white shadow-sm shadow-[#007fb8]/35 scale-105"
                    : "group-hover:bg-[#f1f5f9] text-[#60768a]"
                  }`}
              >
                <Trophy size={17} strokeWidth={pathname === "/results" ? 2.4 : 2} />
              </span>
              <span className="mt-1 w-full truncate text-center text-[9px] leading-tight tracking-tight">
                Results
              </span>
              {pathname === "/results" && (
                <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
              )}
            </Link>

            {/* 5. Leaderboard */}
            <Link
              href="/lms/student?tab=evaluation"
              className="group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 text-[#60768a] font-semibold hover:text-[#102c45]"
            >
              <span className="flex size-8 items-center justify-center rounded-xl transition-all group-hover:bg-[#f1f5f9] text-[#60768a]">
                <Trophy size={17} strokeWidth={2} />
              </span>
              <span className="mt-1 w-full truncate text-center text-[9px] leading-tight tracking-tight">
                Leaderboard
              </span>
            </Link>

            {/* 6. My Profile */}
            <Link
              href="/lms/student?tab=profile"
              className="group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 text-[#60768a] font-semibold hover:text-[#102c45]"
            >
              <span className="flex size-8 items-center justify-center rounded-xl transition-all group-hover:bg-[#f1f5f9] text-[#60768a]">
                <UserIcon size={17} strokeWidth={2} />
              </span>
              <span className="mt-1 w-full truncate text-center text-[9px] leading-tight tracking-tight">
                Profile
              </span>
            </Link>
          </div>
        ) : (
          /* Guest / Not Logged In: Original Public Home Screen Bottom Nav Bar */
          <div className="mx-auto grid w-full max-w-[480px] grid-cols-5 items-end">
            {/* 1. Home Tab */}
            <Link
              href="/"
              onClick={() => setActiveTab("Home")}
              className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 ${isHomeActive
                  ? "text-[#007fb8] font-black"
                  : "text-[#60768a] font-medium hover:text-[#102c45]"
                }`}
            >
              <span
                className={`flex size-7 sm:size-8 items-center justify-center rounded-full transition-all ${isHomeActive ? "bg-[#e0f2fe] scale-105" : "group-hover:bg-[#f1f5f9]"
                  }`}
              >
                <Home size={17} strokeWidth={isHomeActive ? 2.5 : 2} />
              </span>
              <span className="mt-0.5 w-full truncate text-center text-[9px] sm:text-[10px] leading-tight tracking-tight">
                Home
              </span>
              {isHomeActive && (
                <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
              )}
            </Link>

            {/* 2. Timetable Tab */}
            <Link
              href="/timetable"
              onClick={() => setActiveTab("Timetable")}
              className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 ${isTimetableActive
                  ? "text-[#007fb8] font-black"
                  : "text-[#60768a] font-medium hover:text-[#102c45]"
                }`}
            >
              <span
                className={`flex size-7 sm:size-8 items-center justify-center rounded-full transition-all ${isTimetableActive
                    ? "bg-[#e0f2fe] scale-105"
                    : "group-hover:bg-[#f1f5f9]"
                  }`}
              >
                <Calendar size={17} strokeWidth={isTimetableActive ? 2.5 : 2} />
              </span>
              <span className="mt-0.5 w-full truncate text-center text-[9px] sm:text-[10px] leading-tight tracking-tight">
                Timetable
              </span>
              {isTimetableActive && (
                <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
              )}
            </Link>

            {/* 3. Hero Action: Register Button */}
            <div className="relative -mt-4 sm:-mt-5 flex min-w-0 max-w-full flex-col items-center justify-center">
              <button
                type="button"
                onClick={onOpenJoin}
                aria-label="Register for Classes"
                className="group flex w-full min-w-0 flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                <span className="relative flex size-10 sm:size-11 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white shadow-[0_8px_20px_-3px_rgba(0,127,184,0.55)] transition-transform group-hover:scale-105">
                  <GraduationCap
                    size={20}
                    strokeWidth={2.3}
                    className="text-[#0ac9e8] transition-transform group-hover:rotate-12"
                  />
                  <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#38d995] opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-[#38d995]" />
                  </span>
                </span>
                <span className="mt-1 w-full truncate text-center text-[9px] sm:text-[10px] font-black tracking-tight text-[#102c45]">
                  Register
                </span>
              </button>
            </div>

            {/* 4. Paper Class Tab (Flagship) */}
            <Link
              href="/paper-class"
              onClick={() => setActiveTab("Paper Class")}
              className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 ${isPaperClassActive
                  ? "text-[#159366] font-black"
                  : "text-[#60768a] font-medium hover:text-[#102c45]"
                }`}
            >
              <span
                className={`flex size-7 sm:size-8 items-center justify-center rounded-full transition-all ${isPaperClassActive
                    ? "bg-[#edf9f3] scale-105 text-[#159366]"
                    : "group-hover:bg-[#f1f5f9]"
                  }`}
              >
                <BookOpen size={17} strokeWidth={isPaperClassActive ? 2.5 : 2} />
              </span>
              <span className="mt-0.5 w-full truncate text-center text-[9px] sm:text-[10px] leading-tight tracking-tight">
                Papers
              </span>
              {isPaperClassActive && (
                <span className="mt-0.5 size-1 rounded-full bg-[#159366]" />
              )}
            </Link>

            {/* 5. Results Tab */}
            <Link
              href="/results"
              onClick={() => setActiveTab("Results")}
              className={`group relative flex min-w-0 max-w-full flex-col items-center justify-center py-0.5 transition-all active:scale-95 ${isResultsActive
                  ? "text-[#007fb8] font-black"
                  : "text-[#60768a] font-medium hover:text-[#102c45]"
                }`}
            >
              <span
                className={`flex size-7 sm:size-8 items-center justify-center rounded-full transition-all ${isResultsActive
                    ? "bg-[#e0f2fe] scale-105"
                    : "group-hover:bg-[#f1f5f9]"
                  }`}
              >
                <Trophy size={17} strokeWidth={isResultsActive ? 2.5 : 2} />
              </span>
              <span className="mt-0.5 w-full truncate text-center text-[9px] sm:text-[10px] leading-tight tracking-tight">
                Results
              </span>
              {isResultsActive && (
                <span className="mt-0.5 size-1 rounded-full bg-[#007fb8]" />
              )}
            </Link>
          </div>
        )}
      </div>

      {/* Screen Fixed Floating LMS / Login Button on Mobile */}
      <aside
        aria-label="LMS Portal Access"
        className="fixed bottom-[74px] right-3.5 z-[95] md:hidden"
      >
        <button
          type="button"
          onClick={handleLmsAction}
          className="group flex items-center gap-2 rounded-full border border-white/60 bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-2 pr-3.5 pl-2.5 text-white shadow-[0_8px_24px_-4px_rgba(0,127,184,0.55),0_2px_6px_rgba(16,44,69,0.25)] backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-[#0ac9e8] shadow-inner">
            <ShieldCheck size={16} strokeWidth={2.4} />
            <span
              className={`absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2 ring-[#102c45] ${currentUser ? "bg-[#38d995]" : "bg-[#0ac9e8]"
                }`}
            />
          </span>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[11px] font-black tracking-tight text-white">
              {currentUser
                ? currentUser.role === "admin"
                  ? "Admin LMS"
                  : "My LMS"
                : "LMS Portal"}
            </span>
            <span className="mt-0.5 text-[8.5px] font-bold text-[#0ac9e8]">
              {currentUser ? "Open Dashboard" : "Login / Join"}
            </span>
          </div>
        </button>
      </aside>

      {/* Built-in Fallback Student Login Modal when page does not supply custom handler */}
      {!onOpenLogin && (
        <StudentLoginModal
          isOpen={internalLoginOpen}
          onClose={() => setInternalLoginOpen(false)}
          onOpenJoin={onOpenJoin}
        />
      )}
    </>
  );
}
