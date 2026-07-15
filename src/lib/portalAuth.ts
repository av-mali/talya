import crypto from "crypto";

// Müvekkil Paneli, avukatların oturum sisteminden (NextAuth) TAMAMEN
// AYRI, kendi hafif oturum mekanizmasını kullanır — yeni bir paket
// kurmadan, Node'un kendi crypto modülüyle imzalanmış bir çerez.
const SECRET = process.env.NEXTAUTH_SECRET || "talya-portal-fallback-secret";
const COOKIE_NAME = "talya_portal_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

export function createPortalToken(clientId: string): string {
  const expiry = Date.now() + MAX_AGE_MS;
  const payload = `${clientId}.${expiry}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyPortalToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [clientId, expiryStr, signature] = parts;
  const payload = `${clientId}.${expiryStr}`;
  const expectedSig = sign(payload);
  if (signature !== expectedSig) return null; // imza uyuşmuyor, sahte/bozuk
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) return null; // süresi dolmuş
  return clientId;
}

export const PORTAL_COOKIE_NAME = COOKIE_NAME;
export const PORTAL_MAX_AGE_SECONDS = MAX_AGE_MS / 1000;
