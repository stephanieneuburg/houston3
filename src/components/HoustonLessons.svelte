<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  const COLS = 14, ROWS = 9;
  const DOT_R = 8, GAP = 4, STEP = DOT_R * 2 + GAP;
  const SVG_W = 560, SVG_H = 320;
  const offX = (SVG_W - COLS * STEP) / 2;
  const offY = (SVG_H - ROWS * STEP) / 2;

  function buildHouseGrid(cols, rows) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    const roofRows = Math.floor(rows * 0.38);
    const bodyStart = roofRows;

    for (let r = 0; r < roofRows; r++) {
      const indent = Math.round((roofRows - 1 - r) / (roofRows - 1) * (cols / 2 - 1));
      for (let c = indent; c < cols - indent; c++) grid[r][c] = 1;
    }
    for (let r = bodyStart; r < rows; r++) {
      for (let c = 0; c < cols; c++) grid[r][c] = 1;
    }

    const doorW = Math.round(cols * 0.12);
    const doorH = Math.round((rows - bodyStart) * 0.44);
    const doorL = Math.round(cols / 2 - doorW / 2);
    for (let r = rows - doorH; r < rows; r++) {
      for (let c = doorL; c < doorL + doorW; c++) grid[r][c] = 0;
    }

    const winW = Math.round(cols * 0.1);
    const winH = Math.round((rows - bodyStart) * 0.28);
    const winTopRow = bodyStart + Math.round((rows - bodyStart) * 0.15);
    const win1L = Math.round(cols * 0.13);
    const win2L = cols - win1L - winW;
    for (let r = winTopRow; r < winTopRow + winH; r++) {
      for (let c = win1L; c < win1L + winW; c++) grid[r][c] = 0;
      for (let c = win2L; c < win2L + winW; c++) grid[r][c] = 0;
    }

    return grid;
  }

  const houseGrid = buildHouseGrid(COLS, ROWS);

  const dots = [];
  {
    const cr = (ROWS - 1) / 2, cc = (COLS - 1) / 2;
    const maxDist = Math.sqrt(cr * cr + cc * cc) || 1;
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (houseGrid[r][c] === 1) {
          const targetX = offX + (c + 0.5) * STEP;
          const targetY = offY + (r + 0.5) * STEP;
          const t = Math.sqrt((r - cr) ** 2 + (c - cc) ** 2) / maxDist;
          const jitter = (Math.sin(r * 17.3 + c * 31.7) - 0.5) * 0.18;
          const brightness = Math.min(1.15, Math.max(0.28, 0.48 + t * 0.57 + jitter));
          const startX = DOT_R + ((Math.sin(i * 17.3 + 31.7) + 1) / 2) * (SVG_W - DOT_R * 2);
          const startY = DOT_R + ((Math.sin(i * 13.1 + 7.9)  + 1) / 2) * (SVG_H - DOT_R * 2);
          dots.push({ targetX, targetY, startX, startY, brightness });
          i++;
        }
      }
    }
  }

  let sectionEl, svgEl, quoteEl, col1El, col2El, col3El;
  const proxy = { t: 0 };

  function power2InOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function moveDots() {
    const ep = power2InOut(Math.min(1, proxy.t / 0.55));
    const circles = svgEl.querySelectorAll('circle');
    for (let i = 0; i < dots.length; i++) {
      const { startX, startY, targetX, targetY } = dots[i];
      circles[i].setAttribute('cx', startX + (targetX - startX) * ep);
      circles[i].setAttribute('cy', startY + (targetY - startY) * ep);
    }
  }

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set(quoteEl, { opacity: 0, y: 12 });
    gsap.set([col1El, col2El, col3El], { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        pin: true,
        start: 'top top',
        end: '+=5000',
        scrub: 1,
        anticipatePin: 1,
      },
    });

    tl
      .to(proxy, { t: 1, duration: 10, ease: 'none', onUpdate: moveDots })
      .to(quoteEl, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, 5.0)
      .to(col1El,  { opacity: 1, y: 0, duration: 2.0, ease: 'power2.out' }, 5.5)
      .to(col2El,  { opacity: 1, y: 0, duration: 2.0, ease: 'power2.out' }, 6.5)
      .to(col3El,  { opacity: 1, y: 0, duration: 2.0, ease: 'power2.out' }, 7.5);

    return () => tl.kill();
  });
</script>

<section class="hl-section" bind:this={sectionEl}>
  <div class="hl-svg-wrap">
    <svg
      bind:this={svgEl}
      viewBox="0 0 {SVG_W} {SVG_H}"
      class="hl-svg"
      role="img"
      aria-label="Dots assembling from scattered positions into a house shape"
    >
      {#each dots as dot}
        <circle
          cx={dot.startX}
          cy={dot.startY}
          r={DOT_R}
          style="fill: var(--dot-color, #a9d9ae); filter: brightness({dot.brightness.toFixed(3)})"
        />
      {/each}
    </svg>
    <p class="hl-quote" bind:this={quoteEl}>
      "it was not morality that changed the system — but structure."
    </p>
  </div>

  <div class="hl-principles">
    <div class="hl-principle" bind:this={col1El}>
      <p class="hl-principle-number">01</p>
      <p class="hl-principle-statement">House first, fix later.</p>
      <p class="hl-principle-sub">Housing First: no sobriety or "readiness" test before the apartment</p>
    </div>
    <div class="hl-divider"></div>
    <div class="hl-principle" bind:this={col2El}>
      <p class="hl-principle-number">02</p>
      <p class="hl-principle-statement">Shorten the path, not just the line.</p>
      <p class="hl-principle-sub">Cutting the wait, not managing the queue</p>
    </div>
    <div class="hl-divider"></div>
    <div class="hl-principle" bind:this={col3El}>
      <p class="hl-principle-number">03</p>
      <p class="hl-principle-statement">Aligned, not unified.</p>
      <p class="hl-principle-sub">Tasks distributed, data shared — nobody had to become the same</p>
    </div>
  </div>
</section>

<style>
  .hl-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 80px;
    gap: 48px;
    overflow: hidden;
  }

  .hl-svg-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .hl-svg {
    display: block;
    width: 100%;
    max-width: 560px;
    height: auto;
    overflow: visible;
  }

  .hl-quote {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 1.4rem;
    font-style: italic;
    line-height: 1.5;
    color: var(--text-body, #4e6471);
    transition: color 0.9s ease;
    text-align: center;
    max-width: 480px;
  }

  .hl-principles {
    display: flex;
    align-items: flex-start;
    width: 100%;
    max-width: 760px;
    gap: 0;
  }

  .hl-principle {
    flex: 1;
    min-width: 0;
    padding-right: 48px;
  }

  .hl-principle:last-child {
    padding-right: 0;
  }

  .hl-principle-number {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-label, #8aa8b5);
    transition: color 0.9s ease;
    margin-bottom: 0.75rem;
  }

  .hl-principle-statement {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 2rem;
    line-height: 1.3;
    color: var(--text-primary, #2c3e48);
    transition: color 0.9s ease;
  }

  .hl-principle-sub {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    line-height: 1.6;
    color: var(--text-label, #8aa8b5);
    transition: color 0.9s ease;
    margin-top: 0.6rem;
  }

  .hl-divider {
    flex-shrink: 0;
    width: 1px;
    align-self: stretch;
    min-height: 80px;
    background: var(--dot-color, #a9d9ae);
    opacity: 0.3;
    margin: 0 48px;
    transition: background 0.9s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .hl-quote,
    .hl-principle {
      opacity: 1 !important;
      transform: none !important;
    }
  }
</style>
