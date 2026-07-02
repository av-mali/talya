# Talya — Hukuk AI (Next.js sürümü)

Bu proje, tek dosyalık `index.html` prototipinin gerçek, güvenli bir web
uygulamasına çevrilmiş halidir.

## Ne değişti? (özet)

| Konu | Eskiden | Şimdi |
|---|---|---|
| Claude API anahtarı | Tarayıcı kodunun içinde, herkes görebilir | Sadece sunucuda, `.env.local` dosyasında |
| Kullanıcı girişi | Yok | E-posta + şifre ile giriş/kayıt (şifreler hash'lenir) |
| Sohbet geçmişi | Sayfa kapanınca kaybolur | Veritabanında kalıcı olarak saklanır |
| Claude'a istek | Doğrudan tarayıcıdan | Backend (`/api/chat`) üzerinden, kimlik doğrulamalı |

## Klasör yapısı (kısaca)

- `src/app/login`, `src/app/register` → giriş/kayıt ekranları (frontend)
- `src/app/dashboard` → ana panel + sohbet ekranı (frontend)
- `src/app/api/chat` → Claude'a giden isteği yöneten backend kodu
- `src/app/api/auth` → giriş/kayıt işlemlerini yöneten backend kodu
- `prisma/schema.prisma` → veritabanı tablolarının tanımı
- `.env.example` → hangi gizli bilgilerin gerektiğinin listesi

## Bilgisayarında ilk kurulum (adım adım)

1. **Node.js kur** (yoksa): https://nodejs.org üzerinden "LTS" sürümünü indir kur.

2. **Terminali aç**, bu klasöre gir:
   ```
   cd legal-ai
   npm install
   ```
   Bu komut, projenin ihtiyaç duyduğu tüm kütüphaneleri indirir. Birkaç dakika sürebilir.

3. **Gizli bilgiler dosyasını oluştur:**
   ```
   cp .env.example .env.local
   ```
   Sonra `.env.local` dosyasını bir metin editörüyle aç ve:
   - `ANTHROPIC_API_KEY` satırına, console.anthropic.com üzerinden aldığın
     gerçek Claude API anahtarını yapıştır.
   - `NEXTAUTH_SECRET` satırına rastgele uzun bir metin yaz (terminalde
     `openssl rand -base64 32` yazarak da üretebilirsin).

4. **Veritabanını oluştur:**
   ```
   npx prisma migrate dev --name init
   ```
   Bu komut, `prisma/schema.prisma` içinde tanımladığımız tabloları
   gerçek bir veritabanı dosyasına (`dev.db`) dönüştürür.

5. **Projeyi çalıştır:**
   ```
   npm run dev
   ```
   Tarayıcıda `http://localhost:3000` adresini aç. Önce "Kayıt ol" ile bir
   hesap oluştur, sonra giriş yap.

## Canlıya almak istersen (özet)

- En kolay yol **Vercel**'dir (vercel.com). Projeyi GitHub'a yükleyip
  Vercel'e bağlarsın; adım 3'teki gizli bilgileri Vercel panelinde
  "Environment Variables" bölümüne aynı isimlerle girersin.
- SQLite geliştirme içindir, gerçek kullanıcı trafiği için uygun değildir.
  Canlıya alırken `prisma/schema.prisma` içinde `provider = "sqlite"`
  satırını `provider = "postgresql"` yapman ve `DATABASE_URL`'i gerçek bir
  Postgres veritabanı adresiyle (örn. Vercel Postgres, Supabase, Railway)
  değiştirmen yeterli — kodun geri kalanı aynı kalır.

## Modülleri genişletmek

Sol panelde şu an görünen "Dilekçe Sihirbazı", "Süre Hesaplayıcı" gibi
modüller şimdilik görsel taslak. Her birini gerçek işlevle bağlamak için:
`src/app/dashboard/page.tsx` içinde ilgili modüle tıklandığında,
`/api/chat` uç noktasına o modüle özel bir talimat (system prompt farkı)
göndermen yeterli — backend altyapısı zaten hazır, tek yapman gereken
frontend'de o modülün formunu tasarlamak.

## Güvenlik notları

- Şifreler `bcrypt` ile hash'lenir, hiçbir zaman düz metin saklanmaz.
- Claude API anahtarı yalnızca sunucu ortam değişkeninde tutulur.
- `/api/chat` uç noktası, geçerli bir oturum (giriş yapılmış kullanıcı)
  olmadan çalışmaz.
- `.env.local` dosyasını asla GitHub'a yükleme (`.gitignore` zaten
  bunu engelliyor, ama dikkatli ol).
