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
  inspiration_angle: string | null;
  inspiration_pov: string | null;
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

export type Lesson = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  related_genre_tags: string[];
  order_index: number;
  created_at: string;
};

export type ExerciseType =
  | "multiple_choice"
  | "fill_in_blank"
  | "compare_judge"
  | "reorder"
  | "spot_pattern";

export type ExerciseOption = { id: string; text: string };

export type LessonExercise = {
  id: string;
  lesson_id: string;
  order_index: number;
  exercise_type: ExerciseType;
  prompt: string;
  options: ExerciseOption[] | null;
  correct_or_stronger: unknown;
  feedback: Record<string, string>;
  is_mechanical: boolean;
  difficulty: number;
  created_at: string;
};

export type LessonExerciseProgress = {
  id: string;
  user_id: string;
  exercise_id: string;
  selected_option: unknown;
  completed_at: string;
};

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  craft_suggestions_enabled: boolean;
  created_at: string;
};

export type RepeatedWordFlag = {
  word: string;
  count: number; // occurrences outside chorus/hook sections
  sections: string[];
};

export type RepeatedLineFlag = {
  line: string;
  count: number;
  sections: string[];
};

export type ClicheFlag = {
  phrase: string;
  matched_text: string;
  count: number;
  sections: string[];
};

export type RepetitionClicheAnalysis = {
  repeated_words: RepeatedWordFlag[];
  repeated_lines: RepeatedLineFlag[];
  cliches: ClicheFlag[];
};

export type CraftAnalysis = {
  strengths: string[];
  observations: string[];
};

export type AnalysisResult = {
  id: string;
  song_id: string;
  craft_analysis: CraftAnalysis | null;
  commercial_fit_analysis: unknown;
  repetition_cliche_analysis: RepetitionClicheAnalysis | null;
  analyzed_at: string;
};
