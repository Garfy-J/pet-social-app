"use client";

import { useState } from "react";
import { useAuthGate } from "./AuthGate";

export function ReportButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [reported, setReported] = useState(false);
  const { requireAuth } = useAuthGate();

  if (reported) {
    return (
      <span className="text-xs font-bold text-foreground/40">Reported</span>
    );
  }

  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!isLoggedIn) {
          event.preventDefault();
          requireAuth();
          return;
        }
        setReported(true);
      }}
      className="text-xs font-bold text-foreground/40 hover:text-primary"
    >
      Report
    </button>
  );
}
