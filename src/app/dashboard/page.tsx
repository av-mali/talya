"use client";

// NOT: Bu sayfanın içeriği artık render edilmiyor — Ana Sayfa'nın
// gerçek içeriği (onboarding kontrolü dahil), üstteki
// src/app/dashboard/layout.tsx üzerinden DashboardShellClient
// tarafından yönetiliyor (bkz. /public/home-content.html).
// Bu dosya sadece Next.js'in /dashboard rotasını tanıyabilmesi için var.
// ÖNEMLİ: Burada TalyaShell KULLANILMAMALI — DashboardShellClient
// çocuklarını (children) gizli şekilde de olsa render ettiği için,
// TalyaShell kullanılırsa GÖRÜNMEZ bir şekilde ikinci kez çalışır ve
// "Yönetici Paneli" gibi bağlantıları TEKRAR TEKRAR ekler.
export default function Dashboard() {
  return null;
}
