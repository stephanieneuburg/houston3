<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  const COLS = 42, ROWS = 26;

  function buildHouseGrid(cols, rows) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    const roofRows = Math.floor(rows * 0.38);
    const bodyStart = roofRows;

    // Roof: triangle, apex at top row, full width at bodyStart
    for (let r = 0; r < roofRows; r++) {
      const indent = Math.round((roofRows - 1 - r) / (roofRows - 1) * (cols / 2 - 1));
      for (let c = indent; c < cols - indent; c++) grid[r][c] = 1;
    }

    // Body: solid rectangle
    for (let r = bodyStart; r < rows; r++) {
      for (let c = 0; c < cols; c++) grid[r][c] = 1;
    }

    // Door: centred bottom cutout
    const doorW = Math.round(cols * 0.12);
    const doorH = Math.round((rows - bodyStart) * 0.44);
    const doorL = Math.round(cols / 2 - doorW / 2);
    for (let r = rows - doorH; r < rows; r++) {
      for (let c = doorL; c < doorL + doorW; c++) grid[r][c] = 0;
    }

    // Windows: two symmetric cutouts
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

  function buildDepthStyles(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const cr = (rows - 1) / 2;
    const cc = (cols - 1) / 2;
    const maxDist = Math.sqrt(cr * cr + cc * cc) || 1;
    return grid.map((row, r) =>
      row.map((cell, c) => {
        if (!cell) return '';
        const t = Math.sqrt((r - cr) ** 2 + (c - cc) ** 2) / maxDist;
        const jitter = (Math.random() - 0.5) * 0.18;
        const b = Math.min(1.15, Math.max(0.28, 0.48 + t * 0.57 + jitter));
        return `filter: brightness(${b.toFixed(2)});`;
      })
    );
  }

  const houseGrid   = buildHouseGrid(COLS, ROWS);
  const depthStyles = buildDepthStyles(houseGrid);

  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({ row: r, col: c, on: houseGrid[r][c] === 1, style: depthStyles[r][c] });
    }
  }

  let sectionEl, counterWrapEl, retentionEl;
  let count = $state(0);

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onDots = sectionEl.querySelectorAll('.dot.on');
    const counter = { val: 0 };

    gsap.set(onDots, { opacity: 0, scale: 0 });
    gsap.set(counterWrapEl, { opacity: 0 });
    gsap.set(retentionEl, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        pin: true,
        start: 'top top',
        end: '+=3200',
        scrub: 1,
        anticipatePin: 1,
      }
    });

    tl
      // counter fades in immediately
      .to(counterWrapEl, { opacity: 1, duration: 0.5 })
      // dots fill bottom-up (from:'end' on row-major array = bottom rows first)
      .to(onDots, {
        opacity: 1,
        scale: 1,
        stagger: { each: 0.006, from: 'end' },
        ease: 'back.out(1.4)',
        duration: 0.5,
      }, '<')
      // counter increments in sync with dots
      .to(counter, {
        val: 25000,
        duration: 8,
        onUpdate() { count = Math.round(counter.val); },
      }, '<')
      // retention line fades in after house is complete
      .to(retentionEl, { opacity: 1, duration: 2 }, '+=1');

    return () => tl.kill();
  });
</script>

<section class="hs-section" bind:this={sectionEl}>
  <div class="hs-house-wrap">
    <div class="dot-grid" style="--cols:{COLS}">
      {#each cells as cell}
        <div class="dot {cell.on ? 'on' : 'off'}" style={cell.on ? cell.style : ''}></div>
      {/each}
    </div>
  </div>

  <div class="hs-counter" bind:this={counterWrapEl}>
    <p class="hs-counter-number">{count.toLocaleString()}+</p>
    <p class="hs-counter-label">people placed in permanent housing<br>over the past decade</p>
  </div>

  <p class="hs-retention" bind:this={retentionEl}>
    The vast majority remain housed even after two years.
  </p>
</section>

<style>
  .hs-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 80px;
    overflow: hidden;
    gap: 28px;
  }

  .hs-house-wrap {
    display: flex;
    justify-content: center;
  }

  .dot-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), 16px);
    gap: 4px;
  }

  .dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }

  .dot.on {
    background: var(--dot-color, #a9d9ae);
    transition: background 0.9s ease;
  }

  .dot.off {
    background: transparent;
  }

  .hs-counter {
    text-align: center;
  }

  .hs-counter-number {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 6rem;
    line-height: 1;
    color: var(--text-primary);
    transition: color 0.9s ease;
    letter-spacing: -0.02em;
  }

  .hs-counter-label {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-label);
    transition: color 0.9s ease;
    margin-top: 0.5rem;
    line-height: 1.7;
  }

  .hs-retention {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 1.5rem;
    line-height: 1.5;
    color: var(--text-body);
    transition: color 0.9s ease;
    text-align: center;
    max-width: 560px;
  }
</style>
