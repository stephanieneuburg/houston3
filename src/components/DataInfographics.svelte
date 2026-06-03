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

  let sectionEl;
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
            {#each HOUSE_1960 as row}
              {#each row as cell}
                <div class="dot {cell ? 'on' : 'off'}"></div>
              {/each}
            {/each}
          </div>
        </div>
        <div class="col-year2">
          <div class="year-label">1978</div>
          <div class="stat-count">{sroCount1978.toLocaleString()} SRO's</div>
          <div class="dot-grid house-1978" style="--cols: 5">
            {#each HOUSE_1978 as row}
              {#each row as cell}
                <div class="dot {cell ? 'on' : 'off'}"></div>
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
            {#each PERSON_1965 as row}
              {#each row as cell}
                <div class="dot {cell ? 'on' : 'off'}"></div>
              {/each}
            {/each}
          </div>
        </div>
        <div class="col-year2">
          <div class="year-label">1979</div>
          <div class="stat-count">{psyCount1979.toLocaleString()} Persons</div>
          <div class="dot-grid person-1979" style="--cols: 4">
            {#each PERSON_1979 as row}
              {#each row as cell}
                <div class="dot {cell ? 'on' : 'off'}"></div>
              {/each}
            {/each}
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

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
</style>
