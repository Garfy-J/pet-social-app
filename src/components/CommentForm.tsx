"use client";

import type { FormEvent } from "react";
import { useAuthGate } from "./AuthGate";

export function CommentForm({
  isLoggedIn,
  action,
}: {
  isLoggedIn: boolean;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const { requireAuth } = useAuthGate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!isLoggedIn) {
      event.preventDefault();
      requireAuth();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        type="text"
        name="body"
        placeholder="Add a comment..."
        required
        className="input-field flex-1 py-1.5"
      />
      <button type="submit" className="btn-primary px-4 py-1.5 text-xs">
        Post
      </button>
    </form>
  );
}
