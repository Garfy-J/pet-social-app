"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuthGate } from "./AuthGate";

export function ProfileLink({
  isLoggedIn,
  username,
  className,
  children,
}: {
  isLoggedIn: boolean;
  username?: string;
  className?: string;
  children: ReactNode;
}) {
  const { requireAuth } = useAuthGate();

  if (!isLoggedIn || !username) {
    return (
      <button type="button" onClick={requireAuth} className={className}>
        {children}
      </button>
    );
  }

  return (
    <Link href={`/profile/${username}`} className={className}>
      {children}
    </Link>
  );
}
