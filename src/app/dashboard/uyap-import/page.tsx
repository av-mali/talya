"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type RawItem = {
  clientName?: string;
  caseTitle?: string;
  type?: string;
  title?: string;
  dueDate?: string | null;
  confidence?: string;
};

type Row = RawItem & {
  include: boolean;
  clientChoice: string; // "new" ya da mevcut müvekkil id'si
  newClientName: string;
};

type ClientOpt = { id: string; name: string };

const TYPE_OPTIONS = [
  { value: "durusma", label: "Duruşma" },
  { value: "odeme", label: "Ödeme" },
  { value: "gorusme", label: "Görüşme" },
  { value: "tebligat", label: "Tebligat" },
  { value: "diger", label: "Diğer" },
];

function ImportContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batch");

  const [rows, setRows] = useState<Row[] | null>(null);
  const [clients, setClients] = useState<ClientOpt[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [skipped, setSkipped] = useState<number>(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !batchId) return;
    (async () => {
      const [batchRes, clientsRes] = await Promise.all([
        fetch(`/api/import-batches/${batchId}`),
        fetch("/api/clients"),
      ]);
      if (!batchRes.ok) {
        setError("Kayıt bulunamadı ya da süresi geçmiş.");
        return;
      }
      const batchData = await batchRes.json();
      const clientsData = await clientsRes.json();
      const clientList: ClientOpt[] = (clientsData.clients || []).map((c: any) => ({ id: c.id, name: c.name }));
      setClients(clientList);

      const items: RawItem[] = batchData.batch.items || [];
      const initialRows: Row[] = items.map((it) => {
        const match = it.clientName
          ? clientList.find((c) => c.name.toLowerCase() === it.clientName!.toLowerCase())
          : null;
        return {
          ...it,
          include: true,
          clientChoice: match ? match.id : "new",
          newClientName: it.clientName || "",
        };
      });
      setRows(initialRows);
    })();
  }, [status, batchId]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) => {
      if (!prev) return prev;
      const copy = [...prev];
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
  }

  async function handleConfirm() {
    if (!rows || !batchId) return;
    setSaving(true);
    setError("");
    const payload = rows.map((r) => ({
      include: r.include,
      clientId: r.clientChoice === "new" ? null : r.clientChoice,
      newClientName: r.clientChoice === "new" ? r.newClientName : null,
      caseTitle: r.caseTitle,
      type: r.type,
      title: r.title,
      dueDate: r.dueDate,
    }));
    const res = await fetch(`/api/import-batches/${batchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: payload }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setDone(data.created);
      setSkipped(data.skippedDuplicate || 0);
    } else {
      setError("Kaydedilirken bir hata oluştu.");
    }
  }

  async function handleDismiss() {
    if (!batchId) return;
    await fetch(`/api/import-batches/${batchId}`, { method: "DELETE" });
    router.push("/dashboard/uyap");
  }

  if (status !== "authenticated") {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Yükleniyor…</div>;
  }

  if (!batchId) {
    return (
      <>
        <link rel="stylesheet" href="/talya-original.css" />
        <div style={styles.wrap}><div style={styles.card}>Geçersiz bağlantı — eksik kayıt numarası.</div></div>
      </>
    );
  }

  if (done !== null) {
    return (
      <>
        <link rel="stylesheet" href="/talya-original.css" />
        <div style={styles.wrap}>
          <div style={styles.card}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: 30, color: "var(--success)", marginBottom: 10 }}></i>
            <div className="serif" style={{ fontSize: 20, marginBottom: 8 }}>Aktarım tamamlandı</div>
            <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 18 }}>
              {done} kayıt başarıyla eklendi.
              {skipped > 0 && <><br />{skipped} kayıt zaten mevcuttu, mükerrer eklenmedi.</>}
            </div>
            <button style={styles.btn} onClick={() => router.push("/dashboard/buro")}>Büro Yönetimi'ne Git</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ minHeight: "100vh", height: "100vh", overflowY: "auto", background: "var(--bg)" }}>
        <div className="app-topbar">
          <div className="app-top-left">
            <button className="home-btn" onClick={() => router.push("/dashboard")}>
              <i className="fa-solid fa-house"></i> Ana Sayfa
            </button>
            <div className="app-breadcrumb">
              <span>UYAP Entegrasyonu</span><span style={{ opacity: .35 }}>›</span><span className="cur">Aktarım Onayı</span>
            </div>
          </div>
          <div className="app-top-right">
            <button className="nav-pill gold" style={{ cursor: "pointer" }} onClick={() => signOut({ callbackUrl: "/login" })}>Çıkış Yap</button>
          </div>
        </div>

        <div style={{ padding: "26px 28px", maxWidth: 1000, margin: "0 auto" }}>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>UYAP'tan <em style={{ color: "var(--gold)" }}>Aktarım Onayı</em></div>
          <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 18 }}>
            Eklenti sayfayı okudu, Claude bu satırları çıkardı. Hiçbir şey kaydedilmedi — aşağıda gözden geçir, gerekirse düzelt, sonra onayla.
          </div>

          {error && <div style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</div>}

          {!rows ? (
            <div style={{ color: "var(--t3)" }}>Yükleniyor…</div>
          ) : rows.length === 0 ? (
            <div style={{ color: "var(--t3)" }}>Bu sayfada ayrıştırılabilecek bir kayıt bulunamadı.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((r, i) => (
                <div key={i} className="dash-card" style={{ padding: 14, opacity: r.include ? 1 : 0.45 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <input type="checkbox" checked={r.include} onChange={(e) => updateRow(i, { include: e.target.checked })} style={{ marginTop: 10 }} />

                    <div style={{ flex: "1 1 200px", minWidth: 180 }}>
                      <div style={styles.lbl}>Müvekkil {r.confidence === "low" && <span style={{ color: "var(--warn)" }}> (emin değilim)</span>}</div>
                      <select value={r.clientChoice} onChange={(e) => updateRow(i, { clientChoice: e.target.value })}>
                        <option value="new">+ Yeni Müvekkil</option>
                        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      {r.clientChoice === "new" && (
                        <input type="text" value={r.newClientName} onChange={(e) => updateRow(i, { newClientName: e.target.value })} placeholder="Müvekkil adı…" style={{ marginTop: 6 }} />
                      )}
                    </div>

                    <div style={{ flex: "1 1 160px", minWidth: 140 }}>
                      <div style={styles.lbl}>Dosya</div>
                      <input type="text" value={r.caseTitle || ""} onChange={(e) => updateRow(i, { caseTitle: e.target.value })} placeholder="Dosya adı…" />
                    </div>

                    <div style={{ flex: "0 1 130px", minWidth: 120 }}>
                      <div style={styles.lbl}>Tür</div>
                      <select value={r.type || "diger"} onChange={(e) => updateRow(i, { type: e.target.value })}>
                        {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>

                    <div style={{ flex: "1 1 160px", minWidth: 140 }}>
                      <div style={styles.lbl}>Başlık</div>
                      <input type="text" value={r.title || ""} onChange={(e) => updateRow(i, { title: e.target.value })} placeholder="Başlık…" />
                    </div>

                    <div style={{ flex: "0 1 150px", minWidth: 140 }}>
                      <div style={styles.lbl}>Tarih</div>
                      <input type="date" value={r.dueDate || ""} onChange={(e) => updateRow(i, { dueDate: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button style={styles.btn} disabled={saving} onClick={handleConfirm}>
                  {saving ? "Kaydediliyor…" : "Onayla ve Kaydet"}
                </button>
                <button style={styles.btnGhost} onClick={handleDismiss}>Reddet</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function UyapImportPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, fontFamily: "sans-serif" }}>Yükleniyor…</div>}>
      <ImportContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", height: "100vh", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" },
  card: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 32, width: 360, textAlign: "center" },
  lbl: { fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 },
  btn: { padding: "10px 18px", borderRadius: 8, border: "none", background: "var(--gold)", color: "#fff", fontWeight: 500, cursor: "pointer" },
  btnGhost: { padding: "10px 18px", borderRadius: 8, border: "1px solid var(--border2)", background: "transparent", color: "var(--t1)", cursor: "pointer" },
};
