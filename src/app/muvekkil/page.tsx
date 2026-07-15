"use client";

import { useEffect, useState } from "react";

type CaseInfo = {
  id: string;
  title: string;
  status: string;
  agreedFee: number | null;
  invoicedTotal: number;
  remaining: number | null;
  events: { type: string; title: string; dueDate: string }[];
};

type Message = { id: string; content: string; isFromClient: boolean; createdAt: string };

const EVENT_LABELS: Record<string, string> = {
  durusma: "Duruşma",
  odeme: "Ödeme",
  tebligat: "Tebligat",
};

function fmtTL(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

export default function MuvekkilPage() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [clientName, setClientName] = useState("");
  const [cases, setCases] = useState<CaseInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  async function loadPortalData() {
    const res = await fetch("/api/portal/me");
    if (!res.ok) {
      setLoggedIn(false);
      setChecking(false);
      return;
    }
    const data = await res.json();
    setClientName(data.clientName);
    setCases(data.cases || []);
    setLoggedIn(true);
    setChecking(false);
    const mRes = await fetch("/api/portal/messages");
    if (mRes.ok) {
      const mData = await mRes.json();
      setMessages(mData.messages || []);
    }
  }

  useEffect(() => {
    loadPortalData();
  }, []);

  async function handleSendMessage() {
    if (!newMessage.trim()) return;
    const res = await fetch("/api/portal/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage.trim() }),
    });
    if (res.ok) {
      setNewMessage("");
      loadPortalData();
    }
  }

  async function handleLogout() {
    await fetch("/api/portal/logout", { method: "POST" });
    setLoggedIn(false);
    setCases([]);
    setMessages([]);
  }

  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ minHeight: "100vh", height: "100vh", overflowY: "auto", background: "var(--bg)", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 60px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div className="serif" style={{ fontSize: 24 }}>
              Müvekkil <em style={{ color: "var(--gold)" }}>Paneli</em>
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 4 }}>Talya Hukuk</div>
          </div>

          {checking ? (
            <div style={{ textAlign: "center", fontSize: 13, color: "var(--t3)" }}>Yükleniyor…</div>
          ) : !loggedIn ? (
            <LoginForm onSuccess={loadPortalData} />
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 15, color: "var(--t1)" }}>
                  Hoş geldiniz, <strong>{clientName}</strong>
                </div>
                <button onClick={handleLogout} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border2)", background: "transparent", color: "var(--t2)", cursor: "pointer", fontSize: 12 }}>
                  Çıkış Yap
                </button>
              </div>

              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--t3)", marginBottom: 10 }}>
                Dosyalarınız ({cases.length})
              </div>
              {cases.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 30 }}>Henüz bir dosyanız görünmüyor.</div>
              ) : (
                cases.map((c) => (
                  <div key={c.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{c.title}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: c.status === "acik" ? "var(--success)" : "var(--t3)" }}>
                        {c.status === "acik" ? "Açık" : "Kapalı"}
                      </span>
                    </div>

                    {c.events.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10.5, color: "var(--t3)", marginBottom: 4 }}>Tarihler</div>
                        {c.events.map((e, i) => {
                          const isPast = new Date(e.dueDate) < new Date();
                          return (
                            <div key={i} style={{ fontSize: 12.5, color: isPast ? "var(--t3)" : "var(--t1)", marginBottom: 2 }}>
                              {EVENT_LABELS[e.type] || e.type}: {new Date(e.dueDate).toLocaleDateString("tr-TR")} — {e.title}{isPast ? " (geçti)" : ""}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {c.agreedFee != null && (
                      <div style={{ fontSize: 12.5, color: "var(--t2)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                        <div>Anlaşılan Ücret: <strong>{fmtTL(c.agreedFee)}</strong></div>
                        <div>Ödenen: <strong style={{ color: "var(--success)" }}>{fmtTL(c.invoicedTotal)}</strong></div>
                        {c.remaining != null && c.remaining > 0 && (
                          <div style={{ color: "var(--warn)" }}>Bekleyen: {fmtTL(c.remaining)}</div>
                        )}
                        {c.remaining === 0 && <div style={{ color: "var(--success)" }}>Ödeme tamamlandı ✓</div>}
                      </div>
                    )}
                  </div>
                ))
              )}

              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--t3)", margin: "24px 0 10px" }}>
                Büroya Mesaj
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
                  {messages.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: "var(--t3)" }}>Henüz bir mesajınız yok.</div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} style={{ marginBottom: 10, padding: "9px 12px", borderRadius: 8, background: m.isFromClient ? "var(--bg2)" : "var(--gold-lo)" }}>
                        <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 3 }}>
                          {m.isFromClient ? "Siz" : "Büro"} — {new Date(m.createdAt).toLocaleString("tr-TR")}
                        </div>
                        <div style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{m.content}</div>
                      </div>
                    ))
                  )}
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  placeholder="Bürova bir mesaj/soru yazın…"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border2)", background: "var(--bg)", color: "var(--t0)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}
                />
                <button
                  onClick={handleSendMessage}
                  style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--gold)", color: "#fff", cursor: "pointer", fontSize: 13 }}
                >
                  Gönder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [tcMersis, setTcMersis] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!tcMersis.trim() || !password.trim()) {
      setError("TC Kimlik No ve şifre gerekli.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tcMersis: tcMersis.trim(), password: password.trim() }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Giriş yapılamadı.");
      return;
    }
    onSuccess();
  }

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 30, maxWidth: 380, margin: "0 auto" }}>
      <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 6 }}>TC Kimlik No</div>
      <input
        type="text"
        value={tcMersis}
        onChange={(e) => setTcMersis(e.target.value)}
        placeholder="12345678901"
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border2)", background: "var(--bg)", color: "var(--t0)", fontSize: 14, marginBottom: 14, boxSizing: "border-box" }}
      />
      <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 6 }}>Şifre</div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Büronuzdan aldığınız şifre"
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border2)", background: "var(--bg)", color: "var(--t0)", fontSize: 14, marginBottom: 14, boxSizing: "border-box" }}
      />
      {error && <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ width: "100%", padding: "11px 18px", borderRadius: 8, border: "none", background: "var(--gold)", color: "#fff", fontWeight: 500, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 14, textAlign: "center" }}>
        Şifrenizi bilmiyorsanız, avukatınızla iletişime geçin.
      </div>
    </div>
  );
}
