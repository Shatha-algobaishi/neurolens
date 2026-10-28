let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AudioCtx();
  }
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = "sine", startGain = 0.12, delay = 0) {
  if (muted) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = audioCtx.currentTime + delay;
  gain.gain.setValueAtTime(startGain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

export const sound = {
  tap: () => tone(720, 0.08, "sine", 0.1),
  hit: () => tone(880, 0.12, "triangle", 0.12),
  miss: () => tone(160, 0.18, "sawtooth", 0.1),
  pop: () => tone(1040, 0.07, "sine", 0.09),
  success: () => {
    tone(523.25, 0.16, "sine", 0.1, 0);
    tone(659.25, 0.16, "sine", 0.1, 0.1);
    tone(783.99, 0.24, "sine", 0.12, 0.2);
  },
  levelUp: () => {
    tone(392, 0.1, "square", 0.08, 0);
    tone(523.25, 0.1, "square", 0.08, 0.1);
    tone(659.25, 0.16, "square", 0.1, 0.2);
  },
  fail: () => {
    tone(300, 0.2, "sawtooth", 0.1, 0);
    tone(180, 0.3, "sawtooth", 0.1, 0.12);
  },
  countdown: () => tone(440, 0.1, "square", 0.08),
  select: () => tone(600, 0.06, "sine", 0.08),
  swoosh: () => tone(220, 0.22, "triangle", 0.06),
};
