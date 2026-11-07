import React from "react";
import { Database, CheckCircle2, Lock } from "lucide-react";
import { LMSUser } from "@/data/lmsData";
import { getDirectBackendUrl } from "@/lib/apiConfig";

interface AdminSettingsTabProps {
  currentUser: LMSUser;
  backendStatus: {
    online: boolean;
    database: boolean;
    message: string;
  } | null;
  isCheckingBackend: boolean;
  onCheckBackend: () => void;
}

export default function AdminSettingsTab({
  currentUser,
  backendStatus,
  isCheckingBackend,
  onCheckBackend,
}: AdminSettingsTabProps) {
  return (
    <div className="rounded-3xl border border-[#cddce5] bg-white p-6 shadow-xs space-y-6">
      <div>
        <h3 className="text-lg font-black text-[#102c45]">
          LMS Backend &amp; Database Diagnostics
        </h3>
        <p className="text-xs text-[#60768a] mt-0.5">
          Live status and synchronization between Next.js, PHP REST API, and MySQL (evon_lms).
        </p>
      </div>

      {/* Live Diagnostic Card */}
      <div className="rounded-2xl border border-[#cddce5] bg-[#edf2f3]/60 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cddce5]/60 pb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-[#007fb8]" />
            <span className="text-sm font-black text-[#102c45]">
              XAMPP Connection Status
            </span>
          </div>

          <button
            type="button"
            onClick={onCheckBackend}
            disabled={isCheckingBackend}
            className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#102c45_0%,#007fb8_100%)] px-3.5 py-1.5 text-xs font-black text-white shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isCheckingBackend ? (
              <>
                <div className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Pinging Backend...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="text-[#0ac9e8]" />
                <span>Test Connection &amp; Sync</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-[#cddce5]/80 shadow-2xs">
            <span className="font-bold text-[#60768a]">PHP Runtime API:</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                backendStatus?.online
                  ? "bg-[#e8f7f2] text-[#159366]"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  backendStatus?.online ? "bg-[#159366] animate-pulse" : "bg-amber-500"
                }`}
              />
              {backendStatus?.online ? "ONLINE" : "STANDBY"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-[#cddce5]/80 shadow-2xs">
            <span className="font-bold text-[#60768a]">MySQL Database (evon_lms):</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                backendStatus?.database
                  ? "bg-[#e8f7f2] text-[#159366]"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  backendStatus?.database ? "bg-[#159366]" : "bg-red-500"
                }`}
              />
              {backendStatus?.database ? "CONNECTED" : "OFFLINE"}
            </span>
          </div>
        </div>

        {backendStatus?.message && (
          <div
            className={`rounded-xl p-3 text-xs font-bold ${
              backendStatus.database
                ? "bg-[#e8f7f2] text-[#159366] border border-[#38d995]/40"
                : "bg-amber-50 text-amber-900 border border-amber-300/60"
            }`}
          >
            {backendStatus.message}
          </div>
        )}

        {/* Step-by-step XAMPP instructions */}
        <div className="rounded-xl bg-white p-4 border border-[#cddce5]/80 text-xs text-[#60768a] space-y-2">
          <span className="block font-black text-[#102c45]">
            How to activate MySQL Database in XAMPP:
          </span>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              Open <strong>XAMPP Control Panel</strong> (
              <code className="font-mono text-[#007fb8]">C:\xampp\xampp-control.exe</code>).
            </li>
            <li>
              Click the <strong className="text-[#159366]">Start</strong> button next to{" "}
              <strong>MySQL</strong> (Port 3306).
            </li>
            <li>
              Click the <strong className="text-[#159366]">Start</strong> button next to{" "}
              <strong>Apache</strong> (Port 80) if not already active.
            </li>
            <li>
              Click <strong>&ldquo;Test Connection &amp; Sync&rdquo;</strong> above to verify
              your live connection.
            </li>
          </ol>
        </div>
      </div>

      <div className="rounded-2xl bg-[#edf2f3]/70 p-5 border border-[#cddce5] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-[#102c45]">
            <Database size={16} className="text-[#159366]" />
            <span>One-Click Schema &amp; Initial Database Seeder</span>
          </div>
          <a
            href={getDirectBackendUrl("api/seed.php")}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[#007fb8]/40 bg-white px-3 py-1 text-xs font-black text-[#007fb8] hover:bg-[#e0f2fe] transition-all cursor-pointer shadow-2xs"
          >
            Run seed.php &rarr;
          </a>
        </div>
        <p className="text-[#60768a]">
          Creates all 7 relational tables (
          <code className="font-mono text-[11px] text-[#102c45]">users</code>,{" "}
          <code className="font-mono text-[11px] text-[#102c45]">papers</code>,{" "}
          <code className="font-mono text-[11px] text-[#102c45]">evaluations</code>, etc.)
          and loads seed accounts.
        </p>
      </div>

      <div className="rounded-2xl bg-[#edf2f3]/70 p-5 border border-[#cddce5] space-y-2 text-xs">
        <div className="flex items-center gap-2 font-black text-[#102c45]">
          <Lock size={16} className="text-[#007fb8]" />
          <span>Administrator Identity</span>
        </div>
        <p className="text-[#60768a] font-mono">
          Phone: {currentUser.phone} &bull; Name: {currentUser.fullName} &bull; Role:{" "}
          {currentUser.role}
        </p>
      </div>
    </div>
  );
}

