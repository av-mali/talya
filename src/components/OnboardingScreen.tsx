"use client";

import { useState } from "react";

// İlk kayıt sonrası, henüz bir büro (workspace) oluşturmamış kullanıcıya
// gösterilir. Hem eski (TalyaShell) hem yeni (DashboardShellClient) akış
// tarafından ortak kullanılıyor.
export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) {
      setError("Büro adı gerekli.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/workspace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Büro oluşturulamadı.");
        return;
      }
      onDone();
    } catch (e) {
      setError("Bağlantı hatası, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ minHeight: "100vh", height: "100vh", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20, boxSizing: "border-box" }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 36, width: "min(420px, 92vw)", textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 24, marginBottom: 10 }}>
            Talya'ya <em style={{ color: "var(--gold)" }}>Hoş Geldiniz</em>
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 24 }}>
            Devam etmek için kendi büronuzu oluşturun. Bir meslektaşınızın
            davetiyle geldiyseniz, onun size gönderdiği davet bağlantısını
            kullanın — bu ekrana gerek kalmaz.
          </div>

          <div style={{ textAlign: "left", marginBottom: 6, fontSize: 11, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            Büro Adı
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ör. Yılmaz Hukuk Bürosu"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border2)", background: "var(--bg)", color: "var(--t0)", fontSize: 14, marginBottom: 14, boxSizing: "border-box" }}
          />

          {error && <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}

          <button
            onClick={handleCreate}
            disabled={loading}
            style={{ width: "100%", padding: "11px 18px", borderRadius: 8, border: "none", background: "var(--gold)", color: "#fff", fontWeight: 500, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Oluşturuluyor…" : "Büromu Kur"}
          </button>
        </div>
      </div>
    </>
  );
}
