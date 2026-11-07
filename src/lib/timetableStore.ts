"use client";

import { useSyncExternalStore } from "react";
import {
  InstituteTimetable,
  ClassSlot,
  institutesData as defaultInstitutesData,
} from "@/data/timetableData";
import { callBackendApi } from "@/lib/lmsStore";

export type { InstituteTimetable, ClassSlot };

const STORAGE_KEY = "evon_lms_timetable_data";

function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Retrieve current timetable data from localStorage, falling back to default institutes data.
 */
export function getTimetableData(): InstituteTimetable[] {
  if (!isClient()) return defaultInstitutesData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to parse timetable data from storage:", err);
  }
  return defaultInstitutesData;
}

/**
 * Save timetable data to localStorage, dispatch change event, and sync to MySQL backend.
 */
export function saveTimetableData(institutes: InstituteTimetable[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(institutes));
    window.dispatchEvent(new Event("evon_lms_timetable_change"));
  } catch (err) {
    console.warn("Failed to save timetable to storage:", err);
  }

  // Asynchronously sync with MySQL backend
  saveTimetableToBackend(institutes).catch(() => {});
}

/**
 * Reset timetable back to official default institutes data.
 */
export function resetTimetableToDefault(): InstituteTimetable[] {
  saveTimetableData(defaultInstitutesData);
  return defaultInstitutesData;
}

// Memory cache for useSyncExternalStore to prevent infinite re-renders
let cachedTimetable: InstituteTimetable[] | null = null;
let cachedRaw: string | null = null;

function subscribeTimetable(callback: () => void): () => void {
  if (!isClient()) return () => {};
  const handler = () => {
    cachedTimetable = null;
    cachedRaw = null;
    callback();
  };
  window.addEventListener("evon_lms_timetable_change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("evon_lms_timetable_change", handler);
    window.removeEventListener("storage", handler);
  };
}

function getTimetableSnapshot(): InstituteTimetable[] {
  if (!isClient()) return defaultInstitutesData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw && cachedTimetable !== null) {
      return cachedTimetable;
    }
    cachedRaw = raw;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedTimetable = parsed;
        return parsed;
      }
    }
  } catch {}
  cachedTimetable = defaultInstitutesData;
  return defaultInstitutesData;
}

function getServerTimetableSnapshot(): InstituteTimetable[] {
  return defaultInstitutesData;
}

/**
 * Reactive React hook to access and subscribe to real-time timetable updates across the app.
 */
export function useTimetableData(): InstituteTimetable[] {
  return useSyncExternalStore(
    subscribeTimetable,
    getTimetableSnapshot,
    getServerTimetableSnapshot
  );
}

/**
 * Sync timetable data from MySQL database (backend/api/timetable.php or settings.php).
 */
export async function syncTimetableFromBackend(): Promise<InstituteTimetable[]> {
  try {
    // 1. Try dedicated timetable.php API
    const res = await callBackendApi("timetable.php");
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.institutes) && data.institutes.length > 0) {
        saveTimetableData(data.institutes);
        return data.institutes;
      }
    }

    // 2. Fallback to settings.php with key timetable_data
    const settingsRes = await callBackendApi("settings.php?key=timetable_data");
    if (settingsRes && settingsRes.ok) {
      const data = await settingsRes.json();
      if (data && data.success && data.value) {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveTimetableData(parsed);
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("Could not sync timetable from MySQL database:", err);
  }
  return getTimetableData();
}

/**
 * Persist timetable data into MySQL database.
 */
export async function saveTimetableToBackend(
  institutes: InstituteTimetable[]
): Promise<boolean> {
  const jsonString = JSON.stringify(institutes);
  try {
    // 1. Try dedicated timetable.php endpoint
    const res = await callBackendApi("timetable.php", {
      method: "POST",
      body: JSON.stringify({ institutes }),
    });
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return true;
      }
    }

    // 2. Fallback to settings.php
    const settingsRes = await callBackendApi("settings.php", {
      method: "POST",
      body: JSON.stringify({
        key: "timetable_data",
        value: jsonString,
      }),
    });
    if (settingsRes && settingsRes.ok) {
      const data = await settingsRes.json();
      return Boolean(data && data.success);
    }
  } catch (err) {
    console.warn("Could not persist timetable to MySQL database:", err);
  }
  return false;
}
