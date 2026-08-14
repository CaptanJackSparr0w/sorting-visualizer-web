/**
 * Visualizer Engine 2.0
 * Features:
 * - 4 Visualization Modes: Vertical Bars, Polar/Radial Circle, Glowing Scatter Dots, Neon Waveform
 * - Hardware-accelerated High-DPI Canvas 2D
 * - Bloom & Ambient Glow Effects
 * - Active Pointer Indicators
 * - Particle Burst / Spark System on Swaps & Completion
 * - Floor Mirror Reflection & Rainbow HSV Gradient
 * - Interactive Mouse Hover Tooltip
 */

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.random() * 2.5 + 1.2;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = -(Math.random() * 4 + 1.5);
    this.alpha = 1.0;
    this.decay = Math.random() * 0.035 + 0.02;
    this.gravity = 0.12;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.alpha -= this.decay;
    return this.alpha > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Visualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.theme = 'theme-rainbow';
    this.mode = 'bars'; // 'bars' | 'radial' | 'dots' | 'wave'
    this.enableBloom = true;
    this.enableReflection = true;
    this.enableParticles = true;

    this.particles = [];
    this.hoverIndex = -1;
    this.hoverData = null;

    this.initCanvas();
    this.bindMouseEvents();
    this.startParticleLoop();
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
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setTheme(themeName) {
    this.theme = themeName;
  }

  setMode(modeName) {
    this.mode = modeName;
  }

  setBloom(enabled) {
    this.enableBloom = enabled;
  }

  setReflection(enabled) {
    this.enableReflection = enabled;
  }

  setParticles(enabled) {
    this.enableParticles = enabled;
  }

  bindMouseEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.currentArray && this.mode === 'bars') {
        const paddingX = 12;
        const usableWidth = this.width - paddingX * 2;
        const n = this.currentArray.length;
        const barSpacing = n > 120 ? 1 : (n > 60 ? 2 : 3);
        const barWidth = Math.max(1, (usableWidth - (n - 1) * barSpacing) / n);

        const relativeX = x - paddingX;
        if (relativeX >= 0 && relativeX <= usableWidth) {
          const index = Math.floor(relativeX / (barWidth + barSpacing));
          if (index >= 0 && index < n) {
            this.hoverIndex = index;
            this.hoverData = {
              index,
              value: this.currentArray[index],
              x: paddingX + index * (barWidth + barSpacing) + barWidth / 2,
              y
            };
            this.render(this.currentArray, this.currentMin, this.currentMax, this.currentState);
            return;
          }
        }
      }
      if (this.hoverIndex !== -1) {
        this.hoverIndex = -1;
        this.hoverData = null;
        if (this.currentArray) {
          this.render(this.currentArray, this.currentMin, this.currentMax, this.currentState);
        }
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = -1;
      this.hoverData = null;
      if (this.currentArray) {
        this.render(this.currentArray, this.currentMin, this.currentMax, this.currentState);
      }
    });
  }

  startParticleLoop() {
    const loop = () => {
      if (this.particles.length > 0) {
        this.particles = this.particles.filter(p => p.update());
        if (this.currentArray) {
          this.render(this.currentArray, this.currentMin, this.currentMax, this.currentState);
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  spawnSparks(x, y, color, count = 8) {
    if (!this.enableParticles) return;
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  /**
   * HSV to RGB with enhanced vibrancy and saturation
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

  getBarColor(value, minVal, maxVal, index, total, state) {
    // 1. Highlight overrides
    if (state.swapping && state.swapping.includes(index)) return '#ef4444'; // Red
    if (state.comparing && state.comparing.includes(index)) return '#f59e0b'; // Amber
    if (state.pivot === index) return '#ec4899'; // Hot Pink
    if (state.sorted && state.sorted.includes(index)) return '#10b981'; // Emerald
    if (state.auxiliary && state.auxiliary.includes(index)) return '#8b5cf6'; // Violet

    // 2. Palette calculations
    const ratio = (value - minVal) / (maxVal - minVal || 1);

    if (this.theme === 'theme-rainbow') {
      // 360-degree rainbow spectrum mapping
      const hue = ratio * 0.78;
      return this.hsvToRgb(hue, 0.90, 0.98);
    } else if (this.theme === 'theme-cyberpunk') {
      const hue = (0.84 + ratio * 0.38) % 1.0;
      return this.hsvToRgb(hue, 0.92, 0.98);
    } else if (this.theme === 'theme-aurora') {
      const hue = 0.38 + ratio * 0.28;
      return this.hsvToRgb(hue, 0.88, 0.98);
    } else if (this.theme === 'theme-sunset') {
      const hue = 0.03 + ratio * 0.14;
      return this.hsvToRgb(hue, 0.92, 0.98);
    } else if (this.theme === 'theme-matrix') {
      const g = Math.round(130 + ratio * 125);
      return `rgb(24, ${g}, 48)`;
    } else if (this.theme === 'theme-glacier') {
      const hue = 0.52 + ratio * 0.14;
      return this.hsvToRgb(hue, 0.85, 0.98);
    }

    return '#3b82f6';
  }

  /**
   * Main Render Dispatcher
   */
  render(array, minVal = 1, maxVal = 100, state = {}) {
    if (!this.canvas || !this.ctx || !array) return;
    this.currentArray = array;
    this.currentMin = minVal;
    this.currentMax = maxVal;
    this.currentState = state;

    const { width, height } = this;
    this.ctx.clearRect(0, 0, width, height);

    // Draw Background Grid / Ambient Lines
    this.drawBackgroundGrid();

    if (this.mode === 'radial') {
      this.renderRadial(array, minVal, maxVal, state);
    } else if (this.mode === 'dots') {
      this.renderDots(array, minVal, maxVal, state);
    } else if (this.mode === 'wave') {
      this.renderWave(array, minVal, maxVal, state);
    } else {
      this.renderBars(array, minVal, maxVal, state);
    }

    // Render Particles
    for (const p of this.particles) {
      p.draw(this.ctx);
    }

    // Render Hover Tooltip
    if (this.hoverData && this.mode === 'bars') {
      this.drawTooltip(this.hoverData);
    }
  }

  drawBackgroundGrid() {
    const { width, height, ctx } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;

    // Horizontal guidelines
    const step = height / 5;
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Mode 1: Modern Vertical Bars with Reflection & Bloom
   */
  renderBars(array, minVal, maxVal, state) {
    const { width, height, ctx } = this;
    const n = array.length;

    const paddingX = 12;
    const paddingTop = 26;
    const paddingBottom = this.enableReflection ? 32 : 12;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingTop - paddingBottom;

    const barSpacing = n > 120 ? 1 : (n > 60 ? 2 : 3);
    const barWidth = Math.max(1, (usableWidth - (n - 1) * barSpacing) / n);
    const baselineY = height - paddingBottom;

    for (let i = 0; i < n; i++) {
      const val = array[i];
      const normalizedHeight = ((val - minVal) / (maxVal - minVal || 1)) * (usableHeight - 20) + 16;
      const x = paddingX + i * (barWidth + barSpacing);
      const y = baselineY - normalizedHeight;

      const isComparing = state.comparing && state.comparing.includes(i);
      const isSwapping = state.swapping && state.swapping.includes(i);
      const isPivot = state.pivot === i;
      const isSorted = state.sorted && state.sorted.includes(i);
      const isHighlighted = isComparing || isSwapping || isPivot || isSorted;

      const baseColor = this.getBarColor(val, minVal, maxVal, i, n, state);

      ctx.save();

      // Bloom glow on active bars
      if (this.enableBloom && isHighlighted) {
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = isSwapping ? 18 : (isPivot ? 15 : 10);
      }

      // Vertical Linear Gradient for each bar
      const gradient = ctx.createLinearGradient(0, y, 0, baselineY);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, this.darkenColor(baseColor, 0.45));

      ctx.fillStyle = gradient;

      if (barWidth > 4) {
        this.drawRoundedRect(x, y, barWidth, normalizedHeight, Math.min(4, barWidth / 2));
      } else {
        ctx.fillRect(x, y, barWidth, normalizedHeight);
      }

      // Floor Mirror Reflection
      if (this.enableReflection) {
        const reflectionHeight = Math.min(22, normalizedHeight * 0.35);
        const refGradient = ctx.createLinearGradient(0, baselineY, 0, baselineY + reflectionHeight);
        refGradient.addColorStop(0, this.colorToRgba(baseColor, 0.28));
        refGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = refGradient;
        ctx.fillRect(x, baselineY + 2, barWidth, reflectionHeight);
      }

      // Active Top Pointer Triangle on comparison/swap
      if (isComparing || isSwapping || isPivot) {
        this.drawTopPointer(x + barWidth / 2, y - 5, baseColor);
        if (isSwapping && Math.random() < 0.3) {
          this.spawnSparks(x + barWidth / 2, y, baseColor, 3);
        }
      }

      // Value label on small arrays
      if (n <= 35 && barWidth > 14) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = `600 ${Math.min(11, Math.floor(barWidth * 0.65))}px 'Fira Code', monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barWidth / 2, y - 8);
      }

      ctx.restore();
    }
  }

  /**
   * Mode 2: Polar Radial / Circular Visualizer
   */
  renderRadial(array, minVal, maxVal, state) {
    const { width, height, ctx } = this;
    const n = array.length;
    const centerX = width / 2;
    const centerY = height / 2;
    const innerRadius = Math.min(width, height) * 0.16;
    const maxRayLength = Math.min(width, height) * 0.32;
    const angleStep = (Math.PI * 2) / n;

    // Draw Center Glow Orb
    ctx.save();
    const orbGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, innerRadius);
    orbGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    orbGradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.8)');
    orbGradient.addColorStop(1, 'rgba(10, 15, 25, 0.95)');

    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < n; i++) {
      const val = array[i];
      const ratio = (val - minVal) / (maxVal - minVal || 1);
      const rayLength = innerRadius + ratio * maxRayLength;
      const angle = i * angleStep - Math.PI / 2;

      const isComparing = state.comparing && state.comparing.includes(i);
      const isSwapping = state.swapping && state.swapping.includes(i);
      const isPivot = state.pivot === i;
      const isSorted = state.sorted && state.sorted.includes(i);

      const color = this.getBarColor(val, minVal, maxVal, i, n, state);

      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * rayLength;
      const y2 = centerY + Math.sin(angle) * rayLength;

      ctx.save();
      if (this.enableBloom && (isComparing || isSwapping || isPivot || isSorted)) {
        ctx.shadowColor = color;
        ctx.shadowBlur = isSwapping ? 15 : 8;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.5, ((Math.PI * 2 * innerRadius) / n) * 0.8);
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Glowing outer dot tip
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x2, y2, Math.min(3, ctx.lineWidth / 2), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Mode 3: Scatter Dots / Constellation
   */
  renderDots(array, minVal, maxVal, state) {
    const { width, height, ctx } = this;
    const n = array.length;
    const paddingX = 20;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - 60;
    const stepX = usableWidth / (n - 1 || 1);

    const points = [];
    for (let i = 0; i < n; i++) {
      const val = array[i];
      const ratio = (val - minVal) / (maxVal - minVal || 1);
      const x = paddingX + i * stepX;
      const y = height - 30 - ratio * usableHeight;
      points.push({ x, y, val, index: i });
    }

    // Connecting neon line
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();

    // Render Glowing Dots
    for (const pt of points) {
      const color = this.getBarColor(pt.val, minVal, maxVal, pt.index, n, state);
      const isComparing = state.comparing && state.comparing.includes(pt.index);
      const isSwapping = state.swapping && state.swapping.includes(pt.index);
      const isPivot = state.pivot === pt.index;

      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = isSwapping ? 18 : (isComparing ? 12 : 6);

      const radius = isSwapping ? 6.5 : (isComparing || isPivot ? 5.5 : 3.5);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Center bright core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Mode 4: Smooth Neon Waveform / Ribbon
   */
  renderWave(array, minVal, maxVal, state) {
    const { width, height, ctx } = this;
    const n = array.length;
    const paddingX = 16;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - 60;
    const stepX = usableWidth / (n - 1 || 1);

    const points = [];
    for (let i = 0; i < n; i++) {
      const val = array[i];
      const ratio = (val - minVal) / (maxVal - minVal || 1);
      const x = paddingX + i * stepX;
      const y = height - 30 - ratio * usableHeight;
      points.push({ x, y, val, index: i });
    }

    if (points.length < 2) return;

    // Draw Smooth Area Gradient
    ctx.save();
    const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
    areaGradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    areaGradient.addColorStop(1, 'rgba(15, 23, 42, 0.0)');

    ctx.fillStyle = areaGradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    ctx.lineTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fill();

    // Draw Glowing Spline
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
    ctx.restore();

    // Active Node Highlights
    for (const pt of points) {
      const isComparing = state.comparing && state.comparing.includes(pt.index);
      const isSwapping = state.swapping && state.swapping.includes(pt.index);
      if (isComparing || isSwapping) {
        const color = isSwapping ? '#ef4444' : '#f59e0b';
        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  drawTopPointer(x, y, color) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y - 6);
    ctx.lineTo(x + 4, y - 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawRoundedRect(x, y, width, height, radius) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  drawTooltip(data) {
    const { ctx } = this;
    const text = `Index ${data.index}: ${data.value}`;
    ctx.save();
    ctx.font = "600 12px 'Fira Code', monospace";
    const textWidth = ctx.measureText(text).width;
    const boxWidth = textWidth + 18;
    const boxHeight = 26;
    const boxX = Math.max(10, Math.min(this.width - boxWidth - 10, data.x - boxWidth / 2));
    const boxY = Math.max(10, data.y - boxHeight - 12);

    // Glass box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;

    this.drawRoundedRect(boxX, boxY, boxWidth, boxHeight, 6);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, boxX + boxWidth / 2, boxY + boxHeight / 2);
    ctx.restore();
  }

  darkenColor(rgbStr, factor) {
    const m = rgbStr.match(/\d+/g);
    if (!m || m.length < 3) return rgbStr;
    const r = Math.max(0, Math.floor(parseInt(m[0], 10) * factor));
    const g = Math.max(0, Math.floor(parseInt(m[1], 10) * factor));
    const b = Math.max(0, Math.floor(parseInt(m[2], 10) * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  colorToRgba(rgbStr, alpha) {
    const m = rgbStr.match(/\d+/g);
    if (!m || m.length < 3) return `rgba(59, 130, 246, ${alpha})`;
    return `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${alpha})`;
  }

  async playCompletionSweep(array, minVal, maxVal, soundEngine) {
    const n = array.length;
    const stepDelay = Math.max(4, Math.min(25, 750 / n));
    const sorted = [];

    for (let i = 0; i < n; i++) {
      sorted.push(i);
      this.render(array, minVal, maxVal, { sorted: [...sorted] });

      if (this.enableParticles && i % 3 === 0) {
        const paddingX = 12;
        const usableWidth = this.width - paddingX * 2;
        const barSpacing = n > 120 ? 1 : (n > 60 ? 2 : 3);
        const barWidth = Math.max(1, (usableWidth - (n - 1) * barSpacing) / n);
        const x = paddingX + i * (barWidth + barSpacing) + barWidth / 2;
        const normalizedHeight = ((array[i] - minVal) / (maxVal - minVal || 1)) * (this.height - 70) + 16;
        const y = this.height - 32 - normalizedHeight;
        this.spawnSparks(x, y, '#10b981', 4);
      }

      if (soundEngine && soundEngine.enabled) {
        soundEngine.playTone(array[i], minVal, maxVal, i, n, 25);
      }
      await new Promise(r => setTimeout(r, stepDelay));
    }

    if (soundEngine && soundEngine.enabled) {
      soundEngine.playCompletionChime();
    }
  }
}

window.Visualizer = Visualizer;
