"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError((data.error || "Bir hata oluştu.") + (data.debug ? " | " + data.debug : ""));
      return;
    }
    router.push("/login");
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
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.btn} disabled={loading}>
          {loading ? "Oluşturuluyor…" : "Hesap Oluştur"}
        </button>
        <div style={styles.foot}>
          Zaten hesabın var mı? <Link href="/login" style={{ color: "var(--gold)" }}>Giriş yap</Link>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
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
    width: 340,
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
