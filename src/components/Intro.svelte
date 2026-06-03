<script>
  import { onMount } from 'svelte';

  let shimmerActive = $state(false);

  onMount(() => {
    const t = setTimeout(() => (shimmerActive = true), 1200);
    return () => clearTimeout(t);
  });

  function handleShimmerEnd() {
    shimmerActive = false;
  }
</script>

<section id="intro-question">
  <p class="question">
    How can <span class="city-swap"><span class="city-inner"><span class="city-label">Houston</span><span class="city-label" class:shimmer={shimmerActive} onanimationend={handleShimmerEnd}>a US city</span></span></span> move thousands of people from the streets into apartments while the national crisis deepens?
  </p>
</section>

<style>
  #intro-question {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10vw;
  }

  .question {
    font-family: "noka", sans-serif;
    font-size: 2.9rem;
    font-weight: 300;
    color: #8aa8b5;
    line-height: 1.4;
    text-align: center;
    max-width: 860px;
  }

  .city-swap {
    display: inline-block;
    overflow: hidden;
    height: 1.4em;
    vertical-align: bottom;
    cursor: pointer;
  }

  .city-inner {
    display: flex;
    flex-direction: column;
    transform: translateY(-50%);
    transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .city-swap:hover .city-inner {
    transform: translateY(0);
  }

  .city-label {
    display: block;
    line-height: 1.4;
  }

  .city-label:first-child {
    color: #1C3056;
  }

  @keyframes city-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .city-label.shimmer {
    background: linear-gradient(
      90deg,
      #8aa8b5 30%,
      #c2d9e3 44%,
      #e8f4f8 50%,
      #c2d9e3 56%,
      #8aa8b5 70%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: city-shimmer 1.3s ease-in-out forwards;
  }
</style>
