<script>
  let { children, class: cls = '' } = $props();
</script>

<section class="scene {cls}">
  {@render children()}
</section>

<style>
  .scene {
    width: 100%;
    position: relative;
  }
</style>
