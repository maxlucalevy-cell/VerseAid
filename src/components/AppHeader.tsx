import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export default function AppHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-nib.png" alt="" width={28} height={28} />
          <span className="font-display text-lg font-semibold tracking-tight text-text">
            VerseAid
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-text-muted">
          <Link href="/lessons" className="transition hover:text-text">
            Lessons
          </Link>
          <form action={signOut}>
            <button type="submit" className="transition hover:text-text">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
