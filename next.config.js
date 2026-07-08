/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // "sharp" gibi native (derlenmiş) kütüphanelerin sunucu tarafında
  // (Vercel serverless fonksiyonlarında) doğru paketlenip çalışması için.
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
};

module.exports = nextConfig;
