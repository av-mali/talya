"use client";

import TalyaShell from "@/components/TalyaShell";

// Arabuluculuk modülü. Bu modülün içeriğini (form, belge üretimi)
// değiştirmek istersen: /public/module-arabuluculuk.js dosyasını düzenle.
// Bu dosyaya (page.tsx) dokunmana gerek yok.
export default function ArabuluculukModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body.html"
      scripts={["/module-arabuluculuk.js", "/modules-index.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
