"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateProfile, type ProfileFormState } from "@/app/actions";

const initialState: ProfileFormState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function EditProfileForm({
  username,
  bio,
}: {
  username: string;
  bio: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useFormState(updateProfile, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      setEditing(false);
      if (state.username !== username) {
        router.replace(`/profile/${state.username}`);
      }
    }
  }, [state, username, router]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="btn-outline"
      >
        Edit profile
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="w-full max-w-xs space-y-3 text-left"
    >
      <input type="hidden" name="currentUsername" value={username} />

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary-dark"
        >
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-bold text-foreground">
          Username
        </label>
        <input
          id="username"
          type="text"
          name="username"
          defaultValue={username}
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          title="3-20 characters: letters, numbers, and underscores only"
          className="input-field mt-1"
        />
      </div>

      <div>
        <label htmlFor="avatar" className="block text-sm font-bold text-foreground">
          Avatar
        </label>
        <input
          id="avatar"
          type="file"
          name="avatar"
          accept="image/*"
          className="mt-1 block w-full text-sm text-foreground/70 file:mr-3 file:cursor-pointer file:rounded-2xl file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-primary-dark"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-bold text-foreground">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={bio ?? ""}
          rows={3}
          placeholder="Tell us about your pet..."
          className="input-field mt-1 resize-none"
        />
      </div>

      <div className="flex justify-center gap-3">
        <SaveButton />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
