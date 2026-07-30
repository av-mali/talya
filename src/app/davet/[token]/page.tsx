"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DavetPage({ params }: { params: { token: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetch(`/api/workspace/invite/${params.token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setWorkspaceName(data.workspaceName);
      })
      .catch(() => setError("Davet bilgisi alınamadı."));
  }, [params.token]);

  async function handleJoin() {
    setJoining(true);
    setError("");
    try {
      const res = await fetch("/api/workspace/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Katılırken bir hata oluştu.");
        return;
      }
      setJoined(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (e) {
      setError("Bağlantı hatası, tekrar deneyin.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ minHeight: "100vh", height: "100vh", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 36, width: "min(400px, 90vw)", textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 24, marginBottom: 16 }}>
            Büro <em style={{ color: "var(--gold)" }}>Daveti</em>
          </div>

          {error && (
            <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}

          {joined ? (
            <div style={{ color: "var(--success)", fontSize: 14 }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: 28, marginBottom: 10, display: "block" }}></i>
              Büroya katıldınız! Yönlendiriliyorsunuz…
            </div>
          ) : workspaceName ? (
            <>
              <div style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.6, marginBottom: 24 }}>
                <strong>{workspaceName}</strong> bürosuna katılmaya davet edildiniz.
                Katılırsanız, bu büronun tüm müvekkil ve dosya verilerini
                görüntüleyip yönetebileceksiniz.
              </div>

              {status === "loading" ? (
                <div style={{ fontSize: 12, color: "var(--t3)" }}>Yükleniyor…</div>
              ) : status === "unauthenticated" ? (
                <div>
                  <div style={{ fontSize: 12.5, color: "var(--t3)", marginBottom: 12 }}>
                    Katılmak için önce giriş yapmanız gerekiyor.
                  </div>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent("/davet/" + params.token)}`}
                    style={{ display: "block", padding: "10px 18px", borderRadius: 8, background: "var(--gold)", color: "#fff", textDecoration: "none", fontWeight: 500, marginBottom: 8 }}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href={`/register?callbackUrl=${encodeURIComponent("/davet/" + params.token)}`}
                    style={{ display: "block", padding: "10px 18px", borderRadius: 8, border: "1px solid var(--border2)", color: "var(--t1)", textDecoration: "none" }}
                  >
                    Hesap Oluştur
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "var(--gold)", color: "#fff", fontWeight: 500, cursor: joining ? "default" : "pointer", opacity: joining ? 0.6 : 1 }}
                >
                  {joining ? "Katılınıyor…" : "Büroya Katıl"}
                </button>
              )}
            </>
          ) : !error ? (
            <div style={{ fontSize: 12, color: "var(--t3)" }}>Yükleniyor…</div>
          ) : null}
        </div>
      </div>
    </>
  );
}
