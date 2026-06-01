<script>
  import SideNav from './components/SideNav.svelte';
  import Intro   from './components/Intro.svelte';
  import Chapter from './components/Chapter.svelte';
  import Outro   from './components/Outro.svelte';
  import { chapters } from './lib/chapters.js';
</script>

<SideNav />
<Intro />

{#each chapters as chapter, i}
  <Chapter index={i} title={chapter.title} />
{/each}

<Outro />
