// Bu dosya SADECE 'Büro Yönetimi' modülüne aittir.
// 3 sütunlu orijinal tasarım korunuyor: sol = öğe listesi, orta (340px) =
// arama/liste, sağ (detailPane) = seçilen müvekkilin/günün detayı.
window.CURRENT_MODULE = {
  key: 'buro',
  label: 'Büro Yönetimi',
  nameHtml: `Büro <em class="b">Yönetimi</em>`,
  color: 'b',
  items: [
    {"id": "globalarama", "icon": "fa-magnifying-glass", "name": "Global Arama"},
    {"id": "ekip", "icon": "fa-people-group", "name": "Ekip Yönetimi"},
    {"id": "muvekkilekle", "icon": "fa-user-plus", "name": "Müvekkil Ekle", "group": "Müvekkil Yönetimi"},
    {"id": "tablo", "icon": "fa-table-list", "name": "Müvekkil Tablosu", "group": "Müvekkil Yönetimi"},
    {"id": "rapor", "icon": "fa-file-circle-check", "name": "Müvekkil Raporu", "group": "Müvekkil Yönetimi"},
    {"id": "sure", "icon": "fa-calendar-xmark", "name": "Süre & Takvim"},
    {"id": "fatura", "icon": "fa-receipt", "name": "Fatura & Tahsilat"},
    {"id": "gorevler", "icon": "fa-list-check", "name": "Görevler"},
    {"id": "notlar", "icon": "fa-note-sticky", "name": "Notlar"},
    {"id": "gelirgider", "icon": "fa-scale-balanced", "name": "Gelir-Gider"},
    {"id": "sozlesmetakip", "icon": "fa-file-contract", "name": "Sözleşme Takip"}
  ],
  popups: {
    // ── SÖZLEŞME TAKİP ── bitiş/yenileme tarihi yaklaşan sözleşmeler
    sozlesmetakip: {
      badge: 'b', badgeText: 'Bitiş Tarihi Takibi', titleHtml: 'Sözleşme <em class="b">Takip</em>',
      desc: 'Büronuzun/müvekkillerinizin sözleşmelerinin bitiş tarihlerini takip edin.',
      btnClass: 'b', btnIco: 'fa-file-contract', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><div class="fl">Sözleşme Adı</div><input type="text" id="sz-title" placeholder="Ofis Kira Sözleşmesi…"></div>
        <div class="fg"><div class="fl">Karşı Taraf</div><input type="text" id="sz-counterparty" placeholder="…"></div>
        <div class="fg"><div class="fl">Başlangıç Tarihi (opsiyonel)</div><input type="date" id="sz-start"></div>
        <div class="fg"><div class="fl">Bitiş Tarihi</div><input type="date" id="sz-end"></div>
        <div class="fg"><div class="fl">Not</div><textarea id="sz-notes" rows="2"></textarea></div>
        <button class="pop-cta-btn b" style="width:100%;" onclick="szAdd()"><i class="fa-solid fa-plus"></i><span>Sözleşme Ekle</span></button>
      `,
      onOpen: () => szOnOpen(),
      prompt: () => ''
    },
    // ── EKİP YÖNETİMİ ── büro üyeleri, davet linki
    ekip: {
      badge: 'b', badgeText: 'Büro & Ekip', titleHtml: 'Ekip <em class="b">Yönetimi</em>',
      desc: 'Büronuzun üyelerini görün, yeni üye davet edin.',
      btnClass: 'b', btnIco: 'fa-people-group', btnLbl: '', hideCta: true,
      body: `<div id="ekip-box"></div>`,
      onOpen: () => ekipOnOpen(),
      prompt: () => ''
    },
    // ── GLOBAL ARAMA ── müvekkil, not, görev, şablon içinde birden arar
    globalarama: {
      badge: 'b', badgeText: 'Tüm Verilerde Ara', titleHtml: 'Global <em class="b">Arama</em>',
      desc: 'Müvekkil, not, görev ve şablon içinde tek kutudan arayın.',
      btnClass: 'b', btnIco: 'fa-magnifying-glass', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><input type="text" id="ga-q" placeholder="Ara… (en az 2 harf)" oninput="gaSearch()"></div>
        <div id="ga-results"></div>
      `,
      onOpen: () => { document.getElementById('ga-results').innerHTML = ''; },
      prompt: () => ''
    },
    // ── MÜVEKKİL YÖNETİMİ ── orta: arama+liste, sağ: seçilen müvekkilin detayı
    muvekkilekle: {
      badge: 'b', badgeText: 'Büro CRM · Canlı Veri', titleHtml: 'Müvekkil <em class="b">Ekle</em>',
      desc: 'Yeni bir müvekkil kaydı oluşturun.',
      btnClass: 'b', btnIco: 'fa-user-plus', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><div class="fl">Ad Soyad</div><input type="text" id="mv-n-name" placeholder="Müvekkil adı…"></div>
        <div class="fg"><div class="fl">Telefon</div><input type="text" id="mv-n-phone" placeholder="05__ ___ __ __"></div>
        <div class="fg"><div class="fl">E-posta</div><input type="text" id="mv-n-email" placeholder="mail@ornek.com"></div>
        <div class="fg"><div class="fl">Dava Konusu / Not</div><textarea id="mv-n-note" rows="2" placeholder="Kısa not…"></textarea></div>
        <button class="pop-cta-btn b" style="width:100%;" onclick="mvSaveNew()"><i class="fa-solid fa-floppy-disk"></i><span>Kaydet</span></button>
        <div style="font-size:11.5px;color:var(--t3);line-height:1.6;margin-top:10px;">Kaydettikten sonra müvekkilin detayı sağ panelde açılır. Tüm müvekkilleri görmek için <strong>Müvekkil Tablosu</strong>'nu kullanın.</div>
      `,
      onOpen: () => mvEkleOnOpen(),
      prompt: () => ''
    },
    // ── SÜRE & TAKVİM ── orta: özet açıklama, sağ: tam takvim
    sure: {
      badge: 'b', badgeText: 'Kritik Süre Radarı', titleHtml: 'Süre &amp; <em class="b">Takvim</em>',
      desc: 'Müvekkil kayıtlarına eklediğiniz duruşma/ödeme tarihleri sağda takvim olarak görünür.',
      btnClass: 'b', btnIco: 'fa-clock-rotate-left', btnLbl: '', hideCta: true,
      body: `<div id="sure-summary" style="font-size:12.5px;color:var(--t2);">Yükleniyor…</div>`,
      onOpen: () => calOnOpen(),
      prompt: () => ''
    },
    // ── MÜVEKKİL RAPORU ── orta: arama+liste, sağ: seçilen müvekkilin özeti
    rapor: {
      badge: 'b', badgeText: 'Özet Görünüm', titleHtml: 'Müvekkil <em class="b">Raporu</em>',
      desc: 'Bir müvekkil seçin; özet raporu sağda görünsün.',
      btnClass: 'b', btnIco: 'fa-file-circle-check', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><input type="text" id="rp-search" placeholder="Müvekkil ara…" oninput="rpSearch()"></div>
        <div id="rp-list"></div>
      `,
      onOpen: () => rpOnOpen(),
      prompt: () => ''
    },
    // ── FATURA & TAHSİLAT ── orta: arama+liste, sağ: fatura oluştur + yazdır
    fatura: {
      badge: 'b', badgeText: 'Tahsilat Takip', titleHtml: 'Fatura &amp; <em class="b">Tahsilat</em>',
      desc: 'Bir müvekkil seçin; fatura oluşturup yazdırabilirsiniz.',
      btnClass: 'b', btnIco: 'fa-file-invoice-dollar', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><input type="text" id="fat-search" placeholder="Müvekkil ara…" oninput="fatSearch()"></div>
        <div id="fat-list"></div>
      `,
      onOpen: () => fatOnOpen(),
      prompt: () => ''
    },
    // ── GÖREVLER ── müvekkilden bağımsız, kişisel yapılacaklar listesi
    gorevler: {
      badge: 'b', badgeText: 'Yapılacaklar', titleHtml: '<em class="b">Görevler</em>',
      desc: 'Müvekkilden bağımsız, kişisel iş takibiniz.',
      btnClass: 'b', btnIco: 'fa-list-check', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><input type="text" id="task-title" placeholder="Yeni görev…" onkeydown="if(event.key==='Enter')taskAdd()"></div>
        <div class="fg"><input type="date" id="task-date"></div>
        <button class="pop-cta-btn b" style="width:100%;" onclick="taskAdd()"><i class="fa-solid fa-plus"></i><span>Görev Ekle</span></button>
      `,
      onOpen: () => taskOnOpen(),
      prompt: () => ''
    },
    // ── NOTLAR ── müvekkilden bağımsız, serbest notlar/hatırlatıcılar
    notlar: {
      badge: 'b', badgeText: 'Hatırlatıcılar', titleHtml: '<em class="b">Notlar</em>',
      desc: 'Müvekkilden bağımsız, kendinize özel notlar.',
      btnClass: 'b', btnIco: 'fa-note-sticky', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><textarea id="note-text" rows="4" placeholder="Bir not yazın…"></textarea></div>
        <button class="pop-cta-btn b" style="width:100%;" onclick="noteAdd()"><i class="fa-solid fa-plus"></i><span>Notu Kaydet</span></button>
      `,
      onOpen: () => noteOnOpen(),
      prompt: () => ''
    },
    // ── GELİR-GİDER ── büronun genel kasası (müvekkil faturalarından ayrı)
    gelirgider: {
      badge: 'b', badgeText: 'Büro Kasası', titleHtml: 'Gelir-<em class="b">Gider</em>',
      desc: 'Büronun genel gelir ve giderlerini (kira, personel, aidat vb.) kaydedin.',
      btnClass: 'b', btnIco: 'fa-scale-balanced', btnLbl: '', hideCta: true,
      body: `
        <div class="fg">
          <div class="fl">Tür</div>
          <select id="tx-type"><option value="gelir">Gelir</option><option value="gider">Gider</option></select>
        </div>
        <div class="fg"><div class="fl">Tutar (TL)</div><input type="text" id="tx-amount" class="tl-amount" placeholder="5.000"></div>
        <div class="fg"><div class="fl">Açıklama</div><input type="text" id="tx-desc" placeholder="Ofis kirası, personel maaşı…"></div>
        <div class="fg"><div class="fl">Tarih</div><input type="date" id="tx-date"></div>
        <button class="pop-cta-btn b" style="width:100%;" onclick="txAdd()"><i class="fa-solid fa-plus"></i><span>Kaydet</span></button>
      `,
      onOpen: () => txOnOpen(),
      prompt: () => ''
    },
    // ── MÜVEKKİL TABLOSU ── tüm müvekkilleri tablo halinde göster, filtrele, Excel'e aktar
    tablo: {
      badge: 'b', badgeText: 'Rapor Görünümü', titleHtml: 'Müvekkil <em class="b">Tablosu</em>',
      desc: 'Tüm müvekkillerinizi tablo halinde görün, arayın, Excel\'e aktarın.',
      btnClass: 'b', btnIco: 'fa-table-list', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><input type="text" id="tbl-search" placeholder="Müvekkil ara…" oninput="tblFilter()"></div>
        <button class="pop-cta-btn g" style="width:100%;" onclick="tblExportCsv()"><i class="fa-solid fa-file-csv"></i><span>Excel'e Aktar (CSV)</span></button>
        <div style="font-size:11px;color:var(--t3);margin-top:10px;">Tam tablo sağ panelde görünür.</div>
      `,
      onOpen: () => tblOnOpen(),
      prompt: () => ''
    }
  }
};

// ══════════════════════════════════════════════════════
// ORTAK YARDIMCI FONKSİYONLAR
// ══════════════════════════════════════════════════════
function fmtTL(n) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n); }

function mvDaysLeft(dueDate) {
  const due = new Date(dueDate);
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const now = new Date();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((dueMidnight.getTime() - nowMidnight.getTime()) / 86400000);
  if (days < 0) return { text: Math.abs(days) + ' gün geçti', color: 'var(--danger)' };
  if (days === 0) return { text: 'Bugün', color: 'var(--danger)' };
  if (days <= 3) return { text: days + ' gün kaldı', color: 'var(--danger)' };
  if (days <= 7) return { text: days + ' gün kaldı', color: 'var(--warn)' };
  return { text: days + ' gün kaldı', color: 'var(--t2)' };
}

// Orta paneldeki müvekkil arama sonucu listesini oluşturur (3 panelde de kullanılır)
async function loadClientList(containerId, q, selectFnName, selectedId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = skeletonRows(4);
  try {
    const res = await fetch('/api/clients' + (q ? '?q=' + encodeURIComponent(q) : ''));
    const data = await res.json();
    const clients = data.clients || [];
    if (!clients.length) {
      el.innerHTML = emptyState('fa-user-large', 'Müvekkil bulunamadı', '');
      return;
    }
    el.innerHTML = clients.map(c => `
      <div class="s-item ${selectedId===c.id?'active-b':''}" style="margin:0 0 2px;" onclick="${selectFnName}('${c.id}')">
        <span class="ico"><i class="fa-solid fa-user"></i></span>${c.name}
      </div>`).join('');
  } catch (e) {
    el.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--danger);">Yüklenemedi.</div>`;
  }
}

function detailPlaceholder(text) {
  return `<div style="padding:40px 24px;text-align:center;color:var(--t3);margin-top:60px;">
    <i class="fa-solid fa-arrow-left" style="font-size:20px;opacity:.3;display:block;margin-bottom:10px;"></i>
    ${text || 'Soldaki listeden bir öğe seçin.'}
  </div>`;
}

// ══════════════════════════════════════════════════════
// MÜVEKKİL YÖNETİMİ
// ══════════════════════════════════════════════════════
let mvSelectedId = null;
let mvCaseCache = null;
let mvLastQuery = '';
let mvClientCache = null;
let mvOpenCaseId = null;

const EVENT_TYPE_LABELS = {
  durusma: 'Duruşma', odeme: 'Ödeme', gorusme: 'Görüşme',
  arabuluculuk: 'Arabuluculuk', istinaf: 'İstinaf', temyiz: 'Temyiz', gorev: 'Görev'
};
function eventTypeLabel(type) { return EVENT_TYPE_LABELS[type] || type; }

function mvEkleOnOpen() {
  mvSelectedId = null;
  const dp = document.getElementById('detailPane');
  if (dp) dp.innerHTML = detailPlaceholder('Kaydettiğiniz müvekkilin detayı burada açılacak.');
}

async function mvSaveNew() {
  const name = document.getElementById('mv-n-name').value.trim();
  if (!name) { toast('Müvekkil adı gerekli', 'fa-solid fa-triangle-exclamation'); return; }
  const phone = document.getElementById('mv-n-phone').value;
  const email = document.getElementById('mv-n-email').value;
  const notes = document.getElementById('mv-n-note').value;

  // Kaydetmeden önce aynı isimde zaten kayıtlı bir müvekkil var mı kontrol et.
  try {
    const checkRes = await fetch('/api/clients?q=' + encodeURIComponent(name));
    const checkData = await checkRes.json();
    const existing = (checkData.clients || []).find(c => c.name.trim().toLowerCase() === name.toLowerCase());
    if (existing) {
      const devam = confirm(`"${name}" isminde zaten kayıtlı bir müvekkil var. Yine de yeni bir kayıt olarak eklemek istiyor musunuz?`);
      if (!devam) return;
    }
  } catch (e) { /* kontrol başarısız olursa kaydetmeye devam et */ }

  const res = await fetch('/api/clients', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, email, notes })
  });
  const data = await res.json();
  if (data.client) {
    toast('Müvekkil eklendi', 'fa-solid fa-check', true);
    document.getElementById('mv-n-name').value = '';
    document.getElementById('mv-n-phone').value = '';
    document.getElementById('mv-n-email').value = '';
    document.getElementById('mv-n-note').value = '';
    mvSelect(data.client.id);
  }
}

function mvBackToList() {
  mvSelectedId = null;
  // "Listeye Dön" artık Müvekkil Tablosu'na döner.
  openPopup('tablo');
}

async function mvSelect(id) {
  mvSelectedId = id;
  mvOpenCaseId = null;
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  const res = await fetch('/api/clients/' + id);
  const data = await res.json();
  if (!data.client) { dp.innerHTML = detailPlaceholder(); return; }
  mvClientCache = data.client;
  mvRenderClientView();
}

function mvRenderClientView() {
  const c = mvClientCache;
  const dp = document.getElementById('detailPane');

  dp.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;">
      <div style="cursor:pointer;color:var(--t3);font-size:12px;margin-bottom:12px;" onclick="mvBackToList()">
        <i class="fa-solid fa-arrow-left"></i> Listeye Dön
      </div>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;">
        <div>
          <div style="font-family:'Instrument Serif',serif;font-size:20px;">${c.name}</div>
          <div style="font-size:12px;color:var(--t2);">${c.phone||'—'} ${c.email?(' · '+c.email):''}</div>
          ${c.notes ? `<div style="font-size:12px;color:var(--t2);margin-top:4px;">${c.notes}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="pop-cta-btn b" style="padding:5px 10px;" onclick="mvEditToggle()"><i class="fa-solid fa-pen"></i></button>
          <button class="pop-cta-btn" style="padding:5px 10px;background:var(--danger);" onclick="mvDeleteClient()"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <div id="mv-edit-form" style="display:none;margin-top:10px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);">
        <div class="fg"><div class="fl">Ad Soyad</div><input type="text" id="mv-e-name" value="${c.name.replace(/"/g,'&quot;')}"></div>
        <div class="fg"><div class="fl">Telefon</div><input type="text" id="mv-e-phone" value="${(c.phone||'').replace(/"/g,'&quot;')}"></div>
        <div class="fg"><div class="fl">E-posta</div><input type="text" id="mv-e-email" value="${(c.email||'').replace(/"/g,'&quot;')}"></div>
        <div class="fg"><div class="fl">Not</div><textarea id="mv-e-note" rows="2">${(c.notes||'')}</textarea></div>
        <div style="display:flex;gap:6px;">
          <button class="pop-cta-btn b" style="flex:1;" onclick="mvSaveEdit()"><span>Kaydet</span></button>
          <button class="pop-cta-btn" style="flex:1;" onclick="mvEditToggle()"><span>Vazgeç</span></button>
        </div>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-folder-open"></i> Dosyalar (${c.cases.length})</div>
      <div id="mv-cases">${c.cases.length ? c.cases.map(cs => {
        const nextEv = cs.events.filter(e => new Date(e.dueDate) >= new Date()).sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate))[0];
        return `<div class="s-item" style="margin:0 0 4px;" onclick="mvOpenCase('${cs.id}')">
          <span class="ico"><i class="fa-solid fa-folder"></i></span>${cs.title}
          ${cs.status==='kapali' ? '<span style="margin-left:6px;font-size:9px;color:var(--t3);">(kapalı)</span>' : ''}
          ${nextEv ? `<span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:10px;padding:2px 7px;border-radius:10px;background:var(--bg2);color:var(--t3);">${new Date(nextEv.dueDate).toLocaleDateString('tr-TR')}</span>` : ''}
        </div>`;
      }).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz dosya eklenmedi.</div>'}</div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
        <input type="text" id="mv-case-title" placeholder="Yeni dosya adı (ör. Boşanma Davası)…" style="flex:1;min-width:220px;">
        <button class="pop-cta-btn p" style="padding:6px 12px;" onclick="mvAddCase()"><span>Ekle</span></button>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:20px 0 6px;"><i class="fa-solid fa-comments"></i> Genel Görüşme Geçmişi</div>
      <div id="mv-logs">${c.logs.length ? c.logs.map(l => `<div style="padding:6px 0;border-bottom:1px solid var(--border);"><div style="font-size:10px;color:var(--t3);">${new Date(l.createdAt).toLocaleString('tr-TR')}</div><div style="font-size:12.5px;">${l.content}</div></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz görüşme kaydı yok.</div>'}</div>
      <textarea id="mv-log-text" rows="2" placeholder="Ne konuşuldu, ne karar verildi…" style="margin-top:8px;"></textarea>
      <button class="pop-cta-btn b" style="width:100%;margin-top:6px;" onclick="mvAddLog()"><span>Notu Kaydet</span></button>
    </div>
  `;
}

async function mvAddCase() {
  if (!mvSelectedId) return;
  const title = document.getElementById('mv-case-title').value.trim();
  if (!title) { toast('Dosya adı gerekli', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/clients/' + mvSelectedId + '/cases', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  toast('Dosya eklendi', 'fa-solid fa-check', true);
  mvSelect(mvSelectedId);
}

async function mvOpenCase(caseId) {
  mvOpenCaseId = caseId;
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  const res = await fetch('/api/cases/' + caseId);
  const data = await res.json();
  if (!data.case) { mvRenderClientView(); return; }
  const cs = data.case;
  mvCaseCache = cs;

  const toplamSaat = cs.timeEntries.reduce((s, t) => s + t.hours, 0);
  const toplamUcret = cs.timeEntries.reduce((s, t) => s + (t.hours * (t.hourlyRate || 0)), 0);
  const faturalanmamis = cs.timeEntries.filter(t => !t.invoiced && t.hourlyRate);
  const faturalanmamisSaat = faturalanmamis.reduce((s, t) => s + t.hours, 0);
  const faturalanmamisUcret = faturalanmamis.reduce((s, t) => s + (t.hours * (t.hourlyRate || 0)), 0);

  dp.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;">
      <div style="cursor:pointer;color:var(--t3);font-size:12px;margin-bottom:12px;" onclick="mvRenderClientView()">
        <i class="fa-solid fa-arrow-left"></i> ${cs.client.name} — Müvekkile Dön
      </div>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;">
        <div style="font-family:'Instrument Serif',serif;font-size:19px;">${cs.title}</div>
        <div style="display:flex;gap:6px;">
          <button class="pop-cta-btn b" style="width:auto;padding:5px 10px;font-size:11px;" onclick="mvShowTimeline()"><i class="fa-solid fa-timeline"></i> Zaman Çizelgesi</button>
          <select onchange="mvSetCaseStatus('${cs.id}', this.value)" style="width:110px;font-size:11px;">
            <option value="acik" ${cs.status==='acik'?'selected':''}>Açık</option>
            <option value="kapali" ${cs.status==='kapali'?'selected':''}>Kapalı</option>
          </select>
          <button class="pop-cta-btn" style="padding:5px 10px;background:var(--danger);" onclick="mvDeleteCase('${cs.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-calendar-days"></i> Tarihler</div>
      <div id="mv-events">${cs.events.length ? cs.events.map(ev => {
        const dl = mvDaysLeft(ev.dueDate);
        return `<div class="dl-row"><span class="dl-tag ${dl.color==='var(--danger)'?'crit':dl.color==='var(--warn)'?'warn':''}">${eventTypeLabel(ev.type).toUpperCase()}</span><span class="dl-text">${ev.title} — ${new Date(ev.dueDate).toLocaleDateString('tr-TR')}</span><span class="dl-days" style="color:${dl.color}">${dl.text}</span><span style="cursor:pointer;color:var(--t3);margin-left:8px;" onclick="mvDeleteEvent('${ev.id}')" title="Sil"><i class="fa-solid fa-xmark"></i></span></div>`;
      }).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz tarih eklenmedi.</div>'}</div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
        <select id="mv-ev-type" style="width:130px;" onchange="mvToggleCustomType()">
          <option value="durusma">Duruşma</option>
          <option value="odeme">Ödeme</option>
          <option value="gorusme">Görüşme</option>
          <option value="arabuluculuk">Arabuluculuk</option>
          <option value="istinaf">İstinaf</option>
          <option value="temyiz">Temyiz</option>
          <option value="__custom">Diğer (yazın)</option>
        </select>
        <input type="text" id="mv-ev-custom" placeholder="Tür adı…" style="width:110px;display:none;">
        <input type="text" id="mv-ev-title" placeholder="Başlık…" style="flex:1;min-width:120px;">
        <input type="date" id="mv-ev-date" style="width:140px;">
        <button class="pop-cta-btn p" style="padding:6px 12px;" onclick="mvAddEvent()"><span>Ekle</span></button>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-handshake"></i> Anlaşılan Ücret</div>
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;">
        <input type="text" id="mv-agreed-fee" class="tl-amount" placeholder="Anlaşılan toplam tutar (TL)" value="${cs.agreedFee ? cs.agreedFee : ''}" style="flex:1;min-width:0;">
        <button class="pop-cta-btn b" style="width:auto;padding:6px 12px;flex-shrink:0;" onclick="mvSaveAgreedFee('${cs.id}')"><span>Kaydet</span></button>
      </div>
      ${cs.agreedFee ? (() => {
        const invoicedTotal = cs.invoices.reduce((s, i) => s + i.amount, 0);
        const remaining = cs.agreedFee - invoicedTotal;
        return `<div class="cr-row" style="padding:6px 0;border-bottom:1px solid var(--border);">
          <span>Faturalanan / Anlaşılan</span>
          <span style="font-family:'JetBrains Mono',monospace;">${fmtTL(invoicedTotal)} / ${fmtTL(cs.agreedFee)}</span>
        </div>
        <div class="cr-row" style="padding:6px 0;">
          <span>Kalan Bakiye</span>
          <span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:${remaining > 0 ? 'var(--warn)' : 'var(--success)'};">${fmtTL(remaining)}</span>
        </div>`;
      })() : ''}

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-file-invoice-dollar"></i> Faturalar</div>
      <div id="mv-invoices">${cs.invoices.length ? cs.invoices.map(inv => `<div class="cr-row" style="padding:5px 0;border-bottom:1px solid var(--border);"><span>${new Date(inv.createdAt).toLocaleDateString('tr-TR')}${inv.note?(' — '+inv.note):''}</span><span style="display:flex;align-items:center;gap:8px;"><span style="font-family:'JetBrains Mono',monospace;">${fmtTL(inv.amount)}</span><span style="cursor:pointer;color:var(--t3);" onclick="mvDeleteInvoice('${inv.id}')" title="Sil"><i class="fa-solid fa-xmark"></i></span></span></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz fatura yok.</div>'}</div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
        <input type="text" id="mv-inv-amount" class="tl-amount" placeholder="Tutar (TL)" style="width:120px;">
        <input type="text" id="mv-inv-note" placeholder="Açıklama…" style="flex:1;min-width:160px;">
        <button class="pop-cta-btn g" style="padding:6px 12px;" onclick="mvAddInvoice()"><span>Fatura Oluştur</span></button>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-stopwatch"></i> Zaman Takibi</div>
      <div style="display:flex;gap:14px;margin-bottom:8px;font-size:12px;color:var(--t2);flex-wrap:wrap;">
        <span>Toplam: <strong>${toplamSaat.toFixed(1)} saat</strong></span>
        ${toplamUcret > 0 ? `<span>Tahmini ücret: <strong style="color:var(--gold);">${fmtTL(toplamUcret)}</strong></span>` : ''}
      </div>
      ${faturalanmamisUcret > 0 ? `
        <div style="background:var(--gold-lo);border:1px solid var(--gold-rule);border-radius:var(--r);padding:10px 12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <span style="font-size:12px;">Faturalanmamış: <strong>${faturalanmamisSaat.toFixed(1)} saat</strong> — <strong style="color:var(--gold);">${fmtTL(faturalanmamisUcret)}</strong></span>
          <button class="pop-cta-btn g" style="width:auto;padding:6px 12px;" onclick="mvConvertTimeToInvoice('${cs.id}')"><i class="fa-solid fa-file-invoice-dollar"></i><span>Faturaya Dönüştür</span></button>
        </div>
      ` : ''}
      <div id="mv-time">${cs.timeEntries.length ? cs.timeEntries.map(t => `<div class="cr-row" style="padding:5px 0;border-bottom:1px solid var(--border);"><span>${new Date(t.date).toLocaleDateString('tr-TR')} — ${t.hours} saat${t.description?(' — '+t.description):''}${t.invoiced ? ' <span style="color:var(--success);font-size:10px;">(faturalandı)</span>' : ''}</span><span style="display:flex;align-items:center;gap:8px;">${t.hourlyRate?`<span style="font-family:'JetBrains Mono',monospace;color:var(--t3);">${fmtTL(t.hours*t.hourlyRate)}</span>`:''}<span style="cursor:pointer;color:var(--t3);" onclick="mvDeleteTime('${t.id}')" title="Sil"><i class="fa-solid fa-xmark"></i></span></span></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz zaman kaydı yok.</div>'}</div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
        <input type="text" id="mv-time-hours" placeholder="Saat (ör. 1.5)" style="width:110px;">
        <input type="text" id="mv-time-rate" class="tl-amount" placeholder="Saatlik ücret (ops.)" style="width:150px;">
        <input type="text" id="mv-time-desc" placeholder="Açıklama…" style="flex:1;min-width:120px;">
        <button class="pop-cta-btn b" style="padding:6px 12px;" onclick="mvAddTime()"><span>Ekle</span></button>
      </div>
    </div>
  `;
}

async function mvSaveAgreedFee(caseId) {
  const val = tlParseValue(document.getElementById('mv-agreed-fee').value);
  await fetch('/api/cases/' + caseId, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agreedFee: val })
  });
  toast('Anlaşılan ücret kaydedildi', 'fa-solid fa-check', true);
  mvOpenCase(caseId);
}

async function mvSetCaseStatus(caseId, status) {
  await fetch('/api/cases/' + caseId, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  toast('Dosya durumu güncellendi', 'fa-solid fa-check', true);
}

async function mvDeleteCase(caseId) {
  if (!confirm('Bu dosyayı ve içindeki tüm tarih/fatura/zaman kayıtlarını silmek istediğinize emin misiniz?')) return;
  await fetch('/api/cases/' + caseId, { method: 'DELETE' });
  toast('Dosya silindi', 'fa-solid fa-trash');
  mvSelect(mvSelectedId);
}

function mvToggleCustomType() {
  const sel = document.getElementById('mv-ev-type');
  const custom = document.getElementById('mv-ev-custom');
  custom.style.display = sel.value === '__custom' ? 'inline-block' : 'none';
}

function mvEditToggle() {
  const form = document.getElementById('mv-edit-form');
  if (!form) return;
  form.style.display = form.style.display !== 'none' ? 'none' : 'block';
}

async function mvSaveEdit() {
  if (!mvSelectedId) return;
  const name = document.getElementById('mv-e-name').value.trim();
  const phone = document.getElementById('mv-e-phone').value;
  const email = document.getElementById('mv-e-email').value;
  const notes = document.getElementById('mv-e-note').value;
  if (!name) { toast('Müvekkil adı gerekli', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/clients/' + mvSelectedId, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, email, notes })
  });
  toast('Bilgiler güncellendi', 'fa-solid fa-check', true);
  mvSelect(mvSelectedId);
}

async function mvDeleteClient() {
  if (!mvSelectedId) return;
  if (!confirm('Bu müvekkili ve tüm dosyalarını silmek istediğinize emin misiniz?')) return;
  await fetch('/api/clients/' + mvSelectedId, { method: 'DELETE' });
  toast('Müvekkil silindi', 'fa-solid fa-trash');
  mvSelectedId = null;
  openPopup('tablo');
}

async function mvAddEvent() {
  if (!mvOpenCaseId) return;
  const sel = document.getElementById('mv-ev-type').value;
  const type = sel === '__custom' ? (document.getElementById('mv-ev-custom').value.trim() || 'Diğer') : sel;
  const title = document.getElementById('mv-ev-title').value.trim();
  const dueDate = document.getElementById('mv-ev-date').value;
  if (!title || !dueDate) { toast('Başlık ve tarih girin', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/cases/' + mvOpenCaseId + '/events', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, title, dueDate })
  });
  toast('Tarih eklendi — takvime düştü', 'fa-solid fa-calendar-check', true);
  mvOpenCase(mvOpenCaseId);
}

async function mvDeleteEvent(eventId) {
  if (!mvOpenCaseId) return;
  if (!confirm('Bu tarihi silmek istediğinize emin misiniz?')) return;
  await fetch('/api/cases/' + mvOpenCaseId + '/events/' + eventId, { method: 'DELETE' });
  toast('Tarih silindi', 'fa-solid fa-trash');
  mvOpenCase(mvOpenCaseId);
}

async function mvAddInvoice() {
  if (!mvOpenCaseId) return;
  const amount = tlParseValue(document.getElementById('mv-inv-amount').value);
  const note = document.getElementById('mv-inv-note').value;
  if (!amount) { toast('Tutar girin', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/cases/' + mvOpenCaseId + '/invoices', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, note })
  });
  toast('Fatura oluşturuldu', 'fa-solid fa-check', true);
  mvOpenCase(mvOpenCaseId);
}

async function mvDeleteInvoice(invoiceId) {
  if (!mvOpenCaseId) return;
  if (!confirm('Bu faturayı silmek istediğinize emin misiniz?')) return;
  await fetch('/api/cases/' + mvOpenCaseId + '/invoices/' + invoiceId, { method: 'DELETE' });
  toast('Fatura silindi', 'fa-solid fa-trash');
  mvOpenCase(mvOpenCaseId);
}

async function mvAddTime() {
  if (!mvOpenCaseId) return;
  const hours = document.getElementById('mv-time-hours').value;
  const hourlyRate = tlParseValue(document.getElementById('mv-time-rate').value);
  const description = document.getElementById('mv-time-desc').value;
  if (!hours) { toast('Süre girin', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/cases/' + mvOpenCaseId + '/time', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hours, hourlyRate: hourlyRate || null, description })
  });
  toast('Zaman kaydı eklendi', 'fa-solid fa-check', true);
  mvOpenCase(mvOpenCaseId);
}

async function mvConvertTimeToInvoice(caseId) {
  if (!confirm('Faturalanmamış tüm zaman kayıtları tek bir faturada birleştirilecek. Devam edilsin mi?')) return;
  const res = await fetch('/api/cases/' + caseId + '/time/convert-to-invoice', { method: 'POST' });
  const data = await res.json();
  if (res.ok) {
    toast(`${data.hours} saat faturaya dönüştürüldü`, 'fa-solid fa-check', true);
    mvOpenCase(caseId);
  } else {
    toast(data.error || 'Dönüştürülemedi', 'fa-solid fa-triangle-exclamation');
  }
}

async function mvDeleteTime(entryId) {
  if (!mvOpenCaseId) return;
  if (!confirm('Bu zaman kaydını silmek istediğinize emin misiniz?')) return;
  await fetch('/api/cases/' + mvOpenCaseId + '/time/' + entryId, { method: 'DELETE' });
  toast('Zaman kaydı silindi', 'fa-solid fa-trash');
  mvOpenCase(mvOpenCaseId);
}

async function mvAddLog() {
  if (!mvSelectedId) return;
  const content = document.getElementById('mv-log-text').value.trim();
  if (!content) return;
  await fetch('/api/clients/' + mvSelectedId + '/logs', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  mvSelect(mvSelectedId);
}

// ══════════════════════════════════════════════════════
// SÜRE & TAKVİM — sağ panelde tam takvim
// ══════════════════════════════════════════════════════
let calAllEvents = [];
let calViewDate = new Date();
let calSelectedDay = null;

async function calOnOpen() {
  calViewDate = new Date();
  calSelectedDay = null;
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `
    <div style="padding:22px 24px;display:flex;flex-direction:column;align-items:center;height:100%;overflow-y:auto;box-sizing:border-box;">
      <div id="cal-head" style="display:flex;align-items:center;justify-content:center;gap:18px;margin-bottom:18px;width:100%;max-width:560px;">
        <button onclick="calNav(-1)" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--border2);background:var(--card);color:var(--t1);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;"><i class="fa-solid fa-chevron-left"></i></button>
        <div id="cal-month-label" style="font-family:'Instrument Serif',serif;font-size:24px;min-width:180px;text-align:center;"></div>
        <button onclick="calNav(1)" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--border2);background:var(--card);color:var(--t1);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div id="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:24px;width:100%;max-width:560px;"></div>
      <div id="cal-agenda" style="width:100%;max-width:560px;"></div>
    </div>
  `;
  const res = await fetch('/api/events');
  const data = await res.json();
  calAllEvents = data.events || [];
  const sumEl = document.getElementById('sure-summary');
  if (sumEl) sumEl.textContent = calAllEvents.length + ' kayıtlı tarih bulundu.';
  calRender();
}

function calNav(dir) {
  calViewDate.setMonth(calViewDate.getMonth() + dir);
  calSelectedDay = null;
  calRender();
}

function calRender() {
  const label = document.getElementById('cal-month-label');
  const grid = document.getElementById('cal-grid');
  const agenda = document.getElementById('cal-agenda');
  if (!label || !grid) return;

  const y = calViewDate.getFullYear();
  const m = calViewDate.getMonth();
  label.textContent = calViewDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const firstDay = new Date(y, m, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const eventsByDay = {};
  calAllEvents.forEach(ev => {
    const d = new Date(ev.dueDate);
    if (d.getFullYear() === y && d.getMonth() === m) {
      const day = d.getDate();
      (eventsByDay[day] = eventsByDay[day] || []).push(ev);
    }
  });

  const dowLabels = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
  let html = dowLabels.map(d => `<div style="text-align:center;font-size:10px;color:var(--t3);padding:4px 0;">${d}</div>`).join('');
  for (let i = 0; i < startOffset; i++) html += `<div></div>`;

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const has = eventsByDay[day];
    const isToday = today.getFullYear() === y && today.getMonth() === m && today.getDate() === day;
    const isSel = calSelectedDay === day;
    html += `<div onclick="calSelectDay(${day})" style="cursor:pointer;text-align:center;padding:12px 0;border-radius:10px;font-size:14px;
      background:${isSel ? 'var(--gold)' : isToday ? 'var(--gold-lo)' : 'transparent'};
      color:${isSel ? '#fff' : 'var(--t0)'};">
      ${day}
      ${has ? `<div style="width:5px;height:5px;border-radius:50%;background:${isSel?'#fff':'var(--danger)'};margin:4px auto 0;"></div>` : ''}
    </div>`;
  }
  grid.innerHTML = html;

  let list = calSelectedDay ? (eventsByDay[calSelectedDay] || []) : calAllEvents.filter(ev => new Date(ev.dueDate) >= new Date(new Date().setHours(0,0,0,0)));
  list = list.slice().sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

  const title = calSelectedDay ? `${calSelectedDay} ${calViewDate.toLocaleDateString('tr-TR',{month:'long'})} — Ajanda` : 'Yaklaşan Tarihler';
  agenda.innerHTML = `<div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:8px;">${title}</div>` +
    (list.length ? list.map(ev => {
      const dl = mvDaysLeft(ev.dueDate);
      return `<div class="dl-row"><span class="dl-tag ${dl.color==='var(--danger)'?'crit':dl.color==='var(--warn)'?'warn':''}">${eventTypeLabel(ev.type).toUpperCase()}</span><span class="dl-text">${ev.clientName} — ${ev.title}</span><span class="dl-days" style="color:${dl.color}">${dl.text}</span></div>`;
    }).join('') : `<div style="font-size:12px;color:var(--t3);">Kayıt yok.</div>`);
}

function calSelectDay(day) {
  calSelectedDay = calSelectedDay === day ? null : day;
  calRender();
}

// ══════════════════════════════════════════════════════
// MÜVEKKİL RAPORU — sağ panelde özet
// ══════════════════════════════════════════════════════
let rpSelectedId = null;

function rpOnOpen() {
  rpSelectedId = null;
  loadClientList('rp-list', '', 'rpSelect');
}

function rpSearch() {
  const q = document.getElementById('rp-search').value.trim();
  loadClientList('rp-list', q, 'rpSelect', rpSelectedId);
}

async function rpSelect(id) {
  rpSelectedId = id;
  loadClientList('rp-list', document.getElementById('rp-search')?.value || '', 'rpSelect', id);
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  const res = await fetch('/api/clients/' + id);
  const data = await res.json();
  if (!data.client) { dp.innerHTML = detailPlaceholder(); return; }
  const c = data.client;

  const allEvents = c.cases.flatMap(cs => cs.events.map(e => ({ ...e, caseTitle: cs.title })));
  const allInvoices = c.cases.flatMap(cs => cs.invoices);
  const toplamFatura = allInvoices.reduce((s, i) => s + i.amount, 0);
  const toplamAnlasilan = c.cases.reduce((s, cs) => s + (cs.agreedFee || 0), 0);
  const kalanBakiye = toplamAnlasilan - toplamFatura;
  const gecmisEv = allEvents.filter(e => new Date(e.dueDate) < new Date());
  const gelecekEv = allEvents.filter(e => new Date(e.dueDate) >= new Date());

  dp.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;">
      <div style="font-family:'Instrument Serif',serif;font-size:20px;">${c.name}</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:16px;">${c.phone||'—'}${c.email?(' · '+c.email):''}</div>

      <div class="cr-row" style="padding:6px 0;border-bottom:1px solid var(--border);">
        <span><i class="fa-solid fa-handshake" style="color:var(--gold);margin-right:6px;"></i>Anlaşılan Ücret</span>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:600;">${toplamAnlasilan ? fmtTL(toplamAnlasilan) : 'Belirtilmedi'}</span>
      </div>
      <div class="cr-row" style="padding:6px 0;border-bottom:1px solid var(--border);">
        <span><i class="fa-solid fa-file-invoice-dollar" style="color:var(--success);margin-right:6px;"></i>Ödenen (Faturalanan)</span>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:600;">${toplamFatura ? fmtTL(toplamFatura) : '—'}</span>
      </div>
      <div class="cr-row" style="padding:6px 0;">
        <span><i class="fa-solid fa-hourglass-half" style="color:var(--warn);margin-right:6px;"></i>Kalan Bakiye</span>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:600;color:${toplamAnlasilan ? (kalanBakiye > 0 ? 'var(--warn)' : 'var(--success)') : 'var(--t3)'};">${toplamAnlasilan ? fmtTL(kalanBakiye) : 'Belirtilmedi'}</span>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-folder-open"></i> Dosyalar (${c.cases.length})</div>
      ${c.cases.length ? c.cases.map(cs => `<div style="font-size:12.5px;padding:4px 0;">${cs.title} ${cs.status==='kapali'?'<span style="color:var(--t3);font-size:10px;">(kapalı)</span>':''}</div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz dosya yok.</div>'}

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-calendar-days"></i> Yaklaşan Tarihler</div>
      ${gelecekEv.length ? gelecekEv.map(e => {
        const dl = mvDaysLeft(e.dueDate);
        return `<div class="dl-row"><span class="dl-tag ${dl.color==='var(--danger)'?'crit':dl.color==='var(--warn)'?'warn':''}">${eventTypeLabel(e.type).toUpperCase()}</span><span class="dl-text">${e.caseTitle} — ${e.title} (${new Date(e.dueDate).toLocaleDateString('tr-TR')})</span><span class="dl-days" style="color:${dl.color}">${dl.text}</span></div>`;
      }).join('') : '<div style="font-size:12px;color:var(--t3);">Yaklaşan tarih yok.</div>'}

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-clock-rotate-left"></i> Geçmiş Tarihler</div>
      ${gecmisEv.length ? gecmisEv.map(e => `<div class="dl-row"><span class="dl-tag" style="background:var(--bg2);color:var(--t3);">${eventTypeLabel(e.type).toUpperCase()}</span><span class="dl-text">${e.caseTitle} — ${e.title} (${new Date(e.dueDate).toLocaleDateString('tr-TR')})</span><span class="dl-days" style="color:var(--t3);">Tamamlandı</span></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Geçmiş kayıt yok.</div>'}

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-comments"></i> Son Görüşme</div>
      ${c.logs.length ? `<div style="font-size:12.5px;">${c.logs[0].content}</div><div style="font-size:10px;color:var(--t3);margin-top:2px;">${new Date(c.logs[0].createdAt).toLocaleString('tr-TR')}</div>` : '<div style="font-size:12px;color:var(--t3);">Görüşme kaydı yok.</div>'}
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// FATURA & TAHSİLAT — sağ panelde fatura oluştur + yazdır
// ══════════════════════════════════════════════════════
let fatSelectedId = null;
let fatSelectedCaseId = null;

function fatOnOpen() {
  fatSelectedId = null;
  fatSelectedCaseId = null;
  loadClientList('fat-list', '', 'fatSelect');
}

function fatSearch() {
  const q = document.getElementById('fat-search').value.trim();
  loadClientList('fat-list', q, 'fatSelect', fatSelectedId);
}

async function fatSelect(id) {
  fatSelectedId = id;
  fatSelectedCaseId = null;
  loadClientList('fat-list', document.getElementById('fat-search')?.value || '', 'fatSelect', id);
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  const res = await fetch('/api/clients/' + id);
  const data = await res.json();
  if (!data.client) { dp.innerHTML = detailPlaceholder(); return; }
  fatRenderCaseList(data.client);
}

function fatRenderCaseList(c) {
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;">
      <div style="font-family:'Instrument Serif',serif;font-size:20px;">${c.name}</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:18px;">${c.phone||''}${c.email?(' · '+c.email):''}</div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:10px;">Fatura oluşturmak için bir dosya seçin</div>
      ${c.cases.length ? c.cases.map(cs => `
        <div class="s-item" style="margin:0 0 4px;" onclick="fatSelectCase('${c.id}','${cs.id}')">
          <span class="ico"><i class="fa-solid fa-folder"></i></span>${cs.title}
        </div>
      `).join('') : `<div style="font-size:12px;color:var(--t3);">Bu müvekkilin henüz dosyası yok. Önce Müvekkil Yönetimi'nden bir dosya ekleyin.</div>`}
    </div>
  `;
}

async function fatSelectCase(clientId, caseId) {
  fatSelectedCaseId = caseId;
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  const res = await fetch('/api/cases/' + caseId);
  const data = await res.json();
  if (!data.case) { dp.innerHTML = detailPlaceholder(); return; }
  fatRenderPane(data.case);
}

function fatRenderPane(cs) {
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;">
      <div style="cursor:pointer;color:var(--t3);font-size:12px;margin-bottom:12px;" onclick="fatSelect('${cs.client.id}')">
        <i class="fa-solid fa-arrow-left"></i> Dosyalara Dön
      </div>
      <div style="font-family:'Instrument Serif',serif;font-size:19px;">${cs.client.name}</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:18px;">Dosya: ${cs.title}</div>
      <div class="fg"><div class="fl">Tutar (TL)</div><input type="text" id="fat-amount" placeholder="15000"></div>
      <div class="fg"><div class="fl">Açıklama (opsiyonel)</div><input type="text" id="fat-note" placeholder="Vekâlet ücreti…"></div>
      <button class="pop-cta-btn g" style="width:100%;" onclick="fatCreate('${cs.id}')">
        <i class="fa-solid fa-file-invoice-dollar"></i><span>Fatura Oluştur</span>
      </button>
      <div id="fat-preview" style="margin-top:20px;"></div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:20px 0 6px;"><i class="fa-solid fa-clock-rotate-left"></i> Geçmiş Faturalar</div>
      <div id="fat-history">${cs.invoices.length ? cs.invoices.map(inv => `<div class="cr-row" style="padding:5px 0;border-bottom:1px solid var(--border);"><span>${new Date(inv.createdAt).toLocaleDateString('tr-TR')}${inv.note?(' — '+inv.note):''}</span><span style="font-family:'JetBrains Mono',monospace;">${fmtTL(inv.amount)}</span></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz fatura yok.</div>'}</div>
    </div>
  `;
}

async function fatCreate(caseId) {
  const amount = document.getElementById('fat-amount').value;
  const note = document.getElementById('fat-note').value;
  if (!amount) { toast('Tutar girin', 'fa-solid fa-triangle-exclamation'); return; }

  const caseRes = await fetch('/api/cases/' + caseId);
  const caseData = await caseRes.json();
  const clientName = caseData.case ? caseData.case.client.name : '';
  const caseTitle = caseData.case ? caseData.case.title : '';

  const res = await fetch('/api/cases/' + caseId + '/invoices', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, note })
  });
  const data = await res.json();
  if (!data.invoice) { toast('Oluşturulamadı', 'fa-solid fa-triangle-exclamation'); return; }
  const inv = data.invoice;

  document.getElementById('fat-preview').innerHTML = `
    <div id="fat-doc" style="border:1px solid var(--border);border-radius:var(--r);padding:22px;background:#fff;color:#1a1714;">
      <div style="font-family:'Instrument Serif',serif;font-size:20px;color:var(--gold);margin-bottom:2px;">Talya Hukuk Bürosu</div>
      <div style="font-size:11px;color:var(--t3);margin-bottom:16px;">Vekâlet Ücreti Fatura Belgesi</div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;"><span>Müvekkil</span><strong>${clientName}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;"><span>Dosya</span><strong>${caseTitle}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;"><span>Tarih</span><strong>${new Date(inv.createdAt).toLocaleDateString('tr-TR')}</strong></div>
      ${note ? `<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;"><span>Açıklama</span><strong>${note}</strong></div>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:16px;margin-top:12px;padding-top:12px;border-top:1px solid #ddd;"><span>Toplam Tutar</span><strong style="color:var(--gold);">${fmtTL(inv.amount)}</strong></div>
    </div>
    <button class="pop-cta-btn b" style="width:100%;margin-top:12px;" onclick="fatPrint()">
      <i class="fa-solid fa-print"></i><span>Yazdır</span>
    </button>
  `;
  toast('Fatura oluşturuldu', 'fa-solid fa-check', true);
  document.getElementById('fat-amount').value = '';
  document.getElementById('fat-note').value = '';

  const fresh = await fetch('/api/cases/' + caseId);
  const freshData = await fresh.json();
  if (freshData.case) {
    document.getElementById('fat-history').innerHTML = freshData.case.invoices.length
      ? freshData.case.invoices.map(inv2 => `<div class="cr-row" style="padding:5px 0;border-bottom:1px solid var(--border);"><span>${new Date(inv2.createdAt).toLocaleDateString('tr-TR')}${inv2.note?(' — '+inv2.note):''}</span><span style="font-family:'JetBrains Mono',monospace;">${fmtTL(inv2.amount)}</span></div>`).join('')
      : '<div style="font-size:12px;color:var(--t3);">Henüz fatura yok.</div>';
  }
}

function fatPrint() {
  const doc = document.getElementById('fat-doc');
  if (!doc) return;
  const w = window.open('', '_blank', 'width=600,height=800');
  w.document.write(`<html><head><title>Fatura</title><style>body{font-family:Arial,sans-serif;padding:30px;}</style></head><body>${doc.outerHTML}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 300);
}

// ══════════════════════════════════════════════════════
// GÖREVLER — müvekkilden bağımsız yapılacaklar listesi
// ══════════════════════════════════════════════════════
async function taskOnOpen() {
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  await taskRenderList();
}

async function taskRenderList() {
  const dp = document.getElementById('detailPane');
  try {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    const tasks = data.tasks || [];
    const acikGorevler = tasks.filter(t => !t.done);
    const bitenGorevler = tasks.filter(t => t.done);

    dp.innerHTML = `
      <div style="padding:22px 24px;overflow-y:auto;height:100%;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:10px;">
          Açık Görevler (${acikGorevler.length})
        </div>
        ${acikGorevler.length ? acikGorevler.map(t => taskRow(t)).join('') : emptyState('fa-list-check', 'Açık görev yok', 'Yeni bir görev ekleyerek başlayın.')}

        ${bitenGorevler.length ? `
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:20px 0 10px;">
            Tamamlanan (${bitenGorevler.length})
          </div>
          ${bitenGorevler.map(t => taskRow(t)).join('')}
        ` : ''}
      </div>
    `;
  } catch (e) {
    dp.innerHTML = `<div style="padding:20px;color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

function taskRow(t) {
  const overdue = t.dueDate && !t.done && new Date(t.dueDate) < new Date(new Date().toDateString());
  return `<div class="cr-row" style="padding:8px 0;border-bottom:1px solid var(--border);align-items:flex-start;">
    <span style="display:flex;align-items:flex-start;gap:8px;">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="taskToggle('${t.id}', this.checked)" style="margin-top:3px;">
      <span style="${t.done ? 'text-decoration:line-through;color:var(--t3);' : ''}">
        ${t.title}
        ${t.dueDate ? `<div style="font-size:10px;color:${overdue ? 'var(--danger)' : 'var(--t3)'};margin-top:2px;">${new Date(t.dueDate).toLocaleDateString('tr-TR')}${overdue ? ' — süresi geçti' : ''}</div>` : ''}
      </span>
    </span>
    <span style="cursor:pointer;color:var(--t3);" onclick="taskDelete('${t.id}')" title="Sil"><i class="fa-solid fa-xmark"></i></span>
  </div>`;
}

async function taskAdd() {
  const title = document.getElementById('task-title').value.trim();
  const dueDate = document.getElementById('task-date').value;
  if (!title) { toast('Görev başlığı gerekli', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/tasks', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, dueDate: dueDate || null })
  });
  document.getElementById('task-title').value = '';
  document.getElementById('task-date').value = '';
  toast('Görev eklendi', 'fa-solid fa-check', true);
  taskRenderList();
}

async function taskToggle(id, done) {
  await fetch('/api/tasks/' + id, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done })
  });
  taskRenderList();
}

async function taskDelete(id) {
  await fetch('/api/tasks/' + id, { method: 'DELETE' });
  taskRenderList();
}

// ══════════════════════════════════════════════════════
// NOTLAR — müvekkilden bağımsız serbest notlar
// ══════════════════════════════════════════════════════
async function noteOnOpen() {
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  await noteRenderList();
}

async function noteRenderList() {
  const dp = document.getElementById('detailPane');
  try {
    const res = await fetch('/api/notes');
    const data = await res.json();
    const notes = data.notes || [];
    dp.innerHTML = `
      <div style="padding:22px 24px;overflow-y:auto;height:100%;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:10px;">
          Notlarınız (${notes.length})
        </div>
        ${notes.length ? notes.map(n => `
          <div style="padding:10px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
              <div style="flex:1;">
                <div style="font-size:10px;color:var(--t3);margin-bottom:3px;">${new Date(n.createdAt).toLocaleString('tr-TR')}</div>
                <div style="font-size:13px;white-space:pre-wrap;">${n.content}</div>
              </div>
              <span style="cursor:pointer;color:var(--t3);flex-shrink:0;" onclick="noteDelete('${n.id}')" title="Sil"><i class="fa-solid fa-xmark"></i></span>
            </div>
            <button class="pop-cta-btn b" style="width:auto;padding:4px 10px;font-size:11px;margin-top:6px;" onclick="noteAnalyze('${n.id}')"><i class="fa-solid fa-wand-magic-sparkles"></i><span>AI ile Analiz Et</span></button>
            <div id="note-ai-${n.id}" style="margin-top:8px;"></div>
          </div>
        `).join('') : emptyState('fa-note-sticky', 'Henüz not yok', 'İlk notunuzu yukarıdan ekleyin.')}
      </div>
    `;
  } catch (e) {
    dp.innerHTML = `<div style="padding:20px;color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

async function noteAdd() {
  const content = document.getElementById('note-text').value.trim();
  if (!content) return;
  await fetch('/api/notes', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  document.getElementById('note-text').value = '';
  toast('Not kaydedildi', 'fa-solid fa-check', true);
  noteRenderList();
}

async function noteDelete(id) {
  await fetch('/api/notes/' + id, { method: 'DELETE' });
  noteRenderList();
}

// ══════════════════════════════════════════════════════
// GELİR-GİDER — büronun genel kasası
// ══════════════════════════════════════════════════════
async function txOnOpen() {
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  await txRenderList();
}

async function txRenderList() {
  const dp = document.getElementById('detailPane');
  try {
    const [txRes, recRes] = await Promise.all([
      fetch('/api/transactions'),
      fetch('/api/receivables'),
    ]);
    const data = await txRes.json();
    const recData = await recRes.json();
    const txs = data.transactions || [];
    const receivables = recData.rows || [];
    const toplamAlacak = recData.total || 0;
    const toplamGelir = txs.filter(t => t.type === 'gelir').reduce((s, t) => s + t.amount, 0);
    const toplamGider = txs.filter(t => t.type === 'gider').reduce((s, t) => s + t.amount, 0);
    const net = toplamGelir - toplamGider;

    dp.innerHTML = `
      <div style="padding:22px 24px;overflow-y:auto;height:100%;">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
          <div style="background:var(--bg2);border-radius:var(--r);padding:12px;text-align:center;">
            <div style="font-size:10px;color:var(--t3);text-transform:uppercase;margin-bottom:4px;">Gelir</div>
            <div style="font-family:'JetBrains Mono',monospace;color:var(--success);font-weight:600;">${fmtTL(toplamGelir)}</div>
          </div>
          <div style="background:var(--bg2);border-radius:var(--r);padding:12px;text-align:center;">
            <div style="font-size:10px;color:var(--t3);text-transform:uppercase;margin-bottom:4px;">Gider</div>
            <div style="font-family:'JetBrains Mono',monospace;color:var(--danger);font-weight:600;">${fmtTL(toplamGider)}</div>
          </div>
          <div style="background:var(--bg2);border-radius:var(--r);padding:12px;text-align:center;">
            <div style="font-size:10px;color:var(--t3);text-transform:uppercase;margin-bottom:4px;">Net</div>
            <div style="font-family:'JetBrains Mono',monospace;color:${net>=0?'var(--gold)':'var(--danger)'};font-weight:600;">${fmtTL(net)}</div>
          </div>
          <div style="background:var(--gold-lo);border:1px solid var(--gold-rule);border-radius:var(--r);padding:12px;text-align:center;">
            <div style="font-size:10px;color:var(--t3);text-transform:uppercase;margin-bottom:4px;">Bekleyen Alacaklar</div>
            <div style="font-family:'JetBrains Mono',monospace;color:var(--warn);font-weight:600;">${fmtTL(toplamAlacak)}</div>
          </div>
        </div>

        ${receivables.length ? `
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:8px;"><i class="fa-solid fa-hourglass-half"></i> Bekleyen Alacaklar (${receivables.length})</div>
          ${receivables.map(r => `
            <div class="cr-row" style="padding:6px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="mvSelect('${r.clientId}')">
              <span>${r.clientName} — ${r.caseTitle}</span>
              <span style="font-family:'JetBrains Mono',monospace;color:var(--warn);">${fmtTL(r.remaining)}</span>
            </div>
          `).join('')}
          <div style="margin-bottom:20px;"></div>
        ` : ''}

        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:10px;">Hareketler (${txs.length})</div>
        ${txs.length ? txs.map(t => `
          <div class="cr-row" style="padding:7px 0;border-bottom:1px solid var(--border);">
            <span>
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${t.type==='gelir'?'var(--success)':'var(--danger)'};margin-right:6px;"></span>
              ${t.description} <span style="color:var(--t3);font-size:11px;">— ${new Date(t.date).toLocaleDateString('tr-TR')}</span>
            </span>
            <span style="display:flex;align-items:center;gap:8px;">
              <span style="font-family:'JetBrains Mono',monospace;color:${t.type==='gelir'?'var(--success)':'var(--danger)'};">${t.type==='gelir'?'+':'-'}${fmtTL(t.amount)}</span>
              <span style="cursor:pointer;color:var(--t3);" onclick="txDelete('${t.id}')" title="Sil"><i class="fa-solid fa-xmark"></i></span>
            </span>
          </div>
        `).join('') : emptyState('fa-scale-balanced', 'Henüz kayıt yok', 'İlk gelir/gider kaydınızı yukarıdan ekleyin.')}
      </div>
    `;
  } catch (e) {
    dp.innerHTML = `<div style="padding:20px;color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

async function txAdd() {
  const type = document.getElementById('tx-type').value;
  const amount = tlParseValue(document.getElementById('tx-amount').value);
  const description = document.getElementById('tx-desc').value.trim();
  const date = document.getElementById('tx-date').value;
  if (!amount || !description) { toast('Tutar ve açıklama girin', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/transactions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, amount, description, date: date || null })
  });
  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-desc').value = '';
  document.getElementById('tx-date').value = '';
  toast('Kayıt eklendi', 'fa-solid fa-check', true);
  txRenderList();
}

async function txDelete(id) {
  await fetch('/api/transactions/' + id, { method: 'DELETE' });
  txRenderList();
}

// ══════════════════════════════════════════════════════
// MÜVEKKİL TABLOSU — tam liste, filtrele, CSV/Excel'e aktar
// ══════════════════════════════════════════════════════
let tblAllRows = [];

async function tblOnOpen() {
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  try {
    const res = await fetch('/api/clients?full=1');
    const data = await res.json();
    tblAllRows = data.clients || [];
    tblRender(tblAllRows);
  } catch (e) {
    dp.innerHTML = `<div style="padding:20px;color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

function tblFilter() {
  const q = (document.getElementById('tbl-search')?.value || '').toLowerCase();
  const filtered = q ? tblAllRows.filter(r => r.name.toLowerCase().includes(q)) : tblAllRows;
  tblRender(filtered);
}

function tblRender(rows) {
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `
    <div style="padding:22px 24px;overflow:auto;height:100%;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:10px;">
        Toplam ${rows.length} müvekkil
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
        <thead>
          <tr style="border-bottom:1px solid var(--border);text-align:left;">
            <th style="padding:8px 10px;color:var(--t3);font-size:10.5px;text-transform:uppercase;">Ad Soyad</th>
            <th style="padding:8px 10px;color:var(--t3);font-size:10.5px;text-transform:uppercase;">Telefon</th>
            <th style="padding:8px 10px;color:var(--t3);font-size:10.5px;text-transform:uppercase;">E-posta</th>
            <th style="padding:8px 10px;color:var(--t3);font-size:10.5px;text-transform:uppercase;">Dosya</th>
            <th style="padding:8px 10px;color:var(--t3);font-size:10.5px;text-transform:uppercase;">Toplam Fatura</th>
            <th style="padding:8px 10px;color:var(--t3);font-size:10.5px;text-transform:uppercase;">Yaklaşan Tarih</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr style="border-bottom:1px solid var(--border);cursor:pointer;" onclick="mvSelect('${r.id}')">
              <td style="padding:8px 10px;">${r.name}</td>
              <td style="padding:8px 10px;color:var(--t2);">${r.phone || '—'}</td>
              <td style="padding:8px 10px;color:var(--t2);">${r.email || '—'}</td>
              <td style="padding:8px 10px;text-align:center;">${r.caseCount}</td>
              <td style="padding:8px 10px;font-family:'JetBrains Mono',monospace;">${r.totalInvoiced ? fmtTL(r.totalInvoiced) : '—'}</td>
              <td style="padding:8px 10px;color:var(--t2);">${r.nextEventDate ? new Date(r.nextEventDate).toLocaleDateString('tr-TR') : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${!rows.length ? emptyState('fa-user-large', 'Müvekkil bulunamadı', 'Arama teriminizi değiştirin ya da yeni bir müvekkil ekleyin.') : ''}
    </div>
  `;
}

function tblExportCsv() {
  const q = (document.getElementById('tbl-search')?.value || '').toLowerCase();
  const rows = q ? tblAllRows.filter(r => r.name.toLowerCase().includes(q)) : tblAllRows;
  if (!rows.length) { toast('Aktarılacak veri yok', 'fa-solid fa-triangle-exclamation'); return; }

  const header = ['Ad Soyad', 'Telefon', 'E-posta', 'Dosya Sayısı', 'Toplam Fatura (TL)', 'Yaklaşan Tarih'];
  const csvRows = rows.map(r => [
    r.name,
    r.phone || '',
    r.email || '',
    r.caseCount,
    r.totalInvoiced || 0,
    r.nextEventDate ? new Date(r.nextEventDate).toLocaleDateString('tr-TR') : ''
  ]);
  const csvContent = [header, ...csvRows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  // Excel'in Türkçe karakterleri doğru göstermesi için UTF-8 BOM ekliyoruz.
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'muvekkil-listesi.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('CSV dosyası indirildi', 'fa-solid fa-check', true);
}

// ══════════════════════════════════════════════════════
// GLOBAL ARAMA — müvekkil, not, görev, şablon içinde birden
// ══════════════════════════════════════════════════════
let gaTimer = null;

function gaSearch() {
  clearTimeout(gaTimer);
  const q = document.getElementById('ga-q').value.trim();
  const box = document.getElementById('ga-results');
  if (q.length < 2) { box.innerHTML = ''; return; }
  gaTimer = setTimeout(async () => {
    box.innerHTML = `<div style="font-size:12px;color:var(--t3);padding:10px 0;">Aranıyor…</div>`;
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(q));
      const data = await res.json();
      gaRender(data.results || []);
    } catch (e) {
      box.innerHTML = `<div style="font-size:12px;color:var(--danger);">Arama yapılamadı.</div>`;
    }
  }, 350);
}

const GA_TYPE_META = {
  muvekkil: { icon: 'fa-user', label: 'Müvekkil' },
  not: { icon: 'fa-note-sticky', label: 'Not' },
  gorev: { icon: 'fa-list-check', label: 'Görev' },
  sablon: { icon: 'fa-layer-group', label: 'Şablon' },
};

function gaRender(results) {
  const box = document.getElementById('ga-results');
  if (!results.length) {
    box.innerHTML = `<div style="font-size:12px;color:var(--t3);padding:10px 0;">Sonuç bulunamadı.</div>`;
    return;
  }
  box.innerHTML = `<div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:10px 0 6px;">${results.length} sonuç</div>` +
    results.map(r => {
      const meta = GA_TYPE_META[r.type] || { icon: 'fa-circle', label: r.type };
      return `<div class="s-item" style="margin:0 0 4px;" onclick="gaOpen('${r.type}','${r.id}')">
        <span class="ico"><i class="fa-solid ${meta.icon}"></i></span>
        <span>${r.title}<span style="display:block;font-size:10px;color:var(--t3);">${meta.label}${r.subtitle ? ' — ' + r.subtitle : ''}</span></span>
      </div>`;
    }).join('');
}

function gaOpen(type, id) {
  if (type === 'muvekkil') {
    mvSelect(id);
  } else if (type === 'gorev') {
    openPopup('gorevler');
  } else if (type === 'not') {
    openPopup('notlar');
  } else if (type === 'sablon') {
    toast('Şablonlar artık Belge & Analiz modülünde', 'fa-solid fa-circle-info');
    window.location.href = '/dashboard/belge?open=sablon';
  }
}

// ══════════════════════════════════════════════════════
// AKILLI NOTLAR — bir notu AI ile analiz ettirme
// ══════════════════════════════════════════════════════
async function noteAnalyze(noteId) {
  const notes = await (await fetch('/api/notes')).json();
  const note = (notes.notes || []).find(n => n.id === noteId);
  const box = document.getElementById('note-ai-' + noteId);
  if (!note || !box) return;

  box.innerHTML = `<div style="font-size:12px;color:var(--t3);"><i class="fa-solid fa-spinner fa-spin"></i> Analiz ediliyor…</div>`;

  const form = new FormData();
  form.append('pastedText', note.content);
  form.append('instruction', 'Bu notu özetle, önemli noktaları ve varsa yapılması gereken aksiyon maddelerini listele.');
  form.append('mode', 'dosya');
  form.append('wantUdf', '0');

  try {
    const res = await fetch('/api/tools/analyze', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) {
      box.innerHTML = `<div style="font-size:12px;color:var(--danger);">${data.error || 'Analiz edilemedi.'}</div>`;
      return;
    }
    box.innerHTML = `<div style="background:var(--bg2);border-radius:var(--r);padding:10px;font-size:12.5px;white-space:pre-wrap;line-height:1.5;">${(data.analysis || '').replace(/</g, '&lt;')}</div>`;
  } catch (e) {
    box.innerHTML = `<div style="font-size:12px;color:var(--danger);">Bağlantı hatası.</div>`;
  }
}

// ══════════════════════════════════════════════════════
// SÖZLEŞME TAKİP
// ══════════════════════════════════════════════════════
async function szOnOpen() {
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(4)}</div>`;
  await szRenderList();
}

function szDaysLeftInfo(endDate) {
  const end = new Date(endDate);
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const now = new Date();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((endMidnight.getTime() - nowMidnight.getTime()) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)} gün önce doldu`, color: 'var(--danger)' };
  if (days === 0) return { text: 'Bugün doluyor', color: 'var(--danger)' };
  if (days <= 30) return { text: `${days} gün kaldı`, color: days <= 7 ? 'var(--danger)' : 'var(--warn)' };
  return { text: `${days} gün kaldı`, color: 'var(--t2)' };
}

async function szRenderList() {
  const dp = document.getElementById('detailPane');
  try {
    const res = await fetch('/api/contracts');
    const data = await res.json();
    const contracts = data.contracts || [];
    dp.innerHTML = `
      <div style="padding:22px 24px;overflow-y:auto;height:100%;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:10px;">Sözleşmeler (${contracts.length})</div>
        ${contracts.length ? contracts.map(c => {
          const dl = szDaysLeftInfo(c.endDate);
          return `<div style="padding:10px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
              <div>
                <div style="font-size:13.5px;font-weight:500;">${c.title}</div>
                <div style="font-size:11px;color:var(--t3);">${c.counterparty || ''}${c.notes ? ' — ' + c.notes : ''}</div>
              </div>
              <span style="cursor:pointer;color:var(--t3);flex-shrink:0;" onclick="szDelete('${c.id}')"><i class="fa-solid fa-xmark"></i></span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
              <span style="font-size:11px;color:var(--t3);">Bitiş: ${new Date(c.endDate).toLocaleDateString('tr-TR')}</span>
              <span style="font-size:11px;font-weight:600;color:${dl.color};">${dl.text}</span>
            </div>
          </div>`;
        }).join('') : emptyState('fa-file-contract', 'Henüz sözleşme eklenmedi', 'Takip etmek istediğiniz ilk sözleşmeyi ekleyin.')}
      </div>
    `;
  } catch (e) {
    dp.innerHTML = `<div style="padding:20px;color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

async function szAdd() {
  const title = document.getElementById('sz-title').value.trim();
  const counterparty = document.getElementById('sz-counterparty').value;
  const startDate = document.getElementById('sz-start').value;
  const endDate = document.getElementById('sz-end').value;
  const notes = document.getElementById('sz-notes').value;
  if (!title || !endDate) { toast('Sözleşme adı ve bitiş tarihi gerekli', 'fa-solid fa-triangle-exclamation'); return; }

  await fetch('/api/contracts', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, counterparty, startDate: startDate || null, endDate, notes })
  });
  document.getElementById('sz-title').value = '';
  document.getElementById('sz-counterparty').value = '';
  document.getElementById('sz-start').value = '';
  document.getElementById('sz-end').value = '';
  document.getElementById('sz-notes').value = '';
  toast('Sözleşme eklendi', 'fa-solid fa-check', true);
  szRenderList();
}

async function szDelete(id) {
  if (!confirm('Bu sözleşmeyi silmek istediğinize emin misiniz?')) return;
  await fetch('/api/contracts/' + id, { method: 'DELETE' });
  toast('Sözleşme silindi', 'fa-solid fa-trash');
  szRenderList();
}

// ══════════════════════════════════════════════════════
// ZAMAN ÇİZELGESİ — bir dosyanın tarihlerini, faturalarını ve zaman
// kayıtlarını tek kronolojik görünümde birleştirir.
// ══════════════════════════════════════════════════════
function mvShowTimeline() {
  const cs = mvCaseCache;
  if (!cs) return;
  const dp = document.getElementById('detailPane');

  const items = [];
  (cs.events || []).forEach(e => items.push({
    date: new Date(e.dueDate), icon: 'fa-gavel', color: 'var(--danger)',
    label: eventTypeLabel(e.type), text: e.title,
  }));
  (cs.invoices || []).forEach(i => items.push({
    date: new Date(i.createdAt), icon: 'fa-file-invoice-dollar', color: 'var(--success)',
    label: 'Fatura', text: `${fmtTL(i.amount)}${i.note ? ' — ' + i.note : ''}`,
  }));
  (cs.timeEntries || []).forEach(t => items.push({
    date: new Date(t.date), icon: 'fa-stopwatch', color: 'var(--gold)',
    label: 'Zaman Kaydı', text: `${t.hours} saat${t.description ? ' — ' + t.description : ''}`,
  }));
  items.sort((a, b) => b.date - a.date);

  dp.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;">
      <div style="cursor:pointer;color:var(--t3);font-size:12px;margin-bottom:12px;" onclick="mvOpenCase('${cs.id}')">
        <i class="fa-solid fa-arrow-left"></i> Dosya Detayına Dön
      </div>
      <div style="font-family:'Instrument Serif',serif;font-size:19px;margin-bottom:16px;">${cs.title} — Zaman Çizelgesi</div>
      ${items.length ? `
        <div style="position:relative;padding-left:28px;">
          <div style="position:absolute;left:9px;top:6px;bottom:6px;width:2px;background:var(--border);"></div>
          ${items.map(it => `
            <div style="position:relative;margin-bottom:18px;">
              <div style="position:absolute;left:-28px;top:0;width:20px;height:20px;border-radius:50%;background:var(--card);border:2px solid ${it.color};display:flex;align-items:center;justify-content:center;">
                <i class="fa-solid ${it.icon}" style="font-size:9px;color:${it.color};"></i>
              </div>
              <div style="font-size:10px;color:var(--t3);margin-bottom:2px;">${it.date.toLocaleDateString('tr-TR')} · ${it.label}</div>
              <div style="font-size:13px;">${it.text}</div>
            </div>
          `).join('')}
        </div>
      ` : '<div style="font-size:12px;color:var(--t3);">Henüz bir kayıt yok.</div>'}
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// EKİP YÖNETİMİ — büro üyeleri, davet linki oluşturma
// ══════════════════════════════════════════════════════
async function ekipOnOpen() {
  ekipGetPane().innerHTML = `<div style="padding:30px 24px;color:var(--t3);font-size:13px;">Bir üyenin "Yetkiler" bağlantısına tıklayınca, erişim ayarları burada görünecek.</div>`;
  const box = document.getElementById('ekip-box');
  box.innerHTML = skeletonLines(3);
  try {
    const res = await fetch('/api/workspace');
    const data = await res.json();
    if (!res.ok) { box.innerHTML = `<div style="color:var(--danger);font-size:13px;">${data.error || 'Yüklenemedi.'}</div>`; return; }
    ekipRender(data.workspace, data.myRole);
  } catch (e) {
    box.innerHTML = `<div style="color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

function ekipRender(ws, myRole) {
  const box = document.getElementById('ekip-box');
  const isAdmin = myRole === 'admin';
  ekipMembersCache = ws.members;
  box.innerHTML = `
    <div class="fg">
      <div class="fl">Büro Adı</div>
      <div style="display:flex;gap:6px;">
        <input type="text" id="ekip-name" value="${ws.name.replace(/"/g,'&quot;')}" ${isAdmin ? '' : 'disabled'} style="flex:1;min-width:0;">
        ${isAdmin ? `<button class="pop-cta-btn b" style="width:auto;padding:6px 12px;flex-shrink:0;" onclick="ekipSaveName()">Kaydet</button>` : ''}
      </div>
    </div>

    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 8px;">
      Üyeler (${ws.members.length}/${ws.memberLimit})
    </div>
    ${ws.members.map(m => `
      <div class="cr-row" style="padding:7px 0;border-bottom:1px solid var(--border);">
        <span>${m.name || m.email} <span style="font-size:10px;color:var(--t3);">${m.workspaceRole === 'admin' ? '(Yönetici)' : '(Üye)'}</span></span>
        <span style="display:flex;gap:10px;align-items:center;">
          ${isAdmin && m.workspaceRole !== 'admin' ? `<span style="cursor:pointer;color:var(--gold);font-size:11px;" onclick='ekipShowPermissions(${JSON.stringify(m.id)})'>Yetkiler</span>` : ''}
          ${isAdmin && m.workspaceRole !== 'admin' ? `<span style="cursor:pointer;color:var(--danger);font-size:11px;" onclick="ekipRemoveMember('${m.id}')">Çıkar</span>` : ''}
        </span>
      </div>
    `).join('')}

    ${isAdmin ? `
      <button class="pop-cta-btn b" style="width:100%;margin-top:16px;" onclick="ekipCreateInvite()" ${ws.members.length >= ws.memberLimit ? 'disabled' : ''}>
        <i class="fa-solid fa-user-plus"></i><span>Davet Linki Oluştur</span>
      </button>
      ${ws.members.length >= ws.memberLimit ? '<div style="font-size:11px;color:var(--warn);margin-top:6px;">Üye limitine ulaşıldı.</div>' : ''}
      <div id="ekip-invite-result" style="margin-top:10px;"></div>
    ` : '<div style="font-size:11px;color:var(--t3);margin-top:12px;">Sadece büro yöneticisi üye davet edebilir/çıkarabilir.</div>'}
  `;
  box.dataset.workspaceId = ws.id;
}

async function ekipSaveName() {
  const name = document.getElementById('ekip-name').value.trim();
  if (!name) { toast('Büro adı gerekli', 'fa-solid fa-triangle-exclamation'); return; }
  const res = await fetch('/api/workspace', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (res.ok) toast('Büro adı güncellendi', 'fa-solid fa-check', true);
  else toast('Güncellenemedi', 'fa-solid fa-triangle-exclamation');
}

async function ekipCreateInvite() {
  const res = await fetch('/api/workspace/invite', { method: 'POST' });
  const data = await res.json();
  const box = document.getElementById('ekip-invite-result');
  if (!res.ok) {
    box.innerHTML = `<div style="font-size:12px;color:var(--danger);">${data.error || 'Oluşturulamadı.'}</div>`;
    return;
  }
  const link = window.location.origin + '/davet/' + data.token;
  box.innerHTML = `
    <div style="font-size:11px;color:var(--t3);margin-bottom:4px;">Bu bağlantıyı davet etmek istediğiniz kişiye gönderin:</div>
    <div style="display:flex;gap:6px;">
      <input type="text" readonly value="${link}" style="flex:1;min-width:0;font-size:11px;" onclick="this.select()">
      <button class="pop-cta-btn b" style="width:auto;padding:6px 10px;flex-shrink:0;" onclick="navigator.clipboard.writeText('${link}');toast('Kopyalandı','fa-solid fa-check',true)"><i class="fa-solid fa-copy"></i></button>
    </div>
  `;
}

async function ekipRemoveMember(userId) {
  if (!confirm('Bu üyeyi bürodan çıkarmak istediğinize emin misiniz? Kendi ayrı bürosuna taşınacak.')) return;
  const res = await fetch('/api/workspace/members/' + userId, { method: 'DELETE' });
  if (res.ok) { toast('Üye çıkarıldı', 'fa-solid fa-check', true); ekipOnOpen(); }
  else toast('Çıkarılamadı', 'fa-solid fa-triangle-exclamation');
}

let ekipMembersCache = [];

function ekipGetPane() {
  return document.getElementById('detailPane');
}

function ekipShowPermissions(memberId) {
  const member = ekipMembersCache.find(m => m.id === memberId);
  if (!member) return;
  const blocked = new Set(member.blockedTools || []);
  const modules = window.MODULES_INDEX || [];

  const panel = ekipGetPane();
  panel.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;box-sizing:border-box;">
    <div style="font-size:14px;font-family:'Instrument Serif',serif;margin-bottom:12px;">${member.name || member.email} — Erişim Yetkileri</div>

    <label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);margin-bottom:8px;cursor:pointer;">
      <input type="checkbox" id="ekip-perm-ai" ${member.aiEnabled === false ? '' : 'checked'}>
      <span style="font-size:12.5px;"><strong>AI Kullanımı</strong> (sohbet, Dosya Analizi, Dilekçe Sihirbazı vb. — kapatılırsa hiçbiri kullanılamaz)</span>
    </label>

    ${modules.map(mod => `
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:10px 0 4px;">${mod.label}</div>
      ${mod.items.map(item => `
        <label style="display:flex;align-items:center;gap:8px;padding:3px 0;cursor:pointer;">
          <input type="checkbox" class="ekip-perm-tool" value="${item.id}" ${blocked.has(item.id) ? '' : 'checked'}>
          <span style="font-size:12px;">${item.name}</span>
        </label>
      `).join('')}
    `).join('')}

    <button class="pop-cta-btn b" style="width:100%;margin-top:14px;" onclick="ekipSavePermissions('${memberId}')"><i class="fa-solid fa-floppy-disk"></i><span>Kaydet</span></button>
    </div>
  `;
}

async function ekipSavePermissions(memberId) {
  const aiEnabled = document.getElementById('ekip-perm-ai').checked;
  const checkboxes = document.querySelectorAll('.ekip-perm-tool');
  const blockedTools = Array.from(checkboxes).filter(cb => !cb.checked).map(cb => cb.value);

  const res = await fetch(`/api/workspace/members/${memberId}/permissions`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockedTools, aiEnabled })
  });
  if (res.ok) {
    toast('Yetkiler güncellendi', 'fa-solid fa-check', true);
    ekipOnOpen();
  } else {
    toast('Güncellenemedi', 'fa-solid fa-triangle-exclamation');
  }
}
