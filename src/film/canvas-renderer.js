// Draws one frame full-screen on a 2D canvas, cover-fitted around a
// horizontal focus point. Redraws only when the frame or the canvas size
// changes.

const MAX_PIXEL_RATIO = 2;

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: false });
    this.last = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    this.canvas.width = Math.round(this.canvas.clientWidth * ratio);
    this.canvas.height = Math.round(this.canvas.clientHeight * ratio);
    this.context.imageSmoothingQuality = 'high';
    this.last = null;
  }

  // `frame` is `{ image, focusX }` or null while nothing has loaded.
  draw(frame) {
    if (!frame || frame.image === this.last) return;
    this.last = frame.image;

    const { image, focusX } = frame;
    const { width, height } = this.canvas;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    this.context.drawImage(
      image,
      (width - drawWidth) * focusX,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
  }
}
