<script>
  export let strength = 0;

  const strengthLevels = [
    { label: 'VERY WEAK', class: 'bg-red-500', width: '20%', color: 'text-red-400' },
    { label: 'WEAK', class: 'bg-orange-500', width: '40%', color: 'text-orange-400' },
    { label: 'FAIR', class: 'bg-yellow-500', width: '60%', color: 'text-yellow-400' },
    { label: 'GOOD', class: 'bg-blue-500', width: '80%', color: 'text-blue-400' },
    { label: 'STRONG', class: 'bg-green-500', width: '100%', color: 'text-green-400' },
    { label: 'EXCELLENT', class: 'bg-cyan-400', width: '100%', color: 'text-cyan-400' }
  ];
  
  $: currentLevel = strengthLevels[Math.min(strength, strengthLevels.length - 1)];
</script>

<div class="mt-2">
  <div class="flex items-center justify-between">
    <span class="text-[10px] font-mono uppercase tracking-wider text-gray-600">Strength</span>
    <span class="text-[10px] font-mono uppercase tracking-wider {currentLevel.color}">
      {currentLevel.label}
    </span>
  </div>
  <div class="mt-1 h-1 bg-gray-900 border border-gray-800">
    <div
      class="h-full transition-all duration-300 {currentLevel.class}"
      style="width: {currentLevel.width}; box-shadow: 0 0 10px currentColor;"
    />
  </div>
</div>