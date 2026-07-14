import { createSong } from "@/app/songs/actions";
import { STRUCTURE_TEMPLATE_NAMES } from "@/lib/structureTemplates";
import Link from "next/link";

export default function NewSongPage() {
  return (
    <main className="mx-auto max-w-lg p-8">
      <Link href="/dashboard" className="text-sm text-neutral-500 underline">
        ← Back to Library
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold">New Song</h1>
      <form action={createSong} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Title</span>
          <input
            name="title"
            defaultValue="Untitled Song"
            className="rounded-lg border border-neutral-300 px-3 py-2"
          />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">
            Starting structure
          </legend>
          {STRUCTURE_TEMPLATE_NAMES.map((name, i) => (
            <label key={name} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="template"
                value={name}
                defaultChecked={i === 0}
              />
              {name}
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Create Song
        </button>
      </form>
    </main>
  );
}
