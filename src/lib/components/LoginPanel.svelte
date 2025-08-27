<script>
  import { createEventDispatcher } from 'svelte';
  import { loadDatabase, createNewDatabase } from '$lib/stores/database';
  
  const dispatch = createEventDispatcher();
  
  let selectedFile = null;
  let password = '';
  let isCreatingNew = false;
  let confirmPassword = '';
  let loading = false;

  function handleFileSelect(event) {
    selectedFile = event.target.files[0];
    isCreatingNew = false;
    password = '';
  }

  function startNewDatabase() {
    isCreatingNew = true;
    selectedFile = null;
    password = '';
    confirmPassword = '';
  }
  
  async function handleSubmit() {
    if (!password) {
      dispatch('notify', 'Password required');
      return;
    }
    
    if (isCreatingNew) {
      if (password !== confirmPassword) {
        dispatch('notify', 'Passwords do not match');
        return;
      }
      if (password.length < 8) {
        dispatch('notify', 'Minimum 8 characters required');
        return;
      }
      
      loading = true;
      try {
        await createNewDatabase(password);
        dispatch('notify', 'Database initialized. Save to create file.');
      } catch (error) {
        dispatch('notify', 'Initialization failed: ' + error.message);
      } finally {
        loading = false;
      }
    } else if (selectedFile) {
      loading = true;
      try {
        await loadDatabase(selectedFile, password);
        dispatch('notify', 'Access granted');
      } catch (error) {
        dispatch('notify', 'Authentication failed');
      } finally {
        loading = false;
      }
    } else {
      dispatch('notify', 'Select database or create new');
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<div class="mx-auto max-w-md mt-20">
  <div class="card animate-slide-up">
    <h2 class="mb-6 text-sm font-mono uppercase tracking-[0.2em] text-cyan-400">
      {isCreatingNew ? 'INITIALIZE DATABASE' : 'ACCESS DATABASE'}
    </h2>
    
    {#if !isCreatingNew}
      <div class="mb-6">
        <label class="mb-2 block text-xs font-mono uppercase tracking-wider text-gray-600">
          Database File
        </label>
        <div class="flex gap-2">
          <input
            type="text"
            readonly
            value={selectedFile ? selectedFile.name : 'NO FILE SELECTED'}
            class="input-field flex-1 text-xs"
          />
          <label class="btn cursor-pointer">
            OPEN
            <input
              type="file"
              accept=".sams"
              class="hidden"
              on:change={handleFileSelect}
            />
          </label>
        </div>
        <button
          class="btn btn-primary mt-3 w-full"
          on:click={startNewDatabase}
        >
          CREATE NEW DATABASE
        </button>
      </div>
    {/if}
    
    {#if selectedFile || isCreatingNew}
      <div class="space-y-4 animate-slide-up">
        <div>
          <label class="mb-2 block text-xs font-mono uppercase tracking-wider text-gray-600">
            {isCreatingNew ? 'Master Password' : 'Password'}
          </label>
          <input
            type="password"
            bind:value={password}
            placeholder="••••••••"
            class="input-field"
            on:keydown={handleKeyDown}
          />
        </div>
        
        {#if isCreatingNew}
          <div>
            <label class="mb-2 block text-xs font-mono uppercase tracking-wider text-gray-600">
              Confirm Password
            </label>
            <input
              type="password"
              bind:value={confirmPassword}
              placeholder="••••••••"
              class="input-field"
              on:keydown={handleKeyDown}
            />
          </div>
          
          <div class="text-xs font-mono text-gray-600 border-l-2 border-cyan-400/20 pl-3">
            Requirements:<br>
            • Minimum 8 characters<br>
            • Store securely<br>
            • Cannot be recovered
          </div>
        {/if}
        
        <div class="flex gap-2 pt-2">
          <button
            class="btn btn-primary flex-1"
            on:click={handleSubmit}
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : isCreatingNew ? 'INITIALIZE' : 'AUTHENTICATE'}
          </button>
          {#if isCreatingNew}
            <button
              class="btn"
              on:click={() => {
                isCreatingNew = false;
                password = '';
                confirmPassword = '';
              }}
            >
              CANCEL
            </button>
          {/if}
        </div>
      </div>
    {/if}
    
    <div class="mt-6 pt-4 border-t border-gray-900">
      <p class="text-[10px] font-mono text-gray-600 leading-relaxed">
        SECURITY: AES-256-GCM | PBKDF2 100K ITERATIONS<br>
        LOCAL ENCRYPTION | NO SERVER TRANSMISSION
      </p>
    </div>
  </div>
</div>
