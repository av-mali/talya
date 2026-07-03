// Bu dosya SADECE 'Büro Yönetimi' modülüne aittir.
// Bu modülü düzenlemek diğer modülleri (buro, uyap, hesap, uyelik) etkilemez.
window.CURRENT_MODULE = {
  key: 'buro',
  label: 'Büro Yönetimi',
  nameHtml: `Büro <em class="b">Yönetimi</em>`,
  color: 'b',
  items: [{"id": "muvekkil", "icon": "fa-users", "name": "Müvekkil Yönetimi"}, {"id": "sure", "icon": "fa-calendar-xmark", "name": "Süre & Takvim", "badge": "3"}, {"id": "arsiv", "icon": "fa-box-archive", "name": "Belge Arşivi"}, {"id": "ucret", "icon": "fa-calculator", "name": "Ücret Hesaplayıcı"}, {"id": "rapor", "icon": "fa-file-circle-check", "name": "Müvekkil Raporu"}, {"id": "fatura", "icon": "fa-receipt", "name": "Fatura & Tahsilat"}],
  popups: {
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
  }
  }
};
