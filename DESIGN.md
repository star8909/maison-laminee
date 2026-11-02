# Maison Laminée — design system

The name means laminated, so the name is the monument: set margin to margin under a
film of dough becoming a croissant, and returned at full width in the footer.
Direction dealt by taste-skill ("The name as a monument"); motion rules from Emil
Kowalski's design-eng skill; quality floor and finish review from Impeccable. The
direction contract lives in `.impeccable/surface-brief.md`.

## Colour

One ground, one ink, one accent. Gold appears on the action only.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0c0a08` | Page ground, story band |
| `--surface` | `#181512` | Tone step between display rows; film placeholder |
| `--ink` | `#ffffff` | All text on the ground |
| `--muted` | `#9a958e` | Secondary text (oven times in the price list) |
| `--accent` | `#c9a45a` | The action: hero button, directions row |
| `--accent-ink` | `#0c0a08` | Text on the accent |
| `--paper` / `--paper-ink` / `--paper-muted` | `#ffffff` / `#0c0a08` / `#5f5a54` | The inverted footer |

Text over the film takes its ink (`--film-ink`) from the film itself: the renderer
measures the relative luminance under that text after every frame (the navigation's
corner on wider screens, the upper half on a phone), and the ink is white below 0.18
and `--bg` above (the contrast crossover between the two).

## Type

| Face | Use |
|---|---|
| Imbue 400, uppercase | The name, chapter titles, section titles, display rows |
| Albert Sans 400 / 500 | Everything read |

Five steps, plus the name, which is sized to the width it fills:

| Token | Value |
|---|---|
| `--step-small` | `clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)` |
| `--step-body` | `clamp(1.125rem, 1.05rem + 0.2vw, 1.1875rem)` |
| `--step-head` | `clamp(2rem, 1.3rem + 3.2vw, 4rem)` |
| `--step-display` | `clamp(3.25rem, 1.5rem + 8vw, 10rem)` |
| name | `(100vw − 2 × margin) / width in ems` |

Measured widths of the name in Imbue at −0.02em tracking: "MAISON LAMINÉE" 4.44em,
"MAISON" 2.00em, "LAMINÉE" 2.30em (the divisors add 1% to spare). The name is one
line on wider screens; on a phone it breaks onto two lines, each word filling the width.

## Space and grid

- Twelve columns, `--margin` and `--gap` 24px (16px under 600px).
- Sections are `clamp(120px, 14vw, 220px)` apart.
- Square corners everywhere. No rules, borders, shadows, gradients or labels above headings.
- Surfaces are told apart by a tone step (`--bg` / `--surface`), never a line.

## Layout

| Part | Composition |
|---|---|
| Story stage | Film in the top 58% with copy in the dark band below and progress on the seam; on a phone the film fills the screen, copy sits over its clear upper half and progress runs along the bottom |
| First screen | One sentence and the gold "Get directions" button on one row; the name across the bottom. On a phone the name stands across the top on two lines, the sentence and button at the foot |
| Process | Three photographs down a falling diagonal from 900px; stacked at 100% / 62% right / 78% left below |
| Counter | Statement heading, price table in columns 8–12, photograph in 1–4 bottom-aligned |
| Visit | Full-width display rows on alternating tones; the trays row is live; the last row is the directions link |
| Footer | Inverted; four columns, then the name filling the width |

## Motion

| Move | Rule |
|---|---|
| Signature | The name settles from 1 to 0.94 while the first clip plays; the footer name grows 0.94 to 1 as it arrives |
| Film | Scroll-scrubbed frame sequence, one clip per chapter |
| Chapter copy | Lines rise from a mask (expo out, 70ms stagger); swaps instantly with reduced motion |
| Section reveals | Process and counter only; position only (32px rise), never opacity, so content is never hidden |
| Photographs | Drift ±6% vertically inside an 8% overscan |
| Controls | `scale(0.97)` on press at 160ms `cubic-bezier(0.23, 1, 0.32, 1)`; hover effects only under `(hover: hover) and (pointer: fine)` |

All movement is transform-only and is dropped under `prefers-reduced-motion`.

## Browser surfaces

Selection in gold (inverted in the footer), gold caret, gold 2px focus ring with 3px
offset, scrollbar in `--muted` on `--bg`, underline offset 0.22em, tabular figures in
the price list.

## Rasters and provenance

| File | Origin |
|---|---|
| `src/assets/clips/*/*/frame_*.webp` | Frames of the Seedance 2.0 Mini clips defined in `story.config.mjs` (`npm run generate`) |
| `src/assets/process-dough.webp` | Crop 780×1040 at (186, 780) of `generated/stills/portrait/dough.png` (GPT Image 2.5 Flare, prompt `dough` in `story.config.mjs`) |
| `src/assets/process-laminated.webp` | Crop 820×820 at (166, 880) of `generated/stills/portrait/laminated.png` (prompt `laminated`) |
| `src/assets/process-baked.webp` | Crop 1152×720 at (0, 930) of `generated/stills/portrait/baked.png` (prompt `baked`) |
| `src/assets/counter-broken.webp` | Crop 1060×1325 at (46, 600) of `generated/stills/portrait/broken.png` (prompt `broken`) |

Crops were made with ffmpeg, `-c:v libwebp -quality 82`.

## Sample content

Prices, oven tray times ("From 7:00", `data-trays`) and ingredient details (Normandy
butter, 82 % fat) are samples for the client to confirm; the footer says so.
