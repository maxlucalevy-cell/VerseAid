import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Song Library</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/lessons" className="text-neutral-500 underline">
            Lessons
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-neutral-500 underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <SongLibrary initialSongs={songs ?? []} />
    </main>
  );
}
