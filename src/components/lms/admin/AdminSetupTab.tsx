"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Cloud,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  FolderSync,
  RefreshCw,
  Cpu,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Edit2,
  Trash2,
  Plus,
  Database,
  Users,
  X,
} from "lucide-react";
import { LMSUser } from "@/data/lmsData";
import {
  setSecurityPin,
  verifySecurityPin,
  verifySecurityPinAsync,
  updateSecurityPinInBackend,
  syncSecurityPinFromBackend,
  getGoogleDriveBackupConfig,
  saveGoogleDriveBackupConfig,
  generateFullDatabaseDump,
  GoogleDriveBackupConfig,
  useLmsBatches,
  getLmsUsers,
} from "@/lib/lmsStore";
import { logActivity } from "@/lib/activityLogService";
import { getDirectBackendUrl } from "@/lib/apiConfig";
import {
  executeGoogleDriveBackup,
  getGoogleDriveFolderUrl,
  normalizeGoogleDriveFolderId,
  generateGoogleAppsScriptCode,
  testGoogleDriveWebhook,
  DriveUploadResult,
} from "@/lib/googleDriveBackupService";

interface AdminSetupTabProps {
  currentUser: LMSUser;
  backendStatus: {
    online: boolean;
    database: boolean;
    message: string;
  } | null;
  isCheckingBackend: boolean;
  onCheckBackend: () => void;
  onLockConsole: () => void;
}

export default function AdminSetupTab({
  currentUser,
  backendStatus,
  isCheckingBackend,
  onCheckBackend,
  onLockConsole,
}: AdminSetupTabProps) {
  // 1. PIN Management State
  const [inputCurrentPin, setInputCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [pinSuccessMsg, setPinSuccessMsg] = useState("");
  const [pinErrorMsg, setPinErrorMsg] = useState("");
  const [showPin, setShowPin] = useState(false);

  // 2. Google Drive Backup State
  const [gdriveConfig, setGdriveConfig] = useState<GoogleDriveBackupConfig>(() =>
    getGoogleDriveBackupConfig()
  );
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState("");
  const [backupWarningMsg, setBackupWarningMsg] = useState("");
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [hasCopiedScript, setHasCopiedScript] = useState(false);
  const [backupResult, setBackupResult] = useState<DriveUploadResult | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testWebhookMsg, setTestWebhookMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // 3. Console Security Settings
  const [autoLockTimeout, setAutoLockTimeout] = useState("15");

  // 4. Commerce Batches Management State (Stored in MySQL `batches` table)
  const {
    batches: dbBatches,
    addBatch,
    updateBatch,
    deleteBatch,
    refreshBatches,
  } = useLmsBatches();
  const [newBatchName, setNewBatchName] = useState("");
  const [editingBatch, setEditingBatch] = useState<{
    oldName: string;
    newName: string;
  } | null>(null);
  const [isBatchActionLoading, setIsBatchActionLoading] = useState(false);
  const [isSyncingBatches, setIsSyncingBatches] = useState(false);
  const [batchMsg, setBatchMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [allLmsUsers, setAllLmsUsers] = useState<LMSUser[]>(() => getLmsUsers());

  // Listen for user changes to keep enrolled counts accurate
  useEffect(() => {
    const handleUserChange = () => setAllLmsUsers(getLmsUsers());
    window.addEventListener("lms_users_change", handleUserChange);
    return () => window.removeEventListener("lms_users_change", handleUserChange);
  }, []);

  const getEnrolledStudentCount = (batchName: string) => {
    return allLmsUsers.filter(
      (u) => (u.batch || "").trim().toLowerCase() === batchName.trim().toLowerCase() && u.role === "student"
    ).length;
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newBatchName.trim();
    if (!clean) return;
    setIsBatchActionLoading(true);
    setBatchMsg(null);
    try {
      await addBatch(clean);
      logActivity(
        "Add Commerce Batch",
        "system",
        `Created new Commerce batch '${clean}' in MySQL database`,
        currentUser,
        "success"
      );
      setBatchMsg({ text: `Commerce Batch '${clean}' successfully created in MySQL database.`, ok: true });
      setNewBatchName("");
    } catch {
      setBatchMsg({ text: "Failed to add batch to database.", ok: false });
    } finally {
      setIsBatchActionLoading(false);
      setTimeout(() => setBatchMsg(null), 4000);
    }
  };

  const handleSaveBatchEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    const cleanNew = editingBatch.newName.trim();
    if (!cleanNew) return;
    setIsBatchActionLoading(true);
    setBatchMsg(null);
    try {
      const res = await updateBatch(editingBatch.oldName, cleanNew);
      if (res.success) {
        logActivity(
          "Update Commerce Batch",
          "system",
          `Changed Commerce batch '${editingBatch.oldName}' to '${cleanNew}' in MySQL database`,
          currentUser,
          "success"
        );
        setAllLmsUsers(getLmsUsers());
        setBatchMsg({
          text: `Batch '${editingBatch.oldName}' successfully renamed to '${cleanNew}' across MySQL database and all enrolled students!`,
          ok: true,
        });
        setEditingBatch(null);
      } else {
        setBatchMsg({ text: res.error || "Failed to update batch.", ok: false });
      }
    } catch {
      setBatchMsg({ text: "Error updating batch in database.", ok: false });
    } finally {
      setIsBatchActionLoading(false);
      setTimeout(() => setBatchMsg(null), 5000);
    }
  };

  const handleDeleteBatchClick = async (batchNameToDelete: string) => {
    const studentCount = getEnrolledStudentCount(batchNameToDelete);
    const confirmPrompt =
      studentCount > 0
        ? `Warning: There are ${studentCount} student(s) currently enrolled in '${batchNameToDelete}'. Are you sure you want to remove this batch from the database?`
        : `Are you sure you want to remove '${batchNameToDelete}' from the database?`;
    if (!window.confirm(confirmPrompt)) return;

    setIsBatchActionLoading(true);
    setBatchMsg(null);
    try {
      await deleteBatch(batchNameToDelete);
      logActivity(
        "Delete Commerce Batch",
        "system",
        `Deleted Commerce batch '${batchNameToDelete}' from MySQL database`,
        currentUser,
        "warning"
      );
      setBatchMsg({ text: `Batch '${batchNameToDelete}' removed from MySQL database.`, ok: true });
    } catch {
      setBatchMsg({ text: "Failed to delete batch from database.", ok: false });
    } finally {
      setIsBatchActionLoading(false);
      setTimeout(() => setBatchMsg(null), 4000);
    }
  };

  const handleSyncBatches = async () => {
    setIsSyncingBatches(true);
    setBatchMsg(null);
    try {
      await refreshBatches();
      setAllLmsUsers(getLmsUsers());
      setBatchMsg({ text: "Successfully synchronized Commerce batches from MySQL database.", ok: true });
    } catch {
      setBatchMsg({ text: "Failed to sync batches from database.", ok: false });
    } finally {
      setIsSyncingBatches(false);
      setTimeout(() => setBatchMsg(null), 3000);
    }
  };

  // Sync Security PIN from MySQL database on mount
  useEffect(() => {
    syncSecurityPinFromBackend().catch(() => {});
  }, []);

  // Handle PIN Update (Persists to MySQL Database)
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinErrorMsg("");
    setPinSuccessMsg("");

    const isCurrentValid = await verifySecurityPinAsync(inputCurrentPin);
    if (!isCurrentValid) {
      setPinErrorMsg("Current PIN is incorrect.");
      return;
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      setPinErrorMsg("New PIN must be 4 to 6 numeric digits.");
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinErrorMsg("New PIN and confirmation PIN do not match.");
      return;
    }

    const res = await updateSecurityPinInBackend(newPin, inputCurrentPin);
    if (!res.success) {
      setPinErrorMsg(res.error || "Failed to update Security PIN in MySQL database.");
      return;
    }

    setInputCurrentPin("");
    setNewPin("");
    setConfirmNewPin("");
    setPinSuccessMsg("Administrator Security PIN successfully updated and saved in MySQL database!");
    logActivity(
      "Delete Security PIN Changed",
      "security",
      "Administrator updated the database master deletion security PIN",
      currentUser,
      "warning"
    );
    setTimeout(() => setPinSuccessMsg(""), 3500);
  };

  // Test Webhook Connection
  const handleTestWebhook = async () => {
    if (!gdriveConfig.webhookUrl) {
      setTestWebhookMsg({
        text: "Please enter your Google Apps Script Webhook URL first.",
        ok: false,
      });
      return;
    }
    setIsTestingWebhook(true);
    setTestWebhookMsg(null);
    try {
      const res = await testGoogleDriveWebhook(gdriveConfig.webhookUrl);
      setTestWebhookMsg({ text: res.message, ok: res.success });
    } catch {
      setTestWebhookMsg({
        text: "Test failed. Please verify that the Webhook was deployed as a Web App with access set to Anyone.",
        ok: false,
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Trigger Google Drive Backup & Auto Upload (Without browser file download)
  const handleTriggerGoogleDriveBackup = async () => {
    setIsBackingUp(true);
    setBackupSuccessMsg("");
    setBackupWarningMsg("");

    try {
      // false = Do NOT trigger browser file download! Uploads directly to Google Drive
      const res = await executeGoogleDriveBackup(gdriveConfig, currentUser, false);
      setBackupResult(res);
      const updated = getGoogleDriveBackupConfig();
      setGdriveConfig(updated);

      if (res.driveUploaded) {
        setBackupSuccessMsg(
          `Backup file [${res.filename}] uploaded directly into Google Drive folder [${normalizeGoogleDriveFolderId(gdriveConfig.folderId)}]!`
        );
      } else {
        setBackupWarningMsg(
          `Snapshot generated and archived on your local server (${res.filename}). It has NOT uploaded to Google Drive because Google Drive requires your Webhook URL to be configured below.`
        );
      }
    } catch {
      alert("Error occurred while syncing backup to Google Drive.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownloadAndOpenDrive = () => {
    handleDownloadJsonDump();
    window.open(getGoogleDriveFolderUrl(gdriveConfig.folderId), "_blank");
  };

  const handleDownloadJsonDump = () => {
    const dump = generateFullDatabaseDump();
    const blob = new Blob([dump.jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `evon_lms_db_backup_${dump.timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyAppsScript = () => {
    const code = generateGoogleAppsScriptCode(gdriveConfig.folderId);
    navigator.clipboard.writeText(code);
    setHasCopiedScript(true);
    setTimeout(() => setHasCopiedScript(false), 3000);
  };

  const handleDownloadSqlDump = () => {
    const dump = generateFullDatabaseDump();
    const blob = new Blob([dump.sqlString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `evon_lms_mysql_dump_${dump.timestamp}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card with Instant Console Lock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3 py-0.5 text-[11px] font-black text-[#007fb8] mb-2">
            <ShieldCheck size={13} />
            <span>Master System Governance</span>
          </div>
          <h3 className="text-xl font-black text-[#102c45]">System Setup &amp; Security Console</h3>
          <p className="text-xs text-[#60768a] mt-0.5">
            Configure deletion PIN authorization, console panel lock security, and automated database backups to Google Drive.
          </p>
        </div>

        <button
          type="button"
          onClick={onLockConsole}
          className="inline-flex items-center gap-2 rounded-full bg-[#102c45] px-6 py-2.5 text-xs font-black uppercase text-white shadow-md hover:bg-[#007fb8] active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Lock size={15} className="text-[#38d995]" />
          <span>Lock Console Panel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================
            CARD A: DELETE SECURITY PIN AUTHORIZATION
            ======================================================== */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <KeyRound size={18} />
                </span>
                <div>
                  <h4 className="text-sm font-black text-[#102c45]">
                    Delete Security PIN Protection
                  </h4>
                  <p className="text-[11px] text-[#60768a]">
                    Required to delete students, papers, quizzes, or purge logs.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-[#e8f7f2] border border-[#38d995]/50 px-2.5 py-0.5 text-[10px] font-black text-[#159366]">
                Active PIN: ••••
              </span>
            </div>

            {pinSuccessMsg && (
              <div className="rounded-2xl bg-[#e8f7f2] border border-[#38d995] p-3 text-xs font-black text-[#159366] flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{pinSuccessMsg}</span>
              </div>
            )}

            {pinErrorMsg && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-xs font-black text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{pinErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#102c45] mb-1">
                  Current Security PIN (Default: 1234) *
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={6}
                    required
                    value={inputCurrentPin}
                    onChange={(e) => setInputCurrentPin(e.target.value)}
                    placeholder="Enter current 4-digit PIN"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 pl-3 pr-9 font-mono font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#60768a] hover:text-[#102c45] cursor-pointer"
                  >
                    {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102c45] mb-1">
                    New Security PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="4 to 6 digits"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-mono font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102c45] mb-1">
                    Confirm New PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    placeholder="Repeat new PIN"
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-mono font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] py-2.5 text-xs font-black uppercase text-white shadow-md hover:scale-101 active:scale-95 transition-all cursor-pointer"
              >
                Update Delete Authorization PIN
              </button>
            </form>
          </div>

          <p className="text-[10px] text-[#94a3b8] italic pt-3 border-t border-[#cddce5]/60">
            Security Rule: Deleting any student records or exams strictly prompts for this verified PIN to prevent data loss.
          </p>
        </div>

        {/* ========================================================
            CARD B: GOOGLE DRIVE AUTO BACKUP & DIRECT CLOUD UPLOAD
            ======================================================== */}
        <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-[#007fb8] border border-blue-200">
                  <Cloud size={18} />
                </span>
                <div>
                  <h4 className="text-sm font-black text-[#102c45]">
                    Google Drive Database Auto Backup
                  </h4>
                  <p className="text-[11px] text-[#60768a]">
                    Automated upload and sync of all LMS database tables to your Google Drive folder.
                  </p>
                </div>
              </div>

              <a
                href={getGoogleDriveFolderUrl(gdriveConfig.folderId)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#e0f2fe] hover:bg-[#007fb8] hover:text-white border border-[#007fb8]/30 px-2.5 py-1 text-[10.5px] font-black text-[#007fb8] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                title="Open Folder in Google Drive"
              >
                <ExternalLink size={11} />
                <span>Open Drive</span>
              </a>
            </div>

            {/* Alerts & Notifications */}
            {backupSuccessMsg && (
              <div className="rounded-2xl bg-[#e8f7f2] border border-[#38d995] p-3 text-xs font-black text-[#159366] flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span className="flex-1">{backupSuccessMsg}</span>
                <a
                  href={backupResult?.driveFileUrl || getGoogleDriveFolderUrl(gdriveConfig.folderId)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-[11px] font-bold text-[#159366] shrink-0 hover:text-[#102c45]"
                >
                  View in Drive
                </a>
              </div>
            )}

            {backupWarningMsg && (
              <div className="rounded-2xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <strong className="block font-black text-amber-950">
                      Files Not Appearing in Google Drive?
                    </strong>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {backupWarningMsg}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/80">
                  <button
                    type="button"
                    onClick={handleDownloadAndOpenDrive}
                    className="rounded-full bg-[#007fb8] px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#102c45] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download size={12} />
                    <span>Download Snapshot &amp; Open Google Drive (Drop In)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScriptGuide(true)}
                    className="rounded-full border border-amber-600 bg-white px-3 py-1.5 text-[10.5px] font-bold text-amber-900 hover:bg-amber-100/60 transition-colors cursor-pointer"
                  >
                    ⚡ Enable Hands-Free Auto Upload (30s Guide)
                  </button>
                </div>
              </div>
            )}

            {/* Connection Status Indicator */}
            {Boolean(gdriveConfig.webhookUrl && !gdriveConfig.webhookUrl.includes("drive.google.com")) ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-2.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-emerald-900">
                    Google Drive Webhook Active &amp; Connected
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">
                  Folder: {normalizeGoogleDriveFolderId(gdriveConfig.folderId).slice(0, 12)}...
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-2.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-blue-900">
                  <Sparkles size={13} className="text-[#007fb8]" />
                  <span>
                    Google Drive requires a 1-time Webhook URL to stream files into folder <strong>1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScriptGuide(!showScriptGuide)}
                  className="shrink-0 text-[10.5px] font-bold text-[#007fb8] hover:underline"
                >
                  {showScriptGuide ? "Close Guide" : "Setup Now (30s)"}
                </button>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              {/* Folder ID / Link input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#102c45]">
                    Target Google Drive Folder ID or Link *
                  </label>
                  <span className="text-[10px] text-[#007fb8] font-bold">
                    ID: {normalizeGoogleDriveFolderId(gdriveConfig.folderId).slice(0, 16)}...
                  </span>
                </div>
                <input
                  type="text"
                  value={gdriveConfig.folderId}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cleaned = normalizeGoogleDriveFolderId(val);
                    setGdriveConfig(
                      saveGoogleDriveBackupConfig({ folderId: cleaned })
                    );
                  }}
                  placeholder="https://drive.google.com/drive/folders/1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB?usp=sharing"
                  className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-mono text-xs font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                />
                <div className="flex items-center justify-between text-[10.5px] text-[#60768a] mt-1 px-1">
                  <span>
                    Linked Folder: <strong className="font-mono text-[#007fb8]">{normalizeGoogleDriveFolderId(gdriveConfig.folderId)}</strong>
                  </span>
                  <a
                    href={getGoogleDriveFolderUrl(gdriveConfig.folderId)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#007fb8] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open in Google Drive</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Auto Upload Active Toggle & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/30 p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#102c45] block">Auto-Upload to Drive</span>
                    <span className="text-[10px] text-[#60768a]">Automatic background sync</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGdriveConfig(
                        saveGoogleDriveBackupConfig({
                          autoBackupEnabled: !gdriveConfig.autoBackupEnabled,
                        })
                      )
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      gdriveConfig.autoBackupEnabled ? "bg-[#159366]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        gdriveConfig.autoBackupEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-[#102c45] mb-1">
                    Upload Frequency Schedule
                  </label>
                  <select
                    value={gdriveConfig.frequency}
                    onChange={(e) =>
                      setGdriveConfig(
                        saveGoogleDriveBackupConfig({
                          frequency: e.target.value as "daily" | "weekly" | "instant",
                        })
                      )
                    }
                    className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-bold text-[#102c45] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="daily">Daily Automated Snapshot (24h)</option>
                    <option value="weekly">Weekly Archive (7 Days)</option>
                    <option value="instant">Real-Time (Instant on Data Change)</option>
                  </select>
                </div>
              </div>

              {/* Google Apps Script Direct Webhook Upload */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#102c45] flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#007fb8]" />
                    <span>Google Drive Webhook URL (Direct Auto-Upload)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowScriptGuide(!showScriptGuide)}
                    className="text-[10.5px] font-bold text-[#007fb8] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{showScriptGuide ? "Hide Setup Guide" : "30-Sec Setup Guide"}</span>
                    {showScriptGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={gdriveConfig.webhookUrl || ""}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (val.includes("drive.google.com")) {
                        // User accidentally pasted their Drive folder URL into the Webhook box
                        // Automatically update the folder ID box above instead of popping up an alert!
                        const cleaned = normalizeGoogleDriveFolderId(val);
                        setGdriveConfig(
                          saveGoogleDriveBackupConfig({
                            folderId: cleaned,
                            webhookUrl: "",
                          })
                        );
                        setTestWebhookMsg({
                          text: "Notice: That was your Google Drive folder link, so we saved it as your Target Folder above! If you do not have an Apps Script Webhook, leave this box empty.",
                          ok: true,
                        });
                        return;
                      }
                      setTestWebhookMsg(null);
                      setGdriveConfig(
                        saveGoogleDriveBackupConfig({ webhookUrl: val })
                      );
                    }}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec (Leave blank if you don't have a Webhook)"
                    className="flex-1 rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2 px-3 font-mono text-[11px] font-bold text-[#102c45] focus:bg-white focus:border-[#007fb8] focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isTestingWebhook || !gdriveConfig.webhookUrl}
                    onClick={handleTestWebhook}
                    className="shrink-0 rounded-2xl border border-[#007fb8] bg-[#007fb8] px-3.5 py-2 text-[11px] font-bold text-white hover:bg-[#102c45] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {isTestingWebhook ? "Testing..." : "Test Webhook"}
                  </button>
                </div>

                {/* Webhook Test Feedback */}
                {testWebhookMsg && (
                  <div
                    className={`rounded-2xl p-2.5 text-[11px] font-semibold flex items-center gap-2 ${
                      testWebhookMsg.ok
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : "bg-rose-50 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {testWebhookMsg.ok ? (
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                    ) : (
                      <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                    )}
                    <span>{testWebhookMsg.text}</span>
                  </div>
                )}

                {/* Collapsible 30-Second Google Apps Script Setup Guide */}
                {showScriptGuide && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-3 text-[11px] text-[#102c45]">
                    <div className="flex items-center justify-between font-black text-[#007fb8]">
                      <span>⚡ How to enable auto-upload to folder 1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB in 30 seconds:</span>
                      <button
                        type="button"
                        onClick={handleCopyAppsScript}
                        className="inline-flex items-center gap-1 rounded-full bg-[#007fb8] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#102c45] transition-colors cursor-pointer"
                      >
                        {hasCopiedScript ? <Check size={11} /> : <Copy size={11} />}
                        <span>{hasCopiedScript ? "Copied Script!" : "Copy Webhook Script"}</span>
                      </button>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-[#60768a] text-[11px]">
                      <li>
                        Open{" "}
                        <a
                          href="https://script.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-bold text-[#007fb8]"
                        >
                          script.google.com
                        </a>{" "}
                        and click <strong>New Project</strong>.
                      </li>
                      <li>
                        Delete the existing code, click <strong>&quot;Copy Webhook Script&quot;</strong> button above, and paste it.
                      </li>
                      <li>
                        Click <strong>Deploy &rarr; New Deployment &rarr; Select type (gear icon) &rarr; Web App</strong>.
                      </li>
                      <li>
                        Set <strong>Execute as: &quot;Me&quot;</strong> and <strong>Who has access: &quot;Anyone&quot;</strong>, then click <strong>Deploy</strong>.
                      </li>
                      <li>
                        Copy the generated Web App URL and paste it into the Webhook URL box above, then click <strong>&quot;Test Webhook&quot;</strong>.
                      </li>
                    </ol>
                    <div className="p-2 rounded-xl bg-blue-100/60 text-[#007fb8] font-bold text-[10.5px]">
                      Once pasted, every backup automatically uploads straight into your Google Drive folder!
                    </div>
                  </div>
                )}
              </div>

              {/* Backup Status Strip */}
              <div className="rounded-2xl border border-[#cddce5] bg-[#f8fafc] p-2.5 flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#60768a]">Latest Cloud Sync Status:</span>
                <span className="font-bold text-[#102c45] flex items-center gap-1">
                  {gdriveConfig.lastBackupStatus === "success" && (
                    <CheckCircle2 size={13} className="text-[#159366]" />
                  )}
                  <span>
                    {gdriveConfig.lastBackupTime
                      ? new Date(gdriveConfig.lastBackupTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })
                      : "Ready"}
                  </span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isBackingUp}
                  onClick={handleTriggerGoogleDriveBackup}
                  className="flex-1 rounded-full bg-[linear-gradient(135deg,#007fb8_0%,#0ac9e8_100%)] py-2.5 px-4 text-xs font-black uppercase text-white shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Upload directly to Google Drive without downloading to computer"
                >
                  <FolderSync size={14} className={isBackingUp ? "animate-spin" : ""} />
                  <span>{isBackingUp ? "Uploading to Drive..." : "Auto Upload to Google Drive"}</span>
                </button>

                <div className="flex items-center gap-1.5 self-center">
                  <button
                    type="button"
                    onClick={handleDownloadAndOpenDrive}
                    className="rounded-full border border-[#007fb8] bg-blue-50/60 px-3 py-2 text-[11px] font-bold text-[#007fb8] hover:bg-blue-100/70 active:scale-95 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                    title="Download snapshot and immediately open Google Drive folder to upload"
                  >
                    <ExternalLink size={12} />
                    <span>Download &amp; Open Drive</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJsonDump}
                    className="rounded-full border border-[#cddce5] bg-white px-2.5 py-2 text-[11px] font-bold text-[#102c45] hover:bg-[#edf2f3] active:scale-95 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                    title="Download raw JSON backup"
                  >
                    <Download size={12} />
                    <span>.JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSqlDump}
                    className="rounded-full border border-[#cddce5] bg-white px-2.5 py-2 text-[11px] font-bold text-[#102c45] hover:bg-[#edf2f3] active:scale-95 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                    title="Download raw MySQL .SQL dump"
                  >
                    <Download size={12} />
                    <span>.SQL</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#94a3b8] italic pt-3 border-t border-[#cddce5]/60 flex items-center justify-between">
            <span>Server archive: Automatically preserves local backups in <code className="font-mono text-[#007fb8]">backend/backups/</code>.</span>
            <a
              href={getGoogleDriveFolderUrl(gdriveConfig.folderId)}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[#007fb8] hover:underline inline-flex items-center gap-1"
            >
              <span>View in Drive</span>
              <ExternalLink size={10} />
            </a>
          </p>
        </div>
      </div>

      {/* ========================================================
          CARD C: COMMERCE BATCH ENROLLED & ACADEMIC PROGRAMS (DATABASE)
          ======================================================== */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cddce5]/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#007fb8] border border-[#007fb8]/30">
              <GraduationCap size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-[#102c45]">
                  Commerce Batch Enrolled &amp; Academic Programs
                </h4>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7f2] border border-[#38d995]/50 px-2.5 py-0.5 text-[10px] font-black text-[#159366]">
                  <Database size={11} /> MySQL Database
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#60768a] mt-0.5">
                Manage all Commerce academic batches stored in MySQL (<code className="text-[#007fb8] font-mono">batches</code> table). Changes here immediately update all student registration forms and cascade across all enrolled records.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncBatches}
            disabled={isSyncingBatches}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-4 py-2 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw size={13} className={isSyncingBatches ? "animate-spin" : ""} />
            <span>Sync Database Batches</span>
          </button>
        </div>

        {/* Feedback message */}
        {batchMsg && (
          <div
            className={`rounded-2xl border p-3 text-xs font-black flex items-center gap-2 ${
              batchMsg.ok
                ? "bg-[#e8f7f2] border-[#38d995] text-[#159366]"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {batchMsg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{batchMsg.text}</span>
          </div>
        )}

        {/* Add New Batch Inline Form */}
        <form onSubmit={handleCreateBatch} className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 p-4">
          <label className="block text-xs font-black text-[#102c45] mb-1.5">
            Add New Commerce Batch to Database:
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              placeholder="e.g. 2028 O/L Commerce Foundation or 2027 Sunday Special Batch"
              className="w-full flex-1 rounded-xl border border-[#cddce5] bg-white px-3.5 py-2 text-xs font-bold text-[#102c45] outline-none focus:border-[#007fb8]"
            />
            <button
              type="submit"
              disabled={isBatchActionLoading || !newBatchName.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#102c45] px-5 py-2 text-xs font-black text-white hover:bg-[#007fb8] active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Plus size={14} />
              <span>Add Batch to Database</span>
            </button>
          </div>
        </form>

        {/* Live Database Batches List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#60768a] px-1">
            <span>
              Active Database Batches (<strong className="text-[#102c45]">{dbBatches.length}</strong> configured)
            </span>
            <span>Enrolled Students</span>
          </div>

          <div className="divide-y divide-[#cddce5]/60 rounded-2xl border border-[#cddce5] bg-white overflow-hidden">
            {dbBatches.map((batchItem, index) => {
              const count = getEnrolledStudentCount(batchItem);
              const isEditing = editingBatch?.oldName === batchItem;

              return (
                <div
                  key={batchItem}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-[#f8fafc] transition-colors"
                >
                  {isEditing ? (
                    <form
                      onSubmit={handleSaveBatchEdit}
                      className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                    >
                      <input
                        type="text"
                        value={editingBatch.newName}
                        onChange={(e) =>
                          setEditingBatch({
                            ...editingBatch,
                            newName: e.target.value,
                          })
                        }
                        className="flex-1 rounded-xl border border-[#007fb8] bg-white px-3 py-1.5 text-xs font-bold text-[#102c45] outline-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isBatchActionLoading || !editingBatch.newName.trim()}
                          className="rounded-xl bg-[#159366] px-3.5 py-1.5 text-xs font-black text-white hover:bg-[#127d56] transition-all cursor-pointer"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBatch(null)}
                          className="rounded-xl border border-[#cddce5] px-3 py-1.5 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-[#edf2f3] font-mono text-[11px] font-black text-[#60768a] shrink-0">
                          #{index + 1}
                        </span>
                        <div className="min-w-0">
                          <h5 className="text-xs font-black text-[#102c45] truncate">
                            {batchItem}
                          </h5>
                          <div className="flex items-center gap-2 text-[10.5px] text-[#60768a]">
                            <span>Program ID: batch-{index + 1}</span>
                            <span>&bull;</span>
                            <span className="text-[#007fb8] font-bold">Commerce Stream</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ${
                            count > 0
                              ? "bg-[#e0f2fe] text-[#007fb8] border border-[#bae6fd]"
                              : "bg-gray-100 text-[#60768a]"
                          }`}
                        >
                          <Users size={12} />
                          <span>{count} Student{count === 1 ? "" : "s"} Enrolled</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingBatch({
                                oldName: batchItem,
                                newName: batchItem,
                              })
                            }
                            title="Edit or Rename this batch in database"
                            className="inline-flex items-center gap-1 rounded-xl border border-[#cddce5] bg-white px-2.5 py-1.5 text-xs font-bold text-[#102c45] hover:border-[#007fb8] hover:text-[#007fb8] transition-all cursor-pointer"
                          >
                            <Edit2 size={12} />
                            <span>Change</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBatchClick(batchItem)}
                            title="Delete this batch from database"
                            className="inline-flex items-center justify-center size-8 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          CARD D: CONSOLE PANEL SECURITY & XAMPP CONNECTION
          ======================================================== */}
      <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Cpu size={18} />
            </span>
            <div>
              <h4 className="text-sm font-black text-[#102c45]">
                Console Panel Lock &amp; Session Guard
              </h4>
              <p className="text-[11px] text-[#60768a]">
                Idle auto-lock timeouts and XAMPP MySQL database connectivity.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckBackend}
            disabled={isCheckingBackend}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#007fb8]/30 bg-[#e0f2fe] px-3.5 py-1.5 text-xs font-black text-[#007fb8] hover:bg-[#007fb8] hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw size={13} className={isCheckingBackend ? "animate-spin" : ""} />
            <span>Test Connection &amp; Sync</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#60768a]">Auto-Lock Console:</span>
              <Lock size={14} className="text-[#007fb8]" />
            </div>
            <select
              value={autoLockTimeout}
              onChange={(e) => setAutoLockTimeout(e.target.value)}
              className="w-full rounded-xl border border-[#cddce5] bg-white py-1.5 px-3 font-bold text-[#102c45] focus:outline-none cursor-pointer"
            >
              <option value="5">After 5 Minutes of Inactivity</option>
              <option value="15">After 15 Minutes (Recommended)</option>
              <option value="30">After 30 Minutes</option>
              <option value="60">After 1 Hour</option>
            </select>
          </div>

          <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 p-4 space-y-2">
            <span className="font-bold text-[#60768a] block">MySQL Database (evon_lms):</span>
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  backendStatus?.database ? "bg-[#159366] animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="font-black text-[#102c45]">
                {backendStatus?.database ? "CONNECTED (Port 3306)" : "OFFLINE (Local Fallback)"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/40 p-4 space-y-2">
            <span className="font-bold text-[#60768a] block">Initialize Clean Database:</span>
            <a
              href={getDirectBackendUrl("api/seed.php")}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-xl border border-[#007fb8]/40 bg-white px-3 py-1.5 font-black text-[#007fb8] hover:bg-[#e0f2fe] transition-all"
            >
              Reset to Clean DB &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
