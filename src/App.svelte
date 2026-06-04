<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  import SideNav from './components/SideNav.svelte';
  import Intro   from './components/Intro.svelte';
  import HomelessnessMap from './components/HomelessnessMap.svelte';
  import DataInfographics from './components/DataInfographics.svelte';
  import HoustonFocusMap from './components/HoustonFocusMap.svelte';
  import HousingSuccess from './components/HousingSuccess.svelte';
  import S11_WayHome from './scenes/S11_WayHome.svelte';
  import WelfareStates from './components/WelfareStates.svelte';
  import FinlandInfographic from './components/FinlandInfographic.svelte';
  import Chapter from './components/Chapter.svelte';
  import Outro   from './components/Outro.svelte';
  import { chapters } from './lib/chapters.js';

  gsap.registerPlugin(ScrollTrigger);

  const ALT_CHAPTERS = ['#chapter-2', '#chapter-4', '#chapter-8'];

  onMount(() => {
    const triggers = ALT_CHAPTERS.map(id => ScrollTrigger.create({
      trigger: id,
      start: 'top center',
      end: 'bottom 70%',
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
  {:else if i === 6}
    <Chapter index={i} title={chapter.title} hideTitle={chapter.hideTitle} body={chapter.body}>
      {#snippet children()}<WelfareStates />{/snippet}
    </Chapter>
  {:else}
    <Chapter index={i} title={chapter.title} hideTitle={chapter.hideTitle} body={chapter.body} subheader={chapter.subheader} afterBody={chapter.afterBody} />
  {/if}
  {#if i === 2}
    <DataInfographics />
  {/if}
  {#if i === 4}
    <HoustonFocusMap />
    <HousingSuccess />
  {/if}
  {#if i === 5}
    <S11_WayHome />
  {/if}
  {#if i === 6}
    <FinlandInfographic />
  {/if}
{/each}

<Outro />
