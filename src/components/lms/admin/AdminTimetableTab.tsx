"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Building,
  Globe,
  Phone,
  Search,
  Sparkles,
  Layers,
  Copy,
} from "lucide-react";
import {
  InstituteTimetable,
  ClassSlot,
  getTimetableData,
  saveTimetableData,
  saveTimetableToBackend,
  resetTimetableToDefault,
  syncTimetableFromBackend,
} from "@/lib/timetableStore";
import { logActivity } from "@/lib/activityLogService";
import { useCurrentLmsUser } from "@/lib/lmsStore";

const DAYS_OF_WEEK: Array<ClassSlot["day"]> = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const GRADE_OPTIONS: Array<ClassSlot["grade"]> = [
  "Grade 10",
  "Grade 11",
  "Paper Class",
];

const TYPE_OPTIONS: Array<ClassSlot["type"]> = [
  "Theory",
  "Revision",
  "Paper Class",
];

export default function AdminTimetableTab() {
  const { user: currentUser } = useCurrentLmsUser();
  const [institutes, setInstitutes] = useState<InstituteTimetable[]>(() =>
    getTimetableData()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedInstId, setExpandedInstId] = useState<string | null>(null);

  // Status feedback
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Edit Institute Modal / State
  const [editingInstitute, setEditingInstitute] = useState<InstituteTimetable | null>(null);
  const [isNewInstitute, setIsNewInstitute] = useState(false);

  // Edit / Add Slot State
  const [editingSlotData, setEditingSlotData] = useState<{
    instituteId: string;
    slotIndex: number | null; // null = new slot
    slot: ClassSlot;
  } | null>(null);

  // Confirm delete dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "institute" | "slot";
    instituteId: string;
    slotIndex?: number;
    title: string;
  } | null>(null);

  // Auto-sync from backend on mount
  useEffect(() => {
    syncTimetableFromBackend().then((fresh) => {
      if (fresh && fresh.length > 0) {
        setInstitutes(fresh);
      }
    });
  }, []);

  // Set default expanded card
  useEffect(() => {
    if (institutes.length > 0 && expandedInstId === null) {
      setExpandedInstId(institutes[0].id);
    }
  }, [institutes, expandedInstId]);

  // Save changes handler
  const handleSaveChanges = async (updatedList = institutes) => {
    setSaveStatus("saving");
    setStatusMessage("Saving timetable to database...");

    try {
      // 1. Save to local store + dispatch event for instant client updates
      saveTimetableData(updatedList);
      setInstitutes(updatedList);

      // 2. Persist to MySQL database
      const backendSuccess = await saveTimetableToBackend(updatedList);

      logActivity(
        "Timetable Updated",
        "system",
        `Admin modified class schedules (${updatedList.length} institutes). Synchronized to live site.`,
        currentUser,
        "success"
      );

      setSaveStatus("success");
      setStatusMessage(
        backendSuccess
          ? "Timetable saved & synced to MySQL database successfully! Home page is now updated."
          : "Saved locally! (Backend sync will retry automatically)."
      );

      setTimeout(() => {
        setSaveStatus("idle");
        setStatusMessage("");
      }, 4000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setStatusMessage("Failed to save changes. Please try again.");
    }
  };

  // Reset to default handler
  const handleResetToDefault = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all timetable schedules to default official data? Any custom institutes or slots will be reverted."
      )
    ) {
      return;
    }

    const defaultData = resetTimetableToDefault();
    setInstitutes(defaultData);
    await saveTimetableToBackend(defaultData);

    logActivity(
      "Timetable Reset",
      "system",
      "Admin reset class timetable to default official institutes.",
      currentUser,
      "warning"
    );

    setSaveStatus("success");
    setStatusMessage("Timetable reverted to default official schedule!");
    setTimeout(() => {
      setSaveStatus("idle");
      setStatusMessage("");
    }, 4000);
  };

  // Filtered institutes
  const filteredInstitutes = institutes.filter((inst) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.location.toLowerCase().includes(q) ||
      inst.fullName.toLowerCase().includes(q) ||
      (inst.isOnline ? "online" : "physical").includes(q)
    );
  });

  // Calculate totals
  const totalSlots = institutes.reduce((acc, curr) => acc + curr.slots.length, 0);
  const physicalCount = institutes.filter((i) => !i.isOnline).length;
  const onlineCount = institutes.filter((i) => i.isOnline).length;

  // Open modal to add new institute
  const handleOpenAddInstitute = () => {
    setIsNewInstitute(true);
    setEditingInstitute({
      id: "inst-" + Date.now().toString(36),
      name: "",
      location: "",
      fullName: "",
      address: "",
      phone: "071 234 5678",
      isOnline: false,
      slots: [],
    });
  };

  // Save Institute (modal submit)
  const handleSaveInstituteModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstitute) return;

    if (!editingInstitute.name.trim() || !editingInstitute.location.trim()) {
      alert("Please provide at least the Institute Name and Location / Town.");
      return;
    }

    let updated: InstituteTimetable[];
    if (isNewInstitute) {
      updated = [...institutes, editingInstitute];
    } else {
      updated = institutes.map((inst) =>
        inst.id === editingInstitute.id ? editingInstitute : inst
      );
    }

    setEditingInstitute(null);
    handleSaveChanges(updated);
  };

  // Delete Institute
  const handleDeleteInstitute = (id: string) => {
    const updated = institutes.filter((i) => i.id !== id);
    setDeleteConfirm(null);
    handleSaveChanges(updated);
  };

  // Duplicate Institute
  const handleDuplicateInstitute = (inst: InstituteTimetable) => {
    const newInst: InstituteTimetable = {
      ...inst,
      id: "inst-" + Date.now().toString(36),
      name: `${inst.name} (Copy)`,
      slots: inst.slots.map((s) => ({ ...s })),
    };
    const updated = [...institutes, newInst];
    handleSaveChanges(updated);
  };

  // Open Add Slot modal
  const handleOpenAddSlot = (instId: string) => {
    setEditingSlotData({
      instituteId: instId,
      slotIndex: null,
      slot: {
        grade: "Grade 11",
        day: "Saturday",
        time: "8.30 am - 12.30 pm",
        type: "Theory",
        group: "",
      },
    });
  };

  // Open Edit Slot modal
  const handleOpenEditSlot = (instId: string, slotIndex: number) => {
    const targetInst = institutes.find((i) => i.id === instId);
    if (!targetInst || !targetInst.slots[slotIndex]) return;

    setEditingSlotData({
      instituteId: instId,
      slotIndex,
      slot: { ...targetInst.slots[slotIndex] },
    });
  };

  // Save Slot (modal submit)
  const handleSaveSlotModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlotData) return;

    const { instituteId, slotIndex, slot } = editingSlotData;

    const updated = institutes.map((inst) => {
      if (inst.id !== instituteId) return inst;

      const newSlots = [...inst.slots];
      if (slotIndex === null) {
        newSlots.push(slot);
      } else {
        newSlots[slotIndex] = slot;
      }
      return { ...inst, slots: newSlots };
    });

    setEditingSlotData(null);
    handleSaveChanges(updated);
  };

  // Delete Slot
  const handleDeleteSlot = (instId: string, slotIndex: number) => {
    const updated = institutes.map((inst) => {
      if (inst.id !== instId) return inst;
      const newSlots = inst.slots.filter((_, idx) => idx !== slotIndex);
      return { ...inst, slots: newSlots };
    });
    setDeleteConfirm(null);
    handleSaveChanges(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#cddce5] bg-[linear-gradient(135deg,#102c45_0%,#164466_50%,#007fb8_100%)] p-6 text-white shadow-xl max-sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase backdrop-blur-md">
              <Calendar size={13} className="text-[#38d995]" />
              Physical &amp; Online Timetable Master
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight max-sm:text-xl">
              Home Page Class Timetable Management
            </h1>
            <p className="mt-1 text-xs text-[#cddce5] max-w-2xl font-medium leading-relaxed">
              Edit class schedules, add/remove institutes, customize slots, and immediately update both the Home Page (
              <code>/#timetable</code>) and the Dedicated Timetable Page (<code>/timetable</code>) without code edits.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/#timetable"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#102c45]"
            >
              <ExternalLink size={13} />
              Live Home Page
            </Link>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/30 bg-rose-500/20 px-3.5 py-2 text-xs font-bold text-rose-100 transition-all hover:bg-rose-600 hover:text-white"
            >
              <RotateCcw size={13} />
              Reset Default
            </button>

            <button
              type="button"
              onClick={() => handleSaveChanges()}
              disabled={saveStatus === "saving"}
              className="inline-flex items-center gap-2 rounded-full bg-[#38d995] px-4 py-2 text-xs font-extrabold text-[#06314b] shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {saveStatus === "saving" ? (
                <>
                  <div className="size-3.5 animate-spin rounded-full border-2 border-[#06314b] border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save &amp; Publish Live
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Toast / Alert */}
        {statusMessage && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-bold transition-all ${
              saveStatus === "success"
                ? "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30"
                : saveStatus === "error"
                ? "bg-rose-500/20 text-rose-100 border border-rose-400/30"
                : "bg-blue-500/20 text-blue-100 border border-blue-400/30"
            }`}
          >
            {saveStatus === "success" ? (
              <CheckCircle2 size={16} className="text-[#38d995] shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#60768a]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Institutes</span>
            <Building size={16} className="text-[#007fb8]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#102c45]">{institutes.length}</div>
          <div className="text-[10px] text-[#60768a] font-medium mt-0.5">Physical + Online Hubs</div>
        </div>

        <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#60768a]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Physical Branches</span>
            <MapPin size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#102c45]">{physicalCount}</div>
          <div className="text-[10px] text-[#60768a] font-medium mt-0.5">Centers Islandwide</div>
        </div>

        <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#60768a]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Online Zoom Batches</span>
            <Globe size={16} className="text-[#0ac9e8]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#102c45]">{onlineCount}</div>
          <div className="text-[10px] text-[#60768a] font-medium mt-0.5">Live Streaming Sessions</div>
        </div>

        <div className="rounded-2xl border border-[#cddce5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#60768a]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Weekly Class Slots</span>
            <Clock size={16} className="text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#102c45]">{totalSlots}</div>
          <div className="text-[10px] text-[#60768a] font-medium mt-0.5">Theory, Revision &amp; Papers</div>
        </div>
      </div>

      {/* Action Bar: Search & Add Institute */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#60768a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by institute name, town, or location..."
            className="w-full rounded-full border border-[#cddce5] bg-white py-2 pl-9 pr-4 text-xs font-semibold text-[#102c45] shadow-xs outline-none focus:border-[#007fb8] focus:ring-2 focus:ring-[#007fb8]/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#60768a] hover:text-[#102c45]"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleOpenAddInstitute}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#007fb8] px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#102c45] active:scale-95 cursor-pointer"
        >
          <Plus size={15} />
          Add New Institute
        </button>
      </div>

      {/* Institutes List */}
      <div className="space-y-4">
        {filteredInstitutes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cddce5] bg-white p-12 text-center">
            <Building size={36} className="mx-auto text-[#60768a]/50" />
            <h3 className="mt-3 text-base font-bold text-[#102c45]">No Institutes Found</h3>
            <p className="mt-1 text-xs text-[#60768a]">
              {searchQuery
                ? `No institute matches "${searchQuery}". Try a different keyword.`
                : "No timetable records configured yet. Click 'Add New Institute' or 'Reset Default'."}
            </p>
          </div>
        ) : (
          filteredInstitutes.map((inst, index) => {
            const isExpanded = expandedInstId === inst.id;
            const grade10Slots = inst.slots.filter((s) => s.grade === "Grade 10");
            const grade11Slots = inst.slots.filter((s) => s.grade === "Grade 11");
            const paperSlots = inst.slots.filter((s) => s.grade === "Paper Class");

            return (
              <div
                key={inst.id}
                className="overflow-hidden rounded-2xl border border-[#cddce5] bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Institute Summary Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2f7] bg-[#f8fafc] px-4 py-3 sm:px-5">
                  <div
                    onClick={() => setExpandedInstId(isExpanded ? null : inst.id)}
                    className="flex flex-1 min-w-[200px] items-center gap-3 cursor-pointer select-none"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[#102c45] text-xs font-black text-white">
                      {index + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-[#102c45]">{inst.name}</h3>
                        {inst.isOnline ? (
                          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-extrabold text-[#007fb8] uppercase">
                            Online
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase">
                            Physical
                          </span>
                        )}
                        <span className="rounded bg-[#e2e8f0] px-1.5 py-0.2 text-[9.5px] font-bold text-[#475569]">
                          {inst.slots.length} {inst.slots.length === 1 ? "Slot" : "Slots"}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#60768a]">
                        <span className="font-bold text-[#007fb8]">{inst.location}</span>
                        {inst.fullName && ` • ${inst.fullName}`}
                        {inst.phone && ` • 📞 ${inst.phone}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this institute */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Add slot to this institute"
                      onClick={() => handleOpenAddSlot(inst.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#cddce5] bg-white px-2.5 py-1 text-[11px] font-bold text-[#102c45] shadow-xs hover:border-[#007fb8] hover:text-[#007fb8]"
                    >
                      <Plus size={13} />
                      <span className="max-sm:hidden">Add Slot</span>
                    </button>

                    <button
                      type="button"
                      title="Edit institute details"
                      onClick={() => {
                        setIsNewInstitute(false);
                        setEditingInstitute({ ...inst });
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#cddce5] bg-white px-2.5 py-1 text-[11px] font-bold text-[#254967] shadow-xs hover:border-[#007fb8] hover:text-[#007fb8]"
                    >
                      <Edit2 size={12} />
                      <span className="max-sm:hidden">Edit</span>
                    </button>

                    <button
                      type="button"
                      title="Duplicate this institute"
                      onClick={() => handleDuplicateInstitute(inst)}
                      className="rounded-lg border border-[#cddce5] bg-white p-1 text-[#60768a] hover:border-[#007fb8] hover:text-[#007fb8]"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      type="button"
                      title="Delete this institute"
                      onClick={() =>
                        setDeleteConfirm({
                          type: "institute",
                          instituteId: inst.id,
                          title: `Delete institute "${inst.name} - ${inst.location}"? All its class slots will also be removed.`,
                        })
                      }
                      className="rounded-lg border border-rose-200 bg-white p-1 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedInstId(isExpanded ? null : inst.id)}
                      className="rounded-lg border border-[#cddce5] bg-white p-1 text-[#60768a] hover:text-[#102c45]"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Slots Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5">
                    {inst.slots.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#cddce5] bg-[#f8fafc] p-6 text-center">
                        <Clock size={24} className="mx-auto text-[#60768a]/50" />
                        <p className="mt-2 text-xs font-bold text-[#102c45]">No class slots configured yet</p>
                        <p className="text-[11px] text-[#60768a]">Add weekly slots for Grade 10, Grade 11, or Paper Classes.</p>
                        <button
                          type="button"
                          onClick={() => handleOpenAddSlot(inst.id)}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#007fb8] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#102c45]"
                        >
                          <Plus size={13} />
                          Add First Slot
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Slots Table / List */}
                        <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#edf2f7] text-[10.5px] font-black uppercase tracking-wider text-[#475569]">
                              <tr>
                                <th className="px-3.5 py-2.5">Grade</th>
                                <th className="px-3.5 py-2.5">Day</th>
                                <th className="px-3.5 py-2.5">Time</th>
                                <th className="px-3.5 py-2.5">Type</th>
                                <th className="px-3.5 py-2.5">Group / Batch</th>
                                <th className="px-3.5 py-2.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e8f0] bg-white">
                              {inst.slots.map((slot, sIdx) => (
                                <tr key={sIdx} className="hover:bg-[#f8fafc] transition-colors">
                                  <td className="px-3.5 py-2.5 font-bold">
                                    <span
                                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                        slot.grade === "Grade 10"
                                          ? "bg-[#102c45] text-white"
                                          : slot.grade === "Grade 11"
                                          ? "bg-[#007fb8] text-white"
                                          : "bg-[linear-gradient(135deg,#007fb8,#0ac9e8)] text-white"
                                      }`}
                                    >
                                      {slot.grade}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2.5 font-bold text-[#102c45]">
                                    {slot.day}
                                  </td>
                                  <td className="px-3.5 py-2.5 font-bold text-[#007fb8]">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock size={11} />
                                      {slot.time}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2.5 font-semibold text-[#475569]">
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px]">
                                      {slot.type}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2.5 text-[#60768a]">
                                    {slot.group ? (
                                      <span className="rounded bg-[#254967] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                                        {slot.group}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] italic text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      type="button"
                                      title="Edit this slot"
                                      onClick={() => handleOpenEditSlot(inst.id, sIdx)}
                                      className="rounded p-1 text-[#254967] hover:bg-[#edf2f7] hover:text-[#007fb8]"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Delete slot"
                                      onClick={() =>
                                        setDeleteConfirm({
                                          type: "slot",
                                          instituteId: inst.id,
                                          slotIndex: sIdx,
                                          title: `Delete "${slot.grade} - ${slot.day} (${slot.time})"?`,
                                        })
                                      }
                                      className="rounded p-1 text-rose-600 hover:bg-rose-50"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Quick preview card badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f0f9ff] p-3 text-xs text-[#0369a1] border border-sky-100">
                          <span className="font-semibold">
                            💡 Total {grade10Slots.length} Grade 10 slot(s), {grade11Slots.length} Grade 11 slot(s), and {paperSlots.length} Paper Class slot(s).
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenAddSlot(inst.id)}
                            className="font-extrabold text-[#007fb8] hover:underline"
                          >
                            + Add another slot to {inst.name}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ================= MODAL: ADD / EDIT INSTITUTE ================= */}
      {editingInstitute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-lg rounded-3xl border border-[#cddce5] bg-white p-6 shadow-2xl space-y-4 max-sm:p-5">
            <div className="flex items-center justify-between border-b border-[#edf2f7] pb-3">
              <div className="flex items-center gap-2">
                <Building size={18} className="text-[#007fb8]" />
                <h3 className="text-base font-black text-[#102c45]">
                  {isNewInstitute ? "Add New Institute" : "Edit Institute Information"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingInstitute(null)}
                className="size-7 rounded-full text-[#60768a] hover:bg-[#edf2f7] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInstituteModal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#102c45] mb-1">
                  Institute Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingInstitute.name}
                  onChange={(e) =>
                    setEditingInstitute({ ...editingInstitute, name: e.target.value })
                  }
                  placeholder="e.g. Siyatha, Apex, Synergy, Online Master Batch"
                  className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8] focus:ring-1 focus:ring-[#007fb8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <div>
                  <label className="block font-bold text-[#102c45] mb-1">
                    Town / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingInstitute.location}
                    onChange={(e) =>
                      setEditingInstitute({ ...editingInstitute, location: e.target.value })
                    }
                    placeholder="e.g. Gampaha, Kurunegala, Matara"
                    className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8] focus:ring-1 focus:ring-[#007fb8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102c45] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editingInstitute.phone || ""}
                    onChange={(e) =>
                      setEditingInstitute({ ...editingInstitute, phone: e.target.value })
                    }
                    placeholder="e.g. 033 222 3456 / 071 999 8877"
                    className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8] focus:ring-1 focus:ring-[#007fb8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#102c45] mb-1">
                  Full Registered Name
                </label>
                <input
                  type="text"
                  value={editingInstitute.fullName}
                  onChange={(e) =>
                    setEditingInstitute({ ...editingInstitute, fullName: e.target.value })
                  }
                  placeholder="e.g. Siyatha Higher Education Institute"
                  className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8] focus:ring-1 focus:ring-[#007fb8]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#102c45] mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={editingInstitute.address || ""}
                  onChange={(e) =>
                    setEditingInstitute({ ...editingInstitute, address: e.target.value })
                  }
                  placeholder="e.g. Colombo Road, Gampaha"
                  className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8] focus:ring-1 focus:ring-[#007fb8]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inst_isOnline"
                  checked={editingInstitute.isOnline || false}
                  onChange={(e) =>
                    setEditingInstitute({
                      ...editingInstitute,
                      isOnline: e.target.checked,
                    })
                  }
                  className="size-4 rounded accent-[#007fb8] cursor-pointer"
                />
                <label htmlFor="inst_isOnline" className="font-bold text-[#102c45] cursor-pointer">
                  This is an Online Zoom Islandwide Batch (Not a physical building)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#edf2f7] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingInstitute(null)}
                  className="rounded-full px-4 py-2 font-bold text-[#60768a] hover:bg-[#edf2f7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#007fb8] px-5 py-2 font-bold text-white shadow-md hover:bg-[#102c45]"
                >
                  Save Institute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT CLASS SLOT ================= */}
      {editingSlotData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md rounded-3xl border border-[#cddce5] bg-white p-6 shadow-2xl space-y-4 max-sm:p-5">
            <div className="flex items-center justify-between border-b border-[#edf2f7] pb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#007fb8]" />
                <h3 className="text-base font-black text-[#102c45]">
                  {editingSlotData.slotIndex === null ? "Add Class Slot" : "Edit Class Slot"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlotData(null)}
                className="size-7 rounded-full text-[#60768a] hover:bg-[#edf2f7] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlotModal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102c45] mb-1">
                    Grade *
                  </label>
                  <select
                    value={editingSlotData.slot.grade}
                    onChange={(e) =>
                      setEditingSlotData({
                        ...editingSlotData,
                        slot: {
                          ...editingSlotData.slot,
                          grade: e.target.value as ClassSlot["grade"],
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8]"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#102c45] mb-1">
                    Class Type *
                  </label>
                  <select
                    value={editingSlotData.slot.type}
                    onChange={(e) =>
                      setEditingSlotData({
                        ...editingSlotData,
                        slot: {
                          ...editingSlotData.slot,
                          type: e.target.value as ClassSlot["type"],
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8]"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102c45] mb-1">
                    Day of the Week *
                  </label>
                  <select
                    value={editingSlotData.slot.day}
                    onChange={(e) =>
                      setEditingSlotData({
                        ...editingSlotData,
                        slot: {
                          ...editingSlotData.slot,
                          day: e.target.value as ClassSlot["day"],
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8]"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#102c45] mb-1">
                    Group / Batch (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingSlotData.slot.group || ""}
                    onChange={(e) =>
                      setEditingSlotData({
                        ...editingSlotData,
                        slot: { ...editingSlotData.slot, group: e.target.value },
                      })
                    }
                    placeholder="e.g. Group A, Batch 01"
                    className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#102c45] mb-1">
                  Class Timing *
                </label>
                <input
                  type="text"
                  required
                  value={editingSlotData.slot.time}
                  onChange={(e) =>
                    setEditingSlotData({
                      ...editingSlotData,
                      slot: { ...editingSlotData.slot, time: e.target.value },
                    })
                  }
                  placeholder="e.g. 8.30 am - 10.30 am or 3.30 pm - 6.30 pm"
                  className="w-full rounded-xl border border-[#cddce5] px-3 py-2 text-xs font-semibold outline-none focus:border-[#007fb8]"
                />
                <p className="mt-1 text-[10.5px] text-[#60768a]">
                  This time is displayed on cards, filters, and printable PDF schedules.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#edf2f7] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSlotData(null)}
                  className="rounded-full px-4 py-2 font-bold text-[#60768a] hover:bg-[#edf2f7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#007fb8] px-5 py-2 font-bold text-white shadow-md hover:bg-[#102c45]"
                >
                  {editingSlotData.slotIndex === null ? "Add Slot" : "Update Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-sm rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-black text-[#102c45]">Confirm Deletion</h3>
            <p className="text-xs text-[#60768a] leading-relaxed">{deleteConfirm.title}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-full border border-[#cddce5] px-4 py-2 text-xs font-bold text-[#60768a] hover:bg-[#edf2f7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === "institute") {
                    handleDeleteInstitute(deleteConfirm.instituteId);
                  } else if (deleteConfirm.slotIndex !== undefined) {
                    handleDeleteSlot(
                      deleteConfirm.instituteId,
                      deleteConfirm.slotIndex
                    );
                  }
                }}
                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
