"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: string;
  _count: { messages: number };
};

type PendingUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  baro: string | null;
  sicilNo: string | null;
  createdAt: string;
};

type Stats = { userCount: number; messageCount: number };
type Constants = { kidemTavani: number; faizOrani: number; kiraTufeOrani: number };

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [constants, setConstants] = useState<Constants | null>(null);
  const [savingConstants, setSavingConstants] = useState(false);

  const load = useCallback(async () => {
    const [uRes, sRes, cRes, pRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/stats"),
      fetch("/api/constants"),
      fetch("/api/admin/pending-users"),
    ]);
    if (uRes.status === 403 || sRes.status === 403) {
      setForbidden(true);
      return;
    }
    const uData = await uRes.json();
    const sData = await sRes.json();
    setUsers(uData.users || []);
    setStats(sData);
    if (cRes.ok) {
      const cData = await cRes.json();
      setConstants(cData.constants);
    }
    if (pRes.ok) {
      const pData = await pRes.json();
      setPendingUsers(pData.users || []);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") load();
  }, [status, router, load]);

  async function handleApprove(id: string, email: string) {
    if (!confirm(`${email} hesabını onaylamak istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/users/${id}/approve`, { method: "POST" });
    if (res.ok) load();
    else alert("Onaylanamadı.");
  }

  async function handleSaveConstants(e: React.FormEvent) {
    e.preventDefault();
    if (!constants) return;
    setSavingConstants(true);
    const res = await fetch("/api/admin/constants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(constants),
    });
    setSavingConstants(false);
    if (res.ok) {
      const data = await res.json();
      setConstants(data.constants);
      alert("Sabitler güncellendi.");
    } else {
      alert("Güncellenemedi.");
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`${email} hesabını ve tüm verilerini (müvekkiller, mesajlar) kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else {
      const data = await res.json();
      alert(data.error || "Silinemedi.");
    }
  }

  if (status !== "authenticated") {
    return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Yükleniyor…</div>;
  }

  if (forbidden) {
    return (
      <>
        <link rel="stylesheet" href="/talya-original.css" />
        <div style={styles.wrap}>
          <div style={styles.forbiddenCard}>
            <i className="fa-solid fa-lock" style={{ fontSize: 26, color: "var(--danger)", marginBottom: 12 }}></i>
            <div className="serif" style={{ fontSize: 20, marginBottom: 6 }}>Bu sayfaya erişim yetkiniz yok</div>
            <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 18 }}>
              Yönetici paneli yalnızca admin yetkisi olan hesaplarla görüntülenebilir.
            </div>
            <button style={styles.btn} onClick={() => router.push("/dashboard")}>Ana Sayfaya Dön</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100vh", overflowY: "auto", background: "var(--bg)" }}>
        <div className="app-topbar">
          <div className="app-top-left">
            <button className="home-btn" onClick={() => router.push("/dashboard")}>
              <i className="fa-solid fa-house"></i> Ana Sayfa
            </button>
            <div className="app-breadcrumb">
              <span>Yönetici</span>
              <span style={{ opacity: 0.35 }}>›</span>
              <span className="cur">Müşteriler</span>
            </div>
          </div>
          <div className="app-top-right">
            <span style={{ fontSize: 12, color: "var(--t2)" }}>{session?.user?.email}</span>
            <button className="nav-pill gold" style={{ cursor: "pointer" }} onClick={() => signOut({ callbackUrl: "/login" })}>
              Çıkış Yap
            </button>
          </div>
        </div>

        <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>
            Müşteri <em style={{ color: "var(--gold)" }}>Yönetimi</em>
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 18 }}>
            Talya'ya kayıt olan tüm kullanıcılar — sizin gerçek müşterileriniz.
          </div>

          {/* İSTATİSTİK KARTLARI — sadece Talya'nın kendi ticari verisi */}
          <div style={styles.statGrid}>
            <StatCard icon="fa-users" label="Toplam Müşteri" value={stats?.userCount} />
            <StatCard icon="fa-comments" label="Toplam AI Kullanımı (Mesaj)" value={stats?.messageCount} />
          </div>

          {/* HUKUKİ SABİTLER */}
          <div className="dash-card" style={{ marginTop: 24 }}>
            <div className="dash-head">
              <div className="dash-title"><i className="fa-solid fa-scale-balanced"></i> Hukuki Sabitler</div>
            </div>
            <div style={{ padding: "4px 4px 16px", fontSize: 12.5, color: "var(--t2)" }}>
              Bu rakamlar sık değişir (kıdem tavanı ve kira TÜFE oranı 6 ayda/ayda bir güncellenir). Burada değiştirdiğinde tüm hesaplama araçları anında yeni değeri kullanır — kod değişikliği gerekmez.
            </div>
            {!constants ? (
              <div style={{ padding: 12, fontSize: 13, color: "var(--t3)" }}>Yükleniyor…</div>
            ) : (
              <form onSubmit={handleSaveConstants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <div>
                  <label style={styles.constLabel}>Kıdem Tazminatı Tavanı (TL)</label>
                  <input
                    type="number" step="0.01"
                    value={constants.kidemTavani}
                    onChange={(e) => setConstants({ ...constants, kidemTavani: parseFloat(e.target.value) })}
                    style={styles.constInput}
                  />
                </div>
                <div>
                  <label style={styles.constLabel}>Yasal / Ticari Faiz Oranı (%)</label>
                  <input
                    type="number" step="0.01"
                    value={constants.faizOrani}
                    onChange={(e) => setConstants({ ...constants, faizOrani: parseFloat(e.target.value) })}
                    style={styles.constInput}
                  />
                </div>
                <div>
                  <label style={styles.constLabel}>Kira Artışı TÜFE Oranı (%)</label>
                  <input
                    type="number" step="0.01"
                    value={constants.kiraTufeOrani}
                    onChange={(e) => setConstants({ ...constants, kiraTufeOrani: parseFloat(e.target.value) })}
                    style={styles.constInput}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button type="submit" disabled={savingConstants} style={styles.btn}>
                    {savingConstants ? "Kaydediliyor…" : "Kaydet"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* BEKLEYEN ONAYLAR */}
          {pendingUsers && pendingUsers.length > 0 && (
            <div className="dash-card" style={{ marginTop: 24, border: "1px solid var(--warn)" }}>
              <div className="dash-head">
                <div className="dash-title"><i className="fa-solid fa-user-clock" style={{ color: "var(--warn)" }}></i> Bekleyen Onaylar ({pendingUsers.length})</div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={styles.th}>E-posta</th>
                      <th style={styles.th}>Ad</th>
                      <th style={styles.th}>Telefon</th>
                      <th style={styles.th}>Baro</th>
                      <th style={styles.th}>Sicil No</th>
                      <th style={styles.th}>Kayıt Tarihi</th>
                      <th style={styles.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>{u.name || "—"}</td>
                        <td style={styles.td}>{u.phone || "—"}</td>
                        <td style={styles.td}>{u.baro || "—"}</td>
                        <td style={styles.td}>{u.sicilNo || "—"}</td>
                        <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
                        <td style={styles.td}>
                          <button style={styles.approveBtn} onClick={() => handleApprove(u.id, u.email)}>
                            <i className="fa-solid fa-check"></i> Onayla
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MÜŞTERİ TABLOSU */}
          <div className="dash-card" style={{ marginTop: 24 }}>
            <div className="dash-head">
              <div className="dash-title"><i className="fa-solid fa-users"></i> Kayıtlı Müşteriler</div>
            </div>

            {!users ? (
              <div style={{ padding: 20, fontSize: 13, color: "var(--t3)" }}>Yükleniyor…</div>
            ) : users.length === 0 ? (
              <div style={{ padding: 20, fontSize: 13, color: "var(--t3)" }}>Henüz müşteri yok.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={styles.th}>E-posta</th>
                      <th style={styles.th}>Ad</th>
                      <th style={styles.th}>Kayıt Tarihi</th>
                      <th style={styles.th}>AI Mesaj</th>
                      <th style={styles.th}>Plan</th>
                      <th style={styles.th}>Rol</th>
                      <th style={styles.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>{u.name || "—"}</td>
                        <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
                        <td style={styles.td}>{u._count.messages}</td>
                        <td style={styles.td}><span style={{ color: "var(--t3)" }}>— (yakında)</span></td>
                        <td style={styles.td}>
                          {u.isAdmin ? (
                            <span style={styles.adminBadge}>Yönetici</span>
                          ) : (
                            <span style={{ color: "var(--t3)" }}>Müşteri</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {!u.isAdmin && (
                            <button style={styles.deleteBtn} onClick={() => handleDelete(u.id, u.email)}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, isText }: { icon: string; label: string; value?: number | string; isText?: boolean }) {
  return (
    <div className="dash-card" style={{ padding: "18px 20px" }}>
      <div style={{ fontSize: 11, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
        <i className={`fa-solid ${icon}`} style={{ marginRight: 6, color: "var(--gold)" }}></i>{label}
      </div>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: isText ? 22 : 28 }}>
        {value === undefined ? "…" : value}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", height: "100vh", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" },
  forbiddenCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 36, width: 360, textAlign: "center" },
  btn: { padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--gold)", color: "#fff", fontWeight: 500, cursor: "pointer" },
  constLabel: { display: "block", fontSize: 11, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 },
  constInput: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border2)", fontSize: 13, fontFamily: "'JetBrains Mono',monospace", background: "var(--bg2)" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--t3)" },
  td: { padding: "10px 12px", color: "var(--t0)" },
  adminBadge: { fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "var(--gold-lo)", color: "var(--gold-hi)", fontWeight: 500 },
  deleteBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border2)", background: "transparent", color: "var(--danger)", cursor: "pointer" },
  approveBtn: { padding: "6px 12px", borderRadius: 8, border: "none", background: "var(--success)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 },
};
