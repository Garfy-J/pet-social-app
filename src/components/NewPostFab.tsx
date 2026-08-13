"use client";

import { useState } from "react";
import { useAuthGate } from "./AuthGate";
import { UploadForm } from "./UploadForm";

export function NewPostFab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const { requireAuth } = useAuthGate();

  return (
    <>
      <button
        type="button"
        onClick={() => (isLoggedIn ? setOpen(true) : requireAuth())}
        aria-label="Create new post"
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition-transform hover:scale-105 hover:bg-primary-dark active:scale-95"
      >
        +
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-sm p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">
                New post
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-foreground/40 hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <UploadForm onPosted={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
