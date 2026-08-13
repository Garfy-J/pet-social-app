"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function ConfirmSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs font-bold text-primary hover:text-primary-dark"
    >
      {pending ? "Deleting…" : "Confirm?"}
    </button>
  );
}

export function DeleteButton() {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-bold text-foreground/40 hover:text-primary"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <ConfirmSubmit />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs font-medium text-foreground/40 hover:text-foreground"
      >
        Cancel
      </button>
    </span>
  );
}
