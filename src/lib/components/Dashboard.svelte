<script>
  import { createEventDispatcher } from 'svelte';
  import EntryForm from './EntryForm.svelte';
  import EntryCard from './EntryCard.svelte';
  import { 
    filteredEntries, 
    stats, 
    allTags,
    searchQuery,
    selectedTag,
    activeTab
  } from '$lib/stores/database';
  
  const dispatch = createEventDispatcher();
  
  const tabs = [
    { id: 'all', label: 'ALL' },
    { id: 'logins', label: 'LOGINS' },
    { id: 'bookmarks', label: 'BOOKMARKS' },
    { id: 'expiring', label: 'EXPIRING', highlight: true }
  ];
</script>

<div class="max-w-7xl mx-auto">
  <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <div class="bg-gray-900 border border-gray-800 p-3 hover:border-cyan-400/30 transition-all">
      <div class="text-2xl font-mono text-cyan-400">{$stats.total}</div>
      <div class="text-[10px] font-mono uppercase tracking-wider text-gray-500">Total</div>
    </div>
    <div class="bg-gray-900 border border-gray-800 p-3 hover:border-cyan-400/30 transition-all">
      <div class="text-2xl font-mono text-cyan-400">{$stats.logins}</div>
      <div class="text-[10px] font-mono uppercase tracking-wider text-gray-500">Logins</div>
    </div>
    <div class="bg-gray-900 border border-gray-800 p-3 hover:border-cyan-400/30 transition-all">
      <div class="text-2xl font-mono text-cyan-400">{$stats.bookmarks}</div>
      <div class="text-[10px] font-mono uppercase tracking-wider text-gray-500">Bookmarks</div>
    </div>
    <div class="bg-gray-900 border border-gray-800 p-3 hover:border-yellow-400/30 transition-all">
      <div class="text-2xl font-mono text-yellow-400">{$stats.expiring}</div>
      <div class="text-[10px] font-mono uppercase tracking-wider text-gray-500">Expiring</div>
    </div>
    {#if $stats.expired > 0}
      <div class="bg-gray-900 border border-red-400/30 p-3">
        <div class="text-2xl font-mono text-red-400 animate-pulse">{$stats.expired}</div>
        <div class="text-[10px] font-mono uppercase tracking-wider text-gray-500">Expired</div>
      </div>
    {/if}
  </div>

  <div class="grid lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1">
      <EntryForm on:notify={(e) => dispatch('notify', e.detail)} />
    </div>

    <div class="lg:col-span-2">
      <div class="flex border-b border-gray-900 mb-4">
        {#each tabs as tab}
          <button
            class="px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all"
            class:bg-gray-950={$activeTab === tab.id}
            class:text-cyan-400={$activeTab === tab.id}
            class:text-gray-600={$activeTab !== tab.id}
            class:border-t={$activeTab === tab.id}
            class:border-l={$activeTab === tab.id}
            class:border-r={$activeTab === tab.id}
            class:border-cyan-400={$activeTab === tab.id && !tab.highlight}
            class:border-yellow-400={$activeTab === tab.id && tab.highlight}
            class:hover:text-gray-400={$activeTab !== tab.id}
            on:click={() => $activeTab = tab.id}
          >
            {tab.label}
            {#if tab.id === 'expiring' && $stats.expiring > 0}
              <span class="ml-2 px-1 py-0.5 bg-yellow-400/20 text-yellow-400 text-[10px]">
                {$stats.expiring}
              </span>
            {/if}
          </button>
        {/each}
      </div>
      <div class="flex gap-3 mb-4">
        <input
          type="text"
          bind:value={$searchQuery}
          placeholder="SEARCH..."
          class="input-field flex-1"
        />
        <select 
          bind:value={$selectedTag}
          class="input-field w-32"
        >
          <option value="">ALL TAGS</option>
          {#each $allTags as tag}
            <option value={tag}>{tag}</option>
          {/each}
        </select>
      </div>

      <div class="space-y-3 custom-scrollbar" style="max-height: calc(100vh - 400px); overflow-y: auto;">
        {#if $filteredEntries.length === 0}
          <div class="card text-center py-12">
            <p class="text-gray-600 font-mono text-sm">
              {$searchQuery || $selectedTag ? 'NO MATCHES FOUND' : 'NO ENTRIES'}
            </p>
          </div>
        {:else}
          {#each $filteredEntries as entry (entry.id)}
            <div class="animate-slide-up">
              <EntryCard 
                {entry} 
                on:notify={(e) => dispatch('notify', e.detail)}
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>