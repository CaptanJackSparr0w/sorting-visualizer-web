/**
 * Main Application Controller
 * Handles UI interactions, state transitions, array generation, and sorting orchestrator.
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
      size: 60,
      speed: 30, // ms delay
      minVal: 10,
      maxVal: 100,
      theme: 'theme-rainbow'
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
    this.updateAlgoInfo();
    this.generateNewArray();
  }

  cacheDom() {
    this.dom = {
      algoSelect: document.getElementById('algorithm-select'),
      presetSelect: document.getElementById('preset-select'),
      sizeSlider: document.getElementById('size-slider'),
      sizeVal: document.getElementById('size-val'),
      speedSlider: document.getElementById('speed-slider'),
      speedVal: document.getElementById('speed-val'),
      minValSlider: document.getElementById('min-val-slider'),
      minValLabel: document.getElementById('min-val-label'),
      maxValSlider: document.getElementById('max-val-slider'),
      maxValLabel: document.getElementById('max-val-label'),
      themeSelect: document.getElementById('theme-select'),
      soundToggle: document.getElementById('btn-sound-toggle'),
      soundIcon: document.getElementById('sound-icon'),
      soundText: document.getElementById('sound-text'),
      waveformSelect: document.getElementById('waveform-select'),

      // Buttons
      btnGenerate: document.getElementById('btn-generate'),
      btnStart: document.getElementById('btn-start'),
      btnPause: document.getElementById('btn-pause'),
      btnStep: document.getElementById('btn-step'),
      btnReset: document.getElementById('btn-reset'),

      // Metrics
      metricComparisons: document.getElementById('metric-comparisons'),
      metricSwaps: document.getElementById('metric-swaps'),
      metricTime: document.getElementById('metric-time'),
      metricPhase: document.getElementById('metric-phase'),
      statusDot: document.getElementById('status-dot'),
      statusText: document.getElementById('status-text'),

      // Info Card
      algoTitle: document.getElementById('algo-info-title'),
      algoCategory: document.getElementById('algo-category'),
      algoBest: document.getElementById('algo-best'),
      algoAvg: document.getElementById('algo-avg'),
      algoWorst: document.getElementById('algo-worst'),
      algoSpace: document.getElementById('algo-space'),
      algoStable: document.getElementById('algo-stable'),
      algoDesc: document.getElementById('algo-description'),
      algoCode: document.getElementById('algo-pseudocode')
    };
  }

  bindEvents() {
    // Config Changes
    this.dom.algoSelect.addEventListener('change', (e) => {
      this.config.algorithm = e.target.value;
      this.updateAlgoInfo();
    });

    this.dom.presetSelect.addEventListener('change', (e) => {
      this.config.preset = e.target.value;
      if (!this.isRunning) this.generateNewArray();
    });

    this.dom.sizeSlider.addEventListener('input', (e) => {
      this.config.size = parseInt(e.target.value, 10);
      this.dom.sizeVal.textContent = this.config.size;
      if (!this.isRunning) this.generateNewArray();
    });

    this.dom.speedSlider.addEventListener('input', (e) => {
      this.config.speed = parseInt(e.target.value, 10);
      this.dom.speedVal.textContent = `${this.config.speed} ms`;
    });

    this.dom.minValSlider.addEventListener('input', (e) => {
      this.config.minVal = parseInt(e.target.value, 10);
      this.dom.minValLabel.textContent = this.config.minVal;
      if (this.config.minVal >= this.config.maxVal) {
        this.config.maxVal = this.config.minVal + 10;
        this.dom.maxValSlider.value = this.config.maxVal;
        this.dom.maxValLabel.textContent = this.config.maxVal;
      }
      if (!this.isRunning) this.generateNewArray();
    });

    this.dom.maxValSlider.addEventListener('input', (e) => {
      this.config.maxVal = parseInt(e.target.value, 10);
      this.dom.maxValLabel.textContent = this.config.maxVal;
      if (this.config.maxVal <= this.config.minVal) {
        this.config.minVal = Math.max(1, this.config.maxVal - 10);
        this.dom.minValSlider.value = this.config.minVal;
        this.dom.minValLabel.textContent = this.config.minVal;
      }
      if (!this.isRunning) this.generateNewArray();
    });

    this.dom.themeSelect.addEventListener('change', (e) => {
      document.body.className = e.target.value;
      this.visualizer.setTheme(e.target.value);
      this.visualizer.render(this.array, this.config.minVal, this.config.maxVal);
    });

    // Audio Controls
    this.dom.soundToggle.addEventListener('click', () => {
      const enabled = this.soundEngine.toggle();
      this.dom.soundIcon.textContent = enabled ? '🔊' : '🔇';
      this.dom.soundText.textContent = enabled ? 'Sound ON' : 'Muted';
      this.dom.soundToggle.classList.toggle('btn-outline', !enabled);
      this.dom.soundToggle.classList.toggle('btn-secondary', enabled);
    });

    this.dom.waveformSelect.addEventListener('change', (e) => {
      this.soundEngine.setWaveform(e.target.value);
    });

    // Action Buttons
    this.dom.btnGenerate.addEventListener('click', () => {
      if (this.isRunning) this.reset();
      this.generateNewArray();
    });

    this.dom.btnStart.addEventListener('click', () => this.startSort());
    this.dom.btnPause.addEventListener('click', () => this.togglePause());
    this.dom.btnStep.addEventListener('click', () => this.triggerStep());
    this.dom.btnReset.addEventListener('click', () => this.reset());

    // Keyboard Shortcuts
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
      }
    });
  }

  generateNewArray() {
    const { size, minVal, maxVal, preset } = this.config;
    this.array = [];

    if (preset === 'random') {
      for (let i = 0; i < size; i++) {
        const val = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        this.array.push(val);
      }
    } else if (preset === 'nearlySorted') {
      for (let i = 0; i < size; i++) {
        const val = Math.round(minVal + (i / size) * (maxVal - minVal));
        this.array.push(val);
      }
      // Swap ~5% of elements
      const swaps = Math.max(2, Math.floor(size * 0.08));
      for (let s = 0; s < swaps; s++) {
        const i1 = Math.floor(Math.random() * size);
        const i2 = Math.floor(Math.random() * size);
        [this.array[i1], this.array[i2]] = [this.array[i2], this.array[i1]];
      }
    } else if (preset === 'reversed') {
      for (let i = 0; i < size; i++) {
        const val = Math.round(maxVal - (i / size) * (maxVal - minVal));
        this.array.push(val);
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
    } else if (preset === 'sawtooth') {
      const period = Math.max(5, Math.floor(size / 4));
      for (let i = 0; i < size; i++) {
        const phase = (i % period) / period;
        this.array.push(Math.round(minVal + phase * (maxVal - minVal)));
      }
    }

    this.resetStats();
    this.visualizer.render(this.array, minVal, maxVal);
    this.setStatus('Ready', 'default');
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
    this.setStatus('Sorting in progress...', 'active');

    const algoKey = this.config.algorithm;
    const algoFn = SortingAlgorithms[algoKey];

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
          this.dom.metricPhase.textContent = state.phase;
        }

        // Render Canvas
        this.visualizer.render(this.array, this.config.minVal, this.config.maxVal, state);

        // Sound Synthesis
        if (state.swapping && state.swapping.length > 0) {
          const idx = state.swapping[0];
          this.soundEngine.playTone(this.array[idx], this.config.minVal, this.config.maxVal, this.config.speed);
        } else if (state.comparing && state.comparing.length > 0) {
          const idx1 = state.comparing[0];
          const idx2 = state.comparing[1];
          this.soundEngine.playChord(this.array[idx1], this.array[idx2], this.config.minVal, this.config.maxVal, this.config.speed);
        }

        // Pause / Step handling
        if (this.isPaused && !this.stepRequested) {
          await new Promise(resolve => {
            this.pausePromiseResolve = resolve;
          });
        }
        this.stepRequested = false;

        // Dynamic Speed Delay
        await new Promise(resolve => setTimeout(resolve, Math.max(1, this.config.speed)));
      }
    };

    try {
      await algoFn(this.array, controller);
      // Finished successfully!
      this.stopTimer();
      this.setStatus('Sorting Complete!', 'default');
      this.dom.metricPhase.textContent = 'Completed';
      await this.visualizer.playCompletionSweep(this.array, this.config.minVal, this.config.maxVal, this.soundEngine);
    } catch (err) {
      if (err.message === 'SORT_ABORTED') {
        this.setStatus('Reset / Aborted', 'default');
        this.dom.metricPhase.textContent = 'Idle';
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Resume</span>
      `;
      this.dom.btnPause.className = 'btn btn-primary';
      this.dom.btnStep.disabled = false;
      this.setStatus('Paused', 'paused');
    } else {
      this.dom.btnPause.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>Pause</span>
      `;
      this.dom.btnPause.className = 'btn btn-warning';
      this.dom.btnStep.disabled = true;
      this.setStatus('Sorting in progress...', 'active');

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
    this.updateControlsState(false);
    this.generateNewArray();
  }

  resetStats() {
    this.stats.comparisons = 0;
    this.stats.swaps = 0;
    this.updateStatsDisplay();
    this.dom.metricTime.textContent = '0.00 s';
    this.dom.metricPhase.textContent = 'Idle';
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
    this.dom.presetSelect.disabled = sortingActive;
    this.dom.algoSelect.disabled = sortingActive;
    this.dom.minValSlider.disabled = sortingActive;
    this.dom.maxValSlider.disabled = sortingActive;

    this.dom.btnPause.disabled = !sortingActive;
    this.dom.btnStep.disabled = !sortingActive || !this.isPaused;

    if (!sortingActive) {
      this.dom.btnPause.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        <span>Pause</span>
      `;
      this.dom.btnPause.className = 'btn btn-warning';
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
    this.dom.algoDesc.textContent = info.description;
    this.dom.algoCode.textContent = info.pseudocode;
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
