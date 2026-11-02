// Draws one frame on a 2D canvas, cover-fitted around the frame's focus
// point. Redraws only when the frame or the canvas size changes. After each
// draw it measures how bright the canvas is under an optional probe region
// (fractions of the canvas), so text laid over the film can pick its ink.

const MAX_PIXEL_RATIO = 2;

export class CanvasRenderer {
  // `probe` is `{ x, y, width, height }` in fractions of the canvas, or null.
  constructor(canvas, { probe = null } = {}) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: false });
    this.probe = probe;
    // One pixel the probe region is shrunk into to read its average colour.
    this.sampler = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    this.sampler.canvas.width = 1;
    this.sampler.canvas.height = 1;
    // Relative luminance (0–1) under the probe after the last draw.
    this.probeLuminance = null;
    this.last = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  // Reallocating the canvas clears it, so it only happens when the drawing
  // size actually changes (mobile toolbars fire resize events while scrolling).
  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const width = Math.round(this.canvas.clientWidth * ratio);
    const height = Math.round(this.canvas.clientHeight * ratio);
    if (width === this.canvas.width && height === this.canvas.height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.context.imageSmoothingQuality = 'high';
    this.last = null;
  }

  // `frame` is `{ image, focus }` or null while nothing has loaded.
  draw(frame) {
    if (!frame || frame.image === this.last) return;
    this.last = frame.image;

    const { image, focus } = frame;
    const { width, height } = this.canvas;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    this.context.drawImage(
      image,
      (width - drawWidth) * focus.x,
      (height - drawHeight) * focus.y,
      drawWidth,
      drawHeight,
    );
    if (this.probe) this.probeLuminance = this.measureProbe();
  }

  // Moves the probe; the next frame drawn is measured there.
  setProbe(probe) {
    this.probe = probe;
    this.last = null;
  }

  measureProbe() {
    const { width, height } = this.canvas;
    const { x, y, width: probeWidth, height: probeHeight } = this.probe;
    this.sampler.drawImage(
      this.canvas,
      x * width,
      y * height,
      Math.max(1, probeWidth * width),
      Math.max(1, probeHeight * height),
      0,
      0,
      1,
      1,
    );
    const [red, green, blue] = this.sampler.getImageData(0, 0, 1, 1).data;
    const linear = (channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
  }
}
