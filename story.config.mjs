// Art direction and generation settings for the croissant story.
//
// The page plays one continuous film: each clip runs from one still to the
// next (Seedance first and last frame), so consecutive clips meet on the same
// image and the scroll never cuts. Clip ids must match the `data-clip`
// attributes in index.html.

// Appended to every still prompt so all stills share one look.
export const style =
  'premium editorial food photography for an artisan bakery, photorealistic, ' +
  'soft diffused light from the upper left, gentle natural shadow, 85mm lens, ' +
  'slight high-angle three-quarter view, the subject in sharp focus, minimal and calm, ' +
  'no hands, no people, no utensils, no text, no lettering, no watermark';

// Added to every still that is painted from earlier stills, so the camera and
// light stay locked while the subject changes.
export const continuity =
  'Keep the exact camera angle, lens, framing, subject size and position, lighting and ' +
  'photographic style of the reference photo; change only what is described:';

// Every still and clip is rendered once per format; the page plays the format
// that matches the screen's orientation. `composition` is added to still prompts.
export const formats = {
  landscape: {
    composition:
      'wide 16:9 composition, the subject small and whole, about a quarter of the frame width, ' +
      'centred about 62% across the frame, generous empty backdrop all around it, ' +
      'the left 40% of the frame completely empty',
    imageSize: '2048x1152',
    videoResolution: '1080p-SR',
    videoRatio: '16:9',
    frameWidth: 1920,
  },
  portrait: {
    composition:
      'tall vertical 9:16 composition, the subject small and whole, about half the frame width, ' +
      'centred in the lower half of the frame, the upper half completely empty backdrop',
    imageSize: '1152x2048',
    videoResolution: '1080p-SR',
    videoRatio: '9:16',
    frameWidth: 1080,
  },
};

// Stills are painted in this format first; the other formats recompose them.
export const sourceFormat = 'landscape';

const CREAM_BACKDROP = 'on a seamless warm ivory paper backdrop that fills the whole frame';

// Key moments of the story, in order. `from` lists earlier stills used as
// references (the first one sets camera and light).
export const stills = [
  {
    id: 'dough',
    prompt: `A smooth round ball of pale croissant dough lightly dusted with flour, ${CREAM_BACKDROP}.`,
  },
  {
    id: 'butter',
    from: ['dough'],
    prompt:
      'The dough is now rolled into a smooth flat rectangular sheet, with a neat cold block ' +
      `of pale yellow butter resting in its centre, ${CREAM_BACKDROP}.`,
  },
  {
    id: 'laminated',
    from: ['butter'],
    prompt:
      'The dough sheet is now folded over the butter into a thick rectangular slab, its cut ' +
      'front edge showing many thin alternating layers of dough and butter, ' +
      `${CREAM_BACKDROP}.`,
  },
  {
    id: 'shaped',
    from: ['laminated'],
    prompt:
      'The slab is now a single raw unbaked croissant, rolled from a triangle into a gentle ' +
      `crescent with clear spiral ridges, pale and matte, ${CREAM_BACKDROP}.`,
  },
  {
    id: 'baked',
    from: ['shaped'],
    prompt:
      'The croissant is now fully baked: puffed up, deep golden brown, glossy and flaky. ' +
      'The setting has turned into a dark warm oven: a black slate surface and a deep ' +
      'charcoal background with a soft amber glow of heat behind the croissant.',
  },
  {
    id: 'broken',
    from: ['baked', 'dough'],
    prompt:
      'Take the golden croissant from the first reference and the ivory backdrop and light of ' +
      'the second: the croissant is now torn into two halves pulled slightly apart, revealing ' +
      'an airy honeycomb interior of thin buttery layers, a few golden flakes scattered ' +
      `beneath, ${CREAM_BACKDROP}.`,
  },
];

// Each clip animates from one still to the next. A clip that starts where an
// earlier clip ends is animated from that clip's actual last frame, so the
// film never jumps; its `to` still guides where the motion lands.
export const clips = [
  {
    id: 'rolling',
    from: 'dough',
    to: 'butter',
    motion:
      'The dough ball slowly presses down and spreads into a flat sheet, then a block of butter ' +
      'gently lowers onto its centre.',
  },
  {
    id: 'folding',
    from: 'butter',
    to: 'laminated',
    motion:
      'The edges of the dough sheet lift and fold over the butter like a letter, pressing into ' +
      'a layered slab.',
  },
  {
    id: 'shaping',
    from: 'laminated',
    to: 'shaped',
    motion:
      'The layered slab stretches into a long triangle that rolls itself up into a crescent ' +
      'croissant. The dough stays pale, raw and unbaked throughout.',
  },
  {
    id: 'baking',
    from: 'shaped',
    to: 'baked',
    motion:
      'The light dims into a warm dark oven glow, the croissant slowly rises and puffs up as ' +
      'its surface turns deep golden brown.',
  },
  {
    id: 'breaking',
    from: 'baked',
    to: 'broken',
    motion:
      'The croissant gently tears in two, flakes drifting down, revealing its layered ' +
      'honeycomb interior as the scene brightens back to soft daylight.',
  },
];

// Single images used as page decoration (not part of the film), written to
// src/assets/<id>.webp. The page's photographs are crops of the film's stills
// instead (see DESIGN.md), so none are needed.
export const extras = [];

export const imageSettings = {
  model: 'openai/gpt-image-2.5-flare/text-to-image',
  editModel: 'openai/gpt-image-2.5-flare/edit',
  quality: 'high',
};

export const videoSettings = {
  model: 'bytedance/seedance-2.0-mini/image-to-video',
  duration: 5,
  generateAudio: false,
  // Appended to every clip's motion prompt.
  motionStyle:
    'Static locked-off camera, smooth continuous motion. No hands, no people and no tools ' +
    'ever appear; the ingredients move and transform by themselves.',
};

// Scroll playback frames written to src/assets/clips/<id>/<format>/.
export const frameSettings = {
  fps: 24,
  quality: 80,
};

// Atlas Cloud list prices (October 2026), used only for the pre-run estimate.
// Check https://www.atlascloud.ai/models for current rates.
export const estimatePricing = {
  imageUsd: 0.03,
  videoUsdPerSecond: 0.045,
};
