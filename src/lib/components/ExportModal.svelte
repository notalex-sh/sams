<script>
  import { createEventDispatcher } from 'svelte';
  import { entries } from '$lib/stores/database';
  import { downloadCSV } from '$lib/utils/export';
  
  const dispatch = createEventDispatcher();
  
  let includePasswords = false;
  let filename = 'sams_export_' + new Date().toISOString().split('T')[0] + '.csv';

  function handleExportCSV() {
    const exportEntries = $entries.map(entry => {
      if (!includePasswords) {
        return { ...entry, password: '[REDACTED]' };
      }
      return entry;
    });
    
    downloadCSV(exportEntries, filename);
    dispatch('notify', `Exported ${exportEntries.length} entries`);
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
        Export Database
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
        <label class="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">
          Export Filename
        </label>
        <input
          type="text"
          bind:value={filename}
          class="input-field"
        />
      </div>
      
      <div class="border-t border-gray-900 pt-4">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            bind:checked={includePasswords}
            class="w-4 h-4 bg-black border border-gray-700 text-cyan-400 focus:ring-0 focus:ring-offset-0"
          />
          <div>
            <span class="text-sm font-mono text-gray-300 group-hover:text-cyan-400 transition-colors">
              Include passwords
            </span>
            <p class="text-xs text-gray-600 mt-1">
              Warning: CSV exports are unencrypted plain text
            </p>
          </div>
        </label>
      </div>
      
      <div class="grid grid-cols-2 gap-3 pt-4">
        <button
          class="btn btn-primary"
          on:click={handleExportCSV}
        >
          Export CSV
        </button>
        
        <button
          class="btn"
          on:click={() => dispatch('close')}
        >
          Cancel
        </button>
      </div>
      
      <div class="border-t border-gray-900 pt-4">
        <p class="text-xs font-mono text-gray-600">
          Note: For encrypted backups, use the Save function.<br>
          CSV exports are for data portability only.
        </p>
      </div>
    </div>
  </div>
</div>