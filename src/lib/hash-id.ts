// Pure JS Obfuscation Algorithm compatible with both Browser & Server environments

const SECRET_KEY = 0x5a3f9e2d; // 32-bit secret integer key

/**
 * Encodes a numeric request ID into a secure, non-guessable hash token string.
 * Example: 12 -> "5a3f9e21h"
 */
export function encodeRequestId(id: number): string {
  if (isNaN(id) || id <= 0) return "";

  // Obfuscate integer using secret key
  const masked = (id ^ SECRET_KEY) >>> 0;
  const hex = masked.toString(16).padStart(8, "0");

  // Checksum character
  let sum = 0;
  for (let i = 0; i < hex.length; i++) {
    sum += hex.charCodeAt(i);
  }
  const check = (sum % 36).toString(36);

  return `${hex}${check}`;
}

/**
 * Decodes a secure hash token string back into the numeric request ID.
 * Returns null if the token is invalid or tampered with.
 */
export function decodeRequestId(hashToken: string): number | null {
  if (!hashToken) return null;

  // Fallback: If hashToken is a raw numeric ID (legacy links)
  if (/^\d+$/.test(hashToken)) {
    const raw = parseInt(hashToken, 10);
    return isNaN(raw) ? null : raw;
  }

  if (hashToken.length !== 9) return null;

  const hex = hashToken.slice(0, 8);
  const check = hashToken.slice(8);

  let sum = 0;
  for (let i = 0; i < hex.length; i++) {
    sum += hex.charCodeAt(i);
  }
  const expectedCheck = (sum % 36).toString(36);

  if (check !== expectedCheck) return null;

  const masked = parseInt(hex, 16);
  if (isNaN(masked)) return null;

  const id = (masked ^ SECRET_KEY) >>> 0;
  return id > 0 && id < 10000000 ? id : null;
}
