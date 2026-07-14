"use client";

import { createClient } from "@/lib/supabase/client";
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
      className="rounded-full border border-neutral-300 px-6 py-3 font-medium hover:bg-neutral-50"
    >
      Continue with Google
    </button>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Sign in to VerseAid</h1>
      <Suspense fallback={null}>
        <GoogleSignInButton />
      </Suspense>
    </main>
  );
}
