export default function MesafeliSatisPage() {
  return (
    <>
      <link rel="stylesheet" href="/talya-original.css" />
      <div style={{ background: "var(--bg)", minHeight: "100vh", height: "100vh", overflowY: "auto", padding: "60px 20px", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <a href="/" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none" }}>
              ← Ana Sayfaya Dön
            </a>
          </div>

          <h1 className="serif" style={{ fontSize: 30, marginBottom: 8 }}>
            Mesafeli Satış <em style={{ color: "var(--gold)" }}>Sözleşmesi</em>
          </h1>
          <p style={{ color: "var(--t3)", fontSize: 13, marginBottom: 36 }}>Son güncelleme: 2026</p>

          <Section title="1. Taraflar">
            <p><strong>SATICI:</strong> Talya Hukuk ("Talya", "Hizmet Sağlayıcı")</p>
            <p><strong>ALICI:</strong> Talya Hukuk platformuna üye olan ve işbu sözleşme konusu hizmeti satın alan gerçek/tüzel kişi ("Üye", "Kullanıcı")</p>
          </Section>

          <Section title="2. Sözleşmenin Konusu">
            <p>
              İşbu sözleşmenin konusu, ALICI'nın Talya Hukuk internet sitesi/uygulaması üzerinden elektronik
              ortamda sipariş verdiği, niteliği ve satış fiyatı üyelik planı sayfasında belirtilen
              dijital hizmetin (yazılım aboneliği) satışı ve ifasına ilişkin olarak 6502 sayılı
              Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri
              gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
            </p>
          </Section>

          <Section title="3. Hizmet Bilgileri">
            <p>
              Hizmetin türü, süresi (aylık/yıllık) ve bedeli, ALICI'nın satın alma anında seçtiği plana
              (Talya Solo, Talya Ekip veya Talya Kurumsal) göre değişir ve satın alma sırasında ALICI'ya
              açıkça gösterilir. Ödeme, ALICI'nın tercih ettiği yöntemle (kredi kartı, banka havalesi vb.)
              yapılır.
            </p>
          </Section>

          <Section title="4. Genel Hükümler">
            <p>
              ALICI, üyelik planı sayfasındaki hizmete ilişkin temel özellikleri, satış fiyatını, ödeme
              şeklini ve ifaya ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda
              gerekli teyidi verdiğini kabul eder. Hizmet, ödemenin onaylanmasını takiben ALICI'nın
              hesabında aktif hale getirilir.
            </p>
          </Section>

          <Section title="5. Cayma Hakkı">
            <p>
              ALICI, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin,
              mal/hizmetin teslim tarihinden (dijital hizmetin aktif edilmesinden) itibaren <strong>14
              (on dört) gün</strong> içinde sözleşmeden cayma hakkına sahiptir.
            </p>
          </Section>

          <Section title="6. Cayma Hakkının Kullanılamayacağı Haller">
            <p>
              Mesafeli Sözleşmeler Yönetmeliği'nin ilgili maddesi uyarınca, ALICI'nın onayı ile cayma
              hakkı süresi dolmadan ifasına başlanan ve ALICI tarafından fiilen kullanılmaya başlanan
              dijital hizmetlerde (ör. AI araçlarının kullanılmış olması), hizmetin niteliği gereği
              cayma hakkı kullanılamaz. ALICI, hizmeti kullanmaya başlamadan önce bu hususta
              bilgilendirilir.
            </p>
          </Section>

          <Section title="7. Fesih ve İptal">
            <p>
              ALICI, aboneliğini dilediği zaman Üyelik & Hesap ekranından iptal edebilir. İptal, bir
              sonraki fatura döneminden itibaren geçerli olur; cari dönem için ödenen bedel, kısmi
              kullanım nedeniyle iade edilmez (yasal cayma hakkı süresi saklıdır).
            </p>
          </Section>

          <Section title="8. Uyuşmazlıkların Çözümü">
            <p>
              İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca yıllık olarak belirlenen
              parasal sınırlar dahilinde ALICI'nın yerleşim yerindeki Tüketici Hakem Heyetleri ile
              Tüketici Mahkemeleri yetkilidir.
            </p>
          </Section>

          <div style={{ marginTop: 40, padding: 20, background: "var(--bg2)", borderRadius: 12, fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
            Sorularınız için yöneticinizle iletişime geçebilirsiniz.
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 8 }}>{title}</h2>
      <div style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}
