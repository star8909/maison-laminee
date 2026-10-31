// One scene's frame sequence: loads frames in the background and returns the
// frame nearest to a playback position, falling back to the closest frame
// that has finished loading.

export class SceneTrack {
  constructor(id, urls, focusX) {
    this.id = id;
    this.urls = urls;
    this.images = new Array(urls.length).fill(null);
    this.focusX = focusX;
  }

  get isEmpty() {
    return this.urls.length === 0;
  }

  // Returns `{ image, focusX }` for `progress` in 0–1, or null before any
  // frame has loaded.
  frameAt(progress) {
    if (this.isEmpty) return null;
    const clamped = Math.min(1, Math.max(0, progress));
    const image = this.nearestLoaded(Math.round(clamped * (this.urls.length - 1)));
    return image ? { image, focusX: this.focusX } : null;
  }

  nearestLoaded(index) {
    for (let offset = 0; offset < this.images.length; offset++) {
      const before = this.images[index - offset];
      if (before) return before;
      const after = this.images[index + offset];
      if (after) return after;
    }
    return null;
  }

  // Loads the given frame indices with limited concurrency. Frames that fail
  // are reported and skipped; playback falls back to their neighbours.
  async loadFrames(indices, concurrency = 6) {
    const pending = indices.filter((index) => !this.images[index]);
    const failures = [];

    const worker = async () => {
      while (pending.length > 0) {
        const index = pending.shift();
        try {
          this.images[index] = await loadImage(this.urls[index]);
        } catch (error) {
          failures.push({ url: this.urls[index], error });
        }
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));

    if (failures.length > 0) {
      console.error(`[${this.id}] ${failures.length} frame(s) failed to load`, failures);
    }
  }
}

async function loadImage(url) {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}
