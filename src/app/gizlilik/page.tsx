export default function GizlilikPage() {
  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "60px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <a href="/dashboard" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none" }}>
              ← Ana Sayfaya Dön
            </a>
          </div>

          <h1 className="serif" style={{ fontSize: 32, marginBottom: 8 }}>
            Gizlilik <em style={{ color: "var(--gold)" }}>Taahhüdümüz</em>
          </h1>
          <p style={{ color: "var(--t3)", fontSize: 13, marginBottom: 40 }}>
            Son güncelleme: 2026
          </p>

          <Section
            icon="fa-file-shield"
            title="Belge & Analiz Araçları — Hiçbir Şey Saklanmaz"
          >
            Dosya Analizi, Dilekçe Sihirbazı, Sözleşme İncele ve benzeri araçlara
            yüklediğiniz dosyalar ya da yapıştırdığınız metinler, yalnızca o anki
            isteği yanıtlamak için işlenir. Cevap üretilir üretilmez, yüklenen
            içerik belleğimizden silinir. Bu belgeler <strong>hiçbir veritabanında,
            hiçbir sunucuda kalıcı olarak saklanmaz.</strong>
          </Section>

          <Section icon="fa-database" title="Müvekkil/Dosya Verileri — Güvenli Saklama">
            Büro Yönetimi'ne kendi girdiğiniz müvekkil, dosya, fatura ve not
            bilgileri, şifreli bağlantı (TLS) üzerinden iletilir ve şifreli bir
            veritabanında saklanır. Bu verilere yalnızca kendi hesabınızla giriş
            yaptığınızda erişilebilir — başka hiçbir kullanıcı sizin
            müvekkillerinizi göremez.
          </Section>

          <Section icon="fa-robot" title="Yapay Zeka Modelleri Eğitilmez">
            Talya'da kullandığımız yapay zeka sağlayıcıları (Anthropic Claude ve
            Google Gemini), API üzerinden gönderilen verileri kendi genel
            modellerini eğitmek için kullanmaz. Sorularınız ve belgeleriniz,
            başka hiçbir kullanıcının göreceği bir çıktıya karışmaz.
          </Section>

          <Section icon="fa-user-lock" title="Hesap Bilgileriniz">
            Şifreniz hiçbir zaman düz metin olarak saklanmaz — geri döndürülemez
            şekilde şifrelenir (hash'lenir). Talya çalışanları dahil kimse
            şifrenizi göremez.
          </Section>

          <Section icon="fa-puzzle-piece" title="UYAP Eklentisi">
            UYAP senkronizasyon eklentisi, yalnızca siz açıkça senkronize
            ettiğinizde çalışır ve yalnızca dosya/duruşma tarihi gibi bilgileri
            aktarır. E-imzanız veya UYAP şifreniz hiçbir zaman eklentiden veya
            Talya sunucularından geçmez — UYAP oturumunuz her zaman kendi
            bilgisayarınızda kalır.
          </Section>

          <div style={{ marginTop: 40, padding: 20, background: "var(--bg2)", borderRadius: 12, fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
            Sorularınız için yöneticinizle iletişime geçebilirsiniz.
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <i className={`fa-solid ${icon}`} style={{ color: "var(--gold)", fontSize: 16 }}></i>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--t0)" }}>{title}</h2>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.7, paddingLeft: 26 }}>{children}</p>
    </div>
  );
}
