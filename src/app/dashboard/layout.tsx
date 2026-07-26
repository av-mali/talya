"use client";

import { usePathname } from "next/navigation";
import DashboardShellClient from "@/components/DashboardShellClient";

// Bu layout, /dashboard altındaki TÜM sayfalara uygulanır — ama sadece
// "taşınmış" (migrated) sayfalarda kalıcı menü moduna geçer. Diğer
// modüller (Belge & Analiz, Arabuluculuk, Tevkil, UYAP, Hesap, Üyelik)
// bu listeye HENÜZ eklenmedi — onlar bu layout'tan hiç etkilenmez,
// kendi TalyaShell'leriyle eskisi gibi çalışmaya devam eder.
const MIGRATED_PATHS = ["/dashboard", "/dashboard/buro"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!pathname || !MIGRATED_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return <DashboardShellClient>{children}</DashboardShellClient>;
}
