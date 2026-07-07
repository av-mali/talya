"use client";

import TalyaShell from "@/components/TalyaShell";

// Üyelik & Hesap modülü — sağdaki sohbet paneli kaldırıldı, orta panel
// genişletildi (Hesaplama Araçları'ndaki gibi). İçeriği değiştirmek için:
// /public/module-uyelik.js
export default function UyelikModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body-noai.html"
      scripts={["/module-uyelik.js", "/modules-index.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
