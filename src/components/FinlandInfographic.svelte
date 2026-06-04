<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  // Finnish long-term homelessness index (2008 = 100 → 2022 = 32, i.e. −68%)
  const DATA = [
    { year: 2008, v: 100 },
    { year: 2010, v: 91  },
    { year: 2012, v: 79  },
    { year: 2014, v: 68  },
    { year: 2016, v: 57  },
    { year: 2018, v: 48  },
    { year: 2020, v: 40  },
    { year: 2022, v: 32  },
  ];

  const W = 760, H = 260;
  const PT = 20, PB = 48;

  const xs = (year) => ((year - 2008) / 14) * W;
  const ys = (v)    => PT + (1 - v / 110) * (H - PT - PB);

  const pathD = DATA.map(({ year, v }, i) =>
    `${i === 0 ? 'M' : 'L'} ${xs(year).toFixed(1)} ${ys(v).toFixed(1)}`
  ).join(' ');

  let sectionEl, traceEl, dotEl, reductionEl, hfEl;

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const len = traceEl.getTotalLength();
    const p0  = traceEl.getPointAtLength(0);

    traceEl.setAttribute('stroke-dasharray', len);
    traceEl.setAttribute('stroke-dashoffset', len);
    dotEl.setAttribute('cx', p0.x);
    dotEl.setAttribute('cy', p0.y);
    gsap.set([reductionEl, hfEl], { opacity: 0 });

    const proxy = { t: 0 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        pin: true,
        start: 'top top',
        end: '+=3200',
        scrub: 1,
        anticipatePin: 1,
      },
    });

    tl
      .to(proxy, {
        t: 1,
        duration: 7,
        ease: 'none',
        onUpdate() {
          const pt = traceEl.getPointAtLength(len * proxy.t);
          dotEl.setAttribute('cx', pt.x);
          dotEl.setAttribute('cy', pt.y);
          traceEl.setAttribute('stroke-dashoffset', len * (1 - proxy.t));
        },
      })
      .to(reductionEl, { opacity: 1, duration: 1.5 }, '-=1')
      .to(hfEl,        { opacity: 1, duration: 1.5 }, '+=0.5');

    return () => tl.kill();
  });
</script>

<div class="fi-intro">
  <p class="fi-intro-text">At the same time, homelessness in Europe is often less visible. While "street homelessness" and large encampments dominate the public image in the United States, homelessness in Europe is more often hidden: in emergency shelters, temporary housing, overcrowded conditions, or among people who are only staying with others temporarily.</p>
</div>

<section class="fi-section" bind:this={sectionEl}>
  <p class="fi-label">Finland — long-term homelessness 2008–2022</p>

  <div class="fi-chart-wrap">
    <svg
      viewBox="0 0 {W} {H}"
      class="fi-svg"
      role="img"
      aria-label="Line chart: Finnish long-term homelessness fell 68% between 2008 and 2022"
    >
      {#each [25, 50, 75, 100] as pct}
        <line x1="0" x2={W} y1={ys(pct)} y2={ys(pct)} class="fi-grid" />
      {/each}

      {#each DATA as { year }}
        <text x={xs(year)} y={H - 8} class="fi-axis-label" text-anchor="middle">{year}</text>
      {/each}

      <path d={pathD} class="fi-path-bg" />
      <path d={pathD} bind:this={traceEl} class="fi-trace" />
      <circle bind:this={dotEl} r="9" cx={xs(2008)} cy={ys(100)} class="fi-dot" />
    </svg>
  </div>

  <div class="fi-reduction" bind:this={reductionEl}>
    <p class="fi-big">−68%</p>
    <p class="fi-sub">reduction in long-term homelessness in Finland<br>between 2008 and 2022</p>
  </div>

  <div class="fi-hf" bind:this={hfEl}>
    <p class="fi-med">80%</p>
    <p class="fi-sub">of those affected secured permanent housing through<br>Housing First programs — according to a summary report</p>
  </div>
</section>

<style>
  .fi-intro {
    padding: 0 120px 80px;
  }

  .fi-intro-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-body, #4e6471);
    transition: color 0.9s ease;
    max-width: 680px;
  }

  .fi-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 80px;
    gap: 28px;
    overflow: hidden;
  }

  .fi-label {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-label, #8aa8b5);
    transition: color 0.9s ease;
  }

  .fi-chart-wrap {
    width: 100%;
    max-width: 760px;
  }

  .fi-svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .fi-grid {
    stroke: var(--text-label, #8aa8b5);
    stroke-opacity: 0.15;
    stroke-width: 1;
  }

  .fi-axis-label {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 11px;
    fill: var(--text-label, #8aa8b5);
  }

  .fi-path-bg {
    fill: none;
    stroke: var(--dot-color, #a9d9ae);
    stroke-width: 2;
    stroke-opacity: 0.15;
  }

  .fi-trace {
    fill: none;
    stroke: var(--dot-color, #a9d9ae);
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  .fi-dot {
    fill: var(--dot-color, #a9d9ae);
  }

  .fi-reduction,
  .fi-hf {
    text-align: center;
  }

  .fi-hf {
    padding-top: 14px;
    border-top: 1px solid var(--dot-color, #a9d9ae);
    width: 100%;
    max-width: 480px;
  }

  .fi-big {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 5.5rem;
    line-height: 1;
    color: var(--text-primary, #2c3e48);
    transition: color 0.9s ease;
    letter-spacing: -0.02em;
  }

  .fi-med {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 3.5rem;
    line-height: 1;
    color: var(--text-primary, #2c3e48);
    transition: color 0.9s ease;
    letter-spacing: -0.02em;
  }

  .fi-sub {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-label, #8aa8b5);
    transition: color 0.9s ease;
    margin-top: 0.5rem;
    line-height: 1.7;
  }
</style>
