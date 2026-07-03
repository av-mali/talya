// Bu dosya SADECE 'UYAP Entegrasyonu' modülüne aittir.
// Bu modülü düzenlemek diğer modülleri (buro, uyap, hesap, uyelik) etkilemez.
window.CURRENT_MODULE = {
  key: 'uyap',
  label: 'UYAP Entegrasyonu',
  nameHtml: `UYAP <em class="t">Entegrasyonu</em>`,
  color: 't',
  items: [{"id": "uyap-dilekce", "icon": "fa-paper-plane", "name": "Dilekçe Gönder"}, {"id": "uyap-dosya", "icon": "fa-folder-open", "name": "Dosya Sorgula"}, {"id": "uyap-tebligat", "icon": "fa-envelope-open-text", "name": "Tebligat Takip"}, {"id": "uyap-harc", "icon": "fa-coins", "name": "Harç Hesapla"}],
  popups: {
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
  }
  }
};
