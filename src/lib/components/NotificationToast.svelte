<script>
  import { onMount } from 'svelte';
  
  export let show = false;
  export let message = '';
  export let duration = 3000;
  
  let timeout;
  
  $: if (show) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      show = false;
    }, duration);
  }
  
  onMount(() => {
    return () => clearTimeout(timeout);
  });
</script>

{#if show}
  <div class="fixed top-20 right-4 z-50 animate-slide-in-right">
    <div class="bg-black border border-cyan-400 px-6 py-3 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
      <p class="font-mono text-xs uppercase tracking-widest text-cyan-400">
        {message}
      </p>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.2s ease-out;
  }
</style>