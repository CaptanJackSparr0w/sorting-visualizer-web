/**
 * Sorting Visualizer Studio Controller (Responsive & Touch Optimized)
 * Coordinates Real-Time Visualizer Engine, Audio Synthesizer, Live Code Stepper, and Playback States.
 */

class AppController {
  constructor() {
    this.visualizer = null;
    this.soundEngine = window.soundEngine;
    this.array = [];
    this.isRunning = false;
    this.isPaused = false;
    this.pausePromiseResolve = null;
    this.abortController = null;
    this.stepRequested = false;

    // Config State
    this.config = {
      algorithm: 'quickSort',
      preset: 'random',
      size: window.innerWidth < 600 ? 35 : 60,
      speed: 30, // ms delay
      minVal: 10,
      maxVal: 100,
      theme: 'theme-rainbow',
      mode: 'bars',
      bloom: true,
      reflection: true,
      particles: true,
      spatialAudio: true
    };

    // Stats
    this.stats = {
      comparisons: 0,
      swaps: 0,
      startTime: 0,
      timerInterval: null
    };

    this.dom = {};
    this.init();
  }

  init() {
    this.cacheDom();
    this.visualizer = new Visualizer('sorting-canvas');
    this.bindEvents();
    this.renderCodeLines();
    this.updateAlgoInfo();

    if (window.innerWidth < 600) {
      this.dom.sizeSlider.value = 35;
      this.dom.sizeVal.textContent = '35';
    }

    this.generateNewArray();
  }

  cacheDom() {
    this.dom = {
      // Header
      themeSelect: document.getElementById('theme-select'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      fullscreenText: document.getElementById('fullscreen-text'),
      statusDot: document.getElementById('status-dot'),
      statusText: document.getElementById('status-text'),

      // Algorithm & Preset Pills
      algoPills: document.querySelectorAll('.algo-pill'),
      presetButtons: document.querySelectorAll('.btn-preset'),

      // Stage Overlay HUD
      phaseText: document.getElementById('phase-text'),
      speedPills: document.querySelectorAll('.btn-speed-pill'),
      modeButtons: document.querySelectorAll('.btn-mode-hud'),
      canvasProgress: document.getElementById('canvas-progress'),

      // Telemetry
      metricComparisons: document.getElementById('metric-comparisons'),
      metricSwaps: document.getElementById('metric-swaps'),
      metricTime: document.getElementById('metric-time'),

      // Dock Actions
      btnGenerate: document.getElementById('btn-generate'),
      btnStart: document.getElementById('btn-start'),
      btnPause: document.getElementById('btn-pause'),
      btnStep: document.getElementById('btn-step'),
      btnReset: document.getElementById('btn-reset'),

      // Dock Sliders
      sizeSlider: document.getElementById('size-slider'),
      sizeVal: document.getElementById('size-val'),
      speedSlider: document.getElementById('speed-slider'),
      speedVal: document.getElementById('speed-val'),

      // Dock Audio & FX
      soundToggle: document.getElementById('btn-sound-toggle'),
      soundIcon: document.getElementById('sound-icon'),
      soundText: document.getElementById('sound-text'),
      waveformSelect: document.getElementById('waveform-select'),
      chipBloom: document.getElementById('chip-bloom'),
      chipReflection: document.getElementById('chip-reflection'),
      chipParticles: document.getElementById('chip-particles'),
      chipSpatial: document.getElementById('chip-spatial'),

      // Intelligence & Code Stepper
      codeLinesList: document.getElementById('code-lines-list'),
      algoTitle: document.getElementById('algo-info-title'),
      algoCategory: document.getElementById('algo-category'),
      algoBest: document.getElementById('algo-best'),
      algoAvg: document.getElementById('algo-avg'),
      algoWorst: document.getElementById('algo-worst'),
      algoSpace: document.getElementById('algo-space'),
      algoStable: document.getElementById('algo-stable'),
      algoInPlace: document.getElementById('algo-inplace'),
      algoDesc: document.getElementById('algo-description')
    };
  }

  bindEvents() {
    // 1. Algorithm Selection Pills
    this.dom.algoPills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (this.isRunning) return;
        this.dom.algoPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.config.algorithm = pill.dataset.algo;
        this.updateAlgoInfo();
        this.renderCodeLines();
      });
    });

    // 2. Preset Selection
    this.dom.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isRunning) return;
        this.dom.presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.config.preset = btn.dataset.preset;
        this.generateNewArray();
      });
    });

    // 3. Visualization Mode Switcher
    this.dom.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.config.mode = btn.dataset.mode;
        this.visualizer.setMode(this.config.mode);
        this.visualizer.render(this.array, this.config.minVal, this.config.maxVal, this.visualizer.currentState || {});
      });
    });

    // 4. Speed Multipliers
    this.dom.speedPills.forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseInt(btn.dataset.speed, 10);
        this.config.speed = speed;
        this.dom.speedSlider.value = speed;
        this.dom.speedVal.textContent = `${speed} ms`;
        this.updateSpeedPillsActive(speed);
      });
    });

    // 5. Sliders
    this.dom.sizeSlider.addEventListener('input', (e) => {
      this.config.size = parseInt(e.target.value, 10);
      this.dom.sizeVal.textContent = this.config.size;
      if (!this.isRunning) this.generateNewArray();
    });

    this.dom.speedSlider.addEventListener('input', (e) => {
      this.config.speed = parseInt(e.target.value, 10);
      this.dom.speedVal.textContent = `${this.config.speed} ms`;
      this.updateSpeedPillsActive(this.config.speed);
    });

    // 6. Theme Switcher
    this.dom.themeSelect.addEventListener('change', (e) => {
      document.body.className = e.target.value;
      this.visualizer.setTheme(e.target.value);
      this.visualizer.render(this.array, this.config.minVal, this.config.maxVal);
    });

    // 7. FX Toggles
    this.dom.chipBloom.addEventListener('click', () => {
      this.config.bloom = !this.config.bloom;
      this.dom.chipBloom.classList.toggle('active', this.config.bloom);
      this.visualizer.setBloom(this.config.bloom);
      this.visualizer.render(this.array, this.config.minVal, this.config.maxVal, this.visualizer.currentState || {});
    });

    this.dom.chipReflection.addEventListener('click', () => {
      this.config.reflection = !this.config.reflection;
      this.dom.chipReflection.classList.toggle('active', this.config.reflection);
      this.visualizer.setReflection(this.config.reflection);
      this.visualizer.render(this.array, this.config.minVal, this.config.maxVal, this.visualizer.currentState || {});
    });

    this.dom.chipParticles.addEventListener('click', () => {
      this.config.particles = !this.config.particles;
      this.dom.chipParticles.classList.toggle('active', this.config.particles);
      this.visualizer.setParticles(this.config.particles);
    });

    this.dom.chipSpatial.addEventListener('click', () => {
      const active = this.soundEngine.toggleSpatialPanning();
      this.dom.chipSpatial.classList.toggle('active', active);
    });

    // 8. Audio Controls
    this.dom.soundToggle.addEventListener('click', () => {
      const enabled = this.soundEngine.toggle();
      this.dom.soundIcon.textContent = enabled ? '🔊' : '🔇';
      this.dom.soundText.textContent = enabled ? 'Audio ON' : 'Muted';
      this.dom.soundToggle.classList.toggle('active', enabled);
    });

    this.dom.waveformSelect.addEventListener('change', (e) => {
      this.soundEngine.setWaveform(e.target.value);
    });

    // 9. Fullscreen Toggle
    this.dom.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          this.dom.fullscreenText.textContent = 'Exit Fullscreen';
        }).catch(err => console.warn(err));
      } else {
        document.exitFullscreen().then(() => {
          this.dom.fullscreenText.textContent = 'Fullscreen';
        }).catch(err => console.warn(err));
      }
    });

    document.addEventListener('fullscreenchange', () => {
      const isFull = !!document.fullscreenElement;
      this.dom.fullscreenText.textContent = isFull ? 'Exit Fullscreen' : 'Fullscreen';
      setTimeout(() => this.visualizer.handleResize(), 100);
    });

    // 10. Main Action Buttons
    this.dom.btnGenerate.addEventListener('click', () => {
      if (this.isRunning) this.reset();
      this.generateNewArray();
    });

    this.dom.btnStart.addEventListener('click', () => this.startSort());
    this.dom.btnPause.addEventListener('click', () => this.togglePause());
    this.dom.btnStep.addEventListener('click', () => this.triggerStep());
    this.dom.btnReset.addEventListener('click', () => this.reset());

    // 11. Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT'].includes(document.activeElement.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.isRunning) this.togglePause();
        else this.startSort();
      } else if (e.key === 'g' || e.key === 'G') {
        if (!this.isRunning) this.generateNewArray();
      } else if (e.key === 's' || e.key === 'S') {
        if (!this.isRunning) this.startSort();
      } else if (e.key === 'r' || e.key === 'R') {
        this.reset();
      } else if (e.key === 'm' || e.key === 'M') {
        this.dom.soundToggle.click();
      } else if (e.key === 'f' || e.key === 'F') {
        this.dom.btnFullscreen.click();
      }
    });
  }

  updateSpeedPillsActive(speed) {
    this.dom.speedPills.forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.speed, 10) === speed);
    });
  }

  generateNewArray() {
    const { size, minVal, maxVal, preset } = this.config;
    this.array = [];

    if (preset === 'random') {
      for (let i = 0; i < size; i++) {
        this.array.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
      }
    } else if (preset === 'nearlySorted') {
      for (let i = 0; i < size; i++) {
        this.array.push(Math.round(minVal + (i / size) * (maxVal - minVal)));
      }
      const swaps = Math.max(2, Math.floor(size * 0.08));
      for (let s = 0; s < swaps; s++) {
        const i1 = Math.floor(Math.random() * size);
        const i2 = Math.floor(Math.random() * size);
        [this.array[i1], this.array[i2]] = [this.array[i2], this.array[i1]];
      }
    } else if (preset === 'reversed') {
      for (let i = 0; i < size; i++) {
        this.array.push(Math.round(maxVal - (i / size) * (maxVal - minVal)));
      }
    } else if (preset === 'fewUnique') {
      const distinct = [
        minVal,
        Math.round(minVal + (maxVal - minVal) * 0.3),
        Math.round(minVal + (maxVal - minVal) * 0.6),
        maxVal
      ];
      for (let i = 0; i < size; i++) {
        this.array.push(distinct[Math.floor(Math.random() * distinct.length)]);
      }
    } else if (preset === 'pyramid') {
      const mid = Math.floor(size / 2);
      for (let i = 0; i < size; i++) {
        const distFromMid = Math.abs(i - mid);
        const val = Math.round(maxVal - (distFromMid / mid) * (maxVal - minVal));
        this.array.push(val);
      }
    } else if (preset === 'sawtooth') {
      const period = Math.max(5, Math.floor(size / 4));
      for (let i = 0; i < size; i++) {
        const phase = (i % period) / period;
        this.array.push(Math.round(minVal + phase * (maxVal - minVal)));
      }
    }

    this.resetStats();
    this.dom.canvasProgress.style.width = '0%';
    this.visualizer.render(this.array, minVal, maxVal);
    this.setStatus('Ready to Sort', 'default');
    this.dom.phaseText.textContent = 'Idle • Ready to Sort';
    this.highlightCodeLine(null);
  }

  async startSort() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.stepRequested = false;
    this.abortController = new AbortController();

    this.resetStats();
    this.startTimer();
    this.updateControlsState(true);
    this.setStatus('Sorting in Progress', 'active');
    this.dom.canvasProgress.style.width = '0%';

    const algoKey = this.config.algorithm;
    const algoFn = SortingAlgorithms[algoKey];
    const n = this.array.length;

    let estimatedOps = n * Math.log2(n);
    if (['bubbleSort', 'selectionSort', 'insertionSort'].includes(algoKey)) {
      estimatedOps = (n * (n - 1)) / 2;
    }

    const controller = {
      stats: this.stats,
      checkAbort: () => {
        if (this.abortController.signal.aborted) {
          throw new Error('SORT_ABORTED');
        }
      },
      step: async (state) => {
        controller.checkAbort();
        this.updateStatsDisplay();

        if (state.phase) {
          this.dom.phaseText.textContent = state.phase;
        }

        if (state.line !== undefined) {
          this.highlightCodeLine(state.line, !!(state.swapping && state.swapping.length > 0));
        }

        let progress = 0;
        if (state.sorted && state.sorted.length > 0) {
          progress = (state.sorted.length / n) * 100;
        } else {
          progress = Math.min(95, (this.stats.comparisons / estimatedOps) * 100);
        }
        this.dom.canvasProgress.style.width = `${Math.min(100, Math.round(progress))}%`;

        this.visualizer.render(this.array, this.config.minVal, this.config.maxVal, state);

        if (state.swapping && state.swapping.length > 0) {
          const idx = state.swapping[0];
          this.soundEngine.playTone(this.array[idx], this.config.minVal, this.config.maxVal, idx, n, this.config.speed);
        } else if (state.comparing && state.comparing.length > 0) {
          const idx1 = state.comparing[0];
          const idx2 = state.comparing[1];
          this.soundEngine.playChord(this.array[idx1], this.array[idx2], this.config.minVal, this.config.maxVal, idx1, idx2, n, this.config.speed);
        }

        if (this.isPaused && !this.stepRequested) {
          await new Promise(resolve => {
            this.pausePromiseResolve = resolve;
          });
        }
        this.stepRequested = false;

        await new Promise(resolve => setTimeout(resolve, Math.max(1, this.config.speed)));
      }
    };

    try {
      await algoFn(this.array, controller);
      this.stopTimer();
      this.dom.canvasProgress.style.width = '100%';
      this.setStatus('Sorting Complete!', 'default');
      this.dom.phaseText.textContent = 'Completed 🎉';
      this.highlightCodeLine(null);
      await this.visualizer.playCompletionSweep(this.array, this.config.minVal, this.config.maxVal, this.soundEngine);
    } catch (err) {
      if (err.message === 'SORT_ABORTED') {
        this.setStatus('Reset / Aborted', 'default');
        this.dom.phaseText.textContent = 'Idle • Ready to Sort';
        this.dom.canvasProgress.style.width = '0%';
        this.highlightCodeLine(null);
      } else {
        console.error('Sorting execution error:', err);
      }
    } finally {
      this.isRunning = false;
      this.isPaused = false;
      this.stopTimer();
      this.updateControlsState(false);
    }
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.dom.btnPause.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Resume</span>
      `;
      this.dom.btnPause.className = 'btn-dock btn-dock-start';
      this.dom.btnStep.disabled = false;
      this.setStatus('Paused', 'paused');
      this.dom.phaseText.textContent = 'Paused • Press Step or Resume';
    } else {
      this.dom.btnPause.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>Pause</span>
      `;
      this.dom.btnPause.className = 'btn-dock btn-dock-pause';
      this.dom.btnStep.disabled = true;
      this.setStatus('Sorting in Progress', 'active');

      if (this.pausePromiseResolve) {
        this.pausePromiseResolve();
        this.pausePromiseResolve = null;
      }
    }
  }

  triggerStep() {
    if (!this.isRunning || !this.isPaused) return;
    this.stepRequested = true;
    if (this.pausePromiseResolve) {
      this.pausePromiseResolve();
      this.pausePromiseResolve = null;
    }
  }

  reset() {
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.pausePromiseResolve) {
      this.pausePromiseResolve();
      this.pausePromiseResolve = null;
    }
    this.isRunning = false;
    this.isPaused = false;
    this.stopTimer();
    this.resetStats();
    this.dom.canvasProgress.style.width = '0%';
    this.updateControlsState(false);
    this.generateNewArray();
  }

  resetStats() {
    this.stats.comparisons = 0;
    this.stats.swaps = 0;
    this.updateStatsDisplay();
    this.dom.metricTime.textContent = '0.00 s';
  }

  updateStatsDisplay() {
    this.dom.metricComparisons.textContent = this.stats.comparisons.toLocaleString();
    this.dom.metricSwaps.textContent = this.stats.swaps.toLocaleString();
  }

  startTimer() {
    this.stats.startTime = performance.now();
    this.stats.timerInterval = setInterval(() => {
      const elapsedSec = ((performance.now() - this.stats.startTime) / 1000).toFixed(2);
      this.dom.metricTime.textContent = `${elapsedSec} s`;
    }, 50);
  }

  stopTimer() {
    if (this.stats.timerInterval) {
      clearInterval(this.stats.timerInterval);
      this.stats.timerInterval = null;
    }
  }

  setStatus(text, stateType) {
    this.dom.statusText.textContent = text;
    this.dom.statusDot.className = 'status-dot';
    if (stateType === 'active') this.dom.statusDot.classList.add('active');
    if (stateType === 'paused') this.dom.statusDot.classList.add('paused');
  }

  updateControlsState(sortingActive) {
    this.dom.btnStart.disabled = sortingActive;
    this.dom.btnGenerate.disabled = sortingActive;
    this.dom.sizeSlider.disabled = sortingActive;
    this.dom.presetButtons.forEach(b => b.disabled = sortingActive);
    this.dom.algoPills.forEach(p => p.disabled = sortingActive);

    this.dom.btnPause.disabled = !sortingActive;
    this.dom.btnStep.disabled = !sortingActive || !this.isPaused;

    if (!sortingActive) {
      this.dom.btnPause.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>Pause</span>
      `;
      this.dom.btnPause.className = 'btn-dock btn-dock-pause';
    }
  }

  renderCodeLines() {
    const info = ALGORITHM_INFO[this.config.algorithm];
    if (!info || !info.lines) return;

    this.dom.codeLinesList.innerHTML = '';
    info.lines.forEach((lineText, idx) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'code-line';
      lineEl.id = `code-line-${idx + 1}`;

      const numEl = document.createElement('span');
      numEl.className = 'code-line-num';
      numEl.textContent = (idx + 1).toString().padStart(2, '0');

      const textEl = document.createElement('span');
      textEl.className = 'code-line-text';
      textEl.textContent = lineText;

      lineEl.appendChild(numEl);
      lineEl.appendChild(textEl);
      this.dom.codeLinesList.appendChild(lineEl);
    });
  }

  highlightCodeLine(lineNum, isSwap = false) {
    const lines = this.dom.codeLinesList.querySelectorAll('.code-line');
    lines.forEach(l => {
      l.classList.remove('active-line');
      l.classList.remove('swap-line');
    });

    if (lineNum) {
      const activeEl = document.getElementById(`code-line-${lineNum}`);
      if (activeEl) {
        activeEl.classList.add(isSwap ? 'swap-line' : 'active-line');
      }
    }
  }

  updateAlgoInfo() {
    const info = ALGORITHM_INFO[this.config.algorithm];
    if (!info) return;
    this.dom.algoTitle.textContent = info.title;
    this.dom.algoCategory.textContent = info.category;
    this.dom.algoBest.textContent = info.bestTime;
    this.dom.algoAvg.textContent = info.avgTime;
    this.dom.algoWorst.textContent = info.worstTime;
    this.dom.algoSpace.textContent = info.space;
    this.dom.algoStable.textContent = info.stable;
    this.dom.algoInPlace.textContent = info.inPlace || 'Yes';
    this.dom.algoDesc.textContent = info.description;
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
EOF
