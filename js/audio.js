/**
 * Studio-Grade Audio Synthesizer Engine using Web Audio API
 * - Pentatonic Harmonic Pitch Quantization (Generative Chime effect)
 * - 3D Spatial Stereo Panning across array indices
 * - ADSR Volume Envelope with Fast Attack and Exponential Decay
 * - Master Dynamics Compressor to prevent clipping
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.compressor = null;
    this.enabled = true;
    this.spatialPanning = true;
    this.waveform = 'triangle';
    this.volume = 0.09;
    this.activeVoices = 0;
    this.maxVoices = 16;

    // Pentatonic scale frequencies across 4 octaves (C3 to A6) for musical sound
    this.pentatonicScale = [
      130.81, 146.83, 164.81, 196.00, 220.00, // C3 - A3
      261.63, 293.66, 329.63, 392.00, 440.00, // C4 - A4
      523.25, 587.33, 659.25, 783.99, 880.00, // C5 - A5
      1046.50, 1174.66, 1318.51, 1567.98, 1760.00 // C6 - A6
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
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
   * Quantizes a normalized value (0.0 to 1.0) into the harmonic pentatonic scale
   */
  getFrequency(value, minVal = 1, maxVal = 100) {
    const clamped = Math.max(minVal, Math.min(maxVal, value));
    const ratio = (clamped - minVal) / (maxVal - minVal || 1);
    const scaleIndex = Math.min(
      this.pentatonicScale.length - 1,
      Math.floor(ratio * this.pentatonicScale.length)
    );
    return this.pentatonicScale[scaleIndex];
  }

  /**
   * Computes stereo pan position (-0.85 to +0.85) from element index
   */
  getPanPosition(index, total) {
    if (!this.spatialPanning || total <= 1 || index === undefined) return 0;
    const clampedIdx = Math.max(0, Math.min(total - 1, index));
    return (clampedIdx / (total - 1)) * 1.7 - 0.85;
  }

  /**
   * Plays a synthesized musical note with spatial panning & dynamic envelope
   */
  playTone(value, minVal = 1, maxVal = 100, index = 0, total = 60, durationMs = 40) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.activeVoices >= this.maxVoices) return;

    try {
      const now = this.ctx.currentTime;
      const freq = this.getFrequency(value, minVal, maxVal);
      const durSec = Math.max(0.025, Math.min(0.14, durationMs / 1000));

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = this.waveform;
      osc.frequency.setValueAtTime(freq, now);

      // Fast attack & exponential decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(this.volume, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

      this.activeVoices++;

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
      console.warn('Audio synthesis error:', e);
    }
  }

  playChord(val1, val2, minVal, maxVal, idx1, idx2, total, durationMs = 40) {
    if (!this.enabled) return;
    this.playTone(val1, minVal, maxVal, idx1, total, durationMs);
    if (val2 !== undefined && val2 !== val1) {
      this.playTone(val2, minVal, maxVal, idx2, total, durationMs);
    }
  }

  /**
   * Harmonious C Major 9th Arpeggio celebration upon sort completion
   */
  playCompletionChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51]; // C5, E5, G5, B5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

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
          osc.stop(now + 0.5);
        } catch (e) {}
      }, idx * 60);
    });
  }
}

window.soundEngine = new SoundEngine();
