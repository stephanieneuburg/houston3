<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  // ── Constants ──────────────────────────────────────────────────────────────
  const COLS = 46, ROWS = 28, CELL = 20;
  const BASE_R = 9;
  const MAX_RING_R = 30, MIN_RING_R = 10;
  const RING_COLORS = ['#FF5A2C', '#FF92B4', '#4A7DD4', '#FFFFFF'];

  // ── State rates (HUD 2023 PIT count ÷ 2023 Census pop × 10,000) ───────────
  const STATE_RATES = {
    AL:20.5, AK:26.1, AZ:14.3, AR:3.8,  CA:38.8, CO:17.2, CT:51.3,
    DE:10.1, FL:11.4, GA:9.8,  HI:45.8, ID:8.6,  IL:11.2, IN:6.3,
    IA:7.2,  KS:6.8,  KY:5.9,  LA:9.1,  ME:14.8, MD:13.5, MA:20.0,
    MI:8.3,  MN:12.4, MS:5.1,  MO:8.7,  MT:11.3, NE:8.1,  NV:22.4,
    NH:9.6,  NJ:12.9, NM:18.8, NY:46.5, NC:8.1,  ND:5.8,  OH:7.9,
    OK:9.4,  OR:37.8, PA:8.9,  RI:13.2, SC:7.6,  SD:6.4,  TN:7.1,
    TX:8.5,  UT:12.7, VT:18.6, VA:10.3, WA:27.7, WV:6.1,  WI:7.4,
    WY:7.8,  DC:94.5,
  };

  const STATE_NAMES = {
    AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
    CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
    HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
    KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
    MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',
    MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',
    NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',
    ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',
    RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',
    TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',
    WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'Washington D.C.',
  };

  // ── Color ramp ─────────────────────────────────────────────────────────────
  const COLOR_RAMP = [
    { max:5,        color:'#F2B8CB', label:'<5'    },
    { max:15,       color:'#D6F45C', label:'5–14'  },
    { max:25,       color:'#DCE9F7', label:'15–24' },
    { max:35,       color:'#B6D8B6', label:'25–34' },
    { max:45,       color:'#76705F', label:'35–44' },
    { max:55,       color:'#313B1E', label:'45–54' },
    { max:Infinity, color:'#1C3056', label:'≥55'   },
  ];

  function rateToColor(rate) {
    return COLOR_RAMP.find(b => rate < b.max)?.color ?? '#1C3056';
  }

  // ── State centroids (approximate geographic centers) ───────────────────────
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

  // Simplified continental US polygon (clockwise: Pacific coast → Mexico border →
  // Gulf coast → Florida → Atlantic coast → Canada border)
  const US_POLY = [
    [-124.7, 48.5], [-124.5, 47.0], [-124.0, 42.0], [-124.2, 40.5],
    [-121.9, 36.9], [-120.5, 34.5], [-117.1, 32.5],
    [-111.0, 31.3], [-108.2, 31.3], [-106.6, 31.8], [-104.6, 29.5],
    [-99.8, 27.6], [-97.4, 25.8],
    [-96.9, 28.2], [-94.5, 29.0], [-90.8, 29.0], [-89.9, 29.0],
    [-89.0, 30.0], [-86.6, 30.4], [-84.0, 30.1],
    [-82.5, 29.9], [-82.5, 27.9], [-81.8, 25.2],
    [-80.0, 25.1],
    [-80.1, 28.5], [-81.0, 30.8], [-81.2, 31.8],
    [-79.8, 33.0], [-75.6, 34.7], [-75.5, 35.5], [-75.5, 37.9],
    [-74.0, 39.3], [-73.8, 40.7],
    [-72.0, 41.2], [-70.5, 42.7], [-69.9, 42.0], [-70.0, 43.5],
    [-67.0, 44.5], [-67.0, 47.5],
    [-72.0, 45.0], [-76.0, 44.5], [-79.0, 43.5],
    [-82.5, 41.7], [-83.0, 42.1], [-84.8, 45.8], [-85.0, 46.1],
    [-87.5, 48.2], [-92.0, 48.0], [-95.2, 49.0], [-110.0, 49.0],
    [-123.3, 49.0], [-124.7, 48.5],
  ];

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

  // Manual overrides: DC single cell + AK/HI inset clusters in Pacific ocean area
  const CELL_OVERRIDES = {
    '38,12': 'DC',
    // Alaska inset: lower-left of SVG (ocean cells, rows 20-23, cols 0-5)
    '0,20':'AK','1,20':'AK','2,20':'AK','3,20':'AK','4,20':'AK',
    '0,21':'AK','1,21':'AK','2,21':'AK','3,21':'AK','4,21':'AK','5,21':'AK',
    '0,22':'AK','1,22':'AK','2,22':'AK','3,22':'AK','4,22':'AK','5,22':'AK',
    '0,23':'AK','1,23':'AK','2,23':'AK','3,23':'AK',
    // Hawaii inset: to the right of AK (ocean cells, rows 22-25, cols 7-11)
    '7,22':'HI','8,22':'HI','9,22':'HI',
    '7,23':'HI','8,23':'HI','9,23':'HI','10,23':'HI',
    '7,24':'HI','8,24':'HI','9,24':'HI','10,24':'HI','11,24':'HI',
    '8,25':'HI','9,25':'HI','10,25':'HI',
  };

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

  function latLonToCell(lat, lon) {
    const col = Math.min(COLS - 1, Math.max(0, Math.round((lon - (-124.5)) / 57.5 * COLS)));
    const row = Math.min(ROWS - 1, Math.max(0, Math.round((49.5 - lat) / 25 * ROWS)));
    return { col, row };
  }

  // ── City data ──────────────────────────────────────────────────────────────
  const CITIES_RAW = [
    { name:'New York City',    count:88025, lat:40.71, lon:-74.01 },
    { name:'Los Angeles',      count:75000, lat:34.05, lon:-118.24 },
    { name:'Seattle',          count:14149, lat:47.61, lon:-122.33 },
    { name:'Sacramento',       count:9278,  lat:38.58, lon:-121.49 },
    { name:'San Diego',        count:10264, lat:32.72, lon:-117.16 },
    { name:'Chicago',          count:9544,  lat:41.85, lon:-87.65  },
    { name:'Denver',           count:9065,  lat:39.74, lon:-104.98 },
    { name:'Phoenix',          count:9026,  lat:33.45, lon:-112.07 },
    { name:'San Francisco',    count:7754,  lat:37.77, lon:-122.42 },
    { name:'Boston',           count:6983,  lat:42.36, lon:-71.06  },
    { name:'Washington D.C.',  count:6521,  lat:38.91, lon:-77.04  },
    { name:'Las Vegas',        count:5645,  lat:36.17, lon:-115.14 },
    { name:'Portland',         count:5228,  lat:45.52, lon:-122.68 },
    { name:'Austin',           count:5020,  lat:30.27, lon:-97.74  },
    { name:'Philadelphia',     count:4658,  lat:39.95, lon:-75.17  },
    { name:'Dallas',           count:4043,  lat:32.78, lon:-96.80  },
    { name:'San Jose',         count:3671,  lat:37.34, lon:-121.89 },
    { name:'Houston',          count:3501,  lat:29.76, lon:-95.37  },
    { name:'Salt Lake City',   count:3241,  lat:40.76, lon:-111.89 },
    { name:'Atlanta',          count:2655,  lat:33.75, lon:-84.39  },
    { name:'Baltimore',        count:2377,  lat:39.29, lon:-76.61  },
    { name:'Nashville',        count:2281,  lat:36.17, lon:-86.78  },
    { name:'Eugene',           count:2100,  lat:44.05, lon:-123.09 },
    { name:'Columbus',         count:1943,  lat:39.96, lon:-82.99  },
    { name:'Albuquerque',      count:1756,  lat:35.08, lon:-106.65 },
    { name:'Spokane',          count:1752,  lat:47.66, lon:-117.43 },
    { name:'Minneapolis',      count:1736,  lat:44.98, lon:-93.27  },
    { name:'Tampa',            count:1578,  lat:27.95, lon:-82.46  },
    { name:'Indianapolis',     count:1551,  lat:39.77, lon:-86.16  },
    { name:'Detroit',          count:1561,  lat:42.33, lon:-83.05  },
    { name:'Tucson',           count:1442,  lat:32.22, lon:-110.97 },
    { name:'Buffalo',          count:1400,  lat:42.89, lon:-78.88  },
    { name:'Kansas City',      count:1524,  lat:39.10, lon:-94.58  },
    { name:'Jacksonville',     count:1357,  lat:30.33, lon:-81.66  },
    { name:'New Orleans',      count:1228,  lat:29.95, lon:-90.07  },
    { name:'Cleveland',        count:1256,  lat:41.50, lon:-81.69  },
    { name:'Charlotte',        count:1289,  lat:35.23, lon:-80.84  },
    { name:'Oklahoma City',    count:1116,  lat:35.47, lon:-97.52  },
    { name:'Memphis',          count:1128,  lat:35.15, lon:-90.05  },
    { name:'Cincinnati',       count:1155,  lat:39.10, lon:-84.51  },
    { name:'Pittsburgh',       count:1107,  lat:40.44, lon:-80.00  },
    { name:'Raleigh',          count:1073,  lat:35.78, lon:-78.64  },
  ];

  // ── Build cell grid (col-major order for left→right GSAP stagger) ──────────
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
        const color = state ? rateToColor(STATE_RATES[state] ?? 0) : '#D9D4C9';
        const isPinDot = !!state && Math.sin(col * 73.1 + row * 199.3) > 0.9;
        result.push({
          col, row,
          cx: (col + 0.5) * CELL,
          cy: (row + 0.5) * CELL,
          r, state, color, isPinDot,
          isLand: state !== null,
        });
      }
    }
    return result;
  }

  function buildCityRings() {
    const maxCount = 88025;
    return CITIES_RAW.map(city => {
      const { col, row } = latLonToCell(city.lat, city.lon);
      const cx = (col + 0.5) * CELL;
      const cy = (row + 0.5) * CELL;
      const scaledR = Math.max(MIN_RING_R, Math.sqrt(city.count / maxCount) * MAX_RING_R);
      return { ...city, col, row, cx, cy, scaledR };
    });
  }

  const cells = buildCells();
  const cityRings = buildCityRings();

  // Size legend reference counts
  const SIZE_REFS = [
    { count:1000,  label:'1k'  },
    { count:10000, label:'10k' },
    { count:50000, label:'50k' },
  ].map(s => ({ ...s, r: Math.max(MIN_RING_R, Math.sqrt(s.count / 88025) * MAX_RING_R) * 0.55 }));

  // ── Svelte 5 state ─────────────────────────────────────────────────────────
  let tooltip = $state({ visible: false, x: 0, y: 0, content: '' });
  let sectionEl;
  let svgEl;

  function showStateTooltip(e, cell) {
    if (!cell.state) return;
    const rect = sectionEl.getBoundingClientRect();
    const rate = STATE_RATES[cell.state] ?? 0;
    tooltip = {
      visible: true,
      x: e.clientX - rect.left + 14,
      y: e.clientY - rect.top + 14,
      content: `${STATE_NAMES[cell.state]}: ${rate.toFixed(1)} per 10,000`,
    };
  }

  function showCityTooltip(e, city) {
    const rect = sectionEl.getBoundingClientRect();
    tooltip = {
      visible: true,
      x: e.clientX - rect.left + 14,
      y: e.clientY - rect.top + 14,
      content: `${city.name}: ${city.count.toLocaleString()} homeless`,
    };
  }

  function hideTooltip() {
    tooltip = { ...tooltip, visible: false };
  }

  // ── GSAP entrance animation ────────────────────────────────────────────────
  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const landDots = svgEl.querySelectorAll('.land-dot');
    gsap.from(landDots, {
      attr: { r: 0 },
      opacity: 0,
      duration: 0.3,
      ease: 'back.out(1.2)',
      stagger: {
        each: 0.013,
        from: 'start',
        grid: [ROWS, COLS],
        axis: 'x',
      },
    });
  });
</script>

<div class="hm-root" bind:this={sectionEl}>
  {#if tooltip.visible}
    <div class="hm-tooltip" style="left:{tooltip.x}px; top:{tooltip.y}px">
      {tooltip.content}
    </div>
  {/if}

  <svg
    class="hm-svg"
    viewBox="0 0 920 620"
    preserveAspectRatio="xMidYMid meet"
    bind:this={svgEl}
    role="img"
    aria-label="Dot-matrix map of US homelessness rates by state, 2023"
  >
    <!-- Background: transparent so the chapter's background shows through and transitions together -->

    <!-- Ocean dots first (painter's algorithm: land on top) -->
    {#each cells as cell}
      {#if !cell.isLand}
        <circle
          cx={cell.cx} cy={cell.cy} r={cell.r}
          fill="#b8c4ce" opacity="0.6"
          pointer-events="none"
        />
      {/if}
    {/each}

    <!-- Land dots -->
    {#each cells as cell}
      {#if cell.isLand}
        <circle
          class="land-dot"
          cx={cell.cx} cy={cell.cy} r={cell.r}
          fill={cell.color}
          onmouseenter={(e) => showStateTooltip(e, cell)}
          onmouseleave={hideTooltip}
        />
        {#if cell.isPinDot}
          <circle
            cx={cell.cx} cy={cell.cy} r={1.5}
            fill="white" opacity="0.7"
            pointer-events="none"
          />
        {/if}
      {/if}
    {/each}

    <!-- City concentric rings (outer → inner, painter's algorithm) -->
    {#each cityRings as city}
      <!-- outer ring -->
      <circle
        cx={city.cx} cy={city.cy} r={city.scaledR}
        fill="none" stroke={RING_COLORS[2]} stroke-width="2"
        pointer-events="none"
      />
      <!-- middle ring -->
      <circle
        cx={city.cx} cy={city.cy} r={city.scaledR * 0.65}
        fill="none" stroke={RING_COLORS[1]} stroke-width="1.5"
        pointer-events="none"
      />
      <!-- inner fill -->
      <circle
        cx={city.cx} cy={city.cy} r={city.scaledR * 0.32}
        fill={RING_COLORS[0]}
        pointer-events="none"
      />
      <!-- transparent hit target -->
      <circle
        cx={city.cx} cy={city.cy} r={city.scaledR + 4}
        fill="transparent"
        onmouseenter={(e) => showCityTooltip(e, city)}
        onmouseleave={hideTooltip}
      />
    {/each}

    <!-- ── Legend ── -->
    <g transform="translate(20, 574)">
      <!-- Color ramp -->
      {#each COLOR_RAMP as band, i}
        <circle cx={i * 34 + 8} cy={8} r={6} fill={band.color} />
        <text
          x={i * 34 + 8} y={22}
          font-family="'Roboto Mono', 'Courier New', monospace"
          font-size="7.5" text-anchor="middle" fill="#76705F"
        >{band.label}</text>
      {/each}
      <text
        x={0} y={34}
        font-family="'Roboto Mono', 'Courier New', monospace"
        font-size="7" fill="#76705F" opacity="0.8"
      >homeless per 10,000 residents</text>

      <!-- Size legend -->
      <g transform="translate(290, -4)">
        {#each SIZE_REFS as ref, i}
          <circle
            cx={i * 52 + ref.r + 2} cy={8} r={ref.r}
            fill="none" stroke={RING_COLORS[2]} stroke-width="1.5"
          />
          <circle
            cx={i * 52 + ref.r + 2} cy={8} r={ref.r * 0.45}
            fill={RING_COLORS[0]}
          />
          <text
            x={i * 52 + ref.r + 2} y={22}
            font-family="'Roboto Mono', 'Courier New', monospace"
            font-size="7.5" text-anchor="middle" fill="#76705F"
          >{ref.label}</text>
        {/each}
        <text
          x={0} y={34}
          font-family="'Roboto Mono', 'Courier New', monospace"
          font-size="7" fill="#76705F" opacity="0.8"
        >city population</text>
      </g>
    </g>

    <!-- Source caption -->
    <text
      x={900} y={614}
      font-family="'Roboto Mono', 'Courier New', monospace"
      font-size="7" text-anchor="end" fill="#76705F"
      font-style="italic" opacity="0.8"
    >Source: HUD, 2023</text>
  </svg>
</div>

<style>
  .hm-root {
    position: relative;
    width: 100%;
    max-width: 920px;
    margin: 0 auto;
  }

  .hm-svg {
    width: 100%;
    max-width: 920px;
    height: auto;
    display: block;
  }

  .hm-tooltip {
    position: absolute;
    pointer-events: none;
    background: rgba(28, 48, 86, 0.9);
    color: #ECE7DB;
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.72rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    padding: 5px 10px;
    border-radius: 3px;
    white-space: nowrap;
    z-index: 10;
  }
</style>
