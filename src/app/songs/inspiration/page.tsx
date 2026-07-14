import Link from "next/link";
import InspirationStarterForm from "./InspirationStarterForm";

export default function InspirationStarterPage() {
  return (
    <main className="fade-in-section mx-auto max-w-lg p-6 sm:p-8">
      <Link
        href="/dashboard"
        className="text-sm text-text-muted underline decoration-border-strong underline-offset-2 hover:text-text"
      >
        ← Back to Library
      </Link>
      <div className="mt-4">
        <InspirationStarterForm />
      </div>
    </main>
  );
}
