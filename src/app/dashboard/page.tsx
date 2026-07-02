"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

const MODULES = [
  { name: "Dilekçe Sihirbazı", desc: "HMK uyumlu dava dilekçesi taslağı" },
  { name: "Süre Hesaplayıcı", desc: "Temyiz, istinaf, cevap süreleri" },
  { name: "İhtarname Üretici", desc: "Kira, alacak, fesih ihtarnameleri" },
  { name: "İçtihat Arama", desc: "Yargıtay kararlarında arama" },
  { name: "Sözleşme Analizi", desc: "Riskli maddeleri tespit et" },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/chat")
        .then((r) => r.json())
        .then((d) => {
          if (d.messages) {
            setMessages(d.messages.map((m: any) => ({ role: m.role, content: m.content })));
          }
        });
    }
  }, [status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Bağlantı hatası. Lütfen tekrar deneyin." },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Bağlantı hatası. Lütfen tekrar deneyin." },
      ]);
    }
    setSending(false);
  }

  if (status !== "authenticated") {
    return <div style={{ padding: 40 }}>Yükleniyor…</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div className="serif" style={{ fontSize: 18 }}>
          Talya <em style={{ color: "var(--gold)" }}>AI</em>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "var(--t2)" }}>
            {session?.user?.email}
          </span>
          <button style={styles.logoutBtn} onClick={() => signOut({ callbackUrl: "/login" })}>
            Çıkış Yap
          </button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.sidebar}>
          <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, textTransform: "uppercase" }}>
            Modüller
          </div>
          {MODULES.map((m) => (
            <div key={m.name} style={styles.moduleCard}>
              <div className="serif" style={{ fontSize: 14 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: "var(--t2)" }}>{m.desc}</div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 12, lineHeight: 1.6 }}>
            Bu modüller görsel taslak olarak eklendi. Her biri, sohbet API'sine
            özel bir talimat (prompt) göndererek aynı backend uç noktası
            üzerinden çalışacak şekilde genişletilebilir.
          </div>
        </div>

        <div style={styles.chatPane}>
          <div style={styles.chatMsgs}>
            {messages.length === 0 && (
              <div style={{ color: "var(--t2)", fontSize: 13, textAlign: "center", marginTop: 40 }}>
                Talya AI hazır. Sorunuzu yazın.
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.bubble,
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "var(--gold-lo)" : "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div style={{ ...styles.bubble, background: "var(--card)", border: "1px solid var(--border)" }}>
                Yazıyor…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={styles.inputRow}>
            <textarea
              style={styles.textarea}
              rows={1}
              placeholder="Sorunuzu yazın…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button style={styles.sendBtn} onClick={() => sendMessage()} disabled={sending}>
              Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { height: "100vh", display: "flex", flexDirection: "column" },
  topbar: {
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    borderBottom: "1px solid var(--border)",
    background: "var(--card)",
  },
  logoutBtn: {
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid var(--border2)",
    background: "transparent",
    fontSize: 12,
  },
  body: { flex: 1, display: "flex", overflow: "hidden" },
  sidebar: {
    width: 260,
    borderRight: "1px solid var(--border)",
    padding: 16,
    overflowY: "auto",
    background: "var(--bg2)",
  },
  moduleCard: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  chatPane: { flex: 1, display: "flex", flexDirection: "column" },
  chatMsgs: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    whiteSpace: "pre-wrap",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 16,
    borderTop: "1px solid var(--border)",
  },
  textarea: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border2)",
    resize: "none",
    fontSize: 13,
  },
  sendBtn: {
    padding: "0 20px",
    borderRadius: 8,
    border: "none",
    background: "var(--gold)",
    color: "#fff",
    fontWeight: 500,
  },
};
