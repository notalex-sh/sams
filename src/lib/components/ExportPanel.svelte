<script>
  import { createEventDispatcher } from 'svelte';
  import { entries } from '$lib/stores/database';
  import { downloadCSV } from '$lib/utils/export';
  
  const dispatch = createEventDispatcher();
  
  let includePasswords = false;
  let filename = 'sams_export.csv';

  function handleExportCSV() {
    if (!includePasswords) {
      if (!confirm('Export without passwords? You can change this setting below.')) {
        return;
      }
    }

    const exportEntries = $entries.map(entry => {
      if (!includePasswords) {
        return { ...entry, password: '' };
      }
      return entry;
    });
    
    downloadCSV(exportEntries, filename);
    dispatch('notify', `Exported ${exportEntries.length} entries to CSV`);
  }
  
  async function handleExportJSON() {
    dispatch('notify', 'Use "Save Database" to export encrypted JSON');
  }
</script>

<div class="card mt-6">
  <h3 class="mb-4 text-lg font-bold uppercase tracking-wider text-white">
    Export Options
  </h3>
  
  <div class="space-y-4">
    <div>
      <label class="mb-2 block text-xs uppercase tracking-wide text-gray-400">
        Export Filename
      </label>
      <input
        type="text"
        bind:value={filename}
        class="input-field"
      />
    </div>
    
    <div>
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          bind:checked={includePasswords}
        />
        <span class="text-gray-300">Include passwords in export</span>
      </label>
      <p class="mt-1 text-xs text-gray-500">
        Warning: CSV files are not encrypted. Only include passwords if you will store the file securely.
      </p>
    </div>
    
    <div class="space-y-3">
      <button
        class="btn w-full"
        on:click={handleExportCSV}
      >
        Export to CSV
      </button>
      
      <button
        class="btn w-full"
        on:click={handleExportJSON}
      >
        Export Encrypted (JSON)
      </button>
    </div>
    
    <div class="border-t border-sams-border pt-4">
      <p class="text-xs text-gray-500">
        <strong>CSV Export:</strong> Unencrypted, compatible with spreadsheet apps<br>
        <strong>JSON Export:</strong> Encrypted with your master password, secure backup
      </p>
    </div>
  </div>
</div>