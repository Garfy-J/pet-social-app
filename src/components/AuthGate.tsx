"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { LoginModal } from "./LoginModal";

type AuthGateContextValue = {
  requireAuth: () => void;
};

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AuthGateContext.Provider value={{ requireAuth: () => setOpen(true) }}>
      {children}
      {open && <LoginModal onClose={() => setOpen(false)} />}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    throw new Error("useAuthGate must be used within an AuthGateProvider");
  }
  return ctx;
}
