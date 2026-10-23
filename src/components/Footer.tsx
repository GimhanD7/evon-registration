"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  Award,
  BookOpen,
  MessageCircle,
  Sparkles,
  Calendar,
  Trophy,
  ArrowUpRight,
} from "lucide-react";

interface FooterProps {
  onOpenLogin: () => void;
  onOpenJoin: () => void;
}

export default function Footer({ onOpenLogin, onOpenJoin }: FooterProps) {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      className="relative overflow-hidden bg-[#0c2944] pt-16 pb-8 text-[#94a3b8]"
      id="contact"
    >
      {/* Ambient background glows matching brand theme */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-1/4 -z-0 size-[450px] rounded-full bg-[#007fb8]/15 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-10 -z-0 size-[350px] rounded-full bg-[#0ac9e8]/10 blur-[90px]"
      />

      {/* Pre-footer Call to Action Banner (Theme Gradient) */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--container-max)] px-6 max-sm:px-4">
        <div className="mb-14 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/15 bg-[linear-gradient(135deg,#102c45_0%,#164466_45%,#007fb8_100%)] p-10 text-white shadow-[0_20px_45px_-10px_rgba(12,41,68,0.5)] max-sm:p-6">
          <div className="max-w-[620px]">
            <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-[#0ac9e8]/40 bg-[#0ac9e8]/15 px-3.5 py-1 text-[11px] font-black tracking-wider text-[#0ac9e8] uppercase backdrop-blur-md">
              <Sparkles size={13} fill="currentColor" /> ADMISSIONS OPEN FOR 2026 &amp; 2027 O/L
            </span>
            <h2 className="mb-2 text-[28px] font-black leading-[1.2] text-white max-sm:text-[22px]">
              Start Your O/L Commerce Journey Today
            </h2>
            <p className="text-[14.5px] leading-[1.65] text-[#d9edf4]">
              Join over 5,000+ ambitious commerce students across Sri Lanka guided by Evon Aravinda. Physical classes at 8 premier institutes or islandwide online learning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={onOpenJoin}
              className="group inline-flex items-center gap-3 rounded-full bg-[#0ac9e8] py-2.5 pr-2 pl-6 text-[13px] font-black text-[#06314b] shadow-lg transition-transform hover:scale-105 hover:bg-[#38d995]"
            >
              Register for Classes
              <span className="flex size-8 items-center justify-center rounded-full bg-[#06314b] text-white transition-transform group-hover:rotate-45">
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-[13px] font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              Student LMS Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links Grid (Theme Colors) */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--container-max)] px-6 max-sm:px-4">
        <div className="grid grid-cols-[1.3fr_1fr_1.1fr_1.1fr] gap-10 border-b border-white/10 pb-12 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {/* Col 1: Brand Info */}
          <div className="flex flex-col">
            <div className="mb-4.5 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 flex-col items-center justify-center rounded-[13px] bg-[linear-gradient(145deg,#a6f4ce_0%,#38d995_55%,#19b978_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
              >
                <span className="text-[20px] leading-none font-black tracking-[-1px]">EA</span>
                <span className="mt-0.5 text-[6px] leading-none font-extrabold tracking-[0.4px]">EDUCATION</span>
              </span>
              <div className="flex flex-col">
                <span className="text-[18px] leading-tight font-black tracking-[-0.4px] text-white">
                  Access to Success
                </span>
                <span className="text-[12px] leading-tight font-bold text-[#0ac9e8]">
                  with Evon Aravinda
                </span>
              </div>
            </div>

            <p className="mb-5 text-[13.5px] leading-[1.65] text-[#cddce5]">
              Sri Lanka&apos;s leading English Medium Business &amp; Accounting Studies academy, delivering proven results across 8 major institutes and islandwide.
            </p>

            <div className="w-fit rounded-xl border border-[#0ac9e8]/30 bg-[#0ac9e8]/10 px-3.5 py-2 text-[10.5px] font-black tracking-wider text-[#0ac9e8]">
              <span>DISCIPLINE</span> • <span>CONCEPT</span> • <span>PRACTICE</span> • <span>RESULTS</span>
            </div>
          </div>

          {/* Col 2: Timetable & Navigation */}
          <div>
            <h4 className="mb-5 text-[16px] font-black tracking-tight text-white">
              Weekly Schedules
            </h4>
            <ul className="flex list-none flex-col gap-3 text-[13.5px]">
              <li>
                <Link
                  href="/timetable"
                  className="inline-flex items-center gap-1.5 text-[#cddce5] transition-all hover:translate-x-1 hover:text-[#0ac9e8]"
                >
                  <Calendar size={14} className="text-[#007fb8]" />
                  All 8 Institutes Timetable
                </Link>
              </li>
              <li>
                <Link
                  href="/results"
                  className="inline-flex items-center gap-1.5 text-[#cddce5] transition-all hover:translate-x-1 hover:text-[#38d995]"
                >
                  <Trophy size={14} className="text-[#38d995]" />
                  2025 O/L Results (169+ Achievers)
                </Link>
              </li>
              <li>
                <a
                  href="/#timetable"
                  className="inline-block text-[#94a3b8] transition-all hover:translate-x-1 hover:text-[#0ac9e8]"
                >
                  Grade 10 Theory Batches
                </a>
              </li>
              <li>
                <a
                  href="/#timetable"
                  className="inline-block text-[#94a3b8] transition-all hover:translate-x-1 hover:text-[#0ac9e8]"
                >
                  Grade 11 Theory Batches
                </a>
              </li>
              <li>
                <a
                  href="/#timetable"
                  className="inline-block text-[#94a3b8] transition-all hover:translate-x-1 hover:text-[#0ac9e8]"
                >
                  Model Paper &amp; Speed Exam Classes
                </a>
              </li>
              <li>
                <a
                  href="/#hero"
                  className="inline-block text-[#94a3b8] transition-all hover:translate-x-1 hover:text-[#0ac9e8]"
                >
                  Home &amp; Course Overview
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Institute Locations */}
          <div>
            <h4 className="mb-5 text-[16px] font-black tracking-tight text-white">
              Physical Centers (8)
            </h4>
            <ul className="flex list-none flex-col gap-2.5 text-[13px] text-[#94a3b8]">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#007fb8]" />
                <span>
                  <strong className="text-white">Kiribathgoda:</strong> Sakya Higher Education
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#007fb8]" />
                <span>
                  <strong className="text-white">Kadawatha:</strong> Science Image Institute
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#007fb8]" />
                <span>
                  <strong className="text-white">Gampaha:</strong> Sipsara &amp; Maxima Institutes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#007fb8]" />
                <span>
                  <strong className="text-white">Ganemulla:</strong> Maxford Institute
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#007fb8]" />
                <span>
                  <strong className="text-white">Nittambuwa / Sapugaskanda / Ragama:</strong> Vishwa, Shiksha &amp; Siyoneth
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hotlines */}
          <div className="flex flex-col gap-4">
            <h4 className="mb-1 text-[16px] font-black tracking-tight text-white">
              Admissions &amp; Support
            </h4>

            <div className="flex items-start gap-3">
              <Phone size={17} className="mt-1 shrink-0 text-[#0ac9e8]" />
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#60768a]">
                  Hotline / Inquiries
                </div>
                <div className="text-[14px] font-extrabold text-white">
                  +94 77 123 4567
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle size={17} className="mt-1 shrink-0 text-[#38d995]" />
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#60768a]">
                  WhatsApp Coordinator
                </div>
                <div className="text-[14px] font-extrabold text-white">
                  +94 71 987 6543
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={17} className="mt-1 shrink-0 text-[#007fb8]" />
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#60768a]">
                  Student Inquiries
                </div>
                <div className="text-[14px] font-extrabold text-white">
                  info@accesstosuccess.lk
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={17} className="mt-1 shrink-0 text-[#0ac9e8]" />
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#60768a]">
                  Support Hours
                </div>
                <div className="text-[14px] font-extrabold text-white">
                  Daily 8:00 AM - 8:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[12.5px] text-[#72859c] max-sm:flex-col max-sm:text-center">
          <div>
            © 2026 Access to Success with Evon Aravinda. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#privacy"
              className="text-[#94a3b8] transition-colors hover:text-[#0ac9e8]"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="#terms"
              className="text-[#94a3b8] transition-colors hover:text-[#0ac9e8]"
            >
              Terms of Enrollment
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-bold text-[#e2e8f0] transition-all hover:bg-[#007fb8] hover:text-white"
              aria-label="Back to top"
            >
              Back to Top <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
