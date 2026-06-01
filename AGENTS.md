# Agent context — Houston scrollytelling

This file is the primary reference for AI agents working on this project.
Keep it current whenever components, conventions, or decisions change.

---

## What this is

A long-form scrollytelling piece about homelessness in Houston.
Single-page, no routing. Content is structured as 12 chapters with a fixed left navigation.

## Tech stack

| Tool | Version | Role |
|---|---|---|
| Svelte | 5 | UI components, reactivity |
| Vite | 8 | Build + HMR |
| GSAP | 3.12 | All animations |
| ScrollTrigger | 3.12 | Scroll-driven animation triggers |
| Roboto Mono 300 | Google Fonts | Chapter label type in nav |

## Component map

```
App.svelte
├── SideNav.svelte     — fixed nav, all scroll + GSAP logic lives here
├── Intro.svelte       — full-screen opening section (100vh)
├── Chapter.svelte     — receives { index, title } props; one instance per chapter
└── Outro.svelte       — full-screen closing section (100vh)
```

## Key data files

- `src/lib/chapters.js` — array of `{ title }` objects; body text/media will be added here
- `src/lib/navConfig.js` — nav geometry constants (dot size, cluster height, unit step)

## Nav geometry (navConfig.js)

| Constant | Value | Meaning |
|---|---|---|
| `DOT_SIZE` | 8px | diameter of each small circle |
| `DOT_GAP` | 1px | gap between touching dots in a cluster |
| `DOTS_PER_CLUSTER` | 4 | dots per chapter boundary cluster |
| `CLUSTER_HEIGHT` | 35px | total height of one cluster (4×8 + 3×1) |
| `LINE_CONTAINER` | 10px | default nav-line container height (equal chapters) |
| `UNIT` | 45px | default step size when all chapters are equal length |

### Proportional line heights

Nav-line heights are **not fixed** — they are computed on mount by `measureAndBuild()` in `SideNav.svelte`:

1. Measure each `.chapter` element's pixel height via `getBoundingClientRect()`
2. Distribute a fixed total budget (`NUM_CHAPTERS × 8px`) proportionally across the 12 lines
3. Floor each line at `MIN_LINE_HEIGHT = 4px` so no chapter disappears entirely
4. Apply via `line.style.height`

This makes the nav a minimap of the page: longer chapters get taller divider strokes.

### Indicator position

`navPositions` is a `(NUM_CHAPTERS + 1)`-length array of Y-centers for each cluster boundary, built from the actual (possibly variable) line heights:

```
positions[0] = CLUSTER_HEIGHT / 2
positions[i+1] = positions[i] + CLUSTER_HEIGHT + 2 + lineHeights[i]
```

Indicator Y during scroll:
```
y = navPositions[activeChapter]
  + progressInChapter * (navPositions[activeChapter + 1] - navPositions[activeChapter])
```

The outro timeline's target `top` is also derived from `navPositions[NUM_CHAPTERS] + 70` and is built lazily on first trigger so it always uses the measured values.

## Animation behaviour

### Intro (on load, reversible)
- Initial state: all `.nav-cluster` and `.nav-line` elements at `opacity: 0, y: -10`
- GSAP timeline staggers them to `opacity: 1, y: 0` (0.035s each, power3.out)
- ScrollTrigger on `#intro`: `onEnterBack` → reverse, `onLeave` → play

### Outro (on reaching `#outro`, reversible)
- `.nav-cluster` and `.nav-line` stagger to `opacity: 0, y: -10`
- Indicator animates to `OUTRO_INDICATOR_END = NUM_CHAPTERS * UNIT + CLUSTER_HEIGHT / 2 + 70`
- `outroActive` flag prevents the scroll handler from fighting GSAP during this phase
- ScrollTrigger on `#outro`: `onEnter` → play, `onLeaveBack` → reverse

### Chapter scroll tracking
- `updateNav()` runs on every scroll event (passive)
- Skipped entirely when `outroActive === true`
- Finds which chapter's bounding box contains `window.innerHeight / 2`
- Sets indicator `top` and toggles `.active` class on the matching nav-line

## Nav interaction

- **Hover** on a `.nav-line`: stroke thickens to 3px (lighter grey `#7a7a7a`); chapter title fades in to the left, vertical, rotated 180° (reads bottom-up), Roboto Mono 300
- **Click** on a `.nav-line`: `scrollIntoView({ behavior: 'smooth' })` to that chapter
- Hover area extended via transparent `::before` pseudo-element (`inset: -16px -20px`)
- Active chapter stroke: 3px, `#4a4a4a`; takes precedence over hover via CSS source order

## Colour palette

| Token | Value | Use |
|---|---|---|
| Background | `#d6dfe6` | page background |
| Dot fill | `#a9d9ae` | nav spine circles |
| Stroke (default) | `#4a4a4a` | chapter divider lines |
| Stroke (hover) | `#7a7a7a` | hovered chapter line |
| Indicator | `#80ff00` | travelling position ball |

## Conventions

- Chapter body text and any media go in `src/lib/chapters.js` as additional fields on each chapter object; `Chapter.svelte` is updated to render them
- New animated sections (data vis, pull quotes, etc.) become new components imported in `App.svelte`
- GSAP ScrollTriggers are created and destroyed inside `onMount` / cleanup in `SideNav.svelte`; section-specific animations belong in their own component's `onMount`
- Do not add a router — this is intentionally a single long-scroll page
- `npm run build` must pass cleanly before considering any change done
