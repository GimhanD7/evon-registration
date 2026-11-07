"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, X, RefreshCw } from "lucide-react";
import {
  verifySecurityPinAsync,
  verifySecurityPin,
  syncSecurityPinFromBackend,
} from "@/lib/lmsStore";

interface DeletePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  actionButtonText?: string;
}

export default function DeletePinModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = "Enter your Administrator Security PIN to authorize this permanent action.",
  actionButtonText = "Authorize & Delete",
}: DeletePinModalProps) {
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync latest PIN from MySQL database whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setErrorMsg("");
      syncSecurityPinFromBackend().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    if (!cleanPin) {
      setErrorMsg("Please enter the Security PIN.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Verify against MySQL database
      const isValid = await verifySecurityPinAsync(cleanPin);
      if (isValid) {
        setErrorMsg("");
        setPin("");
        onConfirm();
        onClose();
      } else {
        setErrorMsg("Incorrect Security PIN. Authorization Denied.");
        setPin("");
      }
    } catch {
      // Fallback verification
      if (verifySecurityPin(cleanPin)) {
        setErrorMsg("");
        setPin("");
        onConfirm();
        onClose();
      } else {
        setErrorMsg("Incorrect Security PIN. Authorization Denied.");
        setPin("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-sm rounded-3xl border border-[#cddce5] bg-white p-6 shadow-2xl space-y-4 animate-[scaleUp_0.2s_ease-out]">
        <div className="flex items-center justify-between border-b border-[#cddce5]/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200">
              <ShieldAlert size={18} />
            </span>
            <h4 className="text-sm font-black text-[#102c45]">Security Authorization Required</h4>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-[#94a3b8] hover:bg-[#edf2f3] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-black text-[#102c45]">{title}</p>
          <p className="text-[11px] text-[#60768a] leading-relaxed">{description}</p>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-center text-xs font-black text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-[#60768a] mb-1">
              Database Administrator Security PIN
            </label>
            <div className="relative">
              <KeyRound
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                value={pin}
                onChange={(e) => {
                  setErrorMsg("");
                  setPin(e.target.value);
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full rounded-2xl border border-[#cddce5] bg-[#edf2f3]/50 py-2.5 pl-10 pr-4 text-center font-mono text-base font-black tracking-widest text-[#102c45] focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-[#cddce5] px-4 py-2 text-xs font-bold text-[#60768a] hover:bg-[#edf2f3] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !pin.trim()}
              className="rounded-full bg-red-600 px-5 py-2 text-xs font-black text-white shadow-md hover:bg-red-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {actionButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
