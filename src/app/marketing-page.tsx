import Link from "next/link";

const FEATURES = [
  { icon: "fa-file-lines", title: "Belge & Analiz", desc: "Dosya analizi, dilekçe sihirbazı, mevzuat arama — gerçek zamanlı AI desteğiyle." },
  { icon: "fa-briefcase", title: "Büro Yönetimi", desc: "Müvekkil, dosya, gelir-gider, görev panosu — hepsi tek yerde." },
  { icon: "fa-puzzle-piece", title: "UYAP Entegrasyonu", desc: "Duruşma ve tebligat tarihlerini otomatik senkronize edin." },
  { icon: "fa-calculator", title: "Hesaplama Araçları", desc: "Kıdem, ihbar, faiz, kira artışı — güncel oranlarla anında hesap." },
  { icon: "fa-people-group", title: "Ekip Yönetimi", desc: "Büronuzu büyütün, üyelere özel yetkiler tanımlayın." },
  { icon: "fa-shield-halved", title: "Gizlilik Odaklı", desc: "Yüklediğiniz hiçbir belge saklanmaz — anlık işlenir, silinir." },
];

const PLANS = [
  {
    name: "Talya Solo",
    price: "999",
    period: "TL/ay",
    yearly: "9.990 TL/yıl (%17 indirim)",
    desc: "Tek başına çalışan avukatlar için.",
    features: ["1 kullanıcı", "Tüm Belge & Analiz araçları", "Büro Yönetimi (Müvekkil, Dosya, Gelir-Gider)", "UYAP Takvim Senkronizasyonu", "Hesaplama Araçları"],
    highlight: false,
  },
  {
    name: "Talya Ekip",
    price: "3.750",
    period: "TL/ay",
    yearly: "37.350 TL/yıl (%17 indirim)",
    desc: "5 kullanıcıya kadar küçük/orta ölçekli bürolar için.",
    features: ["5 kullanıcıya kadar", "Solo'daki her şey", "Ekip Yönetimi & yetkilendirme", "Duruşma Hazırlık (çoklu belge analizi)", "Paylaşımlı büro verisi"],
    highlight: true,
  },
  {
    name: "Talya Kurumsal",
    price: "Bize Ulaşın",
    period: "",
    yearly: "6.999 TL/ay'dan başlayan, kullanıcı sayısına göre özel fiyatlandırma",
    desc: "Büyük bürolar ve özel ihtiyaçlar için.",
    features: ["Sınırsız kullanıcı sayısı", "Ekip'teki her şey", "Öncelikli destek", "Özel entegrasyon görüşmesi"],
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {/* ÜST MENÜ */}
        <div className="home-nav">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="home-logo-mark">T</div>
            <div>
              <div className="home-logo-name">Talya Hukuk</div>
              <span className="home-logo-tag">AI Legal Suite</span>
            </div>
          </div>
          <Link href="/login" className="nav-pill gold" style={{ textDecoration: "none" }}>
            Giriş Yap
          </Link>
        </div>

        {/* HERO */}
        <div style={{ textAlign: "center", padding: "70px 20px 50px", maxWidth: 720, margin: "0 auto" }}>
          <div className="hero-badge"><i className="fa-solid fa-sparkles"></i> Türkiye'nin Yeni Nesil Hukuk AI Suite'i</div>
          <div className="hero-title">
            Hukuk Bürolarının <em>Tüm İşini</em><br />Tek Platformda Toplayın
          </div>
          <div className="hero-sub" style={{ maxWidth: 520 }}>
            Dilekçe yazımından müvekkil takibine, mevzuat aramasından gelir-gidere —
            Talya, gerçek AI desteğiyle avukatların günlük işini hızlandırır.
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/register" className="nav-pill gold" style={{ textDecoration: "none", padding: "10px 22px", fontSize: 13 }}>
              7 Gün Ücretsiz Dene
            </Link>
            <a href="#fiyatlar" className="nav-pill" style={{ textDecoration: "none", padding: "10px 22px", fontSize: 13 }}>
              Fiyatları Gör
            </a>
          </div>
        </div>

        {/* ÖZELLİKLER */}
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 20px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 22 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--gold-lo)", border: "1px solid var(--gold-rule)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <i className={`fa-solid ${f.icon}`} style={{ color: "var(--gold)", fontSize: 15 }}></i>
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--t0)", marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FİYATLANDIRMA */}
        <div id="fiyatlar" style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 20px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="hero-title" style={{ fontSize: 26 }}>
              Büronuza Uygun <em>Planı</em> Seçin
            </div>
            <div className="hero-sub">Tüm planlarda 7 günlük ücretsiz deneme — kart bilgisi gerekmez.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, alignItems: "stretch" }}>
            {PLANS.map((p) => (
              <div
                key={p.name}
                style={{
                  background: "var(--card)",
                  border: p.highlight ? "2px solid var(--gold)" : "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 28,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {p.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--gold)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 12px", borderRadius: 20, letterSpacing: ".04em", textTransform: "uppercase" }}>
                    En Popüler
                  </div>
                )}
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "var(--t0)", marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--t3)", marginBottom: 18, minHeight: 32 }}>{p.desc}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: p.price === "Bize Ulaşın" ? 24 : 34, color: "var(--gold)" }}>{p.price}</span>
                  {p.period && <span style={{ fontSize: 13, color: "var(--t3)" }}> {p.period}</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 20 }}>{p.yearly}</div>
                <div style={{ flex: 1, marginBottom: 22 }}>
                  {p.features.map((feat) => (
                    <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "var(--t1)", marginBottom: 10 }}>
                      <i className="fa-solid fa-check" style={{ color: "var(--gold)", fontSize: 10, marginTop: 3 }}></i>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={p.price === "Bize Ulaşın" ? "/register" : "/register"}
                  style={{
                    textAlign: "center",
                    padding: "10px 16px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    background: p.highlight ? "var(--gold)" : "transparent",
                    color: p.highlight ? "#fff" : "var(--gold)",
                    border: p.highlight ? "none" : "1px solid var(--gold-rule)",
                  }}
                >
                  {p.price === "Bize Ulaşın" ? "İletişime Geç" : "Ücretsiz Dene"}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ALT BİLGİ */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "24px 20px", textAlign: "center" }}>
          <Link href="/gizlilik" style={{ fontSize: 12, color: "var(--t3)", textDecoration: "none" }}>
            Gizlilik Taahhüdü
          </Link>
        </div>
      </div>
    </>
  );
}
