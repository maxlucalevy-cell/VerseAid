import { createSong } from "@/app/songs/actions";
import { STRUCTURE_TEMPLATE_NAMES } from "@/lib/structureTemplates";
import Link from "next/link";

export default function NewSongPage() {
  return (
    <main className="fade-in-section mx-auto max-w-lg p-6 sm:p-8">
      <Link
        href="/dashboard"
        className="text-sm text-text-muted underline decoration-border-strong underline-offset-2 hover:text-text"
      >
        ← Back to Library
      </Link>
      <h1 className="font-display mt-4 mb-6 text-2xl font-semibold text-text">
        New Song
      </h1>
      <form action={createSong} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text">Title</span>
          <input
            name="title"
            defaultValue="Untitled Song"
            className="rounded-lg border border-border-strong bg-bg-inset px-3 py-2 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-text">
            Starting structure
          </legend>
          {STRUCTURE_TEMPLATE_NAMES.map((name, i) => (
            <label
              key={name}
              className="flex items-center gap-2 text-sm text-text-muted"
            >
              <input
                type="radio"
                name="template"
                value={name}
                defaultChecked={i === 0}
                className="accent-accent"
              />
              {name}
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg shadow-[0_1px_0_rgba(245,240,232,0.35)_inset,0_2px_6px_rgba(0,0,0,0.35)] transition hover:bg-accent-hover active:translate-y-px"
        >
          Create Song
        </button>
      </form>
    </main>
  );
}
