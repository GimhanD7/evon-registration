import { LMSUser } from "@/data/lmsData";

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

const INITIAL_LOGS: LMSActivityLog[] = [
  {
    id: "log-101",
    userId: "admin-01",
    userName: "Evon Aravinda (Master Admin)",
    userRole: "admin",
    action: "Admin Session Authenticated",
    category: "auth",
    details: "Logged into Master LMS Console via Windows 11 Desktop (Chrome 124)",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.100 (Colombo, Sri Lanka)",
    device: "Windows Desktop • Chrome",
    status: "success",
  },
  {
    id: "log-102",
    userId: "std-001",
    userName: "Senuri Fernando",
    userRole: "student",
    action: "Quiz Completed (Locked)",
    category: "quiz",
    details: "Finished Accounting Speed Revision MCQ 01 (Score: 92%, +100 XP Earned)",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    ipAddress: "112.134.140.22 (Colombo)",
    device: "Android Smartphone • Chrome Mobile",
    status: "success",
  },
  {
    id: "log-103",
    userId: "admin-01",
    userName: "Evon Aravinda",
    userRole: "admin",
    action: "Quizzes Imported via Excel",
    category: "quiz",
    details: "Successfully parsed and saved 3 Commerce MCQ Quizzes from Excel template",
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.100 (Faculty Network)",
    device: "Windows Desktop • Chrome",
    status: "info",
  },
  {
    id: "log-104",
    userId: "std-002",
    userName: "Kaveen Jayasuriya",
    userRole: "student",
    action: "Exam Results Viewed",
    category: "exam",
    details: "Inspected official marksheet for Model Paper #05 - Final Accounts",
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    ipAddress: "175.157.88.94 (Gampaha)",
    device: "Windows Laptop • Firefox",
    status: "info",
  },
  {
    id: "log-105",
    userId: "admin-01",
    userName: "Evon Aravinda",
    userRole: "admin",
    action: "Security PIN Configured",
    category: "security",
    details: "Delete verification PIN updated and console auto-lock safety enabled",
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.100",
    device: "Windows Desktop • Chrome",
    status: "warning",
  },
  {
    id: "log-106",
    userId: "system",
    userName: "Cloud Sync Engine",
    userRole: "system",
    action: "Google Drive Automated Backup",
    category: "system",
    details: "Full MySQL database & LMS JSON snapshot synced to Google Drive folder",
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    ipAddress: "Google Drive API (Cloud Agent)",
    device: "Auto-Scheduler Daemon",
    status: "success",
  },
];

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getActivityLogs(): LMSActivityLog[] {
  if (!isClient()) return INITIAL_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
    return INITIAL_LOGS;
  } catch {
    return INITIAL_LOGS;
  }
}

export function logActivity(
  action: string,
  category: LMSActivityLog["category"],
  details: string,
  user?: Partial<LMSUser> | null,
  status: LMSActivityLog["status"] = "info"
): void {
  if (!isClient()) return;
  try {
    const logs = getActivityLogs();
    const newLog: LMSActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user?.id || "guest",
      userName: user?.fullName || "Anonymous User",
      userRole: (user?.role as "admin" | "student") || "student",
      action,
      category,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100 (Local Verified)",
      device: typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 40) : "Web Browser",
      status,
    };
    const updated = [newLog, ...logs].slice(0, 100); // keep latest 100 logs
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("lms_activity_logs_change"));
  } catch (err) {
    console.warn("Could not save activity log:", err);
  }
}

export function clearActivityLogs(): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event("lms_activity_logs_change"));
}
