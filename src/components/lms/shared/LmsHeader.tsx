import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  LogOut,
  Menu,
} from "lucide-react";
import { LMSUser } from "@/data/lmsData";

interface LmsHeaderProps {
  user: LMSUser;
  activeTabLabel: string;
  role: "admin" | "student";
  onToggleMobileMenu: () => void;
  onLogout: () => void;
}

export default function LmsHeader({
  user,
  activeTabLabel,
  role,
  onToggleMobileMenu,
  onLogout,
}: LmsHeaderProps) {
  const isAdmin = role === "admin";

  return (
    <header className="h-16 shrink-0 w-full z-40 border-b border-[#cddce5] bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-xl shadow-xs flex items-center">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Logo & Optional Desktop Breadcrumb */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-[#0ac9e8] font-black text-sm sm:text-base shadow-sm group-hover:scale-105 transition-transform">
              EA
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] sm:text-[11px] font-black tracking-tight text-[#007fb8]">
                EVON ARAVINDA
              </span>
              <span className="text-[12px] sm:text-[13px] font-black tracking-tight text-[#102c45]">
                {isAdmin ? "ADMIN PORTAL" : "STUDENT LMS"}
              </span>
            </div>
          </Link>

          <span className="h-5 w-px bg-[#cddce5] hidden md:inline-block" />

          {/* Section Pill Badge: Hidden on mobile screen, visible on md+ */}
          <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe]/90 px-3 py-1 text-[10.5px] font-extrabold tracking-[1px] text-[#007fb8] uppercase shadow-xs">
            {isAdmin ? (
              <>
                <ShieldCheck size={13} className="text-[#0ac9e8]" />
                Master Control
              </>
            ) : (
              <>
                <GraduationCap size={13} className="text-[#007fb8]" />
                Student Portal
              </>
            )}
          </div>

          {/* Tab Label: Hidden on mobile screen, visible on lg+ */}
          <span className="hidden lg:inline-block text-[#94a3b8]">&bull;</span>
          <span className="hidden lg:inline-block text-xs font-black text-[#102c45]">
            {activeTabLabel}
          </span>
        </div>

        {/* Right: Quick Links, Profile Chip, Mobile Menu Toggle & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Links (Desktop only) */}
          {isAdmin ? (
            <Link
              href="/lms/student"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#007fb8] hover:bg-[#e0f2fe] transition-colors shadow-xs"
            >
              <Sparkles size={13} className="text-[#38d995]" /> Student View
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#60768a]">
              <span className="size-2 rounded-full bg-[#159366] animate-pulse" />
              <span>Online Session</span>
            </div>
          )}

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#cddce5] bg-white px-3 py-1.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] hover:text-[#102c45] transition-colors shadow-xs"
          >
            <ArrowLeft size={13} /> Exit to Site
          </Link>

          {/* User Profile Chip: Hidden on mobile, visible on md+ (already in mobile drawer) */}
          <div className="hidden md:flex items-center gap-2.5 rounded-full border border-[#cddce5] bg-white py-1 pr-3 pl-1.5 shadow-xs">
            <span className="flex size-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white text-xs font-black overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName}
                  width={28}
                  height={28}
                  className="size-full object-cover"
                />
              ) : (
                user.fullName.charAt(0)
              )}
            </span>
            <div className="flex flex-col text-left leading-none">
              <span className="text-xs font-black text-[#102c45] truncate max-w-[140px]">
                {user.fullName}
              </span>
              <span className="mt-0.5 text-[9px] font-bold text-[#159366]">
                {isAdmin ? "Administrator" : user.indexNo ? `ID: ${user.indexNo}` : "Student"}
              </span>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden flex size-9 items-center justify-center rounded-xl border border-[#cddce5] bg-white text-[#102c45] shadow-xs hover:bg-[#edf2f3] active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={18} />
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title={isAdmin ? "Exit Admin Session" : "Logout of Student Portal"}
            className="flex size-9 sm:size-8 items-center justify-center rounded-xl sm:rounded-full border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
