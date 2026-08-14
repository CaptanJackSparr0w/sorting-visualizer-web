/**
 * Canvas Visualizer Engine
 * Faithfully ports Python colorsys.hsv_to_rgb rainbow gradient and adds modern themes.
 */
class Visualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.theme = 'theme-rainbow';
    this.resizeObserver = null;
    this.initCanvas();
  }

  initCanvas() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setTheme(themeName) {
    this.theme = themeName;
  }

  /**
   * Faithfully implements Python's colorsys.hsv_to_rgb(h, s, v)
   * Hue h: [0, 1], Saturation s: [0, 1], Value v: [0, 1]
   */
  hsvToRgb(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  }

  /**
   * Computes bar color according to the active theme and element state.
   */
  getBarColor(value, minVal, maxVal, index, total, state) {
    // 1. Highlight states override theme base colors
    if (state.swapping && state.swapping.includes(index)) {
      return '#ef4444'; // Bright Red (Swapping/Writing)
    }
    if (state.comparing && state.comparing.includes(index)) {
      return '#f59e0b'; // Amber / Yellow (Comparing)
    }
    if (state.pivot === index) {
      return '#ec4899'; // Hot Pink (Pivot / Min Element)
    }
    if (state.sorted && state.sorted.includes(index)) {
      return '#10b981'; // Emerald Green (Sorted)
    }
    if (state.auxiliary && state.auxiliary.includes(index)) {
      return '#8b5cf6'; // Purple (Auxiliary merge)
    }

    // 2. Base Theme Colors
    const ratio = (value - minVal) / (maxVal - minVal || 1);

    if (this.theme === 'theme-rainbow') {
      // Original Python project rainbow gradient: hue mapped from 0.0 (red) to 0.75 (purple/blue)
      const hue = ratio * 0.75;
      return this.hsvToRgb(hue, 0.88, 0.95);
    } else if (this.theme === 'theme-cyberpunk') {
      const hue = 0.85 + ratio * 0.35; // Neon Magenta to Cyan
      return this.hsvToRgb(hue % 1.0, 0.9, 0.95);
    } else if (this.theme === 'theme-aurora') {
      const hue = 0.4 + ratio * 0.25; // Teal to Emerald
      return this.hsvToRgb(hue, 0.85, 0.95);
    } else if (this.theme === 'theme-sunset') {
      const hue = 0.05 + ratio * 0.12; // Orange to Golden Yellow
      return this.hsvToRgb(hue, 0.9, 0.98);
    } else if (this.theme === 'theme-matrix') {
      const g = Math.round(140 + ratio * 115);
      return `rgb(20, ${g}, 40)`;
    }

    return '#3b82f6';
  }

  /**
   * Main render function for the array bars
   */
  render(array, minVal = 1, maxVal = 100, state = {}) {
    if (!this.canvas || !this.ctx) return;
    const { width, height } = this;
    const n = array.length;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Padding & dimensions
    const paddingX = 8;
    const paddingBottom = 12;
    const paddingTop = 20;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingTop - paddingBottom;

    const barSpacing = n > 100 ? 1 : (n > 50 ? 2 : 3);
    const barWidth = Math.max(1, (usableWidth - (n - 1) * barSpacing) / n);

    for (let i = 0; i < n; i++) {
      const val = array[i];
      const normalizedHeight = ((val - minVal) / (maxVal - minVal || 1)) * (usableHeight - 20) + 15;
      const x = paddingX + i * (barWidth + barSpacing);
      const y = height - paddingBottom - normalizedHeight;

      const color = this.getBarColor(val, minVal, maxVal, i, n, state);

      // Draw Bar
      this.ctx.fillStyle = color;
      if (barWidth > 4) {
        // Rounded bar top
        this.drawRoundedRect(x, y, barWidth, normalizedHeight, Math.min(3, barWidth / 2));
      } else {
        this.ctx.fillRect(x, y, barWidth, normalizedHeight);
      }

      // Draw numeric labels for small array sizes
      if (n <= 35 && barWidth > 14) {
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = `${Math.min(11, Math.floor(barWidth * 0.65))}px 'Fira Code', monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(val, x + barWidth / 2, y - 4);
      }
    }
  }

  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.lineTo(x, y + height);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Celebratory sweep animation when sorting finishes
   */
  async playCompletionSweep(array, minVal, maxVal, soundEngine) {
    const n = array.length;
    const stepDelay = Math.max(5, Math.min(30, 800 / n));
    const sorted = [];

    for (let i = 0; i < n; i++) {
      sorted.push(i);
      this.render(array, minVal, maxVal, { sorted: [...sorted] });
      if (soundEngine && soundEngine.enabled) {
        soundEngine.playTone(array[i], minVal, maxVal, 25);
      }
      await new Promise(r => setTimeout(r, stepDelay));
    }

    if (soundEngine && soundEngine.enabled) {
      soundEngine.playCompletionChime();
    }
  }
}

window.Visualizer = Visualizer;
