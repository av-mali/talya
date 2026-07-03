// ── MODULE CONFIG ──
const MODULES = {
  belge: {
    label:'Belge & Analiz', nameHtml:'Belge &amp; <em class="g">Analiz</em>', color:'g',
    items:[
      {id:'wizard', icon:'fa-scroll', name:'Dilekçe Sihirbazı'},
      {id:'emsal', icon:'fa-magnifying-glass-chart', name:'Emsal Karar Analizi'},
      {id:'dosya', icon:'fa-file-shield', name:'Dosya Analizi'},
      {id:'sozlesme', icon:'fa-file-signature', name:'Sözleşme İnceleme'},
      {id:'mevzuat', icon:'fa-book-open-reader', name:'Mevzuat Arama'},
      {id:'sablon', icon:'fa-layer-group', name:'Şablon Kütüphanesi'},
      {id:'risk', icon:'fa-scale-balanced', name:'Risk Analizi'},
      {id:'durusma', icon:'fa-timeline', name:'Duruşma Hazırlık'},
    ]
  },
  buro: {
    label:'Büro Yönetimi', nameHtml:'Büro <em class="b">Yönetimi</em>', color:'b',
    items:[
      {id:'muvekkil', icon:'fa-users', name:'Müvekkil Yönetimi'},
      {id:'sure', icon:'fa-calendar-xmark', name:'Süre & Takvim', badge:'3'},
      {id:'arsiv', icon:'fa-box-archive', name:'Belge Arşivi'},
      {id:'ucret', icon:'fa-calculator', name:'Ücret Hesaplayıcı'},
      {id:'rapor', icon:'fa-file-circle-check', name:'Müvekkil Raporu'},
      {id:'fatura', icon:'fa-receipt', name:'Fatura & Tahsilat'},
    ]
  },
  uyap: {
    label:'UYAP Entegrasyonu', nameHtml:'UYAP <em class="t">Entegrasyonu</em>', color:'t',
    items:[
      {id:'uyap-dilekce', icon:'fa-paper-plane', name:'Dilekçe Gönder'},
      {id:'uyap-dosya', icon:'fa-folder-open', name:'Dosya Sorgula'},
      {id:'uyap-tebligat', icon:'fa-envelope-open-text', name:'Tebligat Takip'},
      {id:'uyap-harc', icon:'fa-coins', name:'Harç Hesapla'},
    ]
  },
  hesap: {
    label:'Hesaplama Araçları', nameHtml:'Hesaplama <em class="p">Araçları</em>', color:'p',
    items:[
      {id:'kidem', icon:'fa-hand-holding-dollar', name:'Kıdem Tazminatı'},
      {id:'ihbar', icon:'fa-person-walking-arrow-right', name:'İhbar Tazminatı'},
      {id:'mesai', icon:'fa-clock-rotate-left', name:'Fazla Mesai'},
      {id:'izin', icon:'fa-umbrella-beach', name:'Yıllık İzin'},
      {id:'nafaka', icon:'fa-children', name:'Nafaka Tahmini'},
      {id:'faiz', icon:'fa-percent', name:'Yasal Faiz'},
      {id:'gecikme', icon:'fa-arrow-trend-up', name:'Gecikme Faizi'},
      {id:'kira', icon:'fa-building', name:'Kira Artış Hesabı'},
      {id:'malpay', icon:'fa-scale-unbalanced-flip', name:'Mal Paylaşımı'},
      {id:'icra', icon:'fa-gavel', name:'İcra Masrafları'},
      {id:'za', icon:'fa-hourglass-half', name:'Zamanaşımı Takvimi'},
    ]
  },
  uyelik: {
    label:'Üyelik & Hesap', nameHtml:'Üyelik <em class="g">& Hesap</em>', color:'g',
    items:[
      {id:'plan', icon:'fa-star', name:'Planım & Abonelik'},
      {id:'faturalar', icon:'fa-file-invoice', name:'Fatura Geçmişi'},
      {id:'profil', icon:'fa-user-circle', name:'Profil Bilgileri'},
      {id:'guvenlik', icon:'fa-shield-halved', name:'Güvenlik & Şifre'},
      {id:'bildirim', icon:'fa-bell', name:'Bildirim Ayarları'},
    ]
  }
};

// ── POPUP CONTENT CONFIG ──
const POPUPS = {
  wizard:{
    badge:'g', badgeText:'HMK Md.119 · Dava Dilekçesi', titleHtml:'Dilekçe <em class="g">Sihirbazı</em>',
    desc:'Olay özetini girin; yapay zeka HMK uyumlu taslağı oluştursun.',
    btnClass:'g', btnIco:'fa-gears', btnLbl:'Dilekçeyi Taslakla',
    body:`
      <div class="fg"><div class="fl"><i class="fa-solid fa-gavel"></i> Dava Türü</div><div class="sw"><select id="f-dava"><option>İş Hukuku — İşe İade, Kıdem, İhbar</option><option>Aile Hukuku — Boşanma, Velayet, Nafaka</option><option>Ticaret — Alacak, İtirazın İptali</option><option>Ceza — Şikayet / Savunma</option><option>İdare — İptal, Tam Yargı</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-align-left"></i> Olay Örgüsü</div><textarea id="f-olay" rows="5" placeholder="Müvekkilin yaşadığı olayı yazın…"></textarea></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-list-check"></i> Özel Talepler <span class="opt">(opsiyonel)</span></div><input type="text" id="f-talep" placeholder="İhtiyati tedbir, faiz, vekâlet ücreti…"></div>
      <div class="cl"><div class="cl-head"><i class="fa-solid fa-shield-check"></i> Otomatik kontrol</div>
        <div class="cl-item"><div class="cl-dot"><i class="fa-solid fa-check"></i></div><span>HMK Madde 119 uyumluluğu</span></div>
        <div class="cl-item"><div class="cl-dot"><i class="fa-solid fa-check"></i></div><span>Görevli mahkeme tespiti</span></div>
        <div class="cl-item"><div class="cl-dot"><i class="fa-solid fa-check"></i></div><span>Zamanaşımı risk taraması</span></div>
      </div>`,
    prompt: ()=>`${document.getElementById('f-dava')?.value||''} davası için HMK uyumlu dilekçe taslağı hazırla.\n\nOlay örgüsü:\n${document.getElementById('f-olay')?.value||''}\n\nÖzel talepler: ${document.getElementById('f-talep')?.value||'Belirtilmemiş'}`
  },
  emsal:{
    badge:'g', badgeText:'Yargıtay · BAM Kararları', titleHtml:'Emsal Karar <em class="g">Analizi</em>',
    desc:'Uyuşmazlığı tanımlayın; benzer davalardaki kararlar AI ile analiz edilsin.',
    btnClass:'g', btnIco:'fa-magnifying-glass', btnLbl:'Emsal Karar Ara',
    body:`
      <div class="fg"><div class="fl"><i class="fa-solid fa-gavel"></i> Uyuşmazlık Konusu</div><div class="sw"><select id="f-konu"><option>İş Hukuku</option><option>Aile Hukuku</option><option>Ticaret Hukuku</option><option>Ceza Hukuku</option><option>İdare Hukuku</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-align-left"></i> Hukuki Mesele</div><textarea id="f-mesele" rows="4" placeholder="Emsal aranan hukuki meseleyi özetleyin…"></textarea></div>`,
    prompt: ()=>`${document.getElementById('f-konu')?.value||''} alanında şu konuda Yargıtay ve BAM emsal kararlarını ara ve analiz et:\n${document.getElementById('f-mesele')?.value||''}`
  },
  dosya:{
    badge:'g', badgeText:'PDF · UDF · TIFF', titleHtml:'Dosya <em class="g">Analizi</em>',
    desc:'Dava dosyasını tanımlayın; yapay zeka olayı, kararları ve süreleri çıkarsın.',
    btnClass:'g', btnIco:'fa-file-magnifying-glass', btnLbl:'Dosyayı Analiz Et',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-magnifying-glass"></i> Analiz Derinliği</div><div class="sw"><select id="f-derinlik"><option>Tam analiz</option><option>Hızlı özet</option><option>Sadece süreler</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-align-left"></i> Dosya Özeti / Notlar</div><textarea id="f-dosyanot" rows="4" placeholder="Dosya hakkında bilinen bilgileri yazın…"></textarea></div>`,
    prompt: ()=>`Dava dosyası analizi yap. Analiz derinliği: ${document.getElementById('f-derinlik')?.value||''}. Bilgiler:\n${document.getElementById('f-dosyanot')?.value||''}\n\nOlayın özeti, kararlar, kritik süreler ve taraflar hakkında rapor ver.`
  },
  sozlesme:{
    badge:'g', badgeText:'TBK · Borçlar Kanunu', titleHtml:'Sözleşme <em class="g">İnceleme</em>',
    desc:'Sözleşme metnini yapıştırın; riskli maddeler tespit edilsin.',
    btnClass:'g', btnIco:'fa-shield-halved', btnLbl:'Risk Analizi Başlat',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-file-signature"></i> Sözleşme Türü</div><div class="sw"><select id="f-soztur"><option>İş Sözleşmesi</option><option>Kira Sözleşmesi</option><option>Satış Sözleşmesi</option><option>Hizmet Sözleşmesi</option><option>Diğer</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-paste"></i> Sözleşme Metni</div><textarea id="f-sozmetin" rows="6" placeholder="Sözleşme metnini buraya yapıştırın…"></textarea></div>`,
    prompt: ()=>`Aşağıdaki ${document.getElementById('f-soztur')?.value||''} sözleşmesini incele. Riskli maddeleri, hukuki açıkları ve önerilen değişiklikleri belirt:\n\n${document.getElementById('f-sozmetin')?.value||''}`
  },
  mevzuat:{
    badge:'g', badgeText:'Mevzuat.gov.tr · Resmi Gazete', titleHtml:'Mevzuat <em class="g">Arama</em>',
    desc:'Kanun, yönetmelik ve tebliğlerde anlık arama yapın.',
    btnClass:'g', btnIco:'fa-book-open-reader', btnLbl:'Mevzuatta Ara',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-book"></i> Tür</div><div class="sw"><select id="f-mevtur"><option>Kanun</option><option>Yönetmelik</option><option>Tebliğ</option><option>C.B. Kararnamesi</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-magnifying-glass"></i> Arama Terimi</div><input type="text" id="f-mevara" placeholder="Kıdem tazminatı, velayet, kira artışı…"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-hashtag"></i> Kanun No <span class="opt">(opsiyonel)</span></div><input type="text" id="f-mevno" placeholder="4857, 6098…"></div>`,
    prompt: ()=>`"${document.getElementById('f-mevara')?.value||''}" konusunda ${document.getElementById('f-mevtur')?.value||''} ara. İlgili maddeleri düz dilde özetle, değişiklik geçmişini belirt. ${document.getElementById('f-mevno')?.value?'Kanun No: '+document.getElementById('f-mevno').value:''}`
  },
  sablon:{
    badge:'g', badgeText:'200+ Hazır Şablon', titleHtml:'Şablon <em class="g">Kütüphanesi</em>',
    desc:'Hazır şablon seçin, müvekkil bilgilerini girin.',
    btnClass:'g', btnIco:'fa-file-circle-plus', btnLbl:'Şablonu Oluştur',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-layer-group"></i> Kategori</div><div class="sw"><select id="f-sabkat"><option>İhtarname / İhbarname</option><option>Vekaletname</option><option>Feragat Beyanı</option><option>Arabuluculuk Tutanağı</option><option>İcra İtirazı</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-user"></i> Müvekkil Adı</div><input type="text" id="f-sabmv" placeholder="Ad Soyad…"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-note-sticky"></i> Ek Bilgi <span class="opt">(opsiyonel)</span></div><input type="text" id="f-sabek" placeholder="Özel koşullar, tarihler…"></div>`,
    prompt: ()=>`${document.getElementById('f-sabkat')?.value||''} şablonu oluştur. Müvekkil: ${document.getElementById('f-sabmv')?.value||'[Müvekkil Adı]'}. Ek bilgi: ${document.getElementById('f-sabek')?.value||'Yok'}`
  },
  risk:{
    badge:'g', badgeText:'Hakim Perspektifi · Kazanma Olasılığı', titleHtml:'Risk <em class="g">Analizi</em>',
    desc:'Dava özetini girin; güçlü/zayıf yönler değerlendirilsin.',
    btnClass:'g', btnIco:'fa-chart-pie', btnLbl:'Risk Skoru Hesapla',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-gavel"></i> Dava Türü</div><div class="sw"><select id="f-risktur"><option>İş Hukuku</option><option>Aile Hukuku</option><option>Ticaret</option><option>Ceza</option><option>İdare</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-align-left"></i> Dava Özeti</div><textarea id="f-riskoz" rows="4" placeholder="Davanın özünü ve delilleri aktarın…"></textarea></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-user-tie"></i> Müvekkilin Rolü</div><div class="sw"><select id="f-riskrol"><option>Davacı</option><option>Davalı</option></select></div></div>`,
    prompt: ()=>`${document.getElementById('f-risktur')?.value||''} davasında ${document.getElementById('f-riskrol')?.value||''} için risk analizi yap. Güçlü/zayıf yönler, kazanma olasılığı ve strateji önerisi:\n\n${document.getElementById('f-riskoz')?.value||''}`
  },
  durusma:{
    badge:'g', badgeText:'Celse Hazırlığı', titleHtml:'Duruşma <em class="g">Hazırlık</em>',
    desc:'Duruşma bilgilerini girin; strateji ve sorular oluşturulsun.',
    btnClass:'g', btnIco:'fa-person-chalkboard', btnLbl:'Hazırlık Başlat',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-calendar-day"></i> Duruşma Tarihi</div><input type="text" id="f-dtarih" placeholder="GG/AA/YYYY"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-align-left"></i> Güncel Durum</div><textarea id="f-ddur" rows="4" placeholder="Son celse kararı, bekleyen adımlar…"></textarea></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-lightbulb"></i> İstenen Çıktı</div><div class="sw"><select id="f-dcikti"><option>Olası hakim soruları ve cevaplar</option><option>Tanık soru listesi</option><option>Kapanış beyanı taslağı</option><option>Kronolojik olay örgüsü</option></select></div></div>`,
    prompt: ()=>`${document.getElementById('f-dtarih')?.value||''} tarihli duruşma için hazırlık yap. İstenen: ${document.getElementById('f-dcikti')?.value||''}.\n\nGüncel durum:\n${document.getElementById('f-ddur')?.value||''}`
  },
  muvekkil:{
    badge:'b', badgeText:'Büro CRM', titleHtml:'Müvekkil <em class="b">Yönetimi</em>',
    desc:'Müvekkil profili ve dava durumunu sorgulayın.',
    btnClass:'b', btnIco:'fa-id-card', btnLbl:'Profili Görüntüle',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-user"></i> Müvekkil Adı</div><input type="text" id="f-mvad" placeholder="Ad Soyad…"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-note-sticky"></i> Not / Sorgulama</div><textarea id="f-mvnot" rows="3" placeholder="Dava durumu, özel notlar…"></textarea></div>`,
    prompt: ()=>`${document.getElementById('f-mvad')?.value||''} müvekkili için profil özeti ve dava durum raporu. ${document.getElementById('f-mvnot')?.value||''}`
  },
  sure:{
    badge:'b', badgeText:'Kritik Süre Radarı', titleHtml:'Süre &amp; <em class="b">Takvim</em>',
    desc:'Tebliğ tarihini girin; yasal süre ve son başvuru tarihi hesaplansın.',
    btnClass:'b', btnIco:'fa-clock-rotate-left', btnLbl:'Süreyi Hesapla',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-gavel"></i> Süre Türü</div><div class="sw"><select id="f-suretur"><option>Temyiz süresi (15 gün)</option><option>İstinaf süresi (2 hafta)</option><option>İtiraz süresi (7 gün)</option><option>Zamanaşımı kontrolü</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-calendar-day"></i> Tebliğ / Olay Tarihi</div><input type="text" id="f-suretarih" placeholder="GG/AA/YYYY"></div>
      <div class="ic"><div class="ic-t"><i class="fa-solid fa-triangle-exclamation"></i> Önemli</div><p>Süre kaçırma, mesleki sorumluluk davalarının %40'ının sebebidir.</p></div>`,
    prompt: ()=>`${document.getElementById('f-suretur')?.value||''} için tebliğ tarihi: ${document.getElementById('f-suretarih')?.value||''}. Son başvuru tarihini hesapla, kalan gün sayısını belirt ve varsa risk uyarısı ver.`
  },
  arsiv:{
    badge:'b', badgeText:'Akıllı Arşiv', titleHtml:'Belge <em class="b">Arşivi</em>',
    desc:'Arşivde belge arayın ve filtreleyin.',
    btnClass:'b', btnIco:'fa-folder-open', btnLbl:'Arşivi Tara',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-magnifying-glass"></i> Arama</div><input type="text" id="f-arsiv" placeholder="Belge adı, müvekkil, dava no…"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-filter"></i> Tür</div><div class="sw"><select id="f-arsivtur"><option>Tümü</option><option>Dilekçeler</option><option>Sözleşmeler</option><option>Raporlar</option></select></div></div>`,
    prompt: ()=>`Belge arşivinde "${document.getElementById('f-arsiv')?.value||''}" ara. Tür filtresi: ${document.getElementById('f-arsivtur')?.value||''}.`
  },
  ucret:{
    badge:'b', badgeText:'2026 AAÜT', titleHtml:'Ücret <em class="b">Hesaplayıcı</em>',
    desc:'2026 Asgari Ücret Tarifesi\'ne göre vekâlet ücreti hesaplayın.',
    btnClass:'b', btnIco:'fa-calculator', btnLbl:'Ücreti Hesapla',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-gavel"></i> Dava Türü</div><div class="sw"><select id="f-ucturur"><option>Asliye Hukuk</option><option>İş Davası</option><option>Aile Mahkemesi</option><option>Ceza Davası</option><option>İdare Davası</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Dava Değeri (TL)</div><input type="text" id="f-ucval" placeholder="250000"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-layer-group"></i> Aşama</div><div class="sw"><select id="f-ucasama"><option>İlk derece</option><option>İstinaf</option><option>Temyiz</option></select></div></div>`,
    prompt: ()=>`2026 Avukatlık Asgari Ücret Tarifesi'ne göre hesapla: ${document.getElementById('f-ucturur')?.value||''}, dava değeri ${document.getElementById('f-ucval')?.value||''} TL, ${document.getElementById('f-ucasama')?.value||''} aşaması.`
  },
  rapor:{
    badge:'b', badgeText:'Müvekkil İletişim', titleHtml:'Müvekkil <em class="b">Raporu</em>',
    desc:'Dava durumunu girin; müvekkile özel rapor oluştursun.',
    btnClass:'b', btnIco:'fa-file-export', btnLbl:'Raporu Oluştur',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-user"></i> Müvekkil Adı</div><input type="text" id="f-raporad" placeholder="Ad Soyad…"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-briefcase"></i> Güncel Durum</div><textarea id="f-rapordur" rows="4" placeholder="Son celse, bekleyen adımlar…"></textarea></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-paper-plane"></i> Format</div><div class="sw"><select id="f-raporformat"><option>E-posta (resmi)</option><option>SMS özeti</option><option>WhatsApp</option></select></div></div>`,
    prompt: ()=>`${document.getElementById('f-raporad')?.value||''} adlı müvekkil için ${document.getElementById('f-raporformat')?.value||''} formatında dava durum raporu yaz:\n${document.getElementById('f-rapordur')?.value||''}`
  },
  fatura:{
    badge:'b', badgeText:'Tahsilat Takip', titleHtml:'Fatura &amp; <em class="b">Tahsilat</em>',
    desc:'Vekâlet ücreti faturası oluşturun ve ödeme takibi yapın.',
    btnClass:'b', btnIco:'fa-file-invoice-dollar', btnLbl:'Fatura Oluştur',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-user"></i> Müvekkil</div><input type="text" id="f-fatmv" placeholder="Müvekkil adı…"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Tutar (TL)</div><input type="text" id="f-fattutar" placeholder="15000"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-calendar"></i> Son Ödeme Tarihi</div><input type="text" id="f-fattarih" placeholder="GG/AA/YYYY"></div>`,
    prompt: ()=>`${document.getElementById('f-fatmv')?.value||''} müvekkili için ${document.getElementById('f-fattutar')?.value||''} TL tutarında avukatlık ücreti faturası oluştur. Son ödeme: ${document.getElementById('f-fattarih')?.value||''}.`
  },
  'uyap-dilekce':{
    badge:'t', badgeText:'UYAP · PDF/A · e-İmza', titleHtml:'UYAP Dilekçe <em class="t">Gönder</em>',
    desc:'Dilekçenizi UYAP uyumlu formata hazırlayın.',
    btnClass:'t', btnIco:'fa-upload', btnLbl:"UYAP'a Hazırla",
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-building-columns"></i> Hedef Mahkeme</div><input type="text" id="f-uyapmah" placeholder="İstanbul 3. İş Mahkemesi…"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-hashtag"></i> Esas No</div><input type="text" id="f-uyapno" placeholder="2024/____"></div>
      <div class="cl"><div class="cl-head"><i class="fa-solid fa-circle-check"></i> UYAP Kontrol</div>
        <div class="cl-item"><div class="cl-dot"><i class="fa-solid fa-check"></i></div><span>PDF/A-1b formatına dönüştürülür</span></div>
        <div class="cl-item"><div class="cl-dot"><i class="fa-solid fa-check"></i></div><span>e-İmza alanı hazırlanır</span></div>
      </div>`,
    prompt: ()=>`UYAP için dilekçe hazırlık kontrol listesi oluştur. Hedef mahkeme: ${document.getElementById('f-uyapmah')?.value||''}. Esas no: ${document.getElementById('f-uyapno')?.value||''}. PDF/A uyumluluk adımlarını ve e-imza gerekliliklerini açıkla.`
  },
  'uyap-dosya':{
    badge:'t', badgeText:'UYAP · Gerçek Zamanlı', titleHtml:'UYAP Dosya <em class="t">Sorgula</em>',
    desc:'Esas numarasıyla dosya sorgulayın.',
    btnClass:'t', btnIco:'fa-magnifying-glass', btnLbl:'Dosyayı Sorgula',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-hashtag"></i> Esas Numarası</div><input type="text" id="f-dsorg" placeholder="2024/12345"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-building-columns"></i> Mahkeme Türü</div><div class="sw"><select id="f-dsorgtip"><option>İş Mahkemesi</option><option>Asliye Hukuk</option><option>Aile Mahkemesi</option><option>Ceza Mahkemesi</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-location-dot"></i> İl</div><input type="text" id="f-dsorgil" placeholder="İstanbul…"></div>`,
    prompt: ()=>`UYAP ${document.getElementById('f-dsorgtip')?.value||''} dosya sorgulama. Esas no: ${document.getElementById('f-dsorg')?.value||''}, il: ${document.getElementById('f-dsorgil')?.value||''}. Son celse, duruşma tarihi, karar durumu ve yapılması gerekenler hakkında özet ver.`
  },
  'uyap-tebligat':{
    badge:'t', badgeText:'Elektronik Tebligat', titleHtml:'Tebligat <em class="t">Takip</em>',
    desc:'Elektronik tebligatları takip edin.',
    btnClass:'t', btnIco:'fa-inbox', btnLbl:'Tebligatları Getir',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-user"></i> Baro Sicil No</div><input type="text" id="f-tbsicil" placeholder="Sicil numaranız…"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-filter"></i> Filtre</div><div class="sw"><select id="f-tbfil"><option>Tüm tebligatlar</option><option>Okunmamış</option><option>Son 7 gün</option><option>Son 30 gün</option></select></div></div>
      <div class="ic"><div class="ic-t"><i class="fa-solid fa-robot"></i> Akıllı Bağlama</div><p>Tebligat tarihi Süre & Takvim modülüne otomatik aktarılır.</p></div>`,
    prompt: ()=>`Sicil no ${document.getElementById('f-tbsicil')?.value||''} için UYAP elektronik tebligatları listele. Filtre: ${document.getElementById('f-tbfil')?.value||''}. Her tebligat için süre hesabı yap.`
  },
  'uyap-harc':{
    badge:'t', badgeText:'492 Sayılı Harçlar K. · 2026', titleHtml:'Harç <em class="t">Hesapla</em>',
    desc:'2026 tarife ile harç hesaplayın.',
    btnClass:'t', btnIco:'fa-calculator', btnLbl:'Harcı Hesapla',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-gavel"></i> İşlem Türü</div><div class="sw"><select id="f-harctur"><option>Dava açma harcı</option><option>Karar ve ilam harcı</option><option>İstinaf harcı</option><option>Temyiz harcı</option><option>İcra takip harcı</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Dava Değeri (TL)</div><input type="text" id="f-harcval" placeholder="100000"></div>`,
    prompt: ()=>`492 sayılı Harçlar Kanunu 2026 tarifesine göre hesapla: ${document.getElementById('f-harctur')?.value||''}, dava değeri ${document.getElementById('f-harcval')?.value||''} TL. Peşin harç, nispi harç ayrımını göster.`
  },
  kidem:{
    badge:'p', badgeText:'İş K. Md.14 · 2026 Tavanı', titleHtml:'Kıdem <em class="p">Tazminatı</em>',
    desc:'İşe giriş, çıkış ve maaş girin; net kıdem tazminatı hesaplansın.',
    btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-calendar-plus"></i> İşe Giriş</div><input type="text" id="k-giris" placeholder="GG/AA/YYYY" oninput="cKidem()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-calendar-xmark"></i> İşten Çıkış</div><input type="text" id="k-cikis" placeholder="GG/AA/YYYY" oninput="cKidem()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Brüt Aylık Maaş (TL)</div><input type="text" id="k-maas" placeholder="45000" oninput="cKidem()"></div>
      <div class="cr" id="k-res">
        <div class="cr-lbl">Kıdem Tazminatı</div>
        <div class="cr-val" id="k-top">—</div>
        <div class="cr-rows">
          <div class="cr-row"><span>Kıdem süresi</span><span id="k-r1">—</span></div>
          <div class="cr-row"><span>Tavan durumu</span><span id="k-r2">—</span></div>
        </div>
      </div>`,
    prompt: ()=>`Kıdem tazminatı hesaplama sonucu: ${document.getElementById('k-top')?.textContent||''}. Kıdem süresi: ${document.getElementById('k-r1')?.textContent||''}. Hukuki dayanak ve müvekkile açıklama yaz.`
  },
  ihbar:{
    badge:'p', badgeText:'İş K. Md.17', titleHtml:'İhbar <em class="p">Tazminatı</em>',
    desc:'Kıdeme göre ihbar süresi ve tazminatı hesaplayın.',
    btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-calendar-plus"></i> İşe Giriş</div><input type="text" id="i-giris" placeholder="GG/AA/YYYY" oninput="cIhbar()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-calendar-xmark"></i> Çıkış</div><input type="text" id="i-cikis" placeholder="GG/AA/YYYY" oninput="cIhbar()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Brüt Günlük Ücret (TL)</div><input type="text" id="i-gun" placeholder="1500" oninput="cIhbar()"></div>
      <div class="cr" id="i-res">
        <div class="cr-lbl">İhbar Tazminatı</div>
        <div class="cr-val" id="i-top">—</div>
        <div class="cr-rows">
          <div class="cr-row"><span>Yasal ihbar süresi</span><span id="i-r1">—</span></div>
          <div class="cr-row"><span>Hesap</span><span id="i-r2">—</span></div>
        </div>
      </div>`,
    prompt: ()=>`İhbar tazminatı hesaplama sonucu: ${document.getElementById('i-top')?.textContent||''}. Yasal süre: ${document.getElementById('i-r1')?.textContent||''}. Hukuki açıklama yaz.`
  },
  faiz:{
    badge:'p', badgeText:'TBK Md.88 · TCMB Oranları', titleHtml:'Yasal <em class="p">Faiz</em>',
    desc:'Alacak ve tarih aralığı girin; işlemiş faiz hesaplansın.',
    btnClass:'p', btnIco:'fa-calculator', btnLbl:'Faiz Hesapla',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Asıl Alacak (TL)</div><input type="text" id="f-asl" placeholder="100000" oninput="cFaiz()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-calendar-plus"></i> Başlangıç Tarihi</div><input type="text" id="f-bas" placeholder="GG/AA/YYYY" oninput="cFaiz()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-percent"></i> Faiz Türü</div><div class="sw"><select id="f-ftur" onchange="cFaiz()"><option value="9">Yasal — %9</option><option value="19.5">Ticari — %19.5</option></select></div></div>
      <div class="cr" id="f-res">
        <div class="cr-lbl">Hesaplanan Faiz</div>
        <div class="cr-val" id="f-top">—</div>
        <div class="cr-rows">
          <div class="cr-row"><span>Süre</span><span id="f-r1">—</span></div>
          <div class="cr-row"><span>Asıl + Faiz</span><span id="f-r2">—</span></div>
        </div>
      </div>`,
    prompt: ()=>`Yasal faiz hesaplama sonucu: ${document.getElementById('f-top')?.textContent||''}. Toplam: ${document.getElementById('f-r2')?.textContent||''}. Hukuki dayanak açıkla.`
  },
  nafaka:{
    badge:'p', badgeText:'TMK Md.169/175/182', titleHtml:'Nafaka <em class="p">Tahmini</em>',
    desc:'Tarafların gelir durumuna göre nafaka tahmini yapın.',
    btnClass:'p', btnIco:'fa-calculator', btnLbl:'Nafaka Tahmini Al',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-layer-group"></i> Nafaka Türü</div><div class="sw"><select id="n-tur"><option>Tedbir Nafakası</option><option>Yoksulluk Nafakası</option><option>İştirak Nafakası</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Talep Eden Net Geliri (TL)</div><input type="text" id="n-tal" placeholder="15000"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Karşı Taraf Net Geliri (TL)</div><input type="text" id="n-kar" placeholder="45000"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-children"></i> Çocuk Sayısı</div><input type="text" id="n-coc" placeholder="1"></div>
      <div class="ic"><div class="ic-t"><i class="fa-solid fa-triangle-exclamation"></i> Not</div><p>Bu tahmin rehber niteliğindedir. Hâkim somut koşulları değerlendirir.</p></div>`,
    prompt: ()=>`${document.getElementById('n-tur')?.value||''} tahmini. Talep eden geliri: ${document.getElementById('n-tal')?.value||''} TL, karşı taraf: ${document.getElementById('n-kar')?.value||''} TL, çocuk sayısı: ${document.getElementById('n-coc')?.value||'0'}. TMK hükümlerine ve Yargıtay içtihatlarına göre değerlendir.`
  },
  mesai:{badge:'p',badgeText:'İş K. Md.41',titleHtml:'Fazla <em class="p">Mesai</em>',desc:'Fazla çalışma saatlerini girin; zamlı ücret hesaplansın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Brüt Saatlik Ücret (TL)</div><input type="text" id="ms-s" placeholder="188" oninput="cMesai()"></div><div class="fg"><div class="fl">Haftalık Fazla Saat</div><input type="text" id="ms-h" placeholder="10" oninput="cMesai()"></div><div class="fg"><div class="fl">Kaç Ay</div><input type="text" id="ms-a" placeholder="12" oninput="cMesai()"></div><div class="fg"><div class="fl">Zam Oranı</div><div class="sw"><select id="ms-o" onchange="cMesai()"><option value="1.5">%50 — Hafta içi</option><option value="2">%100 — Tatil</option></select></div></div><div class="cr" id="ms-res"><div class="cr-lbl">Fazla Mesai Alacağı</div><div class="cr-val" id="ms-top">—</div><div class="cr-rows"><div class="cr-row"><span>Toplam saat</span><span id="ms-r1">—</span></div></div></div>`,prompt:()=>`Fazla mesai alacağı: ${document.getElementById('ms-top')?.textContent||''}. Hukuki açıklama yaz.`},
  izin:{badge:'p',badgeText:'İş K. Md.53',titleHtml:'Yıllık <em class="p">İzin</em>',desc:'Kıdeme göre yıllık izin hakkını hesaplayın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">İşe Giriş</div><input type="text" id="iz-g" placeholder="GG/AA/YYYY" oninput="cIzin()"></div><div class="fg"><div class="fl">Yaş</div><input type="text" id="iz-y" placeholder="35" oninput="cIzin()"></div><div class="fg"><div class="fl">Kullanılan İzin (gün)</div><input type="text" id="iz-k" placeholder="0" oninput="cIzin()"></div><div class="cr" id="iz-res"><div class="cr-lbl">İzin Hakkı</div><div class="cr-val" id="iz-top">—</div><div class="cr-rows"><div class="cr-row"><span>Yasal hak</span><span id="iz-r1">—</span></div><div class="cr-row"><span>Kullanılmamış</span><span id="iz-r2">—</span></div></div></div>`,prompt:()=>`Yıllık izin hakkı hesaplama: ${document.getElementById('iz-top')?.textContent||''}. Hukuki dayanak açıkla.`},
  gecikme:{badge:'p',badgeText:'TBK Md.120 · Temerrüt',titleHtml:'Gecikme <em class="p">Faizi</em>',desc:'Temerrüt tarihinden itibaren gecikme faizi hesaplayın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Borç Miktarı (TL)</div><input type="text" id="gf-b" placeholder="50000" oninput="cGecikme()"></div><div class="fg"><div class="fl">Temerrüt Tarihi</div><input type="text" id="gf-t" placeholder="GG/AA/YYYY" oninput="cGecikme()"></div><div class="fg"><div class="fl">Tür</div><div class="sw"><select id="gf-o" onchange="cGecikme()"><option value="9">Yasal %9</option><option value="19.5">Ticari %19.5</option></select></div></div><div class="cr" id="gf-res"><div class="cr-lbl">Gecikme Faizi</div><div class="cr-val" id="gf-top">—</div><div class="cr-rows"><div class="cr-row"><span>Süre</span><span id="gf-r1">—</span></div><div class="cr-row"><span>Toplam</span><span id="gf-r2">—</span></div></div></div>`,prompt:()=>`Gecikme faizi: ${document.getElementById('gf-top')?.textContent||''}. Toplam borç+faiz: ${document.getElementById('gf-r2')?.textContent||''}.`},
  kira:{badge:'p',badgeText:'TBK Md.344',titleHtml:'Kira Artış <em class="p">Hesabı</em>',desc:'TÜFE oranıyla yasal azami kira artışını hesaplayın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Mevcut Kira (TL/ay)</div><input type="text" id="ka-k" placeholder="15000" oninput="cKira()"></div><div class="fg"><div class="fl">TÜFE Oranı (%)</div><input type="text" id="ka-t" placeholder="48.5" oninput="cKira()"></div><div class="cr" id="ka-res"><div class="cr-lbl">Yeni Azami Kira</div><div class="cr-val" id="ka-top">—</div><div class="cr-rows"><div class="cr-row"><span>Artış miktarı</span><span id="ka-r1">—</span></div></div></div>`,prompt:()=>`Kira artış hesabı: mevcut ${document.getElementById('ka-k')?.value||''}TL, yeni azami: ${document.getElementById('ka-top')?.textContent||''}. TBK 344 açıkla.`},
  malpay:{badge:'p',badgeText:'TMK Md.218-241',titleHtml:'Mal <em class="p">Paylaşımı</em>',desc:'Edinilmiş mallara katılma alacağını hesaplayın.',btnClass:'p',btnIco:'fa-scale-unbalanced-flip',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Evlilik Tarihi</div><input type="text" id="mp-g" placeholder="GG/AA/YYYY"></div><div class="fg"><div class="fl">Bitiş Tarihi</div><input type="text" id="mp-b" placeholder="GG/AA/YYYY"></div><div class="fg"><div class="fl">Taraf A Edinilmiş Mallar (TL)</div><input type="text" id="mp-a" placeholder="500000"></div><div class="fg"><div class="fl">Taraf B Edinilmiş Mallar (TL)</div><input type="text" id="mp-b2" placeholder="200000"></div><div class="ic"><div class="ic-t"><i class="fa-solid fa-triangle-exclamation"></i> Not</div><p>Kişisel mallar (miras, bağış) dahil edilmez.</p></div>`,prompt:()=>`TMK Md.218-241 edinilmiş mallara katılma: Taraf A: ${document.getElementById('mp-a')?.value||''} TL, Taraf B: ${document.getElementById('mp-b2')?.value||''} TL. Katılma alacağını hesapla ve açıkla.`},
  icra:{badge:'p',badgeText:'İİK · 2026 Tarife',titleHtml:'İcra <em class="p">Masrafları</em>',desc:'Takip türüne göre icra masraflarını hesaplayın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Takip Türü</div><div class="sw"><select id="ic-t"><option>İlamsız icra</option><option>İlamlı icra</option><option>Kambiyo senedi</option></select></div></div><div class="fg"><div class="fl">Alacak Miktarı (TL)</div><input type="text" id="ic-a" placeholder="75000"></div>`,prompt:()=>`İİK 2026 tarife: ${document.getElementById('ic-t')?.value||''}, alacak ${document.getElementById('ic-a')?.value||''} TL. Toplam icra masrafları ve harçları hesapla.`},
  za:{badge:'p',badgeText:'TBK · TCK · İdare',titleHtml:'Zamanaşımı <em class="p">Takvimi</em>',desc:'Olay tarihini girin; zamanaşımı dolum tarihini öğrenin.',btnClass:'p',btnIco:'fa-hourglass-half',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Hukuki Konu</div><div class="sw"><select id="za-t"><option value="10">Genel alacak — 10 yıl</option><option value="5">Kıdem/Fazla mesai — 5 yıl</option><option value="5">Kira alacağı — 5 yıl</option><option value="2">Haksız fiil — 2/10 yıl</option><option value="3">Tüketici — 3 yıl</option><option value="0.164">İdari dava — 60 gün</option></select></div></div><div class="fg"><div class="fl">Hakkın Doğduğu Tarih</div><input type="text" id="za-d" placeholder="GG/AA/YYYY" oninput="cZa()"></div><div class="cr" id="za-res"><div class="cr-lbl">Zamanaşımı Dolum Tarihi</div><div class="cr-val" id="za-top" style="font-size:19px">—</div><div class="cr-rows"><div class="cr-row"><span>Kalan süre</span><span id="za-r1" style="color:var(--warn)">—</span></div></div></div>`,prompt:()=>`Zamanaşımı takvimi: dolum tarihi ${document.getElementById('za-top')?.textContent||''}. Kalan: ${document.getElementById('za-r1')?.textContent||''}. Hukuki öneri ver.`},
  plan:{badge:'g',badgeText:'Abonelik',titleHtml:'Planım &amp; <em class="g">Abonelik</em>',desc:'Mevcut planınızı görüntüleyin ve yönetin.',btnClass:'g',btnIco:'fa-star',btnLbl:'Planı Yönet',body:`<div style="background:var(--gold-lo);border:1px solid var(--gold-rule);border-radius:var(--r);padding:16px;margin-bottom:12px;"><div style="font-family:'Instrument Serif',serif;font-size:18px;color:var(--gold);margin-bottom:4px;">Pro Plan</div><div style="font-size:12px;color:var(--t2);">Tüm modüller · Sınırsız kullanım · Öncelikli destek</div><div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--t0);margin-top:8px;">₺2.490 / ay</div></div><div class="fg"><div class="fl">Kullanım Bu Ay</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:12px;text-align:center;"><div style="font-family:'JetBrains Mono',monospace;font-size:18px;color:var(--t0);">—</div><div style="font-size:10px;color:var(--t3);margin-top:3px;">Dilekçe</div></div><div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:12px;text-align:center;"><div style="font-family:'JetBrains Mono',monospace;font-size:18px;color:var(--t0);">—</div><div style="font-size:10px;color:var(--t3);margin-top:3px;">Analiz</div></div></div>`,prompt:()=>'Pro plan özellikleri ve avantajları hakkında bilgi ver.'},
  faturalar:{badge:'g',badgeText:'Fatura Geçmişi',titleHtml:'Fatura <em class="g">Geçmişi</em>',desc:'Geçmiş ödemelerinizi görüntüleyin.',btnClass:'g',btnIco:'fa-file-invoice',btnLbl:'Faturaları Getir',body:`<div class="fg"><div class="fl">Dönem</div><div class="sw"><select><option>Son 3 ay</option><option>Son 6 ay</option><option>Bu yıl</option></select></div></div>`,prompt:()=>'Fatura geçmişi ve abonelik ödeme özeti.'},
  profil:{badge:'g',badgeText:'Hesap Bilgileri',titleHtml:'Profil <em class="g">Bilgileri</em>',desc:'Hesap bilgilerinizi güncelleyin.',btnClass:'g',btnIco:'fa-floppy-disk',btnLbl:'Kaydet',body:`<div class="fg"><div class="fl">Ad Soyad</div><input type="text" placeholder="Av. Ad Soyad"></div><div class="fg"><div class="fl">Baro Sicil No</div><input type="text" placeholder="İstanbul Barosu — ____"></div><div class="fg"><div class="fl">E-posta</div><input type="text" placeholder="av@ornek.com"></div>`,prompt:()=>'Profil güncelleme talebi.'},
  guvenlik:{badge:'g',badgeText:'Güvenlik',titleHtml:'Güvenlik &amp; <em class="g">Şifre</em>',desc:'Şifrenizi değiştirin ve 2FA ayarlayın.',btnClass:'g',btnIco:'fa-shield-halved',btnLbl:'Güncelle',body:`<div class="fg"><div class="fl">Mevcut Şifre</div><input type="text" placeholder="••••••••"></div><div class="fg"><div class="fl">Yeni Şifre</div><input type="text" placeholder="••••••••"></div>`,prompt:()=>'Güvenlik ayarları güncelleme.'},
  bildirim:{badge:'g',badgeText:'Bildirimler',titleHtml:'Bildirim <em class="g">Ayarları</em>',desc:'Hangi bildirimleri almak istediğinizi seçin.',btnClass:'g',btnIco:'fa-bell',btnLbl:'Kaydet',body:`<div class="cl"><div class="cl-head"><i class="fa-solid fa-bell"></i> Bildirim Tercihleri</div><div class="cl-item"><div class="cl-dot"><i class="fa-solid fa-check"></i></div><span>Süre uyarıları (3 gün öncesi)</span></div><div class="cl-item"><div class="cl-dot"><i class="fa-solid fa-check"></i></div><span>Yeni tebligat bildirimleri</span></div><div class="cl-item"><div class="cl-dot"><i class="fa-solid fa-check"></i></div><span>Fatura hatırlatmaları</span></div></div>`,prompt:()=>'Bildirim ayarları güncellendi.'},
};

// ── STATE ──
let currentModule = '';
let currentPopup = '';
const chatHistory = [];

// ── NAV ──
function openModule(mod) {
  currentModule = mod;
  const cfg = MODULES[mod];
  document.getElementById('appModuleName').innerHTML = cfg.label;
  document.getElementById('sidebarLabel').innerHTML = cfg.label;
  document.getElementById('sidebarName').innerHTML = cfg.nameHtml;
  // Build sidebar
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = cfg.items.map(item => `
    <div class="s-item" id="si-${item.id}" onclick="openPopup('${item.id}')">
      <span class="ico"><i class="fa-solid ${item.icon}"></i></span>
      ${item.name}
      ${item.badge ? `<span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:9px;padding:1px 5px;border-radius:10px;background:var(--bg2);color:var(--t3);">${item.badge}</span>` : ''}
    </div>`).join('');
  // Show app screen
  document.getElementById('appScreen').classList.add('active');
  document.getElementById('homeScreen').classList.add('hidden');
  // Auto-open first item
  setTimeout(()=>openPopup(cfg.items[0].id), 250);
}

function goHome() {
  document.getElementById('appScreen').classList.remove('active');
  document.getElementById('homeScreen').classList.remove('hidden');
  closePopup();
}

// ── POPUP / TOOL PANEL ──
function openPopup(id) {
  // Update sidebar active state
  document.querySelectorAll('.s-item').forEach(el => {
    el.classList.remove('active-g','active-b','active-t','active-p');
  });
  const si = document.getElementById('si-'+id);
  if(si) {
    const c = MODULES[currentModule]?.color || 'g';
    si.classList.add('active-'+c);
  }

  const cfg = POPUPS[id];
  if(!cfg) return;
  currentPopup = id;

  // Update breadcrumb
  const name = MODULES[currentModule]?.items.find(i=>i.id===id)?.name || id;
  document.getElementById('appItemName').textContent = name;

  // Update middle tool panel
  const badge = document.getElementById('popBadge');
  badge.className = 'pop-badge '+cfg.badge;
  badge.innerHTML = `<span>${cfg.badgeText}</span>`;
  document.getElementById('popTitle').innerHTML = cfg.titleHtml;
  document.getElementById('popDesc').textContent = cfg.desc;
  document.getElementById('popBody').innerHTML = cfg.body;
  document.getElementById('popBtn').className = 'pop-cta-btn '+cfg.btnClass;
  document.getElementById('popBtnIco').className = 'fa-solid '+cfg.btnIco;
  document.getElementById('popBtnLbl').textContent = cfg.btnLbl;
}

function closePopup() {
  // no-op — panel is always visible
}

function submitPopup() {
  const cfg = POPUPS[currentPopup];
  if(!cfg) return;
  let prompt = '';
  try { prompt = cfg.prompt(); } catch(e) { prompt = cfg.btnLbl + ' isteği'; }
  closePopup();
  toast('Talya AI\'ya iletildi', 'fa-solid fa-paper-plane', true);
  setTimeout(()=>sendQ(prompt), 100);
}

// ── CHAT ──
function fmt(n){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(n);}
function pDate(s){if(!s)return null;const p=s.split('/');if(p.length!==3)return null;return new Date(+p[2],+p[1]-1,+p[0]);}
function daysBetween(d1,d2){return Math.floor((d2-d1)/(86400000));}

function cKidem(){
  const g=pDate(document.getElementById('k-giris')?.value);
  const c=pDate(document.getElementById('k-cikis')?.value);
  const m=parseFloat((document.getElementById('k-maas')?.value||'0').replace(/\D/g,''));
  if(!g||!c||!m)return;
  const days=daysBetween(g,c);const yil=days/365;
  const tavan=41660;const baz=Math.min(m,tavan);
  const net=baz*yil;
  document.getElementById('k-res').style.display='block';
  document.getElementById('k-top').textContent=fmt(net);
  document.getElementById('k-r1').textContent=Math.floor(yil)+' yıl '+Math.floor((yil%1)*12)+' ay';
  document.getElementById('k-r2').textContent=m>tavan?'Tavan uygulandı':'Tavan aşılmadı';
}
function cIhbar(){
  const g=pDate(document.getElementById('i-giris')?.value);
  const c=pDate(document.getElementById('i-cikis')?.value);
  const gun=parseFloat((document.getElementById('i-gun')?.value||'0').replace(/\D/g,''));
  if(!g||!c||!gun)return;
  const yil=Math.floor(daysBetween(g,c)/365);
  const sure=yil<6?2:yil<18?4:yil<36?6:8;
  const net=gun*sure*7;
  document.getElementById('i-res').style.display='block';
  document.getElementById('i-top').textContent=fmt(net);
  document.getElementById('i-r1').textContent=sure+' hafta ('+sure*7+' gün)';
  document.getElementById('i-r2').textContent=sure*7+' × '+fmt(gun);
}
function cFaiz(){
  const a=parseFloat((document.getElementById('f-asl')?.value||'0').replace(/\D/g,''));
  const b=pDate(document.getElementById('f-bas')?.value);
  const o=parseFloat(document.getElementById('f-ftur')?.value||'9');
  if(!a||!b)return;
  const gun=daysBetween(b,new Date());
  const fz=a*(o/100)*(gun/365);
  document.getElementById('f-res').style.display='block';
  document.getElementById('f-top').textContent=fmt(fz);
  document.getElementById('f-r1').textContent=gun+' gün';
  document.getElementById('f-r2').textContent=fmt(a+fz);
}
function cMesai(){
  const s=parseFloat(document.getElementById('ms-s')?.value||'0');
  const h=parseFloat(document.getElementById('ms-h')?.value||'0');
  const a=parseFloat(document.getElementById('ms-a')?.value||'0');
  const o=parseFloat(document.getElementById('ms-o')?.value||'1.5');
  if(!s||!h||!a)return;
  const ts=h*4.33*a;const net=ts*s*o;
  document.getElementById('ms-res').style.display='block';
  document.getElementById('ms-top').textContent=fmt(net);
  document.getElementById('ms-r1').textContent=Math.round(ts)+' saat';
}
function cIzin(){
  const g=pDate(document.getElementById('iz-g')?.value);
  const y=parseInt(document.getElementById('iz-y')?.value||'0');
  const k=parseInt(document.getElementById('iz-k')?.value||'0');
  if(!g||!y)return;
  const yil=Math.floor(daysBetween(g,new Date())/365);
  let hak=yil<5?14:yil<15?20:26;
  if(y<18||y>=50)hak=Math.max(hak,20);
  document.getElementById('iz-res').style.display='block';
  document.getElementById('iz-top').textContent=(hak-k)+' gün kullanılmamış';
  document.getElementById('iz-r1').textContent=hak+' gün/yıl';
  document.getElementById('iz-r2').textContent=(hak-k)+' gün';
}
function cGecikme(){
  const b=parseFloat((document.getElementById('gf-b')?.value||'0').replace(/\D/g,''));
  const t=pDate(document.getElementById('gf-t')?.value);
  const o=parseFloat(document.getElementById('gf-o')?.value||'9');
  if(!b||!t)return;
  const gun=daysBetween(t,new Date());
  const fz=b*(o/100)*(gun/365);
  document.getElementById('gf-res').style.display='block';
  document.getElementById('gf-top').textContent=fmt(fz);
  document.getElementById('gf-r1').textContent=gun+' gün';
  document.getElementById('gf-r2').textContent=fmt(b+fz);
}
function cKira(){
  const k=parseFloat((document.getElementById('ka-k')?.value||'0').replace(/\D/g,''));
  const t=parseFloat(document.getElementById('ka-t')?.value||'0');
  if(!k||!t)return;
  const artis=k*(t/100);
  document.getElementById('ka-res').style.display='block';
  document.getElementById('ka-top').textContent=fmt(k+artis)+'/ay';
  document.getElementById('ka-r1').textContent=fmt(artis);
}
function cZa(){
  const t=pDate(document.getElementById('za-d')?.value);
  const sur=parseFloat(document.getElementById('za-t')?.value||'10');
  if(!t)return;
  const bit=new Date(t);
  bit.setFullYear(bit.getFullYear()+Math.floor(sur));
  if(sur%1)bit.setDate(bit.getDate()+Math.round((sur%1)*365));
  const kal=daysBetween(new Date(),bit);
  document.getElementById('za-res').style.display='block';
  document.getElementById('za-top').textContent=bit.toLocaleDateString('tr-TR');
  const r=document.getElementById('za-r1');
  r.textContent=kal>0?kal+' gün kaldı':'⚠️ SÜRE DOLDU';
  r.style.color=kal<=0?'var(--danger)':kal<=90?'var(--warn)':'var(--success)';
}

// ── NOTIFICATIONS ──
const NOTIFS = [
  {id:1, type:'sure', ico:'fa-hourglass-half', level:'danger', label:'Kritik Süre', text:'Temyiz süresi dolmak üzere — Yılmaz / Devlet Hastanesi (2024/4521)', time:'2 saat önce', read:false},
  {id:2, type:'tebligat', ico:'fa-envelope-open-text', level:'warn', label:'Yeni Tebligat', text:'UYAP\'tan 2 yeni elektronik tebligat alındı, inceleme bekliyor.', time:'3 saat önce', read:false},
  {id:3, type:'ai', ico:'fa-microchip', level:'info', label:'AI Önerisi', text:'Kira artış hesabında TÜFE oranı güncellendi — yeniden hesaplama önerilir.', time:'5 saat önce', read:false},
  {id:4, type:'sure', ico:'fa-calendar-xmark', level:'warn', label:'Süre Uyarısı', text:'İstinaf başvurusu için son 3 gün — Koç Ltd. davası (2024/887)', time:'Dün', read:true},
  {id:5, type:'sistem', ico:'fa-circle-info', level:'success', label:'Sistem', text:'Talya v2.1 güncellendi — yeni özellikler: sözleşme şablon kütüphanesi genişletildi.', time:'2 gün önce', read:true},
  {id:6, type:'tebligat', ico:'fa-paper-plane', level:'success', label:'Tebligat Gönderildi', text:'Alioğlu / Merkez AŞ dosyasına ihtarname başarıyla UYAP\'a iletildi.', time:'3 gün önce', read:true},
];

let notifPrefs = {sure:true, tebligat:true, ai:true, sistem:false};
let activeFilter = 'all';

function getVisibleNotifs(){
  return NOTIFS.filter(n => {
    if(!notifPrefs[n.type]) return false;
    if(activeFilter !== 'all' && n.type !== activeFilter) return false;
    return true;
  });
}

function renderNotifs(){
  const list = document.getElementById('ndList');
  const visible = getVisibleNotifs();
  if(!visible.length){
    list.innerHTML = `<div class="nd-empty"><i class="fa-solid fa-bell-slash"></i>Bildirim yok</div>`;
  } else {
    list.innerHTML = visible.map(n => `
      <div class="nd-item ${n.read?'':'unread'}" onclick="readNotif(${n.id})">
        <div class="nd-dot ${n.read?'read':n.level}"></div>
        <div class="nd-ico ${n.level}"><i class="fa-solid ${n.ico}"></i></div>
        <div class="nd-content">
          <div class="nd-label">${n.label}</div>
          <div class="nd-text">${n.text}</div>
          <div class="nd-time">${n.time}</div>
        </div>
      </div>`).join('');
  }
  // sync home list too
  const listHome = document.getElementById('ndListHome');
  if(listHome) listHome.innerHTML = list.innerHTML;
  updateBadge();
}

function updateBadge(){
  const unread = NOTIFS.filter(n => !n.read && notifPrefs[n.type]).length;
  ['notifBadge','notifBadgeHome'].forEach(id=>{
    const badge = document.getElementById(id);
    if(!badge) return;
    if(unread > 0){ badge.textContent = unread; badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); }
  });
}

function readNotif(id){
  const n = NOTIFS.find(n=>n.id===id);
  if(n) n.read = true;
  renderNotifs();
}

function markAllRead(){
  NOTIFS.forEach(n=>n.read=true);
  renderNotifs();
  toast('Tüm bildirimler okundu işaretlendi', 'fa-solid fa-check-double');
}

function filterNotif(el, filter){
  activeFilter = filter;
  document.querySelectorAll('.nd-chip').forEach(c=>{
    c.className = 'nd-chip';
    if(c.dataset.filter === filter){
      if(filter==='sure') c.classList.add('active-danger');
      else if(filter==='tebligat') c.classList.add('active-blue');
      else if(filter==='ai') c.classList.add('active-teal');
      else c.classList.add('active');
    }
  });
  renderNotifs();
}

function saveNotifPref(type, val){
  notifPrefs[type] = val;
  renderNotifs();
}

function toggleNotif(e){
  e.stopPropagation();
  const dd = document.getElementById('notifDropdown');
  const isOpen = dd.classList.contains('open');
  document.getElementById('notifDropdownHome').classList.remove('open');
  dd.classList.toggle('open');
  if(!isOpen) renderNotifs();
}

function toggleNotifHome(e){
  e.stopPropagation();
  const dd = document.getElementById('notifDropdownHome');
  const isOpen = dd.classList.contains('open');
  document.getElementById('notifDropdown').classList.remove('open');
  dd.classList.toggle('open');
  if(!isOpen) renderNotifs();
}

function filterNotifHome(el, filter){
  activeFilter = filter;
  document.querySelectorAll('#ndFilterHome .nd-chip').forEach(c=>{
    c.className = 'nd-chip';
    if(c.dataset.filter === filter){
      if(filter==='sure') c.classList.add('active-danger');
      else if(filter==='tebligat') c.classList.add('active-blue');
      else if(filter==='ai') c.classList.add('active-teal');
      else c.classList.add('active');
    }
  });
  renderNotifs();
}

document.addEventListener('click', e=>{
  document.querySelectorAll('.notif-wrap').forEach(wrap=>{
    const dd = wrap.querySelector('.notif-dropdown');
    if(!wrap.contains(e.target) && dd) dd.classList.remove('open');
  });
});

// ── DARK MODE ──
function toggleDark(){
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
  const icon = isDark ? 'fa-moon' : 'fa-sun';
  document.getElementById('dmIconHome').className = 'fa-solid ' + icon;
  document.getElementById('dmIconApp').className = 'fa-solid ' + icon;
  localStorage.setItem('talya-theme', isDark ? '' : 'dark');
}
// Restore saved theme
(function(){
  const saved = localStorage.getItem('talya-theme');
  if(saved === 'dark'){
    document.documentElement.setAttribute('data-theme','dark');
    document.getElementById('dmIconHome').className = 'fa-solid fa-sun';
    document.getElementById('dmIconApp').className = 'fa-solid fa-sun';
  }
})();

function autoH(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}
function ckEnter(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}

function appendMsg(role, text) {
  const empty = document.getElementById('chatEmpty');
  if(empty) empty.style.display='none';
  const msgs = document.getElementById('chatMsgs');
  const div = document.createElement('div');
  div.className='msg '+role;
  const ico = role==='ai'?'fa-microchip':'fa-user-tie';
  const actions = role==='ai' ? `<div class="msg-actions">
      <span class="msg-act-btn" onclick="copyMsg(this)"><i class="fa-solid fa-copy"></i> Kopyala</span>
      <span class="msg-act-btn" onclick="toast('Belge indirildi','fa-solid fa-download')"><i class="fa-solid fa-download"></i> İndir</span>
    </div>` : '';
  div.innerHTML=`<div class="msg-av"><i class="fa-solid ${ico}"></i></div><div class="msg-bbl">${text}${actions}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}

function copyMsg(btn){
  const bbl = btn.closest('.msg-bbl');
  const clone = bbl.cloneNode(true);
  clone.querySelector('.msg-actions')?.remove();
  navigator.clipboard?.writeText(clone.innerText).then(()=>toast('Panoya kopyalandı','fa-solid fa-check'));
}

function showTyping(){
  const empty=document.getElementById('chatEmpty');
  if(empty)empty.style.display='none';
  const msgs=document.getElementById('chatMsgs');
  const div=document.createElement('div');
  div.className='msg ai';div.id='typing';
  div.innerHTML=`<div class="msg-av"><i class="fa-solid fa-microchip"></i></div><div class="msg-bbl"><span class="tdot"></span><span class="tdot"></span><span class="tdot"></span></div>`;
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function removeTyping(){const t=document.getElementById('typing');if(t)t.remove();}

function fmtAI(t){
  return t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/^### (.+)$/gm,'<strong style="color:var(--gold)">$1</strong>')
    .replace(/^## (.+)$/gm,'<strong style="font-size:14px;color:var(--gold)">$1</strong>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)+/g,'<ul>$&</ul>')
    .replace(/\n\n/g,'</p><p>').replace(/^(?!<)(.+)$/gm,'<p>$1</p>').replace(/<p><\/p>/g,'').trim();
}

async function sendQ(text){
  document.getElementById('chatIn').value=text;
  await sendChat();
}

async function sendChat(){
  const inp=document.getElementById('chatIn');
  const text=inp.value.trim();
  if(!text)return;
  inp.value='';inp.style.height='auto';
  appendMsg('user',text.replace(/</g,'&lt;').replace(/>/g,'&gt;'));
  chatHistory.push({role:'user',content:text});
  const btn=document.getElementById('sendBtn');
  btn.disabled=true;showTyping();
  try{
    const res=await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ message: text })
    });
    const data=await res.json();
    removeTyping();
    if(!res.ok){
      appendMsg('ai','<span style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> '+(data.error||'Bir hata oluştu.')+'</span>');
      btn.disabled=false;return;
    }
    const reply=data.reply||'Bir hata oluştu, tekrar deneyin.';
    chatHistory.push({role:'assistant',content:reply});
    appendMsg('ai',fmtAI(reply));
  }catch(e){
    removeTyping();
    appendMsg('ai','<span style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> Bağlantı hatası. Lütfen tekrar deneyin.</span>');
  }
  btn.disabled=false;
}

// ── TOASTS ──
function toast(text, ico, gold){
  const stack = document.getElementById('toastStack');
  if(!stack) return;
  const el = document.createElement('div');
  el.className = 'toast'+(gold?' gold':'');
  el.innerHTML = `<div class="tico"><i class="${ico||'fa-solid fa-check'}"></i></div><span>${text}</span>`;
  stack.appendChild(el);
  setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(), 200); }, 3200);
}

// ── HERO COUNT-UP ──
function runCountUp(){
  document.querySelectorAll('.count-up').forEach(el=>{
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    function step(now){
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString('tr-TR') + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
  document.querySelectorAll('.dbar-fill').forEach(el=>{
    requestAnimationFrame(()=>{ el.style.width = el.dataset.w + '%'; });
  });
}

// ── HOME DASHBOARD: UPCOMING DEADLINES ──
function renderDashDeadlines(){
  const wrap = document.getElementById('dashDeadlines');
  if(!wrap) return;
  const deadlines = [
    {tag:'2 GÜN', level:'crit', text:'Temyiz süresi — Yılmaz / Devlet Hastanesi (2024/4521)', days:'2 gün kaldı'},
    {tag:'5 GÜN', level:'warn', text:'İstinaf başvurusu — Koç Ltd. davası (2024/887)', days:'5 gün kaldı'},
    {tag:'12 GÜN', level:'warn', text:'Cevap dilekçesi süresi — Alioğlu / Merkez AŞ', days:'12 gün kaldı'},
  ];
  wrap.innerHTML = deadlines.map(d=>`
    <div class="dl-row">
      <span class="dl-tag ${d.level}">${d.tag}</span>
      <span class="dl-text">${d.text}</span>
      <span class="dl-days">${d.days}</span>
    </div>`).join('');
}

// ── COMMAND PALETTE ──
let cmdkItems = [];
let cmdkSel = 0;
function buildCmdkItems(){
  cmdkItems = [];
  Object.entries(MODULES).forEach(([modId, mod])=>{
    mod.items.forEach(item=>{
      cmdkItems.push({modId, modLabel:mod.label, id:item.id, name:item.name, icon:item.icon});
    });
  });
}
function openCmdk(){
  if(!cmdkItems.length) buildCmdkItems();
  document.getElementById('cmdkScrim').classList.add('open');
  const inp = document.getElementById('cmdkInput');
  inp.value = '';
  cmdkSel = 0;
  cmdkRenderList(cmdkItems);
  setTimeout(()=>inp.focus(), 30);
}
function closeCmdk(){
  document.getElementById('cmdkScrim').classList.remove('open');
}
function cmdkFilter(){
  const q = document.getElementById('cmdkInput').value.trim().toLowerCase();
  const filtered = q ? cmdkItems.filter(i => i.name.toLowerCase().includes(q) || i.modLabel.toLowerCase().includes(q)) : cmdkItems;
  cmdkSel = 0;
  cmdkRenderList(filtered);
}
function cmdkRenderList(list){
  const el = document.getElementById('cmdkList');
  if(!list.length){
    el.innerHTML = `<div class="cmdk-empty"><i class="fa-solid fa-magnifying-glass" style="display:block;margin-bottom:8px;opacity:.4;"></i>Sonuç bulunamadı</div>`;
    return;
  }
  let lastMod = '';
  let html = '';
  list.forEach((item, idx)=>{
    if(item.modLabel !== lastMod){
      html += `<div class="cmdk-group-lbl">${item.modLabel}</div>`;
      lastMod = item.modLabel;
    }
    html += `<div class="cmdk-item ${idx===cmdkSel?'sel':''}" data-idx="${idx}" onclick="cmdkChoose('${item.modId}','${item.id}')">
      <span class="cico"><i class="fa-solid ${item.icon}"></i></span>
      <span class="cmdk-item-name">${item.name}</span>
      <span class="cmdk-item-mod">${item.modLabel}</span>
    </div>`;
  });
  el.innerHTML = html;
  el._list = list;
}
function cmdkKey(e){
  const list = document.getElementById('cmdkList')._list || [];
  if(e.key === 'ArrowDown'){ e.preventDefault(); cmdkSel = Math.min(cmdkSel+1, list.length-1); cmdkRenderList(list); cmdkScrollSel(); }
  else if(e.key === 'ArrowUp'){ e.preventDefault(); cmdkSel = Math.max(cmdkSel-1, 0); cmdkRenderList(list); cmdkScrollSel(); }
  else if(e.key === 'Enter'){ e.preventDefault(); const it = list[cmdkSel]; if(it) cmdkChoose(it.modId, it.id); }
  else if(e.key === 'Escape'){ closeCmdk(); }
}
function cmdkScrollSel(){
  const selEl = document.querySelector('.cmdk-item.sel');
  if(selEl) selEl.scrollIntoView({block:'nearest'});
}
function cmdkChoose(modId, itemId){
  closeCmdk();
  openModule(modId);
  setTimeout(()=>openPopup(itemId), 260);
}
document.addEventListener('keydown', e=>{
  if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k'){
    e.preventDefault();
    const scrim = document.getElementById('cmdkScrim');
    scrim.classList.contains('open') ? closeCmdk() : openCmdk();
  }
});

// ── INIT ──
runCountUp();
renderDashDeadlines();
buildCmdkItems();
if (window.__talyaReady) window.__talyaReady();
