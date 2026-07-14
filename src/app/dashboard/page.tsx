import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Song Library</h1>
      <p className="text-neutral-500">Signed in as {user.email}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full border border-neutral-300 px-6 py-3 font-medium hover:bg-neutral-50"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
