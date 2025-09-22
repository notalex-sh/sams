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
  
  let entriesContainer;
</script>

<div class="max-w-7xl mx-auto">
  <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <div class="bg-gray-900 border border-gray-800 p-4 hover:border-cyan-400/30 transition-all">
      <div class="text-2xl font-mono text-cyan-400">{$stats.total}</div>
      <div class="text-xs font-mono uppercase tracking-wider text-gray-500 mt-1">Total</div>
    </div>
    <div class="bg-gray-900 border border-gray-800 p-4 hover:border-cyan-400/30 transition-all">
      <div class="text-2xl font-mono text-cyan-400">{$stats.logins}</div>
      <div class="text-xs font-mono uppercase tracking-wider text-gray-500 mt-1">Logins</div>
    </div>
    <div class="bg-gray-900 border border-gray-800 p-4 hover:border-cyan-400/30 transition-all">
      <div class="text-2xl font-mono text-cyan-400">{$stats.bookmarks}</div>
      <div class="text-xs font-mono uppercase tracking-wider text-gray-500 mt-1">Bookmarks</div>
    </div>
    <div class="bg-gray-900 border border-gray-800 p-4 hover:border-yellow-400/30 transition-all">
      <div class="text-2xl font-mono text-yellow-400">{$stats.expiring}</div>
      <div class="text-xs font-mono uppercase tracking-wider text-gray-500 mt-1">Expiring</div>
    </div>
    {#if $stats.expired > 0}
      <div class="bg-gray-900 border border-red-400/30 p-4">
        <div class="text-2xl font-mono text-red-400 animate-pulse">{$stats.expired}</div>
        <div class="text-xs font-mono uppercase tracking-wider text-gray-500 mt-1">Expired</div>
      </div>
    {/if}
  </div>

  <div class="grid lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1">
      <EntryForm on:notify={(e) => dispatch('notify', e.detail)} />
    </div>

    <div class="lg:col-span-2">
      <div class="flex border-b border-gray-900 mb-4 overflow-x-auto">
        {#each tabs as tab}
          <button
            class="px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap relative"
            class:bg-gray-950={$activeTab === tab.id}
            class:text-cyan-400={$activeTab === tab.id && !tab.highlight}
            class:text-yellow-400={$activeTab === tab.id && tab.highlight}
            class:text-gray-600={$activeTab !== tab.id}
            class:hover:text-gray-400={$activeTab !== tab.id}
            on:click={() => {
              $activeTab = tab.id;
              // Reset scroll position on tab change
              if (entriesContainer) entriesContainer.scrollTop = 0;
            }}
          >
            {#if $activeTab === tab.id}
              <div class="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400" 
                   class:bg-yellow-400={tab.highlight}></div>
            {/if}
            {tab.label}
            {#if tab.id === 'expiring' && $stats.expiring > 0}
              <span class="ml-2 px-1.5 py-0.5 bg-yellow-400/20 text-yellow-400 text-[10px] rounded">
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

      <div 
        bind:this={entriesContainer}
        class="space-y-3 custom-scrollbar transition-opacity duration-150" 
        style="max-height: calc(100vh - 400px); overflow-y: auto; min-height: 400px;">
        {#if $filteredEntries.length === 0}
          <div class="card text-center py-16">
            <p class="text-gray-600 font-mono text-sm">
              {$searchQuery || $selectedTag ? 'NO MATCHES FOUND' : `NO ${tabs.find(t => t.id === $activeTab)?.label || 'ENTRIES'}`}
            </p>
          </div>
        {:else}
          {#each $filteredEntries as entry (entry.id)}
            <EntryCard 
              {entry} 
              on:notify={(e) => dispatch('notify', e.detail)}
            />
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>