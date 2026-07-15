"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
  return (
    <main className="fade-in-section flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-nib.png" alt="" width={56} height={56} />
        <div>
          <h1 className="font-display text-3xl font-semibold text-text">
            Welcome to VerseAid
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-text-muted">
            A songwriting coach, not a ghostwriter. Sign in to continue working on
            your songs.
          </p>
        </div>
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
    </main>
  );
}
