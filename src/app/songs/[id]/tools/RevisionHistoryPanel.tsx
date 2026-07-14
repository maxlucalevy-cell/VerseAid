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
      <div className="rounded-xl border border-border bg-bg-inset p-4 text-sm text-text-muted">
        Loading revision history...
      </div>
    );
  }

  if (!revisions || revisions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-inset p-4 text-sm text-text-muted">
        No saved revisions yet. A snapshot is kept each time you step away
        from editing this section.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-inset p-4 text-sm">
      <div className="flex flex-col gap-2">
        {revisions.map((rev) => (
          <div
            key={rev.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-faint">
                {new Date(rev.saved_at).toLocaleString()}
              </p>
              <p className="truncate text-text-muted">
                {rev.content_snapshot.replace(/\n/g, " / ") || "(empty)"}
              </p>
            </div>
            <button
              onClick={() => onRestore(rev.content_snapshot)}
              className="shrink-0 text-xs font-medium text-accent transition hover:text-accent-hover"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
