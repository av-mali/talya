// Bu dosya SADECE 'Büro Yönetimi' modülüne aittir.
// 'Müvekkil Yönetimi' ve 'Süre & Takvim' panelleri artık gerçek
// veritabanına bağlı (aşağıdaki mv*/cal* fonksiyonları). Diğer 4 panel
// (Belge Arşivi, Ücret Hesaplayıcı, Müvekkil Raporu, Fatura & Tahsilat)
// orijinal tasarımda olduğu gibi, AI'ya soru gönderen basit formlar.
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
    // ── MÜVEKKİL YÖNETİMİ (gerçek veritabanı) ──
    muvekkil: {
      badge: 'b', badgeText: 'Büro CRM · Canlı Veri', titleHtml: 'Müvekkil <em class="b">Yönetimi</em>',
      desc: 'Müvekkil ekleyin, arayın; görüşme geçmişi, fatura ve duruşma/ödeme tarihlerini yönetin.',
      btnClass: 'b', btnIco: 'fa-id-card', btnLbl: 'Kapat',
      hideCta: true,
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
        <div id="mv-detail"></div>
      `,
      onOpen: () => mvOnOpen(),
      prompt: () => ''
    },
    // ── SÜRE & TAKVİM (gerçek veritabanı) ──
    sure: {
      badge: 'b', badgeText: 'Kritik Süre Radarı · Canlı Veri', titleHtml: 'Süre &amp; <em class="b">Takvim</em>',
      desc: 'Müvekkil kayıtlarına eklediğiniz duruşma ve ödeme tarihleri burada görünür.',
      btnClass: 'b', btnIco: 'fa-clock-rotate-left', btnLbl: 'Kapat',
      hideCta: true,
      body: `
        <div id="cal-head" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <button class="pop-cta-btn b" style="padding:6px 12px;" onclick="calNav(-1)"><i class="fa-solid fa-chevron-left"></i></button>
          <div id="cal-month-label" style="font-family:'Instrument Serif',serif;font-size:16px;"></div>
          <button class="pop-cta-btn b" style="padding:6px 12px;" onclick="calNav(1)"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div id="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:14px;"></div>
        <div id="cal-agenda"></div>
      `,
      onOpen: () => calOnOpen(),
      prompt: () => ''
    },
    // ── AŞAĞIDAKİ 4 PANEL ORİJİNAL TASARIMDA OLDUĞU GİBİ (değişmedi) ──
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

// ══════════════════════════════════════════════════════
// MÜVEKKİL YÖNETİMİ — gerçek veritabanı fonksiyonları
// ══════════════════════════════════════════════════════
let mvSelectedId = null;

function mvOnOpen() {
  mvSelectedId = null;
  const detail = document.getElementById('mv-detail');
  if (detail) detail.innerHTML = '';
  mvLoadList('');
}

async function mvLoadList(q) {
  const listEl = document.getElementById('mv-list');
  if (!listEl) return;
  listEl.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--t3);">Yükleniyor…</div>`;
  try {
    const res = await fetch('/api/clients' + (q ? '?q=' + encodeURIComponent(q) : ''));
    const data = await res.json();
    const clients = data.clients || [];
    if (!clients.length) {
      listEl.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--t3);">Müvekkil bulunamadı.</div>`;
      return;
    }
    listEl.innerHTML = clients.map(c => {
      const next = c.events && c.events[0];
      const tag = next ? `<span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:9px;padding:1px 5px;border-radius:10px;background:var(--bg2);color:var(--t3);">${new Date(next.dueDate).toLocaleDateString('tr-TR')}</span>` : '';
      return `<div class="s-item ${mvSelectedId===c.id?'active-b':''}" style="margin:0 0 2px;" onclick="mvSelect('${c.id}')">
        <span class="ico"><i class="fa-solid fa-user"></i></span>${c.name}${tag}
      </div>`;
    }).join('');
  } catch (e) {
    listEl.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--danger);">Yüklenemedi.</div>`;
  }
}

function mvSearch() {
  const q = document.getElementById('mv-search').value.trim();
  mvLoadList(q);
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
    await mvLoadList('');
    mvSelect(data.client.id);
  }
}

function fmtTL(n) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n); }

function mvDaysLeft(dueDate) {
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: Math.abs(days) + ' gün geçti', color: 'var(--danger)' };
  if (days === 0) return { text: 'Bugün', color: 'var(--danger)' };
  if (days <= 3) return { text: days + ' gün kaldı', color: 'var(--danger)' };
  if (days <= 7) return { text: days + ' gün kaldı', color: 'var(--warn)' };
  return { text: days + ' gün kaldı', color: 'var(--t2)' };
}

async function mvSelect(id) {
  mvSelectedId = id;
  const detail = document.getElementById('mv-detail');
  detail.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--t3);">Yükleniyor…</div>`;
  const res = await fetch('/api/clients/' + id);
  const data = await res.json();
  if (!data.client) { detail.innerHTML = ''; return; }
  const c = data.client;

  detail.innerHTML = `
    <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);">
      <div style="font-family:'Instrument Serif',serif;font-size:18px;">${c.name}</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:12px;">${c.phone||'—'} ${c.email?(' · '+c.email):''}</div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:14px 0 6px;"><i class="fa-solid fa-calendar-days"></i> Duruşma & Ödeme Tarihleri</div>
      <div id="mv-events">${c.events.length ? c.events.map(ev => {
        const dl = mvDaysLeft(ev.dueDate);
        return `<div class="dl-row"><span class="dl-tag ${dl.color==='var(--danger)'?'crit':dl.color==='var(--warn)'?'warn':''}">${ev.type==='durusma'?'DURUŞMA':'ÖDEME'}</span><span class="dl-text">${ev.title} — ${new Date(ev.dueDate).toLocaleDateString('tr-TR')}</span><span class="dl-days" style="color:${dl.color}">${dl.text}</span></div>`;
      }).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz tarih eklenmedi.</div>'}</div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
        <select id="mv-ev-type" style="width:110px;"><option value="durusma">Duruşma</option><option value="odeme">Ödeme</option></select>
        <input type="text" id="mv-ev-title" placeholder="Başlık…" style="flex:1;min-width:120px;">
        <input type="date" id="mv-ev-date" style="width:140px;">
        <button class="pop-cta-btn p" style="padding:6px 12px;" onclick="mvAddEvent()"><span>Ekle</span></button>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-file-invoice-dollar"></i> Faturalar</div>
      <div id="mv-invoices">${c.invoices.length ? c.invoices.map(inv => `<div class="cr-row" style="padding:5px 0;border-bottom:1px solid var(--border);"><span>${new Date(inv.createdAt).toLocaleDateString('tr-TR')}${inv.note?(' — '+inv.note):''}</span><span style="font-family:'JetBrains Mono',monospace;">${fmtTL(inv.amount)}</span></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz fatura yok.</div>'}</div>
      <div style="display:flex;gap:6px;margin-top:8px;">
        <input type="text" id="mv-inv-amount" placeholder="Tutar (TL)" style="width:120px;">
        <input type="text" id="mv-inv-note" placeholder="Açıklama…" style="flex:1;">
        <button class="pop-cta-btn g" style="padding:6px 12px;" onclick="mvAddInvoice()"><span>Fatura Oluştur</span></button>
      </div>

      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin:16px 0 6px;"><i class="fa-solid fa-comments"></i> Görüşme Geçmişi</div>
      <div id="mv-logs">${c.logs.length ? c.logs.map(l => `<div style="padding:6px 0;border-bottom:1px solid var(--border);"><div style="font-size:10px;color:var(--t3);">${new Date(l.createdAt).toLocaleString('tr-TR')}</div><div style="font-size:12.5px;">${l.content}</div></div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz görüşme kaydı yok.</div>'}</div>
      <textarea id="mv-log-text" rows="2" placeholder="Ne konuşuldu, ne karar verildi…" style="margin-top:8px;"></textarea>
      <button class="pop-cta-btn b" style="width:100%;margin-top:6px;" onclick="mvAddLog()"><span>Notu Kaydet</span></button>
    </div>
  `;
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
  mvLoadList(document.getElementById('mv-search')?.value || '');
}

async function mvAddInvoice() {
  if (!mvSelectedId) return;
  const amount = document.getElementById('mv-inv-amount').value;
  const note = document.getElementById('mv-inv-note').value;
  if (!amount) { toast('Tutar girin', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/clients/' + mvSelectedId + '/invoices', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, note })
  });
  toast('Fatura oluşturuldu', 'fa-solid fa-check', true);
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
// SÜRE & TAKVİM — gerçek veritabanı fonksiyonları
// ══════════════════════════════════════════════════════
let calAllEvents = [];
let calViewDate = new Date();
let calSelectedDay = null;

async function calOnOpen() {
  calViewDate = new Date();
  calSelectedDay = null;
  const res = await fetch('/api/events');
  const data = await res.json();
  calAllEvents = data.events || [];
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
  const startOffset = (firstDay.getDay() + 6) % 7; // Pazartesi başlangıç
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
    html += `<div onclick="calSelectDay(${day})" style="cursor:pointer;text-align:center;padding:6px 0;border-radius:8px;font-size:12px;
      background:${isSel ? 'var(--gold)' : isToday ? 'var(--gold-lo)' : 'transparent'};
      color:${isSel ? '#fff' : 'var(--t0)'};position:relative;">
      ${day}
      ${has ? `<div style="width:4px;height:4px;border-radius:50%;background:${isSel?'#fff':'var(--danger)'};margin:2px auto 0;"></div>` : ''}
    </div>`;
  }
  grid.innerHTML = html;

  let list = calSelectedDay ? (eventsByDay[calSelectedDay] || []) : calAllEvents.filter(ev => new Date(ev.dueDate) >= new Date(new Date().setHours(0,0,0,0)));
  list = list.slice().sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

  const title = calSelectedDay ? `${calSelectedDay} ${calViewDate.toLocaleDateString('tr-TR',{month:'long'})} — Ajanda` : 'Yaklaşan Tarihler';
  agenda.innerHTML = `<div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:6px;">${title}</div>` +
    (list.length ? list.map(ev => {
      const dl = mvDaysLeft(ev.dueDate);
      return `<div class="dl-row"><span class="dl-tag ${dl.color==='var(--danger)'?'crit':dl.color==='var(--warn)'?'warn':''}">${ev.type==='durusma'?'DURUŞMA':'ÖDEME'}</span><span class="dl-text">${ev.clientName} — ${ev.title}</span><span class="dl-days" style="color:${dl.color}">${dl.text}</span></div>`;
    }).join('') : `<div style="font-size:12px;color:var(--t3);">Kayıt yok.</div>`);
}

function calSelectDay(day) {
  calSelectedDay = calSelectedDay === day ? null : day;
  calRender();
}
