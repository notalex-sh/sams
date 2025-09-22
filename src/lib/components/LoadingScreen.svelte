<script>
  import { isProcessing, processingMessage } from '$lib/stores/database';
</script>

{#if $isProcessing}
  <div class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="text-sm font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
        {$processingMessage || 'Processing...'}
      </p>
    </div>
  </div>
{/if}

<style>
  .loading-screen {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(12px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fade-in 0.2s ease-out;
  }
  
  .loading-content {
    text-align: center;
  }
  
  .loading-spinner {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 1rem;
    border: 4px solid rgb(55, 65, 81);
    border-top-color: rgb(6, 182, 212);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>