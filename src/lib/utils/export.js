export function exportToCSV(entries) {
  const headers = [
    'Title',
    'URL',
    'Username',
    'Password',
    'Documentation URL',
    'Tags',
    'Notes',
    'Created Date',
    'Password Set Date',
    'Expiry Days'
  ];

  const rows = entries.map(entry => {
    return [
      escapeCSV(entry.title || ''),
      escapeCSV(entry.url || ''),
      escapeCSV(entry.username || ''),
      escapeCSV(entry.password || ''),
      escapeCSV(entry.docsUrl || ''),
      escapeCSV((entry.tags || []).join('; ')),
      escapeCSV(entry.notes || ''),
      escapeCSV(formatDate(entry.createdAt)),
      escapeCSV(formatDate(entry.passwordSetDate)),
      escapeCSV((entry.expiryDays || 90).toString())
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';

  value = String(value);
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    value = value.replace(/"/g, '""');
    return `"${value}"`;
  }
  
  return value;
}

function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; 
  } catch {
    return dateString;
  }
}

export function downloadCSV(entries, filename = 'sams_export.csv') {
  const csv = exportToCSV(entries);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  if (lines.length < 2) {
    throw new Error('Invalid CSV format');
  }
  
  const entries = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    
    if (values.length >= 10) {
      entries.push({
        title: values[0] || '',
        url: values[1] || '',
        username: values[2] || '',
        password: values[3] || '',
        docsUrl: values[4] || '',
        tags: values[5] ? values[5].split(';').map(t => t.trim()) : [],
        notes: values[6] || '',
        createdAt: values[7] || new Date().toISOString(),
        passwordSetDate: values[8] || null,
        expiryDays: parseInt(values[9]) || 90,
        hasPassword: !!(values[2] || values[3]) 
      });
    }
  }
  
  return entries;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  
  return values;
}