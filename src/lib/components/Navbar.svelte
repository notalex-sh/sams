<script>
  import { createEventDispatcher } from 'svelte';
  import { isDirty, saveDatabase, logout } from '$lib/stores/database';
  
  const dispatch = createEventDispatcher();

  async function handleSave() {
    try {
      await saveDatabase();
      dispatch('action', { action: 'notify', message: 'Database saved' });
    } catch (error) {
      dispatch('action', { action: 'notify', message: 'Save failed: ' + error.message });
    }
  }

  function handleLogout() {
    if ($isDirty && !confirm('Unsaved changes. Logout anyway?')) {
      return;
    }
    logout();
    dispatch('action', { action: 'notify', message: 'Session terminated' });
  }

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      if ($isDirty) handleSave();
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<nav class="border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm sticky top-0 z-30">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-12">
      <div class="flex items-center gap-2">
        <button 
          class="btn px-3 py-1.5"
          class:btn-success={$isDirty}
          on:click={handleSave}
          disabled={!$isDirty}
        >
          <span class="flex items-center gap-2">
            Save
            {#if $isDirty}
              <span class="w-1.5 h-1.5 bg-yellow-400 animate-pulse"></span>
            {/if}
          </span>
        </button>
        
        <button 
          class="btn px-3 py-1.5"
          on:click={() => dispatch('action', { action: 'export' })}
        >
          Export
        </button>
        
        <button 
          class="btn px-3 py-1.5"
          on:click={() => window.location.reload()}
        >
          Switch DB
        </button>
      </div>
      
      <div class="flex items-center gap-2">
        <div class="text-xs font-mono text-gray-500 mr-4">
          <kbd class="px-1.5 py-0.5 bg-gray-800 border border-gray-700 text-gray-400">Ctrl</kbd>
          <span class="mx-1">+</span>
          <kbd class="px-1.5 py-0.5 bg-gray-800 border border-gray-700 text-gray-400">S</kbd>
          <span class="ml-2 text-gray-500">to save</span>
        </div>
        
        <button 
          class="btn btn-danger px-3 py-1.5"
          on:click={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</nav>