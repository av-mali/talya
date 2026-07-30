"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import DashboardShellClient from "@/components/DashboardShellClient";

// Bu layout, /dashboard altındaki TÜM sayfalara uygulanır — ama sadece
// "taşınmış" (migrated) sayfalarda kalıcı menü moduna geçer. GÜNCEL DURUM:
// tüm /dashboard/* modülleri (Ana Sayfa, Büro Yönetimi, Belge & Analiz,
// Arabuluculuk, Tevkil, UYAP, Hesap, Üyelik) artık bu listede ve
// DashboardShellClient'ın kalıcı kabuğunu kullanıyor — eski, her sayfada
// ayrı ayrı kendi çerçevesini kuran TalyaShell bileşeni kaldırıldı.
const MIGRATED_PATHS = [
  "/dashboard",
  "/dashboard/buro",
  "/dashboard/belge",
  "/dashboard/arabuluculuk",
  "/dashboard/tevkil",
  "/dashboard/uyap",
  "/dashboard/hesap",
  "/dashboard/uyelik",
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!pathname || !MIGRATED_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  // Suspense sınırı: DashboardShellClient useSearchParams() kullanıyor,
  // Next.js bunun bir Suspense sınırı içinde olmasını şart koşuyor
  // (yoksa build hatası / beklenmedik davranış olabilir).
  return (
    <Suspense fallback={<div style={{ height: "100vh" }} />}>
      <DashboardShellClient>{children}</DashboardShellClient>
    </Suspense>
  );
}
