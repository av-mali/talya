export default function AydinlatmaMetniPage() {
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
            KVKK <em style={{ color: "var(--gold)" }}>Aydınlatma Metni</em>
          </h1>
          <p style={{ color: "var(--t3)", fontSize: 13, marginBottom: 36 }}>Son güncelleme: 2026</p>

          <Section title="1. Veri Sorumlusu">
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz;
              veri sorumlusu sıfatıyla Talya Hukuk tarafından aşağıda açıklanan kapsamda işlenmektedir.
            </p>
          </Section>

          <Section title="2. İşlenen Kişisel Veriler">
            <p>
              Ad-soyad, e-posta adresi, telefon numarası, baro/sicil bilgisi gibi kimlik ve iletişim
              verileriniz; platformu kullanımınıza ilişkin işlem güvenliği verileri (IP adresi, oturum
              kayıtları); ve (varsa) fatura/ödeme bilgileriniz işlenmektedir.
            </p>
            <p>
              <strong>Önemli:</strong> Belge & Analiz araçlarına yüklediğiniz dosyalar/metinler
              kalıcı olarak saklanmaz, yalnızca anlık işlenip silinir — bkz.{" "}
              <a href="/gizlilik" style={{ color: "var(--gold)" }}>Gizlilik Taahhüdümüz</a>.
            </p>
          </Section>

          <Section title="3. Kişisel Verilerin İşlenme Amaçları">
            <p>
              Kişisel verileriniz; üyelik kaydınızın oluşturulması ve yönetilmesi, hizmetin sunulması
              ve sözleşmesel yükümlülüklerin ifası, müşteri destek süreçlerinin yürütülmesi, yasal
              yükümlülüklerin yerine getirilmesi ve hizmet kalitesinin artırılması amaçlarıyla
              işlenmektedir.
            </p>
          </Section>

          <Section title="4. Hukuki Sebep">
            <p>
              Kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen "bir sözleşmenin kurulması veya
              ifasıyla doğrudan doğruya ilgili olma", "hukuki yükümlülüğün yerine getirilmesi" ve
              "meşru menfaat" hukuki sebeplerine dayanılarak işlenmektedir.
            </p>
          </Section>

          <Section title="5. Kişisel Verilerin Aktarımı">
            <p>
              Kişisel verileriniz; hizmetin sunulabilmesi için gerekli olduğu ölçüde, barındırma
              (hosting) ve altyapı hizmeti aldığımız tedarikçilerle (ör. sunucu/veritabanı sağlayıcı)
              ve yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarıyla paylaşılabilir.
              Verileriniz, yapay zeka sağlayıcılarımızın (Anthropic, Google) kendi model eğitimlerinde
              kullanılmamaktadır.
            </p>
          </Section>

          <Section title="6. Saklama Süresi">
            <p>
              Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta
              öngörülen zamanaşımı süreleri dikkate alınarak saklanır; hesabınızı kapattığınızda,
              yasal saklama yükümlülükleri hariç olmak üzere makul bir süre içinde silinir veya
              anonim hale getirilir.
            </p>
          </Section>

          <Section title="7. KVKK Kapsamındaki Haklarınız">
            <p>KVKK'nın 11. maddesi uyarınca, veri sorumlusuna başvurarak:</p>
            <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.9 }}>
              <li>Kişisel verinizin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Eksik/yanlış işlenmişse düzeltilmesini isteme,</li>
              <li>Silinmesini veya yok edilmesini isteme,</li>
              <li>İşlemenin kanuna aykırı olması halinde zararın giderilmesini talep etme</li>
            </ul>
            <p style={{ marginTop: 8 }}>haklarına sahipsiniz.</p>
          </Section>

          <Section title="8. Başvuru Yöntemi">
            <p>
              Yukarıdaki haklarınızı kullanmak için taleplerinizi, hesabınızda kayıtlı e-posta
              adresiniz üzerinden büro yöneticinize/Talya destek ekibine iletebilirsiniz.
            </p>
          </Section>

          <div style={{ marginTop: 40, padding: 20, background: "var(--bg2)", borderRadius: 12, fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
            Bu metin, Gizlilik Taahhüdümüzü tamamlayıcı niteliktedir — bkz.{" "}
            <a href="/gizlilik" style={{ color: "var(--gold)" }}>Gizlilik Taahhüdü</a>.
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
