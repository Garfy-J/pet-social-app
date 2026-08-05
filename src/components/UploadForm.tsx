"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createPost, type PostFormState } from "@/app/actions";

const initialPostFormState: PostFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full sm:w-auto"
    >
      {pending ? "Posting…" : "Post"}
    </button>
  );
}

export function UploadForm({ onPosted }: { onPosted?: () => void }) {
  const [state, formAction] = useFormState(createPost, initialPostFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      onPosted?.();
    }
  }, [state, onPosted]);

  return (
    <div>
      {state.status === "error" && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary-dark"
        >
          {state.message}
        </p>
      )}
      <form ref={formRef} action={formAction} className="space-y-3">
        <input
          type="file"
          name="media"
          accept="image/*,video/*"
          required
          className="block w-full text-sm text-foreground/70 file:mr-3 file:cursor-pointer file:rounded-2xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-primary-dark"
        />
        <textarea
          name="caption"
          placeholder="Write a caption..."
          rows={2}
          className="input-field resize-none"
        />
        <SubmitButton />
      </form>
    </div>
  );
}
