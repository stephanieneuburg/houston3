<script>
  let { index, title, hideTitle = false, body = null, subheader = null, afterBody = null, children } = $props();

  const words = title.split(' ');
  const splitTitle = words.length > 3;
  const splitAt = Math.ceil(words.length / 2);
  const titleLine1 = splitTitle ? words.slice(0, splitAt).join(' ') : title;
  const titleLine2 = splitTitle ? words.slice(splitAt).join(' ') : '';
</script>

<section class="chapter" class:has-extra={!!children} class:no-body={!body} id="chapter-{index + 1}">
  <div class="chapter-inner">
    <p class="chapter-label">Chapter {index + 1}</p>
    {#if !hideTitle}
      <h2 class="chapter-title">
        {#if splitTitle}
          <span class="title-line">{titleLine1}</span>
          <br>
          <span class="title-line">{titleLine2}</span>
        {:else}
          {title}
        {/if}
      </h2>
    {/if}
    {#each (body ?? '').split('\n\n').filter(p => p.trim()) as paragraph}
      <p class="chapter-text">{paragraph}</p>
    {/each}
    {#if subheader}
      <h3 class="chapter-subheader">{subheader}</h3>
    {/if}
    {#each (afterBody ?? '').split('\n\n').filter(p => p.trim()) as paragraph}
      <p class="chapter-text">{paragraph}</p>
    {/each}
  </div>
  {#if children}
    <div class="chapter-extra">
      {@render children()}
    </div>
  {/if}
</section>

<style>
  .chapter {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 80px 100px 80px 120px;
  }

  .chapter.no-body {
    min-height: auto;
    padding-bottom: 48px;
  }

  .chapter.has-extra {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding-top: 100px;
    padding-bottom: 100px;
  }

  .chapter-extra {
    width: calc(100vw - 120px);
    margin-top: 72px;
    margin-bottom: 20px;
  }

  .chapter-inner {
    max-width: 680px;
  }

  .chapter-label {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-label, #8aa8b5);
    transition: color 0.9s ease;
    margin-bottom: 1rem;
  }

  .chapter-title {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 4rem;
    line-height: 1.2;
    color: var(--text-primary, #2c3e48);
    transition: color 0.9s ease;
    margin-bottom: 1.5rem;
  }

  .title-line {
    display: inline;
  }

  .chapter-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-body, #4e6471);
    transition: color 0.9s ease;
    margin-top: 1.2rem;
  }

  .chapter-text:first-of-type {
    margin-top: 0;
  }

  .chapter-subheader {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 2rem;
    line-height: 1.25;
    color: var(--text-primary, #2c3e48);
    transition: color 0.9s ease;
    margin-top: 3rem;
    margin-bottom: 0.25rem;
  }
</style>
