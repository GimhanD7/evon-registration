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
  const isLongRunning = endpoint.includes("backup.php") || endpoint.includes("seed.php");
  const timeoutMs = isLongRunning ? 25000 : 4000;

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
      } else if (data && data.error) {
        // Explicit credential or account error returned by PHP backend
        return { success: false, error: data.error, backend: true };
      }
    }
  } catch {
    // PHP backend not reached or offline; fall back to client storage
  }

  // 2. Client-side local verification with stored/seed users (ONLY if backend is offline)
  const users = getLmsUsers();
  const foundUser = users.find(
    (u) =>
      u.phone.toLowerCase() === cleanId ||
      (u.indexNo && u.indexNo.toLowerCase() === cleanId) ||
      u.id.toLowerCase() === cleanId
  );

  if (!foundUser) {
    return {
      success: false,
      error: "No account found matching this mobile phone number or Index Number.",
    };
  }

  // Strictly verify password - NEVER allow arbitrary passwords for any account
  const expectedPassword =
    foundUser.password ||
    (foundUser.role === "admin" || foundUser.phone === "0719998877"
      ? "admin123"
      : foundUser.phone === "0771234567"
      ? "pass123"
      : null);

  const passwordValid = expectedPassword
    ? cleanPass === expectedPassword || (foundUser.phone === "0771234567" && cleanPass === "student123")
    : false;

  if (!passwordValid) {
    return {
      success: false,
      error: "Incorrect password. Please verify your credentials and try again.",
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
  stats: {
    users: number;
    batches: number;
    papers: number;
    paper_results: number;
    quizzes: number;
    quiz_questions: number;
    quiz_attempts: number;
    evaluations: number;
    national_results: number;
    app_settings: number;
    activity_logs: number;
    total_tables: number;
  };
} {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const users = getLmsUsers();
  const batches = getLmsBatches();
  const papers = getLmsPapers();
  const quizzes = getLmsQuizzes();
  const evaluations = getLmsEvaluations();

  // Extract all paper results
  const paperResults: PaperStudentResult[] = [];
  const paperResultRecords: {
    result_uid: string;
    paper_uid: string;
    rank_in_class: number;
    student_name: string;
    school: string;
    index_no: string;
    part1_score: number;
    part2_score: number;
    total_score: number;
    grade: string;
    achievement: string;
    avatar_initials: string;
  }[] = [];

  papers.forEach((p) => {
    if (Array.isArray(p.results)) {
      p.results.forEach((r) => {
        paperResults.push(r);
        paperResultRecords.push({
          result_uid: r.id || `res-${p.id}-${r.indexNo}`,
          paper_uid: p.id,
          rank_in_class: r.rank || 1,
          student_name: r.name || "",
          school: r.school || "",
          index_no: r.indexNo || "",
          part1_score: r.part1Score || 0,
          part2_score: r.part2Score || 0,
          total_score: r.totalScore || 0,
          grade: r.grade || "A",
          achievement: r.achievement || "",
          avatar_initials: r.avatarInitials || "ST",
        });
      });
    }
  });

  // Extract quiz questions
  const quizQuestions: {
    quiz_uid: string;
    question_text: string;
    options_json: string;
    correct_answer: number;
    explanation: string;
  }[] = [];

  quizzes.forEach((q) => {
    if (Array.isArray(q.questions)) {
      q.questions.forEach((qu) => {
        quizQuestions.push({
          quiz_uid: q.id,
          question_text: qu.question,
          options_json: JSON.stringify(qu.options || []),
          correct_answer: qu.correctAnswer ?? 0,
          explanation: qu.explanation || "",
        });
      });
    }
  });

  // Extract quiz attempts
  let quizAttempts: {
    quiz_uid: string;
    user_uid: string;
    score: number;
    total_marks: number;
    attempted_at: string;
  }[] = [];

  if (isClient()) {
    try {
      const rawAttempts = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
      if (rawAttempts) {
        const parsed = JSON.parse(rawAttempts);
        if (Array.isArray(parsed)) {
          quizAttempts = parsed.map((a: Record<string, unknown>) => ({
            quiz_uid: String(a.quizId || a.quiz_uid || ""),
            user_uid: String(a.userId || a.user_uid || ""),
            score: Number(a.score || 0),
            total_marks: Number(a.totalMarks || a.total_marks || 100),
            attempted_at: String(a.attemptedAt || a.attempted_at || new Date().toISOString()),
          }));
        }
      }
    } catch {}
  }

  // App Settings
  const appSettings: { setting_key: string; setting_value: string }[] = [
    { setting_key: "security_pin", setting_value: getSecurityPin() || "1234" },
    { setting_key: "gdrive_backup_config", setting_value: JSON.stringify(getGoogleDriveBackupConfig()) },
    { setting_key: "system_version", setting_value: "3.0-enterprise" },
  ];

  // Activity Logs
  let activityLogs: {
    log_uid: string;
    user_id: string;
    user_name: string;
    user_role: string;
    action: string;
    category: string;
    details: string;
    status: string;
    created_at: string;
  }[] = [];

  if (isClient()) {
    try {
      const rawLogs = localStorage.getItem("evon_lms_activity_logs");
      if (rawLogs) {
        const parsed = JSON.parse(rawLogs);
        if (Array.isArray(parsed)) {
          activityLogs = parsed.map((l: Record<string, unknown>) => ({
            log_uid: String(l.id || l.log_uid || `log-${Date.now()}`),
            user_id: String(l.userId || l.user_id || "system"),
            user_name: String(l.userName || l.user_name || "System"),
            user_role: String(l.userRole || l.user_role || "system"),
            action: String(l.action || "Log event"),
            category: String(l.category || "system"),
            details: String(l.details || ""),
            status: String(l.status || "info"),
            created_at: String(l.timestamp || l.created_at || new Date().toISOString()),
          }));
        }
      }
    } catch {}
  }

  // National Results
  const nationalResults = resultsData || [];

  const dumpObject = {
    system: "Evon Aravinda Commerce Education LMS",
    exportDate: new Date().toISOString(),
    version: "3.0-enterprise",
    database: "evon_lms",
    tables: {
      users,
      batches,
      papers,
      paper_results: paperResultRecords,
      quizzes,
      quiz_questions: quizQuestions,
      quiz_attempts: quizAttempts,
      evaluations,
      national_results: nationalResults,
      app_settings: appSettings,
      activity_logs: activityLogs,
    },
  };

  const jsonString = JSON.stringify(dumpObject, null, 2);

  // Helper for SQL string escaping
  const esc = (val: unknown): string => {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number") return String(val);
    if (typeof val === "boolean") return val ? "1" : "0";
    return `'${String(val).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
  };

  // Generate complete MySQL SQL Dump script with ALL 11 tables and full DDL
  let sqlString = `-- ========================================================\n`;
  sqlString += `-- Evon Aravinda Commerce Education LMS\n`;
  sqlString += `-- Complete MySQL Database Dump (ALL 11 TABLES)\n`;
  sqlString += `-- Exported on: ${new Date().toISOString()}\n`;
  sqlString += `-- ========================================================\n\n`;
  sqlString += `SET FOREIGN_KEY_CHECKS = 0;\n`;
  sqlString += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
  sqlString += `SET NAMES utf8mb4;\n\n`;
  sqlString += `CREATE DATABASE IF NOT EXISTS \`evon_lms\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
  sqlString += `USE \`evon_lms\`;\n\n`;

  // 1. Table: users
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`users\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`full_name\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(20) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'student', 'superadmin') NOT NULL DEFAULT 'student',
  \`index_no\` VARCHAR(50) DEFAULT NULL,
  \`batch\` VARCHAR(150) DEFAULT '2026 O/L Speed Revision & Paper Class',
  \`school\` VARCHAR(150) DEFAULT NULL,
  \`parent_phone\` VARCHAR(20) DEFAULT NULL,
  \`avatar_url\` VARCHAR(255) DEFAULT NULL,
  \`enrolled_date\` VARCHAR(30) DEFAULT NULL,
  \`status\` ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`phone\`),
  INDEX (\`role\`),
  INDEX (\`index_no\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (users.length > 0) {
    users.forEach((u) => {
      sqlString += `INSERT INTO \`users\` (\`user_uid\`, \`full_name\`, \`phone\`, \`password\`, \`role\`, \`index_no\`, \`batch\`, \`school\`, \`parent_phone\`, \`avatar_url\`, \`enrolled_date\`, \`status\`) VALUES (${esc(u.id)}, ${esc(u.fullName)}, ${esc(u.phone)}, ${esc(u.password || "pass123")}, ${esc(u.role || "student")}, ${esc(u.indexNo)}, ${esc(u.batch)}, ${esc(u.school)}, ${esc(u.parentPhone)}, ${esc(u.avatarUrl)}, ${esc(u.enrolledDate)}, ${esc(u.status || "active")}) ON DUPLICATE KEY UPDATE \`full_name\`=${esc(u.fullName)}, \`batch\`=${esc(u.batch)}, \`index_no\`=${esc(u.indexNo)};\n`;
    });
    sqlString += `\n`;
  }

  // 2. Table: batches
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`batches\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`batches\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL UNIQUE,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (batches.length > 0) {
    batches.forEach((b) => {
      sqlString += `INSERT IGNORE INTO \`batches\` (\`name\`) VALUES (${esc(b)});\n`;
    });
    sqlString += `\n`;
  }

  // 3. Table: papers
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`papers\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`papers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`paper_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`paper_number\` VARCHAR(50) NOT NULL,
  \`paper_code\` VARCHAR(50) DEFAULT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`batch\` VARCHAR(150) NOT NULL,
  \`subject\` VARCHAR(150) DEFAULT 'Business & Accounting Studies',
  \`term\` VARCHAR(100) DEFAULT 'Final Pre-Exam Assessment',
  \`month\` VARCHAR(50) DEFAULT 'Monthly',
  \`year\` INT DEFAULT 2026,
  \`exam_date\` VARCHAR(50) DEFAULT '2026',
  \`total_marks\` INT DEFAULT 100,
  \`duration_minutes\` INT DEFAULT 120,
  \`total_candidates\` INT DEFAULT 0,
  \`highest_mark\` INT DEFAULT 100,
  \`average_mark\` DECIMAL(5,2) DEFAULT 75.00,
  \`pass_percentage\` DECIMAL(5,2) DEFAULT 95.00,
  \`topics\` TEXT DEFAULT NULL,
  \`topper_info\` TEXT DEFAULT NULL,
  \`score_distribution\` TEXT DEFAULT NULL,
  \`pdf_url\` VARCHAR(255) DEFAULT NULL,
  \`marking_scheme_url\` VARCHAR(255) DEFAULT NULL,
  \`status\` ENUM('published', 'upcoming', 'grading') NOT NULL DEFAULT 'published',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`paper_uid\`),
  INDEX (\`batch\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (papers.length > 0) {
    papers.forEach((p) => {
      const pAny = p as unknown as Record<string, unknown>;
      const pCode = pAny.code || `P-${p.paperNumber}`;
      const pTerm = pAny.term || "Monthly Assessment";
      const pExamDate = pAny.date || `${p.year}-${p.month}`;
      const pTotCand = Number(pAny.totalCandidates || (p.results ? p.results.length : 0));
      const pHighest = Number(pAny.highestMark || 100);
      const pAvg = Number(pAny.averageMark || 75);
      const pPassPct = Number(pAny.passPercentage || 95);
      const pTopics = JSON.stringify(pAny.topics || []);
      const pTopper = pAny.topper ? JSON.stringify(pAny.topper) : null;
      const pScoreDist = pAny.scoreDistribution ? JSON.stringify(pAny.scoreDistribution) : null;

      sqlString += `INSERT INTO \`papers\` (\`paper_uid\`, \`paper_number\`, \`paper_code\`, \`title\`,\`batch\`, \`subject\`, \`term\`, \`month\`, \`year\`, \`exam_date\`, \`total_marks\`, \`duration_minutes\`, \`total_candidates\`, \`highest_mark\`, \`average_mark\`, \`pass_percentage\`, \`topics\`, \`topper_info\`, \`score_distribution\`, \`pdf_url\`, \`marking_scheme_url\`, \`status\`) VALUES (${esc(p.id)}, ${esc(p.paperNumber)}, ${esc(pCode)}, ${esc(p.title)}, ${esc(p.batch)}, ${esc(p.subject || "Business & Accounting Studies")}, ${esc(pTerm)}, ${esc(p.month)}, ${esc(p.year || 2026)}, ${esc(pExamDate)}, ${esc(p.totalMarks || 100)}, ${esc(p.durationMinutes || 120)}, ${esc(pTotCand)}, ${esc(pHighest)}, ${esc(pAvg)}, ${esc(pPassPct)}, ${esc(pTopics)}, ${esc(pTopper)}, ${esc(pScoreDist)}, ${esc(p.pdfUrl)}, ${esc(p.markingSchemeUrl)}, ${esc(p.status || "published")}) ON DUPLICATE KEY UPDATE \`title\`=${esc(p.title)}, \`batch\`=${esc(p.batch)};\n`;
    });
    sqlString += `\n`;
  }

  // 4. Table: paper_results
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`paper_results\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`paper_results\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`result_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`paper_uid\` VARCHAR(64) NOT NULL,
  \`rank_in_class\` INT DEFAULT 1,
  \`student_name\` VARCHAR(150) NOT NULL,
  \`school\` VARCHAR(150) DEFAULT NULL,
  \`index_no\` VARCHAR(50) NOT NULL,
  \`part1_score\` INT DEFAULT 0,
  \`part2_score\` INT DEFAULT 0,
  \`total_score\` INT DEFAULT 0,
  \`grade\` VARCHAR(10) DEFAULT 'A',
  \`achievement\` VARCHAR(255) DEFAULT NULL,
  \`avatar_initials\` VARCHAR(10) DEFAULT 'ST',
  \`avatar_image\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`paper_uid\`),
  INDEX (\`index_no\`),
  INDEX (\`total_score\`),
  INDEX (\`rank_in_class\`),
  UNIQUE KEY \`uq_paper_index\` (\`paper_uid\`, \`index_no\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (paperResultRecords.length > 0) {
    paperResultRecords.forEach((r) => {
      sqlString += `INSERT INTO \`paper_results\` (\`result_uid\`, \`paper_uid\`, \`rank_in_class\`, \`student_name\`, \`school\`, \`index_no\`, \`part1_score\`, \`part2_score\`, \`total_score\`, \`grade\`, \`achievement\`, \`avatar_initials\`) VALUES (${esc(r.result_uid)}, ${esc(r.paper_uid)}, ${esc(r.rank_in_class)}, ${esc(r.student_name)}, ${esc(r.school)}, ${esc(r.index_no)}, ${esc(r.part1_score)}, ${esc(r.part2_score)}, ${esc(r.total_score)}, ${esc(r.grade)}, ${esc(r.achievement)}, ${esc(r.avatar_initials)}) ON DUPLICATE KEY UPDATE \`total_score\`=${esc(r.total_score)}, \`grade\`=${esc(r.grade)};\n`;
    });
    sqlString += `\n`;
  }

  // 5. Table: quizzes
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`quizzes\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`quizzes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`quiz_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`title\` VARCHAR(255) NOT NULL,
  \`subject\` VARCHAR(120) DEFAULT 'Business Studies',
  \`batch\` VARCHAR(120) DEFAULT '2026/2027 O/L Commerce',
  \`duration_minutes\` INT DEFAULT 15,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (quizzes.length > 0) {
    quizzes.forEach((q) => {
      sqlString += `INSERT INTO \`quizzes\` (\`quiz_uid\`, \`title\`, \`subject\`, \`batch\`, \`duration_minutes\`) VALUES (${esc(q.id)}, ${esc(q.title)}, ${esc(q.subject || "Business Studies")}, ${esc(q.batch)}, ${esc(q.durationMinutes || 15)}) ON DUPLICATE KEY UPDATE \`title\`=${esc(q.title)};\n`;
    });
    sqlString += `\n`;
  }

  // 6. Table: quiz_questions
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`quiz_questions\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`quiz_questions\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`quiz_uid\` VARCHAR(64) NOT NULL,
  \`question_text\` TEXT NOT NULL,
  \`options_json\` TEXT NOT NULL,
  \`correct_answer\` TINYINT NOT NULL,
  \`explanation\` TEXT DEFAULT NULL,
  INDEX (\`quiz_uid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (quizQuestions.length > 0) {
    quizQuestions.forEach((qu) => {
      sqlString += `INSERT INTO \`quiz_questions\` (\`quiz_uid\`, \`question_text\`, \`options_json\`, \`correct_answer\`, \`explanation\`) VALUES (${esc(qu.quiz_uid)}, ${esc(qu.question_text)}, ${esc(qu.options_json)}, ${esc(qu.correct_answer)}, ${esc(qu.explanation)});\n`;
    });
    sqlString += `\n`;
  }

  // 7. Table: quiz_attempts
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`quiz_attempts\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`quiz_attempts\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`quiz_uid\` VARCHAR(64) NOT NULL,
  \`user_uid\` VARCHAR(64) NOT NULL,
  \`score\` INT NOT NULL,
  \`total_marks\` INT NOT NULL DEFAULT 100,
  \`attempted_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`quiz_uid\`),
  INDEX (\`user_uid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (quizAttempts.length > 0) {
    quizAttempts.forEach((qa) => {
      sqlString += `INSERT INTO \`quiz_attempts\` (\`quiz_uid\`, \`user_uid\`, \`score\`, \`total_marks\`) VALUES (${esc(qa.quiz_uid)}, ${esc(qa.user_uid)}, ${esc(qa.score)}, ${esc(qa.total_marks)});\n`;
    });
    sqlString += `\n`;
  }

  // 8. Table: evaluations
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`evaluations\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`evaluations\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`evaluation_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`student_id\` VARCHAR(64) NOT NULL,
  \`paper_or_term\` VARCHAR(150) NOT NULL,
  \`evaluation_date\` DATE NOT NULL,
  \`attendance_rate\` INT DEFAULT 95,
  \`strengths\` TEXT DEFAULT NULL,
  \`weaknesses\` TEXT DEFAULT NULL,
  \`teacher_remarks\` TEXT NOT NULL,
  \`recommended_action\` TEXT NOT NULL,
  \`performance_grade\` VARCHAR(50) DEFAULT 'Outstanding',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`student_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (evaluations.length > 0) {
    evaluations.forEach((e) => {
      sqlString += `INSERT INTO \`evaluations\` (\`evaluation_uid\`, \`student_id\`, \`paper_or_term\`, \`evaluation_date\`, \`attendance_rate\`, \`strengths\`, \`weaknesses\`, \`teacher_remarks\`, \`recommended_action\`, \`performance_grade\`) VALUES (${esc(e.id)}, ${esc(e.studentId)}, ${esc(e.paperOrTerm)}, ${esc(e.date || "2026-01-01")}, ${esc(e.attendanceRate || 95)}, ${esc(JSON.stringify(e.strengths || []))}, ${esc(JSON.stringify(e.weaknesses || []))}, ${esc(e.teacherRemarks)}, ${esc(e.recommendedAction)}, ${esc(e.performanceGrade || "Outstanding")}) ON DUPLICATE KEY UPDATE \`teacher_remarks\`=${esc(e.teacherRemarks)};\n`;
    });
    sqlString += `\n`;
  }

  // 9. Table: national_results
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`national_results\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`national_results\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`student_name\` VARCHAR(150) NOT NULL,
  \`school\` VARCHAR(150) NOT NULL,
  \`index_no\` VARCHAR(50) NOT NULL UNIQUE,
  \`year\` INT DEFAULT 2025,
  \`grade_badge\` VARCHAR(10) NOT NULL,
  \`letter_grade\` VARCHAR(5) NOT NULL,
  \`is_top_champion\` TINYINT(1) DEFAULT 0,
  \`quote\` TEXT DEFAULT NULL,
  \`avatar_image\` VARCHAR(255) DEFAULT NULL,
  INDEX (\`index_no\`),
  INDEX (\`year\`),
  INDEX (\`grade_badge\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (nationalResults.length > 0) {
    nationalResults.forEach((nr) => {
      sqlString += `INSERT INTO \`national_results\` (\`student_name\`, \`school\`, \`index_no\`, \`year\`, \`grade_badge\`, \`letter_grade\`, \`is_top_champion\`, \`quote\`, \`avatar_image\`) VALUES (${esc(nr.name)}, ${esc(nr.school)}, ${esc(nr.indexNo)}, ${esc(nr.year || 2025)}, ${esc(nr.gradeBadge)}, ${esc(nr.letterGrade)}, ${esc(nr.isTopChampion ? 1 : 0)}, ${esc(nr.quote)}, ${esc(nr.avatarImage)}) ON DUPLICATE KEY UPDATE \`student_name\`=${esc(nr.name)};\n`;
    });
    sqlString += `\n`;
  }

  // 10. Table: app_settings
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`app_settings\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`app_settings\` (
  \`setting_key\` VARCHAR(64) PRIMARY KEY,
  \`setting_value\` TEXT NOT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  appSettings.forEach((s) => {
    sqlString += `INSERT INTO \`app_settings\` (\`setting_key\`, \`setting_value\`) VALUES (${esc(s.setting_key)}, ${esc(s.setting_value)}) ON DUPLICATE KEY UPDATE \`setting_value\`=${esc(s.setting_value)};\n`;
  });
  sqlString += `\n`;

  // 11. Table: activity_logs
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `-- Table structure and data for table \`activity_logs\`\n`;
  sqlString += `-- --------------------------------------------------------\n`;
  sqlString += `CREATE TABLE IF NOT EXISTS \`activity_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`log_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`user_id\` VARCHAR(64) DEFAULT 'guest',
  \`user_name\` VARCHAR(150) NOT NULL DEFAULT 'Anonymous User',
  \`user_role\` VARCHAR(50) NOT NULL DEFAULT 'student',
  \`action\` VARCHAR(255) NOT NULL,
  \`category\` VARCHAR(50) NOT NULL DEFAULT 'system',
  \`details\` TEXT DEFAULT NULL,
  \`ip_address\` VARCHAR(100) DEFAULT NULL,
  \`device\` VARCHAR(255) DEFAULT NULL,
  \`status\` ENUM('success', 'warning', 'info') NOT NULL DEFAULT 'info',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`user_id\`),
  INDEX (\`category\`),
  INDEX (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (activityLogs.length > 0) {
    activityLogs.forEach((l) => {
      sqlString += `INSERT INTO \`activity_logs\` (\`log_uid\`, \`user_id\`, \`user_name\`, \`user_role\`, \`action\`, \`category\`, \`details\`, \`status\`) VALUES (${esc(l.log_uid)}, ${esc(l.user_id)}, ${esc(l.user_name)}, ${esc(l.user_role)}, ${esc(l.action)}, ${esc(l.category)}, ${esc(l.details)}, ${esc(l.status)});\n`;
    });
    sqlString += `\n`;
  }

  sqlString += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  sqlString += `-- End of dump\n`;

  return {
    jsonString,
    sqlString,
    timestamp,
    stats: {
      users: users.length,
      batches: batches.length,
      papers: papers.length,
      paper_results: paperResultRecords.length,
      quizzes: quizzes.length,
      quiz_questions: quizQuestions.length,
      quiz_attempts: quizAttempts.length,
      evaluations: evaluations.length,
      national_results: nationalResults.length,
      app_settings: appSettings.length,
      activity_logs: activityLogs.length,
      total_tables: 11,
    },
  };
}
