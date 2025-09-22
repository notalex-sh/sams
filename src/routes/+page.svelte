<script>
  import { onMount } from 'svelte';
  import LoginPanel from '$lib/components/LoginPanel.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import NotificationToast from '$lib/components/NotificationToast.svelte';
  import ExportModal from '$lib/components/ExportModal.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import { isAuthenticated, isDirty, currentDatabase } from '$lib/stores/database';
  
  let showNotification = false;
  let notificationMessage = '';
  let showExportModal = false;

  function notify(message) {
    notificationMessage = message;
    showNotification = true;
  }

  function handleNavAction(event) {
    switch(event.detail.action) {
      case 'export':
        showExportModal = true;
        break;
      case 'notify':
        notify(event.detail.message);
        break;
    }
  }
  
  // Warn before closing with unsaved changes
  function handleBeforeUnload(event) {
    if ($isDirty && $isAuthenticated) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
  
  onMount(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  });
</script>

<svelte:head>
  <title>
    {$isDirty ? '[*] ' : ''}SAMS - Secure Access Management System
    {$currentDatabase ? ` - ${$currentDatabase}` : ''}
  </title>
</svelte:head>

<div class="relative z-10 min-h-screen flex flex-col">
  <header class="relative border-b border-cyan-400/30 bg-gray-900/95 backdrop-blur-sm">
    <div class="container mx-auto px-4 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div>
            <h1 class="text-3xl font-mono font-thin tracking-[0.2em] text-cyan-400 flicker">
              S.A.M.S
            </h1>
            <p class="text-xs uppercase tracking-[0.3em] text-gray-500 mt-1">
              Secure Access Management System
            </p>
          </div>
          
          {#if $currentDatabase}
            <div class="text-sm text-gray-400 font-mono">
              <span class="text-gray-600">[</span>
              {$currentDatabase}
              {#if $isDirty}
                <span class="text-yellow-400 animate-pulse">*</span>
              {/if}
              <span class="text-gray-600">]</span>
            </div>
          {/if}
        </div>

        <div class="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-gray-400">
          <span class={$isAuthenticated ? 'text-cyan-400' : 'text-gray-500'}>
            {$isAuthenticated ? 'AUTHENTICATED' : 'LOCKED'}
          </span>
          <div class="status-dot" class:online={$isAuthenticated} class:offline={!$isAuthenticated}></div>
        </div>
      </div>
    </div>
  </header>
  
  {#if $isAuthenticated}
    <Navbar on:action={handleNavAction} />
  {/if}

  <main class="flex-1 container mx-auto px-4 py-6 animate-slide-up">
    {#if !$isAuthenticated}
      <LoginPanel on:notify={(e) => notify(e.detail)} />
    {:else}
      <Dashboard on:notify={(e) => notify(e.detail)} />
    {/if}
  </main>
  
  <!-- Footer -->
  <footer class="border-t border-gray-900 py-4">
    <div class="container mx-auto px-4">
      <p class="text-center text-xs font-mono text-gray-700 tracking-wider">
        AES-256-GCM | ARGON2 | LOCAL ENCRYPTION ONLY
      </p>
    </div>
  </footer>

  {#if showExportModal}
    <ExportModal 
      on:close={() => showExportModal = false}
      on:notify={(e) => notify(e.detail)}
    />
  {/if}

  <NotificationToast 
    bind:show={showNotification} 
    message={notificationMessage} 
  />
  
  <LoadingScreen />
</div>