import Link from "next/link";

const FEATURES = [
  { icon: "fa-file-lines", title: "Belge & Analiz", desc: "Dosya analizi, dilekçe sihirbazı, mevzuat arama — gerçek zamanlı AI desteğiyle." },
  { icon: "fa-briefcase", title: "Büro Yönetimi", desc: "Müvekkil, dosya, gelir-gider, görev panosu — hepsi tek yerde." },
  { icon: "fa-puzzle-piece", title: "UYAP Entegrasyonu", desc: "Duruşma ve tebligat tarihlerini otomatik senkronize edin." },
  { icon: "fa-calculator", title: "Hesaplama Araçları", desc: "Kıdem, ihbar, faiz, kira artışı — güncel oranlarla anında hesap." },
  { icon: "fa-people-group", title: "Ekip Yönetimi", desc: "Büronuzu büyütün, üyelere özel yetkiler tanımlayın." },
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
    features: ["Sınırsız kullanıcı sayısı", "Ekip'teki her şey", "Öncelikli destek", "Özel entegrasyon görüşmesi"],
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ minHeight: "100vh", height: "100vh", overflowY: "auto", background: "var(--bg)", boxSizing: "border-box" }}>
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

        {/* HERO — soyut adalet terazisi çizimi + istatistikler */}
        <div style={{ position: "relative", padding: "70px 20px 20px", textAlign: "center", overflow: "hidden" }}>
          <div className="hero-mark" aria-hidden="true">
            <svg viewBox="0 0 1200 640" xmlns="http://www.w3.org/2000/svg">
              <g className="beam-arm">
                <line className="beam-hi" x1="180" y1="190" x2="1020" y2="190" />
                <line className="beam" x1="600" y1="60" x2="600" y2="190" />
                <line className="beam" x1="180" y1="190" x2="180" y2="330" />
                <line className="beam" x1="140" y1="330" x2="220" y2="330" />
                <line className="beam" x1="1020" y1="190" x2="1020" y2="330" />
                <line className="beam" x1="980" y1="330" x2="1060" y2="330" />
                <path className="tick" d="M 155 240 Q 180 270 205 240" fill="none" />
                <path className="tick" d="M 995 240 Q 1020 270 1045 240" fill="none" />
              </g>
              <line className="beam" x1="600" y1="60" x2="600" y2="600" />
              <line className="beam-hi" x1="520" y1="600" x2="680" y2="600" />
            </svg>
          </div>

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
              <Link href="/register" className="nav-pill gold" style={{ textDecoration: "none", padding: "10px 22px", fontSize: 13 }}>
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
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 22,
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
            {STEPS.map((s) => (
              <div key={s.num} style={{ flex: "1 1 220px", maxWidth: 260, textAlign: "center" }}>
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
            {PLANS.map((p) => (
              <div
                key={p.name}
                style={{
                  background: p.highlight ? "linear-gradient(160deg, var(--card), var(--gold-lo))" : "var(--card)",
                  border: p.highlight ? "2px solid var(--gold)" : "1px solid var(--border)",
                  borderRadius: 18,
                  padding: 30,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: p.highlight ? "0 20px 50px rgba(184,146,42,.16)" : "0 4px 16px rgba(0,0,0,.03)",
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <div className="home-logo-mark" style={{ width: 24, height: 24, fontSize: 12 }}>T</div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 14, color: "var(--t2)" }}>Talya Hukuk</span>
          </div>
          <Link href="/gizlilik" style={{ fontSize: 12, color: "var(--t3)", textDecoration: "none" }}>
            Gizlilik Taahhüdü
          </Link>
        </div>
      </div>
    </>
  );
}
