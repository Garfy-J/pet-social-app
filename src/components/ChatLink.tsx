"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuthGate } from "./AuthGate";

export function ChatLink({
  isLoggedIn,
  className,
  children,
}: {
  isLoggedIn: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { requireAuth } = useAuthGate();

  if (!isLoggedIn) {
    return (
      <button type="button" aria-label="Messages" onClick={requireAuth} className={className}>
        {children}
      </button>
    );
  }

  return (
    <Link href="/chat" aria-label="Messages" className={className}>
      {children}
    </Link>
  );
}
