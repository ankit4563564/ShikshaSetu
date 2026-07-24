import crypto from 'crypto';
import type { QrTokenPayload, QrTokenRecord } from './types';
import { createClient } from '@/lib/supabase/server';

const TOKEN_VALIDITY_MINUTES = 3;
const SECRET_ENV = 'CAMPUS_ID_HMAC_SECRET';

function getSecret(): string {
  const secret = process.env[SECRET_ENV];
  if (!secret) {
    throw new Error(`[CampusID] ${SECRET_ENV} is not set. Generate a 32-byte (256-bit) random hex string and add it to .env.local`);
  }
  const entropyBytes = Buffer.byteLength(secret, 'utf-8');
  if (entropyBytes < 32) {
    throw new Error(
      `[CampusID] ${SECRET_ENV} must have at least 32 bytes of entropy (got ${entropyBytes}). ` +
      `Generate a 64-character hex string from a cryptographically secure RNG.`
    );
  }
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
  const nonce = crypto.randomUUID();
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

  const secret = getSecret();
  const expectedSig = signPayload(raw);
  const actualSig = parts[1];

  if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(actualSig))) {
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

export async function recordQrToken(cardId: string, nonce: string, expiresAt: Date): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('qr_tokens')
    .insert({ card_id: cardId, nonce, expires_at: expiresAt.toISOString() })
    .select('id')
    .single();
  if (error) {
    console.error('[CampusID] Failed to record QR token:', error.message);
    return null;
  }
  return data.id;
}

export async function consumeNonce(nonce: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('qr_tokens')
    .update({ consumed_at: new Date().toISOString() })
    .eq('nonce', nonce)
    .is('consumed_at', null)
    .select('id')
    .maybeSingle();
  if (error) {
    console.error('[CampusID] Failed to consume nonce:', error.message);
    return false;
  }
  return !!data;
}

export async function isNonceConsumed(nonce: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('qr_tokens')
    .select('id')
    .eq('nonce', nonce)
    .not('consumed_at', 'is', null)
    .maybeSingle();
  return !!data;
}

export async function getActiveTokenForCard(cardId: string): Promise<QrTokenRecord | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('qr_tokens')
    .select('*')
    .eq('card_id', cardId)
    .is('consumed_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('issued_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as QrTokenRecord | null;
}

export async function generateAndStoreToken(cardId: string): Promise<{ qrContent: string; tokenId: string } | null> {
  const { payload, raw, nonce } = generateTokenPayload(cardId);
  const expiresAt = new Date(payload.exp * 1000);
  const tokenId = await recordQrToken(cardId, nonce, expiresAt);
  if (!tokenId) return null;
  return { qrContent: encodeQrContent(payload), tokenId };
}

export function getTokenValidityMinutes(): number {
  return TOKEN_VALIDITY_MINUTES;
}

export function generateQrContentForCard(cardId: string): string {
  const { payload } = generateTokenPayload(cardId);
  return encodeQrContent(payload);
}
