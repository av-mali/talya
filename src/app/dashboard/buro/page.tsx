"use client";

import TalyaShell from "@/components/TalyaShell";

// Büro Yönetimi modülü — 3 sütunlu orijinal tasarım korunuyor.
// Sağ sütun artık sohbet değil, seçilen öğeye göre değişen bir "detay
// paneli". İçeriği değiştirmek için: /public/module-buro.js
export default function BuroModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body-detail.html"
      scripts={["/module-buro.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
