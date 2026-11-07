"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { getNationalResultsFromBackend } from "@/lib/lmsStore";
import { resultsData as initialNationalResults, StudentResult } from "@/data/resultsData";

export default function TopRanksShowcase() {
  const [nationalResults, setNationalResults] = useState<StudentResult[]>(
    () => initialNationalResults
  );
  const [activeYear, setActiveYear] = useState<number | "all">("all");
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025]);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function loadLatestChampions() {
      try {
        const resp = await getNationalResultsFromBackend();
        if (mounted && resp && Array.isArray(resp.results) && resp.results.length > 0) {
          setNationalResults(resp.results);
          if (resp.availableYears && resp.availableYears.length > 0) {
            setAvailableYears(resp.availableYears);
          }
        }
      } catch (err) {
        console.warn("Could not load national results from backend, using default data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadLatestChampions();

    const handleDataChange = () => {
      loadLatestChampions();
    };
    window.addEventListener("lms_national_results_change", handleDataChange);
    return () => {
      mounted = false;
      window.removeEventListener("lms_national_results_change", handleDataChange);
    };
  }, []);

  // Filtered national results
  const filteredResults = useMemo(() => {
    return nationalResults.filter((item) => {
      if (activeYear !== "all") {
        const yr = item.year || 2025;
        if (yr !== activeYear) return false;
      }

      if (selectedGrade !== "all") {
        if (selectedGrade === "A9" && item.gradeBadge !== "A9") return false;
        if (selectedGrade === "A8" && item.gradeBadge !== "A8") return false;
        if (selectedGrade === "A7" && item.gradeBadge !== "A7") return false;
        if (selectedGrade === "A" && item.letterGrade !== "A") return false;
        if (selectedGrade === "B" && item.letterGrade !== "B") return false;
        if (selectedGrade === "C" && item.letterGrade !== "C") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (item.name || "").toLowerCase().includes(q);
        const matchesSchool = (item.school || "").toLowerCase().includes(q);
        const matchesIndex = (item.indexNo || "").toLowerCase().includes(q);
        return matchesName || matchesSchool || matchesIndex;
      }

      return true;
    });
  }, [nationalResults, activeYear, selectedGrade, searchQuery]);

  const a9Count = useMemo(
    () => nationalResults.filter((r) => r.gradeBadge === "A9").length,
    [nationalResults]
  );
  const totalCount = nationalResults.length;

  // Show only 21 student labels on the home page as requested
  const displayedResults = useMemo(() => {
    return filteredResults.slice(0, 21);
  }, [filteredResults]);

  const hasMore = filteredResults.length > 21;
  const remainingCount = filteredResults.length - 21;

  return (
    <section
      className="relative bg-[linear-gradient(180deg,#f8fafc_0%,#edf2f3_100%)] pt-16 pb-20 max-sm:pt-10 max-sm:pb-14"
      id="results"
    >
      <div className="mx-auto w-full max-w-[1240px] px-8 max-sm:px-4">
        {/* Section Header */}
        <div className="mx-auto mb-8 max-w-[760px] text-center max-sm:mb-6">
          <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3.5 py-1 text-[11px] font-extrabold tracking-[1.2px] text-[#007fb8] uppercase shadow-xs">
            <Trophy size={13} className="text-[#007fb8]" />
            <span>
              {activeYear === "all" ? "NATIONAL" : activeYear} O/L EXAM RESULTS
            </span>
          </div>
          <h2 className="mb-3 text-[clamp(26px,3.5vw,40px)] leading-[1.15] font-black tracking-[-1px] text-[#102c45] max-sm:text-[22px]">
            Champions in Commerce <br />
            <span className="bg-[linear-gradient(135deg,#007fb8_0%,#0ac9e8_100%)] bg-clip-text text-transparent">
              {activeYear === "all" ? "All-Island" : `${activeYear} O/L`} High Achievers
            </span>
          </h2>
          <p className="text-[14.5px] leading-[1.65] font-medium text-[#60768a] max-sm:text-[12.5px]">
            Over {a9Count}+ students achieved 9A&apos;s and {totalCount}+ secured top distinction passes in English Medium Business &amp; Accounting Studies.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="mb-6 rounded-3xl border border-[#cddce5] bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-3">
            {/* Top row: Year pills & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Year Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveYear("all")}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeYear === "all"
                      ? "bg-[#102c45] text-white shadow-xs"
                      : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                  }`}
                >
                  All Results ({nationalResults.length})
                </button>
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setActiveYear(yr)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeYear === yr
                        ? "bg-[#102c45] text-white shadow-xs"
                        : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                    }`}
                  >
                    {yr} Results
                  </button>
                ))}
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#159366]">
                <CheckCircle2 size={14} />
                <span>One Page View &bull; Public Honor Roll</span>
              </div>
            </div>

            {/* Middle: Search input */}
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#007fb8]"
              />
              <input
                type="text"
                placeholder="Search distinction achievers by student name, school, or index number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#cddce5] bg-[#edf2f3] py-2.5 pr-10 pl-10 text-[13px] font-medium text-[#102c45] outline-none focus:border-[#007fb8] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-bold text-[#94a3b8] hover:text-[#102c45]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Bottom: Grade Filter pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#edf2f3]">
              {["all", "A9", "A8", "A7", "A", "B", "C"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedGrade(tab)}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    selectedGrade === tab
                      ? "bg-[#102c45] text-white shadow-xs"
                      : "bg-[#edf2f3] text-[#60768a] hover:bg-[#cddce5]"
                  }`}
                >
                  {tab === "all" ? "All Grades" : `${tab} Distinction`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS GRID - 3 COLUMNS PILL CARDS (FIRST 21 STUDENTS) */}
        {filteredResults.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#60768a] px-1">
              <span>
                Showing <strong className="text-[#102c45] font-black">{displayedResults.length}</strong> of{" "}
                <strong className="text-[#102c45] font-black">{filteredResults.length}</strong> distinction results
              </span>
              <span>All Island Commerce Honors</span>
            </div>

            <div className="grid grid-cols-3 gap-3.5 max-xl:grid-cols-2 max-sm:grid-cols-1">
              {displayedResults.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-[#d8e2eb] bg-white px-4 py-3.5 shadow-none hover:border-[#007fb8] hover:shadow-xs transition-all"
                >
                  {/* Left Distinction Badge matching user screenshot */}
                  <div
                    className={`flex size-11 sm:size-12 items-center justify-center rounded-xl font-bold text-sm sm:text-base shrink-0 ${
                      st.gradeBadge === "A9" || st.gradeBadge === "A8" || st.gradeBadge === "A7" || st.gradeBadge === "A"
                        ? "bg-[#e8f7f0] text-[#059669] border border-[#a7f3d0]"
                        : st.letterGrade === "B" || st.gradeBadge === "B"
                        ? "bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {st.gradeBadge || st.letterGrade}
                  </div>

                  {/* Right Student Information matching user screenshot */}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[14.5px] sm:text-[15px] text-[#102a43] truncate leading-tight">
                      {st.name}
                    </h4>
                    <p className="text-[12px] sm:text-[12.5px] text-[#627d98] truncate leading-tight mt-1">
                      {st.school}
                    </p>
                    <div className="text-[11px] sm:text-[11.5px] text-[#829ab1] font-normal leading-tight mt-1">
                      Index: {st.indexNo}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* If there are more students beyond 21, show prominent redirect button */}
            {hasMore ? (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#007fb8]/30 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_100%)] p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#007fb8] text-white font-black text-sm shadow-sm">
                    +{remainingCount}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#102c45]">
                      +{remainingCount} More Distinction Achievers
                    </h4>
                    <p className="text-xs text-[#60768a]">
                      Showing 21 achievers on the home page. View all student results &amp; marksheets on the official results page.
                    </p>
                  </div>
                </div>
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 rounded-full bg-[#102c45] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#007fb8] hover:scale-105 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>View All Results Page</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="mt-4 flex justify-center">
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 rounded-full border border-[#cddce5] bg-white px-5 py-2 text-xs font-bold text-[#254967] shadow-xs hover:border-[#007fb8] hover:text-[#007fb8] transition-all cursor-pointer"
                >
                  <span>Go to All Results Page</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#cddce5] bg-white p-12 text-center space-y-3">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#edf2f3] text-[#60768a]">
              <Search size={24} />
            </div>
            <h4 className="text-lg font-black text-[#102c45]">No Achievers Found</h4>
            <p className="text-xs text-[#60768a] max-w-sm mx-auto">
              No distinction students matched your active filter or search query. Try clearing your search or selecting another grade badge.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedGrade("all");
                setActiveYear("all");
              }}
              className="inline-flex items-center gap-1 rounded-full bg-[#102c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#007fb8] transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* CTA Banner to Full Results Portal */}
        <div className="mt-10 rounded-3xl border border-[#007fb8]/30 bg-[linear-gradient(135deg,#f0f9ff_0%,#e0f2fe_100%)] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#102c45] text-[#38d995] shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <h4 className="font-black text-sm text-[#102c45]">
                  Need Official PDF Verification or Paper Marksheet?
                </h4>
                <p className="text-xs text-[#60768a]">
                  Visit the dedicated Results Portal to download official merit certificates or check individual model paper progress.
                </p>
              </div>
            </div>

            <Link
              href="/results"
              className="inline-flex items-center gap-2 rounded-full bg-[#102c45] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#007fb8] transition-all cursor-pointer"
            >
              <span>Go to Results Portal</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
