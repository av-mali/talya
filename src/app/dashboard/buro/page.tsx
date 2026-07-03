"use client";

import TalyaShell from "@/components/TalyaShell";

// Büro Yönetimi modülü. İçeriği değiştirmek için: /public/module-buro.js
export default function BuroModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body.html"
      scripts={["/module-buro.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
