import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ProfileView from "./ProfileView";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let profile: Profile;
  if (existing) {
    profile = existing;
  } else {
    const { data: created, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email ?? "",
        display_name: (user.user_metadata?.full_name as string) ?? null,
        craft_suggestions_enabled: true,
      })
      .select("*")
      .single();
    if (error || !created) {
      throw new Error(error?.message ?? "Failed to load profile");
    }
    profile = created;
  }

  return (
    <>
      <AppHeader />
      <main className="fade-in-section mx-auto max-w-3xl p-6 pb-28 sm:p-8 sm:pb-28">
        <h1 className="font-display mb-8 text-2xl font-semibold text-text">
          Profile
        </h1>
        <ProfileView profile={profile} />
      </main>
      <BottomNav />
    </>
  );
}
