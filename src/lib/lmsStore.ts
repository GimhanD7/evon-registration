"use client";

import { useSyncExternalStore } from "react";
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
import { paperClassList, demoAccounts, PaperClassItem } from "@/data/paperClassData";
import { getApiCandidateUrls } from "./apiConfig";

export type { LMSUser, LMSPaper, LMSQuiz, LMSEvaluation, PaperStudentResult };

const STORAGE_KEYS = {
  CURRENT_USER: "evon_lms_current_user",
  USERS: "evon_lms_users",
  PAPERS: "evon_lms_papers",
  QUIZZES: "evon_lms_quizzes",
  EVALUATIONS: "evon_lms_evaluations",
  QUIZ_ATTEMPTS: "evon_lms_quiz_attempts",
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

  let user: LMSUser | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson) as LMSUser;
    } catch {
      user = null;
    }
  }

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
  message: string;
  stats?: { total_users: number; total_papers: number; total_results?: number; total_quizzes?: number; total_evaluations?: number };
}> {
  try {
    const res = await callBackendApi("status.php");
    if (res) {
      const data = await res.json();
      if (data && data.api === "ONLINE") {
        const isDbConnected = data.database === "CONNECTED";
        return {
          online: true,
          database: isDbConnected,
          message: isDbConnected
            ? "PHP Backend & MySQL Database are ONLINE and fully synchronized."
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
      message: errorMsg || "Connection failed. Please check XAMPP Apache and MySQL.",
    };
  }

  return {
    online: false,
    database: false,
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
    return JSON.parse(raw) as LMSUser[];
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
      if (data && data.success && Array.isArray(data.users) && data.users.length > 0) {
        saveLmsUsers(data.users);
        return data.users;
      }
    }
  } catch {
    // Fallback to local
  }
  return getLmsUsers();
}

/**
 * Automatically generates a guaranteed unique 8-digit Index Number.
 * Collects and verifies all existing index numbers from stored users, seed users,
 * paper results, and paper class records to ensure zero duplication and no repeating.
 */
export function generateUniqueIndexNo(): string {
  const users = getLmsUsers();
  const papers = getLmsPapers();

  const existing = new Set<string>();

  // 1. Current stored users
  for (const u of users) {
    if (u.indexNo) existing.add(u.indexNo.trim());
  }

  // 2. Initial seed users
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

  // 4. Initial paper results
  for (const p of initialLmsPapers) {
    if (p.results) {
      for (const r of p.results) {
        if (r.indexNo) existing.add(r.indexNo.trim());
      }
    }
  }

  // 5. Demo accounts
  for (const d of demoAccounts) {
    if (d.user.indexNo) existing.add(d.user.indexNo.trim());
  }

  // 6. Paper class results & toppers
  for (const p of paperClassList) {
    if (p.topper?.indexNo) existing.add(p.topper.indexNo.trim());
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
    // Backwards-compatible: enrich with default results if previously saved without results
    const enriched = parsed.map((p) => {
      if (!p.results) {
        const init = initialLmsPapers.find((ip) => ip.id === p.id);
        return { ...p, results: init?.results || [] };
      }
      return p;
    });
    return enriched;
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
    const existingBase = paperClassList.find((base) => base.id === p.id);
    const candidateResults = p.results && p.results.length > 0 ? p.results : existingBase?.results || [];

    const totalCandidates = candidateResults.length || existingBase?.totalCandidates || 0;
    const highestMark = candidateResults.length > 0
      ? Math.max(...candidateResults.map((r) => r.totalScore))
      : existingBase?.highestMark || p.totalMarks || 100;

    const avgMark = candidateResults.length > 0
      ? Math.round((candidateResults.reduce((sum, r) => sum + r.totalScore, 0) / candidateResults.length) * 10) / 10
      : existingBase?.averageMark || 75;

    const passPct = candidateResults.length > 0
      ? Math.round((candidateResults.filter((r) => r.totalScore >= 35).length / candidateResults.length) * 1000) / 10
      : existingBase?.passPercentage || 95;

    // Topper
    let topper = existingBase?.topper;
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
          avatarImage: topRes.avatarImage || existingBase?.topper?.avatarImage,
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

    const paperCodeString = existingBase?.paperCode || `EA-${p.year || 2026}-P${typeof p.paperNumber === "number" ? String(p.paperNumber).padStart(2, "0") : "01"}`;

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
      batch: (p.batch || existingBase?.batch || "2026 O/L Speed Revision") as PaperClassItem["batch"],
      term: existingBase?.term || "Final Pre-Exam Assessment",
      examDate: existingBase?.examDate || `${p.month || "Monthly"} ${p.year || 2026}`,
      totalCandidates,
      highestMark,
      averageMark: avgMark,
      passPercentage: passPct,
      topics: existingBase?.topics || [p.subject || "Business & Accounting Studies", "Theory Revision & Structured Questions"],
      durationMinutes: p.durationMinutes || existingBase?.durationMinutes || 120,
      topper,
      scoreDistribution,
      results: candidateResults,
    });
  }

  // Include any base paperClassList items that might not have been in lmsPapers
  for (const base of paperClassList) {
    if (!combined.some((c) => c.id === base.id)) {
      combined.push(base);
    }
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
      if (data && data.success && Array.isArray(data.papers) && data.papers.length > 0) {
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
 * Trigger full database migration & seed from lmsData and paperClassData into MySQL
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
        await syncPapersFromBackend();
        await syncUsersFromBackend();
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
    return JSON.parse(raw) as LMSQuiz[];
  } catch {
    return initialLmsQuizzes;
  }
}

export function saveQuizScore(quizId: string, score: number, totalMarks: number): void {
  if (!isClient()) return;
  try {
    const quizzes = getLmsQuizzes();
    const updated = quizzes.map((q) =>
      q.id === quizId ? { ...q, completed: true, score, totalMarks } : q
    );
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(updated));
  } catch (err) {
    console.error("Error saving quiz score:", err);
  }
}

// Evaluations
export function getLmsEvaluations(studentId?: string): LMSEvaluation[] {
  if (!isClient()) return initialLmsEvaluations;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    const list: LMSEvaluation[] = raw ? JSON.parse(raw) : initialLmsEvaluations;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(initialLmsEvaluations));
    }
    if (studentId) {
      return list.filter((e) => e.studentId === studentId);
    }
    return list;
  } catch {
    return initialLmsEvaluations;
  }
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
  }

  // Sync with MySQL in background
  callBackendApi("evaluations.php", {
    method: "POST",
    body: JSON.stringify(evalData),
  }).catch(() => {});

  return newEval;
}
