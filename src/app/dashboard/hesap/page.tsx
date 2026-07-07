"use client";

import TalyaShell from "@/components/TalyaShell";

// Hesaplama Araçları modülü — sağ taraftaki sohbet paneli kaldırıldı,
// sonuçlar zaten formda gösteriliyor. İçeriği değiştirmek için:
// /public/module-hesap.js
export default function HesapModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body-noai.html"
      scripts={["/module-hesap.js", "/modules-index.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
