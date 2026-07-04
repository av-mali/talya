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
  _count: { clients: number; messages: number };
};

type Stats = { userCount: number; clientCount: number; messageCount: number; totalInvoiced: number };

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    const [uRes, sRes] = await Promise.all([fetch("/api/admin/users"), fetch("/api/admin/stats")]);
    if (uRes.status === 403 || sRes.status === 403) {
      setForbidden(true);
      return;
    }
    const uData = await uRes.json();
    const sData = await sRes.json();
    setUsers(uData.users || []);
    setStats(sData);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") load();
  }, [status, router, load]);

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
      <div style={{ display: "flex", flexDirection: "column", width: "100%", minHeight: "100vh", background: "var(--bg)" }}>
        <div className="app-topbar">
          <div className="app-top-left">
            <button className="home-btn" onClick={() => router.push("/dashboard")}>
              <i className="fa-solid fa-house"></i> Ana Sayfa
            </button>
            <div className="app-breadcrumb">
              <span>Yönetici</span>
              <span style={{ opacity: 0.35 }}>›</span>
              <span className="cur">Kullanıcılar</span>
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
          <div className="serif" style={{ fontSize: 26, marginBottom: 18 }}>
            Yönetici <em style={{ color: "var(--gold)" }}>Paneli</em>
          </div>

          {/* İSTATİSTİK KARTLARI */}
          <div style={styles.statGrid}>
            <StatCard icon="fa-users" label="Toplam Kullanıcı" value={stats?.userCount} />
            <StatCard icon="fa-address-book" label="Toplam Müvekkil" value={stats?.clientCount} />
            <StatCard icon="fa-comments" label="Toplam Mesaj (AI)" value={stats?.messageCount} />
            <StatCard
              icon="fa-turkish-lira-sign"
              label="Toplam Faturalanan"
              value={stats ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(stats.totalInvoiced) : undefined}
              isText
            />
          </div>

          {/* KULLANICI TABLOSU */}
          <div className="dash-card" style={{ marginTop: 24 }}>
            <div className="dash-head">
              <div className="dash-title"><i className="fa-solid fa-users"></i> Kayıtlı Kullanıcılar</div>
            </div>

            {!users ? (
              <div style={{ padding: 20, fontSize: 13, color: "var(--t3)" }}>Yükleniyor…</div>
            ) : users.length === 0 ? (
              <div style={{ padding: 20, fontSize: 13, color: "var(--t3)" }}>Henüz kullanıcı yok.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={styles.th}>E-posta</th>
                      <th style={styles.th}>Ad</th>
                      <th style={styles.th}>Kayıt Tarihi</th>
                      <th style={styles.th}>Müvekkil</th>
                      <th style={styles.th}>Mesaj</th>
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
                        <td style={styles.td}>{u._count.clients}</td>
                        <td style={styles.td}>{u._count.messages}</td>
                        <td style={styles.td}>
                          {u.isAdmin ? (
                            <span style={styles.adminBadge}>Yönetici</span>
                          ) : (
                            <span style={{ color: "var(--t3)" }}>Kullanıcı</span>
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
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" },
  forbiddenCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 36, width: 360, textAlign: "center" },
  btn: { padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--gold)", color: "#fff", fontWeight: 500 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--t3)" },
  td: { padding: "10px 12px", color: "var(--t0)" },
  adminBadge: { fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "var(--gold-lo)", color: "var(--gold-hi)", fontWeight: 500 },
  deleteBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border2)", background: "transparent", color: "var(--danger)", cursor: "pointer" },
};
