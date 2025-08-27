<script>
  import { createEventDispatcher } from 'svelte';
  import { deleteEntry, updateEntry } from '$lib/stores/database';
  import RegeneratePasswordModal from './RegeneratePasswordModal.svelte';
  import { differenceInDays, addDays } from 'date-fns';

  const dispatch = createEventDispatcher();

  export let entry;

  let showPassword = false;
  let isEditing = false;
  let editData = { ...entry };
  let showRegenerateModal = false;
  let neverExpire = entry.expiryDays === 0;
  let editExpiryWeeks = Math.floor((entry.expiryDays || 0) / 7);
  let editExpiryDays = (entry.expiryDays || 0) % 7;

  // Calculate password expiry status
  $: expiryStatus = calculateExpiryStatus();

  function calculateExpiryStatus() {
    if (!entry.hasPassword || !entry.passwordSetDate) return null;
    if (entry.expiryDays === 0) {
      return { status: 'never', days: null, weeks: null, remainingDays: null };
    }

    const now = new Date();
    const passwordDate = new Date(entry.passwordSetDate);
    const expiryDate = addDays(passwordDate, entry.expiryDays ?? 90);
    const daysUntilExpiry = differenceInDays(expiryDate, now);
    
    const weeks = Math.floor(daysUntilExpiry / 7);
    const remainingDays = daysUntilExpiry % 7;

    if (daysUntilExpiry < 0) {
      return { status: 'expired', days: Math.abs(daysUntilExpiry), weeks: null, remainingDays: null };
    } else if (daysUntilExpiry <= 14) {
      return { status: 'expiring', days: daysUntilExpiry, weeks, remainingDays };
    }
    return { status: 'ok', days: daysUntilExpiry, weeks, remainingDays };
  }

  function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text);
    dispatch('notify', `${type} copied`);
  }

  function handleDelete() {
    if (confirm(`Delete "${entry.title}"?`)) {
      deleteEntry(entry.id);
      dispatch('notify', 'Entry deleted');
    }
  }

  function startEdit() {
    isEditing = true;
    editData = { ...entry };
    neverExpire = entry.expiryDays === 0;
    editExpiryWeeks = Math.floor((entry.expiryDays || 0) / 7);
    editExpiryDays = (entry.expiryDays || 0) % 7;
  }

  function saveEdit() {
    const newExpiryDays = neverExpire ? 0 : (editExpiryWeeks || 0) * 7 + (editExpiryDays || 0);
    updateEntry(entry.id, {
      ...editData,
      tags: typeof editData.tags === 'string'
        ? editData.tags.split(',').map(t => t.trim()).filter(t => t)
        : editData.tags,
      expiryDays: newExpiryDays
    });
    isEditing = false;
    dispatch('notify', 'Entry updated');
  }

  function cancelEdit() {
    isEditing = false;
    editData = { ...entry };
  }
</script>

<div class="card relative group">
  {#if !isEditing}
    <div class="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button class="btn px-2 py-1 text-xs" on:click={startEdit}>
        EDIT
      </button>
      <button class="btn btn-danger px-2 py-1 text-xs" on:click={handleDelete}>
        DEL
      </button>
    </div>
    <div class="pr-20">
      <h3 class="text-sm font-mono text-gray-100">
        {#if entry.url}
          <a href={entry.url} target="_blank" rel="noopener noreferrer" class="hover:text-cyan-400 transition-colors">
            {entry.title}
            <span class="text-xs text-gray-600 ml-1">↗</span>
          </a>
        {:else}
          {entry.title}
        {/if}
      </h3>
      {#if entry.url}
        <div class="mt-1 text-xs font-mono text-gray-600 truncate">
          {entry.url}
        </div>
      {/if}
      {#if entry.docsUrl}
        <a href={entry.docsUrl} target="_blank" rel="noopener noreferrer" class="mt-2 inline-block text-xs font-mono text-cyan-400/60 hover:text-cyan-400 transition-colors">
          [DOCS]
        </a>
      {/if}
      {#if entry.tags && entry.tags.length > 0}
        <div class="mt-2 flex flex-wrap gap-1">
          {#each entry.tags as tag}
            <span class="badge text-[10px]">{tag}</span>
          {/each}
        </div>
      {/if}
      {#if entry.notes}
        <div class="mt-2 text-xs font-mono text-gray-500">
          {entry.notes}
        </div>
      {/if}
      {#if entry.hasPassword}
        <div class="mt-3 pt-3 border-t border-gray-900">
          {#if expiryStatus}
            <div class="mb-3">
              {#if expiryStatus.status === 'expired'}
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono text-red-400 animate-pulse">
                    EXPIRED: {expiryStatus.days}d ago
                  </span>
                  <button class="btn btn-danger px-2 py-1 text-xs" on:click={() => showRegenerateModal = true}>
                    REGENERATE
                  </button>
                </div>
              {:else if expiryStatus.status === 'expiring'}
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono text-yellow-400">
                    EXPIRES: {expiryStatus.days}d
                  </span>
                  <button class="btn px-2 py-1 text-xs" on:click={() => showRegenerateModal = true}>
                    UPDATE
                  </button>
                </div>
              {:else if expiryStatus.status === 'ok'}
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono text-gray-600">
                    Expires in {expiryStatus.weeks} weeks, {expiryStatus.remainingDays} days
                  </span>
                  <button class="btn px-2 py-0.5 text-[10px] opacity-50 hover:opacity-100" on:click={() => showRegenerateModal = true}>
                    REGEN
                  </button>
                </div>
              {:else if expiryStatus.status === 'never'}
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono text-gray-600">
                    Never expires
                  </span>
                   <button class="btn px-2 py-0.5 text-[10px] opacity-50 hover:opacity-100" on:click={() => showRegenerateModal = true}>
                    REGEN
                  </button>
                </div>
              {/if}
            </div>
          {/if}
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono uppercase text-gray-600 w-16">USER:</span>
              <span class="font-mono text-xs text-gray-300 flex-1">{entry.username || '—'}</span>
              {#if entry.username}
                <button class="btn px-2 py-0.5 text-[10px]" on:click={() => copyToClipboard(entry.username, 'Username')}>
                  COPY
                </button>
              {/if}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono uppercase text-gray-600 w-16">PASS:</span>
              <input type={showPassword ? 'text' : 'password'} value={entry.password || ''} readonly class="flex-1 bg-black border border-gray-900 px-2 py-0.5 text-xs font-mono text-gray-300" />
              <button class="btn px-2 py-0.5 text-[10px]" on:click={() => showPassword = !showPassword}>
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
              {#if entry.password}
                <button class="btn px-2 py-0.5 text-[10px]" on:click={() => copyToClipboard(entry.password, 'Password')}>
                  COPY
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/if}
      <div class="mt-3 text-[10px] font-mono text-gray-700">
        {new Date(entry.createdAt).toISOString().split('T')[0]}
        {#if entry.passwordSetDate}
          | PWD: {new Date(entry.passwordSetDate).toISOString().split('T')[0]}
        {/if}
      </div>
    </div>
  {:else}
    <!-- Edit Mode -->
    <div class="space-y-2">
      <input type="text" bind:value={editData.title} placeholder="TITLE" class="input-field text-xs" />
      <input type="url" bind:value={editData.url} placeholder="URL" class="input-field text-xs" />
      <input type="text" bind:value={editData.username} placeholder="USERNAME" class="input-field text-xs" />
      <input type="password" bind:value={editData.password} placeholder="PASSWORD" class="input-field text-xs" />
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-cyan-400 cursor-pointer">
          <input type="checkbox" bind:checked={neverExpire} class="w-3 h-3" />
          <span>Never expire</span>
        </label>
        {#if !neverExpire}
          <input type="number" bind:value={editExpiryWeeks} min="0" class="input-field flex-1" />
          <span class="text-xs font-mono text-gray-400">weeks</span>
          <input type="number" bind:value={editExpiryDays} min="0" max="6" class="input-field flex-1" />
          <span class="text-xs font-mono text-gray-400">days</span>
        {/if}
      </div>
      <input type="url" bind:value={editData.docsUrl} placeholder="DOCS URL" class="input-field text-xs" />
      <input type="text" value={editData.tags ? editData.tags.join(', ') : ''} on:input={(e) => editData.tags = e.target.value} placeholder="TAGS" class="input-field text-xs" />
      <textarea bind:value={editData.notes} placeholder="NOTES" rows="2" class="input-field text-xs resize-none" />
      <div class="flex gap-2">
        <button class="btn btn-primary flex-1 text-xs py-1" on:click={saveEdit}>
          SAVE
        </button>
        <button class="btn flex-1 text-xs py-1" on:click={cancelEdit}>
          CANCEL
        </button>
      </div>
    </div>
  {/if}
</div>

{#if showRegenerateModal}
  <RegeneratePasswordModal {entry} on:close={() => showRegenerateModal = false} on:notify={(e) => dispatch('notify', e.detail)} />
{/if}
