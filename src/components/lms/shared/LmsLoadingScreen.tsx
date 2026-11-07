import React from "react";

interface LmsLoadingScreenProps {
  message?: string;
}

export default function LmsLoadingScreen({
  message = "Loading Portal Session...",
}: LmsLoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#edf2f3] text-[#102c45]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-9 border-3 border-[#007fb8] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#60768a]">{message}</p>
      </div>
    </div>
  );
}

