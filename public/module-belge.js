// Bu dosya SADECE 'Belge & Analiz' modülüne aittir.
// Bu modülü düzenlemek diğer modülleri (buro, uyap, hesap, uyelik) etkilemez.
window.CURRENT_MODULE = {
  key: 'belge',
  label: 'Belge & Analiz',
  nameHtml: `Belge &amp; <em class="g">Analiz</em>`,
  color: 'g',
  items: [{"id": "wizard", "icon": "fa-scroll", "name": "Dilekçe Sihirbazı"}, {"id": "emsal", "icon": "fa-magnifying-glass-chart", "name": "Emsal Karar Analizi"}, {"id": "dosya", "icon": "fa-file-shield", "name": "Dosya Analizi"}, {"id": "sozlesme", "icon": "fa-file-signature", "name": "Sözleşme İnceleme"}, {"id": "mevzuat", "icon": "fa-book-open-reader", "name": "Mevzuat Arama"}, {"id": "sablon", "icon": "fa-layer-group", "name": "Şablon Kütüphanesi"}, {"id": "risk", "icon": "fa-scale-balanced", "name": "Risk Analizi"}, {"id": "durusma", "icon": "fa-timeline", "name": "Duruşma Hazırlık"}],
  popups: {
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
  }
  }
};
