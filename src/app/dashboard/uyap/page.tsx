"use client";

import TalyaShell from "@/components/TalyaShell";

// UYAP Entegrasyonu modülü. İçeriği değiştirmek için: /public/module-uyap.js
export default function UyapModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body.html"
      scripts={["/module-uyap.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
