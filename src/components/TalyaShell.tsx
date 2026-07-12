"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Bu bileşen, verilen HTML gövdesini ve script'leri sırayla yükler.
// Her modül sayfası bu bileşeni farklı dosyalarla çağırır — böylece
// bir modülü değiştirmek diğerlerini hiç etkilemez.
export default function TalyaShell({
  bodyUrl,
  scripts,
}: {
  bodyUrl: string;
  scripts: string[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || loaded) return;
    let cancelled = false;

    (async () => {
      const res = await fetch(bodyUrl);
      const html = await res.text();
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = html;

      const pill = document.getElementById("userEmailPill");
      if (pill) pill.textContent = session?.user?.name?.trim() || session?.user?.email || "";

      // Statik HTML kabukları (home-body.html vb.) "Çıkış Yap" için bunu
      // çağırır — NextAuth'un kendi çıplak onay ekranına gitmek yerine,
      // hiç ara ekran göstermeden temiz bir şekilde çıkış yapar.
      (window as any).talyaSignOut = () => {
        signOut({ callbackUrl: "/login" });
      };

      // Yönetici hesabıysa, üst menüye "Yönetici Paneli" bağlantısı ekle —
      // sadece admin=true olan hesaplar görür, adres elle yazılmasın diye.
      if (pill && (session?.user as any)?.isAdmin) {
        const adminLink = document.createElement("a");
        adminLink.href = "/admin";
        adminLink.textContent = "Yönetici Paneli";
        adminLink.className = pill.className.includes("nav-pill") ? "nav-pill" : "";
        adminLink.style.cssText =
          "font-size:11px;color:var(--gold);margin-left:6px;text-decoration:none;cursor:pointer;white-space:nowrap;";
        pill.parentElement?.insertBefore(adminLink, pill.nextSibling);
      }

      // engine.js diğer script'lere (CURRENT_MODULE, CMDK_INDEX) ihtiyaç
      // duyduğu için en son çalışmalı — ama ondan öncekiler birbirinden
      // bağımsız, paralel indirilebilir. Bu, büyük modül dosyalarının
      // (ör. büro ~60KB) diğer küçük dosyaları bloklamasını önler.
      const loadScript = (src: string) =>
        new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = src;
          s.async = false;
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.body.appendChild(s);
        });

      const engineIdx = scripts.findIndex((s) => s.includes("engine.js"));
      const parallelScripts = engineIdx >= 0 ? scripts.filter((_, i) => i !== engineIdx) : scripts;
      await Promise.all(parallelScripts.map(loadScript));
      if (engineIdx >= 0) await loadScript(scripts[engineIdx]);

      if (!cancelled) setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, loaded, session]);

  if (status !== "authenticated") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "#6e6a64",
        }}
      >
        Yükleniyor…
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div ref={containerRef} />
    </>
  );
}
