<script>
  import { createEventDispatcher } from 'svelte';
  import { generatePassword } from '$lib/utils/encryption';
  import { updateEntry } from '$lib/stores/database';
  
  const dispatch = createEventDispatcher();
  
  export let entry;
  
  let newPassword = '';
  let expiryOption = entry.expiryDays === 0 ? 'never' : 'custom';
  let customWeeks = Math.floor((entry.expiryDays || 0) / 7);
  let customDays = (entry.expiryDays || 0) % 7;
  let copied = false;
  
  $: if (!newPassword) {
    newPassword = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true
    });
  }

  function getExpiryDays() {
    switch(expiryOption) {
      case 'never': return 0;
      case 'custom': return (customWeeks || 0) * 7 + (customDays || 0);
      default: return 0;
    }
  }

  function handleRegenerate() {
    newPassword = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true
    });
    copied = false;
  }

  function handleCopy() {
    navigator.clipboard.writeText(newPassword);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function handleApply() {
    updateEntry(entry.id, {
      password: newPassword,
      passwordSetDate: new Date().toISOString(),
      expiryDays: getExpiryDays()
    });
    dispatch('notify', 'Password updated and expiry reset');
    dispatch('close');
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      dispatch('close');
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      dispatch('close');
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="modal-backdrop" on:click={handleBackdropClick}>
  <div class="modal-content">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-mono uppercase tracking-[0.2em] text-cyan-400">
        Regenerate Password
      </h2>
      <button 
        class="text-gray-500 hover:text-cyan-400 transition-colors text-xl"
        on:click={() => dispatch('close')}
      >
        ×
      </button>
    </div>
    
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
          Entry
        </label>
        <div class="text-sm font-mono text-gray-200">
          {entry.title}
        </div>
      </div>
      
      <div>
        <label class="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
          New Password
        </label>
        <div class="bg-gray-800 border border-gray-700 p-3 font-mono text-sm text-cyan-300 break-all">
          {newPassword}
        </div>
        <div class="flex gap-2 mt-2">
          <button
            class="btn flex-1"
            on:click={handleRegenerate}
          >
            Regenerate
          </button>
          <button
            class="btn flex-1"
            class:btn-success={copied}
            on:click={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div>
        <label class="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
          Password Expiry
        </label>
        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input type="radio" bind:group={expiryOption} value="never" class="radio-input" />
            <span class="text-sm font-mono text-gray-200">Never expire</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" bind:group={expiryOption} value="custom" class="radio-input" />
            <span class="text-sm font-mono text-gray-200">Custom:</span>
            {#if expiryOption === 'custom'}
              <input 
                type="number" 
                bind:value={customWeeks}
                min="0"
                class="input-field w-20 py-1"
              />
              <span class="text-sm font-mono text-gray-400">weeks</span>
              <input 
                type="number" 
                bind:value={customDays}
                min="0"
                max="6"
                class="input-field w-20 py-1"
              />
              <span class="text-sm font-mono text-gray-400">days</span>
            {/if}
          </label>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800">
        <button
          class="btn btn-primary"
          on:click={handleApply}
        >
          Apply Password
        </button>
        
        <button
          class="btn"
          on:click={() => dispatch('close')}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .radio-input {
    width: 0.75rem;
    height: 0.75rem;
    background-color: #111827;
    border: 1px solid #374151;
    color: #06b6d4;
  }
  
  .radio-input:focus {
    ring: 0;
  }
</style>