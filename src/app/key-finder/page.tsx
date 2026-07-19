import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import KeyFinderTool from "./KeyFinderTool";

export const metadata: Metadata = {
  title: "Key Finder | VerseAid",
};

export default async function KeyFinderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppHeader />
      <main className="fade-in-section mx-auto max-w-3xl p-6 pb-28 sm:p-8 sm:pb-28">
        <h1 className="font-display mb-2 text-2xl font-semibold text-text">
          Key Finder
        </h1>
        <p className="mb-8 text-sm text-text-muted">
          Drop in any audio file to find its musical key. Everything runs on
          your device, and nothing is uploaded or saved.
        </p>
        <KeyFinderTool />
      </main>
      <BottomNav />
    </>
  );
}
