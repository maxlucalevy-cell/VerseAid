import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Sign-in failed</h1>
      <p className="text-neutral-500">
        Something went wrong completing the sign-in. Please try again.
      </p>
      <Link href="/login" className="underline">
        Back to sign in
      </Link>
    </main>
  );
}
