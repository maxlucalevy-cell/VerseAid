// Deterministic musical key detection: Meyda extracts a per-frame chroma
// vector (energy per pitch class), and the averaged chroma is correlated
// against the Krumhansl-Schmuckler major/minor key profiles. Best
// correlation wins; confidence is the margin over the runner-up. Runs
// entirely client-side, same spirit as the tap-tempo and syllable tools.

export type KeyDetectionResult = {
  key: string; // e.g. "G major"
  confidence: number; // 0-1, margin-based heuristic
};

// Below this confidence, a detected key is displayed as an estimate rather
// than stated flatly.
export const CONFIDENT_KEY_THRESHOLD = 0.6;

const PITCH_CLASSES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

// Krumhansl-Schmuckler tone profiles: perceived stability of each pitch
// class relative to the tonic, from Krumhansl's probe-tone experiments.
const MAJOR_PROFILE = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];
const MINOR_PROFILE = [
  6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];

const FRAME_SIZE = 4096; // power of two, required by Meyda's FFT
// Cap analysis at ~4 minutes of audio so very long files stay fast; key
// rarely needs more evidence than that.
const MAX_FRAMES = 2600;

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

function toMono(buffer: AudioBuffer): Float32Array {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const out = new Float32Array(buffer.length);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) out[i] += data[i];
  }
  for (let i = 0; i < out.length; i++) out[i] /= buffer.numberOfChannels;
  return out;
}

export async function detectKey(
  buffer: AudioBuffer
): Promise<KeyDetectionResult | null> {
  // Dynamic import keeps Meyda out of every other page's bundle; it only
  // loads at the moment an upload actually needs it.
  const { default: Meyda } = await import("meyda");

  const signal = toMono(buffer);
  const frameCount = Math.min(
    Math.floor(signal.length / FRAME_SIZE),
    MAX_FRAMES
  );
  if (frameCount === 0) return null;

  Meyda.sampleRate = buffer.sampleRate;
  Meyda.bufferSize = FRAME_SIZE;

  const chromaSum = new Array(12).fill(0);
  let voicedFrames = 0;

  for (let f = 0; f < frameCount; f++) {
    const frame = signal.subarray(f * FRAME_SIZE, (f + 1) * FRAME_SIZE);

    // Skip near-silent frames so quiet intros/outros don't dilute the
    // pitch-class evidence.
    let energy = 0;
    for (let i = 0; i < frame.length; i++) energy += frame[i] * frame[i];
    if (Math.sqrt(energy / frame.length) < 0.005) continue;

    const chroma = Meyda.extract("chroma", frame) as number[] | null;
    if (!chroma || chroma.length !== 12) continue;

    for (let i = 0; i < 12; i++) chromaSum[i] += chroma[i];
    voicedFrames++;
  }

  if (voicedFrames === 0) return null;
  const avgChroma = chromaSum.map((v) => v / voicedFrames);

  // Correlate against all 24 keys: each rotation lines the profile up with
  // a different tonic. rotated[i] = profile for pitch class (i - tonic).
  const scores: { key: string; score: number }[] = [];
  for (let tonic = 0; tonic < 12; tonic++) {
    const majorRotated = PITCH_CLASSES.map(
      (_, i) => MAJOR_PROFILE[(i - tonic + 12) % 12]
    );
    const minorRotated = PITCH_CLASSES.map(
      (_, i) => MINOR_PROFILE[(i - tonic + 12) % 12]
    );
    scores.push({
      key: `${PITCH_CLASSES[tonic]} major`,
      score: pearson(avgChroma, majorRotated),
    });
    scores.push({
      key: `${PITCH_CLASSES[tonic]} minor`,
      score: pearson(avgChroma, minorRotated),
    });
  }

  scores.sort((a, b) => b.score - a.score);
  const [best, second] = scores;
  if (best.score <= 0) return null;

  // Heuristic: a clear winner typically leads the runner-up by 0.1+ in
  // correlation; scale that margin into 0-1 so the UI can hedge low values.
  const confidence = Math.max(0, Math.min(1, (best.score - second.score) * 8));

  return { key: best.key, confidence };
}

export const ALL_KEYS = PITCH_CLASSES.flatMap((pc) => [
  `${pc} major`,
  `${pc} minor`,
]);
