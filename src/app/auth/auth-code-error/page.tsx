import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="fade-in-section flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-nib.png" alt="" width={40} height={40} />
      <h1 className="font-display text-2xl font-semibold text-text">
        Sign-in failed
      </h1>
      <p className="text-sm text-text-muted">
        Something went wrong completing the sign-in. Please try again.
      </p>
      <Link
        href="/login"
        className="text-sm text-accent underline underline-offset-2 hover:text-accent-hover"
      >
        Back to sign in
      </Link>
    </main>
  );
}
