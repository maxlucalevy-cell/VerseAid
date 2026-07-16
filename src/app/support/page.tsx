import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Support | VerseAid",
};

export default function SupportPage() {
  return (
    <LegalPageLayout title="Support">
      <p>
        Need help with VerseAid? Reach us at{" "}
        <a href="mailto:maxlevy@reubax.ca">maxlevy@reubax.ca</a>, and
        we&rsquo;ll get back to you as soon as we can.
      </p>

      <h2>Common questions</h2>
      <ul>
        <li>
          <strong>How do I recover a lost song?</strong>{" "}
          Check your Song Library. Your work autosaves as you type. If a
          song is missing, contact us with your account email.
        </li>
        <li>
          <strong>Can I export my lyrics?</strong>{" "}
          Yes. Open any song&rsquo;s Read View and use Copy, or export as
          .txt or PDF.
        </li>
        <li>
          <strong>How do AI suggestions work?</strong>{" "}
          Rhyme lookups, Line Sparks, and Inspiration Starter are optional
          tools you can use or ignore. VerseAid never writes a full song
          for you.
        </li>
        <li>
          <strong>Is my uploaded audio private?</strong>{" "}
          Yes. Reference audio you upload is private to your account and
          not shared or made public.
        </li>
      </ul>
    </LegalPageLayout>
  );
}
