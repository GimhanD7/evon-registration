import { LMSUser } from "@/data/lmsData";
import { callBackendApi } from "@/lib/lmsStore";

export interface LMSActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: "admin" | "student" | "system";
  action: string;
  category: "auth" | "quiz" | "exam" | "user_management" | "system" | "security";
  details: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: "success" | "warning" | "info";
}

const STORAGE_KEY = "evon_lms_activity_logs";

function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Retrieve cached activity logs from localStorage
 */
export function getActivityLogs(): LMSActivityLog[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

/**
 * Fetch latest activity logs from MySQL database (backend/api/activity_logs.php)
 */
export async function syncActivityLogsFromBackend(): Promise<LMSActivityLog[]> {
  try {
    const res = await callBackendApi("activity_logs.php");
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.logs)) {
        if (isClient()) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.logs));
          window.dispatchEvent(new Event("lms_activity_logs_change"));
        }
        return data.logs;
      }
    }
  } catch (err) {
    console.warn("Could not sync activity logs from database:", err);
  }
  return getActivityLogs();
}

/**
 * Record an activity event, saving immediately to both local state and MySQL database.
 */
export function logActivity(
  action: string,
  category: LMSActivityLog["category"],
  details: string,
  user?: Partial<LMSUser> | null,
  status: LMSActivityLog["status"] = "info"
): void {
  const newLog: LMSActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: user?.id || "guest",
    userName: user?.fullName || "Anonymous User",
    userRole: (user?.role as "admin" | "student" | "system") || "student",
    action,
    category,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    device: typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 80) : "Web Browser",
    status,
  };

  // 1. Update local cache for instant UI feedback
  if (isClient()) {
    try {
      const existing = getActivityLogs();
      const updated = [newLog, ...existing.filter((l) => l.id !== newLog.id)].slice(0, 300);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("lms_activity_logs_change"));
    } catch {
      // Ignore local storage error
    }
  }

  // 2. Persist to MySQL database via backend API
  callBackendApi("activity_logs.php", {
    method: "POST",
    body: JSON.stringify({
      id: newLog.id,
      userId: newLog.userId,
      userName: newLog.userName,
      userRole: newLog.userRole,
      action: newLog.action,
      category: newLog.category,
      details: newLog.details,
      status: newLog.status,
      device: newLog.device,
    }),
  }).catch((err) => {
    console.warn("Could not save activity log to database:", err);
  });
}

/**
 * Clear all activity logs from both localStorage and MySQL database.
 */
export function clearActivityLogs(): void {
  if (isClient()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("lms_activity_logs_change"));
  }

  // Clear from database
  callBackendApi("activity_logs.php", {
    method: "DELETE",
  }).catch((err) => {
    console.warn("Could not clear activity logs from database:", err);
  });
}
