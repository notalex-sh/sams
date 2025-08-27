// Put comments on here for visibility on how this works

export async function generateKey(password, salt) {
  // Convert password to array buffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive AES key from password using PBKDF2
  // Uses 100,000 iterations for security
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 }, 
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data using AES-GCM and return a single binary blob
export async function encryptData(data, password) {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Generate key from password
  const key = await generateKey(password, salt);
  
  // Convert data to JSON string then to bytes
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  
  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );
  
  // Concatenate salt, iv, and encrypted data into a single buffer
  const finalBuffer = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
  finalBuffer.set(salt, 0);
  finalBuffer.set(iv, salt.length);
  finalBuffer.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
  
  return finalBuffer;
}

// Decrypt a binary blob using AES-GCM
export async function decryptData(encryptedBlob, password) {
  try {
    const encryptedData = new Uint8Array(encryptedBlob);

    // Extract salt, iv, and the actual encrypted data
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const data = encryptedData.slice(28);
    
    // Generate key from password and stored salt
    const key = await generateKey(password, salt);
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Convert decrypted bytes back to JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error('Decryption failed: Invalid password or corrupted data');
  }
}

// Verify if a password is correct for encrypted data
export async function verifyPassword(encryptedBlob, password) {
  try {
    await decryptData(encryptedBlob, password);
    return true;
  } catch {
    return false;
  }
}

// Other stuff

export function generatePassword(options = {}) {
  const defaults = {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  };
  
  const config = { ...defaults, ...options };
  
  let charset = '';
  if (config.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (config.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (config.numbers) charset += '0123456789';
  if (config.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (!charset) {
    throw new Error('At least one character type must be selected');
  }
  
  const array = new Uint32Array(config.length);
  crypto.getRandomValues(array);
  
  let password = '';
  for (let i = 0; i < config.length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
}


export function calculatePasswordStrength(password) {
  if (!password) return 0;
  
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (password.length >= 16) strength++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 5);
}