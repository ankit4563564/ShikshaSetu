// Centralized demo session utilities
// Provides creation and validation of signed demo sessions.

export const COOKIE_NAME = 'demo_role';
export const CURRENT_VERSION = 1;

export const VALID_ROLES = [
  'teacher',
  'parent',
  'student',
  'admin',
  'driver',
  'gate',
  'vendor',
] as const;

export type DemoRole = (typeof VALID_ROLES)[number];

export interface DemoSession {
  role: DemoRole;
  issuedAt: number; // epoch seconds
  expiresAt: number; // epoch seconds
  version: number;
}

function isValidRole(r: any): r is DemoRole {
  return typeof r === 'string' && (VALID_ROLES as readonly string[]).includes(r);
}

function base64urlEncode(buf: Uint8Array) {
  let s = Buffer.from(buf).toString('base64');
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

async function getCryptoKey() {
  const secret = process.env.DEMO_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'shikshasetu_demo_secret_2026_key';
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  return await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(payload: string) {
  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return base64urlEncode(new Uint8Array(sig));
}

async function verify(payload: string, signature: string) {
  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const sig = base64urlDecode(signature);
    return await crypto.subtle.verify('HMAC', key, sig, enc.encode(payload));
  } catch (e) {
    return false;
  }
}

export async function createSignedSessionValue(role: DemoRole, ttlSeconds = 86400) {
  if (!isValidRole(role)) throw new Error('invalid role');
  const now = Math.floor(Date.now() / 1000);
  const session: DemoSession = {
    role,
    issuedAt: now,
    expiresAt: now + ttlSeconds,
    version: CURRENT_VERSION,
  };

  const payload = JSON.stringify(session);
  const payloadB64 = base64urlEncode(Buffer.from(payload));
  const sig = await sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifySessionValue(value: string): Promise<DemoSession | null> {
  try {
    if (!value || typeof value !== 'string') return null;
    const parts = value.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, sig] = parts;
    const ok = await verify(payloadB64, sig);
    if (!ok) return null;
    const payloadJson = base64urlDecode(payloadB64).toString('utf8');
    const session = JSON.parse(payloadJson) as DemoSession;
    const now = Math.floor(Date.now() / 1000);
    if (session.version !== CURRENT_VERSION) return null;
    if (session.expiresAt && now > session.expiresAt) return null;
    if (!isValidRole(session.role)) return null;
    return session;
  } catch (e) {
    return null;
  }
}

export async function getDemoSessionFromRequest(req: Request | any): Promise<DemoSession | null> {
  try {
    let cookieHeader: string | null = null;
    if (req?.headers?.get) {
      cookieHeader = req.headers.get('cookie');
    } else if (req?.cookies?.get) {
      const c = req.cookies.get(COOKIE_NAME);
      if (c) return verifySessionValue(typeof c === 'string' ? c : c.value);
    }

    if (!cookieHeader && typeof document !== 'undefined') {
      cookieHeader = document.cookie;
    }

    if (!cookieHeader) return null;

    const match = cookieHeader.split(';').find((item) => item.trim().startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;

    const val = match.split('=')[1]?.trim();
    if (!val) return null;

    return await verifySessionValue(val);
  } catch (e) {
    return null;
  }
}

export async function getDemoSessionFromCookies(cookiesObj: any): Promise<DemoSession | null> {
  try {
    const c = cookiesObj.get ? cookiesObj.get(COOKIE_NAME) : null;
    if (!c) return null;
    const val = typeof c === 'string' ? c : c.value;
    return await verifySessionValue(val);
  } catch (e) {
    return null;
  }
}
