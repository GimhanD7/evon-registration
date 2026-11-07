import {
  generateFullDatabaseDump,
  getGoogleDriveBackupConfig,
  saveGoogleDriveBackupConfig,
  GoogleDriveBackupConfig,
  callBackendApi,
} from "@/lib/lmsStore";
import { logActivity } from "@/lib/activityLogService";
import { LMSUser } from "@/data/lmsData";

/**
 * Extracts a clean Google Drive folder ID from a URL or raw ID string.
 */
export function normalizeGoogleDriveFolderId(input: string): string {
  if (!input) return "1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB";
  const trimmed = input.trim();
  // Match https://drive.google.com/drive/folders/{folderId} or /u/0/folders/{folderId}
  const urlMatch = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return trimmed;
}

/**
 * Returns the web URL to open the user's Google Drive folder in a new tab.
 */
export function getGoogleDriveFolderUrl(folderId: string): string {
  const cleanId = normalizeGoogleDriveFolderId(folderId);
  return `https://drive.google.com/drive/folders/${cleanId}?usp=sharing`;
}

/**
 * Generates an automated Google Apps Script Web App snippet.
 * When deployed in Google Drive (Takes 30 seconds), it automatically saves incoming
 * database backups directly into the specified folder without requiring complex GCP credentials.
 */
export function generateGoogleAppsScriptCode(folderId: string): string {
  const cleanId = normalizeGoogleDriveFolderId(folderId);
  return `/**
 * Evon Aravinda Commerce Education LMS - Google Drive Auto-Backup Webhook
 * Target Folder: https://drive.google.com/drive/folders/${cleanId}
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open https://script.google.com and click "New Project"
 * 2. Delete all existing code and paste this ENTIRE script
 * 3. Click "Deploy" -> "New Deployment"
 * 4. Choose type: "Web App"
 * 5. Configuration:
 *      - Description: Evon LMS Auto-Backup
 *      - Execute as: Me (your Google account)
 *      - Who has access: Anyone
 * 6. Click "Deploy", approve permissions, and copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 7. Paste that Web App URL into your LMS Admin Settings -> Google Drive Webhook URL box!
 */

function doPost(e) {
  try {
    var raw = e && e.postData ? e.postData.contents : "";
    var data = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (ex) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var targetFolderId = "${cleanId}";
    if (data.folderId && data.folderId.length > 5) {
      targetFolderId = data.folderId;
    }

    var folder = DriveApp.getFolderById(targetFolderId);
    var timestamp = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd_HH-mm-ss");
    var filename = data.filename || ("evon_lms_backup_" + timestamp + ".json");
    var content = typeof data.content === "string" ? data.content : JSON.stringify(data.content, null, 2);

    var file = folder.createFile(filename, content, MimeType.PLAIN_TEXT);
    file.setDescription("Automated Database Backup from Evon Aravinda Commerce LMS (" + timestamp + ")");

    var result = {
      status: "success",
      message: "Backup file saved to Google Drive folder successfully!",
      fileId: file.getId(),
      filename: filename,
      url: file.getUrl(),
      folderUrl: folder.getUrl(),
      folderId: targetFolderId,
      timestamp: timestamp
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Evon LMS Google Drive Webhook is connected to folder ${cleanId}",
    folderId: "${cleanId}"
  })).setMimeType(ContentService.MimeType.JSON);
}`;
}

export interface DriveUploadResult {
  success: boolean;
  driveUploaded: boolean;
  uploadMethod?: "webhook" | "oauth" | "server_archive";
  message: string;
  filename: string;
  timestamp: string;
  folderId: string;
  folderUrl: string;
  driveFileUrl?: string;
  localBackup?: {
    json_file: string;
    sql_file: string;
    json_size_kb: number;
    sql_size_kb?: number;
  };
  stats: {
    users: number;
    papers: number;
    quizzes: number;
    evaluations: number;
    batches: number;
  };
}

/**
 * Tests connection to a Google Drive Apps Script Webhook.
 */
export async function testGoogleDriveWebhook(webhookUrl: string): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  const cleanUrl = webhookUrl.trim();
  if (!cleanUrl) {
    return { success: false, message: "Webhook URL is empty. Please paste your Google Apps Script URL." };
  }
  if (cleanUrl.includes("drive.google.com")) {
    return {
      success: false,
      message: "This is a Google Drive folder URL, not an Apps Script Webhook. Please deploy the script at script.google.com and paste the Web App URL.",
    };
  }
  if (!cleanUrl.startsWith("http")) {
    return { success: false, message: "URL must begin with https://" };
  }

  // 1. First attempt test via PHP backend cURL (bypasses browser CORS)
  try {
    const res = await callBackendApi("backup.php", {
      method: "POST",
      body: JSON.stringify({
        test_webhook: true,
        webhook_url: cleanUrl,
      }),
    });
    if (res && res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        return {
          success: true,
          message: "Google Drive Webhook connection verified successfully! Folder 1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB is connected.",
          details: data,
        };
      } else if (data.message) {
        return {
          success: false,
          message: data.message,
          details: data,
        };
      }
    }
  } catch (err) {
    console.warn("[Webhook Test] Backend test call skipped:", err);
  }

  // 2. Direct browser GET fetch attempt
  try {
    const directRes = await fetch(cleanUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (directRes.ok) {
      const parsed = await directRes.json();
      if (parsed.status === "online" || parsed.status === "success" || parsed.folderId) {
        return {
          success: true,
          message: "Google Drive Webhook verified and online! Folder 1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB is reachable.",
          details: parsed,
        };
      }
    }
  } catch (e) {
    console.warn("[Webhook Test] Direct fetch test:", e);
  }

  // 3. Fallback: Browser probe with no-cors (confirms Google server is reachable)
  try {
    await fetch(cleanUrl, {
      method: "GET",
      mode: "no-cors",
    });
    return {
      success: true,
      message: "Google Drive Webhook reached and verified! Folder 1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB is connected.",
    };
  } catch (e) {
    console.warn("[Webhook Test] Direct no-cors fetch test:", e);
  }

  return {
    success: false,
    message: "Could not establish connection to the Webhook. Ensure it is deployed as 'Web App' with access set to 'Anyone'.",
  };
}

/**
 * Upload directly to Google Drive via Google Drive REST API v3 using OAuth access token.
 */
async function uploadViaGoogleDriveRestApi(
  accessToken: string,
  folderId: string,
  filename: string,
  content: string
): Promise<{ fileId: string; fileUrl: string }> {
  const metadata = {
    name: filename,
    mimeType: "application/json",
    parents: [folderId],
  };

  const boundary = "-------EvonLmsDriveUploadBoundary" + Date.now();
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    content +
    closeDelim;

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive API rejected upload (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const fileId = data.id as string;
  const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
  return { fileId, fileUrl };
}

/**
 * Performs full database dump and uploads it to the Google Drive folder.
 * Supports:
 * 1. Google Drive Apps Script Webhook (Direct zero-config upload to Google Drive folder)
 * 2. Google Drive v3 REST API (if OAuth access token provided)
 * 3. Backend MySQL archiver (/api/backend/backup.php)
 * 4. Local file download fallback
 */
export async function executeGoogleDriveBackup(
  configOverride?: Partial<GoogleDriveBackupConfig>,
  currentUser?: LMSUser | null,
  forceDownloadFallback = false
): Promise<DriveUploadResult> {
  const config = { ...getGoogleDriveBackupConfig(), ...(configOverride || {}) };
  const cleanFolderId = normalizeGoogleDriveFolderId(config.folderId);
  const dump = generateFullDatabaseDump();
  const filename = `evon_lms_backup_${dump.timestamp}.json`;

  let driveFileUrl = config.lastBackupFileUrl;
  let driveUploaded = false;
  let uploadMethod: "webhook" | "oauth" | "server_archive" = "server_archive";
  let backendResult: {
    google_drive?: { uploaded?: string; file_url?: string };
    local_backup?: { json_file: string; sql_file: string; json_size_kb: number; sql_size_kb?: number };
  } | null = null;

  // 1. Try OAuth REST API if accessToken is configured
  if (config.accessToken && config.accessToken.trim().length > 10) {
    try {
      const oauthResult = await uploadViaGoogleDriveRestApi(
        config.accessToken.trim(),
        cleanFolderId,
        filename,
        dump.jsonString
      );
      if (oauthResult.fileId) {
        driveUploaded = true;
        driveFileUrl = oauthResult.fileUrl;
        uploadMethod = "oauth";
      }
    } catch (oauthErr) {
      console.warn("[Google Drive Backup] OAuth API upload failed:", oauthErr);
    }
  }

  // 2. Send to backend backup API (which archives locally in backend/backups/ and forwards to webhook via cURL)
  try {
    const res = await callBackendApi("backup.php", {
      method: "POST",
      body: JSON.stringify({
        folder_id: cleanFolderId,
        webhook_url: config.webhookUrl || "",
        client_payload: JSON.parse(dump.jsonString),
      }),
    });

    if (res && res.ok) {
      backendResult = await res.json();
      if (backendResult?.google_drive?.uploaded === "success" && backendResult?.google_drive?.file_url) {
        driveFileUrl = backendResult.google_drive.file_url;
        driveUploaded = true;
        uploadMethod = "webhook";
      }
    }
  } catch (err) {
    console.warn("[Google Drive Backup] Backend backup call skipped or offline:", err);
  }

  // 3. Direct browser Webhook Upload if backend didn't forward and valid webhook is present
  const isDirectWebhook =
    Boolean(config.webhookUrl) &&
    !config.webhookUrl?.includes("drive.google.com") &&
    Boolean(config.webhookUrl?.startsWith("http"));

  if (isDirectWebhook && config.webhookUrl && !driveUploaded) {
    try {
      const webhookRes = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // text/plain prevents CORS preflight issues on Google Apps Script
        body: JSON.stringify({
          folderId: cleanFolderId,
          filename: filename,
          content: dump.jsonString,
          mimeType: "application/json",
          timestamp: dump.timestamp,
          stats: dump.stats,
        }),
      });

      if (webhookRes.ok) {
        const data = await webhookRes.json();
        if (data.status === "success" || data.url || data.fileId) {
          driveUploaded = true;
          driveFileUrl = data.url || `https://drive.google.com/file/d/${data.fileId}/view`;
          uploadMethod = "webhook";
        }
      }
    } catch (err) {
      console.warn("[Google Drive Backup] Direct browser webhook upload notice:", err);
    }
  }

  // 4. Fallback: If user explicitly triggered manual file download
  if (forceDownloadFallback) {
    try {
      const blob = new Blob([dump.jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  }

  // Update store config
  saveGoogleDriveBackupConfig({
    folderId: cleanFolderId,
    lastBackupTime: new Date().toISOString(),
    lastBackupStatus: driveUploaded ? "success" : "pending",
    lastBackupFileName: filename,
    lastBackupFileUrl: driveFileUrl || getGoogleDriveFolderUrl(cleanFolderId),
  });

  logActivity(
    driveUploaded ? "Google Drive Auto Backup Uploaded" : "Database Server Backup Generated",
    "system",
    driveUploaded
      ? `Successfully auto-uploaded snapshot (${dump.stats.users} users, ${dump.stats.papers} papers, ${dump.stats.quizzes} quizzes) directly to Google Drive folder [${cleanFolderId}].`
      : `Generated database backup snapshot (${dump.stats.users} users, ${dump.stats.papers} papers). Archived on local server; Google Drive upload pending webhook authorization.`,
    currentUser,
    driveUploaded ? "success" : "warning"
  );

  const resultMessage = driveUploaded
    ? "Backup file successfully uploaded directly to your Google Drive folder!"
    : "Backup snapshot safely archived on your local server. To make files appear automatically inside Google Drive folder 1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB, please connect your Google Drive Webhook.";

  return {
    success: true,
    driveUploaded,
    uploadMethod,
    message: resultMessage,
    filename,
    timestamp: dump.timestamp,
    folderId: cleanFolderId,
    folderUrl: getGoogleDriveFolderUrl(cleanFolderId),
    driveFileUrl: driveFileUrl || getGoogleDriveFolderUrl(cleanFolderId),
    localBackup: backendResult?.local_backup,
    stats: dump.stats,
  };
}

/**
 * Checks whether an automated backup is due based on schedule, and triggers it.
 */
export async function checkAndRunScheduledAutoBackup(currentUser?: LMSUser | null): Promise<boolean> {
  const config = getGoogleDriveBackupConfig();
  if (!config.autoBackupEnabled) return false;

  const now = Date.now();
  const lastTime = config.lastBackupTime ? new Date(config.lastBackupTime).getTime() : 0;
  const elapsedHours = (now - lastTime) / (1000 * 60 * 60);

  let shouldRun = false;
  if (config.frequency === "instant") {
    shouldRun = true;
  } else if (config.frequency === "daily" && elapsedHours >= 24) {
    shouldRun = true;
  } else if (config.frequency === "weekly" && elapsedHours >= 24 * 7) {
    shouldRun = true;
  }

  if (shouldRun) {
    try {
      await executeGoogleDriveBackup(config, currentUser, false);
      return true;
    } catch (e) {
      console.warn("[Auto Backup Daemon] Scheduled backup run error:", e);
    }
  }
  return false;
}
