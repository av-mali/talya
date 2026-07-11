"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// useSearchParams() kullandığımız için Next.js'in derleme sırasında bu
// sayfayı statik olarak önceden oluşturmaya çalışmaması gerekiyor —
// yoksa "prerendering error" ile build başarısız oluyor.
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const loginHref = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [baro, setBaro] = useState("");
  const [sicilNo, setSicilNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone, baro, sicilNo }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Bir hata oluştu.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div className="serif" style={styles.title}>
            Kaydınız <em style={{ color: "var(--gold)" }}>Alındı</em>
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", textAlign: "center", lineHeight: 1.6 }}>
            Hesabınız oluşturuldu ve şu an <strong>onay bekliyor</strong>. Yönetici
            bilgilerinizi onayladıktan sonra giriş yapabileceksiniz.
          </div>
          <Link href={loginHref} style={{ ...styles.btn, textAlign: "center", textDecoration: "none", display: "block" }}>
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div className="serif" style={styles.title}>
          Talya'da <em style={{ color: "var(--gold)" }}>Hesap Aç</em>
        </div>
        <input
          style={styles.input}
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={styles.input}
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="tel"
          placeholder="Telefon Numarası"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          style={styles.input}
          placeholder="Baro (ör. Antalya Barosu)"
          value={baro}
          onChange={(e) => setBaro(e.target.value)}
          required
        />
        <input
          style={styles.input}
          placeholder="Sicil Numarası"
          value={sicilNo}
          onChange={(e) => setSicilNo(e.target.value)}
          required
        />
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.btn} disabled={loading}>
          {loading ? "Oluşturuluyor…" : "Hesap Oluştur"}
        </button>
        <div style={{ fontSize: 11, color: "var(--t3)", textAlign: "center", lineHeight: 1.5 }}>
          Kaydınız, yönetici onayından sonra aktif olur.
        </div>
        <div style={styles.foot}>
          Zaten hesabın var mı? <Link href={loginHref} style={{ color: "var(--gold)" }}>Giriş yap</Link>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    height: "100vh",
    overflowY: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
  },
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: 32,
    width: "min(340px, 90vw)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: { fontSize: 24, marginBottom: 8, textAlign: "center" },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border2)",
    fontSize: 13,
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    background: "var(--gold)",
    color: "#fff",
    fontWeight: 500,
    marginTop: 4,
  },
  error: { color: "var(--danger)", fontSize: 12 },
  foot: { textAlign: "center", fontSize: 12, color: "var(--t2)", marginTop: 6 },
};
