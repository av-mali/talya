"use client";

import TalyaShell from "@/components/TalyaShell";

// Hesaplama Araçları modülü. İçeriği değiştirmek için: /public/module-hesap.js
export default function HesapModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body.html"
      scripts={["/module-hesap.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
