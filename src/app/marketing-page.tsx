"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const FEATURES = [
  { icon: "fa-file-lines", title: "Belge & Analiz", desc: "Dosya analizi, dilekçe sihirbazı, mevzuat arama — gerçek zamanlı AI desteğiyle." },
  { icon: "fa-handshake", title: "Arabuluculuk", desc: "Davet mektubu, ilk oturum ve son tutanağı, gerçek UYAP formatında otomatik oluşturun." },
  { icon: "fa-briefcase", title: "Büro Yönetimi", desc: "Müvekkil, dosya, gelir-gider, görev panosu — hepsi tek yerde." },
  { icon: "fa-user-group", title: "Müvekkil Paneli", desc: "Müvekkilleriniz kendi dosya durumunu görsün, size doğrudan mesaj göndersin." },
  { icon: "fa-puzzle-piece", title: "UYAP Entegrasyonu", desc: "Duruşma ve tebligat tarihlerini otomatik senkronize edin." },
  { icon: "fa-calculator", title: "Hesaplama Araçları", desc: "Kıdem, ihbar, faiz, kira artışı — güncel oranlarla anında hesap." },
  { icon: "fa-people-group", title: "Ekip Yönetimi", desc: "Büronuzu büyütün, üyelere özel yetkiler tanımlayın." },
  { icon: "fa-paper-plane", title: "Talya Asistan", desc: "Akıllı asistanınızla her sabah günlük özetinizi alın." },
  { icon: "fa-shield-halved", title: "Gizlilik Odaklı", desc: "Yüklediğiniz hiçbir belge saklanmaz — anlık işlenir, silinir." },
];

const STEPS = [
  { num: "1", title: "Büronuzu Kurun", desc: "30 saniyede hesap açın, büronuzu tanımlayın." },
  { num: "2", title: "Ekibinizi Davet Edin", desc: "Meslektaşlarınızı davet linkiyle ekleyin, yetkilerini belirleyin." },
  { num: "3", title: "AI ile Çalışmaya Başlayın", desc: "Dilekçe yazın, dosya analiz edin, müvekkillerinizi yönetin." },
];

const PLANS = [
  {
    name: "Talya Solo",
    icon: "fa-user",
    price: "999",
    period: "TL/ay",
    yearly: "9.990 TL/yıl (%17 indirim)",
    desc: "Tek başına çalışan avukatlar için.",
    features: ["1 kullanıcı", "Tüm Belge & Analiz araçları", "Büro Yönetimi (Müvekkil, Dosya, Gelir-Gider)", "UYAP Takvim Senkronizasyonu", "Hesaplama Araçları"],
    highlight: false,
  },
  {
    name: "Talya Ekip",
    icon: "fa-people-group",
    price: "3.750",
    period: "TL/ay",
    yearly: "37.350 TL/yıl (%17 indirim)",
    desc: "5 kullanıcıya kadar küçük/orta ölçekli bürolar için.",
    features: ["5 kullanıcıya kadar", "Solo'daki her şey", "Ekip Yönetimi & yetkilendirme", "Duruşma Hazırlık (çoklu belge analizi)", "Paylaşımlı büro verisi"],
    highlight: true,
  },
  {
    name: "Talya Kurumsal",
    icon: "fa-building",
    price: "Bize Ulaşın",
    period: "",
    yearly: "6.999 TL/ay'dan başlayan, kullanıcı sayısına göre özel fiyatlandırma",
    desc: "Büyük bürolar ve özel ihtiyaçlar için.",
    features: ["Kullanıcı sayınıza göre özel teklif", "Ekip'teki her şey", "Öncelikli destek", "Özel entegrasyon görüşmesi"],
    highlight: false,
  },
];

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".reveal");
    if (!els || !els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .feature-hover { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .feature-hover:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,.07); border-color: var(--gold-rule); }
        .plan-hover { transition: transform .25s ease, box-shadow .25s ease; }
        .plan-hover:hover { transform: translateY(-8px); }
        .glow-blob { position: absolute; border-radius: 50%; background: radial-gradient(circle, var(--gold-lo) 0%, transparent 70%); filter: blur(10px); pointer-events: none; }
        .glow-blob.a { width: 480px; height: 480px; animation: glowFloat 8s ease-in-out infinite; }
        .glow-blob.b { width: 320px; height: 320px; animation: glowFloat 11s ease-in-out infinite reverse; opacity: .7; }
        .glow-blob.c { width: 220px; height: 220px; animation: glowFloat 6.5s ease-in-out infinite; opacity: .55; }
        @keyframes glowFloat { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -20px) scale(1.08); } }
        .particle { display: none; }
        .cta-pulse:hover { box-shadow: 0 0 0 6px var(--gold-lo); }
      `}</style>
      <div ref={rootRef} style={{ minHeight: "100vh", height: "100vh", overflowY: "auto", overflowX: "hidden", background: "var(--bg)", boxSizing: "border-box" }}>
        {/* ÜST MENÜ */}
        <div className="home-nav">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="home-logo-mark">T</div>
            <div>
              <div className="home-logo-name">Talya Hukuk</div>
              <span className="home-logo-tag">AI Legal Suite</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/muvekkil" className="nav-pill always-show" style={{ textDecoration: "none" }}>
              Müvekkil Girişi
            </Link>
            <Link href="/login" className="nav-pill gold" style={{ textDecoration: "none" }}>
              Giriş Yap
            </Link>
          </div>
        </div>

        {/* HERO — soyut adalet terazisi çizimi + hareketli parıltı/parçacıklar */}
        <div style={{ position: "relative", padding: "70px 20px 20px", textAlign: "center" }}>
          <div className="glow-blob a" style={{ top: -100, left: "50%", marginLeft: -240, zIndex: 0 }}></div>
          <div className="glow-blob b" style={{ top: 40, left: "20%", zIndex: 0 }}></div>
          <div className="glow-blob c" style={{ top: 120, right: "15%", zIndex: 0 }}></div>



          <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>
            <div className="hero-badge"><i className="fa-solid fa-circle" style={{ fontSize: 6, animation: "breathe 2s infinite" }}></i> Türkiye'nin Yeni Nesil Hukuk AI Suite'i</div>
            <div className="hero-title">
              Hukuk Bürolarının <em>Tüm İşini</em><br />Tek Platformda Toplayın
            </div>
            <div className="hero-sub" style={{ maxWidth: 520 }}>
              Dilekçe yazımından müvekkil takibine, mevzuat aramasından gelir-gidere —
              Talya, gerçek AI desteğiyle avukatların günlük işini hızlandırır.
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/register" className="nav-pill gold cta-pulse" style={{ textDecoration: "none", padding: "10px 22px", fontSize: 13 }}>
                7 Gün Ücretsiz Dene
              </Link>
              <a href="#fiyatlar" className="nav-pill" style={{ textDecoration: "none", padding: "10px 22px", fontSize: 13 }}>
                Fiyatları Gör
              </a>
            </div>

            <div className="hero-stats">
              <div className="hstat">
                <div className="hstat-num"><em>6</em> Modül</div>
                <div className="hstat-lbl">Tek Platformda</div>
              </div>
              <div className="hstat">
                <div className="hstat-num"><em>7</em> Gün</div>
                <div className="hstat-lbl">Ücretsiz Deneme</div>
              </div>
              <div className="hstat">
                <div className="hstat-num"><em>0</em> Saklama</div>
                <div className="hstat-lbl">Belge Gizliliği</div>
              </div>
            </div>
          </div>
        </div>

        {/* ÖZELLİKLER */}
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="reveal feature-hover"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 22,
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 11, background: "linear-gradient(135deg, var(--gold-lo), var(--gold-mid))", border: "1px solid var(--gold-rule)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <i className={`fa-solid ${f.icon}`} style={{ color: "var(--gold)", fontSize: 16 }}></i>
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--t0)", marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* NASIL ÇALIŞIR */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 20px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="hero-title" style={{ fontSize: 26 }}>
              3 Adımda <em>Başlayın</em>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {STEPS.map((s, i) => (
              <div key={s.num} className="reveal" style={{ flex: "1 1 220px", maxWidth: 260, textAlign: "center", transitionDelay: `${i * 100}ms` }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    color: "#fff",
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    boxShadow: "0 8px 24px rgba(184,146,42,.28)",
                  }}
                >
                  {s.num}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t0)", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FİYATLANDIRMA */}
        <div id="fiyatlar" style={{ maxWidth: 1000, margin: "0 auto", padding: "70px 20px 30px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="hero-title" style={{ fontSize: 26 }}>
              Büronuza Uygun <em>Planı</em> Seçin
            </div>
            <div className="hero-sub">Tüm planlarda 7 günlük ücretsiz deneme — kart bilgisi gerekmez.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 20, alignItems: "stretch" }}>
            {PLANS.map((p, i) => (
              <div
                key={p.name}
                className="reveal plan-hover"
                style={{
                  background: p.highlight ? "linear-gradient(160deg, var(--card), var(--gold-lo))" : "var(--card)",
                  border: p.highlight ? "2px solid var(--gold)" : "1px solid var(--border)",
                  borderRadius: 18,
                  padding: 30,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: p.highlight ? "0 20px 50px rgba(184,146,42,.16)" : "0 4px 16px rgba(0,0,0,.03)",
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                {p.highlight && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "var(--gold)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 14px", borderRadius: 20, letterSpacing: ".04em", textTransform: "uppercase", boxShadow: "0 6px 16px rgba(184,146,42,.35)" }}>
                    En Popüler
                  </div>
                )}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--gold-lo)", border: "1px solid var(--gold-rule)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <i className={`fa-solid ${p.icon}`} style={{ color: "var(--gold)", fontSize: 16 }}></i>
                </div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21, color: "var(--t0)", marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--t3)", marginBottom: 20, minHeight: 32 }}>{p.desc}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: p.price === "Bize Ulaşın" ? 24 : 36, color: "var(--gold)" }}>{p.price}</span>
                  {p.period && <span style={{ fontSize: 13, color: "var(--t3)" }}> {p.period}</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 22 }}>{p.yearly}</div>
                <div style={{ flex: 1, marginBottom: 24 }}>
                  {p.features.map((feat) => (
                    <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "var(--t1)", marginBottom: 11 }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--gold-lo)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <i className="fa-solid fa-check" style={{ color: "var(--gold)", fontSize: 8 }}></i>
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/register"
                  style={{
                    textAlign: "center",
                    padding: "11px 16px",
                    borderRadius: 9,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    background: p.highlight ? "var(--gold)" : "transparent",
                    color: p.highlight ? "#fff" : "var(--gold)",
                    border: p.highlight ? "none" : "1px solid var(--gold-rule)",
                    boxShadow: p.highlight ? "0 8px 20px rgba(184,146,42,.3)" : "none",
                  }}
                >
                  {p.price === "Bize Ulaşın" ? "İletişime Geç" : "Ücretsiz Dene"}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ALT BİLGİ */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "28px 20px 60px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
            <div className="home-logo-mark" style={{ width: 24, height: 24, fontSize: 12 }}>T</div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 14, color: "var(--t2)" }}>Talya Hukuk</span>
          </div>
          <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/gizlilik" style={{ fontSize: 12, color: "var(--t3)", textDecoration: "none" }}>
              Gizlilik Taahhüdü
            </Link>
            <Link href="/aydinlatma-metni" style={{ fontSize: 12, color: "var(--t3)", textDecoration: "none" }}>
              KVKK Aydınlatma Metni
            </Link>
            <Link href="/mesafeli-satis" style={{ fontSize: 12, color: "var(--t3)", textDecoration: "none" }}>
              Mesafeli Satış Sözleşmesi
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
