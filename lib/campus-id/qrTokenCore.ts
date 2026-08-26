import crypto from 'crypto';
import type { QrTokenPayload } from './types';

const TOKEN_VALIDITY_MINUTES = 3;
const SECRET_ENV = 'CAMPUS_ID_HMAC_SECRET';

function getSecret(): string {
  const secret = process.env[SECRET_ENV] || 'default-fallback-secret-for-development-mode-32bytes-min';
  return secret;
}

function encodeBase64Url(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeBase64Url(str: string): Buffer {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

export function generateTokenPayload(cardId: string): { payload: QrTokenPayload; raw: string; nonce: string } {
  // Use crypto.randomUUID or browser-compatible crypto.randomUUID
  const nonce = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'nonce-' + Math.random().toString(36).substring(2, 15);
  const exp = Math.floor(Date.now() / 1000) + TOKEN_VALIDITY_MINUTES * 60;
  return {
    payload: { cid: cardId, nonce, exp },
    raw: JSON.stringify({ cid: cardId, nonce, exp }),
    nonce,
  };
}

export function signPayload(raw: string): string {
  const secret = getSecret();
  const hmac = crypto.createHmac('sha256', secret).update(raw).digest();
  return encodeBase64Url(hmac);
}

export function encodeQrContent(payload: QrTokenPayload): string {
  const raw = JSON.stringify(payload);
  const payloadB64 = encodeBase64Url(Buffer.from(raw, 'utf-8'));
  const sig = signPayload(raw);
  return `${payloadB64}.${sig}`;
}

export function decodeQrContent(qrContent: string): { payload: QrTokenPayload | null; error?: string } {
  const parts = qrContent.split('.');
  if (parts.length !== 2) {
    return { payload: null, error: 'Invalid QR format' };
  }

  let raw: string;
  try {
    raw = decodeBase64Url(parts[0]).toString('utf-8');
  } catch {
    return { payload: null, error: 'Failed to decode payload' };
  }

  const expectedSig = signPayload(raw);
  const actualSig = parts[1];
  const expBuf = Buffer.from(expectedSig);
  const actBuf = Buffer.from(actualSig);

  if (expBuf.length !== actBuf.length || !crypto.timingSafeEqual(expBuf, actBuf)) {
    return { payload: null, error: 'Invalid signature' };
  }

  let payload: QrTokenPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { payload: null, error: 'Invalid JSON payload' };
  }

  if (!payload.cid || !payload.nonce || !payload.exp) {
    return { payload: null, error: 'Missing required fields in payload' };
  }

  return { payload };
}

export function isTokenExpired(payload: QrTokenPayload): boolean {
  return Math.floor(Date.now() / 1000) > payload.exp;
}
