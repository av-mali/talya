"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
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
      if (pill && session?.user?.email) pill.textContent = session.user.email;

      for (const src of scripts) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = src;
          s.async = false;
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.body.appendChild(s);
        });
      }
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
