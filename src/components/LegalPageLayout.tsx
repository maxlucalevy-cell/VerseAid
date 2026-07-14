import Link from "next/link";

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="fade-in-section mx-auto max-w-2xl p-6 sm:p-8">
      <Link
        href="/"
        className="text-sm text-text-muted underline decoration-border-strong underline-offset-2 hover:text-text"
      >
        ← Back to VerseAid
      </Link>
      <h1 className="font-display mt-4 text-2xl font-semibold text-text">
        {title}
      </h1>
      {lastUpdated && (
        <p className="mt-1 text-sm text-text-faint">
          Last updated: {lastUpdated}
        </p>
      )}
      <div className="legal-content mt-6">{children}</div>
    </main>
  );
}
