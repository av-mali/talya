"use client";

// NOT: Bu sayfanın içeriği artık render edilmiyor — Büro Yönetimi'nin
// gerçek içeriği, üstteki src/app/dashboard/layout.tsx üzerinden
// DashboardShellClient tarafından yönetiliyor (bkz.
// /public/buro-content.html + /public/module-buro.js).
// Bu dosya sadece Next.js'in /dashboard/buro rotasını tanıyabilmesi
// için var. ÖNEMLİ: Burada TalyaShell KULLANILMAMALI (bkz. yukarıdaki
// not, dashboard/page.tsx içinde).
export default function BuroModulu() {
  return null;
}
