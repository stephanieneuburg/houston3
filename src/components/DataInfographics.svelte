<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  const HOUSE_1960 = [
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,0],
    [0,1,1,0,0,0,1,1,0],
    [0,1,1,0,0,0,1,1,0],
    [0,1,1,1,1,1,1,1,0],
  ];
  const HOUSE_1978 = [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
  ];

  const PERSON_1965 = [
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
  ];
  const PERSON_1979 = [
    [0,1,1,0],
    [1,1,1,1],
    [1,1,1,1],
    [0,1,1,0],
  ];

  // Returns a 2D array of inline style strings — darker at center, lighter at edge, with random jitter.
  // Uses filter:brightness so it works with any theme color automatically.
  function buildDepthStyles(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const cr = (rows - 1) / 2;
    const cc = (cols - 1) / 2;
    const maxDist = Math.sqrt(cr * cr + cc * cc) || 1;
    return grid.map((row, r) =>
      row.map((cell, c) => {
        if (!cell) return '';
        const t = Math.sqrt((r - cr) ** 2 + (c - cc) ** 2) / maxDist; // 0=center, 1=edge
        const jitter = (Math.random() - 0.5) * 0.18;
        const b = Math.min(1.15, Math.max(0.28, 0.48 + t * 0.57 + jitter));
        return `filter: brightness(${b.toFixed(2)});`;
      })
    );
  }

  const styles1960 = buildDepthStyles(HOUSE_1960);
  const styles1978 = buildDepthStyles(HOUSE_1978);
  const styles1965 = buildDepthStyles(PERSON_1965);
  const styles1979 = buildDepthStyles(PERSON_1979);

  let sectionEl;
  let statEl;
  let sroCount1960 = $state(0);
  let sroCount1978 = $state(0);
  let psyCount1965 = $state(0);
  let psyCount1979 = $state(0);

  onMount(() => {
    const d1960  = sectionEl.querySelectorAll('.house-1960 .dot.on');
    const d1978  = sectionEl.querySelectorAll('.house-1978 .dot.on');
    const dp1965 = sectionEl.querySelectorAll('.person-1965 .dot.on');
    const dp1979 = sectionEl.querySelectorAll('.person-1979 .dot.on');

    const sroTitle = sectionEl.querySelector('.sro-panel .panel-title');
    const sroCol1  = sectionEl.querySelector('.sro-panel .col-year1');
    const sroCol2  = sectionEl.querySelector('.sro-panel .col-year2');
    const psyTitle = sectionEl.querySelector('.psy-panel .panel-title');
    const psyCol1  = sectionEl.querySelector('.psy-panel .col-year1');
    const psyCol2  = sectionEl.querySelector('.psy-panel .col-year2');

    const c1 = { val: 0 }, c2 = { val: 0 };
    const c3 = { val: 0 }, c4 = { val: 0 };

    gsap.set([d1960, d1978, dp1965, dp1979], { opacity: 0, scale: 0 });
    gsap.set([sroTitle, psyTitle], { opacity: 0, y: 14 });
    gsap.set([sroCol1, psyCol1], { opacity: 0, x: -18 });
    gsap.set([sroCol2, psyCol2], { opacity: 0, x: 18 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        pin: true,
        start: 'top top',
        end: '+=3600',
        scrub: 1,
        anticipatePin: 1,
      }
    });

    // SRO phase
    tl.to(sroTitle, { opacity: 1, y: 0, duration: 1.5 })
      .to(sroCol1, { opacity: 1, x: 0, duration: 1.5 }, '-=0.8')
      .to(c1, { val: 129000, duration: 3,
          onUpdate() { sroCount1960 = Math.round(c1.val); } }, '<')
      .to(d1960, { opacity: 1, scale: 1,
          stagger: { each: 0.04, from: 'start' }, duration: 0.6, ease: 'back.out(1.5)' }, '<0.5')
      .to(sroCol2, { opacity: 1, x: 0, duration: 1.5 }, '+=1.5')
      .to(c2, { val: 25000, duration: 2.5,
          onUpdate() { sroCount1978 = Math.round(c2.val); } }, '<')
      .to(d1978, { opacity: 1, scale: 1,
          stagger: { each: 0.08, from: 'start' }, duration: 0.6, ease: 'back.out(1.5)' }, '<0.5')

    // Psychiatric phase — appears after a clear pause
      .to(psyTitle, { opacity: 1, y: 0, duration: 1.5 }, '+=2.5')
      .to(psyCol1, { opacity: 1, x: 0, duration: 1.5 }, '-=0.8')
      .to(c3, { val: 85000, duration: 3,
          onUpdate() { psyCount1965 = Math.round(c3.val); } }, '<')
      .to(dp1965, { opacity: 1, scale: 1,
          stagger: { each: 0.04, from: 'start' }, duration: 0.6, ease: 'back.out(1.5)' }, '<0.5')
      .to(psyCol2, { opacity: 1, x: 0, duration: 1.5 }, '+=1.5')
      .to(c4, { val: 27000, duration: 2.5,
          onUpdate() { psyCount1979 = Math.round(c4.val); } }, '<')
      .to(dp1979, { opacity: 1, scale: 1,
          stagger: { each: 0.08, from: 'start' }, duration: 0.6, ease: 'back.out(1.5)' }, '<0.5');

    // Stat reveal
    const statNumber = statEl.querySelector('.stat-number');
    const statLabel  = statEl.querySelector('.stat-label');
    gsap.set([statNumber, statLabel], { opacity: 0 });

    gsap.timeline({
      scrollTrigger: {
        trigger: statEl,
        start: 'top 65%',
        toggleActions: 'play none none reverse',
      }
    })
    .to(statNumber, { opacity: 1, duration: 1.1, ease: 'power2.out' })
    .to(statLabel,  { opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.5');

    return () => { tl.kill(); };
  });
</script>

<section class="data-section" bind:this={sectionEl}>
  <div class="panels-wrapper">

    <!-- SRO Housing panel -->
    <div class="panel sro-panel">
      <h3 class="panel-title">Single-room<br>Occupancy Units</h3>
      <div class="years-row">
        <div class="col-year1">
          <div class="year-label">1960</div>
          <div class="stat-count">{sroCount1960.toLocaleString()} SRO's</div>
          <div class="dot-grid house-1960" style="--cols: 9">
            {#each HOUSE_1960 as row, r}
              {#each row as cell, c}
                <div class="dot {cell ? 'on' : 'off'}" style={cell ? styles1960[r][c] : ''}></div>
              {/each}
            {/each}
          </div>
        </div>
        <div class="col-year2">
          <div class="year-label">1978</div>
          <div class="stat-count">{sroCount1978.toLocaleString()} SRO's</div>
          <div class="dot-grid house-1978" style="--cols: 5">
            {#each HOUSE_1978 as row, r}
              {#each row as cell, c}
                <div class="dot {cell ? 'on' : 'off'}" style={cell ? styles1978[r][c] : ''}></div>
              {/each}
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div class="panel-divider"></div>

    <!-- Psychiatric Facilities panel -->
    <div class="panel psy-panel">
      <h3 class="panel-title">Persons in Psychiatric<br>Facilities</h3>
      <div class="years-row">
        <div class="col-year1">
          <div class="year-label">1965</div>
          <div class="stat-count">{psyCount1965.toLocaleString()} Persons</div>
          <div class="dot-grid person-1965" style="--cols: 7">
            {#each PERSON_1965 as row, r}
              {#each row as cell, c}
                <div class="dot {cell ? 'on' : 'off'}" style={cell ? styles1965[r][c] : ''}></div>
              {/each}
            {/each}
          </div>
        </div>
        <div class="col-year2">
          <div class="year-label">1979</div>
          <div class="stat-count">{psyCount1979.toLocaleString()} Persons</div>
          <div class="dot-grid person-1979" style="--cols: 4">
            {#each PERSON_1979 as row, r}
              {#each row as cell, c}
                <div class="dot {cell ? 'on' : 'off'}" style={cell ? styles1979[r][c] : ''}></div>
              {/each}
            {/each}
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

<div class="stat-reveal" bind:this={statEl}>
  <p class="stat-number">
    <svg class="stat-arrow" viewBox="0 0 44 92" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="22" y1="2"  x2="22" y2="73" stroke="currentColor" stroke-width="5" stroke-linecap="square"/>
      <line x1="4"  y1="59" x2="22" y2="77" stroke="currentColor" stroke-width="5" stroke-linecap="square"/>
      <line x1="40" y1="59" x2="22" y2="77" stroke="currentColor" stroke-width="5" stroke-linecap="square"/>
    </svg>
    68%
  </p>
  <p class="stat-label">Number of patients in state psychiatric<br>facilities declined massively</p>
</div>

<style>
  .data-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 80px 100px 80px 120px;
    background: var(--bg-color);
    transition: background 0.9s ease;
    overflow: hidden;
  }

  .panels-wrapper {
    display: flex;
    align-items: flex-start;
    width: 100%;
  }

  .panel {
    flex: 1;
    min-width: 0;
  }

  .panel-divider {
    flex-shrink: 0;
    width: 1px;
    align-self: stretch;
    min-height: 280px;
    background: var(--dot-color);
    opacity: 0.35;
    margin: 0 60px;
    transition: background 0.9s ease;
  }

  .panel-title {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 1.6rem;
    color: var(--text-primary);
    margin-bottom: 44px;
    line-height: 1.3;
    transition: color 0.9s ease;
  }

  .years-row {
    display: flex;
    gap: 64px;
    align-items: flex-start;
  }

  .year-label {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 3.5rem;
    line-height: 1;
    color: var(--text-primary);
    margin-bottom: 6px;
    transition: color 0.9s ease;
  }

  .stat-count {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-label);
    margin-bottom: 28px;
    transition: color 0.9s ease;
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

  .stat-reveal {
    min-height: 180vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 100px 80px 120px;
  }

  .stat-number {
    display: flex;
    align-items: baseline;
    gap: 0.22em;
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 20rem;
    line-height: 1;
    color: var(--text-primary);
    transition: color 0.9s ease;
    margin-bottom: 2rem;
    letter-spacing: -0.02em;
  }

  .stat-arrow {
    height: 0.73em;
    width: auto;
    flex-shrink: 0;
    color: currentColor;
  }

  .stat-label {
    font-size: 1.8rem;
    line-height: 1.6;
    color: var(--text-body);
    transition: color 0.9s ease;
    max-width: 800px;
  }
</style>
