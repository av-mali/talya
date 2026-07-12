"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ minHeight: "100vh", height: "100vh", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <div className="serif" style={{ fontSize: 64, color: "var(--gold)", lineHeight: 1, marginBottom: 12 }}>
            404
          </div>
          <div style={{ fontSize: 16, color: "var(--t1)", marginBottom: 8 }}>
            Bu sayfa bulunamadı.
          </div>
          <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 28 }}>
            Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
          </div>
          <Link
            href="/dashboard"
            style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, background: "var(--gold)", color: "#fff", textDecoration: "none", fontWeight: 500 }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </>
  );
}
