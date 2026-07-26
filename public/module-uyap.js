// Bu dosya SADECE 'UYAP Entegrasyonu' modülüne aittir.
// Bu modülü düzenlemek diğer modülleri (buro, uyap, hesap, uyelik) etkilemez.
window.CURRENT_MODULE = {
  key: 'uyap',
  label: 'UYAP Entegrasyonu',
  nameHtml: `UYAP <em class="t">Entegrasyonu</em>`,
  color: 'b',
  items: [{"id": "uyap-dilekce", "icon": "fa-paper-plane", "name": "Dilekçe Gönder"}, {"id": "uyap-dosya", "icon": "fa-folder-open", "name": "Dosya Sorgula"}, {"id": "uyap-tebligat", "icon": "fa-envelope-open-text", "name": "Tebligat Takip"}, {"id": "uyap-harc", "icon": "fa-coins", "name": "Harç Hesapla"}, {"id": "eklenti", "icon": "fa-plug", "name": "Eklenti Bağlantısı"}],
  popups: {
  'eklenti':{
    badge:'t', badgeText:'Chrome Eklentisi · Otomatik Aktarım', titleHtml:'Eklenti <em class="t">Bağlantısı</em>',
    desc:'UYAP verilerini otomatik aktarmak için Talya Chrome Eklentisi\'ni bu anahtarla eşleştirin.',
    btnClass:'t', btnIco:'fa-plug', btnLbl:'', hideCta: true,
    body:`<div id="ext-box"></div>
      <div class="ic" style="margin-top:14px;"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Nasıl kullanılır</div>
      <p>1) Talya Chrome Eklentisi'ni tarayıcına kur.<br>2) Eklenti simgesine tıkla, bu anahtarı yapıştır.<br>3) UYAP Avukat Portalı'na her girişinde eklenti sessizce senkronize eder — çıkan onay ekranını sen kontrol edip kaydedersin.</p></div>`,
    onOpen: () => extOnOpen(),
    prompt: () => ''
  },
  'uyap-dilekce':{
    badge:'t', badgeText:'Yapım Aşamasında', titleHtml:'UYAP Dilekçe <em class="t">Gönder</em>',
    desc:'Bu araç henüz gerçek bir UYAP bağlantısına sahip değil.',
    btnClass:'t', btnIco:'fa-upload', btnLbl:'', hideCta: true, hideChatInput: true,
    body:`<div class="ic"><div class="ic-t"><i class="fa-solid fa-hammer"></i> Yapım Aşamasında</div>
      <p>UYAP'a doğrudan dilekçe gönderme özelliği, resmi bir UYAP entegrasyonu gerektiriyor ve şu an geliştirme sürecinde. Bu özellik hazır olduğunda burada aktif olacak.</p>
      <p style="margin-top:8px;">Şimdilik dilekçenizi <strong>Dilekçe Sihirbazı</strong>'ndan hazırlayıp, UYAP Avukat Portalı'ndan elle gönderebilirsiniz.</p></div>`,
    onOpen: () => {},
    prompt: () => ''
  },
  'uyap-dosya':{
    badge:'t', badgeText:'Yapım Aşamasında', titleHtml:'UYAP Dosya <em class="t">Sorgula</em>',
    desc:'Bu araç henüz gerçek bir UYAP bağlantısına sahip değil.',
    btnClass:'t', btnIco:'fa-magnifying-glass', btnLbl:'', hideCta: true, hideChatInput: true,
    body:`<div class="ic"><div class="ic-t"><i class="fa-solid fa-hammer"></i> Yapım Aşamasında</div>
      <p>Dosya sorgulama, UYAP'ın gerçek zamanlı verisine erişim gerektiriyor ve şu an geliştirme sürecinde. Bu özellik hazır olduğunda burada aktif olacak.</p>
      <p style="margin-top:8px;">Şimdilik dosya durumunu doğrudan UYAP Avukat Portalı'ndan kontrol edebilirsiniz.</p></div>`,
    onOpen: () => {},
    prompt: () => ''
  },
  'uyap-tebligat':{
    badge:'t', badgeText:'Yapım Aşamasında', titleHtml:'Tebligat <em class="t">Takip</em>',
    desc:'Bu araç henüz gerçek bir UETS/UYAP bağlantısına sahip değil.',
    btnClass:'t', btnIco:'fa-inbox', btnLbl:'', hideCta: true, hideChatInput: true,
    body:`<div class="ic"><div class="ic-t"><i class="fa-solid fa-hammer"></i> Yapım Aşamasında</div>
      <p>Elektronik tebligat takibi, UETS'e resmi bir bağlantı gerektiriyor ve şu an geliştirme sürecinde. Bu özellik hazır olduğunda burada aktif olacak.</p>
      <p style="margin-top:8px;">Şimdilik tebligatlarınızı e-Devlet/UETS üzerinden takip edip, tarihini <strong>Süre & Takvim</strong>'e elle ekleyebilirsiniz.</p></div>`,
    onOpen: () => {},
    prompt: () => ''
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
  box.innerHTML = skeletonLines(2);
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
      <div style="display:flex;gap:6px;align-items:stretch;">
        <input type="text" id="ext-token-val" value="${token}" readonly style="flex:1;min-width:0;font-family:'JetBrains Mono',monospace;font-size:11px;">
        <button class="pop-cta-btn t" style="width:auto;flex-shrink:0;padding:8px 14px;" onclick="extCopy()"><i class="fa-solid fa-copy"></i></button>
      </div>
    </div>
    <button class="pop-cta-btn" style="width:100%;background:var(--danger);" onclick="extGenerate()"><i class="fa-solid fa-rotate"></i><span>Anahtarı Yenile (eskisi geçersiz olur)</span></button>
    ${pendingHtml}
  `;
}

async function extGenerate() {
  if (document.getElementById('ext-token-val')) {
    const ok = await talyaConfirm('Yeni anahtar oluşturulursa <strong>eski anahtar geçersiz olur</strong>, eklentiyi yeniden eşleştirmen gerekir. Devam edilsin mi?', 'Evet, Yenile', 'danger');
    if (!ok) return;
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
