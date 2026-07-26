"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import OnboardingScreen from "@/components/OnboardingScreen";

// Bu bileşen, Ana Sayfa ve Büro Yönetimi arasındaki geçişlerde topbar +
// sol menüyü HİÇ yeniden yüklemeden sabit tutar. Sadece içerik alanı
// (dashboard-shell.html içindeki #talyaContentSlot) sayfa değiştikçe
// güncellenir. Diğer modüller (Belge & Analiz, Arabuluculuk vb.) henüz
// bu yapıya taşınmadı — onlar eskisi gibi, kendi tam sayfalarıyla
// çalışmaya devam ediyor (bkz. openModule'daki MIGRATED_PATHS kontrolü).
//
// ÖNEMLİ TASARIM KURALI: içerik yükleme yalnızca TEK BİR yerden
// (aşağıdaki tek useEffect) tetiklenir — hem ilk yükleme hem sonraki
// sayfa değişimleri AYNI koddan geçer. İki ayrı "ilk yükleme" ve
// "sayfa değişti" effect'i birbirine YARIŞ DURUMU (race condition)
// yaratıyordu; bu yüzden birleştirildi.

const MIGRATED_PATHS = ["/dashboard", "/dashboard/buro"];

const CONTENT_MAP: Record<string, { contentUrl: string; scripts: string[] }> = {
  "/dashboard": { contentUrl: "/home-content.html", scripts: [] },
  "/dashboard/buro": { contentUrl: "/buro-content.html", scripts: ["/module-buro.js"] },
};

const loadedScripts = new Set<string>();

function loadScriptOnce(src: string): Promise<void> {
  if (loadedScripts.has(src)) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => {
      loadedScripts.add(src);
      resolve();
    };
    s.onerror = () => resolve();
    document.body.appendChild(s);
  });
}

export default function DashboardShellClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement>(null);

  // "shellReady" — kabuk (topbar+sidebar) DOM'a yerleşip script'ler
  // yüklendikten sonra true olur. İçerik yükleme, bu true olmadan HİÇ
  // başlamaz — böylece "kabuk henüz hazır değilken içerik yüklemeye
  // çalışma" yarışı tamamen ortadan kalkar.
  const [shellReady, setShellReady] = useState(false);
  const shellSetupStarted = useRef(false);
  const loadingPath = useRef<string | null>(null); // o an YÜKLENMEKTE olan yol (çakışan çağrıları engellemek için)
  const loadedPath = useRef<string | null>(null); // en son BAŞARIYLA yüklenmiş yol

  const [checkingWorkspace, setCheckingWorkspace] = useState(pathname === "/dashboard");
  const [hasWorkspace, setHasWorkspace] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (pathname !== "/dashboard") { setCheckingWorkspace(false); return; }
    fetch("/api/workspace")
      .then((r) => { setHasWorkspace(r.ok); setCheckingWorkspace(false); })
      .catch(() => { setHasWorkspace(true); setCheckingWorkspace(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── ADIM 1: Kabuğu (topbar+sidebar) BİR KEZ kur ──
  useEffect(() => {
    if (status !== "authenticated" || shellSetupStarted.current || !shellRef.current || checkingWorkspace || !hasWorkspace) return;
    shellSetupStarted.current = true;

    (async () => {
      const res = await fetch("/dashboard-shell.html");
      const html = await res.text();
      if (!shellRef.current) return;
      shellRef.current.innerHTML = html;

      const pill = document.getElementById("userEmailPill");
      if (pill) pill.textContent = session?.user?.name?.trim() || session?.user?.email || "";

      (window as any).talyaSignOut = () => signOut({ callbackUrl: "/" });

      if (pill && (session?.user as any)?.isAdmin) {
        const adminLink = document.createElement("a");
        adminLink.href = "/admin";
        adminLink.textContent = "Yönetici Paneli";
        adminLink.className = "nav-pill";
        adminLink.style.cssText =
          "font-size:11px;color:var(--gold);margin-left:6px;text-decoration:none;cursor:pointer;white-space:nowrap;";
        pill.parentElement?.insertBefore(adminLink, pill.nextSibling);
      }

      (window as any).__talyaMigratedPaths = MIGRATED_PATHS;
      (window as any).__talyaSpaNav = (path: string, openParam: string | null) => {
        const url = openParam ? `${path}?open=${openParam}` : path;
        router.push(url);
      };

      await loadScriptOnce("/modules-index.js");
      await loadScriptOnce("/cmdk-index.js");
      (window as any).__talyaSpaMode = true;
      await loadScriptOnce("/engine.js");

      setShellReady(true); // içerik yükleme artık başlayabilir
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, checkingWorkspace, hasWorkspace]);

  // ── ADIM 2: Kabuk hazır olduktan SONRA, o an hangi sayfadaysak
  // (ilk yükleme DAHİL) ya da sayfa her değiştiğinde, İÇERİĞİ yükle.
  // Bu, TEK ve YEGÂNE içerik yükleme tetikleyicisidir. ──
  useEffect(() => {
    if (!shellReady || !pathname || !MIGRATED_PATHS.includes(pathname)) return;
    if (loadingPath.current === pathname || loadedPath.current === pathname) return;
    loadingPath.current = pathname;

    (async () => {
      const cfg = CONTENT_MAP[pathname];
      if (!cfg) { loadingPath.current = null; return; }

      const slot = document.getElementById("talyaContentSlot");
      if (!slot) { loadingPath.current = null; return; }

      const res = await fetch(cfg.contentUrl);
      const html = await res.text();
      slot.innerHTML = html;

      if (pathname === "/dashboard") {
        (window as any).CURRENT_MODULE = null;
        const sbLabel = document.getElementById("sidebarLabel");
        if (sbLabel) sbLabel.innerHTML = "TALYA HUKUK";
        const sbName = document.getElementById("sidebarName");
        if (sbName) sbName.innerHTML = "Tüm Araçlar";
        const breadcrumbSep = document.getElementById("appBreadcrumbSep");
        if (breadcrumbSep) (breadcrumbSep as HTMLElement).style.display = "none";
        const modName = document.getElementById("appModuleName");
        if (modName) modName.innerHTML = "";
        const itemName = document.getElementById("appItemName");
        if (itemName) itemName.innerHTML = "";
      } else {
        const breadcrumbSep = document.getElementById("appBreadcrumbSep");
        if (breadcrumbSep) (breadcrumbSep as HTMLElement).style.display = "";
      }

      for (const src of cfg.scripts) {
        await loadScriptOnce(src);
      }

      if (typeof (window as any).talyaInitPage === "function") {
        (window as any).talyaInitPage();
      }

      loadedPath.current = pathname;
      loadingPath.current = null;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shellReady, pathname]);

  if (status !== "authenticated" || checkingWorkspace) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#6e6a64" }}>
        Yükleniyor…
      </div>
    );
  }

  if (!hasWorkspace) {
    return <OnboardingScreen onDone={() => setHasWorkspace(true)} />;
  }

  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div ref={shellRef} style={{ height: "100vh" }} />
      {/* children render edilmiyor — içerik, yukarıdaki effect ile
          doğrudan #talyaContentSlot'a yazılıyor. Next.js'in route
          eşleşmesi için burada tutuluyor. */}
      <div style={{ display: "none" }}>{children}</div>
    </>
  );
}
