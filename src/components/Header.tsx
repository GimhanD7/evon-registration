"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Calendar,
  Trophy,
  GraduationCap,
  Phone,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  onOpenJoin: () => void;
}

const navItems = [
  { name: "Home", href: "/#hero" },
  { name: "Timetable", href: "/#timetable" },
  { name: "Class Photos", href: "/gallery" },
  { name: "Reviews", href: "/#student-videos" },
  { name: "Results", href: "/results" },
  { name: "Contact", href: "/#contact" },
];

export default function Header({ onOpenJoin }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const pathname = usePathname();

  const isHomeActive = pathname === "/";
  const isTimetableActive = pathname === "/timetable";
  const isResultsActive = pathname === "/results";

  return (
    <>
      {/* Top Header Bar - Visible on desktop/tablet, hidden on mobile screens */}
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
              className="flex items-center gap-6 max-[1100px]:hidden"
            >
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  aria-current={activeTab === item.name ? "location" : undefined}
                  className="whitespace-nowrap py-2 text-[12px] font-medium text-[#3d5069] transition-colors hover:text-[#159366] focus-visible:text-[#159366]"
                  onClick={() => setActiveTab(item.name)}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Top Right Action Button */}
            <div className="flex shrink-0 items-center gap-2.5 max-[640px]:gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJoin();
                }}
                className="min-h-11 rounded-full bg-[#0c2944] px-[22px] py-3 text-[12px] leading-4 font-bold text-white shadow-[0_4px_9px_-4px_rgba(12,41,68,0.3)] transition-colors hover:bg-[#164466] max-[640px]:max-w-[145px] max-[640px]:px-3.5 max-[640px]:py-2 max-[640px]:text-[10px]"
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
                className="hidden size-11 shrink-0 items-center justify-center rounded-full text-[#102c45] transition-colors hover:bg-[#edf9f3] max-[1100px]:flex"
              >
                {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>

          {/* Top Dropdown Drawer for Tablet/Laptop breakpoint */}
          {mobileMenuOpen && (
            <nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="absolute inset-x-0 top-[calc(100%+8px)] hidden max-h-[calc(100dvh-110px)] overflow-y-auto rounded-[24px] border border-[#e0eee7] bg-white p-4 shadow-[0_18px_45px_-15px_rgba(12,41,68,0.2)] max-[1100px]:block"
            >
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  aria-current={activeTab === item.name ? "location" : undefined}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-[#f0faf5] ${
                    activeTab === item.name
                      ? "bg-[#edf9f3] text-[#12845b]"
                      : "text-[#3d5069]"
                  }`}
                  onClick={() => {
                    setActiveTab(item.name);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Modern Floating Bottom Navigation Bar for Mobile Screens */}
      <div
        role="navigation"
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-3 inset-x-3 z-[150] mx-auto max-w-[430px] rounded-full border border-white/90 bg-white/95 px-2 py-1.5 shadow-[0_16px_40px_-10px_rgba(16,44,69,0.3)] backdrop-blur-2xl transition-all md:hidden"
      >
        <div className="flex items-center justify-between px-1">
          {/* 1. Home Tab */}
          <Link
            href="/"
            onClick={() => setActiveTab("Home")}
            className={`group relative flex flex-1 flex-col items-center justify-center py-1 transition-all ${
              isHomeActive
                ? "text-[#007fb8] font-black"
                : "text-[#60768a] font-medium hover:text-[#102c45]"
            }`}
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full transition-all ${
                isHomeActive ? "bg-[#e0f2fe] scale-110" : "group-hover:bg-[#f1f5f9]"
              }`}
            >
              <Home size={18} strokeWidth={isHomeActive ? 2.5 : 2} />
            </span>
            <span className="mt-0.5 text-[9.5px] leading-none tracking-tight">
              Home
            </span>
            {isHomeActive && (
              <span className="absolute -bottom-0.5 size-1 rounded-full bg-[#007fb8]" />
            )}
          </Link>

          {/* 2. Timetable Tab */}
          <Link
            href="/timetable"
            onClick={() => setActiveTab("Timetable")}
            className={`group relative flex flex-1 flex-col items-center justify-center py-1 transition-all ${
              isTimetableActive
                ? "text-[#007fb8] font-black"
                : "text-[#60768a] font-medium hover:text-[#102c45]"
            }`}
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full transition-all ${
                isTimetableActive
                  ? "bg-[#e0f2fe] scale-110"
                  : "group-hover:bg-[#f1f5f9]"
              }`}
            >
              <Calendar size={18} strokeWidth={isTimetableActive ? 2.5 : 2} />
            </span>
            <span className="mt-0.5 text-[9.5px] leading-none tracking-tight">
              Timetable
            </span>
            {isTimetableActive && (
              <span className="absolute -bottom-0.5 size-1 rounded-full bg-[#007fb8]" />
            )}
          </Link>

          {/* 3. Central Hero Action: Register Button */}
          <div className="relative -mt-5 flex flex-1 flex-col items-center justify-center">
            <button
              type="button"
              onClick={onOpenJoin}
              aria-label="Register for Classes"
              className="group flex flex-col items-center justify-center"
            >
              <span className="relative flex size-12 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] text-white shadow-[0_10px_25px_-5px_rgba(0,127,184,0.6)] transition-transform group-hover:scale-105 active:scale-95">
                <GraduationCap
                  size={22}
                  strokeWidth={2.3}
                  className="text-[#0ac9e8] transition-transform group-hover:rotate-12"
                />
                <span className="absolute -top-0.5 -right-0.5 flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#38d995] opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-[#38d995]" />
                </span>
              </span>
              <span className="mt-1 text-[9.5px] font-black tracking-tight text-[#102c45]">
                Register
              </span>
            </button>
          </div>

          {/* 4. Results Tab */}
          <Link
            href="/results"
            onClick={() => setActiveTab("Results")}
            className={`group relative flex flex-1 flex-col items-center justify-center py-1 transition-all ${
              isResultsActive
                ? "text-[#007fb8] font-black"
                : "text-[#60768a] font-medium hover:text-[#102c45]"
            }`}
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full transition-all ${
                isResultsActive
                  ? "bg-[#e0f2fe] scale-110"
                  : "group-hover:bg-[#f1f5f9]"
              }`}
            >
              <Trophy size={18} strokeWidth={isResultsActive ? 2.5 : 2} />
            </span>
            <span className="mt-0.5 text-[9.5px] leading-none tracking-tight">
              Results
            </span>
            {isResultsActive && (
              <span className="absolute -bottom-0.5 size-1 rounded-full bg-[#007fb8]" />
            )}
          </Link>

          {/* 5. Contact Tab */}
          <a
            href="/#contact"
            onClick={() => setActiveTab("Contact")}
            className="group relative flex flex-1 flex-col items-center justify-center py-1 text-[#60768a] font-medium transition-all hover:text-[#102c45]"
          >
            <span className="flex size-8 items-center justify-center rounded-full transition-all group-hover:bg-[#f1f5f9]">
              <Phone size={18} strokeWidth={2} />
            </span>
            <span className="mt-0.5 text-[9.5px] leading-none tracking-tight">
              Contact
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
