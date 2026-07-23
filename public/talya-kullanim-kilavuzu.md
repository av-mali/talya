# Talya Hukuk AI — Kullanım Kılavuzu

## İçindekiler

1. [Giriş](#1-giriş)
2. [Ana Sayfa](#2-ana-sayfa)
3. [Büro Yönetimi](#3-büro-yönetimi)
4. [Belge & Analiz](#4-belge--analiz)
5. [Arabuluculuk](#5-arabuluculuk)
6. [Avukatlık Ücret Sözleşmesi](#6-avukatlık-ücret-sözleşmesi)
7. [UYAP Entegrasyonu](#7-uyap-entegrasyonu)
8. [Hesaplama Araçları](#8-hesaplama-araçları)
9. [Üyelik & Hesap](#9-üyelik--hesap)
10. [Müvekkil Portalı](#10-müvekkil-portalı)
11. [İpuçları ve Sık Sorulan Sorular](#11-i̇puçları-ve-sık-sorulan-sorular)

---

## 1. Giriş

Talya, bir hukuk bürosunun günlük işlerini (müvekkil takibi, dosya yönetimi, belge üretimi, hesaplama, UYAP entegrasyonu ve muhasebe) tek bir yerde toplayan, yapay zeka destekli bir platformdur.

### Genel Yapı

Sisteme giriş yaptığınızda karşınıza **Ana Sayfa** çıkar. Sol tarafta, her sayfada aynı şekilde duran bir **kenar çubuğu (sidebar)** vardır:

- En üstte **Ana Sayfa** — her zaman oradan panele dönebilirsiniz.
- Altında **6 kategori**: Büro Yönetimi, Belge & Analiz, Arabuluculuk, UYAP Entegrasyonu, Hesaplama Araçları, Üyelik & Hesap.
- Kategorilerden birine tıklayınca, o kategori **yerinde açılır** ve içindeki araçlar listelenir (akordeon mantığı — bir kategoriyi açtığınızda diğeri otomatik kapanır).
- Bir araca tıkladığınızda, o araç açılır; farklı bir kategorideki bir araca tıklarsanız sayfa o kategoriye geçer.

Üst menüde soldan sağa: **Araç Ara** (⌘K ile hızlı arama), **karanlık/aydınlık mod**, **bildirim zili**, isminiz, (yöneticiyseniz) **Yönetici Paneli**, ve **Çıkış Yap**.

### Üç Panelli Çalışma Alanı

Çoğu araç, ekranı üç bölüme ayırır:

1. **Sol:** Kenar çubuğu (kategoriler ve araçlar).
2. **Orta:** Seçtiğiniz aracın formu/girişi ("Tool Panel").
3. **Sağ:** Sonuç, liste ya da Talya AI sohbet paneli ("AI Pane" veya "Detail Pane").

---

## 2. Ana Sayfa

Ana sayfa, günlük olarak en çok ihtiyaç duyacağınız bilgileri bir bakışta gösterir.

### Yaklaşan Süreler

Önümüzdeki günlerdeki duruşma, tebligat, ödeme ve görev tarihlerini listeler. **BUGÜN** etiketi, bugüne ait olanları öne çıkarır. "Tümünü gör" ile tam listeye ulaşabilirsiniz.

### İstatistikler

Üç farklı istatistik kartından, **istediğiniz kadarını** seçip gösterebilirsiniz (Üyelik & Hesap → Ana Sayfa Ayarları'ndan değiştirilir):

- **Bu Ay Net Gelir-Gider** — aylık gelir, gider ve bekleyen alacak özeti.
- **Toplam Müvekkil Sayısı**
- **Açık / Kapalı Dosya Sayısı**

### Hızlı Erişim

En sık kullandığınız araçlara, kategoriye girmeden tek tıkla ulaşmanızı sağlayan kare kartlar. Varsayılan olarak **Yeni Müvekkil**, **Dilekçe Sihirbazı** ve **Yeni Görev** gelir, ama Üyelik & Hesap → Ana Sayfa Ayarları'ndan **sistemdeki herhangi bir aracı** buraya ekleyip çıkarabilirsiniz.


---

## 3. Büro Yönetimi

### 3.1 Global Arama

Tüm sistemde (müvekkiller, dosyalar) tek bir arama kutusundan arama yapmanızı sağlar.

### 3.2 Ekip Yönetimi

Büronuza yeni bir kullanıcı (avukat/stajyer/sekreter) davet edebilir, mevcut ekip üyelerinin **hangi araçlara erişebileceğini** ayarlayabilirsiniz.

**Adım adım — yeni ekip üyesi davet etme:**
1. Ekip Yönetimi'ni açın.
2. "Davet Et" ile e-posta adresini girin.
3. Kullanıcı, gönderilen bağlantıdan kayıt olup büronuza katılır.

**Yetkileri düzenleme:**
1. Ekip listesinden bir üyeyi seçin.
2. Açılan pencerede, o kullanıcının erişebileceği araçları işaretleyin/kaldırın (pil şeklindeki etiketlere tıklayarak).
3. "Sadece kendi işlerini görsün" seçeneğini açarsanız, o kullanıcı yalnızca kendisine atanmış müvekkil/dosya/görevleri görür — büronun tamamını değil.

### 3.3 Müvekkil Yönetimi

Bu, büronun kalbidir — üç işlevi tek ekranda birleştirir:

- **Orta panel:** Yeni müvekkil ekleme formu. Ad, TC/Mersis No, adres, telefon, e-posta, not girebilir; **ya da bir belge yükleyip "Belgeden Doldur" ile AI'ın formu otomatik doldurmasını** sağlayabilirsiniz (dava dilekçesi, tebligat gibi bir belgeden).
- **Sağ panel:** Tüm müvekkillerinizin tablosu. Üstte arama kutusu ve "Excel'e Aktar" butonu vardır. **Aktif Müvekkiller** ve **Arşivlenenler** olmak üzere iki sekmesi vardır.

**Bir müvekkile tıkladığınızda** açılan detay ekranında:
- Üstte 4 ikon: **Düzenle**, **Rapor**, **Arşivle**, **Sil**.
- **Dosyalar (Case):** Bu müvekkile ait dava/iş dosyalarını buradan ekleyip yönetirsiniz. Her dosyaya bir **Dosya Numarası** (opsiyonel, sonradan da girilebilir), **Anlaşılan Ücret**, **vade tarihi** eklenebilir.
- **Müvekkil Paneli Erişimi:** Müvekkilinizin kendi TC No + sistem tarafından üretilen bir şifreyle giriş yapabileceği ayrı bir portal açabilirsiniz (bkz. Bölüm 10).
- **Avukatlık Ücret Sözleşmesi:** Bkz. Bölüm 6.
- **Müvekkil Mesajları:** Müvekkil panelinden gelen mesajları görüp cevaplayabilirsiniz.

**Dosyaları Birleştirme:** Aynı gerçek işi temsil eden iki ayrı dosyanız varsa (örneğin biri elle, biri UYAP senkronizasyonundan otomatik açılmışsa), dosya detayındaki **"Birleştir"** butonuyla ikisini tek dosyada toplayabilirsiniz — tüm tarihler, faturalar ve sözleşmeler hedef dosyaya taşınır.

**Rapor:** Bir müvekkilin toplam dosya sayısı, faturalanan/anlaşılan tutar, geçmiş ve gelecek tarihlerini özetleyen bir görünüm.

### 3.4 Süre & Takvim

Tüm duruşma, tebligat ve ödeme tarihlerinizi takvim görünümünde gösterir.

### 3.5 Fatura & Tahsilat

Bir müvekkilinizin dosyasına fatura kesip, tahsilat durumunu takip edersiniz. **Önemli:** Bir dosya bir Avukatlık Ücret Sözleşmesi'ne bağlıysa, bu ekranda elle fatura girme kapanır — ödeme takvimi otomatik olarak sözleşmeden gelir (bkz. Bölüm 6).

### 3.6 Görevler

Kanban tahtası (Yapılacak / Devam Ediyor / Tamamlandı). Görev eklerken tarih **ve saat** girebilirsiniz; görevler sürükle-bırakla sütunlar arasında taşınır. Bir görevi düzenlemek için kalem ikonuna tıklayın.

### 3.7 Notlar

Müvekkilden bağımsız, büronun genel hatırlatıcıları/notları.

### 3.8 Gelir-Gider

Büronuzun tüm gelir ve giderlerini kaydettiğiniz, aylık/toplam özet gösteren muhasebe defteri. Avukatlık Ücret Sözleşmesi'nden gelen ödemeler buraya **otomatik** işlenir (Bölüm 6'ya bakın). Ayrıca burada **Bekleyen Alacaklar** listesi vardır — vadesi gelmiş/geçmiş, henüz tahsil edilmemiş tüm alacaklarınızı (hem dosya bazlı hem sözleşme bazlı) tek yerde gösterir; "Ödenmedi" butonuna basarak tahsil edildiğini işaretleyebilirsiniz.

### 3.9 Sözleşme Takip

Büronuzun kira, yazılım aboneliği gibi kendi sözleşmelerinin bitiş tarihlerini takip eder (müvekkil sözleşmeleriyle karıştırmayın — bu, büronun kendi idari sözleşmeleri içindir).

---

## 4. Belge & Analiz

### 4.1 Dilekçe Sihirbazı

Bir dava/iş türü seçip gerekli bilgileri girerek, AI destekli bir dilekçe taslağı oluşturursunuz. Taslağı düzenleyip Word olarak indirebilirsiniz.

### 4.2 Emsal Karar Analizi

Bir hukuki konu/soru girerek, AI'ın ilgili emsal kararları bulup analiz etmesini sağlarsınız.

### 4.3 Dosya Analizi

Bir belge (PDF, Word, resim) yükleyip AI'ın içeriğini özetlemesini, riskli/önemli noktaları çıkarmasını sağlarsınız.

### 4.4 Mevzuat Arama

Kanun, yönetmelik gibi mevzuatta arama yapar; bulduğunuz maddeleri **Kütüphanem**'e kaydedebilirsiniz.

### 4.5 Şablon Kütüphanesi

Sık kullandığınız belge şablonlarını saklayıp tekrar kullanabileceğiniz alan.

### 4.6 Kütüphanem

Mevzuat Arama'dan kaydettiğiniz maddelerin biriktiği kişisel kütüphaneniz.

### 4.7 Duruşma Hazırlık

Birden fazla belgeyi (iddianame, celse tutanakları vb.) birlikte yükleyip, AI'ın bir duruşma stratejisi/özeti çıkarmasını sağlarsınız.

---

## 5. Arabuluculuk

Arabuluculuk, kendi başına bir kategoridir ve **Davet Mektubu, İlk Oturum Tutanağı ve Son Tutanak (Anlaşma/Anlaşamama)** belgelerini gerçek UYAP formatına birebir uygun şekilde otomatik üretir.

### 5.1 Dosya Ekranı — Açık / Kapalı Dosyalar

Arabuluculuk'u açtığınızda iki sütun görürsünüz:
- **Açık Dosyalar** — üzerinde hâlâ çalıştığınız dosyalar.
- **Kapalı Dosyalar** — sonuçlanmış dosyalar, **dosya numarasının başındaki yıla göre otomatik gruplanır** (ör. "2026/1329" → 2026 grubu). Yıl grupları akordeon gibi çalışır, tek seferde bir tanesi açık kalır.

Bir dosya kartını **sürükleyip diğer sütuna bırakarak** açık/kapalı durumunu değiştirebilirsiniz.

### 5.2 Yeni Dosya Oluşturma

Sol formdan:
- **Belgeden Doldur:** Başvuru evrakını yükleyin, AI taraf bilgilerini bulup formu doldursun (kaydetmeden önce kontrol edin).
- Ya da tüm alanları (Dosya No, Başvurucu bilgileri, Karşı Taraf(lar) — birden fazla eklenebilir, Uyuşmazlık Türü, Uyuşmazlık Konusu, tarihler) elle doldurup kaydedin.

### 5.3 Belge Üretme

Bir dosyayı açtığınızda üç belge türü üretebilirsiniz:

1. **Davet Mektubu** (.docx) — Başvurucuya ya da karşı tarafa gönderilecek, gün/saat/toplantı yeri (Telekonferans ya da kayıtlı büro adresiniz, tek tıkla) girilerek üretilir.
2. **İlk Oturum Tutanağı** (.udf) — Toplantı tarihi/saati ve kısa notlarınızla, AI'ın oturumun nasıl geçtiğini anlattığı, HUAK'a uygun tam metinli tutanak.
3. **Son Tutanak** (.udf) — **Anlaşma** ya da **Anlaşamama** sonucuna göre; Anlaşma'da şartları siz yazarsınız (AI değiştirmez), Anlaşamama'da sabit bir kalıp otomatik oluşur.

**Toplantı Tarihleri:** Dosya detayında, belge oluşturmaktan bağımsız olarak İlk Oturum ve Son Oturum tarih/saatini doğrudan girip kaydedebilirsiniz — bu tarihler otomatik olarak Yaklaşan Süreler'e ve bildirim zilinize düşer.


---

## 6. Avukatlık Ücret Sözleşmesi

Bir müvekkilin dosya detayında, **"Avukatlık Ücret Sözleşmesi"** bölümünden ulaşılır. Bu, sadece bir belge üretici değil — **ödeme takvimini gerçek zamanlı olarak Gelir-Gider ve Bekleyen Alacaklar'la entegre eden** bir sistemdir.

### 6.1 Sözleşme Oluşturma — Adım Adım

1. Müvekkil detayında "Yeni Sözleşme Oluştur"a tıklayın (ekranın ortasında bir pencere açılır).
2. **Hangi Dosyaya Bağlı?** — mevcut bir dosya seçebilir, ya da boş bırakırsanız sistem **"Sözleşme Konusu İş" metnini başlık yaparak otomatik yeni bir dosya açar**.
3. **Sözleşme Konusu İş**'i yazın.
4. **Sabit Ücret**'i girin (binlik ayraç otomatik eklenir). İsterseniz **"+ Dava değerinin %'si de eklensin"** kutusunu işaretleyip oranı girin.
5. **Ödeme Şekli** seçin:
   - **Peşin** — tek tarih.
   - **Taksitli** — taksit sayısını girip "Hesapla"ya basın, tutar eşit bölünür. İlk taksitin tarihini girerseniz, **diğer taksitler otomatik olarak birer ay eklenerek** doldurulur (ay sonu tarihlerinde otomatik uyarlanır — ör. 30 Ocak girerseniz sıradaki 28 Şubat, 31 Mart, 30 Nisan olur).
   - **Peşinat + Taksitli** — önce bir peşinat tutarı/tarihi girilir, kalan miktar taksitlere bölünür.
   - Herhangi bir taksiti elle değiştirirseniz, kalan taksitler otomatik yeniden hesaplanır; bir taksiti silip eklediğinizde de aynı şekilde.
6. **"Dava harç, masraf vb. giderler dahil"** kutusu — işaretliyken bu cümle sözleşmeye eklenir.
7. **Yetkili Yer** ve **Sözleşme Tarihi**'ni girin.
8. **Kaydet**'e basın (bu an belge indirmez — sadece kaydeder).

### 6.2 Belgeyi İndirme

Kaydettikten sonra listede beliren sözleşmenin yanındaki **indirme ikonuna** tıklayarak Word belgesini indirirsiniz.

### 6.3 Ödeme Takibi

Her sözleşmenin altında, girdiğiniz ödeme takvimi (her taksit/peşin tarihiyle) listelenir:

- Vadesi gelmemiş ödemeler **normal**, vadesi geçmiş ödemeler **kırmızı** ("Vadesi Geçti") görünür.
- Bir ödemeyi tahsil ettiğinizde, yanındaki **kırmızı "Ödenmedi" butonuna** basıp onaylayın — bu, ödemeyi "ödendi" işaretler VE:
  - Sözleşme bir dosyaya bağlıysa, o dosyaya **gerçek bir fatura** düşer (Fatura & Tahsilat'ta görünür) ve bu otomatik olarak Gelir-Gider'e de yansır.
  - Bağlı değilse, doğrudan Gelir-Gider'e gelir kaydı düşer.
- Vadesi geçip ödenmemiş bir taksit, otomatik olarak **Bekleyen Alacaklar**'da belirir.

### 6.4 Not

Bir sözleşmeyi silerseniz, ondan doğan **ödenmemiş** taksitler ve henüz oluşturulmamış faturalar da silinir; **zaten ödenmiş** olan gelir kayıtları (muhasebe bütünlüğü için) Gelir-Gider'de kalır.

---

## 7. UYAP Entegrasyonu

### 7.1 Dilekçe Gönder / Dosya Sorgula / Tebligat Takip / Harç Hesapla

UYAP'a ilişkin standart işlemler için hızlı erişim araçları.

### 7.2 Eklenti Bağlantısı — Chrome Uzantısı

Talya'nın, UYAP Avukat Portalı ile tarayıcınız üzerinden konuşmasını sağlayan ücretsiz bir Chrome eklentisidir. Ana sayfadan indirilebilir.

**Kurulum:**
1. Eklentiyi indirip zip'ten çıkarın.
2. Chrome'da `chrome://extensions` adresine gidin, **"Geliştirici modu"**nu açın.
3. **"Paketlenmemiş öğe yükle"** ile çıkardığınız klasörü seçin.
4. Talya'da UYAP Entegrasyonu → Eklenti Bağlantısı'na girip **"Anahtar Oluştur"** deyin, çıkan anahtarı kopyalayın.
5. Eklenti simgesine tıklayıp anahtarı yapıştırın, kaydedin.

**Kullanımı:**
- UYAP'ta **"Toplu Takvime Ekle"**ye tıkladığınızda, eklenti oluşan takvim verisini arka planda yakalayıp Talya'ya gönderir — siz onaylamadan hiçbir şey kalıcı kaydedilmez ("Bekleyen Aktarımlar" ekranında gözden geçirip onaylarsınız).
- Bir dosyadaki **tüm belgeleri toplu indirmek** için eklentinin "Bu Dosyadaki Tüm Belgeleri İndir" özelliğini kullanabilirsiniz.
- Sistem, aynı **dosya numarasına** sahip bir dosya zaten varsa otomatik olarak ona ekler — mükerrer dosya açılmaz.

---

## 8. Hesaplama Araçları

Sekiz hazır hesap makinesi: **Kıdem Tazminatı, İhbar Tazminatı, Fazla Mesai, Yıllık İzin, Yasal Faiz, Gecikme Faizi, Kira Artış Hesabı, Zamanaşımı Takvimi.** Her biri, ilgili verileri girmenizi isteyip anında sonucu gösterir.

---

## 9. Üyelik & Hesap

### 9.1 Planım & Abonelik / Fatura Geçmişi

Mevcut aboneliğinizi ve geçmiş faturalarınızı görürsünüz.

### 9.2 Profil Bilgileri

Adınız, telefon, baro/sicil numaranız, ve **Büro Adresiniz** (Avukatlık Ücret Sözleşmesi gibi belgelerde otomatik kullanılır) burada saklanır. Arabuluculuk yapıyorsanız, arabuluculuk büronuz/sicil/UETS bilgilerinizi de buradan girersiniz.

### 9.3 Güvenlik & Şifre

Şifre değiştirme.

### 9.4 Bildirim Ayarları

Hangi tür bildirimlerin (duruşma, ödeme, müvekkil mesajı vb.) size gösterileceğini seçersiniz.

### 9.5 Ana Sayfa Ayarları

- **İstatistikler:** Ana sayfada hangi istatistik kartlarının görüneceğini seçin (hepsi seçilebilir).
- **Hızlı Erişim:** Ana sayfadaki kare kartlarda hangi araçların görüneceğini, sistemdeki **tüm araçlar** arasından seçin.

### 9.6 Talya Asistan (Telegram)

Telegram üzerinden Talya'ya bağlanıp, günlük gündem raporu alabilir, bazı işlemleri sohbet üzerinden yapabilirsiniz. Bağlantı kurmak için buradaki adımları izleyin.

### 9.7 Destek / Öneri

Bir sorun bildirmek ya da öneride bulunmak için kullanılır; talepleriniz büro yöneticisine (admin panelinden) ulaşır.

---

## 10. Müvekkil Portalı

Müvekkilleriniz için ayrı, kısıtlı bir giriş ekranıdır (`/muvekkil` adresi, ana sayfada "Müvekkil Girişi" bağlantısı).

**Erişim açma:** Müvekkil detayında "Müvekkil Paneli Erişimi"nden bir şifre üretirsiniz (TC No + bu şifre ile giriş yapılır, şifre tek seferlik gösterilir — not edip müvekkile iletmeniz gerekir).

**Müvekkil bu panelden:**
- Dosyasının durumunu, yaklaşan tarihleri görebilir.
- Ödenen/kalan tutarı görebilir.
- Size mesaj gönderebilir (siz de Büro Yönetimi → Müvekkil Yönetimi'nden cevap verirsiniz; yeni mesaj geldiğinde bildirim zili ve sesli uyarı alırsınız).

---

## 11. İpuçları ve Sık Sorulan Sorular

**Bir aracı hızlıca bulamıyorum, ne yapmalıyım?**
Üst menüdeki "Araç Ara" kutusuna (ya da ⌘K kısayoluna) yazmaya başlayın — tüm araçlar arasında anında arama yapar.

**AI özellikleri "kota doldu" hatası veriyor.**
Sistem şu an ücretsiz bir AI modeli kullanıyor, bu modelin dakikalık kullanım sınırı var. Birkaç saniye bekleyip tekrar deneyin. Yoğun kullanımda bu daha sık olabilir.

**Bir dosyayı yanlışlıkla iki kez açtım, ne yapmalıyım?**
Dosya detayındaki **"Birleştir"** özelliğini kullanın (Bölüm 3.3).

**Vekâlet ücreti hem Fatura & Tahsilat'ta hem Sözleşme'de mi girilir?**
Hayır — bir dosya bir Avukatlık Ücret Sözleşmesi'ne bağlıysa, Fatura & Tahsilat otomatik olarak sözleşmenin ödeme takvimini gösterir; elle ayrıca girmenize gerek yoktur.

**Bir müvekkili sildim, gelir kaydı hâlâ duruyor — hata mı?**
Hayır, bilerek böyle: geçmiş gelir kayıtları, muhasebe bütünlüğü için müvekkil silinse bile Gelir-Gider'de kalır.

**Verilerim güvende mi?**
Tüm iletişim şifrelidir, KVKK'ya uygun şekilde saklanır (üst menüdeki "KVKK Güvenli" rozeti).

---

*Bu kılavuz, Talya Hukuk AI'ın mevcut sürümünü yansıtır. Sistem sürekli geliştirildiği için, burada anlatılan bazı ayrıntılar zamanla değişebilir.*
