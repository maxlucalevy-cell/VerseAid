import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — VerseAid",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="July 14, 2026">
      <p>
        VerseAid (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;the app&rdquo;)
        respects your privacy. This policy explains what information we
        collect and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong>: your email address and basic
          profile information (name, email) provided by Google when you sign
          in.
        </li>
        <li>
          <strong>Content you create</strong>: song titles, lyrics, section
          content, structure choices, and any audio reference files you
          upload.
        </li>
        <li>
          <strong>Usage data</strong>: lesson completion progress, quiz
          exercise results, and analysis results generated when you use app
          features.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>
          To provide core app functionality: saving your songs, tracking your
          lesson progress, storing and playing back your uploaded audio, and
          displaying your content back to you.
        </li>
        <li>
          To power AI-assisted features (rhyme suggestions, Line Sparks,
          Inspiration Starter, and song analysis, where available). When you
          use these features, relevant content you submit (such as a line of
          lyrics or a song&rsquo;s theme) is sent to Anthropic&rsquo;s API to
          generate suggestions. This content is used only to generate your
          requested output and is not used to train Anthropic&rsquo;s models
          beyond their standard API data handling practices.
        </li>
        <li>
          Rhyme lookups are powered by the Datamuse API, a separate
          third-party service that does not involve AI generation.
        </li>
        <li>
          We do not sell your personal information, song content, or audio
          files to third parties.
        </li>
      </ul>

      <h2>Data storage</h2>
      <p>
        Your account data, songs, and lesson progress are stored using
        Supabase. Uploaded audio files are stored privately and are only
        accessible to you. We retain your data for as long as your account is
        active, or until you request deletion.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          You can edit or delete your songs, and remove uploaded audio, at
          any time within the app.
        </li>
        <li>
          You can request full account deletion by contacting us at{" "}
          <a href="mailto:maxlevy@reubax.ca">maxlevy@reubax.ca</a>.
        </li>
      </ul>

      <h2>Children&rsquo;s privacy</h2>
      <p>
        VerseAid is not directed at children under 13, and we do not
        knowingly collect information from children under 13.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Continued use of the app
        after changes means you accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy:{" "}
        <a href="mailto:maxlevy@reubax.ca">maxlevy@reubax.ca</a>
      </p>
    </LegalPageLayout>
  );
}
