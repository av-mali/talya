// Bu dosya SADECE 'Büro Yönetimi' modülüne aittir.
// 3 sütunlu orijinal tasarım korunuyor: sol = öğe listesi, orta (340px) =
// arama/liste, sağ (detailPane) = seçilen müvekkilin/günün detayı.
window.CURRENT_MODULE = {
  key: 'buro',
  label: 'Büro Yönetimi',
  nameHtml: `Büro <em class="b">Yönetimi</em>`,
  color: 'b',
  items: [
    {"id": "muvekkil", "icon": "fa-users", "name": "Müvekkil Yönetimi"},
    {"id": "sure", "icon": "fa-calendar-xmark", "name": "Süre & Takvim", "badge": "3"},
    {"id": "arsiv", "icon": "fa-box-archive", "name": "Belge Arşivi"},
    {"id": "ucret", "icon": "fa-calculator", "name": "Ücret Hesaplayıcı"},
    {"id": "rapor", "icon": "fa-file-circle-check", "name": "Müvekkil Raporu"},
    {"id": "fatura", "icon": "fa-receipt", "name": "Fatura & Tahsilat"}
  ],
  popups: {
    // ── MÜVEKKİL YÖNETİMİ ── orta: arama+liste, sağ: seçilen müvekkilin detayı
    muvekkil: {
      badge: 'b', badgeText: 'Büro CRM · Canlı Veri', titleHtml: 'Müvekkil <em class="b">Yönetimi</em>',
      desc: 'Bir müvekkil seçin; bilgileri sağda görünsün.',
      btnClass: 'b', btnIco: 'fa-id-card', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><input type="text" id="mv-search" placeholder="Müvekkil ara…" oninput="mvSearch()"></div>
        <button class="pop-cta-btn b" style="width:100%;margin-bottom:12px;" onclick="mvToggleNew()">
          <i class="fa-solid fa-user-plus"></i><span id="mv-toggle-lbl">Yeni Müvekkil</span>
        </button>
        <div id="mv-new-form" style="display:none;margin-bottom:14px;padding:12px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);">
          <div class="fg"><div class="fl">Ad Soyad</div><input type="text" id="mv-n-name" placeholder="Müvekkil adı…"></div>
          <div class="fg"><div class="fl">Telefon</div><input type="text" id="mv-n-phone" placeholder="05__ ___ __ __"></div>
          <div class="fg"><div class="fl">E-posta</div><input type="text" id="mv-n-email" placeholder="mail@ornek.com"></div>
          <div class="fg"><div class="fl">Dava Konusu / Not</div><textarea id="mv-n-note" rows="2" placeholder="Kısa not…"></textarea></div>
          <button class="pop-cta-btn b" style="width:100%;" onclick="mvSaveNew()"><span>Kaydet</span></button>
        </div>
        <div id="mv-list"></div>
      `,
      onOpen: () => mvOnOpen(),
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
    // ── AŞAĞIDAKİ 2 PANEL ORİJİNAL TASARIMDA OLDUĞU GİBİ (değişmedi) ──
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
    }
  }
};

// ══════════════════════════════════════════════════════
// ORTAK YARDIMCI FONKSİYONLAR
// ══════════════════════════════════════════════════════
function fmtTL(n) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n); }

function mvDaysLeft(dueDate) {
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
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
  el.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--t3);">Yükleniyor…</div>`;
  try {
    const res = await fetch('/api/clients' + (q ? '?q=' + encodeURIComponent(q) : ''));
    const data = await res.json();
    const clients = data.clients || [];
    if (!clients.length) {
      el.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--t3);">Müvekkil bulunamadı.</div>`;
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

function mvOnOpen() {
  mvSelectedId = null;
  loadClientList('mv-list', '', 'mvSelect');
}

function mvSearch() {
  const q = document.getElementById('mv-search').value.trim();
  loadClientList('mv-list', q, 'mvSelect', mvSelectedId);
}

function mvToggleNew() {
  const form = document.getElementById('mv-new-form');
  const lbl = document.getElementById('mv-toggle-lbl');
  const open = form.style.display !== 'none';
  form.style.display = open ? 'none' : 'block';
  lbl.textContent = open ? 'Yeni Müvekkil' : 'Vazgeç';
}

async function mvSaveNew() {
  const name = document.getElementById('mv-n-name').value.trim();
  if (!name) { toast('Müvekkil adı gerekli', 'fa-solid fa-triangle-exclamation'); return; }
  const phone = document.getElementById('mv-n-phone').value;
  const email = document.getElementById('mv-n-email').value;
  const notes = document.getElementById('mv-n-note').value;
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
    mvToggleNew();
    await loadClientList('mv-list', '', 'mvSelect');
    mvSelect(data.client.id);
  }
}

async function mvSelect(id) {
  mvSelectedId = id;
  loadClientList('mv-list', document.getElementById('mv-search')?.value || '', 'mvSelect', id);
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:20px;font-size:12px;color:var(--t3);">Yükleniyor…</div>`;
  const res = await fetch('/api/clients/' + id);
  const data = await res.json();
  if (!data.client) { dp.innerHTML = detailPlaceholder(); return; }
  const c = data.client;

  dp.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;">
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

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-calendar-days"></i> Duruşma & Ödeme Tarihleri</div>
      <div id="mv-events">${c.events.length ? c.events.map(ev => {
        const dl = mvDaysLeft(ev.dueDate);
        return `<div class="dl-row"><span class="dl-tag ${dl.color==='var(--danger)'?'crit':dl.color==='var(--warn)'?'warn':''}">${ev.type==='durusma'?'DURUŞMA':'ÖDEME'}</span><span class="dl-text">${ev.title} — ${new Date(ev.dueDate).toLocaleDateString('tr-TR')}</span><span class="dl-days" style="color:${dl.color}">${dl.text}</span><span style="cursor:pointer;color:var(--t3);margin-left:8px;" onclick="mvDeleteEvent('${ev.id}')" title="Sil"><i class="fa-solid fa-xmark"></i></span></div>`;
      }).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz tarih eklenmedi.</div>'}</div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
        <select id="mv-ev-type" style="width:110px;"><option value="durusma">Duruşma</option><option value="odeme">Ödeme</option></select>
        <input type="text" id="mv-ev-title" placeholder="Başlık…" style="flex:1;min-width:120px;">
        <input type="date" id="mv-ev-date" style="width:140px;">
        <button class="pop-cta-btn p" style="padding:6px 12px;" onclick="mvAddEvent()"><span>Ekle</span></button>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-file-invoice-dollar"></i> Faturalar</div>
      <div id="mv-invoices">${c.invoices.length ? c.invoices.map(inv => `<div class="cr-row" style="padding:5px 0;border-bottom:1px solid var(--border);"><span>${new Date(inv.createdAt).toLocaleDateString('tr-TR')}${inv.note?(' — '+inv.note):''}</span><span style="display:flex;align-items:center;gap:8px;"><span style="font-family:'JetBrains Mono',monospace;">${fmtTL(inv.amount)}</span><span style="cursor:pointer;color:var(--t3);" onclick="mvDeleteInvoice('${inv.id}')" title="Sil"><i class="fa-solid fa-xmark"></i></span></span></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz fatura yok.</div>'}</div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-comments"></i> Görüşme Geçmişi</div>
      <div id="mv-logs">${c.logs.length ? c.logs.map(l => `<div style="padding:6px 0;border-bottom:1px solid var(--border);"><div style="font-size:10px;color:var(--t3);">${new Date(l.createdAt).toLocaleString('tr-TR')}</div><div style="font-size:12.5px;">${l.content}</div></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz görüşme kaydı yok.</div>'}</div>
      <textarea id="mv-log-text" rows="2" placeholder="Ne konuşuldu, ne karar verildi…" style="margin-top:8px;"></textarea>
      <button class="pop-cta-btn b" style="width:100%;margin-top:6px;" onclick="mvAddLog()"><span>Notu Kaydet</span></button>
    </div>
  `;
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
  if (!confirm('Bu müvekkili ve tüm kayıtlarını silmek istediğinize emin misiniz?')) return;
  await fetch('/api/clients/' + mvSelectedId, { method: 'DELETE' });
  toast('Müvekkil silindi', 'fa-solid fa-trash');
  mvSelectedId = null;
  document.getElementById('detailPane').innerHTML = detailPlaceholder();
  loadClientList('mv-list', document.getElementById('mv-search')?.value || '', 'mvSelect');
}

async function mvAddEvent() {
  if (!mvSelectedId) return;
  const type = document.getElementById('mv-ev-type').value;
  const title = document.getElementById('mv-ev-title').value.trim();
  const dueDate = document.getElementById('mv-ev-date').value;
  if (!title || !dueDate) { toast('Başlık ve tarih girin', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/clients/' + mvSelectedId + '/events', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, title, dueDate })
  });
  toast('Tarih eklendi — takvime düştü', 'fa-solid fa-calendar-check', true);
  mvSelect(mvSelectedId);
}

async function mvDeleteEvent(eventId) {
  if (!mvSelectedId) return;
  if (!confirm('Bu tarihi silmek istediğinize emin misiniz?')) return;
  await fetch('/api/clients/' + mvSelectedId + '/events/' + eventId, { method: 'DELETE' });
  toast('Tarih silindi', 'fa-solid fa-trash');
  mvSelect(mvSelectedId);
}

async function mvDeleteInvoice(invoiceId) {
  if (!mvSelectedId) return;
  if (!confirm('Bu faturayı silmek istediğinize emin misiniz?')) return;
  await fetch('/api/clients/' + mvSelectedId + '/invoices/' + invoiceId, { method: 'DELETE' });
  toast('Fatura silindi', 'fa-solid fa-trash');
  mvSelect(mvSelectedId);
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
    <div style="padding:22px 24px;">
      <div id="cal-head" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <button class="pop-cta-btn b" style="padding:6px 12px;" onclick="calNav(-1)"><i class="fa-solid fa-chevron-left"></i></button>
        <div id="cal-month-label" style="font-family:'Instrument Serif',serif;font-size:18px;"></div>
        <button class="pop-cta-btn b" style="padding:6px 12px;" onclick="calNav(1)"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div id="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:20px;max-width:420px;"></div>
      <div id="cal-agenda"></div>
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
    html += `<div onclick="calSelectDay(${day})" style="cursor:pointer;text-align:center;padding:8px 0;border-radius:8px;font-size:13px;
      background:${isSel ? 'var(--gold)' : isToday ? 'var(--gold-lo)' : 'transparent'};
      color:${isSel ? '#fff' : 'var(--t0)'};">
      ${day}
      ${has ? `<div style="width:4px;height:4px;border-radius:50%;background:${isSel?'#fff':'var(--danger)'};margin:3px auto 0;"></div>` : ''}
    </div>`;
  }
  grid.innerHTML = html;

  let list = calSelectedDay ? (eventsByDay[calSelectedDay] || []) : calAllEvents.filter(ev => new Date(ev.dueDate) >= new Date(new Date().setHours(0,0,0,0)));
  list = list.slice().sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

  const title = calSelectedDay ? `${calSelectedDay} ${calViewDate.toLocaleDateString('tr-TR',{month:'long'})} — Ajanda` : 'Yaklaşan Tarihler';
  agenda.innerHTML = `<div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:8px;">${title}</div>` +
    (list.length ? list.map(ev => {
      const dl = mvDaysLeft(ev.dueDate);
      return `<div class="dl-row"><span class="dl-tag ${dl.color==='var(--danger)'?'crit':dl.color==='var(--warn)'?'warn':''}">${ev.type==='durusma'?'DURUŞMA':'ÖDEME'}</span><span class="dl-text">${ev.clientName} — ${ev.title}</span><span class="dl-days" style="color:${dl.color}">${dl.text}</span></div>`;
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
  dp.innerHTML = `<div style="padding:20px;font-size:12px;color:var(--t3);">Yükleniyor…</div>`;
  const res = await fetch('/api/clients/' + id);
  const data = await res.json();
  if (!data.client) { dp.innerHTML = detailPlaceholder(); return; }
  const c = data.client;

  const durusmalar = c.events.filter(e => e.type === 'durusma');
  const odemeler = c.events.filter(e => e.type === 'odeme');
  const toplamFatura = c.invoices.reduce((s, i) => s + i.amount, 0);
  const gecmisDurusma = durusmalar.filter(e => new Date(e.dueDate) < new Date());
  const gelecekDurusma = durusmalar.filter(e => new Date(e.dueDate) >= new Date());

  dp.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;">
      <div style="font-family:'Instrument Serif',serif;font-size:20px;">${c.name}</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:16px;">${c.phone||'—'}${c.email?(' · '+c.email):''}</div>

      <div class="cr-row" style="padding:8px 0;border-bottom:1px solid var(--border);">
        <span><i class="fa-solid fa-turkish-lira-sign" style="color:var(--gold);margin-right:6px;"></i>Anlaşılan / Faturalanan Ücret</span>
        <span style="font-family:'JetBrains Mono',monospace;font-weight:600;">${toplamFatura ? fmtTL(toplamFatura) : 'Belirtilmedi'}</span>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-gavel"></i> Duruşmalar</div>
      ${gelecekDurusma.length ? gelecekDurusma.map(e => {
        const dl = mvDaysLeft(e.dueDate);
        return `<div class="dl-row"><span class="dl-tag ${dl.color==='var(--danger)'?'crit':dl.color==='var(--warn)'?'warn':''}">YAKLAŞAN</span><span class="dl-text">${e.title} — ${new Date(e.dueDate).toLocaleDateString('tr-TR')}</span><span class="dl-days" style="color:${dl.color}">${dl.text}</span></div>`;
      }).join('') : ''}
      ${gecmisDurusma.length ? gecmisDurusma.map(e => `<div class="dl-row"><span class="dl-tag" style="background:var(--bg2);color:var(--t3);">GERÇEKLEŞTİ</span><span class="dl-text">${e.title} — ${new Date(e.dueDate).toLocaleDateString('tr-TR')}</span><span class="dl-days" style="color:var(--t3);">Tamamlandı</span></div>`).join('') : ''}
      ${!durusmalar.length ? '<div style="font-size:12px;color:var(--t3);">Duruşma kaydı yok.</div>' : ''}

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-file-invoice-dollar"></i> Ödeme Tarihleri</div>
      ${odemeler.length ? odemeler.map(e => {
        const dl = mvDaysLeft(e.dueDate);
        return `<div class="dl-row"><span class="dl-tag ${dl.color==='var(--danger)'?'crit':dl.color==='var(--warn)'?'warn':''}">ÖDEME</span><span class="dl-text">${e.title} — ${new Date(e.dueDate).toLocaleDateString('tr-TR')}</span><span class="dl-days" style="color:${dl.color}">${dl.text}</span></div>`;
      }).join('') : '<div style="font-size:12px;color:var(--t3);">Ödeme kaydı yok.</div>'}

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-comments"></i> Son Görüşme</div>
      ${c.logs.length ? `<div style="font-size:12.5px;">${c.logs[0].content}</div><div style="font-size:10px;color:var(--t3);margin-top:2px;">${new Date(c.logs[0].createdAt).toLocaleString('tr-TR')}</div>` : '<div style="font-size:12px;color:var(--t3);">Görüşme kaydı yok.</div>'}
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// FATURA & TAHSİLAT — sağ panelde fatura oluştur + yazdır
// ══════════════════════════════════════════════════════
let fatSelectedId = null;

function fatOnOpen() {
  fatSelectedId = null;
  loadClientList('fat-list', '', 'fatSelect');
}

function fatSearch() {
  const q = document.getElementById('fat-search').value.trim();
  loadClientList('fat-list', q, 'fatSelect', fatSelectedId);
}

async function fatSelect(id) {
  fatSelectedId = id;
  loadClientList('fat-list', document.getElementById('fat-search')?.value || '', 'fatSelect', id);
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `<div style="padding:20px;font-size:12px;color:var(--t3);">Yükleniyor…</div>`;
  const res = await fetch('/api/clients/' + id);
  const data = await res.json();
  if (!data.client) { dp.innerHTML = detailPlaceholder(); return; }
  fatRenderPane(data.client);
}

function fatRenderPane(c) {
  const dp = document.getElementById('detailPane');
  dp.innerHTML = `
    <div style="padding:22px 24px;overflow-y:auto;height:100%;">
      <div style="font-family:'Instrument Serif',serif;font-size:20px;">${c.name}</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:18px;">${c.phone||''}${c.email?(' · '+c.email):''}</div>
      <div class="fg"><div class="fl">Tutar (TL)</div><input type="text" id="fat-amount" placeholder="15000"></div>
      <div class="fg"><div class="fl">Açıklama (opsiyonel)</div><input type="text" id="fat-note" placeholder="Vekâlet ücreti…"></div>
      <button class="pop-cta-btn g" style="width:100%;" onclick="fatCreate('${c.id}')">
        <i class="fa-solid fa-file-invoice-dollar"></i><span>Fatura Oluştur</span>
      </button>
      <div id="fat-preview" style="margin-top:20px;"></div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:20px 0 6px;"><i class="fa-solid fa-clock-rotate-left"></i> Geçmiş Faturalar</div>
      <div id="fat-history">${c.invoices.length ? c.invoices.map(inv => `<div class="cr-row" style="padding:5px 0;border-bottom:1px solid var(--border);"><span>${new Date(inv.createdAt).toLocaleDateString('tr-TR')}${inv.note?(' — '+inv.note):''}</span><span style="font-family:'JetBrains Mono',monospace;">${fmtTL(inv.amount)}</span></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz fatura yok.</div>'}</div>
    </div>
  `;
}

async function fatCreate(clientId) {
  const amount = document.getElementById('fat-amount').value;
  const note = document.getElementById('fat-note').value;
  if (!amount) { toast('Tutar girin', 'fa-solid fa-triangle-exclamation'); return; }

  const clientRes = await fetch('/api/clients/' + clientId);
  const clientData = await clientRes.json();
  const clientName = clientData.client ? clientData.client.name : '';

  const res = await fetch('/api/clients/' + clientId + '/invoices', {
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

  // Sadece geçmiş listesini tazele — önizlemeyi (fat-preview) kaybetme.
  const fresh = await fetch('/api/clients/' + clientId);
  const freshData = await fresh.json();
  if (freshData.client) {
    document.getElementById('fat-history').innerHTML = freshData.client.invoices.length
      ? freshData.client.invoices.map(inv2 => `<div class="cr-row" style="padding:5px 0;border-bottom:1px solid var(--border);"><span>${new Date(inv2.createdAt).toLocaleDateString('tr-TR')}${inv2.note?(' — '+inv2.note):''}</span><span style="font-family:'JetBrains Mono',monospace;">${fmtTL(inv2.amount)}</span></div>`).join('')
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
