# Sorting Visualizer (.io) - Modern Web Application

An interactive, high-performance web application for visualizing sorting algorithms with real-time Web Audio API sound synthesis, HSV rainbow gradients, and live metrics.

This project is a modern web reincarnation of the original desktop application [CaptanJackSparr0w/Sorting-Visualiser.io](https://github.com/CaptanJackSparr0w/Sorting-Visualiser.io).

---

## 🔍 Comparative Analysis: Original Python App vs. New Web App

| Feature / Dimension | Original Local App (`Sorting-Visualiser.io`) | New Web Application |
| :--- | :--- | :--- |
| **Platform** | Desktop (Windows / Local Python runtime) | Any modern web browser (Desktop & Mobile) |
| **Tech Stack** | Python 3 + `tkinter` (`Tk`, `Canvas`, `Scale`, `_thread`) | HTML5 + Modern CSS3 + Vanilla ES6 JS (Zero build dependencies) |
| **Color Rendering** | Canvas rectangles with `colorsys.hsv_to_rgb` | Hardware-accelerated HTML5 Canvas 2D with dynamic rainbow HSV & multi-theme palettes |
| **Audio Engine** | Windows-dependent `winsound.PlaySound` (local `.wav` files) | Cross-platform **Web Audio API** oscillator synthesizer with pitch frequency mapping |
| **Concurrency / Control** | Python low-level `_thread` + `time.sleep` | Non-blocking **async/await** animation engine with Pause, Resume, Single-Step, and Reset |
| **Input Configurations** | Size, Speed, Min Value, Max Value | Size, Speed, Min/Max bounds, plus Array Presets (Random, Nearly Sorted, Reversed, Few Unique, Sawtooth) |
| **Telemetry & Metrics** | Visual-only canvas | Live Comparison & Swap counters, millisecond Timer, and Active Phase inspector |
| **Educational Reference** | Visual bars only | Live Time/Space complexity badges, stability indicators, and algorithm pseudocode |

---

## 🚀 Key Features

1. **Complete Algorithm Suite**:
   - **Bubble Sort**: Adjacent element comparison and bubble-up logic.
   - **Selection Sort**: Minimum element searching and positional placement.
   - **Insertion Sort**: Shift-and-insert mechanism into the sorted partition.
   - **Merge Sort**: Divide-and-conquer sub-array merging with auxiliary tracking.
   - **Quick Sort**: Partitioning around dynamic pivot elements.
   - **Bogo Sort (Random Sort)**: Permutation shuffle iteration matching the original repo's implementation.
   - *Bonus Additions*: **Heap Sort** and **Shell Sort**.

2. **Web Audio Synthesizer**:
   - Replaces Windows `winsound` with browser-native Web Audio API.
   - Pitch frequency exponential curve mapped to bar values ($150\text{ Hz} - 950\text{ Hz}$).
   - Harmonic double-tones during comparisons.
   - Selectable waveforms (Sine, Triangle, Sawtooth, Square) and volume envelopes.

3. **Rainbow HSV & Custom Themes**:
   - **Original Rainbow HSV**: Accurate hue gradient computed via HSV-to-RGB conversion.
   - **Cyberpunk Neon**: High-contrast synthwave palette.
   - **Aurora Borealis**: Teal and emerald green northern lights styling.
   - **Sunset Glow**: Warm ember and sunset gradients.
   - **Matrix Terminal**: Retro green monochrome monitor style.

4. **Execution & Step-by-Step Debugging**:
   - **Start / Sort**: Runs the algorithm at the chosen speed.
   - **Pause / Resume**: Non-blocking asynchronous pause without freezing the UI.
   - **Step Forward**: Single-step comparison/swap debugger mode.
   - **Reset**: Instantly aborts any running routine and reinitializes the canvas.
   - **Dynamic Speed**: Real-time adjustable delay slider (1 ms to 200 ms).

5. **Keyboard Shortcuts**:
   - `Space`: Start / Pause / Resume
   - `G`: Generate new array
   - `S`: Start sorting
   - `R`: Reset canvas
   - `M`: Toggle audio mute

---

## 💻 How to Run Locally

Because the project is built with standard Web APIs and vanilla ES6 JavaScript, **no npm install or build step is required**.

### Option 1: Direct File Opening
Double-click `index.html` or open it directly in any modern browser (Chrome, Firefox, Safari, Edge).

### Option 2: Local HTTP Server (Python / Node / VS Code Live Server)

Using Python:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

Using Node `npx serve`:
```bash
npx serve .
```

---

## 🌐 Free Instant Deployment

### 1. GitHub Pages (1-click)
1. Push this repository to GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **Deploy from a branch** (`main` / root `/`).
4. Your web application is instantly live at `https://<username>.github.io/<repo-name>/`!

### 2. Vercel / Netlify / Cloudflare Pages
- Import the GitHub repository; standard static site detection will deploy it with zero configuration needed.

---

## 📄 License & Credits
- Ported and enhanced from [CaptanJackSparr0w/Sorting-Visualiser.io](https://github.com/CaptanJackSparr0w/Sorting-Visualiser.io).
- Open-source under the MIT License.
