export type SongStatus = "draft" | "finished";

export type Song = {
  id: string;
  user_id: string;
  title: string;
  genre_tags: string[];
  mood_tags: string[];
  structure_template: string | null;
  status: SongStatus;
  bpm: number | null;
  audio_url: string | null;
  audio_duration: number | null;
  last_edited_at: string;
  created_at: string;
};

export type Section = {
  id: string;
  song_id: string;
  order_index: number;
  label: string;
  content: string;
  target_meter_ref: string | null;
  start_time: number | null;
  match_rhyme_on_continuations: boolean;
  created_at: string;
};

export type SectionRevision = {
  id: string;
  section_id: string;
  content_snapshot: string;
  saved_at: string;
};
