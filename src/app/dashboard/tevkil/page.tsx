"use client";

import TalyaShell from "@/components/TalyaShell";

// Tevkil Menüsü modülü. Bu modülün içeriğini (form, talep panosu)
// değiştirmek istersen: /public/module-tevkil.js dosyasını düzenle.
export default function TevkilModulu() {
  return (
    <TalyaShell
      bodyUrl="/module-body-detail.html"
      scripts={["/module-tevkil.js", "/modules-index.js", "/cmdk-index.js", "/engine.js"]}
    />
  );
}
