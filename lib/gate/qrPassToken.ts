import {
  generateTokenPayload,
  encodeQrContent,
  decodeQrContent,
  isTokenExpired,
} from '@/lib/campus-id/qrToken';

/**
 * Encodes a dynamic HMAC-signed QR token for an approved gate pass.
 * Delegates 100% of cryptography and signing to lib/campus-id/qrToken.ts.
 */
export function generateGatePassQrContent(passId: string): string {
  const { payload } = generateTokenPayload(passId);
  return encodeQrContent(payload);
}

/**
 * Decodes and verifies the signature of a gate pass QR token.
 */
export function decodeGatePassQrContent(qrContent: string): {
  passId: string | null;
  isValid: boolean;
  isExpired: boolean;
  error?: string;
} {
  const { payload, error } = decodeQrContent(qrContent);
  if (error || !payload) {
    return { passId: null, isValid: false, isExpired: false, error: error || 'Invalid token' };
  }

  const expired = isTokenExpired(payload);
  return {
    passId: payload.cid,
    isValid: !expired,
    isExpired: expired,
  };
}
