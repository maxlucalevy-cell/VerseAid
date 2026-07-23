"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Original sample lines, shown one at a time like a note scribbled in a
// margin, picked at random on each page load. The pick differs between
// server render and client hydration, so the element suppresses the
// hydration warning and lets the client's pick win.
const MARGIN_NOTES = [
  "The kettle hums in the key of leaving",
  "Your name still rents a room in every chorus",
  "I parked the car where the summer used to be",
  "Half a moon over the laundromat glow",
  "Static on the radio sounds like goodbye",
];

function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="inline-flex items-center gap-3 rounded-full bg-[#F5F0E8] px-6 py-3 font-medium text-[#1A1612] shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_4px_12px_rgba(0,0,0,0.35)] transition hover:brightness-95 active:translate-y-px active:shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
    >
      Continue with Google
    </button>
  );
}

export default function LoginPage() {
  const [marginNote] = useState(
    () => MARGIN_NOTES[Math.floor(Math.random() * MARGIN_NOTES.length)]
  );

  return (
    <main className="paper-grain relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden p-8">
      <div aria-hidden className="staff-lines pointer-events-none absolute inset-0" />
      <div aria-hidden className="stage-vignette pointer-events-none absolute inset-0" />

      <div className="fade-in-section relative z-10 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border-strong bg-bg-raised shadow-[0_1px_0_rgba(245,240,232,0.06)_inset,0_4px_12px_rgba(0,0,0,0.35)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nib.png" alt="" width={40} height={40} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">
              Songwriting coach
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold text-text">
              Welcome to VerseAid
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-sm text-text-muted">
              A songwriting coach, not a ghostwriter. Sign in to continue
              working on your songs.
            </p>
          </div>
          <p
            suppressHydrationWarning
            className="font-display min-h-6 max-w-xs border-l-2 border-border-strong pl-3 text-left text-sm italic text-text-faint"
          >
            {marginNote}
          </p>
        </div>
        <Suspense fallback={null}>
          <GoogleSignInButton />
        </Suspense>
        <nav className="flex gap-4 text-xs text-text-faint">
          <Link href="/privacy" className="transition hover:text-text-muted">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-text-muted">
            Terms
          </Link>
          <Link href="/support" className="transition hover:text-text-muted">
            Support
          </Link>
        </nav>
      </div>
    </main>
  );
}
