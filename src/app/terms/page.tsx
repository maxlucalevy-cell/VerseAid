import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service — VerseAid",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="July 14, 2026">
      <p>By using VerseAid, you agree to these terms.</p>

      <h2>Your account</h2>
      <p>
        You&rsquo;re responsible for maintaining the security of your account
        credentials. You must be at least 13 years old to use VerseAid.
      </p>

      <h2>Your content</h2>
      <p>
        You retain full ownership of all lyrics, songs, and audio files you
        upload to VerseAid. We claim no ownership over your creative work.
        You&rsquo;re solely responsible for ensuring your content, including
        any uploaded audio, doesn&rsquo;t infringe on others&rsquo; rights —
        only upload audio you have the rights to use for personal
        songwriting reference.
      </p>

      <h2>AI-assisted features</h2>
      <p>
        VerseAid provides AI-generated suggestions (rhyme lookups, Line
        Sparks, Inspiration Starter, and analysis) as creative aids only.
        These suggestions are not guaranteed to be accurate, original, or
        free of resemblance to existing works. You are responsible for
        reviewing and independently verifying any AI-generated content you
        choose to incorporate into your own work before using it
        commercially. VerseAid is designed to support your own songwriting,
        not to generate finished songs on your behalf.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to use VerseAid to generate or store unlawful,
        infringing, or abusive content, or to attempt to disrupt or
        reverse-engineer the service.
      </p>

      <h2>Service availability</h2>
      <p>
        VerseAid is provided &ldquo;as is.&rdquo; We do not guarantee
        uninterrupted availability and are not liable for lost content due to
        service outages — we recommend exporting important songs
        periodically using the built-in export feature.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these terms. You
        may delete your account at any time.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms periodically. Continued use after changes
        constitutes acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href="mailto:maxlevy@reubax.ca">maxlevy@reubax.ca</a>
      </p>
    </LegalPageLayout>
  );
}
