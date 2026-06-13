// Simple encryption using Web Crypto API and a key derived from the user's UID

async function getKey(uid: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(uid.padEnd(32, '0').substring(0, 32)), // Must be 32 bytes for AES-256
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('gemini-proxy-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(uid: string, text: string): Promise<string> {
  if (!uid || !text) return '';
  try {
      const key = await getKey(uid);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encodedText = new TextEncoder().encode(text);

      const encryptedContent = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedText
      );

      const encryptedContentArr = new Uint8Array(encryptedContent);
      const buf = new Uint8Array(iv.byteLength + encryptedContentArr.byteLength);
      buf.set(iv, 0);
      buf.set(encryptedContentArr, iv.byteLength);

      return btoa(String.fromCharCode.apply(null, Array.from(buf)));
  } catch (e) {
      console.error('Encryption failed', e);
      return '';
  }
}

export async function decryptData(uid: string, encryptedStr: string): Promise<string> {
  if (!uid || !encryptedStr) return '';
  try {
      const b64 = atob(encryptedStr);
      const buf = new Uint8Array(b64.length);
      for (let i = 0; i < b64.length; i++) {
        buf[i] = b64.charCodeAt(i);
      }

      const iv = buf.slice(0, 12);
      const data = buf.slice(12);
      const key = await getKey(uid);

      const decryptedContent = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      return new TextDecoder().decode(decryptedContent);
  } catch (e) {
      console.error('Decryption failed', e);
      return '';
  }
}
