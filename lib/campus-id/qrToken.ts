import type { QrTokenRecord } from './types';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  generateTokenPayload,
  signPayload,
  encodeQrContent,
  decodeQrContent,
  isTokenExpired,
} from './qrTokenCore';

export {
  generateTokenPayload,
  signPayload,
  encodeQrContent,
  decodeQrContent,
  isTokenExpired,
};

const TOKEN_VALIDITY_MINUTES = 3;

export async function recordQrToken(cardId: string, nonce: string, expiresAt: Date): Promise<string | null> {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('qr_tokens')
    .select('id')
    .eq('nonce', nonce)
    .not('consumed_at', 'is', null)
    .maybeSingle();
  return !!data;
}

export async function getActiveTokenForCard(cardId: string): Promise<QrTokenRecord | null> {
  const supabase = createAdminClient();
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
  const { payload, nonce } = generateTokenPayload(cardId);
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
