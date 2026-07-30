"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

const CONTENT_MAP: Record<string, { contentUrl: string; scripts: string[] }> = {
  "/dashboard": { contentUrl: "/home-content.html", scripts: [] },
  "/dashboard/buro": { contentUrl: "/buro-content.html", scripts: ["/module-buro.js"] },
  "/dashboard/belge": { contentUrl: "/ai-content.html", scripts: ["/module-belge.js"] },
  "/dashboard/arabuluculuk": { contentUrl: "/ai-content.html", scripts: ["/module-arabuluculuk.js"] },
  "/dashboard/tevkil": { contentUrl: "/buro-content.html", scripts: ["/module-tevkil.js"] },
  "/dashboard/uyap": { contentUrl: "/ai-content.html", scripts: ["/module-uyap.js"] },
  "/dashboard/hesap": { contentUrl: "/noai-content.html", scripts: ["/module-hesap.js"] },
  "/dashboard/uyelik": { contentUrl: "/noai-content.html", scripts: ["/module-uyelik.js", "/kilavuz-content.js"] },
};

const loadedScripts = new Set<string>();

const BUILD_TAG = Date.now(); // her sayfa oturumunda sabit, ama her yeni deploy sonrası tarayıcının ESKİ script/HTML'i önbellekten göstermesini engeller

function loadScriptOnce(src: string): Promise<void> {
  if (loadedScripts.has(src)) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = src + "?v=" + BUILD_TAG;
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
  const searchParams = useSearchParams();
  const openParam = searchParams.get("open");
  const shellRef = useRef<HTMLDivElement>(null);

  // "shellReady" — kabuk (topbar+sidebar) DOM'a yerleşip script'ler
  // yüklendikten sonra true olur. İçerik yükleme, bu true olmadan HİÇ
  // başlamaz — böylece "kabuk henüz hazır değilken içerik yüklemeye
  // çalışma" yarışı tamamen ortadan kalkar.
  const [shellReady, setShellReady] = useState(false);
  const shellSetupStarted = useRef(false);
  const loadingPath = useRef<string | null>(null); // o an YÜKLENMEKTE olan yol (çakışan çağrıları engellemek için)
  const loadedPath = useRef<string | null>(null); // en son BAŞARIYLA yüklenmiş yol
  // Bir modülden Ana Sayfa'ya dönünce window.CURRENT_MODULE'ü null'a
  // çekiyoruz (home'un "hiçbir modülde değiliz" durumunu doğru
  // yansıtması için) — ama modülün script'i (ör. module-buro.js) İKİNCİ
  // ziyarette YENİDEN ÇALIŞMAZ (tarayıcı script'i tekrar yüklemez), yani
  // CURRENT_MODULE bir daha KENDİLİĞİNDEN set olmaz. Bu yüzden her
  // modülün config'ini burada saklayıp, o modüle her geri dönüşte
  // elle geri yüklüyoruz.
  const moduleConfigCache = useRef<Record<string, any>>({});

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
      const res = await fetch("/dashboard-shell.html", { cache: "no-store" });
      const html = await res.text();
      if (!shellRef.current) return;
      shellRef.current.innerHTML = html;

      const pill = document.getElementById("userEmailPill");
      if (pill) {
        const name = session?.user?.name?.trim() || session?.user?.email || "";
        pill.innerHTML = `${name} <i class="fa-solid fa-chevron-down" style="font-size:8px;opacity:.6;"></i>`;
      }

      (window as any).talyaSignOut = () => signOut({ callbackUrl: "/" });

      if ((session?.user as any)?.isAdmin) {
        const adminLink = document.getElementById("userMenuAdminLink");
        if (adminLink) {
          adminLink.style.display = "flex";
          adminLink.onclick = () => { window.location.href = "/admin"; };
        }
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
      try {
        const cfg = CONTENT_MAP[pathname];
        if (!cfg) return;

        const slot = document.getElementById("talyaContentSlot");
        if (!slot) return;

        // ÖNEMLİ: Ayrılmakta olduğumuz modülün CURRENT_MODULE'ünü HER
        // navigasyonda (sadece Ana Sayfa'ya dönüşte değil, modülden
        // modüle DİREKT geçişte de) kaydediyoruz. Eskiden bu SADECE
        // Ana Sayfa'ya dönerken yapılıyordu — bu yüzden Arabuluculuk'tan
        // Büro'ya, oradan tekrar Arabuluculuk'a (Ana Sayfa'ya hiç
        // uğramadan) geçilince, Arabuluculuk'un script'i tekrar
        // çalışmadığı için CURRENT_MODULE hâlâ BÜRO'nun bilgisini
        // taşıyordu — bu da Arabuluculuk'un kendi verisini hiç
        // gösterememesine (sürekli "yükleniyor" kalmasına) yol açıyordu.
        if ((window as any).CURRENT_MODULE && loadedPath.current && loadedPath.current !== pathname) {
          moduleConfigCache.current[loadedPath.current] = (window as any).CURRENT_MODULE;
        }
        (window as any).CURRENT_MODULE = null; // hedef modüle geçmeden önce ESKİ değeri her zaman temizle

        const res = await fetch(cfg.contentUrl, { cache: "no-store" });
        const html = await res.text();

        // YARIŞ DURUMU KORUMASI: bu async fonksiyon await'lerde beklerken
        // kullanıcı HIZLICA başka bir sayfaya geçmiş olabilir — bu durumda
        // bir SONRAKİ effect çalışması loadingPath.current'ı KENDİ yoluna
        // ayarlamış olur. Böyle bir durumda burada devam edip ESKİ
        // içeriği/scripti YENİ sayfanın üzerine yazmamak için, her ağır
        // adımdan sonra "hâlâ bu pathname için mi çalışıyoruz?" diye
        // kontrol ediyoruz — değilse sessizce vazgeçiyoruz (loadedPath.current
        // GÜNCELLENMEZ, bu yüzden asıl geçerli navigasyon kendi effect'inde
        // normal şekilde yüklemeye devam eder/edecektir).
        if (loadingPath.current !== pathname) return;

        slot.innerHTML = html;

        if (pathname === "/dashboard") {
          // NOT: sidebarLabel/sidebarName/sidebarTagline artık HİÇ
          // değiştirilmiyor — sidebar başlığı her sayfada SABİT kalıyor
          // (menünün yukarı/aşağı oynamaması için). Bkz. engine.js'teki
          // aynı notla ilgili yorum.
          const breadcrumbSep = document.getElementById("appBreadcrumbSep");
          if (breadcrumbSep) (breadcrumbSep as HTMLElement).style.display = "none";
          const modName = document.getElementById("appModuleName");
          if (modName) modName.innerHTML = "";
          const itemName = document.getElementById("appItemName");
          if (itemName) itemName.innerHTML = "";

          // Ana sayfadaki karşılama satırı — "Merhaba, X — Bugün günlerden…"
          // Bu daha önce (SPA'ya geçmeden önce) TalyaShell'de dolduruluyordu;
          // artık burada, ana sayfa içeriği her yüklendiğinde dolduruluyor.
          const greeting = document.getElementById("home-greeting");
          if (greeting) {
            const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
            const GUNLER = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
            const now = new Date();
            const saat = now.getHours();
            const selamlama = saat < 6 ? "İyi geceler" : saat < 12 ? "Günaydın" : saat < 18 ? "İyi günler" : "İyi akşamlar";
            const ilkAd = (session?.user?.name?.trim() || "").split(" ")[0];
            greeting.textContent = `${ilkAd ? selamlama + ", " + ilkAd + " — " : ""}Bugün günlerden ${now.getDate()} ${AYLAR[now.getMonth()]} ${now.getFullYear()}, ${GUNLER[now.getDay()]}`;
          }
        } else {
          const breadcrumbSep = document.getElementById("appBreadcrumbSep");
          if (breadcrumbSep) (breadcrumbSep as HTMLElement).style.display = "";
        }

        for (const src of cfg.scripts) {
          await loadScriptOnce(src);
        }

        // Script yükleme de asenkron — yine aynı yarış durumu kontrolü.
        if (loadingPath.current !== pathname) return;

        // Bu modüle DAHA ÖNCE girilmişse, script'i tekrar çalışmadığı için
        // CURRENT_MODULE'ü önbellekten geri yüklüyoruz.
        if (pathname !== "/dashboard" && !(window as any).CURRENT_MODULE && moduleConfigCache.current[pathname]) {
          (window as any).CURRENT_MODULE = moduleConfigCache.current[pathname];
        }

        if (typeof (window as any).talyaInitPage === "function") {
          try {
            await (window as any).talyaInitPage();
          } catch (e) {
            console.error("talyaInitPage sırasında hata (SPA içerik yükleme):", e);
          }
        }

        // talyaInitPage de asenkron olabiliyor — son bir kez daha kontrol.
        if (loadingPath.current !== pathname) return;

        loadedPath.current = pathname;
      } catch (e) {
        // BURASI ÇOK ÖNEMLİ: herhangi bir adımda (fetch, script yükleme
        // vb.) beklenmeyen bir hata olursa, ESKİDEN loadingPath.current
        // hiç sıfırlanmıyordu — bu da o modülün BİR DAHA HİÇ
        // yüklenememesine (sürekli "yükleniyor" görünmesine) yol
        // açıyordu. Artık ne olursa olsun (başarı ya da hata) en altta
        // MUTLAKA sıfırlanıyor.
        console.error("SPA içerik yükleme hatası:", pathname, e);
      } finally {
        loadingPath.current = null;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shellReady, pathname]);

  // ── ADIM 3: Sayfa (pathname) AYNI kalıp sadece ?open=... parametresi
  // değiştiğinde (ör. büro içinde bir araçtan diğerine geçerken) — bu,
  // ADIM 2'nin dinlemediği bir değişim. İçeriği YENİDEN YÜKLEMEYE gerek
  // yok, sadece o an açık olan aracı değiştiriyoruz. ──
  useEffect(() => {
    if (!shellReady || !pathname || !MIGRATED_PATHS.includes(pathname)) return;
    if (loadedPath.current !== pathname) return; // ADIM 2 henüz bu sayfayı yüklemediyse, o halledecek
    if (!openParam) return;
    if (typeof (window as any).openPopup === "function" && (window as any).CURRENT_MODULE) {
      (window as any).openPopup(openParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shellReady, pathname, openParam]);

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
      {/* children BİLEREK render edilmiyor — içerik, yukarıdaki effect
          ile doğrudan #talyaContentSlot'a yazılıyor. Bir modülün
          page.tsx'i yanlışlıkla eski TalyaShell'i kullanırsa (daha önce
          "Yönetici Paneli" bağlantısının tekrar tekrar eklenmesine yol
          açan hata buydu), bu satır onu ASLA çalıştırmaz. */}
    </>
  );
}
