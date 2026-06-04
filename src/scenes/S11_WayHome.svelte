<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  import Scene from '../components/Scene.svelte';
  import { COLORS, FONTS } from '$lib/theme.js';
  import { processSpine, hub } from '$lib/data.js';

  gsap.registerPlugin(ScrollTrigger);

  // ── Dimensions ────────────────────────────────────────────────────────────
  const W = 960, H = 560;

  // ── Hub (centered, top) ───────────────────────────────────────────────────
  const hubX = 480, hubY = 115, hubR = 28;

  // ── Spine: single horizontal row, left → right ────────────────────────────
  // 8 nodes evenly spaced across the width, y=388
  const SY = 388;  // spine y
  const spineNodes = processSpine.map((label, i) => ({
    label,
    x: Math.round(55 + i * (850 / 7)),
    y: SY,
    r: 22,
  }));
  // x ≈ [55, 176, 297, 418, 540, 661, 782, 903]

  const spineEdges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]];

  // Hub connects to every spine node (fan radiating downward)
  const hubSpineIdxs = [0,1,2,3,4,5,6,7];

  // ── Institution nodes ──────────────────────────────────────────────────────
  // Above-spine tier (y ≈ 260): gov / health / voice / some funders
  // Below-spine tier (y ≈ 474): service nonprofits / landlords
  // Hub-adjacent (y ≈ 88):  funders that feed the coalition
  //
  // spineIdx: spine node they connect to (-1 = hub only)
  const nodes = [
    // gov
    { label: "City of Houston",              type: "gov",      x: 148, y: 262, spineIdx: 1  },
    { label: "Harris County",                type: "gov",      x: 206, y: 270, spineIdx: 1  },
    { label: "Houston Housing Authority",    type: "gov",      x: 540, y: 265, spineIdx: 4  },
    { label: "VA (DeBakey)",                 type: "gov",      x:  55, y: 265, spineIdx: 0  },
    // funders
    { label: "HUD",                          type: "funder",   x: 418, y: 264, spineIdx: 3  },
    { label: "Houston Endowment",            type: "funder",   x: 300, y:  88, spineIdx: -1 },
    { label: "Business community",           type: "funder",   x: 660, y:  88, spineIdx: -1 },
    // service nonprofits
    { label: "SEARCH",                       type: "service",  x:  28, y: 474, spineIdx: 0  },
    { label: "The Beacon",                   type: "service",  x:  84, y: 480, spineIdx: 0  },
    { label: "U.S.VETS",                     type: "service",  x: 540, y: 476, spineIdx: 4  },
    { label: "Star of Hope",                 type: "service",  x: 754, y: 476, spineIdx: 6  },
    { label: "Salvation Army",               type: "service",  x: 868, y: 476, spineIdx: 7  },
    { label: "New Hope Housing",             type: "service",  x: 814, y: 482, spineIdx: 6  },
    // health
    { label: "Harris Health",                type: "health",   x: 272, y: 264, spineIdx: 2  },
    { label: "Avenue 360",                   type: "health",   x: 924, y: 478, spineIdx: 7  },
    // landlords
    { label: "Property owners / landlords",  type: "landlord", x: 628, y: 474, spineIdx: 5  },
    { label: "Houston Apartment Assoc.",     type: "landlord", x: 694, y: 480, spineIdx: 5  },
    // voice
    { label: "Community Advisory Council",   type: "voice",    x: 334, y: 268, spineIdx: 2  },
  ];

  // Hub → institution edges (hub-only funders + gov anchor institutions)
  const hubNodeIdxs = [0, 1, 4, 5, 6];

  // Labeled dashed edges highlighting the landlord engagement story
  const labeledEdges = [
    { x1: hubX,              y1: hubY,  x2: spineNodes[5].x, y2: spineNodes[5].y, text: "incentives"     },
    { x1: spineNodes[5].x,  y1: SY,    x2: nodes[15].x,     y2: nodes[15].y,     text: "damage deposit" },
    { x1: spineNodes[5].x,  y1: SY,    x2: nodes[16].x,     y2: nodes[16].y,     text: "fast response"  },
  ];

  // ── Legend ────────────────────────────────────────────────────────────────
  const legend = [
    { label: "Government",        color: COLORS.gov      },
    { label: "Funders",           color: COLORS.funder   },
    { label: "Service nonprofits", color: COLORS.service  },
    { label: "Healthcare",        color: COLORS.health   },
    { label: "Landlords",         color: COLORS.landlord },
    { label: "Lived experience",  color: COLORS.voice    },
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let tooltip = $state({ visible: false, x: 0, y: 0, content: '' });
  let sceneEl, svgEl;

  function typeColor(type) { return COLORS[type] ?? COLORS.spineNode; }
  function midLabel(text)  { return text.length > 18 ? text.slice(0, 17) + '…' : text; }

  function showTip(e, content) {
    const rect = sceneEl.getBoundingClientRect();
    tooltip = { visible: true, x: e.clientX - rect.left + 14, y: e.clientY - rect.top + 14, content };
  }
  function hideTip() { tooltip = { ...tooltip, visible: false }; }

  // ── GSAP ──────────────────────────────────────────────────────────────────
  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      svgEl.querySelectorAll('.net-edge, .hub-edge, .label-edge').forEach(el => {
        el.style.opacity = '1';
      });
      return;
    }

    const allEdges = svgEl.querySelectorAll('.net-edge, .hub-edge, .label-edge');
    gsap.set(allEdges, { opacity: 0 });

    gsap.timeline({
      scrollTrigger: { trigger: sceneEl, start: 'top 80%', toggleActions: 'play none none none' },
    })
    .to(allEdges, { opacity: 1, duration: 0.25, stagger: 0.04, ease: 'none' });
  });
</script>

<Scene>
  <div class="wh-root" bind:this={sceneEl}>
    {#if tooltip.visible}
      <div class="wh-tooltip" style="left:{tooltip.x}px; top:{tooltip.y}px">
        {tooltip.content}
      </div>
    {/if}

    <svg
      class="wh-svg"
      viewBox="0 0 {W} {H}"
      preserveAspectRatio="xMidYMid meet"
      bind:this={svgEl}
      role="img"
      aria-label="Coordination network: Houston's Way Home homelessness response system"
    >
      <rect width={W} height={H} fill={COLORS.networkBg} rx="4" />

      <!-- ── Hub fan: hub → every spine node ── -->
      {#each hubSpineIdxs as idx}
        <line class="hub-edge"
          x1={hubX} y1={hubY}
          x2={spineNodes[idx].x} y2={spineNodes[idx].y}
          stroke={COLORS.hotspotRing} stroke-width="1" opacity="0.18"
        />
      {/each}

      <!-- ── Hub → selected institutions ── -->
      {#each hubNodeIdxs as idx}
        <line class="hub-edge"
          x1={hubX} y1={hubY}
          x2={nodes[idx].x} y2={nodes[idx].y}
          stroke={COLORS.hotspotRing} stroke-width="1" opacity="0.18"
        />
      {/each}

      <!-- ── Institution → spine connector lines ── -->
      {#each nodes as nd}
        {#if nd.spineIdx >= 0}
          <line class="net-edge"
            x1={nd.x} y1={nd.y}
            x2={spineNodes[nd.spineIdx].x} y2={spineNodes[nd.spineIdx].y}
            stroke={COLORS.textLabel} stroke-width="1" opacity="0.3"
          />
        {/if}
      {/each}

      <!-- ── Spine edges ── -->
      {#each spineEdges as [a, b]}
        <line class="net-edge"
          x1={spineNodes[a].x} y1={spineNodes[a].y}
          x2={spineNodes[b].x} y2={spineNodes[b].y}
          stroke={COLORS.textLabel} stroke-width="2" opacity="0.35"
        />
      {/each}

      <!-- ── Labeled landlord edges ── -->
      {#each labeledEdges as le}
        {@const mx = (le.x1 + le.x2) / 2}
        {@const my = (le.y1 + le.y2) / 2}
        <line class="label-edge"
          x1={le.x1} y1={le.y1} x2={le.x2} y2={le.y2}
          stroke={COLORS.hotspotCore} stroke-width="1.2" opacity="0.55"
          stroke-dasharray="4 3"
        />
        <text class="label-edge"
          x={mx + 8} y={my}
          font-family={FONTS.mono} font-size="7.5"
          fill={COLORS.hotspotCore} opacity="0.9"
          pointer-events="none"
        >{le.text}</text>
      {/each}

      <!-- ── Institution nodes ── -->
      {#each nodes as nd}
        <circle
          cx={nd.x} cy={nd.y} r="12"
          fill={typeColor(nd.type)}
          onmouseenter={(e) => showTip(e, nd.label)}
          onmouseleave={hideTip}
        />
        <text
          x={nd.x} y={nd.y + 21}
          font-family={FONTS.mono} font-size="7"
          text-anchor="middle" fill={COLORS.textBody}
          pointer-events="none"
        >{midLabel(nd.label)}</text>
      {/each}

      <!-- ── Spine nodes ── -->
      {#each spineNodes as sn, i}
        {@const isLandlord = i === 5}
        {#if isLandlord}
          <circle cx={sn.x} cy={sn.y} r={sn.r + 14} fill="none"
                  stroke={COLORS.hotspotRing} stroke-width="1.5" opacity="0.35" />
          <circle cx={sn.x} cy={sn.y} r={sn.r + 6} fill="none"
                  stroke={COLORS.hotspotMid} stroke-width="1" opacity="0.4" />
        {/if}
        <circle
          cx={sn.x} cy={sn.y} r={sn.r}
          fill={isLandlord ? COLORS.hotspotCore : COLORS.spineNode}
          onmouseenter={(e) => showTip(e, sn.label)}
          onmouseleave={hideTip}
        />
        <text
          x={sn.x} y={sn.y + 4}
          font-family={FONTS.mono} font-size="9"
          text-anchor="middle" fill={isLandlord ? '#fff' : COLORS.textPrimary}
          font-weight="600" pointer-events="none"
        >{i + 1}</text>
        <text
          x={sn.x} y={sn.y + sn.r + 13}
          font-family={FONTS.mono} font-size="7.5"
          text-anchor="middle" fill={COLORS.textBody}
          pointer-events="none"
        >{sn.label}</text>
      {/each}

      <!-- ── Hub node ── -->
      <circle class="hub-halo" cx={hubX} cy={hubY} r={hubR + 20}
              fill={COLORS.hotspotCore} opacity="0.08" />
      <circle class="hub-ring" cx={hubX} cy={hubY} r={hubR + 10}
              fill="none" stroke={COLORS.hotspotRing} stroke-width="2" opacity="0.6" />
      <circle cx={hubX} cy={hubY} r={hubR + 3}
              fill="none" stroke={COLORS.hotspotMid} stroke-width="1.5" opacity="0.45" />
      <circle class="hub-core" cx={hubX} cy={hubY} r={hubR}
              fill={COLORS.hotspotCore}
              onmouseenter={(e) => showTip(e, `${hub.label} — ${hub.role}`)}
              onmouseleave={hideTip}
      />
      <text x={hubX} y={hubY + 4}
            font-family={FONTS.mono} font-size="7.5"
            text-anchor="middle" fill="#fff" font-weight="600"
            pointer-events="none">HUB</text>
      <text x={hubX} y={hubY + hubR + 14}
            font-family={FONTS.mono} font-size="7.5"
            text-anchor="middle" fill={COLORS.textBody}
            pointer-events="none">{hub.label}</text>

      <!-- ── Legend ── -->
      <g transform="translate(28, 526)">
        {#each legend as item, i}
          <circle cx={i * 135 + 7} cy="8" r="5.5" fill={item.color} />
          <text x={i * 135 + 17} y="12"
                font-family={FONTS.mono} font-size="7.5" fill={COLORS.textLabel}
          >{item.label}</text>
        {/each}
      </g>

      <!-- Source caption -->
      <text x={W - 12} y={H - 8}
            font-family={FONTS.mono} font-size="7"
            text-anchor="end" fill={COLORS.textLabel}
            font-style="italic" opacity="0.8"
      >The Way Home / Coalition for the Homeless — simplified schematic</text>
    </svg>
  </div>
</Scene>

<style>
  .wh-root {
    position: relative;
    width: 100%;
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 60px;
  }

  .wh-svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .wh-tooltip {
    position: absolute;
    pointer-events: none;
    background: rgba(28, 48, 86, 0.92);
    color: #ECE7DB;
    font-family: 'Space Mono', 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    padding: 5px 10px;
    border-radius: 3px;
    z-index: 10;
    max-width: 320px;
    white-space: normal;
  }

  @media (max-width: 700px) {
    .wh-root { padding: 0 12px; }
  }
</style>
