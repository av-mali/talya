"use client";

import TalyaShell from "@/components/TalyaShell";

// Büro Yönetimi modülü — AI sohbet paneli kaldırıldı, yerine
// müvekkil yönetim alanı genişletildi. İçeriği değiştirmek için:
// /public/module-buro.js dosyasını düzenle.
export default function BuroModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body-noai.html"
      scripts={["/module-buro.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
