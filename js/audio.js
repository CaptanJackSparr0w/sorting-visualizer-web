/**
 * Advanced Audio Synthesizer Engine using Web Audio API
 * Features:
 * - Exponential musical pitch curve (130 Hz to 1100 Hz)
 * - True 3D Stereo Spatial Panning (panning from -1.0 on left to +1.0 on right)
 * - ADSR envelope with dynamics compression to prevent clipping
 * - Polyphonic voice pooling
 * - Completion celebratory arpeggiator chords
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.compressor = null;
    this.enabled = true;
    this.spatialPanning = true;
    this.waveform = 'triangle';
    this.volume = 0.08;
    this.minFreq = 130;  // C3
    this.maxFreq = 1050; // C6
    this.activeVoices = 0;
    this.maxVoices = 12;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        // Master Dynamics Compressor to prevent distortion on rapid bursts
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.20, this.ctx.currentTime);
        this.compressor.connect(this.ctx.destination);
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

  toggleSpatialPanning() {
    this.spatialPanning = !this.spatialPanning;
    return this.spatialPanning;
  }

  setWaveform(type) {
    this.waveform = type;
  }

  setVolume(val) {
    this.volume = Math.max(0.01, Math.min(0.25, val));
  }

  /**
   * Maps an array value to a harmonic musical pitch (Hz).
   */
  getFrequency(value, minVal = 1, maxVal = 100) {
    const clamped = Math.max(minVal, Math.min(maxVal, value));
    const ratio = (clamped - minVal) / (maxVal - minVal || 1);
    // Exponential frequency curve
    return this.minFreq * Math.pow(this.maxFreq / this.minFreq, ratio);
  }

  /**
   * Computes stereo pan position (-1.0 to +1.0) based on element index in array
   */
  getPanPosition(index, total) {
    if (!this.spatialPanning || total <= 1 || index === undefined) return 0;
    const clampedIdx = Math.max(0, Math.min(total - 1, index));
    // Range from -0.85 (left) to +0.85 (right)
    return (clampedIdx / (total - 1)) * 1.7 - 0.85;
  }

  /**
   * Synthesizes a clean musical note with attack/decay envelope & stereo panning
   */
  playTone(value, minVal = 1, maxVal = 100, index = 0, total = 60, durationMs = 40) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.activeVoices >= this.maxVoices) return;

    try {
      const now = this.ctx.currentTime;
      const freq = this.getFrequency(value, minVal, maxVal);
      const durSec = Math.max(0.02, Math.min(0.12, durationMs / 1000));

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = this.waveform;
      osc.frequency.setValueAtTime(freq, now);

      // Attack & Exponential Release
      const attackTime = 0.005;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(this.volume, now + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

      this.activeVoices++;

      // Spatial stereo panning
      if (this.ctx.createStereoPanner && this.spatialPanning) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(this.getPanPosition(index, total), now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.compressor || this.ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(this.compressor || this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + durSec);

      osc.onended = () => {
        this.activeVoices = Math.max(0, this.activeVoices - 1);
        gain.disconnect();
      };
    } catch (e) {
      console.warn('Web Audio synthesis exception:', e);
    }
  }

  /**
   * Plays a 2-tone harmonic chord for comparisons / swaps
   */
  playChord(val1, val2, minVal, maxVal, idx1, idx2, total, durationMs = 40) {
    if (!this.enabled) return;
    this.playTone(val1, minVal, maxVal, idx1, total, durationMs);
    if (val2 !== undefined && val2 !== val1) {
      this.playTone(val2, minVal, maxVal, idx2, total, durationMs);
    }
  }

  /**
   * Multi-stage celebratory arpeggio upon sorting completion
   */
  playCompletionChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Major 9th Arpeggio: C5 -> E5 -> G5 -> B5 -> D6
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
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
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

          if (this.ctx.createStereoPanner) {
            const panner = this.ctx.createStereoPanner();
            panner.pan.setValueAtTime((idx / (notes.length - 1)) * 1.6 - 0.8, now);
            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.compressor || this.ctx.destination);
          } else {
            osc.connect(gain);
            gain.connect(this.compressor || this.ctx.destination);
          }

          osc.start(now);
          osc.stop(now + 0.45);
        } catch (e) {}
      }, idx * 65);
    });
  }
}

window.soundEngine = new SoundEngine();
