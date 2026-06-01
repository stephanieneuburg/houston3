<script>
  let { index, title } = $props();
</script>

<section class="chapter" id="chapter-{index + 1}">
  <div class="chapter-inner">
    <p class="chapter-label">Chapter {index + 1}</p>
    <h2 class="chapter-title">{title}</h2>
    <p class="chapter-text">Content for this chapter will be added in the next step.</p>
  </div>
</section>

<style>
  .chapter {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 80px 100px 80px 120px;
  }

  .chapter-inner {
    max-width: 680px;
  }

  .chapter-label {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8aa8b5;
    margin-bottom: 1rem;
  }

  .chapter-title {
    font-size: 2.5rem;
    line-height: 1.2;
    color: #2c3e48;
    margin-bottom: 1.5rem;
  }

  .chapter-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #4e6471;
  }
</style>
