"use client";

import { AuthForm } from "./AuthForm";
import { PawIcon } from "./PawIcon";

export function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="card relative w-full max-w-sm space-y-6 p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-foreground/40 hover:text-foreground"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PawIcon className="h-8 w-8" />
          </div>
          <h2 className="mt-3 font-heading text-2xl font-bold text-foreground">
            Join Pets Social
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            Sign in or create an account to continue
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
