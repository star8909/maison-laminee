import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './style.css';
import { CanvasRenderer } from './film/canvas-renderer.js';
import { SceneTrack } from './film/scene-track.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Frames written by `npm run generate`, resolved at build time and grouped by
// clip and format folder in file-name order:
// src/assets/clips/<clip>/<format>/frame_0001.webp
const frameModules = import.meta.glob('./assets/clips/*/*/frame_*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});
const FRAMES = Object.keys(frameModules)
  .sort()
  .reduce((frames, key) => {
    const [clip, format] = key.split('/').slice(-3, -1);
    ((frames[clip] ??= {})[format] ??= []).push(frameModules[key]);
    return frames;
  }, {});

// Portrait screens play the 9:16 renders, every other screen the 16:9 ones.
const FORMATS = ['landscape', 'portrait'];
const portraitQuery = window.matchMedia('(orientation: portrait)');
const currentFormat = () => (portraitQuery.matches ? 'portrait' : 'landscape');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// One track per clip, in chapter order. A clip missing the requested format
// plays whichever format it has, so a partially generated set still plays.
function createTracks(clipIds, format) {
  return clipIds.map((id) => {
    const available = FRAMES[id] ?? {};
    const used = available[format] ? format : FORMATS.find((other) => available[other]);
    if (used !== format) {
      console.warn(
        `Clip "${id}" has no ${format} frames yet${used ? `; playing ${used}` : ''}. ` +
          `Run: npm run generate -- --format ${format}`,
      );
    }
    return new SceneTrack(id, used ? available[used] : [], 0.5);
  });
}

// Loads every clip's first and last frames up front so chapter boundaries
// are never blank, then fills in the clips in story order.
async function preload(tracks) {
  for (const track of tracks) {
    if (!track.isEmpty) await track.loadFrames([0, track.urls.length - 1]);
  }
  for (const track of tracks) {
    await track.loadFrames(track.urls.map((_, index) => index));
  }
}

function setupSmoothScroll() {
  if (prefersReducedMotion) return null;

  const lenis = new Lenis({ anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

// Each chapter scrubs its clip from 'top top' to 'bottom top', so the
// chapters tile the scroll without gaps. Chapters after the last clip hold
// its final frame.
function createFilm(chapters, renderer) {
  const triggers = chapters.map((chapter) =>
    ScrollTrigger.create({ trigger: chapter, start: 'top top', end: 'bottom top' }),
  );
  let tracks = [];

  return {
    useTracks(next) {
      tracks = next;
    },
    render() {
      if (tracks.length === 0) return;
      const index = Math.max(0, triggers.findLastIndex((trigger) => trigger.progress > 0));
      const track = tracks[Math.min(index, tracks.length - 1)];
      const progress = index < tracks.length ? triggers[index].progress : 1;
      renderer.draw(track.frameAt(progress));
    },
  };
}

// Shows one chapter's copy at a time, in the same place and over the same
// scroll range as its clip, and mirrors the chapter's tone and copy alignment
// on the root element for the colours and the scrim.
function setupChapters(chapters, lenis) {
  const progress = document.querySelector('[data-progress]');
  const dots = chapters.map((chapter, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'progress__dot';
    dot.setAttribute('aria-label', chapter.querySelector('.chapter__title').innerText.replace(/\s+/g, ' '));
    dot.addEventListener('click', () => {
      const top = chapter.offsetTop + (index === 0 ? 0 : 1);
      if (lenis) lenis.scrollTo(top, { duration: 1.6 });
      else window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
    progress.append(dot);
    return dot;
  });

  const copies = chapters.map((chapter) => chapter.querySelector('[data-copy]'));
  gsap.set(copies.slice(1), { autoAlpha: 0 });

  const reveals = copies.map((copy) => {
    const parts = copy.querySelectorAll('.eyebrow, .chapter__body, .btn');
    const split = SplitText.create(copy.querySelector('[data-lines]'), {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
    });
    return () => {
      if (prefersReducedMotion) return;
      gsap.fromTo(split.lines, { yPercent: 100 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: 'expo.out' });
      gsap.fromTo(parts, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, delay: 0.15, ease: 'power3.out' });
    };
  });

  let active = 0;
  const activate = (index) => {
    if (index === active) return;
    gsap.to(copies[active], { autoAlpha: 0, duration: 0.35, ease: 'power2.out', overwrite: true });
    gsap.to(copies[index], { autoAlpha: 1, duration: 0.35, ease: 'power2.out', overwrite: true });
    reveals[index]();
    dots[active].removeAttribute('aria-current');
    dots[index].setAttribute('aria-current', 'step');
    document.documentElement.dataset.tone = chapters[index].dataset.tone ?? 'light';
    document.documentElement.dataset.align = chapters[index].dataset.align ?? 'left';
    active = index;
  };
  dots[0].setAttribute('aria-current', 'step');

  chapters.forEach((chapter, index) => {
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top top',
      end: 'bottom top',
      onToggle: (self) => self.isActive && activate(index),
    });
  });

  reveals[0]();
}

// The butter swatch slides off to the right as the first clip starts.
function animateHeroPanel() {
  gsap.to('[data-panel]', {
    xPercent: 100,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: '[data-clip]', start: 'top top', end: '35% top', scrub: 1 },
  });
}

async function init() {
  await document.fonts.ready;

  const chapters = gsap.utils.toArray('.chapter');
  const clipIds = chapters.map((chapter) => chapter.dataset.clip).filter(Boolean);
  const tracksByFormat = new Map();
  const tracksFor = (format) => {
    if (!tracksByFormat.has(format)) tracksByFormat.set(format, createTracks(clipIds, format));
    return tracksByFormat.get(format);
  };

  const film = createFilm(chapters, new CanvasRenderer(document.querySelector('[data-film]')));
  film.useTracks(tracksFor(currentFormat()));
  gsap.ticker.add(() => film.render());
  preload(tracksFor(currentFormat()));

  // Rotating the device switches to the other format's frames.
  portraitQuery.addEventListener('change', () => {
    film.useTracks(tracksFor(currentFormat()));
    preload(tracksFor(currentFormat()));
  });

  const lenis = setupSmoothScroll();
  setupChapters(chapters, lenis);
  animateHeroPanel();
}

init();
