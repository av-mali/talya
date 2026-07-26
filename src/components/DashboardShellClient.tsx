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
  const shellMounted = useRef(false);
  const currentContentPath = useRef<string | null>(null);

  // Ana Sayfa'ya (/dashboard) özel: kullanıcının hiç workspace'i yoksa
  // (ilk kayıt sonrası), kalıcı çerçeveyi hiç göstermeden onboarding
  // ekranını göster — eski page.tsx'teki kontrolün AYNISI, sadece yeri
  // değişti.
  const [checkingWorkspace, setCheckingWorkspace] = useState(pathname === "/dashboard");
  const [hasWorkspace, setHasWorkspace] = useState(true);

  useEffect(() => {
    if (pathname !== "/dashboard") { setCheckingWorkspace(false); return; }
    fetch("/api/workspace")
      .then((r) => { setHasWorkspace(r.ok); setCheckingWorkspace(false); })
      .catch(() => { setHasWorkspace(true); setCheckingWorkspace(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // ── Kabuk (topbar + sidebar) BİR KEZ yüklenir ──
  useEffect(() => {
    if (status !== "authenticated" || shellMounted.current || !shellRef.current) return;
    shellMounted.current = true;

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

      // Diğer sayfalar tam yenilemeyle (window.location.href) gitmeye
      // devam etsin, ama BU iki sayfa arasında SPA (yenilemesiz) geçiş
      // yapılsın.
      (window as any).__talyaMigratedPaths = MIGRATED_PATHS;
      (window as any).__talyaSpaNav = (path: string, openParam: string | null) => {
        const url = openParam ? `${path}?open=${openParam}` : path;
        router.push(url);
      };

      await loadScriptOnce("/modules-index.js");
      await loadScriptOnce("/cmdk-index.js");
      // Bu bayrak, engine.js'in kendi kendine (henüz içerik hazır
      // olmadan) çalışmasını engeller — talyaInitPage'i BİZ, doğru
      // zamanda (loadContentFor içinde) çağıracağız.
      (window as any).__talyaSpaMode = true;
      await loadScriptOnce("/engine.js");

      // İlk yüklemede, o an bulunulan sayfanın içeriğini yükle.
      await loadContentFor(window.location.pathname, new URLSearchParams(window.location.search).get("open"));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ── Sayfa (pathname) değiştikçe SADECE içerik alanını güncelle ──
  useEffect(() => {
    if (!shellMounted.current) return; // kabuk henüz kurulmadıysa, yukarıdaki ilk yükleme zaten halledecek
    if (!pathname || !MIGRATED_PATHS.includes(pathname)) return;
    if (currentContentPath.current === pathname) return;
    loadContentFor(pathname, new URLSearchParams(window.location.search).get("open"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function loadContentFor(path: string, openParam: string | null) {
    const cfg = CONTENT_MAP[path];
    if (!cfg) return;
    currentContentPath.current = path;

    const slot = document.getElementById("talyaContentSlot");
    if (!slot) return;
    slot.innerHTML = "";

    const res = await fetch(cfg.contentUrl);
    const html = await res.text();
    slot.innerHTML = html;

    // Ana Sayfa'ya dönüldüyse, önceki modülün CURRENT_MODULE'ü hâlâ
    // bellekte kalmış olabilir — temizle ki sidebar/talyaInitPage
    // "hâlâ o modüldeymişiz" gibi davranmasın. Sidebar başlığını ve üst
    // çubuktaki breadcrumb'ı da varsayılana döndür.
    if (path === "/dashboard") {
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

    // ?open=... varsa, modül scripti bunu kendi initModulePage'i
    // içinde zaten okuyor (URLSearchParams ile) — sadece emin olmak
    // için query'yi güncelliyoruz (SPA nav sırasında history zaten
    // router.push ile güncellendi).
    if (typeof (window as any).talyaInitPage === "function") {
      (window as any).talyaInitPage();
    }
  }

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
      {/* children render edilmiyor — içerik, loadContentFor ile doğrudan
          #talyaContentSlot'a yazılıyor. Bu prop sadece Next.js'in route
          eşleşmesi için burada tutuluyor. */}
      <div style={{ display: "none" }}>{children}</div>
    </>
  );
}
