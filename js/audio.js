/**
 * Audio Synthesizer Engine using the standard Web Audio API
 * Replaces the Windows-specific 'winsound' from the original Python Tkinter app.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.waveform = 'triangle';
    this.volume = 0.08;
    this.minFreq = 150;  // Hz
    this.maxFreq = 950;  // Hz
    this.activeOscillators = new Set();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
    }
    return this.enabled;
  }

  setWaveform(type) {
    this.waveform = type;
  }

  /**
   * Maps a numerical value between minVal and maxVal to a pitch frequency (Hz).
   */
  getFrequency(value, minVal = 1, maxVal = 100) {
    const clamped = Math.max(minVal, Math.min(maxVal, value));
    const ratio = (clamped - minVal) / (maxVal - minVal || 1);
    // Exponential pitch curve for natural musical perception
    return this.minFreq * Math.pow(this.maxFreq / this.minFreq, ratio);
  }

  /**
   * Plays a synthesized tone corresponding to array element value.
   * @param {number} value - The value of the bar
   * @param {number} minVal - Minimum array value
   * @param {number} maxVal - Maximum array value
   * @param {number} durationMs - Note duration in milliseconds
   */
  playTone(value, minVal = 1, maxVal = 100, durationMs = 40) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freq = this.getFrequency(value, minVal, maxVal);
      const durSec = Math.max(0.02, Math.min(0.12, durationMs / 1000));

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = this.waveform;
      osc.frequency.setValueAtTime(freq, now);

      // Fast attack & exponential decay envelope to avoid audio clicks
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(this.volume, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durSec);

      this.activeOscillators.add(osc);
      osc.onended = () => {
        this.activeOscillators.delete(osc);
        gain.disconnect();
      };
    } catch (e) {
      console.warn('Web Audio synthesis error:', e);
    }
  }

  /**
   * Plays a harmonic double tone for comparison/swap of two values
   */
  playChord(val1, val2, minVal, maxVal, durationMs = 40) {
    if (!this.enabled) return;
    this.playTone(val1, minVal, maxVal, durationMs);
    if (val2 !== undefined && val2 !== val1) {
      this.playTone(val2, minVal, maxVal, durationMs);
    }
  }

  /**
   * Play completion celebratory chime
   */
  playCompletionChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        } catch (e) {}
      }, idx * 70);
    });
  }
}

window.soundEngine = new SoundEngine();
