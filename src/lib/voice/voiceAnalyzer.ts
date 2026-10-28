/**
 * Lightweight, fully on-device speech-fluency heuristic. This is an
 * experimental feature — it estimates speaking ratio and rhythm from
 * volume (RMS) sampling via the Web Audio API, not real speech-to-text
 * or phoneme analysis. No audio is ever stored or transmitted.
 */
export function analyzeVoiceSample(stream: MediaStream, durationMs = 2800): Promise<number> {
  return new Promise((resolve) => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const samples: number[] = [];
    const interval = setInterval(() => {
      analyser.getByteFrequencyData(data);
      const rms = Math.sqrt(data.reduce((a, b) => a + b * b, 0) / data.length);
      samples.push(rms);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      audioCtx.close();

      const threshold = 14;
      const speaking = samples.filter((s) => s > threshold).length;
      const speechRatio = samples.length ? (speaking / samples.length) * 100 : 0;

      let segments = 0;
      for (let i = 1; i < samples.length; i++) {
        if (samples[i] > threshold && samples[i - 1] <= threshold) segments++;
      }
      // A handful of clear speech bursts (not silence, not one continuous drone) reads as fluent.
      const rhythmScore = Math.max(0, 100 - Math.abs(segments - 3) * 12);

      const score = Math.min(100, Math.max(0, Math.round(speechRatio * 0.55 + rhythmScore * 0.45)));
      resolve(score);
    }, durationMs);
  });
}
