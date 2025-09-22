<script>
  import { createEventDispatcher } from 'svelte';
  import { addEntry } from '$lib/stores/database';
  import { generatePassword, calculatePasswordStrength } from '$lib/utils/encryption';
  import PasswordStrengthMeter from './PasswordStrengthMeter.svelte';
  
  const dispatch = createEventDispatcher();
  
  let title = '';
  let url = '';
  let username = '';
  let password = '';
  let docsUrl = '';
  let tags = '';
  let notes = '';
  let expiryWeeks = 0;
  let expiryDaysInput = 0;
  let neverExpire = true; // Default to never expire
  let showPasswordInput = false; // Toggle for password visibility
  
  $: expiryDays = neverExpire ? 0 : (expiryWeeks || 0) * 7 + (expiryDaysInput || 0);

  let passLength = 16;
  let useUpper = true;
  let useLower = true;
  let useNumbers = true;
  let useSymbols = true;
  
  let showPasswordPreview = false;
  let generatedPassword = '';

  $: passwordStrength = calculatePasswordStrength(password);
  
  function handleGeneratePassword() {
    generatedPassword = generatePassword({
      length: passLength,
      uppercase: useUpper,
      lowercase: useLower,
      numbers: useNumbers,
      symbols: useSymbols
    });
    showPasswordPreview = true;
  }

  function useGeneratedPassword() {
    password = generatedPassword;
    showPasswordPreview = false;
    dispatch('notify', 'Password applied');
  }

  function handleSubmit() {
    if (!title) {
      dispatch('notify', 'Title required');
      return;
    }
    
    const entry = {
      title,
      url,
      username,
      password,
      docsUrl,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
      notes,
      expiryDays
    };
    
    addEntry(entry);

    // Reset form
    title = '';
    url = '';
    username = '';
    password = '';
    docsUrl = '';
    tags = '';
    notes = '';
    expiryWeeks = 0;
    expiryDaysInput = 0;
    neverExpire = true; // Reset to default
    generatedPassword = '';
    showPasswordPreview = false;
    showPasswordInput = false;
    
    dispatch('notify', 'Entry created');
  }
</script>

<div class="card">
  <h3 class="mb-4 text-base font-mono uppercase tracking-[0.2em] text-cyan-400">
    NEW ENTRY
  </h3>
  
  <div class="space-y-3">
    <div>
      <input
        type="text"
        bind:value={title}
        placeholder="TITLE *"
        class="input-field"
      />
    </div>
    
    <div>
      <input
        type="url"
        bind:value={url}
        placeholder="URL"
        class="input-field"
      />
    </div>
    
    <div>
      <input
        type="text"
        bind:value={username}
        placeholder="USERNAME"
        class="input-field"
      />
    </div>
    
    <div>
      <div class="relative">
        {#if showPasswordInput}
          <input
            type="text"
            bind:value={password}
            placeholder="PASSWORD"
            class="input-field pr-20"
          />
        {:else}
          <input
            type="password"
            bind:value={password}
            placeholder="PASSWORD"
            class="input-field pr-20"
          />
        {/if}
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500 hover:text-cyan-400 transition-colors px-2 py-1"
          on:click={() => showPasswordInput = !showPasswordInput}
        >
          {showPasswordInput ? 'HIDE' : 'SHOW'}
        </button>
      </div>
      {#if password}
        <PasswordStrengthMeter strength={passwordStrength} />
      {/if}
    </div>
    
    <div class="border-t border-gray-900 pt-3 space-y-3">
      <div class="flex items-center justify-between">
        <label for="passLength" class="text-xs font-mono uppercase tracking-wider text-gray-500">
          Password Length
        </label>
        <div class="flex items-center gap-2">
          <input
            id="passLength"
            type="number"
            bind:value={passLength}
            min="8"
            max="64"
            class="input-field w-16 py-1 text-center"
          />
          <span class="text-xs font-mono text-gray-500">chars</span>
        </div>
      </div>
      
      <div>
        <div class="text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">Character Types</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm font-mono">
          <label class="flex items-center gap-2 text-gray-400 hover:text-cyan-400 cursor-pointer">
            <input type="checkbox" bind:checked={useUpper} class="custom-checkbox" />
            <span>A-Z</span>
          </label>
          <label class="flex items-center gap-2 text-gray-400 hover:text-cyan-400 cursor-pointer">
            <input type="checkbox" bind:checked={useLower} class="custom-checkbox" />
            <span>a-z</span>
          </label>
          <label class="flex items-center gap-2 text-gray-400 hover:text-cyan-400 cursor-pointer">
            <input type="checkbox" bind:checked={useNumbers} class="custom-checkbox" />
            <span>0-9</span>
          </label>
          <label class="flex items-center gap-2 text-gray-400 hover:text-cyan-400 cursor-pointer">
            <input type="checkbox" bind:checked={useSymbols} class="custom-checkbox" />
            <span>!@#</span>
          </label>
        </div>
      </div>
      
      <button
        class="btn w-full"
        on:click={handleGeneratePassword}
      >
        GENERATE
      </button>
      
      {#if showPasswordPreview && generatedPassword}
        <div class="mt-3 border border-cyan-400/20 bg-gray-950 p-3 animate-slide-up">
          <div class="mb-2 text-xs font-mono uppercase tracking-wider text-gray-600">
            Preview
          </div>
          <div class="break-all font-mono text-sm text-cyan-300">
            {generatedPassword}
          </div>
          <div class="mt-3 flex gap-2">
            <button
              class="btn btn-primary flex-1 text-xs py-1"
              on:click={useGeneratedPassword}
            >
              USE
            </button>
            <button
              class="btn flex-1 text-xs py-1"
              on:click={handleGeneratePassword}
            >
              NEW
            </button>
            <button
              class="btn flex-1 text-xs py-1"
              on:click={() => {
                navigator.clipboard.writeText(generatedPassword);
                dispatch('notify', 'Copied');
              }}
            >
              COPY
            </button>
          </div>
        </div>
      {/if}
    </div>
    
    <div class="border-t border-gray-900 pt-3">
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-cyan-400 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={neverExpire}
            class="custom-checkbox"
          />
          <span>Never expire</span>
        </label>
        {#if !neverExpire}
          <input
            type="number"
            bind:value={expiryWeeks}
            min="0"
            class="input-field w-full text-center py-1"
          />
          <span class="text-xs font-mono text-gray-400">weeks</span>
          <input
            type="number"
            bind:value={expiryDaysInput}
            min="0"
            max="6"
            class="input-field w-full text-center py-1"
          />
          <span class="text-xs font-mono text-gray-400">days</span>
        {/if}
      </div>
    </div>
    
    <div>
      <input
        type="url"
        bind:value={docsUrl}
        placeholder="DOCUMENTATION URL"
        class="input-field"
      />
    </div>
    
    <div>
      <input
        type="text"
        bind:value={tags}
        placeholder="TAGS (COMMA SEPARATED)"
        class="input-field"
      />
    </div>
    
    <div>
      <textarea
        bind:value={notes}
        placeholder="NOTES"
        rows="2"
        class="input-field resize-none"
      />
    </div>
    
    <button
      class="btn btn-primary w-full"
      on:click={handleSubmit}
    >
      CREATE ENTRY
    </button>
  </div>
</div>