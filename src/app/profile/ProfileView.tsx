"use client";

import { useState, useTransition } from "react";
import { signOut } from "@/app/auth/actions";
import { updateCraftSuggestions } from "./actions";
import type { Profile } from "@/lib/types";

export default function ProfileView({ profile }: { profile: Profile }) {
  const [enabled, setEnabled] = useState(profile.craft_suggestions_enabled);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    startTransition(() => {
      updateCraftSuggestions(next);
    });
  };

  const displayName = profile.display_name || profile.email.split("@")[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="paper-grain rounded-2xl border border-border bg-bg-raised p-5 shadow-[0_1px_0_rgba(245,240,232,0.04)_inset,0_4px_16px_rgba(0,0,0,0.25)]">
        <p className="font-display text-lg font-medium text-text">
          {displayName}
        </p>
        <p className="mt-1 text-sm text-text-muted">{profile.email}</p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-bg-raised p-5">
        <div>
          <p className="text-sm font-medium text-text">Craft suggestions</p>
          <p className="mt-1 text-sm text-text-muted">
            Get gentle nudges on rhyme, meter, and structure while you write.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle craft suggestions"
          onClick={toggle}
          disabled={isPending}
          className={`relative h-7 w-12 shrink-0 rounded-full shadow-inner transition disabled:opacity-60 ${
            enabled ? "bg-accent" : "border border-border-strong bg-bg-inset"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-text shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all ${
              enabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-text-muted underline decoration-border-strong underline-offset-2 transition hover:text-text"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
