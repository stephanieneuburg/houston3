<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  const COLS = 46, ROWS = 28, CELL = 20;
  const BASE_R = 9;

  // 0 = TX accent, 1–3 = muted palette groups
  const STATE_GROUP = {
    AL:1, AK:3, AZ:2, AR:1, CA:3, CO:1, CT:2, DE:1,
    FL:1, GA:2, HI:3, ID:2, IL:1, IN:2, IA:3, KS:2,
    KY:3, LA:3, ME:3, MD:3, MA:1, MI:2, MN:1, MS:2,
    MO:1, MT:1, NE:1, NV:1, NH:2, NJ:3, NM:2, NY:2,
    NC:1, ND:2, OH:2, OK:3, OR:1, PA:1, RI:3, SC:3,
    SD:3, TN:2, TX:0, UT:3, VT:3, VA:2, WA:2, WV:1,
    WI:3, WY:2, DC:2,
  };

  const TX_ACCENT = '#D6F45C';

  const GROUP_COLORS = [
    '#B6D8B6',  // TX initial (muted, blends in with other states)
    '#DCE9F7',  // light blue  (matches data-map palette)
    '#B6D8B6',  // sage green  (matches data-map palette)
    '#8aa8b5',  // steel blue  (--text-label)
  ];

  const STATE_CENTROIDS = {
    WA:[47.4,-120.4], OR:[44.0,-120.5], CA:[36.8,-119.4], ID:[44.4,-114.6],
    NV:[38.8,-116.4], UT:[39.3,-111.1], AZ:[34.3,-111.7], MT:[46.9,-110.4],
    WY:[43.0,-107.6], CO:[39.0,-105.5], NM:[34.3,-106.0], ND:[47.4,-100.5],
    SD:[44.4,-100.2], NE:[41.5,-99.9],  KS:[38.5,-98.4],  OK:[35.5,-97.5],
    TX:[31.5,-99.3],  MN:[46.4,-93.1],  IA:[42.1,-93.5],  MO:[38.5,-92.5],
    AR:[34.9,-92.4],  LA:[30.9,-91.8],  WI:[44.2,-89.8],  IL:[40.0,-89.2],
    MS:[32.7,-89.7],  AL:[32.8,-86.8],  TN:[35.9,-86.7],  KY:[37.5,-85.3],
    MI:[44.3,-85.4],  IN:[40.3,-86.1],  OH:[40.4,-82.7],  GA:[32.7,-83.4],
    FL:[27.8,-81.7],  SC:[33.9,-80.9],  NC:[35.5,-79.8],  VA:[37.8,-79.5],
    WV:[38.9,-80.5],  MD:[39.0,-76.8],  DE:[39.0,-75.5],  PA:[40.9,-77.8],
    NJ:[40.2,-74.7],  NY:[43.0,-75.1],  CT:[41.6,-72.7],  RI:[41.7,-71.5],
    MA:[42.4,-71.9],  VT:[44.1,-72.7],  NH:[43.7,-71.6],  ME:[45.4,-69.0],
    DC:[38.9,-77.0],
  };

  const US_POLY = [
    [-124.7,48.5],[-124.5,47.0],[-124.0,42.0],[-124.2,40.5],
    [-121.9,36.9],[-120.5,34.5],[-117.1,32.5],
    [-111.0,31.3],[-108.2,31.3],[-106.6,31.8],[-104.6,29.5],
    [-99.8,27.6],[-97.4,25.8],
    [-96.9,28.2],[-94.5,29.0],[-90.8,29.0],[-89.9,29.0],
    [-89.0,30.0],[-86.6,30.4],[-84.0,30.1],
    [-82.5,29.9],[-82.5,27.9],[-81.8,25.2],
    [-80.0,25.1],
    [-80.1,28.5],[-81.0,30.8],[-81.2,31.8],
    [-79.8,33.0],[-75.6,34.7],[-75.5,35.5],[-75.5,37.9],
    [-74.0,39.3],[-73.8,40.7],
    [-72.0,41.2],[-70.5,42.7],[-69.9,42.0],[-70.0,43.5],
    [-67.0,44.5],[-67.0,47.5],
    [-72.0,45.0],[-76.0,44.5],[-79.0,43.5],
    [-82.5,41.7],[-83.0,42.1],[-84.8,45.8],[-85.0,46.1],
    [-87.5,48.2],[-92.0,48.0],[-95.2,49.0],[-110.0,49.0],
    [-123.3,49.0],[-124.7,48.5],
  ];

  const CELL_OVERRIDES = {
    '38,12':'DC',
    '0,20':'AK','1,20':'AK','2,20':'AK','3,20':'AK','4,20':'AK',
    '0,21':'AK','1,21':'AK','2,21':'AK','3,21':'AK','4,21':'AK','5,21':'AK',
    '0,22':'AK','1,22':'AK','2,22':'AK','3,22':'AK','4,22':'AK','5,22':'AK',
    '0,23':'AK','1,23':'AK','2,23':'AK','3,23':'AK',
    '7,22':'HI','8,22':'HI','9,22':'HI',
    '7,23':'HI','8,23':'HI','9,23':'HI','10,23':'HI',
    '7,24':'HI','8,24':'HI','9,24':'HI','10,24':'HI','11,24':'HI',
    '8,25':'HI','9,25':'HI','10,25':'HI',
  };

  function pointInPolygon(lat, lon, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [loni, lati] = poly[i];
      const [lonj, latj] = poly[j];
      if (((lati > lat) !== (latj > lat)) &&
          (lon < (lonj - loni) * (lat - lati) / (latj - lati) + loni)) {
        inside = !inside;
      }
    }
    return inside;
  }

  function findState(lat, lon) {
    if (lat < 24.0 || lat > 49.5 || lon < -124.8 || lon > -66.9) return null;
    if (!pointInPolygon(lat, lon, US_POLY)) return null;
    let best = null, bestDist = Infinity;
    for (const [st, [clat, clon]] of Object.entries(STATE_CENTROIDS)) {
      const d = (lat - clat) ** 2 + (lon - clon) ** 2;
      if (d < bestDist) { bestDist = d; best = st; }
    }
    return best;
  }

  function buildCells() {
    const result = [];
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const lat = 49.5 - (row + 0.5) * 25 / ROWS;
        const lon = -124.5 + (col + 0.5) * 57.5 / COLS;
        const overrideKey = `${col},${row}`;
        const state = CELL_OVERRIDES[overrideKey] !== undefined
          ? CELL_OVERRIDES[overrideKey]
          : findState(lat, lon);
        const noise = Math.sin(col * 127.1 + row * 311.7) * 0.5 + 0.5;
        const r = BASE_R * (0.85 + 0.3 * noise);
        const group = state ? (STATE_GROUP[state] ?? 1) : null;
        const color = group !== null ? GROUP_COLORS[group] : null;
        result.push({ col, row, cx: (col + 0.5) * CELL, cy: (row + 0.5) * CELL, r, state, color });
      }
    }
    return result;
  }

  const cells = buildCells();

  const HOUSTON_COL = Math.min(COLS - 1, Math.max(0, Math.round((-95.37 - (-124.5)) / 57.5 * COLS)));
  const HOUSTON_ROW = Math.min(ROWS - 1, Math.max(0, Math.round((49.5 - 29.76) / 25 * ROWS)));
  const HX = (HOUSTON_COL + 0.5) * CELL;
  const HY = (HOUSTON_ROW + 0.5) * CELL;

  function latLonToXY(lat, lon) {
    const col = Math.min(COLS - 1, Math.max(0, Math.round((lon - (-124.5)) / 57.5 * COLS)));
    const row = Math.min(ROWS - 1, Math.max(0, Math.round((49.5 - lat) / 25 * ROWS)));
    return { x: (col + 0.5) * CELL, y: (row + 0.5) * CELL };
  }

  const TOP_CITIES = [
    { name: 'NEW YORK',    lat: 40.71, lon: -74.01,  anchor: 'end',   dx: -28, dy: 4 },
    { name: 'LOS ANGELES', lat: 34.05, lon: -118.24, anchor: 'start', dx:  28, dy: 4 },
    { name: 'CHICAGO',     lat: 41.85, lon: -87.65,  anchor: 'start', dx:  28, dy: 4 },
  ].map(c => ({ ...c, ...latLonToXY(c.lat, c.lon) }));

  let sectionEl, svgEl, textEl, statEl, statsEl;

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const otherDots = svgEl.querySelectorAll('[data-state]:not([data-state="TX"])');
    const txDots = svgEl.querySelectorAll('[data-state="TX"]');
    const houstonGroup = svgEl.querySelector('.houston-group');
    const cityMarkers = svgEl.querySelectorAll('.city-marker');

    gsap.set(houstonGroup, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        pin: true,
        start: 'top top',
        end: '+=1400',
        scrub: 1,
        anticipatePin: 1,
      }
    });

    tl
      .to(otherDots, {
        opacity: 0,
        duration: 5,
        stagger: { each: 0.018, from: 'random' },
      })
      .to(txDots, { attr: { fill: TX_ACCENT }, duration: 3, ease: 'power1.inOut' }, '<+=2')
      .to(cityMarkers, { opacity: 0, duration: 4 }, '<+=2')
      .to(houstonGroup, { opacity: 1, duration: 2 }, '-=1.5');

    gsap.set(textEl, { opacity: 0, y: 20 });
    gsap.timeline({
      scrollTrigger: {
        trigger: textEl,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      }
    }).to(textEl, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' });

    const statNumber = statEl.querySelector('.hfm-stat-number');
    gsap.set(statNumber, { opacity: 0 });
    gsap.timeline({
      scrollTrigger: {
        trigger: statEl,
        start: 'top 65%',
        toggleActions: 'play none none reverse',
      }
    }).to(statNumber, { opacity: 1, duration: 1.1, ease: 'power2.out' });

    const cols = statsEl.querySelectorAll('.hfm-stat-col');
    gsap.set(cols, { opacity: 0, y: 24 });
    gsap.timeline({
      scrollTrigger: {
        trigger: statsEl,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      }
    }).to(cols, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', stagger: 0.15 });

    return () => tl.kill();
  });
</script>

<section class="hfm-section" bind:this={sectionEl}>
  <svg
    class="hfm-svg"
    viewBox="0 0 920 560"
    preserveAspectRatio="xMidYMid meet"
    bind:this={svgEl}
    role="img"
    aria-label="Map of the United States zooming in on Texas and Houston"
  >
    {#each cells as cell}
      {#if cell.state}
        <circle
          data-state={cell.state}
          cx={cell.cx}
          cy={cell.cy}
          r={cell.r}
          fill={cell.color}
        />
      {/if}
    {/each}

    {#each TOP_CITIES as city}
      <g class="city-marker" pointer-events="none">
        <circle cx={city.x} cy={city.y} r={20} fill="none" stroke="#4A7DD4" stroke-width="2" />
        <circle cx={city.x} cy={city.y} r={13} fill="none" stroke="#FF92B4" stroke-width="1.5" />
        <circle cx={city.x} cy={city.y} r={5}  fill="#FF5A2C" />
        <text
          x={city.x + city.dx} y={city.y + city.dy}
          font-family="'Roboto Mono', 'Courier New', monospace"
          font-size="9"
          fill="#2c3e48"
          letter-spacing="0.12em"
          font-weight="600"
          text-anchor={city.anchor}
        >{city.name}</text>
      </g>
    {/each}

    <g class="houston-group">
      <!-- outer ring -->
      <circle cx={HX} cy={HY} r={24} fill="none" stroke="#4A7DD4" stroke-width="2" />
      <!-- middle ring -->
      <circle cx={HX} cy={HY} r={15} fill="none" stroke="#FF92B4" stroke-width="1.5" />
      <!-- inner fill -->
      <circle cx={HX} cy={HY} r={6}  fill="#FF5A2C" />
      <text
        x={HX + 30} y={HY + 4}
        font-family="'Roboto Mono', 'Courier New', monospace"
        font-size="11"
        fill="#2c3e48"
        letter-spacing="0.12em"
        font-weight="600"
      >HOUSTON</text>
    </g>
  </svg>
</section>

<div class="hfm-text-block" bind:this={textEl}>
  <p class="hfm-paragraph">Houston's success is not based on a single measure, but on a system. The city, the county, nonprofits, health care providers, and landlords collaborate through the "The Way Home" coalition and follow a Housing First approach: people are not housed only after they have achieved sobriety, regained their health, or are "ready," but are placed in housing first.</p>
</div>

<div class="hfm-stat-reveal" bind:this={statEl}>
  <p class="hfm-stat-number">
    <svg class="hfm-stat-arrow" viewBox="0 0 44 77" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="22" y1="2"  x2="22" y2="73" stroke="currentColor" stroke-width="4" stroke-linecap="square"/>
      <line x1="4"  y1="59" x2="22" y2="77" stroke="currentColor" stroke-width="4" stroke-linecap="square"/>
      <line x1="40" y1="59" x2="22" y2="77" stroke="currentColor" stroke-width="4" stroke-linecap="square"/>
    </svg>
    60%
  </p>
  <p class="hfm-stat-subheader">more than 60% regression of homelessness across the Houston region</p>
</div>

<div class="hfm-stats-grid" bind:this={statsEl}>
  <div class="hfm-stat-col">
    <p class="hfm-col-label">By 2024</p>
    <p class="hfm-col-number">–17%</p>
    <p class="hfm-col-desc">below the pre-pandemic level of 2020</p>
  </div>
  <div class="hfm-stat-col">
    <p class="hfm-col-label">Unsheltered</p>
    <p class="hfm-col-number">–33%</p>
    <p class="hfm-col-desc">decline in people sleeping outside since 2020</p>
  </div>
</div>

<style>
  .hfm-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 100px 80px 120px;
    overflow: hidden;
  }

  .hfm-svg {
    width: 100%;
    height: auto;
    display: block;
    max-width: 1140px;
  }

  .hfm-text-block {
    padding: 80px 100px 48px 120px;
  }

  .hfm-paragraph {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-body);
    transition: color 0.9s ease;
    max-width: 680px;
  }

  .hfm-stat-reveal {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 80px 100px 48px 120px;
  }

  .hfm-stat-number {
    display: flex;
    align-items: baseline;
    gap: 0.22em;
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 20rem;
    line-height: 1;
    color: var(--text-primary);
    transition: color 0.9s ease;
    letter-spacing: -0.02em;
    margin-bottom: 2rem;
  }

  .hfm-stat-arrow {
    height: 0.73em;
    width: auto;
    flex-shrink: 0;
    color: currentColor;
  }

  .hfm-stat-subheader {
    font-size: 1.8rem;
    line-height: 1.6;
    color: var(--text-body);
    transition: color 0.9s ease;
    max-width: 800px;
  }

  .hfm-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: 0 100px 0 120px;
    padding: 48px 0 100px;
    border-top: 1px solid var(--text-label);
  }

  .hfm-stat-col {
    padding-right: 48px;
  }

  .hfm-stat-col + .hfm-stat-col {
    padding-left: 48px;
    padding-right: 48px;
    border-left: 1px solid var(--text-label);
  }

  .hfm-col-label {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-label);
    transition: color 0.9s ease;
    margin-bottom: 0.6rem;
  }

  .hfm-col-number {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 5.5rem;
    line-height: 1;
    color: var(--text-primary);
    transition: color 0.9s ease;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  .hfm-col-desc {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-body);
    transition: color 0.9s ease;
    max-width: 220px;
  }
</style>
