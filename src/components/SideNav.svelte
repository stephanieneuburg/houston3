<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  import { CLUSTER_HEIGHT, DOTS_PER_CLUSTER } from '../lib/navConfig.js';
  import { chapters } from '../lib/chapters.js';

  gsap.registerPlugin(ScrollTrigger);

  const NUM_CHAPTERS     = chapters.length;
  const BASE_LINE_HEIGHT = 8;   // px — default nav-line height (= dot height)
  const MIN_LINE_HEIGHT  = 4;   // px — floor so no chapter disappears entirely

  let navEl;
  let indicatorEl;
  let navLines    = [];
  let outroActive = false;
  let navPositions = []; // Y-center of each cluster boundary [0..NUM_CHAPTERS]
  let outroTl         = null;
  let outroEl;
  let outroShouldPlay = false;

  const clusters = Array.from({ length: NUM_CHAPTERS + 1 }, (_, i) => i);
  const dots     = Array.from({ length: DOTS_PER_CLUSTER });

  // ── Nav position math ──
  // Distance from cluster[i] center to cluster[i+1] center:
  //   CLUSTER_HEIGHT/2 + 1px gap + lineHeight + 1px gap + CLUSTER_HEIGHT/2
  function buildNavPositions(lineHeights) {
    const positions = [CLUSTER_HEIGHT / 2];
    for (let i = 0; i < NUM_CHAPTERS; i++) {
      const prev = positions[positions.length - 1];
      positions.push(prev + CLUSTER_HEIGHT + 2 + lineHeights[i]);
    }
    return positions;
  }

  // Measure chapter pixel heights, scale proportionally so the total
  // line-height budget stays constant (NUM_CHAPTERS × BASE_LINE_HEIGHT).
  function measureAndBuild() {
    const chapterEls = document.querySelectorAll('.chapter');
    if (!chapterEls.length) return;

    const heights = Array.from(chapterEls).map(el => el.getBoundingClientRect().height);
    const total   = heights.reduce((a, b) => a + b, 0);
    const budget  = NUM_CHAPTERS * BASE_LINE_HEIGHT;

    const lineHeights = heights.map(h =>
      Math.max(MIN_LINE_HEIGHT, Math.round(budget * h / total))
    );

    navLines.forEach((line, i) => {
      if (line) line.style.height = lineHeights[i] + 'px';
    });

    navPositions = buildNavPositions(lineHeights);
  }

  // ── Scroll tracking ──
  function updateNav() {
    if (outroEl) {
      const isAtOutro = outroEl.getBoundingClientRect().top <= 0;
      if (isAtOutro !== outroShouldPlay) {
        outroShouldPlay = isAtOutro;
        if (isAtOutro) {
          if (!outroTl) outroTl = buildOutroTl();
          outroTl.play();
        } else {
          outroTl?.reverse();
        }
      }
    }

    if (outroActive || !navPositions.length) return;

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
      if (line) line.classList.toggle('active', i === activeChapter);
    });

    const y = navPositions[activeChapter] +
              progressInChapter * (navPositions[activeChapter + 1] - navPositions[activeChapter]);
    indicatorEl.style.top = `${y}px`;
  }

  // ── Outro timeline (lazy — built after positions are known) ──
  function buildOutroTl() {
    const end = navPositions[NUM_CHAPTERS] + 70;
    return gsap.timeline({
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
      top: end,
      duration: 0.55,
      ease: 'power1.in',
    }, 0.25);
  }

  onMount(() => {
    // ── Intro animation ──
    gsap.set('.nav-cluster, .nav-line', { opacity: 0, y: -10 });

    const introTl = gsap.timeline({ paused: true })
      .to('.nav-cluster, .nav-line', {
        opacity: 1, y: 0,
        stagger: { each: 0.035, from: 'start' },
        duration: 0.5,
        ease: 'power3.out',
      });

    const myTriggers = [];

    // Ball starts near viewport top, scrubs down to first nav position as intro scrolls by
    requestAnimationFrame(() => {
      const navRect = navEl.getBoundingClientRect();
      const viewportStartTop = 40 - navRect.top;   // ball at y=40 in viewport
      const targetTop        = CLUSTER_HEIGHT / 2; // first cluster center in nav

      gsap.set(indicatorEl, { top: viewportStartTop });

      myTriggers.push(ScrollTrigger.create({
        trigger: '#intro-question',
        start: 'top top',
        end: 'bottom center',
        scrub: 0.6,
        onUpdate(self) {
          if (!outroActive) {
            gsap.set(indicatorEl, {
              top: viewportStartTop + self.progress * (targetTop - viewportStartTop),
            });
          }
        },
        onLeave() {
          gsap.set(indicatorEl, { top: targetTop });
        },
        onEnterBack() {
          gsap.set(indicatorEl, { top: viewportStartTop });
        },
      }));
    });

    introTl.play();

    myTriggers.push(ScrollTrigger.create({
      trigger: '#intro-question',
      start: 'top bottom',
      end: 'bottom top',
      onEnterBack: () => introTl.reverse(),
      onLeave:     () => introTl.play(),
    }));

    outroEl = document.getElementById('outro');

    window.addEventListener('scroll', updateNav, { passive: true });

    // Measure after the browser has laid out sibling chapter elements
    requestAnimationFrame(() => {
      measureAndBuild();
      updateNav();
    });

    return () => {
      window.removeEventListener('scroll', updateNav);
      myTriggers.forEach(t => t.kill());
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
        <span class="chapter-label">{chapters[clusterIdx].navLabel ?? chapters[clusterIdx].title}</span>
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
    background: var(--dot-color, #a9d9ae);
    flex-shrink: 0;
    transition: background 0.9s ease;
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
    background: var(--indicator-color, #80ff00);
    transition: background 0.9s ease;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    top: 4px;
    z-index: 1;
    pointer-events: none;
  }
</style>
