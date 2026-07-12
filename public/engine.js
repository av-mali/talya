// ══════════════════════════════════════════════════════════
// ORTAK MOTOR — Bu dosya TÜM sayfalarda (ana ekran + 5 modül)
// paylaşılır: sohbet, bildirimler, karanlık mod, komut paleti,
// popup açma/kapama motoru. Modüle özel içerik (formlar,
// hesaplayıcılar) burada YOK — onlar module-*.js dosyalarında.
// Bu dosyayı değiştirmek TÜM sayfaları etkiler, dikkatli ol.
// ══════════════════════════════════════════════════════════

// ── STATE ──
let currentPopup = '';
const chatHistory = [];
let cmdkItems = [];
let cmdkSel = 0;

// ── NAV (sayfa geçişleri artık gerçek Next.js route'ları) ──
function openModule(modId) {
  window.location.href = '/dashboard/' + modId;
}
function goHome() {
  window.location.href = '/dashboard';
}

// Oturum açan kullanıcının erişim yetkileri (yönetici tarafından
// kapatılmış araçlar + AI kullanım izni). Her modül sayfası açılışta
// bunu çeker — sunucu tarafında da AYRICA kontrol edildiği için, burada
// sadece görünürlük/kullanılabilirlik ayarlanır.
let MY_PERMISSIONS = { blockedTools: [], aiEnabled: true, role: 'admin' };

async function loadMyPermissions() {
  try {
    const res = await fetch('/api/workspace/my-permissions');
    if (res.ok) MY_PERMISSIONS = await res.json();
  } catch (e) { /* varsayılan (tam yetkili) ile devam */ }
}

// Modül sayfası yüklendiğinde (module-*.js zaten window.CURRENT_MODULE'ü doldurmuş olmalı)
async function initModulePage() {
  await loadMyPermissions();
  const cfg = window.CURRENT_MODULE;
  if (!cfg) return;
  const nameEl = document.getElementById('appModuleName');
  if (nameEl) nameEl.innerHTML = cfg.label;
  const sbLabel = document.getElementById('sidebarLabel');
  if (sbLabel) sbLabel.innerHTML = cfg.label;
  const sbName = document.getElementById('sidebarName');
  if (sbName) sbName.innerHTML = cfg.nameHtml;

  const blockedSet = new Set(MY_PERMISSIONS.blockedTools || []);

  const nav = document.getElementById('sidebarNav');
  if (nav) {
    const modules = window.MODULES_INDEX || [cfg];
    nav.innerHTML = modules.map(mod => {
      const isCurrent = mod.key === cfg.key;
      const header = `
        <div class="s-item" style="font-weight:600;cursor:pointer;${isCurrent ? 'color:var(--gold);' : ''}" onclick="openModule('${mod.key}')">
          <span class="ico"><i class="fa-solid ${isCurrent ? 'fa-chevron-down' : 'fa-chevron-right'}" style="font-size:10px;"></i></span>
          ${mod.label}
        </div>`;
      let children = '';
      if (isCurrent) {
        let lastGroup = null;
        mod.items.forEach(item => {
          if (blockedSet.has(item.id)) return; // yönetici bu aracı kapatmış
          if (item.group && item.group !== lastGroup) {
            children += `<div style="padding:8px 12px 4px 30px;font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--t3);font-weight:600;">${item.group}</div>`;
          }
          lastGroup = item.group || null;
          const indent = item.group ? 40 : 30;
          children += `
            <div class="s-item" id="si-${item.id}" style="padding-left:${indent}px;" onclick="openPopup('${item.id}')">
              <span class="ico"><i class="fa-solid ${item.icon}"></i></span>
              ${item.name}
              ${item.badge ? `<span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:9px;padding:1px 5px;border-radius:10px;background:var(--bg2);color:var(--t3);">${item.badge}</span>` : ''}
            </div>`;
        });
      }
      return header + children;
    }).join('');
  }

  const allowedItems = cfg.items.filter(it => !blockedSet.has(it.id));
  const params = new URLSearchParams(window.location.search);
  const requestedOpen = params.get('open');
  const openId = (requestedOpen && !blockedSet.has(requestedOpen)) ? requestedOpen : (allowedItems[0] ? allowedItems[0].id : null);
  if (openId) {
    setTimeout(() => openPopup(openId), 150);
  } else {
    const popBody = document.getElementById('popBody');
    if (popBody) popBody.innerHTML = `<div style="padding:20px;font-size:13px;color:var(--t3);">Bu modülde erişim yetkiniz olan bir araç bulunmuyor. Büro yöneticinizle iletişime geçin.</div>`;
  }

  // Büro yöneticisi bu kullanıcı için AI'yı kapatmışsa sohbet kutusunu gizle.
  if (!MY_PERMISSIONS.aiEnabled) {
    const chatInputArea = document.querySelector('.chat-input-area');
    if (chatInputArea) chatInputArea.style.display = 'none';
    const chatEmpty = document.getElementById('chatEmpty');
    if (chatEmpty) chatEmpty.innerHTML = `<div style="padding:20px;text-align:center;color:var(--t3);font-size:13px;"><i class="fa-solid fa-lock" style="font-size:20px;margin-bottom:8px;display:block;"></i>AI kullanım yetkiniz bulunmuyor.</div>`;
  }
}

// ── POPUP / TOOL PANEL ──
function openPopup(id) {
  const cfg = window.CURRENT_MODULE;
  if (!cfg) return;

  document.querySelectorAll('.s-item').forEach(el => {
    el.classList.remove('active-g', 'active-b', 'active-t', 'active-p');
  });
  const si = document.getElementById('si-' + id);
  if (si) si.classList.add('active-' + cfg.color);

  const popCfg = cfg.popups[id];
  if (!popCfg) return;
  currentPopup = id;

  // "wideMode": bazı araçlar (ör. Mevzuat Arama) sağdaki sohbet panelini
  // hiç kullanmaz — o araç açıkken paneli gizleyip orta paneli genişletiyoruz.
  // Başka bir araca geçilince otomatik eski haline dönüyor.
  const toolPanel = document.querySelector('.tool-panel');
  const aiPane = document.querySelector('.ai-pane');
  if (toolPanel && aiPane) {
    if (popCfg.wideMode) {
      aiPane.style.display = 'none';
      toolPanel.style.width = 'auto';
      toolPanel.style.flex = '1';
      toolPanel.style.maxWidth = '820px';
      toolPanel.style.margin = '0 auto';
    } else {
      aiPane.style.display = '';
      toolPanel.style.width = '';
      toolPanel.style.flex = '';
      toolPanel.style.maxWidth = '';
      toolPanel.style.margin = '';
    }
  }
  // "hideChatInput": bu araç sohbete yazı yazdırmıyor, sadece sonuç
  // gösteriyor — alttaki yazı kutusunu/gönder butonunu gizliyoruz.
  const chatInputArea = document.querySelector('.chat-input-area');
  if (chatInputArea) {
    chatInputArea.style.display = popCfg.hideChatInput ? 'none' : '';
  }

  const name = cfg.items.find(i => i.id === id)?.name || id;
  const itemNameEl = document.getElementById('appItemName');
  if (itemNameEl) itemNameEl.textContent = name;

  const badge = document.getElementById('popBadge');
  if (badge) {
    badge.className = 'pop-badge ' + popCfg.badge;
    badge.innerHTML = `<span>${popCfg.badgeText}</span>`;
  }
  const titleEl = document.getElementById('popTitle');
  if (titleEl) titleEl.innerHTML = popCfg.titleHtml;
  const descEl = document.getElementById('popDesc');
  if (descEl) descEl.textContent = popCfg.desc;
  const bodyEl = document.getElementById('popBody');
  if (bodyEl) bodyEl.innerHTML = popCfg.body;
  const btnEl = document.getElementById('popBtn');
  if (btnEl) btnEl.className = 'pop-cta-btn ' + popCfg.btnClass;
  const btnIcoEl = document.getElementById('popBtnIco');
  if (btnIcoEl) btnIcoEl.className = 'fa-solid ' + popCfg.btnIco;
  const btnLblEl = document.getElementById('popBtnLbl');
  if (btnLblEl) btnLblEl.textContent = popCfg.btnLbl;

  const ctaWrap = document.querySelector('.tool-panel-cta');
  if (ctaWrap) ctaWrap.style.display = popCfg.hideCta ? 'none' : '';

  resetDetailPane();
  resetChatPane();
  if (typeof popCfg.onOpen === 'function') {
    try { popCfg.onOpen(); } catch (e) { console.error(e); }
  }
}

function resetChatPane() {
  // Belge & Analiz gibi sohbet paneli (ai-pane) olan modüllerde, araç
  // değiştirince önceki aracın konuşması kalmasın diye sıfırlanır.
  const msgs = document.getElementById('chatMsgs');
  const empty = document.getElementById('chatEmpty');
  if (msgs) msgs.innerHTML = '';
  if (empty) empty.style.display = '';
  if (typeof chatHistory !== 'undefined') chatHistory.length = 0;
}

function resetDetailPane() {
  const dp = document.getElementById('detailPane');
  if (!dp) return;
  dp.innerHTML = `<div style="padding:40px 24px;text-align:center;color:var(--t3);margin-top:60px;">
    <i class="fa-solid fa-arrow-left" style="font-size:20px;opacity:.3;display:block;margin-bottom:10px;"></i>
    Soldaki listeden bir öğe seçin.
  </div>`;
}

function closePopup() {
  // no-op — panel her zaman görünür
}

function submitPopup() {
  const cfg = window.CURRENT_MODULE;
  if (!cfg) return;
  const popCfg = cfg.popups[currentPopup];
  if (!popCfg) return;
  let prompt = '';
  try { prompt = popCfg.prompt(); } catch (e) { prompt = popCfg.btnLbl + ' isteği'; }
  toast('Talya AI\'ya iletildi', 'fa-solid fa-paper-plane', true);
  setTimeout(() => sendQ(prompt), 100);
}

// ── CHAT ──
function autoH(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }

// İskelet (skeleton) yükleme bloğu üretir — "Yükleniyor…" yazısı yerine.
function skeletonRows(n) {
  n = n || 3;
  let html = '';
  for (let i = 0; i < n; i++) html += '<div class="skel skel-row"></div>';
  return html;
}
function skeletonLines(n) {
  n = n || 3;
  let html = '';
  for (let i = 0; i < n; i++) html += '<div class="skel skel-line" style="width:' + (60 + Math.random() * 35) + '%;"></div>';
  return html;
}

// Boş durum (empty state) bloğu üretir — ikon + başlık + açıklama.
function emptyState(icon, title, desc) {
  return `<div class="empty-state"><i class="fa-solid ${icon}"></i><div class="empty-title">${title}</div>${desc ? `<div class="empty-desc">${desc}</div>` : ''}</div>`;
}

async function improvePrompt() {
  const inp = document.getElementById('chatIn');
  if (!inp) return;
  const original = inp.value.trim();
  if (!original) { toast('Önce bir şeyler yazın', 'fa-solid fa-triangle-exclamation'); return; }

  const btn = document.getElementById('improveBtn');
  if (btn) btn.disabled = true;
  inp.disabled = true;
  const placeholder = inp.value;
  inp.value = 'Geliştiriliyor…';

  const form = new FormData();
  form.append('pastedText', original);
  form.append('instruction', 'Bu soruyu/istemi bir hukuk asistanına yöneltilecek şekilde daha net, detaylı ve profesyonel hale getir. Sadece geliştirilmiş soruyu/istemi ver, başka açıklama ekleme, tırnak içine alma.');
  form.append('mode', 'dosya');
  form.append('wantUdf', '0');

  try {
    const res = await fetch('/api/tools/analyze', { method: 'POST', body: form });
    const data = await res.json();
    inp.disabled = false;
    if (btn) btn.disabled = false;
    if (!res.ok) {
      inp.value = placeholder;
      toast(data.error || 'Geliştirilemedi', 'fa-solid fa-triangle-exclamation');
      return;
    }
    inp.value = (data.analysis || placeholder).trim();
    autoH(inp);
  } catch (e) {
    inp.value = placeholder;
    inp.disabled = false;
    if (btn) btn.disabled = false;
    toast('Bağlantı hatası', 'fa-solid fa-triangle-exclamation');
  }
}
function ckEnter(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }

function appendMsg(role, text, udfBase64, docxBase64, pdfBase64) {
  const empty = document.getElementById('chatEmpty');
  if (empty) empty.style.display = 'none';
  const msgs = document.getElementById('chatMsgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  const ico = role === 'ai' ? 'fa-microchip' : 'fa-user-tie';
  let actions = '';
  if (role === 'ai') {
    actions = `<div class="msg-actions"><span class="msg-act-btn" onclick="copyMsg(this)"><i class="fa-solid fa-copy"></i> Kopyala</span>`;
    if (udfBase64) {
      actions += `<span class="msg-act-btn" onclick="downloadUdfFromBubble(this)"><i class="fa-solid fa-download"></i> UDF İndir</span>`;
    }
    if (docxBase64) {
      actions += `<span class="msg-act-btn" onclick="downloadDocxFromBubble(this)"><i class="fa-solid fa-file-word"></i> Word İndir</span>`;
    }
    if (pdfBase64) {
      actions += `<span class="msg-act-btn" onclick="downloadPdfFromBubble(this)"><i class="fa-solid fa-file-pdf"></i> PDF İndir</span>`;
    }
    actions += `</div>`;
  }
  div.innerHTML = `<div class="msg-av"><i class="fa-solid ${ico}"></i></div><div class="msg-bbl">${text}${actions}</div>`;
  if (udfBase64) div.dataset.udf = udfBase64;
  if (docxBase64) div.dataset.docx = docxBase64;
  if (pdfBase64) div.dataset.pdf = pdfBase64;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function base64ToBlob(b64, mime) {
  const byteChars = atob(b64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

function downloadUdfFromBubble(btn) {
  const msgDiv = btn.closest('.msg');
  const b64 = msgDiv?.dataset.udf;
  if (!b64) return;
  const blob = base64ToBlob(b64, 'application/octet-stream');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'belge.udf';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function downloadDocxFromBubble(btn) {
  const msgDiv = btn.closest('.msg');
  const b64 = msgDiv?.dataset.docx;
  if (!b64) return;
  const blob = base64ToBlob(b64, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'belge.docx';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function downloadPdfFromBubble(btn) {
  const msgDiv = btn.closest('.msg');
  const b64 = msgDiv?.dataset.pdf;
  if (!b64) return;
  const blob = base64ToBlob(b64, 'application/pdf');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'belge.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function copyMsg(btn) {
  const bbl = btn.closest('.msg-bbl');
  const clone = bbl.cloneNode(true);
  clone.querySelector('.msg-actions')?.remove();
  navigator.clipboard?.writeText(clone.innerText).then(() => toast('Panoya kopyalandı', 'fa-solid fa-check'));
}

function showTyping() {
  const empty = document.getElementById('chatEmpty');
  if (empty) empty.style.display = 'none';
  const msgs = document.getElementById('chatMsgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg ai'; div.id = 'typing';
  div.innerHTML = `<div class="msg-av"><i class="fa-solid fa-microchip"></i></div><div class="msg-bbl"><span class="tdot"></span><span class="tdot"></span><span class="tdot"></span></div>`;
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
}
function removeTyping() { const t = document.getElementById('typing'); if (t) t.remove(); }

function fmtAI(t) {
  return t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<strong style="color:var(--gold)">$1</strong>')
    .replace(/^## (.+)$/gm, '<strong style="font-size:14px;color:var(--gold)">$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>').replace(/^(?!<)(.+)$/gm, '<p>$1</p>').replace(/<p><\/p>/g, '').trim();
}

async function sendQ(text) {
  const inp = document.getElementById('chatIn');
  if (inp) inp.value = text;
  await sendChat();
}

async function sendChat() {
  const inp = document.getElementById('chatIn');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;
  inp.value = ''; inp.style.height = 'auto';
  appendMsg('user', text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  chatHistory.push({ role: 'user', content: text });
  const btn = document.getElementById('sendBtn');
  if (btn) btn.disabled = true;
  showTyping();
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    removeTyping();
    if (!res.ok) {
      appendMsg('ai', '<span style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> ' + (data.error || 'Bir hata oluştu.') + '</span>');
      if (btn) btn.disabled = false;
      return;
    }
    const reply = data.reply || 'Bir hata oluştu, tekrar deneyin.';
    chatHistory.push({ role: 'assistant', content: reply });
    appendMsg('ai', fmtAI(reply));
  } catch (e) {
    removeTyping();
    appendMsg('ai', '<span style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> Bağlantı hatası. Lütfen tekrar deneyin.</span>');
  }
  if (btn) btn.disabled = false;
}

// ── TOASTS ──
function toast(text, ico, gold) {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'toast' + (gold ? ' gold' : '');
  el.innerHTML = `<div class="tico"><i class="${ico || 'fa-solid fa-check'}"></i></div><span>${text}</span>`;
  stack.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 200); }, 3200);
}

// ── HERO COUNT-UP (sadece ana ekran) ──
function runCountUp() {
  document.querySelectorAll('.count-up').forEach(el => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString('tr-TR') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
  document.querySelectorAll('.dbar-fill').forEach(el => {
    requestAnimationFrame(() => { el.style.width = el.dataset.w + '%'; });
  });
}

// ── ANA EKRAN: YAKLAŞAN SÜRELER — TAM LİSTE POPUP ──
async function openDeadlinesModal() {
  const scrim = document.getElementById('deadlinesScrim');
  if (!scrim) return;
  scrim.style.display = 'flex';
  const list = document.getElementById('deadlinesModalList');
  list.innerHTML = skeletonLines(4);
  try {
    const res = await fetch('/api/events');
    const data = await res.json();
    const now = new Date();
    const upcoming = (data.events || [])
      .filter(e => new Date(e.dueDate) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (!upcoming.length) {
      list.innerHTML = `<div style="padding:20px 0;text-align:center;color:var(--t3);font-size:13px;">Yaklaşan duruşma, ödeme veya görev yok.</div>`;
      return;
    }
    list.innerHTML = upcoming.map(e => {
      // ÖNEMLİ: Saat farkından değil, TAKVİM GÜNÜ farkından hesapla —
      // yoksa "bugün saat 14:00'te duruşma" sabah kontrol edilince
      // yanlışlıkla "1 gün kaldı" görünüyordu.
      const dueMidnight = new Date(new Date(e.dueDate).getFullYear(), new Date(e.dueDate).getMonth(), new Date(e.dueDate).getDate());
      const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const days = Math.round((dueMidnight.getTime() - nowMidnight.getTime()) / 86400000);
      const level = days <= 3 ? 'crit' : days <= 7 ? 'warn' : '';
      const tag = days === 0 ? 'BUGÜN' : days + ' GÜN';
      return `<div class="dl-row">
        <span class="dl-tag ${level}">${tag}</span>
        <span class="dl-text">${e.clientName} — ${e.title}</span>
        <span class="dl-days">${new Date(e.dueDate).toLocaleDateString('tr-TR')}</span>
      </div>`;
    }).join('');
  } catch (e) {
    list.innerHTML = `<div style="padding:20px 0;text-align:center;color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

function closeDeadlinesModal() {
  const scrim = document.getElementById('deadlinesScrim');
  if (scrim) scrim.style.display = 'none';
}

// ── ANA EKRAN: YAKLAŞAN SÜRELER (gerçek veri) ──
const HOME_STAT_META = {
  gelirgider: { icon: 'fa-scale-balanced', label: 'Bu Ay Net Gelir-Gider' },
  muvekkil: { icon: 'fa-users', label: 'Toplam Müvekkil' },
  dosya: { icon: 'fa-folder-open', label: 'Dosya Durumu' },
};

async function renderGelirGiderOzet() {
  const card = document.getElementById('gelirGiderOzetCard');
  const box = document.getElementById('ggOzetBox');
  if (!card || !box) return;
  try {
    const prefRes = await fetch('/api/profile/home-stats-prefs');
    const prefData = await prefRes.json();
    const selected = prefData.selected || ['gelirgider'];

    const statsRes = await fetch('/api/home-stats');
    if (statsRes.status === 403) { card.style.display = 'none'; return; }
    const statsData = await statsRes.json();
    const stats = statsData.stats || {};

    // "gelirgider" seçili ama bu kullanıcının erişimi yoksa, o kutuyu atla.
    const visibleKeys = selected.filter(k => k !== 'gelirgider' || statsData.canSeeGelirGider);
    if (!visibleKeys.length) { card.style.display = 'none'; return; }

    box.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(${visibleKeys.length}, 1fr);gap:12px;">
        ${visibleKeys.map(key => {
          const meta = HOME_STAT_META[key];
          if (!meta) return '';

          if (key === 'gelirgider') {
            const gelir = stats.gelirgider?.gelir || 0;
            const gider = stats.gelirgider?.gider || 0;
            const net = stats.gelirgider?.net || 0;
            const positive = net >= 0;
            return `
              <div style="position:relative;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;overflow:hidden;">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${positive ? 'var(--gold)' : 'var(--danger)'};"></div>
                <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">
                  <i class="fa-solid fa-scale-balanced"></i> Bu Ay Net
                </div>
                <div style="font-family:'Instrument Serif',serif;font-size:26px;line-height:1;color:${positive ? 'var(--gold)' : 'var(--danger)'};margin-bottom:8px;">
                  ${fmtTLShort(net)}
                </div>
                <div style="display:flex;gap:12px;font-size:10.5px;color:var(--t3);">
                  <span><i class="fa-solid fa-arrow-up" style="color:var(--success);font-size:9px;"></i> ${fmtTLShort(gelir)}</span>
                  <span><i class="fa-solid fa-arrow-down" style="color:var(--danger);font-size:9px;"></i> ${fmtTLShort(gider)}</span>
                </div>
              </div>
            `;
          }

          if (key === 'muvekkil') {
            return `
              <div style="position:relative;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;overflow:hidden;">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--gold);"></div>
                <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">
                  <i class="fa-solid fa-users"></i> Toplam Müvekkil
                </div>
                <div style="font-family:'Instrument Serif',serif;font-size:26px;line-height:1;color:var(--gold);">
                  ${stats.muvekkil?.total ?? 0}
                </div>
              </div>
            `;
          }

          if (key === 'dosya') {
            const open = stats.dosya?.open ?? 0;
            const closed = stats.dosya?.closed ?? 0;
            return `
              <div style="position:relative;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;overflow:hidden;">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--gold);"></div>
                <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">
                  <i class="fa-solid fa-folder-open"></i> Dosya Durumu
                </div>
                <div style="font-family:'Instrument Serif',serif;font-size:26px;line-height:1;color:var(--gold);margin-bottom:8px;">
                  ${open}<span style="font-size:14px;color:var(--t3);"> açık</span>
                </div>
                <div style="font-size:10.5px;color:var(--t3);">${closed} kapalı dosya</div>
              </div>
            `;
          }

          return '';
        }).join('')}
      </div>
    `;
  } catch (e) {
    card.style.display = 'none';
  }
}

function fmtTLShort(n) {
  if (typeof fmtTL === 'function') return fmtTL(n);
  return n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
}

async function renderDashDeadlines() {
  const wrap = document.getElementById('dashDeadlines');
  if (!wrap) return;
  wrap.innerHTML = skeletonLines(3);
  try {
    const res = await fetch('/api/events');
    const data = await res.json();
    const now = new Date();
    const upcoming = (data.events || [])
      .filter(e => new Date(e.dueDate) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);

    if (!upcoming.length) {
      wrap.innerHTML = emptyState('fa-calendar-check', 'Yaklaşan süre yok', 'Duruşma/ödeme tarihi eklendikçe burada görünecek.');
      return;
    }

    wrap.innerHTML = upcoming.map(e => {
      const dueMidnight = new Date(new Date(e.dueDate).getFullYear(), new Date(e.dueDate).getMonth(), new Date(e.dueDate).getDate());
      const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const days = Math.round((dueMidnight.getTime() - nowMidnight.getTime()) / 86400000);
      const level = days <= 3 ? 'crit' : days <= 7 ? 'warn' : '';
      const tag = days === 0 ? 'BUGÜN' : days + ' GÜN';
      return `<div class="dl-row">
        <span class="dl-tag ${level}">${tag}</span>
        <span class="dl-text">${e.clientName} — ${e.title}</span>
        <span class="dl-days">${new Date(e.dueDate).toLocaleDateString('tr-TR')}</span>
      </div>`;
    }).join('');
  } catch (e) {
    wrap.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--danger);">Yüklenemedi.</div>`;
  }
}

// ── BİLDİRİMLER (gerçek veri: yaklaşan duruşma/ödeme tarihleri) ──
let NOTIFS = [];

async function loadRealNotifications() {
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) return;
    const data = await res.json();
    NOTIFS = (data.notifications || []).map((n, i) => ({ ...n, id: n.id || i }));
    renderNotifs();
  } catch (e) { /* sessizce geç */ }
}

let notifPrefs = { sure: true, tebligat: true };
let activeFilter = 'all';

async function loadNotifPrefs() {
  try {
    const res = await fetch('/api/profile/notif-prefs');
    if (!res.ok) return;
    const data = await res.json();
    if (data.prefs) { notifPrefs = data.prefs; renderNotifs(); }
  } catch (e) { /* varsayılan tercihlerle devam */ }
}

function getVisibleNotifs() {
  return NOTIFS.filter(n => {
    if (!notifPrefs[n.type]) return false;
    if (activeFilter !== 'all' && n.type !== activeFilter) return false;
    return true;
  });
}

function renderNotifs() {
  const list = document.getElementById('ndList');
  const listHome = document.getElementById('ndListHome');
  if (!list && !listHome) return;

  const visible = getVisibleNotifs();
  const html = !visible.length
    ? `<div class="nd-empty"><i class="fa-solid fa-bell-slash"></i>Bildirim yok</div>`
    : visible.map(n => `
      <div class="nd-item ${n.read ? '' : 'unread'}" onclick="readNotif('${n.id}')">
        <div class="nd-dot ${n.read ? 'read' : n.level}"></div>
        <div class="nd-ico ${n.level}"><i class="fa-solid ${n.ico}"></i></div>
        <div class="nd-content">
          <div class="nd-label">${n.label}</div>
          <div class="nd-text">${n.text}</div>
          <div class="nd-time">${n.time}</div>
        </div>
      </div>`).join('');

  if (list) list.innerHTML = html;
  if (listHome) listHome.innerHTML = html;
  updateBadge();
}

function updateBadge() {
  const unread = NOTIFS.filter(n => !n.read && notifPrefs[n.type]).length;
  ['notifBadge', 'notifBadgeHome'].forEach(id => {
    const badge = document.getElementById(id);
    if (!badge) return;
    if (unread > 0) { badge.textContent = unread; badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); }
  });
}

function readNotif(id) {
  const n = NOTIFS.find(n => n.id === id);
  if (n) n.read = true;
  renderNotifs();
  fetch('/api/notifications/read', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  }).catch(() => {});
}

function markAllRead() {
  const ids = NOTIFS.map(n => n.id);
  NOTIFS.forEach(n => n.read = true);
  renderNotifs();
  toast('Tüm bildirimler okundu işaretlendi', 'fa-solid fa-check-double');
  if (ids.length) {
    fetch('/api/notifications/read-all', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    }).catch(() => {});
  }
}

function filterNotif(el, filter) {
  activeFilter = filter;
  document.querySelectorAll('.nd-chip').forEach(c => {
    c.className = 'nd-chip';
    if (c.dataset.filter === filter) {
      if (filter === 'sure') c.classList.add('active-danger');
      else if (filter === 'tebligat') c.classList.add('active-blue');
      else if (filter === 'ai') c.classList.add('active-teal');
      else c.classList.add('active');
    }
  });
  renderNotifs();
}

function saveNotifPref(type, val) {
  notifPrefs[type] = val;
  renderNotifs();
  fetch('/api/profile/notif-prefs', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefs: notifPrefs })
  }).catch(() => {});
}

function toggleNotif(e) {
  e.stopPropagation();
  const dd = document.getElementById('notifDropdown');
  if (!dd) return;
  const isOpen = dd.classList.contains('open');
  document.getElementById('notifDropdownHome')?.classList.remove('open');
  dd.classList.toggle('open');
  if (!isOpen) renderNotifs();
}

function toggleNotifHome(e) {
  e.stopPropagation();
  const dd = document.getElementById('notifDropdownHome');
  if (!dd) return;
  const isOpen = dd.classList.contains('open');
  document.getElementById('notifDropdown')?.classList.remove('open');
  dd.classList.toggle('open');
  if (!isOpen) renderNotifs();
}

function filterNotifHome(el, filter) {
  activeFilter = filter;
  document.querySelectorAll('#ndFilterHome .nd-chip').forEach(c => {
    c.className = 'nd-chip';
    if (c.dataset.filter === filter) {
      if (filter === 'sure') c.classList.add('active-danger');
      else if (filter === 'tebligat') c.classList.add('active-blue');
      else if (filter === 'ai') c.classList.add('active-teal');
      else c.classList.add('active');
    }
  });
  renderNotifs();
}

document.addEventListener('click', e => {
  document.querySelectorAll('.notif-wrap').forEach(wrap => {
    const dd = wrap.querySelector('.notif-dropdown');
    if (!wrap.contains(e.target) && dd) dd.classList.remove('open');
  });
});

// ── KARANLIK MOD ──
function toggleDark() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
  const icon = isDark ? 'fa-moon' : 'fa-sun';
  const h = document.getElementById('dmIconHome'); if (h) h.className = 'fa-solid ' + icon;
  const a = document.getElementById('dmIconApp'); if (a) a.className = 'fa-solid ' + icon;
  localStorage.setItem('talya-theme', isDark ? '' : 'dark');
}
(function () {
  const saved = localStorage.getItem('talya-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const h = document.getElementById('dmIconHome'); if (h) h.className = 'fa-solid fa-sun';
    const a = document.getElementById('dmIconApp'); if (a) a.className = 'fa-solid fa-sun';
  }
})();

// ── KOMUT PALETİ (⌘K) — tüm modüllerde arama yapar ──
function openCmdk() {
  if (!cmdkItems.length) cmdkItems = window.CMDK_INDEX || [];
  document.getElementById('cmdkScrim')?.classList.add('open');
  const inp = document.getElementById('cmdkInput');
  if (!inp) return;
  inp.value = '';
  cmdkSel = 0;
  cmdkRenderList(cmdkItems);
  setTimeout(() => inp.focus(), 30);
}
function closeCmdk() {
  document.getElementById('cmdkScrim')?.classList.remove('open');
}
function cmdkFilter() {
  const q = document.getElementById('cmdkInput').value.trim().toLowerCase();
  const filtered = q ? cmdkItems.filter(i => i.name.toLowerCase().includes(q) || i.modLabel.toLowerCase().includes(q)) : cmdkItems;
  cmdkSel = 0;
  cmdkRenderList(filtered);
}
function cmdkRenderList(list) {
  const el = document.getElementById('cmdkList');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="cmdk-empty"><i class="fa-solid fa-magnifying-glass" style="display:block;margin-bottom:8px;opacity:.4;"></i>Sonuç bulunamadı</div>`;
    return;
  }
  let lastMod = '';
  let html = '';
  list.forEach((item, idx) => {
    if (item.modLabel !== lastMod) {
      html += `<div class="cmdk-group-lbl">${item.modLabel}</div>`;
      lastMod = item.modLabel;
    }
    html += `<div class="cmdk-item ${idx === cmdkSel ? 'sel' : ''}" data-idx="${idx}" onclick="cmdkChoose('${item.modId}','${item.id}')">
      <span class="cico"><i class="fa-solid ${item.icon}"></i></span>
      <span class="cmdk-item-name">${item.name}</span>
      <span class="cmdk-item-mod">${item.modLabel}</span>
    </div>`;
  });
  el.innerHTML = html;
  el._list = list;
}
function cmdkKey(e) {
  const list = document.getElementById('cmdkList')?._list || [];
  if (e.key === 'ArrowDown') { e.preventDefault(); cmdkSel = Math.min(cmdkSel + 1, list.length - 1); cmdkRenderList(list); cmdkScrollSel(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); cmdkSel = Math.max(cmdkSel - 1, 0); cmdkRenderList(list); cmdkScrollSel(); }
  else if (e.key === 'Enter') { e.preventDefault(); const it = list[cmdkSel]; if (it) cmdkChoose(it.modId, it.id); }
  else if (e.key === 'Escape') { closeCmdk(); }
}
function cmdkScrollSel() {
  const selEl = document.querySelector('.cmdk-item.sel');
  if (selEl) selEl.scrollIntoView({ block: 'nearest' });
}
function cmdkChoose(modId, itemId) {
  closeCmdk();
  // Aynı modüldeysek sayfa yenilemeden aç, farklı modülse o sayfaya git.
  if (window.CURRENT_MODULE && window.CURRENT_MODULE.key === modId) {
    openPopup(itemId);
  } else {
    window.location.href = '/dashboard/' + modId + '?open=' + itemId;
  }
}
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const scrim = document.getElementById('cmdkScrim');
    if (!scrim) return;
    scrim.classList.contains('open') ? closeCmdk() : openCmdk();
  }
  if (e.key === 'Escape') {
    const dScrim = document.getElementById('deadlinesScrim');
    if (dScrim && dScrim.style.display === 'flex') closeDeadlinesModal();
  }
});

// ── INIT ──
cmdkItems = window.CMDK_INDEX || [];
if (window.CURRENT_MODULE) {
  initModulePage();
} else {
  runCountUp();
  renderDashDeadlines();
  renderGelirGiderOzet();
}
loadRealNotifications();
loadNotifPrefs();
if (window.__talyaReady) window.__talyaReady();
