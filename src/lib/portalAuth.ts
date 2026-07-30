import crypto from "crypto";

// Müvekkil Paneli, avukatların oturum sisteminden (NextAuth) TAMAMEN
// AYRI, kendi hafif oturum mekanizmasını kullanır — yeni bir paket
// kurmadan, Node'un kendi crypto modülüyle imzalanmış bir çerez.
//
// ÖNEMLİ: Sabit bir "yedek" gizli anahtar KULLANMIYORUZ. NEXTAUTH_SECRET
// tanımlı değilse, imzalama/doğrulama anında (build anında değil — build
// sırasında ortam değişkeni henüz yüklenmemiş olabilir) hata fırlatılır.
// Aksi halde üretimde bu değişken unutulursa, herkesin tahmin edebileceği
// sabit bir anahtarla portal oturumları imzalanmış olurdu.
const COOKIE_NAME = "talya_portal_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET tanımlı değil — Müvekkil Paneli oturum imzalaması için bu ortam değişkeni zorunludur."
    );
  }
  return secret;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("hex");
}

export function createPortalToken(clientId: string): string {
  const expiry = Date.now() + MAX_AGE_MS;
  const payload = `${clientId}.${expiry}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  // Farklı uzunluktaki buffer'larla timingSafeEqual çağırmak hata fırlatır;
  // uzunluk farkı zaten imzanın geçersiz olduğunu gösterir, ama zamanlama
  // sızıntısını önlemek için sabit uzunlukta bir karşılaştırmaya düşüyoruz.
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyPortalToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [clientId, expiryStr, signature] = parts;
  const payload = `${clientId}.${expiryStr}`;
  let expectedSig: string;
  try {
    expectedSig = sign(payload);
  } catch {
    return null;
  }
  if (!safeEqual(signature, expectedSig)) return null; // imza uyuşmuyor, sahte/bozuk
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) return null; // süresi dolmuş
  return clientId;
}

export const PORTAL_COOKIE_NAME = COOKIE_NAME;
export const PORTAL_MAX_AGE_SECONDS = MAX_AGE_MS / 1000;
