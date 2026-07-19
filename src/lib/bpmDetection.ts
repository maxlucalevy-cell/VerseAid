// Deterministic tempo detection via web-audio-beat-detector, which runs
// its analysis in a Web Worker so the main thread stays responsive. Same
// client-side, best-effort spirit as keyDetection.ts: any failure returns
// null rather than throwing, and the caller decides what to show.

export type BpmDetectionResult = {
  bpm: number;
};

// Cap analysis at the first ~90 seconds so long files stay fast; tempo
// rarely needs more evidence than that (same spirit as MAX_FRAMES in
// keyDetection.ts).
const MAX_ANALYSIS_SECONDS = 90;

// The library's default 90-180 BPM window folds slower songs into double
// time; widening it keeps ballads and ambient tempos representable. Beat
// detectors still make octave errors (2x or 0.5x the true tempo) — that's
// left uncorrected here, and the UI offers manual half/double adjustment.
const TEMPO_SETTINGS = { minTempo: 60, maxTempo: 200 };

export async function detectBpm(
  buffer: AudioBuffer
): Promise<BpmDetectionResult | null> {
  try {
    // Dynamic import keeps the detector (and its worker setup) out of every
    // other page's bundle; it only loads when a file is actually analyzed.
    const { guess } = await import("web-audio-beat-detector");

    const duration = Math.min(buffer.duration, MAX_ANALYSIS_SECONDS);
    const { bpm } = await guess(buffer, 0, duration, TEMPO_SETTINGS);

    if (!Number.isFinite(bpm) || bpm <= 0) return null;
    return { bpm };
  } catch {
    return null;
  }
}
