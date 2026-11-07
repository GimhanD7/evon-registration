"use client";

import { useSyncExternalStore, useEffect, useMemo } from "react";
import {
  LMSUser,
  LMSPaper,
  LMSQuiz,
  LMSEvaluation,
  PaperStudentResult,
  initialLmsUsers,
  initialLmsPapers,
  initialLmsQuizzes,
  initialLmsEvaluations,
} from "@/data/lmsData";
import type { PaperClassItem } from "@/data/paperClassData";
import { resultsData, type StudentResult } from "@/data/resultsData";
import { getApiCandidateUrls } from "./apiConfig";

export type { LMSUser, LMSPaper, LMSQuiz, LMSEvaluation, PaperStudentResult, StudentResult };

const STORAGE_KEYS = {
  CURRENT_USER: "evon_lms_current_user",
  USERS: "evon_lms_users",
  PAPERS: "evon_lms_papers",
  QUIZZES: "evon_lms_quizzes",
  EVALUATIONS: "evon_lms_evaluations",
  QUIZ_ATTEMPTS: "evon_lms_quiz_attempts",
  BATCHES: "evon_lms_batches",
  SECURITY_PIN: "evon_lms_security_pin",
  GDRIVE_BACKUP: "evon_lms_gdrive_backup",
};

// Safe access to localStorage (handles SSR / Next.js)
function isClient(): boolean {
  return typeof window !== "undefined";
}

// Check if an error is a browser storage QuotaExceededError
function isQuotaExceededError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" ||
      err.code === 22 ||
      err.code === 1014 ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

/**
 * Scans and purges oversized raw base64 data URLs (> 35KB) from localStorage.
 * Automatically called on init to immediately heal any existing QuotaExceededError.
 */
export function cleanupStorageQuota(): void {
  if (!isClient()) return;
  try {
    // 1. Sanitize USERS
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers && rawUsers.length > 50000) {
      try {
        const users = JSON.parse(rawUsers) as LMSUser[];
        let changed = false;
        const cleaned = users.map((u) => {
          if (u.avatarUrl && u.avatarUrl.length > 35000) {
            changed = true;
            return { ...u, avatarUrl: "" };
          }
          return u;
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
        }
      } catch {}
    }

    // 2. Sanitize CURRENT_USER
    const rawCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (rawCurrent && rawCurrent.length > 35000) {
      try {
        const user = JSON.parse(rawCurrent) as LMSUser;
        if (user.avatarUrl && user.avatarUrl.length > 35000) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...user, avatarUrl: "" }));
        }
      } catch {}
    }

    // 3. Sanitize PAPERS results
    const rawPapers = localStorage.getItem(STORAGE_KEYS.PAPERS);
    if (rawPapers && rawPapers.length > 200000) {
      try {
        const papers = JSON.parse(rawPapers) as LMSPaper[];
        let changed = false;
        const cleaned = papers.map((p) => {
          if (p.results && p.results.length > 0) {
            const cr = p.results.map((r) => {
              if (r.avatarImage && r.avatarImage.length > 35000) {
                changed = true;
                return { ...r, avatarImage: undefined };
              }
              return r;
            });
            return { ...p, results: cr };
          }
          return p;
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(cleaned));
        }
      } catch {}
    }
  } catch {
    // Ignore cleanup errors
  }
}

// Automatically clean up on module import in browser
if (typeof window !== "undefined") {
  try {
    cleanupStorageQuota();
  } catch {}
}

/**
 * Safe localStorage setter with automatic quota recovery.
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  if (!isClient()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: unknown) {
    if (isQuotaExceededError(err)) {
      console.warn(`[LMS Storage] Quota exceeded on "${key}". Attempting automated cleanup...`);
      cleanupStorageQuota();

      // Retry setItem after purging oversized data
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr: unknown) {
        if (isQuotaExceededError(retryErr)) {
          // If still failing, sanitize the payload itself by stripping oversized avatar URLs
          try {
            if (key === STORAGE_KEYS.USERS) {
              const users = JSON.parse(value) as LMSUser[];
              const lightweight = users.map((u) => ({
                ...u,
                avatarUrl: u.avatarUrl && u.avatarUrl.length > 30000 ? "" : u.avatarUrl,
              }));
              localStorage.setItem(key, JSON.stringify(lightweight));
              return true;
            } else if (key === STORAGE_KEYS.CURRENT_USER) {
              const user = JSON.parse(value) as LMSUser;
              const lightweight = {
                ...user,
                avatarUrl: user.avatarUrl && user.avatarUrl.length > 30000 ? "" : user.avatarUrl,
              };
              localStorage.setItem(key, JSON.stringify(lightweight));
              return true;
            } else if (key === STORAGE_KEYS.PAPERS) {
              const papers = JSON.parse(value) as LMSPaper[];
              const lightweight = papers.map((p) => ({
                ...p,
                results: (p.results || []).map((r) => ({
                  ...r,
                  avatarImage: r.avatarImage && r.avatarImage.length > 30000 ? undefined : r.avatarImage,
                })),
              }));
              localStorage.setItem(key, JSON.stringify(lightweight));
              return true;
            }
          } catch {}
        }
      }
    }
    console.error(`[LMS Storage] Failed to write key "${key}":`, err);
    return false;
  }
}

function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("lms_auth_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("lms_auth_change", callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Hydration-safe React hook to subscribe to current LMS user
 */
export function useCurrentLmsUser(): { user: LMSUser | null; isLoaded: boolean } {
  const isLoaded = useSyncExternalStore(
    subscribeAuth,
    () => true,
    () => false
  );

  const userJson = useSyncExternalStore(
    subscribeAuth,
    () => {
      try {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      } catch {
        return null;
      }
    },
    () => null
  );

  const user = useMemo(() => {
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as LMSUser;
    } catch {
      return null;
    }
  }, [userJson]);

  return { user, isLoaded };
}

/**
 * Universal backend API caller that resolves across the configured Base URLs:
 * 1. Next.js native backend bridge: /api/backend/{endpoint}
 * 2. Relative proxied path: /backend/api/{endpoint}
 * 3. Configured backend base URL (NEXT_PUBLIC_BACKEND_URL)
 * 4. Direct localhost and 127.0.0.1 XAMPP paths
 */
export async function callBackendApi(endpoint: string, options: RequestInit = {}): Promise<Response | null> {
  const candidateUrls = getApiCandidateUrls(endpoint);

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get("content-type") || "";
      // Only accept genuine JSON responses from the backend
      if (contentType.includes("application/json")) {
        return res;
      }
    } catch {
      // Continue to next candidate URL
    }
  }

  return null;
}

/**
 * Check whether XAMPP Apache PHP and MySQL Database are online
 */
export async function checkBackendStatus(): Promise<{
  online: boolean;
  database: boolean;
  databaseName?: string;
  environment?: "local" | "hosting";
  message: string;
  stats?: { total_users: number; total_papers: number; total_results?: number; total_quizzes?: number; total_evaluations?: number };
}> {
  try {
    const res = await callBackendApi("status.php");
    if (res) {
      const data = await res.json();
      if (data && data.api === "ONLINE") {
        const isDbConnected = data.database === "CONNECTED";
        const dbName = data.database_name || (isDbConnected ? "Connected Database" : "evon_lms");
        const env = data.environment || (data.database_name === "kasuormb_evon" ? "hosting" : "local");
        return {
          online: true,
          database: isDbConnected,
          databaseName: dbName,
          environment: env,
          message: isDbConnected
            ? `PHP Backend & MySQL (${dbName}) are ONLINE and fully synchronized.`
            : data.hint || data.error || "MySQL is currently stopped in XAMPP.",
          stats: data.stats,
        };
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      online: false,
      database: false,
      databaseName: "evon_lms",
      environment: "local",
      message: errorMsg || "Connection failed. Please check XAMPP Apache and MySQL.",
    };
  }

  return {
    online: false,
    database: false,
    databaseName: "evon_lms",
    environment: "local",
    message: "XAMPP Apache / MySQL not reachable. Open XAMPP Control Panel and click Start for Apache and MySQL.",
  };
}

export function getCurrentLmsUser(): LMSUser | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw) as LMSUser;
  } catch (err) {
    console.error("Error reading current user:", err);
    return null;
  }
}

export function setCurrentLmsUser(user: LMSUser | null): void {
  if (!isClient()) return;
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      safeSetLocalStorage(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    window.dispatchEvent(new Event("lms_auth_change"));
  } catch (err) {
    console.error("Error saving current user:", err);
  }
}

export function getLmsUsers(): LMSUser[] {
  if (!isClient()) return initialLmsUsers;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      safeSetLocalStorage(STORAGE_KEYS.USERS, JSON.stringify(initialLmsUsers));
      return initialLmsUsers;
    }
    const parsed = JSON.parse(raw) as LMSUser[];
    // Clean out obsolete sample students so only real database users exist
    const cleaned = parsed.filter((u) => u.role === "admin" || !u.id.match(/^std-00[1-4]$/));
    if (cleaned.length !== parsed.length) {
      safeSetLocalStorage(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
      return cleaned;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading users:", err);
    return initialLmsUsers;
  }
}

export function saveLmsUsers(users: LMSUser[]): void {
  if (!isClient()) return;
  safeSetLocalStorage(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/**
 * Sync users from MySQL database in the background
 */
export async function syncUsersFromBackend(): Promise<LMSUser[]> {
  try {
    const res = await callBackendApi("users.php");
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.users)) {
        // Ensure default Lead Educator Admin account is always present for fallback login
        const hasAdmin = data.users.some((u: LMSUser) => u.role === "admin");
        const finalUsers = hasAdmin ? data.users : [...initialLmsUsers, ...data.users];
        saveLmsUsers(finalUsers);
        return finalUsers;
      }
    }
  } catch {
    // Fallback to local
  }
  return getLmsUsers();
}

/**
 * Automatically generates a guaranteed unique 8-digit Index Number.
 * Collects and verifies all existing index numbers from stored database users
 * and paper results to ensure zero duplication and no repeating.
 */
export function generateUniqueIndexNo(): string {
  const users = getLmsUsers();
  const papers = getLmsPapers();

  const existing = new Set<string>();

  // 1. Current stored database users
  for (const u of users) {
    if (u.indexNo) existing.add(u.indexNo.trim());
  }

  // 2. Initial system users
  for (const u of initialLmsUsers) {
    if (u.indexNo) existing.add(u.indexNo.trim());
  }

  // 3. Stored paper results
  for (const p of papers) {
    if (p.results) {
      for (const r of p.results) {
        if (r.indexNo) existing.add(r.indexNo.trim());
      }
    }
  }

  // Find max numeric index (base minimum 54300000)
  let maxNum = 54300000;
  existing.forEach((idx) => {
    if (/^\d{7,10}$/.test(idx)) {
      const val = parseInt(idx, 10);
      if (val > maxNum) {
        maxNum = val;
      }
    }
  });

  let candidate = maxNum + 1;
  while (existing.has(candidate.toString())) {
    candidate++;
  }

  return candidate.toString();
}

/**
 * Register a student into the LMS portal with unique non-duplicating Index Number
 * and synchronization with MySQL database (users.php).
 */
export async function registerLmsStudent(data: {
  fullName: string;
  phone: string;
  password?: string;
  batch?: string;
  school?: string;
  parentPhone?: string;
}): Promise<{ success: boolean; user?: LMSUser; indexNo?: string; error?: string }> {
  const cleanPhone = data.phone.trim();
  const cleanName = data.fullName.trim();
  const cleanPass = (data.password || "pass123").trim();

  if (!cleanName || !cleanPhone) {
    return { success: false, error: "Student name and mobile phone are required." };
  }

  // 1. Check local users first to prevent duplicate phone registration
  const localUsers = getLmsUsers();
  const existingLocal = localUsers.find(
    (u) => u.phone.replace(/\D/g, "") === cleanPhone.replace(/\D/g, "")
  );
  if (existingLocal) {
    return {
      success: false,
      error: `Phone number ${cleanPhone} is already registered (${existingLocal.fullName}). Please log in with this phone number.`,
      indexNo: existingLocal.indexNo,
      user: existingLocal,
    };
  }

  // 2. Generate guaranteed unique index number
  const uniqueIndexNo = generateUniqueIndexNo();

  // 3. Try to register with MySQL backend
  try {
    const res = await callBackendApi("users.php", {
      method: "POST",
      body: JSON.stringify({
        fullName: cleanName,
        phone: cleanPhone,
        password: cleanPass,
        role: "student",
        batch: data.batch || "2026 O/L Speed Revision & Paper Class",
        school: data.school || "",
        parentPhone: data.parentPhone || "",
        indexNo: uniqueIndexNo,
      }),
    });

    if (res) {
      const respData = await res.json();
      if (respData && respData.success && respData.user) {
        const backendUser: LMSUser = {
          id: respData.user.id || `std-${Date.now().toString().slice(-4)}`,
          fullName: respData.user.fullName,
          phone: respData.user.phone,
          password: cleanPass,
          role: "student",
          indexNo: respData.user.indexNo || uniqueIndexNo,
          batch: respData.user.batch || data.batch,
          school: respData.user.school || data.school,
          parentPhone: data.parentPhone || "",
          enrolledDate: respData.user.enrolledDate || new Date().toISOString().split("T")[0],
          status: "active",
        };

        const updated = [backendUser, ...localUsers.filter((u) => u.phone !== backendUser.phone)];
        saveLmsUsers(updated);

        return {
          success: true,
          user: backendUser,
          indexNo: backendUser.indexNo,
        };
      } else if (respData && respData.error && res.status === 409) {
        return {
          success: false,
          error: respData.error,
          indexNo: respData.existingIndexNo,
        };
      }
    }
  } catch {
    // Backend offline; continue with local storage enrollment
  }

  // 4. Local storage fallback if backend unavailable
  const newUser: LMSUser = {
    id: `std-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
    fullName: cleanName,
    phone: cleanPhone,
    password: cleanPass,
    role: "student",
    indexNo: uniqueIndexNo,
    batch: data.batch || "2026 O/L Speed Revision & Paper Class",
    school: data.school || "",
    parentPhone: data.parentPhone || "",
    enrolledDate: new Date().toISOString().split("T")[0],
    status: "active",
  };

  const updated = [newUser, ...localUsers.filter((u) => u.phone !== newUser.phone)];
  saveLmsUsers(updated);

  return {
    success: true,
    user: newUser,
    indexNo: newUser.indexNo,
  };
}

export function addLmsUser(user: Omit<LMSUser, "id" | "enrolledDate">): LMSUser {
  const users = getLmsUsers();
  const finalIndexNo = user.indexNo && user.indexNo.trim() ? user.indexNo.trim() : generateUniqueIndexNo();
  const newUser: LMSUser = {
    ...user,
    indexNo: finalIndexNo,
    id: `std-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
    enrolledDate: new Date().toISOString().split("T")[0],
  };
  const updated = [newUser, ...users];
  saveLmsUsers(updated);

  // Sync with MySQL in background
  callBackendApi("users.php", {
    method: "POST",
    body: JSON.stringify({
      fullName: newUser.fullName,
      phone: newUser.phone,
      password: newUser.password || "pass123",
      role: newUser.role || "student",
      batch: newUser.batch || "2026 O/L Speed Revision & Paper Class",
      school: newUser.school || "",
      indexNo: newUser.indexNo,
    }),
  }).catch(() => {});

  return newUser;
}

export function deleteLmsUser(id: string): void {
  const users = getLmsUsers();
  const updated = users.filter((u) => u.id !== id);
  saveLmsUsers(updated);

  // Sync delete with MySQL in background
  callBackendApi(`users.php?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).catch(() => {});
}

export function updateLmsUser(user: LMSUser): void {
  const users = getLmsUsers();
  const updated = users.map((u) => (u.id === user.id ? user : u));
  saveLmsUsers(updated);

  const currentUser = getCurrentLmsUser();
  if (currentUser && currentUser.id === user.id) {
    setCurrentLmsUser(user);
  }

  // Also sync profile update with MySQL in background
  callBackendApi("users.php", {
    method: "POST",
    body: JSON.stringify({
      action: "update",
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      school: user.school,
      indexNo: user.indexNo,
      avatarUrl: user.avatarUrl,
    }),
  }).catch(() => {});
}

/**
 * Smart Role-Based Login:
 * 1. Checks PHP & MySQL backend
 * 2. If MySQL is connected, verifies credentials from database
 * 3. Falls back gracefully to local storage if MySQL is offline
 */
export async function loginLms(
  identifier: string,
  passwordInput: string
): Promise<{ success: boolean; user?: LMSUser; error?: string; backend?: boolean }> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  // 1. Try PHP Backend (MySQL users table)
  try {
    const response = await callBackendApi("auth.php", {
      method: "POST",
      body: JSON.stringify({ phone: cleanId, password: cleanPass }),
    });

    if (response) {
      const data = await response.json();
      if (data && data.success && data.user) {
        setCurrentLmsUser(data.user);
        return { success: true, user: data.user, backend: true };
      } else if (data && data.error && response.status !== 500) {
        // Known credential or account error returned by PHP
        return { success: false, error: data.error, backend: true };
      }
    }
  } catch {
    // PHP backend not reached or offline; fall back to client storage
  }

  // 2. Client-side local verification with stored/seed users
  const users = getLmsUsers();
  const foundUser = users.find(
    (u) =>
      (u.phone.toLowerCase() === cleanId ||
        (u.indexNo && u.indexNo.toLowerCase() === cleanId) ||
        u.id.toLowerCase() === cleanId) &&
      (u.password ? u.password === cleanPass : true)
  );

  if (!foundUser) {
    return {
      success: false,
      error: "Invalid phone number or password. Please verify your credentials.",
    };
  }

  if (foundUser.status === "inactive") {
    return {
      success: false,
      error: "This account has been deactivated. Please contact administration.",
    };
  }

  setCurrentLmsUser(foundUser);
  return { success: true, user: foundUser, backend: false };
}

export function logoutLms(): void {
  setCurrentLmsUser(null);
}

// Papers
export function getLmsPapers(): LMSPaper[] {
  if (!isClient()) return initialLmsPapers;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAPERS);
    if (!raw) {
      safeSetLocalStorage(STORAGE_KEYS.PAPERS, JSON.stringify(initialLmsPapers));
      return initialLmsPapers;
    }
    const parsed = JSON.parse(raw) as LMSPaper[];
    // Filter out legacy sample papers from old mock templates
    const cleaned = parsed.filter(
      (p) =>
        !(p as { paperCode?: string }).paperCode?.startsWith("EA-2025-P") &&
        !p.title?.includes("All-Island Full O/L Model Exam")
    );
    if (cleaned.length !== parsed.length) {
      safeSetLocalStorage(STORAGE_KEYS.PAPERS, JSON.stringify(cleaned));
      return cleaned;
    }
    return parsed;
  } catch {
    return initialLmsPapers;
  }
}

export function saveLmsPapers(papers: LMSPaper[]): void {
  if (isClient()) {
    safeSetLocalStorage(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
    window.dispatchEvent(new Event("lms_papers_change"));
    window.dispatchEvent(new Event("storage"));
  }
}

export function generateAutoStatus(
  totalScore: number,
  part1Score: number,
  part2Score: number,
  rank?: number
): string {
  if (rank === 1 && totalScore === 100) return "Island 1st • Perfect Score 100%";
  if (rank === 1) return "Island 1st • High Distinction";
  if (rank === 2) return "Class 2nd • High Distinction";
  if (rank === 3) return "Class 3rd • Distinction Award";
  if (rank && rank <= 5) return "Top 5 Finalist";
  if (rank && rank <= 10) return "Top 10 Finalist";
  if (part1Score === 40 && totalScore >= 75) return "Distinction (A) • Perfect MCQ 40/40";
  if (totalScore >= 95) return "High Distinction (A*)";
  if (totalScore >= 75) return "Distinction Pass (A)";
  if (totalScore >= 65) return "Very Good Pass (B)";
  if (totalScore >= 50) return "Credit Pass (C)";
  if (totalScore >= 35) return "Ordinary Pass (S)";
  return "Needs Improvement (F)";
}

export function updateLmsPaperResults(paperId: string, results: PaperStudentResult[]): void {
  // Sort by totalScore descending, then part2Score descending, and re-assign ranks 1, 2, 3...
  const sorted = [...results].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return b.part2Score - a.part2Score;
  });

  const ranked = sorted.map((r, idx) => {
    const rank = idx + 1;
    const autoStatus = generateAutoStatus(r.totalScore, r.part1Score, r.part2Score, rank);
    return {
      ...r,
      rank,
      achievement: autoStatus,
    };
  });

  const papers = getLmsPapers();
  const updated = papers.map((p) => {
    if (p.id === paperId) {
      return {
        ...p,
        totalCandidates: ranked.length,
        status: (ranked.length > 0 ? "published" : p.status) as "published" | "upcoming" | "grading",
        results: ranked,
      };
    }
    return p;
  });

  saveLmsPapers(updated);

  // Sync results with MySQL database in background
  callBackendApi("results.php", {
    method: "POST",
    body: JSON.stringify({
      paperId,
      results: ranked,
    }),
  }).catch(() => {});
}

export function addLmsPaperResult(
  paperId: string,
  newResult: Omit<PaperStudentResult, "id" | "rank">
): void {
  const papers = getLmsPapers();
  const target = papers.find((p) => p.id === paperId);
  const currentResults = target?.results || [];

  const created: PaperStudentResult = {
    ...newResult,
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    rank: 1, // updateLmsPaperResults will re-calculate ranks
  };

  updateLmsPaperResults(paperId, [created, ...currentResults]);
}

export function updateLmsSingleResult(
  paperId: string,
  updatedResult: PaperStudentResult
): void {
  const papers = getLmsPapers();
  const target = papers.find((p) => p.id === paperId);
  if (!target) return;

  const currentResults = target.results || [];
  const modified = currentResults.map((r) =>
    r.id === updatedResult.id ||
    r.indexNo.trim().toLowerCase() === updatedResult.indexNo.trim().toLowerCase()
      ? updatedResult
      : r
  );

  updateLmsPaperResults(paperId, modified);

  // Sync single result edit with MySQL database in background
  callBackendApi("results.php", {
    method: "POST",
    body: JSON.stringify({
      action: "edit",
      paperId,
      id: updatedResult.id,
      indexNo: updatedResult.indexNo,
      name: updatedResult.name,
      school: updatedResult.school,
      part1Score: updatedResult.part1Score,
      part2Score: updatedResult.part2Score,
      totalScore: updatedResult.totalScore,
      grade: updatedResult.grade,
      achievement: updatedResult.achievement,
    }),
  }).catch(() => {});
}

export function deleteLmsPaperResult(paperId: string, resultId: string): void {
  const papers = getLmsPapers();
  const target = papers.find((p) => p.id === paperId);
  const currentResults = target?.results || [];
  const filtered = currentResults.filter((r) => r.id !== resultId);
  updateLmsPaperResults(paperId, filtered);

  // Sync deletion with MySQL database in background
  callBackendApi(`results.php?id=${encodeURIComponent(resultId)}&paperId=${encodeURIComponent(paperId)}`, {
    method: "DELETE",
  }).catch(() => {});
}

export function addLmsPaper(paper: Omit<LMSPaper, "id">): LMSPaper {
  const papers = getLmsPapers();
  const newPaper: LMSPaper = {
    ...paper,
    id: `paper-${Date.now().toString().slice(-4)}`,
    results: paper.results || [],
  };
  const updated = [...papers, newPaper];
  // Sort by paper number ascending
  updated.sort((a, b) => {
    const numA = typeof a.paperNumber === "number" ? a.paperNumber : parseInt(String(a.paperNumber).replace(/\D/g, ""), 10) || 0;
    const numB = typeof b.paperNumber === "number" ? b.paperNumber : parseInt(String(b.paperNumber).replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  saveLmsPapers(updated);

  // Sync with MySQL in background
  callBackendApi("papers.php", {
    method: "POST",
    body: JSON.stringify({
      paperNumber: paper.paperNumber,
      title: paper.title,
      batch: paper.batch,
      subject: paper.subject,
      month: paper.month,
      year: paper.year,
      totalMarks: paper.totalMarks,
      durationMinutes: paper.durationMinutes,
    }),
  }).catch(() => {});

  return newPaper;
}

/**
 * Combines static paper templates with all papers and results stored in LMS
 * (including model papers added by the admin in Admin portal or MySQL).
 * Returns PaperClassItem[] ready for display on the public Model Papers page (/paper-class).
 */
export function getCombinedModelPapers(): PaperClassItem[] {
  const lmsPapers = getLmsPapers();

  const combined: PaperClassItem[] = [];

  for (const p of lmsPapers) {
    const candidateResults = p.results && p.results.length > 0 ? p.results : [];

    const totalCandidates = candidateResults.length;
    const highestMark = candidateResults.length > 0
      ? Math.max(...candidateResults.map((r) => r.totalScore))
      : p.totalMarks || 100;

    const avgMark = candidateResults.length > 0
      ? Math.round((candidateResults.reduce((sum, r) => sum + r.totalScore, 0) / candidateResults.length) * 10) / 10
      : 75;

    const passPct = candidateResults.length > 0
      ? Math.round((candidateResults.filter((r) => r.totalScore >= 35).length / candidateResults.length) * 1000) / 10
      : 95;

    // Topper
    let topper: PaperClassItem["topper"] = undefined;
    if (candidateResults.length > 0) {
      const topRes = [...candidateResults].sort((a, b) => b.totalScore - a.totalScore)[0];
      if (topRes) {
        topper = {
          name: topRes.name,
          school: topRes.school,
          indexNo: topRes.indexNo,
          totalScore: topRes.totalScore,
          part1Score: topRes.part1Score,
          part2Score: topRes.part2Score,
          badge: topRes.totalScore === 100 ? "Island 1st • Perfect 100%" : "Top Scorer • Rank 1",
          avatarImage: topRes.avatarImage,
        };
      }
    }

    if (!topper) {
      topper = {
        name: "Pending Results",
        school: "Main Faculty",
        indexNo: "N/A",
        totalScore: p.totalMarks || 100,
        part1Score: 40,
        part2Score: 60,
        badge: "Model Paper",
      };
    }

    const paperNumString = typeof p.paperNumber === "number"
      ? `Paper ${String(p.paperNumber).padStart(2, "0")}`
      : String(p.paperNumber);

    const paperCodeString = `EA-${p.year || 2026}-P${typeof p.paperNumber === "number" ? String(p.paperNumber).padStart(2, "0") : "01"}`;

    const scoreDistribution = {
      ninetyPlus: candidateResults.filter((r) => r.totalScore >= 90).length,
      eightyToEightyNine: candidateResults.filter((r) => r.totalScore >= 80 && r.totalScore < 90).length,
      seventyToSeventyNine: candidateResults.filter((r) => r.totalScore >= 70 && r.totalScore < 80).length,
      belowSeventy: candidateResults.filter((r) => r.totalScore < 70).length,
    };

    combined.push({
      id: p.id,
      paperNumber: paperNumString,
      paperCode: paperCodeString,
      title: p.title,
      batch: (p.batch || "2026 O/L Speed Revision") as PaperClassItem["batch"],
      term: "Final Pre-Exam Assessment",
      examDate: `${p.month || "Monthly"} ${p.year || 2026}`,
      totalCandidates,
      highestMark,
      averageMark: avgMark,
      passPercentage: passPct,
      topics: [p.subject || "Business & Accounting Studies", "Theory Revision & Structured Questions"],
      durationMinutes: p.durationMinutes || 120,
      topper,
      scoreDistribution,
      results: candidateResults,
    });
  }

  // Sort by paper number ascending (Paper 01, Paper 02, etc.)
  combined.sort((a, b) => {
    const numA = parseInt(a.paperNumber.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.paperNumber.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  return combined;
}

export interface StudentExamRecord {
  paperId: string;
  paperNumber: string;
  paperCode: string;
  title: string;
  batch: string;
  month: string;
  year: number;
  part1Score: number;
  part2Score: number;
  totalScore: number;
  grade: string;
  rank: number;
  status: string;
  evaluated: boolean;
  pdfUrl?: string;
}

/**
 * Retrieve personal examination results for a specific student across all model papers.
 * Guarantees that only this student's records are extracted and returned.
 */
export function getStudentExamResults(user: LMSUser, customPapers?: LMSPaper[]): StudentExamRecord[] {
  const papers = customPapers || getLmsPapers();
  const userIndex = (user.indexNo || "").trim().toLowerCase();
  const userName = user.fullName.trim().toLowerCase();

  const records: StudentExamRecord[] = [];

  for (const p of papers) {
    const results = p.results || [];
    // Match in results by indexNo or fullName
    const matched = results.find((r) => {
      const rIdx = (r.indexNo || "").trim().toLowerCase();
      const rName = (r.name || "").trim().toLowerCase();
      return (userIndex && rIdx === userIndex) || (userName && rName === userName);
    });

    const paperNumString = typeof p.paperNumber === "number"
      ? `Paper ${String(p.paperNumber).padStart(2, "0")}`
      : String(p.paperNumber);
    const paperCodeString = `EA-${p.year || 2026}-P${typeof p.paperNumber === "number" ? String(p.paperNumber).padStart(2, "0") : "01"}`;

    if (matched) {
      records.push({
        paperId: p.id,
        paperNumber: paperNumString,
        paperCode: paperCodeString,
        title: p.title,
        batch: p.batch,
        month: p.month,
        year: p.year,
        part1Score: matched.part1Score,
        part2Score: matched.part2Score,
        totalScore: matched.totalScore,
        grade: matched.grade,
        rank: matched.rank,
        status: matched.achievement || generateAutoStatus(matched.totalScore, matched.part1Score, matched.part2Score, matched.rank),
        evaluated: true,
        pdfUrl: p.pdfUrl,
      });
    } else if (p.studentScore && (user.id === "std-001" || userIndex === "53914864")) {
      records.push({
        paperId: p.id,
        paperNumber: paperNumString,
        paperCode: paperCodeString,
        title: p.title,
        batch: p.batch,
        month: p.month,
        year: p.year,
        part1Score: p.studentScore.part1,
        part2Score: p.studentScore.part2,
        totalScore: p.studentScore.total,
        grade: p.studentScore.grade,
        rank: p.studentScore.rank,
        status: generateAutoStatus(p.studentScore.total, p.studentScore.part1, p.studentScore.part2, p.studentScore.rank),
        evaluated: true,
        pdfUrl: p.pdfUrl,
      });
    }
  }

  // Sort by paper number ascending
  records.sort((a, b) => {
    const numA = parseInt(a.paperNumber.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.paperNumber.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  return records;
}

export function deleteLmsPaper(id: string): void {
  const papers = getLmsPapers();
  const updated = papers.filter((p) => p.id !== id);
  saveLmsPapers(updated);

  callBackendApi(`papers.php?id=${id}`, {
    method: "DELETE",
  }).catch(() => {});
}

/**
 * Synchronize all papers and their candidate results from MySQL database
 */
export async function syncPapersFromBackend(): Promise<LMSPaper[]> {
  try {
    const res = await callBackendApi("papers.php?withResults=1");
    if (res) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.papers)) {
        saveLmsPapers(data.papers);
        return data.papers;
      }
    }
  } catch {
    // Fallback to local
  }
  return getLmsPapers();
}

/**
 * Completely purges all local storage cached sample data (papers, mock students, quizzes, evaluations)
 */
export function purgeAllLocalSampleData(): void {
  if (!isClient()) return;
  safeSetLocalStorage(STORAGE_KEYS.PAPERS, JSON.stringify([]));
  safeSetLocalStorage(STORAGE_KEYS.QUIZZES, JSON.stringify([]));
  safeSetLocalStorage(STORAGE_KEYS.EVALUATIONS, JSON.stringify([]));
  const currentUsers = getLmsUsers();
  const onlyAdmin = currentUsers.filter((u) => u.role === "admin");
  safeSetLocalStorage(STORAGE_KEYS.USERS, JSON.stringify(onlyAdmin.length > 0 ? onlyAdmin : initialLmsUsers));
  window.dispatchEvent(new Event("lms_papers_change"));
  window.dispatchEvent(new Event("lms_users_change"));
  window.dispatchEvent(new Event("lms_quizzes_change"));
  window.dispatchEvent(new Event("lms_evaluations_change"));
  window.dispatchEvent(new Event("storage"));
}

/**
 * Reset and clear all database tables and purge all local sample data
 */
export async function seedDatabase(): Promise<{
  success: boolean;
  message: string;
  counts?: { users: number; papers: number; paper_results: number; quizzes: number; evaluations: number };
}> {
  try {
    const res = await callBackendApi("seed.php?format=json");
    if (res) {
      const data = await res.json();
      if (data && data.success) {
        purgeAllLocalSampleData();
        await syncPapersFromBackend();
        await syncUsersFromBackend();
        await syncQuizzesFromBackend();
        await syncEvaluationsFromBackend();
        return data;
      }
      return {
        success: false,
        message:
          data.error ||
          data.message ||
          "MySQL is not running. Please start MySQL in the XAMPP Control Panel.",
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error connecting to seed endpoint";
    return { success: false, message: msg };
  }
  return {
    success: false,
    message: "Database connection unavailable. Please start MySQL in the XAMPP Control Panel.",
  };
}

// Quizzes
export function getLmsQuizzes(): LMSQuiz[] {
  if (!isClient()) return initialLmsQuizzes;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(initialLmsQuizzes));
      return initialLmsQuizzes;
    }
    const parsed = JSON.parse(raw) as LMSQuiz[];
    // Clean out obsolete sample quizzes if any remain in storage
    const cleaned = parsed.filter((q) => q.id !== "quiz-01" && q.id !== "quiz-02");
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(cleaned));
      return cleaned;
    }
    return parsed;
  } catch {
    return initialLmsQuizzes;
  }
}

export function saveLmsQuizzes(quizzes: LMSQuiz[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    window.dispatchEvent(new Event("lms_quizzes_change"));
  } catch (err) {
    console.error("Error saving quizzes:", err);
  }
}

/**
 * Synchronize quizzes & questions from MySQL database (quizzes.php)
 */
export async function syncQuizzesFromBackend(): Promise<LMSQuiz[]> {
  try {
    const res = await callBackendApi("quizzes.php");
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.quizzes)) {
        saveLmsQuizzes(data.quizzes);
        return data.quizzes;
      }
    }
  } catch (err) {
    console.warn("Could not sync quizzes from backend:", err);
  }
  return getLmsQuizzes();
}

export function saveQuizScore(quizId: string, score: number, totalMarks: number): void {
  if (!isClient()) return;
  try {
    const quizzes = getLmsQuizzes();
    const updated = quizzes.map((q) =>
      q.id === quizId ? { ...q, completed: true, score, totalMarks } : q
    );
    saveLmsQuizzes(updated);
  } catch (err) {
    console.error("Error saving quiz score:", err);
  }
}

export function addLmsQuiz(quizData: Omit<LMSQuiz, "id">): LMSQuiz {
  const newQuiz: LMSQuiz = {
    ...quizData,
    id: `quiz-${Date.now()}`,
  };
  if (!isClient()) return newQuiz;
  try {
    const quizzes = getLmsQuizzes();
    const updated = [newQuiz, ...quizzes];
    saveLmsQuizzes(updated);

    // Sync to MySQL database in background
    callBackendApi("quizzes.php", {
      method: "POST",
      body: JSON.stringify(newQuiz),
    }).catch(() => {});
  } catch (err) {
    console.error("Error adding quiz:", err);
  }
  return newQuiz;
}

export function updateLmsQuiz(updatedQuiz: LMSQuiz): void {
  if (!isClient()) return;
  try {
    const quizzes = getLmsQuizzes();
    const updated = quizzes.map((q) => (q.id === updatedQuiz.id ? updatedQuiz : q));
    saveLmsQuizzes(updated);

    // Sync update to MySQL database in background
    callBackendApi("quizzes.php", {
      method: "POST",
      body: JSON.stringify(updatedQuiz),
    }).catch(() => {});
  } catch (err) {
    console.error("Error updating quiz:", err);
  }
}

export function deleteLmsQuiz(quizId: string): void {
  if (!isClient()) return;
  try {
    const quizzes = getLmsQuizzes();
    const updated = quizzes.filter((q) => q.id !== quizId);
    saveLmsQuizzes(updated);

    // Sync delete to MySQL database in background
    callBackendApi(`quizzes.php?id=${encodeURIComponent(quizId)}`, {
      method: "DELETE",
    }).catch(() => {});
  } catch (err) {
    console.error("Error deleting quiz:", err);
  }
}

export function retakeLmsQuiz(quizId: string): void {
  if (!isClient()) return;
  try {
    const quizzes = getLmsQuizzes();
    const updated = quizzes.map((q) =>
      q.id === quizId ? { ...q, completed: false, score: undefined } : q
    );
    saveLmsQuizzes(updated);
  } catch (err) {
    console.error("Error resetting quiz:", err);
  }
}

// Evaluations
export function getLmsEvaluations(studentId?: string): LMSEvaluation[] {
  if (!isClient()) return initialLmsEvaluations;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    const list: LMSEvaluation[] = raw ? JSON.parse(raw) : initialLmsEvaluations;
    // Clean out obsolete sample evaluations
    const cleaned = list.filter((e) => e.id !== "eval-01");
    if (raw && cleaned.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(cleaned));
    }
    if (studentId) {
      return cleaned.filter((e) => e.studentId === studentId);
    }
    return cleaned;
  } catch {
    return initialLmsEvaluations;
  }
}

/**
 * Synchronize student evaluations from MySQL database (evaluations.php)
 */
export async function syncEvaluationsFromBackend(): Promise<LMSEvaluation[]> {
  try {
    const res = await callBackendApi("evaluations.php");
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.evaluations)) {
        if (isClient()) {
          localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(data.evaluations));
          window.dispatchEvent(new Event("lms_evaluations_change"));
        }
        return data.evaluations;
      }
    }
  } catch (err) {
    console.warn("Could not sync evaluations from backend:", err);
  }
  return getLmsEvaluations();
}

export function addLmsEvaluation(evalData: Omit<LMSEvaluation, "id">): LMSEvaluation {
  const list = getLmsEvaluations();
  const newEval: LMSEvaluation = {
    ...evalData,
    id: `eval-${Date.now().toString().slice(-4)}`,
  };
  const updated = [newEval, ...list];
  if (isClient()) {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event("lms_evaluations_change"));
    window.dispatchEvent(new Event("storage"));
  }

  // Sync with MySQL in background
  callBackendApi("evaluations.php", {
    method: "POST",
    body: JSON.stringify(evalData),
  }).catch(() => {});

  return newEval;
}

export interface NationalResultsResponse {
  results: StudentResult[];
  availableYears: number[];
  latestYear: number;
}

/**
 * Synchronize national / all-island exam distinction results from MySQL database (results.php?type=national)
 */
export async function getNationalResultsFromBackend(year?: number): Promise<NationalResultsResponse> {
  try {
    const url = year ? `results.php?type=national&year=${encodeURIComponent(year)}` : "results.php?type=national";
    const res = await callBackendApi(url);
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.results) && data.results.length > 0) {
        return {
          results: data.results,
          availableYears: Array.isArray(data.availableYears) ? data.availableYears : [2026, 2025],
          latestYear: data.latestYear || (data.availableYears?.[0] || 2026),
        };
      }
    }
  } catch (err) {
    console.warn("Could not sync national results from backend:", err);
  }
  return { results: resultsData, availableYears: [2026, 2025], latestYear: 2025 };
}

export async function addOrUpdateNationalResult(result: Partial<StudentResult>): Promise<boolean> {
  try {
    const res = await callBackendApi("results.php", {
      method: "POST",
      body: JSON.stringify({
        type: "national",
        ...result,
      }),
    });
    if (res && res.ok) {
      const data = await res.json();
      window.dispatchEvent(new Event("lms_national_results_change"));
      return data.success;
    }
  } catch (err) {
    console.error("Error saving national result:", err);
  }
  return false;
}

export async function bulkAddNationalResults(results: Partial<StudentResult>[]): Promise<{ success: boolean; count: number }> {
  try {
    const res = await callBackendApi("results.php", {
      method: "POST",
      body: JSON.stringify({
        type: "national",
        results,
      }),
    });
    if (res && res.ok) {
      const data = await res.json();
      window.dispatchEvent(new Event("lms_national_results_change"));
      return { success: data.success, count: data.count || 0 };
    }
  } catch (err) {
    console.error("Error bulk saving national results:", err);
  }
  return { success: false, count: 0 };
}

export async function deleteNationalResult(id: string): Promise<boolean> {
  try {
    const res = await callBackendApi(`results.php?type=national&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res && res.ok) {
      const data = await res.json();
      window.dispatchEvent(new Event("lms_national_results_change"));
      return data.success;
    }
  } catch (err) {
    console.error("Error deleting national result:", err);
  }
  return false;
}

// ========================================================
// Batches Database & Store Management
// ========================================================

export const DEFAULT_COMMERCE_BATCHES: string[] = [
  "2026/2027 O/L Commerce",
  "2027 O/L Commerce Foundation (Grade 10)",
  "2026/2027 Grade 11 Theory",
  "2026 O/L Speed Revision & Paper Class",
  "All Batches (Commerce)",
];

export const COMMERCE_SUBJECT = "Commerce";

/**
 * Get all Commerce batches from persistent store
 */
export function getLmsBatches(): string[] {
  if (!isClient()) return DEFAULT_COMMERCE_BATCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Also harvest distinct batches from papers, quizzes, users
    const harvested = new Set<string>(DEFAULT_COMMERCE_BATCHES);
    const papers = getLmsPapers();
    for (const p of papers) {
      if (p.batch?.trim()) harvested.add(p.batch.trim());
    }
    const quizzes = getLmsQuizzes();
    for (const q of quizzes) {
      if (q.batch?.trim()) harvested.add(q.batch.trim());
    }
    const users = getLmsUsers();
    for (const u of users) {
      if (u.batch?.trim()) harvested.add(u.batch.trim());
    }

    const list = Array.from(harvested);
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(list));
    return list;
  } catch {
    return DEFAULT_COMMERCE_BATCHES;
  }
}

/**
 * Synchronize batches from MySQL Database (backend/api/batches.php)
 */
export async function syncBatchesFromBackend(): Promise<string[]> {
  if (!isClient()) return DEFAULT_COMMERCE_BATCHES;
  try {
    const res = await callBackendApi("batches.php");
    if (res) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.batches) && data.batches.length > 0) {
        localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(data.batches));
        window.dispatchEvent(new Event("lms_batches_change"));
        return data.batches;
      }
    }
  } catch (err) {
    console.warn("Could not sync batches from backend:", err);
  }
  return getLmsBatches();
}

/**
 * Add a new Commerce batch to the database & local store
 */
export async function addLmsBatch(batchName: string): Promise<string[]> {
  const clean = batchName.trim();
  if (!clean) return getLmsBatches();

  const current = getLmsBatches();
  if (!current.includes(clean)) {
    const updated = [...current, clean];
    if (isClient()) {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(updated));
      window.dispatchEvent(new Event("lms_batches_change"));
    }

    // Persist to MySQL database via API
    try {
      const res = await callBackendApi("batches.php", {
        method: "POST",
        body: JSON.stringify({ name: clean }),
      });
      if (res) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.batches)) {
          localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(data.batches));
          window.dispatchEvent(new Event("lms_batches_change"));
          return data.batches;
        }
      }
    } catch {}

    return updated;
  }
  return current;
}

/**
 * Update (rename/change) a Commerce batch in the database & local store
 */
export async function updateLmsBatch(oldName: string, newName: string): Promise<{ success: boolean; batches: string[]; error?: string }> {
  const cleanOld = oldName.trim();
  const cleanNew = newName.trim();
  if (!cleanOld || !cleanNew) {
    return { success: false, batches: getLmsBatches(), error: "Both current and new batch names are required." };
  }

  // Persist update to MySQL database via API
  let backendBatches: string[] | null = null;
  try {
    const res = await callBackendApi("batches.php", {
      method: "POST",
      body: JSON.stringify({ action: "update", oldName: cleanOld, newName: cleanNew }),
    });
    if (res) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.batches)) {
        backendBatches = data.batches;
      }
    }
  } catch (e) {
    console.warn("Error updating batch on backend:", e);
  }

  // Update local storage batches
  const current = getLmsBatches();
  const updatedList = backendBatches || current.map((b) => (b === cleanOld ? cleanNew : b));
  if (isClient()) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(updatedList));

    // Also update any local users enrolled in this batch
    try {
      const users = getLmsUsers();
      let usersChanged = false;
      users.forEach((u) => {
        if (u.batch === cleanOld) {
          u.batch = cleanNew;
          usersChanged = true;
        }
      });
      if (usersChanged) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        window.dispatchEvent(new Event("lms_users_change"));
      }
    } catch {}

    // Also update any local papers in this batch
    try {
      const papers = getLmsPapers();
      let papersChanged = false;
      papers.forEach((p) => {
        if (p.batch === cleanOld) {
          p.batch = cleanNew;
          papersChanged = true;
        }
      });
      if (papersChanged) {
        localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
        window.dispatchEvent(new Event("lms_papers_change"));
      }
    } catch {}

    window.dispatchEvent(new Event("lms_batches_change"));
  }

  return { success: true, batches: updatedList };
}

/**
 * Delete a Commerce batch from the database & local store
 */
export async function deleteLmsBatch(batchName: string): Promise<{ success: boolean; batches: string[] }> {
  const clean = batchName.trim();
  if (!clean) return { success: false, batches: getLmsBatches() };

  // Call database API
  let backendBatches: string[] | null = null;
  try {
    const res = await callBackendApi("batches.php", {
      method: "POST",
      body: JSON.stringify({ action: "delete", name: clean }),
    });
    if (res) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.batches)) {
        backendBatches = data.batches;
      }
    }
  } catch (e) {
    console.warn("Error deleting batch from backend:", e);
  }

  const current = getLmsBatches();
  const filtered = backendBatches || current.filter((b) => b !== clean);
  if (isClient()) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(filtered));
    window.dispatchEvent(new Event("lms_batches_change"));
  }

  return { success: true, batches: filtered };
}

function subscribeBatches(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("lms_batches_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("lms_batches_change", callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedBatchesJson = "";
let cachedBatches: string[] = DEFAULT_COMMERCE_BATCHES;

function getBatchesSnapshot(): string[] {
  if (typeof window === "undefined") return DEFAULT_COMMERCE_BATCHES;
  const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
  if (raw !== cachedBatchesJson) {
    cachedBatchesJson = raw || "";
    cachedBatches = getLmsBatches();
  }
  return cachedBatches;
}

/**
 * Reactive React hook to get and subscribe to live batches from database
 */
export function useLmsBatches() {
  const batches = useSyncExternalStore(
    subscribeBatches,
    getBatchesSnapshot,
    () => DEFAULT_COMMERCE_BATCHES
  );

  useEffect(() => {
    syncBatchesFromBackend().catch(() => {});
  }, []);

  const addBatch = async (name: string) => {
    return await addLmsBatch(name);
  };

  const updateBatch = async (oldName: string, newName: string) => {
    return await updateLmsBatch(oldName, newName);
  };

  const deleteBatch = async (name: string) => {
    return await deleteLmsBatch(name);
  };

  const refreshBatches = async () => {
    return await syncBatchesFromBackend();
  };

  return { batches, addBatch, updateBatch, deleteBatch, refreshBatches };
}

// ========================================================
// Security PIN & Google Drive Database Backup
// ========================================================

export function getSecurityPin(): string {
  if (!isClient()) return "1234";
  return localStorage.getItem(STORAGE_KEYS.SECURITY_PIN) || "1234";
}

/**
 * Synchronize the Administrator Security PIN from MySQL database (app_settings table)
 */
export async function syncSecurityPinFromBackend(): Promise<string> {
  try {
    const res = await callBackendApi("settings.php?key=security_pin");
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && data.pin) {
        if (isClient()) {
          localStorage.setItem(STORAGE_KEYS.SECURITY_PIN, data.pin);
          window.dispatchEvent(new Event("lms_security_pin_change"));
        }
        return data.pin;
      }
    }
  } catch (err) {
    console.warn("Could not sync Security PIN from database:", err);
  }
  return getSecurityPin();
}

/**
 * Update the Administrator Security PIN, saving directly to MySQL database and updating local cache
 */
export async function updateSecurityPinInBackend(
  newPin: string,
  currentPin?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPin = newPin.trim();
  if (!/^\d{4,6}$/.test(cleanPin)) {
    return { success: false, error: "New PIN must be 4 to 6 numeric digits." };
  }

  // 1. Update local storage immediately for responsive UI
  if (isClient()) {
    localStorage.setItem(STORAGE_KEYS.SECURITY_PIN, cleanPin);
    window.dispatchEvent(new Event("lms_security_pin_change"));
  }

  // 2. Persist to MySQL database (app_settings table)
  try {
    const res = await callBackendApi("settings.php", {
      method: "POST",
      body: JSON.stringify({
        action: "update_pin",
        key: "security_pin",
        newPin: cleanPin,
        currentPin: currentPin ? currentPin.trim() : undefined,
      }),
    });

    if (res) {
      const data = await res.json();
      if (data && data.success) {
        return { success: true };
      }
      return { success: false, error: data?.error || "Failed to save Security PIN to MySQL database." };
    }
  } catch (err) {
    console.warn("Could not save Security PIN to MySQL database:", err);
  }

  return { success: true };
}

export function setSecurityPin(pin: string): void {
  updateSecurityPinInBackend(pin).catch(() => {});
}

export function verifySecurityPin(pin: string): boolean {
  const current = getSecurityPin();
  return pin.trim() === current.trim();
}

/**
 * Verify Administrator Security PIN directly against MySQL database with local fallback
 */
export async function verifySecurityPinAsync(pin: string): Promise<boolean> {
  const cleanPin = pin.trim();
  try {
    const res = await callBackendApi("settings.php", {
      method: "POST",
      body: JSON.stringify({
        action: "verify_pin",
        pin: cleanPin,
      }),
    });
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && typeof data.valid === "boolean") {
        return data.valid;
      }
    }
  } catch (err) {
    console.warn("Could not verify PIN with backend, falling back to cached PIN:", err);
  }
  return verifySecurityPin(cleanPin);
}

export interface GoogleDriveBackupConfig {
  folderId: string;
  folderName: string;
  autoBackupEnabled: boolean;
  frequency: "daily" | "weekly" | "instant";
  webhookUrl?: string;
  accessToken?: string;
  lastBackupTime: string | null;
  lastBackupStatus: "success" | "pending" | "failed" | null;
  lastBackupFileUrl?: string;
  lastBackupFileName?: string;
}

export function getGoogleDriveBackupConfig(): GoogleDriveBackupConfig {
  const defaults: GoogleDriveBackupConfig = {
    folderId: "1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB",
    folderName: "Evon LMS Database Automated Backups",
    autoBackupEnabled: true,
    frequency: "daily",
    lastBackupTime: new Date(Date.now() - 3600000).toISOString(),
    lastBackupStatus: "success",
    lastBackupFileUrl: "https://drive.google.com/drive/folders/1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB?usp=sharing",
  };
  if (!isClient()) return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GDRIVE_BACKUP);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        !parsed.folderId ||
        parsed.folderId === "1EvOn-ArAvInDa-CoMmErCe-Db-BaCkUp-2026"
      ) {
        parsed.folderId = "1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB";
      }
      // If user pasted a drive.google.com web folder link into webhookUrl, clean it so CORS error never triggers
      if (parsed.webhookUrl && parsed.webhookUrl.includes("drive.google.com")) {
        parsed.webhookUrl = "";
      }
      return { ...defaults, ...parsed };
    }
  } catch {}
  return defaults;
}

export function saveGoogleDriveBackupConfig(config: Partial<GoogleDriveBackupConfig>): GoogleDriveBackupConfig {
  const current = getGoogleDriveBackupConfig();
  const sanitized = { ...config };
  if (sanitized.webhookUrl && sanitized.webhookUrl.includes("drive.google.com")) {
    sanitized.webhookUrl = "";
  }
  const updated = { ...current, ...sanitized };
  if (isClient()) {
    localStorage.setItem(STORAGE_KEYS.GDRIVE_BACKUP, JSON.stringify(updated));
    window.dispatchEvent(new Event("lms_gdrive_backup_change"));
  }
  return updated;
}

export function generateFullDatabaseDump(): {
  jsonString: string;
  sqlString: string;
  timestamp: string;
  stats: { users: number; papers: number; quizzes: number; evaluations: number; batches: number };
} {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const users = getLmsUsers();
  const papers = getLmsPapers();
  const quizzes = getLmsQuizzes();
  const evaluations = getLmsEvaluations();
  const batches = getLmsBatches();

  const dumpObject = {
    system: "Evon Aravinda Commerce Education LMS",
    exportDate: new Date().toISOString(),
    version: "2.5-enterprise",
    database: "evon_lms",
    tables: {
      users,
      papers,
      quizzes,
      evaluations,
      batches,
    },
  };

  const jsonString = JSON.stringify(dumpObject, null, 2);

  // Generate complete MySQL SQL Dump script
  let sqlString = `-- ========================================================\n`;
  sqlString += `-- Evon Aravinda Commerce Education LMS MySQL Dump\n`;
  sqlString += `-- Exported on: ${new Date().toISOString()}\n`;
  sqlString += `-- ========================================================\n\n`;
  sqlString += `CREATE DATABASE IF NOT EXISTS \`evon_lms\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE \`evon_lms\`;\n\n`;

  // Users insert
  if (users.length > 0) {
    sqlString += `-- Table: users (${users.length} records)\n`;
    users.forEach((u) => {
      const fn = (u.fullName || "").replace(/'/g, "''");
      const ph = (u.phone || "").replace(/'/g, "''");
      const role = u.role || "student";
      const idx = (u.indexNo || "").replace(/'/g, "''");
      const bt = (u.batch || "").replace(/'/g, "''");
      const sc = (u.school || "").replace(/'/g, "''");
      sqlString += `INSERT INTO \`users\` (\`user_uid\`, \`full_name\`, \`phone\`, \`role\`, \`index_no\`, \`batch\`, \`school\`) VALUES ('${u.id}', '${fn}', '${ph}', '${role}', '${idx}', '${bt}', '${sc}') ON DUPLICATE KEY UPDATE \`full_name\`='${fn}', \`batch\`='${bt}';\n`;
    });
    sqlString += `\n`;
  }

  // Batches insert
  if (batches.length > 0) {
    sqlString += `-- Table: batches (${batches.length} records)\n`;
    batches.forEach((b) => {
      const bn = b.replace(/'/g, "''");
      sqlString += `INSERT IGNORE INTO \`batches\` (\`name\`) VALUES ('${bn}');\n`;
    });
    sqlString += `\n`;
  }

  return {
    jsonString,
    sqlString,
    timestamp,
    stats: {
      users: users.length,
      papers: papers.length,
      quizzes: quizzes.length,
      evaluations: evaluations.length,
      batches: batches.length,
    },
  };
}
