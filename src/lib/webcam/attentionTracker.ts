/**
 * Lightweight, fully on-device attention heuristic. This is an
 * experimental feature (labelled as such in the UI) — it estimates face
 * presence/gaze-on-screen from frame luminance stability, not real
 * face/gaze landmark detection. No video is ever stored or transmitted.
 */
export class AttentionTracker {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private baseline: number | null = null;
  private samples: number[] = [];
  private drops = 0;
  private awayStreak = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(video: HTMLVideoElement) {
    this.video = video;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 48;
    this.canvas.height = 36;
    this.ctx = this.canvas.getContext("2d");
  }

  private sampleLuminance(): number | null {
    if (!this.ctx || this.video.readyState < 2) return null;
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    const frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    let sum = 0;
    for (let i = 0; i < frame.length; i += 4) {
      sum += (frame[i] + frame[i + 1] + frame[i + 2]) / 3;
    }
    return sum / (frame.length / 4);
  }

  start(onDropsChange: (drops: number) => void) {
    this.intervalId = setInterval(() => {
      const lum = this.sampleLuminance();
      if (lum === null) return;
      this.samples.push(lum);
      if (this.samples.length > 4 && this.baseline === null) {
        this.baseline = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
      }
      if (this.baseline === null) return;

      const deviation = Math.abs(lum - this.baseline) / (this.baseline || 1);
      if (deviation > 0.28) {
        this.awayStreak += 1;
        if (this.awayStreak === 2) {
          this.drops += 1;
          onDropsChange(this.drops);
        }
      } else {
        this.awayStreak = 0;
        // slowly adapt baseline back toward stable lighting
        this.baseline = this.baseline * 0.9 + lum * 0.1;
      }
    }, 400);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }

  get dropsCount() {
    return this.drops;
  }
}
