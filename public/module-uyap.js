// Bu dosya SADECE 'UYAP Entegrasyonu' modülüne aittir.
// Bu modülü düzenlemek diğer modülleri (buro, uyap, hesap, uyelik) etkilemez.
window.CURRENT_MODULE = {
  key: 'uyap',
  label: 'UYAP Entegrasyonu',
  nameHtml: `UYAP <em class="t">Entegrasyonu</em>`,
  color: 't',
  items: [{"id": "uyap-dilekce", "icon": "fa-paper-plane", "name": "Dilekçe Gönder"}, {"id": "uyap-dosya", "icon": "fa-folder-open", "name": "Dosya Sorgula"}, {"id": "uyap-tebligat", "icon": "fa-envelope-open-text", "name": "Tebligat Takip"}, {"id": "uyap-harc", "icon": "fa-coins", "name": "Harç Hesapla"}, {"id": "eklenti", "icon": "fa-plug", "name": "Eklenti Bağlantısı"}],
  popups: {
  'eklenti':{
    badge:'t', badgeText:'Chrome Eklentisi · Otomatik Aktarım', titleHtml:'Eklenti <em class="t">Bağlantısı</em>',
    desc:'UYAP verilerini otomatik aktarmak için Talya Chrome Eklentisi\'ni bu anahtarla eşleştirin.',
    btnClass:'t', btnIco:'fa-plug', btnLbl:'', hideCta: true,
    body:`<div id="ext-box">Yükleniyor…</div>
      <div class="ic" style="margin-top:14px;"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Nasıl kullanılır</div>
      <p>1) Talya Chrome Eklentisi'ni tarayıcına kur.<br>2) Eklenti simgesine tıkla, bu anahtarı yapıştır.<br>3) UYAP Avukat Portalı'na her girişinde eklenti sessizce senkronize eder — çıkan onay ekranını sen kontrol edip kaydedersin.</p></div>`,
    onOpen: () => extOnOpen(),
    prompt: () => ''
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
  }
  }
};

// ══════════════════════════════════════════════════════
// EKLENTİ BAĞLANTISI — senkronizasyon anahtarı yönetimi
// ══════════════════════════════════════════════════════
async function extOnOpen() {
  const box = document.getElementById('ext-box');
  box.innerHTML = 'Yükleniyor…';
  try {
    const [tokenRes, batchesRes] = await Promise.all([
      fetch('/api/sync-token'),
      fetch('/api/import-batches'),
    ]);
    const tokenData = await tokenRes.json();
    const batchesData = await batchesRes.json();
    extRender(tokenData.syncToken, batchesData.batches || []);
  } catch (e) {
    box.innerHTML = '<div style="color:var(--danger);">Yüklenemedi.</div>';
  }
}

function extRender(token, batches) {
  const box = document.getElementById('ext-box');
  const pendingHtml = batches.length ? `
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:18px 0 8px;"><i class="fa-solid fa-inbox"></i> Bekleyen Aktarımlar (${batches.length})</div>
    ${batches.map(b => {
      const items = Array.isArray(b.items) ? b.items : [];
      return `<div class="s-item" style="margin:0 0 4px;" onclick="window.location.href='/dashboard/uyap-import?batch=${b.id}'">
        <span class="ico"><i class="fa-solid fa-file-import"></i></span>
        ${items.length} kayıt bulundu
        <span style="margin-left:auto;font-size:10px;color:var(--t3);">${new Date(b.createdAt).toLocaleDateString('tr-TR')}</span>
      </div>`;
    }).join('')}
  ` : `<div style="font-size:12px;color:var(--t3);margin-top:16px;">Bekleyen aktarım yok.</div>`;

  if (!token) {
    box.innerHTML = `
      <div style="font-size:12.5px;color:var(--t2);margin-bottom:10px;">Henüz bir senkronizasyon anahtarın yok.</div>
      <button class="pop-cta-btn t" style="width:100%;" onclick="extGenerate()"><i class="fa-solid fa-key"></i><span>Anahtar Oluştur</span></button>
      ${pendingHtml}
    `;
    return;
  }
  box.innerHTML = `
    <div class="fg"><div class="fl">Senkronizasyon Anahtarın</div>
      <div style="display:flex;gap:6px;">
        <input type="text" id="ext-token-val" value="${token}" readonly style="font-family:'JetBrains Mono',monospace;font-size:11px;">
        <button class="pop-cta-btn t" style="padding:8px 12px;flex-shrink:0;" onclick="extCopy()"><i class="fa-solid fa-copy"></i></button>
      </div>
    </div>
    <button class="pop-cta-btn" style="width:100%;background:var(--danger);" onclick="extGenerate()"><i class="fa-solid fa-rotate"></i><span>Anahtarı Yenile (eskisi geçersiz olur)</span></button>
    ${pendingHtml}
  `;
}

async function extGenerate() {
  if (document.getElementById('ext-token-val')) {
    if (!confirm('Yeni anahtar oluşturulursa eski anahtar geçersiz olur, eklentiyi yeniden eşleştirmen gerekir. Devam edilsin mi?')) return;
  }
  const res = await fetch('/api/sync-token', { method: 'POST' });
  const data = await res.json();
  const batchesRes = await fetch('/api/import-batches');
  const batchesData = await batchesRes.json();
  extRender(data.syncToken, batchesData.batches || []);
  toast('Yeni anahtar oluşturuldu', 'fa-solid fa-key', true);
}

function extCopy() {
  const el = document.getElementById('ext-token-val');
  if (!el) return;
  navigator.clipboard?.writeText(el.value).then(() => toast('Anahtar kopyalandı', 'fa-solid fa-check', true));
}
