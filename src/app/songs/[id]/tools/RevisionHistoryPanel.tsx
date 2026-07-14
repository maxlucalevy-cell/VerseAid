"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SectionRevision } from "@/lib/types";

export default function RevisionHistoryPanel({
  sectionId,
  onRestore,
}: {
  sectionId: string;
  onRestore: (content: string) => void;
}) {
  const [revisions, setRevisions] = useState<SectionRevision[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("section_revisions")
      .select("*")
      .eq("section_id", sectionId)
      .order("saved_at", { ascending: false })
      .then(({ data }) => {
        setRevisions(data ?? []);
        setLoading(false);
      });
  }, [sectionId]);

  if (loading) {
    return (
      <div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">
        Loading revision history...
      </div>
    );
  }

  if (!revisions || revisions.length === 0) {
    return (
      <div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">
        No saved revisions yet. A snapshot is kept each time you step away
        from editing this section.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-neutral-50 p-4 text-sm">
      <div className="flex flex-col gap-2">
        {revisions.map((rev) => (
          <div
            key={rev.id}
            className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-neutral-400">
                {new Date(rev.saved_at).toLocaleString()}
              </p>
              <p className="truncate text-neutral-600">
                {rev.content_snapshot.replace(/\n/g, " / ") || "(empty)"}
              </p>
            </div>
            <button
              onClick={() => onRestore(rev.content_snapshot)}
              className="shrink-0 text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
