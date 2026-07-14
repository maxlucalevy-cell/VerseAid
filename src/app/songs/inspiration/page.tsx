import Link from "next/link";
import InspirationStarterForm from "./InspirationStarterForm";

export default function InspirationStarterPage() {
  return (
    <main className="mx-auto max-w-lg p-8">
      <Link href="/dashboard" className="text-sm text-neutral-500 underline">
        ← Back to Library
      </Link>
      <div className="mt-4">
        <InspirationStarterForm />
      </div>
    </main>
  );
}
