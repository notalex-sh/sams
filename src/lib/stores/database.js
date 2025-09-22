import { writable, derived, get } from 'svelte/store';
import { encryptData, decryptData } from '$lib/utils/encryption';
import { addDays, differenceInDays, isAfter } from 'date-fns';

export const isAuthenticated = writable(false);
export const currentDatabase = writable(null);
export const masterPassword = writable(null);
export const isDirty = writable(false);
export const entries = writable([]);
export const searchQuery = writable('');
export const selectedTag = writable('');
export const activeTab = writable('all'); 
export const isProcessing = writable(false);
export const processingMessage = writable('');

export const config = writable({
  dbFilename: 'sams_database.sams',
  passwordExpiryDays: 90,
  expiryWarningDays: 14,
  autoSave: false
});

export const filteredEntries = derived(
  [entries, searchQuery, selectedTag, activeTab],
  ([$entries, $searchQuery, $selectedTag, $activeTab]) => {
    let filtered = [...$entries];

    if ($activeTab === 'logins') {
      filtered = filtered.filter(e => e.hasPassword);
    } else if ($activeTab === 'bookmarks') {
      filtered = filtered.filter(e => !e.hasPassword);
    } else if ($activeTab === 'expiring') {
      const now = new Date();
      filtered = filtered.filter(e => {
        if (!e.hasPassword || !e.passwordSetDate) return false;
        if (e.expiryDays === 0) return false; // Never expires
        const expiryDate = addDays(new Date(e.passwordSetDate), e.expiryDays ?? 90);
        const daysUntilExpiry = differenceInDays(expiryDate, now);
        return daysUntilExpiry <= 14 && daysUntilExpiry >= 0;
      });
    }
    
    if ($searchQuery) {
      const query = $searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        (entry.url && entry.url.toLowerCase().includes(query)) ||
        (entry.username && entry.username.toLowerCase().includes(query)) ||
        (entry.notes && entry.notes.toLowerCase().includes(query)) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Tag filtering
    if ($selectedTag) {
      filtered = filtered.filter(entry => 
        entry.tags && entry.tags.includes($selectedTag)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
);

export const allTags = derived(entries, ($entries) => {
  const tags = new Set();
  $entries.forEach(entry => {
    if (entry.tags) {
      entry.tags.forEach(tag => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
});

export const stats = derived(entries, ($entries) => {
  const total = $entries.length;
  const logins = $entries.filter(e => e.hasPassword).length;
  const bookmarks = $entries.filter(e => !e.hasPassword).length;
  
  const now = new Date();
  const expiring = $entries.filter(e => {
    if (!e.hasPassword || !e.passwordSetDate) return false;
    if (e.expiryDays === 0) return false; // Never expires
    const expiryDate = addDays(new Date(e.passwordSetDate), e.expiryDays ?? 90);
    const daysUntilExpiry = differenceInDays(expiryDate, now);
    return daysUntilExpiry <= 14 && daysUntilExpiry >= 0;
  }).length;
  
  const expired = $entries.filter(e => {
    if (!e.hasPassword || !e.passwordSetDate) return false;
    if (e.expiryDays === 0) return false; // Never expires
    const expiryDate = addDays(new Date(e.passwordSetDate), e.expiryDays ?? 90);
    return isAfter(now, expiryDate);
  }).length;
  
  return { total, logins, bookmarks, expiring, expired };
});

export function addEntry(entry) {
  entries.update(items => {
    const newEntry = {
      ...entry,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      passwordSetDate: entry.password ? new Date().toISOString() : null,
      expiryDays: entry.expiryDays ?? 0, // Default to never expire
      hasPassword: !!(entry.username || entry.password)
    };
    isDirty.set(true);
    return [...items, newEntry];
  });
}

export function updateEntry(id, updates) {
  entries.update(items => {
    const index = items.findIndex(e => e.id === id);
    if (index !== -1) {
      const currentItem = items[index];
      if (updates.password && updates.password !== currentItem.password) {
        updates.passwordSetDate = new Date().toISOString();
      }
      items[index] = {
        ...currentItem,
        ...updates,
        hasPassword: !!(updates.username || updates.password || currentItem.username || currentItem.password)
      };
      isDirty.set(true);
    }
    return items;
  });
}

export function deleteEntry(id) {
  entries.update(items => {
    isDirty.set(true);
    return items.filter(e => e.id !== id);
  });
}

export function regeneratePassword(id, newPassword) {
  updateEntry(id, {
    password: newPassword,
    passwordSetDate: new Date().toISOString()
  });
}

export async function saveDatabase() {
  const pwd = get(masterPassword);
  if (!pwd) throw new Error('No master password set');
  
  isProcessing.set(true);
  processingMessage.set('Encrypting database...');
  
  try {
    const entriesData = get(entries);
    
    const encryptedBlob = await encryptData(entriesData, pwd);
    const blob = new Blob([encryptedBlob], { type: 'application/octet-stream' });
    
    const configData = get(config);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = get(currentDatabase) || configData.dbFilename;
    a.click();
    URL.revokeObjectURL(url);
    
    isDirty.set(false);
  } finally {
    isProcessing.set(false);
    processingMessage.set('');
  }
}

export async function loadDatabase(file, password) {
  isProcessing.set(true);
  processingMessage.set('Decrypting database...');
  
  try {
    const encryptedBlob = await file.arrayBuffer();
    
    const decrypted = await decryptData(encryptedBlob, password);

    const normalizedEntries = decrypted.map(entry => ({
      ...entry,
      tags: entry.tags || [],
      notes: entry.notes || '',
      docsUrl: entry.docsUrl || '',
      createdAt: entry.createdAt || new Date().toISOString(),
      passwordSetDate: entry.passwordSetDate || (entry.password ? entry.createdAt : null),
      expiryDays: entry.expiryDays ?? 90,
      hasPassword: !!(entry.username || entry.password)
    }));
    
    entries.set(normalizedEntries);
    currentDatabase.set(file.name);
    masterPassword.set(password);
    isAuthenticated.set(true);
    isDirty.set(false);
  } finally {
    isProcessing.set(false);
    processingMessage.set('');
  }
}

export async function createNewDatabase(password) {
  isProcessing.set(true);
  processingMessage.set('Initializing database...');
  
  try {
    entries.set([]);
    currentDatabase.set(null);
    masterPassword.set(password);
    isAuthenticated.set(true);
    isDirty.set(true); 
  } finally {
    isProcessing.set(false);
    processingMessage.set('');
  }
}

export function logout() {
  entries.set([]);
  currentDatabase.set(null);
  masterPassword.set(null);
  isAuthenticated.set(false);
  isDirty.set(false);
  searchQuery.set('');
  selectedTag.set('');
  activeTab.set('all');
  isProcessing.set(false);
  processingMessage.set('');
}