<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  const COLS = 42, ROWS = 26;
  const DOT_R = 8, GAP = 4, STEP = DOT_R * 2 + GAP;
  const CANVAS_W = COLS * STEP, CANVAS_H = ROWS * STEP;

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

  // Build dot list bottom-up (matches original from:'end' stagger)
  const onDots = [];
  {
    const cr = (ROWS - 1) / 2, cc = (COLS - 1) / 2;
    const maxDist = Math.sqrt(cr * cr + cc * cc) || 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      for (let c = 0; c < COLS; c++) {
        if (houseGrid[r][c] === 1) {
          const t = Math.sqrt((r - cr) ** 2 + (c - cc) ** 2) / maxDist;
          // deterministic jitter — same visual as the random() version but stable across redraws
          const jitter = (Math.sin(r * 17.3 + c * 31.7) - 0.5) * 0.18;
          const brightness = Math.min(1.15, Math.max(0.28, 0.48 + t * 0.57 + jitter));
          onDots.push({ x: (c + 0.5) * STEP, y: (r + 0.5) * STEP, brightness });
        }
      }
    }
  }

  let canvasEl, sectionEl, counterWrapEl, retentionEl;
  let count = $state(0);
  let numVisible = 0;
  let ctx;

  function getDotColor() {
    return getComputedStyle(document.body).getPropertyValue('--dot-color').trim() || '#a9d9ae';
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    const [br, bg, bb] = hexToRgb(getDotColor());
    const n = Math.min(Math.floor(numVisible), onDots.length);
    for (let i = 0; i < n; i++) {
      const { x, y, brightness } = onDots[i];
      ctx.fillStyle = `rgb(${Math.min(255,Math.round(br*brightness))},${Math.min(255,Math.round(bg*brightness))},${Math.min(255,Math.round(bb*brightness))})`;
      ctx.beginPath();
      ctx.arc(x, y, DOT_R, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    ctx = canvasEl.getContext('2d');

    gsap.set(counterWrapEl, { opacity: 0 });
    gsap.set(retentionEl, { opacity: 0 });

    const proxy   = { n: 0 };
    const counter = { val: 0 };

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
      .to(counterWrapEl, { opacity: 1, duration: 0.5 })
      .to(proxy, {
        n: onDots.length,
        duration: 8,
        ease: 'none',
        onUpdate() { numVisible = proxy.n; draw(); },
      }, '<')
      .to(counter, {
        val: 25000,
        duration: 8,
        ease: 'none',
        onUpdate() { count = Math.round(counter.val); },
      }, '<')
      .to(retentionEl, { opacity: 1, duration: 2 }, '+=1');

    // Redraw when theme class changes so dot color stays correct
    const observer = new MutationObserver(draw);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      tl.kill();
      observer.disconnect();
    };
  });
</script>

<section class="hs-section" bind:this={sectionEl}>
  <div class="hs-house-wrap">
    <canvas
      bind:this={canvasEl}
      width={CANVAS_W}
      height={CANVAS_H}
      class="hs-canvas"
      aria-label="Dot matrix house representing 25,000 people placed in permanent housing"
      role="img"
    ></canvas>
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

  .hs-canvas {
    display: block;
    max-width: 100%;
    height: auto;
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
