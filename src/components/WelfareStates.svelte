<script>
  const columns = [
    {
      type: 'Social Democratic',
      examples: 'e.g., Sweden, Denmark',
      description: 'Universal benefits, high taxes, extensive state intervention, often called "cradle to grave" care',
    },
    {
      type: 'Conservative-Corporatist',
      examples: 'e.g., Germany, France',
      description: 'Benefits tied to employment status and contributions',
    },
    {
      type: 'Liberal',
      examples: 'e.g., US, UK',
      description: 'Targeted, means-tested assistance with a stronger focus on market-based solutions',
    },
  ];
</script>

<div class="welfare-states">
  <h3 class="welfare-header">Welfare States</h3>
  <div class="welfare-columns">
    {#each columns as col, i}
      {#if i > 0}
        <div class="col-divider"></div>
      {/if}
      <div class="welfare-col">
        <p class="col-type">{col.type}</p>
        <p class="col-examples">{col.examples}</p>
        <p class="col-description">{col.description}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  .welfare-states {
    width: 100%;
  }

  .welfare-header {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-label, #8aa8b5);
    transition: color 0.9s ease;
    margin-bottom: 2rem;
  }

  .welfare-columns {
    display: flex;
    align-items: flex-start;
    gap: 0;
  }

  .welfare-col {
    flex: 1;
    min-width: 0;
    padding-right: 48px;
  }

  .welfare-col:last-child {
    padding-right: 0;
  }

  .col-divider {
    flex-shrink: 0;
    width: 1px;
    align-self: stretch;
    min-height: 120px;
    background: var(--dot-color);
    opacity: 0.3;
    margin: 0 48px;
    transition: background 0.9s ease;
  }

  .col-type {
    font-family: "noka", sans-serif;
    font-weight: 300;
    font-size: 1.6rem;
    line-height: 1.25;
    color: var(--text-primary, #2c3e48);
    transition: color 0.9s ease;
    margin-bottom: 0.5rem;
  }

  .col-examples {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-label, #8aa8b5);
    transition: color 0.9s ease;
    margin-bottom: 1.2rem;
  }

  .col-description {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text-body, #4e6471);
    transition: color 0.9s ease;
  }
</style>
