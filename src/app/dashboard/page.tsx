"use client";

// NOT: Bu sayfanın içeriği artık render edilmiyor — Ana Sayfa'nın
// gerçek içeriği (onboarding kontrolü dahil), üstteki
// src/app/dashboard/layout.tsx üzerinden DashboardShellClient
// tarafından yönetiliyor (bkz. /public/home-content.html).
// Bu dosya sadece Next.js'in /dashboard rotasını tanıyabilmesi için var.
export default function Dashboard() {
  return null;
}
