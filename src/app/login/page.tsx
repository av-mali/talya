"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("E-posta veya şifre hatalı.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div style={styles.wrap}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div className="serif" style={styles.title}>
          Talya'ya <em style={{ color: "var(--gold)" }}>Giriş Yap</em>
        </div>
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
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div style={styles.error}>{error}</div>}
        <button style={styles.btn} disabled={loading}>
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
        <div style={styles.foot}>
          Hesabın yok mu? <Link href="/register" style={{ color: "var(--gold)" }}>Kayıt ol</Link>
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
