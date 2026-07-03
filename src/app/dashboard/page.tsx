"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Bu sayfa, orijinal index.html prototipinin tasarımını ve arayüz
// mantığını (modüller, hesaplayıcılar, komut paleti, bildirimler)
// olduğu gibi yükler. HTML ve JS dosyaları /public klasöründe duruyor.
// Değişen tek şey: sohbet artık doğrudan Claude'a değil, güvenli
// backend uç noktamıza (/api/chat) gidiyor.

export default function Dashboard() {
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
      const res = await fetch("/talya-body.html");
      const html = await res.text();
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = html;

      // Kullanıcının e-postasını üst menüdeki pill'e yaz.
      const pill = document.getElementById("userEmailPill");
      if (pill && session?.user?.email) pill.textContent = session.user.email;

      // Orijinal arayüzün JS dosyasını script etiketi olarak ekle.
      const script = document.createElement("script");
      script.src = "/talya-script.js";
      script.async = false;
      document.body.appendChild(script);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
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
