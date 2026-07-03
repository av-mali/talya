"use client";

import TalyaShell from "@/components/TalyaShell";

// Üyelik & Hesap modülü. İçeriği değiştirmek için: /public/module-uyelik.js
export default function UyelikModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body.html"
      scripts={["/module-uyelik.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
