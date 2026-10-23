"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Printer,
  Search,
  CheckCircle2,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JoinModal from "@/components/JoinModal";
import { institutesData } from "@/data/timetableData";

export default function TimetablePage() {
  const [selectedInstituteId, setSelectedInstituteId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(
    undefined
  );

  const handleOpenJoin = (courseName?: string) => {
    setSelectedCourse(courseName);
    setIsJoinOpen(true);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const filteredInstitutes = institutesData.filter((inst) => {
    const matchesInstitute =
      selectedInstituteId === "all" || inst.id === selectedInstituteId;

    const matchesSearch =
      searchQuery.trim() === "" ||
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesInstitute && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#edf2f3] text-[#102c45]">
      {/* Header */}
      <Header
        onOpenJoin={() => handleOpenJoin("2027 O/L Commerce Foundation Batch")}
      />

      <main className="py-10 max-sm:py-6">
        <div className="mx-auto w-full max-w-[1240px] px-8 max-sm:px-4">
          {/* Top Actions: Breadcrumb / Print */}
          <div className="mb-6 flex items-center justify-between print:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/results"
                className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow"
              >
                <Trophy size={14} className="text-[#007fb8]" />
                View 2025 Results
              </Link>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-4 py-2 text-[12px] font-bold text-[#254967] shadow-sm transition-all hover:border-[#007fb8] hover:text-[#007fb8] hover:shadow"
              >
                <Printer size={14} />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Hero Banner: Styled with User Theme (#102c45, #007fb8, #0ac9e8, #38d995) */}
          <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(145deg,#102c45_0%,#0c2944_45%,#007fb8_100%)] p-9 text-white shadow-[0_16px_45px_-12px_rgba(16,44,69,0.32)] max-sm:p-6">
            {/* Ambient Background Orbs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#0ac9e8]/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-[#38d995]/20 blur-3xl"
            />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-[720px]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0ac9e8] px-3.5 py-1 text-[11px] font-black tracking-wider text-[#06314b] uppercase shadow-xs">
                    <Calendar size={13} strokeWidth={2.5} />
                    Official Physical Timetable
                  </span>
                  <span className="text-[12px] font-bold tracking-widest text-[#d9edf4] uppercase">
                    2026 / 2027 Academic Year
                  </span>
                </div>

                <h1 className="mt-4 text-[clamp(34px,4vw,54px)] leading-[1.05] font-black tracking-[-2px] text-white uppercase">
                  Class Timetable <br />
                  <span className="text-[#38d995]">All 8 Institutes</span>
                </h1>

                <p className="mt-3.5 text-[15px] leading-[1.7] text-[#e0ecf3]">
                  Physical Commerce classes conducted by{" "}
                  <strong className="text-white">Evon Aravinda</strong> across
                  Kiribathgoda, Kadawatha, Gampaha, Ganemulla, Nittambuwa,
                  Sapugaskanda, and Ragama. Select your institute below to see full
                  Grade 10, Grade 11, and Paper Class timings.
                </p>

                {/* Quick Highlights Bar */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-extrabold text-white backdrop-blur-md">
                    <ShieldCheck size={14} className="text-[#38d995]" />
                    8 Physical Halls
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-extrabold text-white backdrop-blur-md">
                    <Sparkles size={14} className="text-[#0ac9e8]" />
                    Parallel Morning &amp; Evening Groups
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-extrabold text-white backdrop-blur-md">
                    <BookOpen size={14} className="text-[#fef08a]" />
                    Dedicated Paper Class
                  </div>
                </div>
              </div>

              {/* Educator Quick Profile Card */}
              <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/25 bg-white/10 p-5 shadow-lg backdrop-blur-md max-sm:w-full">
                <div className="relative size-18 shrink-0 overflow-hidden rounded-2xl border-2 border-[#0ac9e8] shadow-md">
                  <Image
                    src="/images/educator.jpg"
                    alt="Evon Aravinda"
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-[#38d995] uppercase">
                    <span>Lead Mentor</span>
                  </div>
                  <h3 className="text-[18px] font-black text-white">
                    Evon Aravinda
                  </h3>
                  <p className="text-[12px] font-medium text-[#d9edf4]">
                    English Medium Commerce Specialist
                  </p>
                  <p className="mt-1 text-[10px] font-bold tracking-wider text-[#0ac9e8] uppercase">
                    Grade 10 • Grade 11 • Paper Class
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Institute Selection Chips & Search (Theme Styling) */}
          <div className="mt-8 rounded-3xl border border-[#cddce5] bg-white p-6 shadow-[0_6px_25px_-6px_rgba(16,44,69,0.06)] print:hidden">
            <div className="flex flex-col gap-5">
              {/* Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[280px]">
                  <Search
                    size={18}
                    className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#007fb8]"
                  />
                  <input
                    type="text"
                    placeholder="Search institute name or location (e.g. Sakya, Gampaha, Kadawatha)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#cddce5] bg-[#edf2f3] py-2.5 pr-10 pl-10 text-[13px] font-medium text-[#102c45] outline-none transition-colors focus:border-[#007fb8] focus:bg-white"
                  />
                  {searchQuery.trim() !== "" && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[#60768a] hover:text-[#102c45]"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[12px] font-bold text-[#60768a]">
                  <MapPin size={16} className="text-[#007fb8]" />
                  <span>Showing: <strong>{filteredInstitutes.length}</strong> of 8 Institutes</span>
                </div>
              </div>

              {/* Institute Selector Pills */}
              <div className="border-t border-[#edf2f7] pt-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedInstituteId("all")}
                    className={`rounded-full px-4.5 py-2 text-[12px] font-extrabold transition-all ${
                      selectedInstituteId === "all"
                        ? "bg-[#102c45] text-white shadow-md shadow-[#102c45]/25 scale-105"
                        : "border border-[#cddce5] bg-[#edf2f3] text-[#254967] hover:border-[#007fb8] hover:bg-white"
                    }`}
                  >
                    All Institutes (8)
                  </button>

                  {institutesData.map((inst) => {
                    const isActive = selectedInstituteId === inst.id;
                    return (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => setSelectedInstituteId(inst.id)}
                        className={`group flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                          isActive
                            ? "bg-[linear-gradient(135deg,#007fb8_0%,#0096cc_100%)] text-white shadow-md shadow-[#007fb8]/30 scale-105 border-transparent"
                            : "border border-[#cddce5] bg-[#edf2f3] text-[#102c45] hover:border-[#007fb8] hover:bg-white"
                        }`}
                      >
                        <span className="font-black">{inst.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-white text-[#007fb8] border border-[#cddce5]"
                          }`}
                        >
                          {inst.location}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Active Search / Filter Indicator */}
          {(selectedInstituteId !== "all" || searchQuery.trim() !== "") && (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-[#b9e6fe] bg-[#e0f2fe] px-5 py-2.5 text-[13px] text-[#0369a1] print:hidden">
              <div className="flex flex-wrap items-center gap-2 font-semibold">
                <span>Active Filter:</span>
                {selectedInstituteId !== "all" && (
                  <span className="rounded-md bg-white px-2.5 py-0.5 font-bold shadow-xs text-[#102c45]">
                    Institute:{" "}
                    {
                      institutesData.find((i) => i.id === selectedInstituteId)
                        ?.name
                    }
                  </span>
                )}
                {searchQuery.trim() !== "" && (
                  <span className="rounded-md bg-white px-2.5 py-0.5 font-bold shadow-xs text-[#102c45]">
                    Search: &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedInstituteId("all");
                  setSearchQuery("");
                }}
                className="font-bold underline hover:text-[#0c4a6e]"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Timetable Institutes Grid (Theme Colors Applied) */}
          <div className="mt-8 grid grid-cols-2 gap-8 max-lg:grid-cols-1">
            {filteredInstitutes.length > 0 ? (
              filteredInstitutes.map((inst) => {
                const grade10Slots = inst.slots.filter(
                  (s) => s.grade === "Grade 10"
                );
                const grade11Slots = inst.slots.filter(
                  (s) => s.grade === "Grade 11"
                );
                const paperSlots = inst.slots.filter(
                  (s) => s.grade === "Paper Class"
                );

                return (
                  <div
                    key={inst.id}
                    className="flex flex-col justify-between overflow-hidden rounded-3xl border border-[#cddce5] bg-white shadow-[0_6px_25px_-6px_rgba(16,44,69,0.06)] transition-all hover:border-[#007fb8] hover:shadow-[0_16px_36px_-8px_rgba(0,127,184,0.18)]"
                  >
                    {/* Top Decorative Gradient Accent Bar */}
                    <div className="h-2 w-full bg-[linear-gradient(90deg,#102c45_0%,#007fb8_50%,#0ac9e8_100%)]" />

                    <div className="p-8 max-sm:p-6">
                      {/* Institute Header */}
                      <div className="flex items-start justify-between border-b-2 border-[#102c45] pb-4">
                        <div>
                          <h2 className="text-[28px] leading-tight font-black tracking-[-1px] text-[#102c45]">
                            {inst.name}
                          </h2>
                          <div className="mt-1 flex items-center gap-2">
                            <MapPin size={14} className="text-[#007fb8]" />
                            <p className="text-[13px] font-black tracking-[1.5px] text-[#007fb8] uppercase">
                              {inst.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 rounded-full border border-[#38d995]/50 bg-[#e8f7f2] px-3 py-1 text-[11px] font-bold text-[#159366]">
                          <span className="size-2 rounded-full bg-[#38d995] animate-pulse" />
                          Physical Hall
                        </div>
                      </div>

                      {/* Timetable Rows by Stream */}
                      <div className="mt-6 space-y-6">
                        {/* Grade 10 */}
                        {grade10Slots.length > 0 && (
                          <div>
                            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#102c45] px-3.5 py-1 text-[11px] font-black tracking-wider text-white uppercase shadow-xs">
                              <BookOpen size={12} />
                              Grade 10
                            </div>
                            <div className="space-y-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                              {grade10Slots.map((slot, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 last:border-b-0 last:pb-0 text-[14px]"
                                >
                                  <div className="flex items-center gap-2.5">
                                    {slot.group && (
                                      <span className="rounded-md bg-[#3e70b3] px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                                        {slot.group}
                                      </span>
                                    )}
                                    <span className="font-extrabold text-[#102c45]">
                                      {slot.day}
                                    </span>
                                  </div>
                                  <span className="flex items-center gap-1.5 font-black text-[#102c45]">
                                    <Clock
                                      size={14}
                                      className="text-[#007fb8]"
                                    />
                                    {slot.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Grade 11 */}
                        {grade11Slots.length > 0 && (
                          <div>
                            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#007fb8] px-3.5 py-1 text-[11px] font-black tracking-wider text-white uppercase shadow-xs">
                              <BookOpen size={12} />
                              Grade 11
                            </div>
                            <div className="space-y-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                              {grade11Slots.map((slot, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 last:border-b-0 last:pb-0 text-[14px]"
                                >
                                  <div className="flex items-center gap-2.5">
                                    {slot.group && (
                                      <span className="rounded-md bg-[#254967] px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                                        {slot.group}
                                      </span>
                                    )}
                                    <span className="font-extrabold text-[#102c45]">
                                      {slot.day}
                                    </span>
                                  </div>
                                  <span className="flex items-center gap-1.5 font-black text-[#102c45]">
                                    <Clock
                                      size={14}
                                      className="text-[#007fb8]"
                                    />
                                    {slot.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Paper Class */}
                        {paperSlots.length > 0 && (
                          <div>
                            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-md bg-[linear-gradient(135deg,#007fb8_0%,#00b7dd_100%)] px-3.5 py-1 text-[11px] font-black tracking-wider text-white uppercase shadow-xs">
                              <Sparkles size={12} />
                              Paper Class
                            </div>
                            <div className="space-y-2 rounded-2xl border border-[#bae6fd] bg-[#f0f9ff] p-3">
                              {paperSlots.map((slot, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center justify-between text-[14px]"
                                >
                                  <span className="font-extrabold text-[#102c45]">
                                    {slot.day}
                                  </span>
                                  <span className="flex items-center gap-1.5 font-black text-[#102c45]">
                                    <Clock
                                      size={14}
                                      className="text-[#007fb8]"
                                    />
                                    {slot.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="flex items-center justify-between border-t border-[#edf2f7] bg-[#fbfdff] px-8 py-4.5 print:hidden max-sm:px-6">
                      <span className="text-[12px] font-bold text-[#60768a]">
                        English Medium Commerce
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenJoin(`${inst.name} - ${inst.location} Batch`)
                        }
                        className="group inline-flex items-center gap-3 rounded-full bg-[#102c45] py-1.5 pr-1.5 pl-5 text-[12px] font-extrabold text-white transition-all hover:bg-[#007fb8] shadow-md shadow-[#102c45]/15"
                      >
                        Enroll at {inst.name}
                        <span className="flex size-7 items-center justify-center rounded-full bg-[#0ac9e8] text-[#06314b] transition-transform group-hover:rotate-45">
                          <ArrowUpRight size={16} strokeWidth={2.5} />
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 rounded-3xl border border-[#cbd5e1] bg-white p-12 text-center">
                <p className="text-[16px] font-bold text-[#60768a]">
                  No institute found matching your search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInstituteId("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-full bg-[#007fb8] px-6 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#007fb8]/30 transition-transform hover:scale-105"
                >
                  Show All Institutes
                </button>
              </div>
            )}
          </div>

          {/* Flexible Attendance Notice Card */}
          <div className="mt-12 rounded-3xl border border-[#cddce5] bg-white p-7 shadow-sm">
            <div className="flex items-start gap-4 max-sm:flex-col">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#007fb8]">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-[16px] font-black text-[#102c45]">
                  Flexible Class Attendance Policy
                </h4>
                <p className="mt-1 text-[13.5px] leading-[1.7] text-[#60768a]">
                  Students enrolled in any of our 8 institutes (Sakya, Science
                  Image, Sipsara, Maxford, Vishwa, Maxima, Shiksha, Siyoneth) can
                  attend parallel groups (Group 1 or Group 2). If you miss your
                  regular class due to school sports meets, exams, or events, you
                  are officially welcome to attend the same lesson at any of the
                  other physical centers during that same week.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Banner (Theme Gradient) */}
          <div className="mt-12 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#102c45_0%,#164466_50%,#007fb8_100%)] p-10 text-white shadow-xl print:hidden max-sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-[650px]">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-[11px] font-black tracking-wider uppercase backdrop-blur-md">
                  <Sparkles size={13} /> ADMISSIONS OPEN FOR 2026 / 2027
                </div>
                <h2 className="mt-3 text-[26px] font-black tracking-tight max-sm:text-[20px]">
                  Ready to Join Evon Aravinda&apos;s Classes?
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#cddce5]">
                  Secure your seat at your nearest institute or register for
                  the islandwide online commerce learning program.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenJoin("General Batch Registration - Timetable")
                  }
                  className="group inline-flex items-center gap-3 rounded-full bg-[#0ac9e8] py-2 pr-2 pl-6 text-[13px] font-black text-[#06314b] shadow-lg transition-transform hover:scale-105 hover:bg-[#38d995]"
                >
                  Register Now
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#06314b] text-white transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={18} strokeWidth={2.5} />
                  </span>
                </button>

                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-[13px] font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  Check Student Results
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenLogin={() => {}}
        onOpenJoin={() => handleOpenJoin("Timetable Page Inquiry")}
      />

      {/* Join Modal */}
      <JoinModal
        key={selectedCourse ?? "general"}
        isOpen={isJoinOpen}
        initialCourse={selectedCourse}
        onClose={() => {
          setIsJoinOpen(false);
          setSelectedCourse(undefined);
        }}
      />
    </div>
  );
}
