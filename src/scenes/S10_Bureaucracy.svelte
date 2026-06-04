<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  import Scene from '../components/Scene.svelte';
  import { COLORS, FONTS } from '$lib/theme.js';
  import { bureaucracy } from '$lib/data.js';

  gsap.registerPlugin(ScrollTrigger);

  // ── Shared constants ────────────────────────────────────────────────────────
  const N_SB = bureaucracy.stepsBefore; // 76
  const N_SA = bureaucracy.stepsAfter;  //  6
  const N_DB = bureaucracy.daysBefore;  // 720
  const N_DA = bureaucracy.daysAfter;   //  32

  // ════════════════════════════════════════════════════════════════════════════
  // STEPS SVG  (960 × 520)
  // ════════════════════════════════════════════════════════════════════════════
  const SW = 960, SH = 520;
  const RAIL_X = 28;
  const DR_S = 5;

  function genSnake() {
    const PER  = 8;
    const rows = Math.ceil(N_SB / PER); // 10
    // dots fill the tall middle of the steps SVG
    const xLo = 100, xHi = 860;
    const yLo =  90, yHi = 428;
    const xs = Array.from({ length: PER  }, (_, i) => xLo + i * (xHi - xLo) / (PER  - 1));
    const ys = Array.from({ length: rows }, (_, i) => yLo + i * (yHi - yLo) / (rows - 1));
    const dots = [];
    let n = 0;
    for (let r = 0; r < rows && n < N_SB; r++) {
      const y   = ys[r];
      const rev = r % 2 === 1;
      const cnt = Math.min(PER, N_SB - n);
      for (let c = 0; c < cnt; c++) {
        const xi = rev ? (PER - 1 - c) : c;
        const jx = (Math.sin(n * 17.3 + 5.2) - 0.5) * 15;
        const jy = (Math.sin(n * 31.1 + 2.7) - 0.5) *  8;
        dots.push({ x: xs[xi] + jx, y: y + jy });
        n++;
      }
    }
    return dots;
  }

  const STRAIGHT_Y = 259; // vertical center of the snake area
  function genStraight() {
    const xLo = 295, xHi = 665;
    return Array.from({ length: N_SA }, (_, i) => ({
      x: xLo + i * (xHi - xLo) / (N_SA - 1),
      y: STRAIGHT_Y,
    }));
  }

  const snakeDots    = genSnake();
  const straightTgts = genStraight();

  const dotSlot   = snakeDots.map((_, i) =>
    Math.round((i / (N_SB - 1)) * (N_SA - 1)));
  const dotTarget = snakeDots.map((_, i) => straightTgts[dotSlot[i]]);

  const reprSet   = new Set();
  const seenSlots = new Set();
  for (let i = 0; i < N_SB; i++) {
    const s = dotSlot[i];
    if (!seenSlots.has(s)) { seenSlots.add(s); reprSet.add(i); }
  }

  const snakePoly    = snakeDots.map(d => `${d.x},${d.y}`).join(' ');
  const straightPoly = straightTgts.map(d => `${d.x},${d.y}`).join(' ');

  // ════════════════════════════════════════════════════════════════════════════
  // DAYS SVG  (960 × 520)  —  split layout: counter left · grid right
  // ════════════════════════════════════════════════════════════════════════════
  const DW = 960, DH = 520;

  const DR_D   = 4;
  const STEP_D = DR_D * 2 + 3; // 11

  const G_COLS = 36, G_ROWS = 20;         // 720 total
  const G_W    = G_COLS * STEP_D;         // 396
  const G_H    = G_ROWS * STEP_D;         // 220
  const G_X0   = 482;                     // right half, centered in 400-960
  const G_Y0   = (DH - G_H) / 2 - 10;   // vertically centred, nudged up (≈ 140)

  const daysDots = [];
  for (let row = 0; row < G_ROWS; row++) {
    for (let col = 0; col < G_COLS; col++) {
      const idx = row * G_COLS + col;
      daysDots.push({
        x: G_X0 + (col + 0.5) * STEP_D,
        y: G_Y0 + (row + 0.5) * STEP_D,
        survivor: idx >= N_DB - N_DA,
        idx,
      });
    }
  }

  // Survivor highlight rect (last 32 = row 19, cols 4-35)
  const SURV_X = G_X0 + 4 * STEP_D - 5;
  const SURV_Y = G_Y0 + 19 * STEP_D - 5;
  const SURV_W = 32 * STEP_D + 10;
  const SURV_H = STEP_D + 10;

  // ── Reactive state ──────────────────────────────────────────────────────────
  let counterDisplay = $state(N_DB);
  let showAfterLabel = $state(false);
  let showSurvivorRing = $state(false);
  let tooltip = $state({ visible: false, x: 0, y: 0, text: '' });

  // Non-reactive refs for inside GSAP-owned handlers
  let _stepsPhase = 'before';
  let _counterVal = N_DB;

  // DOM refs — steps
  let stepsWrapEl, stepsSvgEl;
  let stepsGrpEl, snakePolyEl, afterPolyEl, stepsRailEl;

  // DOM refs — days
  let daysWrapEl, daysSvgEl;
  let daysGrpEl, daysRailEl;

  function showTip(e, text) {
    tooltip = { visible: true, x: e.clientX + 14, y: e.clientY + 14, text };
  }
  function hideTip() { tooltip = { ...tooltip, visible: false }; }

  // ── GSAP ────────────────────────────────────────────────────────────────────
  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function applySteps(t) {
      const circs = stepsGrpEl?.querySelectorAll('circle');
      if (!circs) return;
      circs.forEach((c, i) => {
        if (i >= snakeDots.length) return;
        const { x: fx, y: fy } = snakeDots[i];
        const { x: tx, y: ty } = dotTarget[i];
        c.setAttribute('cx', (fx + (tx - fx) * t).toString());
        c.setAttribute('cy', (fy + (ty - fy) * t).toString());
        if (reprSet.has(i)) {
          c.setAttribute('fill', t > 0.45 ? COLORS.service : COLORS.gov);
        } else {
          const fade = Math.max(0, 1 - Math.max(0, (t - 0.22) / 0.5));
          c.style.opacity = fade.toString();
          c.style.pointerEvents = fade < 0.05 ? 'none' : 'auto';
        }
      });
      if (snakePolyEl) snakePolyEl.style.opacity =
        t < 0.5 ? (0.18 * (1 - t * 2)).toString() : '0';
      if (afterPolyEl) afterPolyEl.style.opacity =
        t > 0.5 ? ((t - 0.5) * 2 * 0.25).toString() : '0';
      const next = t >= 0.65 ? 'after' : 'before';
      if (next !== _stepsPhase) {
        _stepsPhase = next;
        showAfterLabel = next === 'after';
      }
    }

    function applyDays(t) {
      const circs = daysGrpEl?.querySelectorAll('circle');
      if (!circs) return;
      const drainCount = Math.floor(t * (N_DB - N_DA));
      circs.forEach((c, i) => {
        const dot = daysDots[i];
        if (dot.survivor) {
          c.setAttribute('fill', t > 0.55 ? COLORS.hotspotCore : COLORS.spineNode);
        } else {
          if (dot.idx < drainCount) {
            c.style.opacity = '0';
            c.style.pointerEvents = 'none';
          } else {
            c.style.opacity = '1';
            c.style.pointerEvents = 'auto';
            c.setAttribute('fill', COLORS.spineNode);
          }
        }
      });
      _counterVal    = Math.round(N_DB - t * (N_DB - N_DA));
      counterDisplay = _counterVal;
      if (!showSurvivorRing && t > 0.85) showSurvivorRing = true;
      if (showSurvivorRing  && t < 0.80) showSurvivorRing = false;
    }

    if (reduced) {
      applySteps(1);
      applyDays(1);
      showSurvivorRing = true;
      return;
    }

    // ── Steps ScrollTrigger ──
    const sp = { t: 0 };
    const tlSteps = gsap.timeline({
      scrollTrigger: {
        trigger: stepsWrapEl,
        pin: true,
        start: 'top top',
        end: '+=3200',
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate(self) {
          if (stepsRailEl)
            stepsRailEl.setAttribute('cy', (24 + self.progress * (SH - 48)).toString());
        },
      },
    });
    tlSteps.to(sp, { t: 1, duration: 5, ease: 'none', onUpdate: () => applySteps(sp.t) });

    // ── Days ScrollTrigger ──
    const dp = { t: 0 };
    const tlDays = gsap.timeline({
      scrollTrigger: {
        trigger: daysWrapEl,
        pin: true,
        start: 'top top',
        end: '+=4800',
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate(self) {
          if (daysRailEl)
            daysRailEl.setAttribute('cy', (24 + self.progress * (DH - 48)).toString());
        },
      },
    });
    tlDays.to(dp, { t: 1, duration: 7, ease: 'none', onUpdate: () => applyDays(dp.t) });

    return () => { tlSteps.kill(); tlDays.kill(); };
  });
</script>

<!-- Tooltip: fixed so it works across both sections -->
{#if tooltip.visible}
  <div class="bc-tooltip" style="left:{tooltip.x}px; top:{tooltip.y}px">
    {tooltip.text}
  </div>
{/if}

<Scene>

  <!-- ══════════════════════ STEPS SECTION ══════════════════════ -->
  <div class="bc-wrap" bind:this={stepsWrapEl}>
    <div class="bc-inner">
      <svg
        class="bc-svg"
        viewBox="0 0 {SW} {SH}"
        preserveAspectRatio="xMidYMid meet"
        bind:this={stepsSvgEl}
        role="img"
        aria-label="76 bureaucratic steps collapse to a streamlined process"
      >
        <rect width={SW} height={SH} fill={COLORS.networkBg} rx="4" />

        <!-- Scroll rail -->
        <line x1={RAIL_X} y1="24" x2={RAIL_X} y2={SH - 24}
              stroke={COLORS.textLabel} stroke-width="1" opacity="0.3" />
        <circle bind:this={stepsRailEl}
                cx={RAIL_X} cy="24" r="4"
                fill={COLORS.indicator} opacity="0.85" />

        <!-- Labels -->
        <text x="68" y="24"
              font-family={FONTS.mono} font-size="8.5"
              fill={COLORS.textLabel} letter-spacing="0.13em"
        >BUREAUCRATIC STEPS</text>

        <text x="68" y="48"
              font-family={FONTS.mono} font-size="22"
              fill={COLORS.textPrimary} letter-spacing="-0.01em"
        >76 → fewer steps</text>

        <text x="68" y="66"
              font-family={FONTS.mono} font-size="8.5"
              fill={COLORS.gov} opacity="0.85"
        >76 steps &amp; 720 days · before Houston's reform</text>

        <!-- Snake path connector -->
        <polyline bind:this={snakePolyEl}
                  points={snakePoly}
                  fill="none" stroke={COLORS.gov} stroke-width="1.2"
                  opacity="0.18" pointer-events="none" />

        <!-- After straight connector -->
        <polyline bind:this={afterPolyEl}
                  points={straightPoly}
                  fill="none" stroke={COLORS.service} stroke-width="2"
                  opacity="0" pointer-events="none" />

        <!-- 76 step dots -->
        <g bind:this={stepsGrpEl}>
          {#each snakeDots as dot, i}
            <circle
              cx={dot.x} cy={dot.y} r={DR_S}
              fill={COLORS.gov}
              onmouseenter={(e) => showTip(e,
                _stepsPhase === 'after'
                  ? 'Streamlined — one direct referral replaces 76 bureaucratic gates'
                  : `Step ${i + 1} of ${N_SB} — one of 76 bureaucratic gates`)}
              onmouseleave={hideTip}
            />
          {/each}
        </g>

        <!-- After label (Svelte-reactive only) -->
        <text x={SW / 2} y="462"
              font-family={FONTS.mono} font-size="10"
              text-anchor="middle" fill={COLORS.service}
              opacity={showAfterLabel ? 1 : 0}
              style="transition: opacity 0.5s ease"
        >a streamlined process</text>

        <!-- Caption -->
        <text x={SW / 2} y="494"
              font-family={FONTS.mono} font-size="7.5"
              text-anchor="middle" fill={COLORS.textLabel} opacity="0.6"
        >Before: 76 steps across multiple agencies · After: a single streamlined referral</text>

        <!-- Source -->
        <text x={SW - 20} y={SH - 8}
              font-family={FONTS.mono} font-size="7"
              text-anchor="end" fill={COLORS.textLabel}
              font-style="italic" opacity="0.6"
        >HUD / Houston Coalition for the Homeless</text>
      </svg>
    </div>
  </div>

  <!-- ══════════════════════ DAYS SECTION ══════════════════════ -->
  <div class="bc-wrap" bind:this={daysWrapEl}>
    <div class="bc-inner">
      <svg
        class="bc-svg"
        viewBox="0 0 {DW} {DH}"
        preserveAspectRatio="xMidYMid meet"
        bind:this={daysSvgEl}
        role="img"
        aria-label="720 days of waiting drain to 32 as Houston reformed the process"
      >
        <rect width={DW} height={DH} fill={COLORS.networkBg} rx="4" />

        <!-- Scroll rail -->
        <line x1={RAIL_X} y1="24" x2={RAIL_X} y2={DH - 24}
              stroke={COLORS.textLabel} stroke-width="1" opacity="0.3" />
        <circle bind:this={daysRailEl}
                cx={RAIL_X} cy="24" r="4"
                fill={COLORS.indicator} opacity="0.85" />

        <!-- Left col: labels + big counter -->
        <text x="68" y="24"
              font-family={FONTS.mono} font-size="8.5"
              fill={COLORS.textLabel} letter-spacing="0.13em"
        >DAYS WAITING · VETERANS</text>

        <text x="68" y="50"
              font-family={FONTS.mono} font-size="22"
              fill={COLORS.textPrimary} letter-spacing="-0.01em"
        >720 → 32 days</text>

        <text x="68" y="66"
              font-family={FONTS.mono} font-size="8.5"
              fill={COLORS.textLabel} opacity="0.75"
        >average wait from street to housing</text>

        <!-- Big live counter -->
        <text x="205" y="295"
              font-family={FONTS.mono} font-size="92"
              text-anchor="middle"
              fill={counterDisplay <= N_DA * 2 ? COLORS.hotspotCore : COLORS.textPrimary}
              font-weight="700" letter-spacing="-0.04em"
              style="transition: fill 0.6s ease"
        >{counterDisplay}</text>

        <text x="205" y="318"
              font-family={FONTS.mono} font-size="10"
              text-anchor="middle" fill={COLORS.textLabel} letter-spacing="0.1em"
        >days</text>

        <!-- Vertical divider between left and right columns -->
        <line x1="400" y1="90" x2="400" y2={DH - 60}
              stroke={COLORS.textLabel} stroke-width="0.5" opacity="0.2" />

        <!-- Right col: 720-dot grid -->
        <g bind:this={daysGrpEl}
           onmouseenter={(e) => showTip(e,
             _counterVal <= N_DA
               ? `${N_DA} days — the new average after Houston's reform`
               : `${_counterVal} days — average wait for a veteran to be housed`)}
           onmouseleave={hideTip}
        >
          {#each daysDots as dot}
            <circle cx={dot.x} cy={dot.y} r={DR_D}
                    fill={dot.survivor ? COLORS.service : COLORS.spineNode} />
          {/each}
        </g>

        <!-- Survivor highlight ring -->
        {#if showSurvivorRing}
          <rect x={SURV_X} y={SURV_Y} width={SURV_W} height={SURV_H}
                rx="4" fill="none"
                stroke={COLORS.hotspotCore} stroke-width="1.4"
                opacity="0.45" pointer-events="none" />
          <text x={SURV_X + SURV_W / 2} y={SURV_Y + SURV_H + 14}
                font-family={FONTS.mono} font-size="8"
                text-anchor="middle" fill={COLORS.hotspotCore} opacity="0.85"
          >32 days remaining</text>
        {/if}

        <!-- Caption -->
        <text x={DW / 2} y={DH - 28}
              font-family={FONTS.mono} font-size="8"
              text-anchor="middle" fill={COLORS.textLabel} opacity="0.8"
        >Average wait for homeless veterans, before vs. now</text>

        <!-- Source -->
        <text x={DW - 20} y={DH - 10}
              font-family={FONTS.mono} font-size="7"
              text-anchor="end" fill={COLORS.textLabel}
              font-style="italic" opacity="0.6"
        >HUD / Houston Coalition for the Homeless</text>
      </svg>
    </div>
  </div>

</Scene>

<style>
  .bc-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 60px;
    position: relative;
    overflow: hidden;
  }

  .bc-inner {
    width: 100%;
    max-width: 1200px;
  }

  .bc-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .bc-tooltip {
    position: fixed;
    pointer-events: none;
    background: rgba(28, 48, 86, 0.92);
    color: #ECE7DB;
    font-family: 'Space Mono', 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    padding: 5px 10px;
    border-radius: 3px;
    z-index: 200;
    max-width: 340px;
    white-space: normal;
  }

  @media (max-width: 700px) {
    .bc-wrap { padding: 24px 16px; }
  }
</style>
