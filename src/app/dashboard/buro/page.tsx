"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type EventItem = { id: string; type: string; title: string; dueDate: string };
type LogItem = { id: string; content: string; createdAt: string };
type InvoiceItem = { id: string; amount: number; note: string | null; createdAt: string };
type ClientListItem = {
  id: string; name: string; phone: string | null; email: string | null; notes: string | null;
  events: EventItem[];
};
type ClientDetail = ClientListItem & { logs: LogItem[]; invoices: InvoiceItem[] };

function daysLeftLabel(dueDate: string) {
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)} gün geçti`, color: "var(--danger)" };
  if (days === 0) return { text: "Bugün", color: "var(--danger)" };
  if (days <= 3) return { text: `${days} gün kaldı`, color: "var(--danger)" };
  if (days <= 7) return { text: `${days} gün kaldı`, color: "var(--warn)" };
  return { text: `${days} gün kaldı`, color: "var(--t2)" };
}

export default function BuroModulu() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNote, setNewNote] = useState("");
  const [logText, setLogText] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");
  const [eventType, setEventType] = useState("durusma");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadClients = useCallback(async (q?: string) => {
    const res = await fetch("/api/clients" + (q ? `?q=${encodeURIComponent(q)}` : ""));
    const data = await res.json();
    if (data.clients) setClients(data.clients);
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/clients/${id}`);
    const data = await res.json();
    if (data.client) setDetail(data.client);
  }, []);

  useEffect(() => {
    if (status === "authenticated") loadClients();
  }, [status, loadClients]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  async function handleSearch(v: string) {
    setQuery(v);
    loadClients(v);
  }

  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, phone: newPhone, email: newEmail, notes: newNote }),
    });
    const data = await res.json();
    if (data.client) {
      setNewName(""); setNewPhone(""); setNewEmail(""); setNewNote("");
      setShowNewClient(false);
      await loadClients(query);
      setSelectedId(data.client.id);
    }
  }

  async function addLog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !logText.trim()) return;
    await fetch(`/api/clients/${selectedId}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: logText }),
    });
    setLogText("");
    loadDetail(selectedId);
  }

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !invoiceAmount.trim()) return;
    await fetch(`/api/clients/${selectedId}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: invoiceAmount, note: invoiceNote }),
    });
    setInvoiceAmount(""); setInvoiceNote("");
    loadDetail(selectedId);
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !eventTitle.trim() || !eventDate) return;
    await fetch(`/api/clients/${selectedId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: eventType, title: eventTitle, dueDate: eventDate }),
    });
    setEventTitle(""); setEventDate("");
    loadDetail(selectedId);
    loadClients(query);
  }

  if (status !== "authenticated") {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Yükleniyor…</div>;
  }

  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100vh" }}>
        {/* ÜST BAR */}
        <div className="app-topbar">
          <div className="app-top-left">
            <button className="home-btn" onClick={() => router.push("/dashboard")}>
              <i className="fa-solid fa-house"></i> Ana Sayfa
            </button>
            <div className="app-breadcrumb">
              <span>Büro Yönetimi</span>
              <span style={{ opacity: 0.35 }}>›</span>
              <span className="cur">Müvekkil Yönetimi</span>
            </div>
          </div>
          <div className="app-top-right">
            <span style={{ fontSize: 12, color: "var(--t2)" }}>{session?.user?.email}</span>
            <button
              className="nav-pill gold"
              style={{ cursor: "pointer" }}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* SOL: MÜVEKKİL LİSTESİ */}
          <div className="app-sidebar" style={{ display: "flex", flexDirection: "column" }}>
            <div className="sidebar-head">
              <div className="sidebar-mod-label">Büro Yönetimi</div>
              <div className="sidebar-mod-name">Müvekkil <em className="b">Listesi</em></div>
            </div>

            <div style={{ padding: "0 14px 10px" }}>
              <input
                type="text"
                placeholder="Müvekkil ara…"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div style={{ padding: "0 14px 10px" }}>
              <button
                className="pop-cta-btn b"
                style={{ width: "100%" }}
                onClick={() => setShowNewClient((v) => !v)}
              >
                <i className="fa-solid fa-user-plus"></i>
                <span>{showNewClient ? "Vazgeç" : "Yeni Müvekkil"}</span>
              </button>
            </div>

            {showNewClient && (
              <form onSubmit={createClient} style={{ padding: "0 14px 14px", borderBottom: "1px solid var(--border)" }}>
                <div className="fg"><div className="fl">Ad Soyad</div>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Müvekkil adı…" required />
                </div>
                <div className="fg"><div className="fl">Telefon</div>
                  <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="05__ ___ __ __" />
                </div>
                <div className="fg"><div className="fl">E-posta</div>
                  <input type="text" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="mail@ornek.com" />
                </div>
                <div className="fg"><div className="fl">Dava Konusu / Not</div>
                  <textarea rows={2} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Kısa not…" />
                </div>
                <button className="pop-cta-btn b" style={{ width: "100%" }}><span>Kaydet</span></button>
              </form>
            )}

            <div className="s-nav" style={{ flex: 1, overflowY: "auto" }}>
              {clients.length === 0 && (
                <div style={{ padding: 14, fontSize: 12, color: "var(--t3)" }}>
                  Henüz müvekkil eklenmedi.
                </div>
              )}
              {clients.map((c) => {
                const next = c.events?.[0];
                return (
                  <div
                    key={c.id}
                    className={`s-item ${selectedId === c.id ? "active-b" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <span className="ico"><i className="fa-solid fa-user"></i></span>
                    <span style={{ flex: 1 }}>{c.name}</span>
                    {next && (
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, padding: "1px 5px", borderRadius: 10, background: "var(--bg2)", color: "var(--t3)" }}>
                        {new Date(next.dueDate).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SAĞ: MÜVEKKİL DETAYI */}
          <div className="tool-panel" style={{ flex: 1, overflowY: "auto" }}>
            {!detail ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--t3)" }}>
                <i className="fa-solid fa-users" style={{ fontSize: 28, opacity: 0.3, display: "block", marginBottom: 10 }}></i>
                Soldan bir müvekkil seçin, ya da yeni müvekkil ekleyin.
              </div>
            ) : (
              <div style={{ padding: "20px 26px" }}>
                <div className="tool-panel-head">
                  <div className="pop-badge b"><span>Müvekkil Kartı</span></div>
                  <div className="pop-title">{detail.name}</div>
                  <div className="pop-desc">
                    {detail.phone || "—"} {detail.email ? " · " + detail.email : ""}
                  </div>
                  {detail.notes && <div style={{ fontSize: 12.5, color: "var(--t2)", marginTop: 6 }}>{detail.notes}</div>}
                </div>

                {/* DURUŞMA / ÖDEME TARİHLERİ */}
                <div style={{ marginTop: 20 }}>
                  <div className="dash-title" style={{ marginBottom: 8 }}>
                    <i className="fa-solid fa-calendar-days"></i> Duruşma & Ödeme Tarihleri
                  </div>
                  {detail.events.length === 0 && (
                    <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 8 }}>Henüz tarih eklenmedi.</div>
                  )}
                  {detail.events.map((ev) => {
                    const dl = daysLeftLabel(ev.dueDate);
                    return (
                      <div key={ev.id} className="dl-row" style={{ marginBottom: 4 }}>
                        <span className={`dl-tag ${dl.color === "var(--danger)" ? "crit" : dl.color === "var(--warn)" ? "warn" : ""}`}>
                          {ev.type === "durusma" ? "DURUŞMA" : "ÖDEME"}
                        </span>
                        <span className="dl-text">{ev.title} — {new Date(ev.dueDate).toLocaleDateString("tr-TR")}</span>
                        <span className="dl-days" style={{ color: dl.color }}>{dl.text}</span>
                      </div>
                    );
                  })}
                  <form onSubmit={addEvent} style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ width: 120 }}>
                      <option value="durusma">Duruşma</option>
                      <option value="odeme">Ödeme</option>
                    </select>
                    <input type="text" placeholder="Başlık (ör. İstinaf duruşması)" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
                    <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={{ width: 150 }} />
                    <button className="pop-cta-btn p"><span>Ekle</span></button>
                  </form>
                </div>

                {/* FATURALAR */}
                <div style={{ marginTop: 24 }}>
                  <div className="dash-title" style={{ marginBottom: 8 }}>
                    <i className="fa-solid fa-file-invoice-dollar"></i> Faturalar
                  </div>
                  {detail.invoices.length === 0 && (
                    <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 8 }}>Henüz fatura oluşturulmadı.</div>
                  )}
                  {detail.invoices.map((inv) => (
                    <div key={inv.id} className="cr-row" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                      <span>{new Date(inv.createdAt).toLocaleDateString("tr-TR")} {inv.note ? "— " + inv.note : ""}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                        {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(inv.amount)}
                      </span>
                    </div>
                  ))}
                  <form onSubmit={createInvoice} style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <input type="text" placeholder="Tutar (TL)" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} style={{ width: 140 }} />
                    <input type="text" placeholder="Açıklama (opsiyonel)" value={invoiceNote} onChange={(e) => setInvoiceNote(e.target.value)} style={{ flex: 1 }} />
                    <button className="pop-cta-btn g"><i className="fa-solid fa-file-invoice-dollar"></i><span>Fatura Oluştur</span></button>
                  </form>
                </div>

                {/* GÖRÜŞME GEÇMİŞİ */}
                <div style={{ marginTop: 24 }}>
                  <div className="dash-title" style={{ marginBottom: 8 }}>
                    <i className="fa-solid fa-comments"></i> Görüşme Geçmişi
                  </div>
                  {detail.logs.length === 0 && (
                    <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 8 }}>Henüz görüşme kaydı yok.</div>
                  )}
                  {detail.logs.map((log) => (
                    <div key={log.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 2 }}>
                        {new Date(log.createdAt).toLocaleString("tr-TR")}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--t0)" }}>{log.content}</div>
                    </div>
                  ))}
                  <form onSubmit={addLog} style={{ marginTop: 10 }}>
                    <textarea rows={2} placeholder="Ne konuşuldu, ne karar verildi…" value={logText} onChange={(e) => setLogText(e.target.value)} />
                    <button className="pop-cta-btn b" style={{ marginTop: 6 }}><span>Notu Kaydet</span></button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
