"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { institutesData } from "@/data/timetableData";

interface TimetableSectionProps {
  onOpenJoin: (courseName?: string) => void;
}

export default function TimetableSection({
  onOpenJoin,
}: TimetableSectionProps) {
  const [selectedInstituteId, setSelectedInstituteId] = useState<string>("all");

  const filteredInstitutes = institutesData.filter((inst) => {
    if (selectedInstituteId !== "all" && inst.id !== selectedInstituteId) {
      return false;
    }
    return true;
  });

  return (
    <section
      id="timetable"
      aria-labelledby="timetable-heading"
      className="relative isolate overflow-hidden bg-[#edf2f3] py-20 max-lg:py-14 max-sm:py-10"
    >
      {/* Ambient background glows matching Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 -z-10 size-[500px] rounded-full bg-[#7daac6]/20 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 size-[450px] rounded-full bg-[#007fb8]/15 blur-[90px]"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 max-sm:px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-[760px] text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#007fb8]/30 bg-white/80 px-4 py-1.5 text-[11px] font-extrabold tracking-[2px] text-[#007fb8] uppercase shadow-xs">
            <Calendar size={14} />
            Physical Class Timetable
          </div>
          <h2
            id="timetable-heading"
            className="text-[clamp(28px,3.8vw,48px)] leading-[1.1] font-black tracking-[-1.5px] text-[#102c45]"
          >
            Weekly Class Schedule <br />
            <span className="text-[#007fb8]">Select Your Institute</span>
          </h2>
          <p className="mt-3.5 text-[15px] leading-[1.7] font-medium text-[#60768a] max-sm:text-[13px]">
            English Medium O/L Commerce physical classes conducted across 8
            premier educational institutes with <strong>Evon Aravinda</strong>.
          </p>
        </div>

        {/* Institute Selector Pills */}
        <div className="mt-8 max-sm:mt-6">
          <div className="flex flex-wrap items-center justify-center gap-2 max-sm:gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedInstituteId("all")}
              className={`rounded-full px-4 py-2 text-[12px] font-bold transition-all max-sm:px-3 max-sm:py-1.5 max-sm:text-[11px] ${
                selectedInstituteId === "all"
                  ? "bg-[#102c45] text-white shadow-md shadow-[#102c45]/25 scale-105"
                  : "bg-white text-[#254967] border border-[#cddce5] hover:border-[#007fb8] hover:text-[#007fb8]"
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
                  className={`group flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all max-sm:px-2.5 max-sm:py-1.5 max-sm:text-[11px] ${
                    isActive
                      ? "bg-[#007fb8] text-white shadow-md shadow-[#007fb8]/30 scale-105"
                      : "bg-white text-[#102c45] border border-[#cddce5] hover:border-[#007fb8] hover:bg-[#edf7fd]"
                  }`}
                >
                  <span className="font-extrabold tracking-tight">{inst.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-semibold tracking-wide uppercase ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#e5eff5] text-[#60768a] group-hover:bg-[#d9edf4] group-hover:text-[#007fb8]"
                    }`}
                  >
                    {inst.location}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timetable cards stack on phones and expand on larger screens */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 max-sm:gap-4">
          {filteredInstitutes.map((inst) => {
            const grade10Slots = inst.slots.filter((s) => s.grade === "Grade 10");
            const grade11Slots = inst.slots.filter((s) => s.grade === "Grade 11");
            const paperSlots = inst.slots.filter((s) => s.grade === "Paper Class");

            return (
              <div
                key={inst.id}
                className="group relative flex min-w-0 flex-col justify-between rounded-3xl border border-[#cddce5] bg-white p-7 shadow-[0_6px_25px_-6px_rgba(16,44,69,0.06)] transition-all hover:border-[#007fb8]/70 hover:shadow-[0_16px_36px_-8px_rgba(0,127,184,0.18)] max-sm:rounded-2xl max-sm:p-5"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b-2 border-[#102c45] pb-3.5 max-sm:pb-2.5">
                    <div>
                      <h3 className="text-[24px] leading-tight font-black tracking-tight text-[#102c45] max-sm:text-[16px]">
                        {inst.name}
                      </h3>
                      <p className="text-[12px] font-extrabold tracking-[1.5px] text-[#007fb8] uppercase max-sm:text-[10px] max-sm:tracking-normal">
                        {inst.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[10.5px] font-bold text-[#0284c7] max-sm:hidden">
                      <MapPin size={12} />
                      Physical Hall
                    </div>
                  </div>

                  {/* Class Timetable Rows */}
                  <div className="mt-5 space-y-5 max-sm:mt-3 max-sm:space-y-3">
                    {/* Grade 10 Section */}
                    {grade10Slots.length > 0 && (
                      <div>
                        <div className="mb-2 inline-block rounded-md bg-[#102c45] px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wider text-white uppercase shadow-xs max-sm:text-[9px] max-sm:px-2 max-sm:py-0.2">
                          Grade 10
                        </div>
                        <div className="space-y-1.5">
                          {grade10Slots.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex flex-col gap-0.5 border-b border-[#e2e8f0] pb-1.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between text-[13px] max-sm:text-[11px]"
                            >
                              <div className="flex items-center gap-1.5">
                                {slot.group && (
                                  <span className="rounded bg-[#254967] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase max-sm:text-[8px]">
                                    {slot.group}
                                  </span>
                                )}
                                <span className="font-bold text-[#102c45]">
                                  {slot.day}
                                </span>
                              </div>
                              <span className="flex items-center gap-1 font-bold text-[#102c45] text-[12.5px] max-sm:text-[10px]">
                                <Clock size={12} className="text-[#007fb8] shrink-0" />
                                {slot.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grade 11 Section */}
                    {grade11Slots.length > 0 && (
                      <div>
                        <div className="mb-2 inline-block rounded-md bg-[#007fb8] px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wider text-white uppercase shadow-xs max-sm:text-[9px] max-sm:px-2 max-sm:py-0.2">
                          Grade 11
                        </div>
                        <div className="space-y-1.5">
                          {grade11Slots.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex flex-col gap-0.5 border-b border-[#e2e8f0] pb-1.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between text-[13px] max-sm:text-[11px]"
                            >
                              <div className="flex items-center gap-1.5">
                                {slot.group && (
                                  <span className="rounded bg-[#254967] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase max-sm:text-[8px]">
                                    {slot.group}
                                  </span>
                                )}
                                <span className="font-bold text-[#102c45]">
                                  {slot.day}
                                </span>
                              </div>
                              <span className="flex items-center gap-1 font-bold text-[#102c45] text-[12.5px] max-sm:text-[10px]">
                                <Clock size={12} className="text-[#007fb8] shrink-0" />
                                {slot.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Paper Class Section */}
                    {paperSlots.length > 0 && (
                      <div>
                        <div className="mb-2 inline-block rounded-md bg-[linear-gradient(135deg,#007fb8_0%,#0ac9e8_100%)] px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wider text-white uppercase shadow-xs max-sm:text-[9px] max-sm:px-2 max-sm:py-0.2">
                          Paper Class
                        </div>
                        <div className="space-y-1.5">
                          {paperSlots.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex flex-col gap-0.5 border-b border-[#e2e8f0] pb-1.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between text-[13px] max-sm:text-[11px]"
                            >
                              <span className="font-bold text-[#102c45]">
                                {slot.day}
                              </span>
                              <span className="flex items-center gap-1 font-bold text-[#102c45] text-[12.5px] max-sm:text-[10px]">
                                <Clock size={12} className="text-[#007fb8] shrink-0" />
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
                <div className="mt-6 flex items-center justify-between border-t border-[#edf2f7] pt-3.5 max-sm:mt-4 max-sm:pt-2.5">
                  <span className="text-[11.5px] font-semibold text-[#60768a] max-sm:hidden">
                    O/L Commerce
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenJoin(`${inst.name} - ${inst.location} Batch`)
                    }
                    className="group inline-flex items-center gap-2 rounded-full bg-[#102c45] py-1.5 pr-1.5 pl-4 text-[11.5px] font-bold text-white transition-all hover:bg-[#007fb8] shadow-sm max-sm:w-full max-sm:justify-between max-sm:text-[10px] max-sm:pl-3 max-sm:py-1"
                  >
                    Enroll at {inst.name}
                    <span className="flex size-6.5 items-center justify-center rounded-full bg-[#0ac9e8] text-[#06314b] transition-transform group-hover:rotate-45 max-sm:size-5">
                      <ArrowUpRight size={14} strokeWidth={2.5} className="max-sm:size-3" />
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Linking to Dedicated Timetable Page */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#102c45_0%,#164466_50%,#007fb8_100%)] p-8 text-white shadow-xl max-sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-[620px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10.5px] font-black tracking-wider uppercase backdrop-blur-md">
                <Sparkles size={12} /> COMPLETE SCHEDULES
              </span>
              <h3 className="mt-2.5 text-[22px] font-black tracking-tight max-sm:text-[18px]">
                Want the Dedicated Full Timetable Page?
              </h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[#cddce5] max-sm:text-[12px]">
                View all institute class schedules side-by-side, search by town, and print or save the schedule sheet.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/timetable"
                className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-6 text-[13px] font-bold text-[#102c45] shadow-lg transition-transform hover:scale-105 max-sm:text-[12px] max-sm:pl-4 max-sm:py-1.5"
              >
                Open Timetable Page
                <span className="flex size-8 items-center justify-center rounded-full bg-[#007fb8] text-white transition-transform group-hover:rotate-45 max-sm:size-6">
                  <ArrowUpRight size={18} strokeWidth={2} className="max-sm:size-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
