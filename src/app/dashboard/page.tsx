import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import SongLibrary from "./SongLibrary";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .order("last_edited_at", { ascending: false });

  return (
    <>
      <AppHeader />
      <main className="fade-in-section mx-auto max-w-3xl p-6 pb-28 sm:p-8 sm:pb-28">
        <h1 className="font-display mb-8 text-2xl font-semibold text-text">
          Song Library
        </h1>
        <SongLibrary initialSongs={songs ?? []} />
      </main>
      <BottomNav />
    </>
  );
}
