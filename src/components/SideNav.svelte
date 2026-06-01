<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  import { CLUSTER_HEIGHT, DOTS_PER_CLUSTER, LINE_CONTAINER, UNIT } from '../lib/navConfig.js';
  import { chapters } from '../lib/chapters.js';

  gsap.registerPlugin(ScrollTrigger);

  const NUM_CHAPTERS = chapters.length;
  const OUTRO_INDICATOR_END = NUM_CHAPTERS * UNIT + CLUSTER_HEIGHT / 2 + 70;

  let navEl;
  let indicatorEl;
  let navLines = [];
  let outroActive = false;

  // Build arrays for the template
  const clusters = Array.from({ length: NUM_CHAPTERS + 1 }, (_, i) => i);
  const dots     = Array.from({ length: DOTS_PER_CLUSTER }, (_, i) => i);
  const lines    = Array.from({ length: NUM_CHAPTERS }, (_, i) => i);

  function updateNav() {
    if (outroActive) return;

    const mid = window.innerHeight / 2;
    let activeChapter     = 0;
    let progressInChapter = 0;

    const chapterEls = document.querySelectorAll('.chapter');

    for (let i = 0; i < chapterEls.length; i++) {
      const rect = chapterEls[i].getBoundingClientRect();
      if (rect.bottom < mid) {
        activeChapter     = i;
        progressInChapter = 1;
      } else if (rect.top <= mid) {
        activeChapter     = i;
        progressInChapter = Math.max(0, Math.min(1, (mid - rect.top) / rect.height));
        break;
      }
    }

    navLines.forEach((line, i) => {
      if (!line) return;
      line.classList.toggle('active', i === activeChapter);
    });

    const centerY = (activeChapter + progressInChapter) * UNIT + CLUSTER_HEIGHT / 2;
    indicatorEl.style.top = `${centerY}px`;
  }

  onMount(() => {
    // ── Intro animation ──
    gsap.set('.nav-cluster, .nav-line', { opacity: 0, x: -10 });

    const introTl = gsap.timeline({ paused: true })
      .to('.nav-cluster, .nav-line', {
        opacity: 1, x: 0,
        stagger: { each: 0.035, from: 'start' },
        duration: 0.5,
        ease: 'power3.out',
      });

    introTl.play();

    ScrollTrigger.create({
      trigger: '#intro',
      start: 'top bottom',
      end: 'bottom top',
      onEnterBack: () => introTl.reverse(),
      onLeave:     () => introTl.play(),
    });

    // ── Outro animation ──
    const outroTl = gsap.timeline({
      paused: true,
      onStart:           () => { outroActive = true; },
      onReverseComplete: () => {
        outroActive = false;
        gsap.set(indicatorEl, { clearProps: 'top' });
        updateNav();
      },
    })
    .to('.nav-cluster, .nav-line', {
      opacity: 0, y: -10,
      stagger: { each: 0.03, from: 'start' },
      duration: 0.7,
      ease: 'power2.in',
    }, 0)
    .to(indicatorEl, {
      top: OUTRO_INDICATOR_END,
      duration: 0.55,
      ease: 'power1.in',
    }, 0.25);

    ScrollTrigger.create({
      trigger: '#outro',
      start: 'top bottom',
      end: 'bottom top',
      onEnter:     () => outroTl.play(),
      onLeaveBack: () => outroTl.reverse(),
    });

    // ── Chapter scroll tracking ──
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    return () => {
      window.removeEventListener('scroll', updateNav);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  });
</script>

<nav class="side-nav" bind:this={navEl} aria-label="Chapter navigation">
  <div class="nav-indicator" bind:this={indicatorEl} aria-hidden="true"></div>

  {#each clusters as clusterIdx}
    <div class="nav-cluster">
      {#each dots as _}
        <div class="nav-dot"></div>
      {/each}
    </div>

    {#if clusterIdx < NUM_CHAPTERS}
      <div
        class="nav-line"
        bind:this={navLines[clusterIdx]}
        onclick={() => document.getElementById(`chapter-${clusterIdx + 1}`)?.scrollIntoView({ behavior: 'smooth' })}
        role="button"
        tabindex="0"
        aria-label="Go to chapter {clusterIdx + 1}"
      >
        <div class="nav-dot"></div>
        <span class="chapter-label">{chapters[clusterIdx].title}</span>
      </div>
    {/if}
  {/each}
</nav>

<style>
  .side-nav {
    position: fixed;
    left: 44px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    z-index: 100;
  }

  .nav-cluster {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }

  .nav-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #a9d9ae;
    flex-shrink: 0;
  }

  .nav-line {
    width: 24px;
    flex-shrink: 0;
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .nav-line::before {
    content: '';
    position: absolute;
    inset: -16px -20px;
  }

  .nav-line:hover::after {
    height: 3px;
    background: #7a7a7a;
  }

  .nav-line::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    height: 1px;
    background: #4a4a4a;
    border-radius: 1px;
    transition: height 0.3s ease;
  }

  :global(.nav-line.active)::after {
    height: 3px;
  }

  .chapter-label {
    position: absolute;
    right: calc(100% + 10px);
    top: 50%;
    writing-mode: vertical-lr;
    transform: translateY(-50%) rotate(180deg);
    white-space: nowrap;
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-weight: 300;
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    color: #4a4a4a;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    user-select: none;
  }

  .nav-line:hover .chapter-label {
    opacity: 1;
  }

  .nav-indicator {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #80ff00;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    top: 4px;
    z-index: 1;
    box-shadow: 0 0 14px rgba(128, 255, 0, 0.5);
    pointer-events: none;
  }
</style>
