<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  import SideNav from './components/SideNav.svelte';
  import Intro   from './components/Intro.svelte';
  import HomelessnessMap from './components/HomelessnessMap.svelte';
  import DataInfographics from './components/DataInfographics.svelte';
  import Chapter from './components/Chapter.svelte';
  import Outro   from './components/Outro.svelte';
  import { chapters } from './lib/chapters.js';

  gsap.registerPlugin(ScrollTrigger);

  const ALT_CHAPTERS = ['#chapter-2', '#chapter-4', '#chapter-8'];

  onMount(() => {
    const triggers = ALT_CHAPTERS.map(id => ScrollTrigger.create({
      trigger: id,
      start: 'top center',
      end: 'bottom center',
      onEnter:     () => document.body.classList.add('chapter-alt-theme'),
      onLeave:     () => document.body.classList.remove('chapter-alt-theme'),
      onEnterBack: () => document.body.classList.add('chapter-alt-theme'),
      onLeaveBack: () => document.body.classList.remove('chapter-alt-theme'),
    }));

    return () => triggers.forEach(t => t.kill());
  });
</script>

<SideNav />
<Intro />

{#each chapters as chapter, i}
  {#if i === 0}
    <Chapter index={i} title={chapter.title} hideTitle={chapter.hideTitle} body={chapter.body}>
      {#snippet children()}<HomelessnessMap />{/snippet}
    </Chapter>
  {:else}
    <Chapter index={i} title={chapter.title} hideTitle={chapter.hideTitle} body={chapter.body} />
  {/if}
  {#if i === 2}
    <DataInfographics />
  {/if}
{/each}

<Outro />
