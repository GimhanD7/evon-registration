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
      className="relative isolate bg-[#edf2f3] py-16 max-lg:py-12 max-sm:py-8"
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

      <div className="relative mx-auto w-full max-w-[1200px] px-6 max-sm:px-3">
        {/* Section Header */}
        <div className="mx-auto max-w-[760px] text-center">
          <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-white/80 px-3.5 py-1 text-[10.5px] font-extrabold tracking-[1.5px] text-[#007fb8] uppercase shadow-xs">
            <Calendar size={13} />
            Physical Class Timetable
          </div>
          <h2
            id="timetable-heading"
            className="text-[clamp(26px,3.8vw,44px)] leading-[1.1] font-black tracking-[-1.5px] text-[#102c45] max-sm:text-[22px]"
          >
            Weekly Class Schedule <br />
            <span className="text-[#007fb8]">Select Your Institute</span>
          </h2>
          <p className="mt-2.5 text-[14px] leading-[1.65] font-medium text-[#60768a] max-sm:text-[12px]">
            English Medium O/L Commerce physical classes conducted across 8
            premier educational institutes with <strong>Evon Aravinda</strong>.
          </p>
        </div>

        {/* Institute Selector Pills */}
        <div className="mt-6 max-sm:mt-4">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedInstituteId("all")}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all max-sm:px-2.5 max-sm:py-1 max-sm:text-[10px] ${
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
                  className={`group flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all max-sm:px-2 max-sm:py-1 max-sm:text-[10px] ${
                    isActive
                      ? "bg-[#007fb8] text-white shadow-md shadow-[#007fb8]/30 scale-105"
                      : "bg-white text-[#102c45] border border-[#cddce5] hover:border-[#007fb8] hover:bg-[#edf7fd]"
                  }`}
                >
                  <span className="font-extrabold tracking-tight">{inst.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[8.5px] font-semibold tracking-wide uppercase ${
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

        {/* Timetable Cards Grid - Exactly 2 Cards Per Row on Mobile and Desktop */}
        <div className="mt-8 grid grid-cols-2 gap-5 max-sm:gap-2.5">
          {filteredInstitutes.map((inst) => {
            const grade10Slots = inst.slots.filter((s) => s.grade === "Grade 10");
            const grade11Slots = inst.slots.filter((s) => s.grade === "Grade 11");
            const paperSlots = inst.slots.filter((s) => s.grade === "Paper Class");

            return (
              <div
                key={inst.id}
                className="group relative flex min-w-0 flex-col justify-between rounded-3xl border border-[#cddce5] bg-white p-6 shadow-[0_6px_25px_-6px_rgba(16,44,69,0.06)] transition-all hover:border-[#007fb8]/70 hover:shadow-[0_16px_36px_-8px_rgba(0,127,184,0.18)] max-sm:rounded-2xl max-sm:p-3"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b-2 border-[#102c45] pb-3 max-sm:pb-2">
                    <div>
                      <h3 className="text-[20px] leading-tight font-black tracking-tight text-[#102c45] max-sm:text-[14px]">
                        {inst.name}
                      </h3>
                      <p className="text-[11px] font-extrabold tracking-[1px] text-[#007fb8] uppercase max-sm:text-[9px]">
                        {inst.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[9.5px] font-bold text-[#0284c7] max-sm:hidden">
                      <MapPin size={11} />
                      Physical
                    </div>
                  </div>

                  {/* Class Timetable Rows */}
                  <div className="mt-4 space-y-4 max-sm:mt-2.5 max-sm:space-y-2.5">
                    {/* Grade 10 Section */}
                    {grade10Slots.length > 0 && (
                      <div>
                        <div className="mb-1.5 inline-block rounded-md bg-[#102c45] px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider text-white uppercase shadow-xs max-sm:text-[8px] max-sm:px-1.5 max-sm:py-0.2">
                          Grade 10
                        </div>
                        <div className="space-y-1">
                          {grade10Slots.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex flex-col gap-0.5 border-b border-[#e2e8f0] pb-1 last:border-b-0 text-[12.5px] max-sm:text-[10px]"
                            >
                              <div className="flex items-center gap-1">
                                {slot.group && (
                                  <span className="rounded bg-[#254967] px-1 py-0.2 text-[8px] font-bold text-white uppercase max-sm:text-[7.5px]">
                                    {slot.group}
                                  </span>
                                )}
                                <span className="font-bold text-[#102c45]">
                                  {slot.day}
                                </span>
                              </div>
                              <span className="flex items-center gap-1 font-bold text-[#102c45] text-[11.5px] max-sm:text-[9.5px]">
                                <Clock size={11} className="text-[#007fb8] shrink-0 max-sm:size-2.5" />
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
                        <div className="mb-1.5 inline-block rounded-md bg-[#007fb8] px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider text-white uppercase shadow-xs max-sm:text-[8px] max-sm:px-1.5 max-sm:py-0.2">
                          Grade 11
                        </div>
                        <div className="space-y-1">
                          {grade11Slots.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex flex-col gap-0.5 border-b border-[#e2e8f0] pb-1 last:border-b-0 text-[12.5px] max-sm:text-[10px]"
                            >
                              <div className="flex items-center gap-1">
                                {slot.group && (
                                  <span className="rounded bg-[#254967] px-1 py-0.2 text-[8px] font-bold text-white uppercase max-sm:text-[7.5px]">
                                    {slot.group}
                                  </span>
                                )}
                                <span className="font-bold text-[#102c45]">
                                  {slot.day}
                                </span>
                              </div>
                              <span className="flex items-center gap-1 font-bold text-[#102c45] text-[11.5px] max-sm:text-[9.5px]">
                                <Clock size={11} className="text-[#007fb8] shrink-0 max-sm:size-2.5" />
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
                        <div className="mb-1.5 inline-block rounded-md bg-[linear-gradient(135deg,#007fb8_0%,#0ac9e8_100%)] px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider text-white uppercase shadow-xs max-sm:text-[8px] max-sm:px-1.5 max-sm:py-0.2">
                          Paper Class
                        </div>
                        <div className="space-y-1">
                          {paperSlots.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex flex-col gap-0.5 border-b border-[#e2e8f0] pb-1 last:border-b-0 text-[12.5px] max-sm:text-[10px]"
                            >
                              <span className="font-bold text-[#102c45]">
                                {slot.day}
                              </span>
                              <span className="flex items-center gap-1 font-bold text-[#102c45] text-[11.5px] max-sm:text-[9.5px]">
                                <Clock size={11} className="text-[#007fb8] shrink-0 max-sm:size-2.5" />
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
                <div className="mt-4 flex items-center justify-between border-t border-[#edf2f7] pt-2.5 max-sm:mt-3 max-sm:pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenJoin(`${inst.name} - ${inst.location} Batch`)
                    }
                    className="group inline-flex w-full items-center justify-between rounded-full bg-[#102c45] py-1 pr-1 pl-3 text-[11px] font-bold text-white transition-all hover:bg-[#007fb8] shadow-sm max-sm:text-[9.5px] max-sm:py-1 max-sm:pl-2.5"
                  >
                    <span>Enroll at {inst.name}</span>
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#0ac9e8] text-[#06314b] transition-transform group-hover:rotate-45 max-sm:size-5">
                      <ArrowUpRight size={13} strokeWidth={2.5} className="max-sm:size-3" />
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Linking to Dedicated Timetable Page */}
        <div className="mt-10 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#102c45_0%,#164466_50%,#007fb8_100%)] p-7 text-white shadow-xl max-sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-[620px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase backdrop-blur-md">
                <Sparkles size={11} /> COMPLETE SCHEDULES
              </span>
              <h3 className="mt-2 text-[20px] font-black tracking-tight max-sm:text-[16px]">
                Want the Dedicated Full Timetable Page?
              </h3>
              <p className="mt-0.5 text-[13px] leading-relaxed text-[#cddce5] max-sm:text-[11.5px]">
                View all institute class schedules side-by-side, search by town, and print or save the schedule sheet.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/timetable"
                className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-5 text-[12px] font-bold text-[#102c45] shadow-lg transition-transform hover:scale-105 max-sm:w-full max-sm:justify-between max-sm:py-1.5 max-sm:pl-4 max-sm:text-[11px]"
              >
                <span>Open Timetable Page</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#007fb8] text-white transition-transform group-hover:rotate-45 max-sm:size-6">
                  <ArrowUpRight size={16} strokeWidth={2} className="max-sm:size-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
