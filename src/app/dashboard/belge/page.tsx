"use client";

import TalyaShell from "@/components/TalyaShell";

// Belge & Analiz modülü. Bu modülün içeriğini (formlar, popup metinleri)
// değiştirmek istersen: /public/module-belge.js dosyasını düzenle.
// Bu dosyaya (page.tsx) dokunmana gerek yok.
export default function BelgeModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body.html"
      scripts={["/module-belge.js", "/modules-index.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
