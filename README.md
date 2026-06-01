# Houston: A Story of Homelessness

A scrollytelling project about homelessness in Houston. Built with Svelte + Vite and GSAP.

## Stack

- **Svelte 5** — component framework
- **Vite** — dev server and build tool
- **GSAP + ScrollTrigger** — animations and scroll-driven sequences
- **Roboto Mono** (Google Fonts, weight 300) — chapter label typography

## Getting started

```bash
npm install
npm run dev      # dev server at localhost:5173
npm run build    # production build → dist/
```

## Project structure

```
src/
  App.svelte              # root — composes all sections in order
  app.css                 # global reset + body styles
  main.js                 # Svelte mount
  components/
    SideNav.svelte        # fixed left nav spine + all GSAP/scroll logic
    Intro.svelte          # opening full-screen section
    Chapter.svelte        # reusable chapter section template
    Outro.svelte          # closing full-screen section
  lib/
    chapters.js           # chapter data (titles; body text to be added)
    navConfig.js          # shared nav geometry constants
```

## Navigation design

The left nav spine is a column of small green circles (`#a9d9ae`, 8px, 4 per cluster) connected by thin dark grey chapter-divider strokes (1px, 24px wide). A lime green indicator ball (`#80ff00`, 20px) travels behind the spine as you scroll.

- **Active chapter stroke**: 3px
- **Hover stroke**: 3px in lighter grey (`#7a7a7a`); chapter title appears to the left, vertical, rotated 180°
- **Click** on any stroke to smooth-scroll to that chapter

## Animations

| Trigger | Effect |
|---|---|
| Page load | Nav spine slides down into place (staggered, Y axis) |
| Scroll back to intro | Intro animation reverses |
| Reach outro section | Nav spine slides out upward (staggered); indicator travels down alone |
| Scroll back from outro | Outro animation reverses |
