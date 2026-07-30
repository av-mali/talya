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
// ── SPA NAVİGASYONU ──
// Kalıcı menü moduna alınmış sayfalar (şu an: Ana Sayfa + Büro Yönetimi)
// arasında geçiş, tam sayfa yenilemesi YAPMADAN olur — bunu
// /src/app/dashboard/layout.tsx, window.__talyaSpaNav'a kendi
// fonksiyonunu vererek etkinleştirir. O fonksiyon yoksa (henüz kalıcı
// menüye taşınmamış bir sayfadaysak) eskisi gibi tam sayfa geçişi olur.
// ── MOBİL SIDEBAR ÇEKMECESİ (720px altı ekranlar) ──
// Masaüstünde bu fonksiyonlar no-op'a yakındır (.app-sidebar'da hiçbir
// zaman .open sınıfı olmaz çünkü hamburger düğmesi orada görünmez) —
// sadece mobil CSS (bkz. talya-original.css) devredeyken bir anlam ifade
// eder. Her navigasyonda (goHome/openModule/bir araca tıklama) otomatik
// kapatılır ki kullanıcı bir yere gidince menü açık kalmasın.
function toggleMobileSidebar() {
  const sb = document.querySelector('.app-sidebar');
  if (!sb) return;
  if (sb.classList.contains('open')) closeMobileSidebar();
  else openMobileSidebar();
}
function openMobileSidebar() {
  const sb = document.querySelector('.app-sidebar');
  const scrim = document.getElementById('sidebarScrim');
  if (sb) sb.classList.add('open');
  if (scrim) scrim.classList.add('show');
}
function closeMobileSidebar() {
  const sb = document.querySelector('.app-sidebar');
  const scrim = document.getElementById('sidebarScrim');
  if (sb) sb.classList.remove('open');
  if (scrim) scrim.classList.remove('show');
}

function openModule(modId) {
  closeMobileSidebar();
  const target = '/dashboard/' + modId.split('?')[0];
  // NOT: modId 'buro?open=ekip' formatında geliyor. Buradan SADECE
  // değeri ('ekip') çıkarmamız lazım — split('?')[1] 'open=ekip'i
  // (öneki DAHİL) verir, bu da __talyaSpaNav'da "?open=open=ekip" gibi
  // BOZUK bir URL oluşturuyordu ("İlk tıklamada açılmıyor" hatasının
  // gerçek kök nedeni buydu).
  const openParam = modId.includes('?open=') ? modId.split('?open=')[1] : null;
  if (window.__talyaSpaNav && window.__talyaMigratedPaths?.includes(target)) {
    window.__talyaSpaNav(target, openParam);
    return;
  }
  window.location.href = '/dashboard/' + modId;
}
function goHome() {
  closeMobileSidebar();
  if (window.__talyaSpaNav && window.__talyaMigratedPaths?.includes('/dashboard')) {
    window.__talyaSpaNav('/dashboard', null);
    return;
  }
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

// Orta panel (popBody), sağ panel (detailPane) ya da sohbet alanı
// (chatMsgs) her innerHTML değişikliğinde otomatik olarak yumuşak bir
// "belirme" animasyonu alır — tek tek her render fonksiyonuna eklemeye
// gerek kalmadan tüm modüllerde çalışır.
function attachPanelFadeObserver(id) {
  const el = document.getElementById(id);
  if (!el || el.dataset.fadeObserved) return;
  el.dataset.fadeObserved = '1';
  const observer = new MutationObserver(() => {
    el.classList.remove('panel-fade-in');
    void el.offsetWidth; // reflow'u zorlayarak animasyonun her seferinde yeniden başlamasını sağlıyoruz
    el.classList.add('panel-fade-in');
  });
  observer.observe(el, { childList: true });
}

// Modül sayfası yüklendiğinde (module-*.js zaten window.CURRENT_MODULE'ü doldurmuş olmalı)
async function initModulePage() {
  await loadMyPermissions();
  attachPanelFadeObserver('popBody');
  attachPanelFadeObserver('detailPane');
  attachPanelFadeObserver('chatMsgs');
  const cfg = window.CURRENT_MODULE;
  if (!cfg) return;
  const nameEl = document.getElementById('appModuleName');
  if (nameEl) nameEl.innerHTML = cfg.label;
  // NOT: sidebarLabel/sidebarName BİLEREK değiştirilmiyor — bunlar
  // artık her sayfada SABİT kalıyor (menünün yukarı/aşağı oynamaması
  // için). Hangi modülde olduğun bilgisi zaten üst çubuktaki
  // breadcrumb'ta (appModuleName) gösteriliyor.

  sidebarExpanded.add(cfg.key); // bulunduğun kategori varsayılan olarak açık
  renderAppSidebar();

  const blockedSet = new Set(MY_PERMISSIONS.blockedTools || []);
  const allowedItems = cfg.items.filter(it => !blockedSet.has(it.id));
  const params = new URLSearchParams(window.location.search);
  const requestedOpen = params.get('open');
  const openId = (requestedOpen && !blockedSet.has(requestedOpen)) ? requestedOpen : (allowedItems[0] ? allowedItems[0].id : null);
  if (openId) {
    openPopup(openId);
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

// Her kategorinin kendine ait, tanınabilir bir simgesi olsun diye —
// eskiden ana sayfadaki büyük kartlarda kullanılan simgelerin aynısı.
const MODULE_ICONS = {
  belge: 'fa-scroll',
  buro: 'fa-briefcase',
  arabuluculuk: 'fa-handshake',
  tevkil: 'fa-people-arrows',
  uyap: 'fa-building-columns',
  hesap: 'fa-calculator',
  uyelik: 'fa-user-circle',
};

// Sol kenar çubuğundaki akordiyonu render eder — hem ana sayfada hem
// modül sayfalarında AYNI davranışı kullanır: her kategori yerinde
// açılıp kapanır (sayfa değişmez), sadece bir ARACA tıklanınca (o araç
// bulunduğun modülde değilse) sayfa değişir. Bulunduğun modül (varsa)
// başlangıçta açık gelir.
let sidebarExpanded = new Set();

// Her modülün kendi rengi — kenar çubuğu VE Hızlı Erişim kartları bu
// haritayı ortak kullanır.
const COLOR_MAP = { g: 'var(--gold)', b: 'var(--blue)', t: 'var(--teal)', p: 'var(--purple)', r: 'var(--danger)', a: 'var(--amber)' };
const COLOR_LO_MAP = { g: 'var(--gold-lo)', b: 'var(--blue-lo)', t: 'var(--teal-lo)', p: 'var(--purple-lo)', r: 'var(--danger-lo)', a: 'var(--amber-lo)' };

async function renderAppSidebar() {
  const nav = document.getElementById('sidebarNav') || document.getElementById('homeSidebarNav');
  if (!nav) return;
  await loadMyPermissions();
  const blockedSet = new Set(MY_PERMISSIONS.blockedTools || []);
  const cfg = window.CURRENT_MODULE; // modül sayfasındaysak dolu, ana sayfadaysak undefined
  const modules = window.MODULES_INDEX || (cfg ? [cfg] : []);

  const homeEntry = `
    <div class="s-item ${!cfg ? 'active-g' : ''}" style="font-weight:600;cursor:pointer;margin-bottom:4px;" onclick="goHome()">
      <span class="ico"><i class="fa-solid fa-house"></i></span>
      Ana Sayfa
    </div>`;

  const modulesHtml = modules.map(mod => {
    const isCurrent = !!cfg && mod.key === cfg.key;
    const isOpen = sidebarExpanded.has(mod.key);
    const modIcon = MODULE_ICONS[mod.key] || 'fa-folder';
    const modColor = COLOR_MAP[mod.color] || 'var(--gold)';
    const modColorLo = COLOR_LO_MAP[mod.color] || 'var(--gold-lo)';
    const header = `
      <div class="s-item" style="font-weight:600;cursor:pointer;margin-top:4px;border-radius:var(--r);${isCurrent ? `color:${modColor};background:${modColorLo};box-shadow:0 0 0 1px ${modColorLo}, 0 5px 16px -2px ${modColorLo};` : ''}" onclick="toggleSidebarGroup('${mod.key}')">
        <span class="ico"><i class="fa-solid ${modIcon}" style="color:${modColor};"></i></span>
        ${mod.label}
        <span style="margin-left:auto;"><i class="fa-solid ${isOpen ? 'fa-chevron-down' : 'fa-chevron-right'}" style="font-size:9px;opacity:.5;"></i></span>
      </div>`;
    let children = '';
    if (isOpen) {
      let lastGroup = null;
      mod.items.forEach(item => {
        if (blockedSet.has(item.id)) return; // yönetici bu aracı kapatmış
        if (item.group && item.group !== lastGroup) {
          children += `<div style="padding:8px 12px 4px 30px;font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--t3);font-weight:600;">${item.group}</div>`;
        }
        lastGroup = item.group || null;
        const indent = item.group ? 40 : 30;
        const clickAction = `handleSidebarItemClick('${mod.key}','${item.id}')`;
        const idAttr = isCurrent ? `id="si-${item.id}"` : '';
        children += `
          <div class="s-item" ${idAttr} style="padding-left:${indent}px;" onclick="${clickAction}">
            <span class="ico"><i class="fa-solid ${item.icon}" style="color:${modColor};opacity:.8;"></i></span>
            ${item.name}
            ${item.badge ? `<span style="margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:9px;padding:1px 5px;border-radius:10px;background:var(--bg2);color:var(--t3);">${item.badge}</span>` : ''}
          </div>`;
      });
    }
    return header + children;
  }).join('');

  nav.innerHTML = homeEntry + modulesHtml;
}

// Sidebar'daki bir araca tıklandığında ÇAĞRILAN TEK fonksiyon. Kasıtlı
// olarak "hangi modüldeyiz" kararını RENDER anında (HTML'e onclick
// string'i olarak gömülü, dondurulmuş bir değer) DEĞİL, TIKLAMA anında,
// window.CURRENT_MODULE'ün O ANKİ değerine bakarak veriyor. Bu, sidebar
// bir asenkron işlem (ör. loadMyPermissions) tamamlanmadan render
// edildiğinde oluşabilecek "ilk tıklama açmıyor, sonrakiler açıyor"
// hatasının kökten çözümüdür — artık HİÇBİR tıklama, geçmişte
// dondurulmuş bir karara güvenmiyor.
function handleSidebarItemClick(modKey, itemId) {
  closeMobileSidebar();
  const cfg = window.CURRENT_MODULE;
  if (cfg && cfg.key === modKey) {
    openPopup(itemId);
  } else {
    openModule(modKey + '?open=' + itemId);
  }
}

function toggleUserMenu(e) {
  e.stopPropagation();
  const dd = document.getElementById('userMenuDropdown');
  if (!dd) return;
  const isOpen = dd.style.display === 'block';
  dd.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    document.addEventListener('click', closeUserMenuOnOutsideClick, { once: true });
  }
}
function closeUserMenu() {
  const dd = document.getElementById('userMenuDropdown');
  if (dd) dd.style.display = 'none';
}
function closeUserMenuOnOutsideClick() {
  closeUserMenu();
}

function toggleSidebarGroup(key) {
  const wasOpen = sidebarExpanded.has(key);
  sidebarExpanded.clear(); // önce hepsini kapat
  if (!wasOpen) sidebarExpanded.add(key); // kapalıysa aç, açıksa (tıklanan zaten açıksa) kapalı kalsın
  renderAppSidebar();
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
    } else if (popCfg.hideToolPanel) {
      // Tersi: bu araç sadece veri/rapor gösterir, orta paneldeki forma
      // hiç ihtiyacı yok — orta paneli gizleyip sağdaki (detay) paneli
      // tam genişliğe yayıyoruz (ör. Raporlar, Bakiye Tablosu).
      toolPanel.style.display = 'none';
      aiPane.style.display = '';
      aiPane.style.flex = '1';
      aiPane.style.maxWidth = '';
    } else {
      aiPane.style.display = '';
      toolPanel.style.display = '';
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
// Bir <input type="date"> + <input type="time"> ikilisini, TARAYICININ
// YEREL saat dilimini doğru şekilde hesaba katarak sunucuya gönderilecek
// bir ISO metnine çevirir. "2026-07-20T23:25:00" gibi saat dilimsiz bir
// metin doğrudan gönderilirse, sunucu bunu UTC sanabilir — bu da
// Türkiye'de +3 saatlik kaymaya yol açar. new Date(y,m,d,h,dk) YEREL
// saat olarak yorumlanır, toISOString() ise bunu doğru UTC karşılığına
// çevirir; sunucu tarafında hangi saat diliminde çalışırsa çalışsın
// artık doğru anı temsil eder.
function localDateTimeToISO(dateStr, timeStr) {
  if (!dateStr) return null;
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '09:00').split(':').map(Number);
  return new Date(y, mo - 1, d, hh, mm, 0).toISOString();
}

// ── GENEL AMAÇLI POPUP/MODAL ──
// Herhangi bir formu (ör. Avukatlık Ücret Sözleşmesi) ekranın ortasında,
// diğer içerikten ayrı, odaklanmış bir pencerede göstermek için.
function openTalyaModal(innerHtml) {
  closeTalyaModal(); // varsa öncekini kapat
  const overlay = document.createElement('div');
  overlay.className = 'talya-modal-overlay';
  overlay.id = 'talyaModalOverlay';
  // NOT: Dışarı tıklayınca kapanmıyor bilerek — kullanıcı yanlışlıkla
  // form dışına tıklayıp girdiği bilgileri kaybetmesin diye.
  overlay.innerHTML = `
    <div class="talya-modal-box">
      <span class="talya-modal-close" onclick="closeTalyaModal()"><i class="fa-solid fa-xmark"></i></span>
      ${innerHtml}
    </div>
  `;
  document.body.appendChild(overlay);
}
function closeTalyaModal() {
  const el = document.getElementById('talyaModalOverlay');
  if (el) el.remove();
}

// Tarayıcının çirkin, varsayılan confirm() penceresi yerine sitenin
// kendi tasarımına uygun bir onay penceresi. Promise<boolean> döner —
// kullanıcı "Evet" derse true, "Vazgeç"/kapatırsa false.
function talyaConfirm(message, confirmLabel, confirmColor) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      closeTalyaModal();
      resolve(result);
    };
    openTalyaModal(`
      <div style="text-align:center;padding:8px 4px;">
        <div style="font-size:14px;color:var(--t0);line-height:1.6;margin-bottom:22px;">${message}</div>
        <div style="display:flex;gap:8px;">
          <button class="pop-cta-btn" style="flex:1;background:var(--bg2);color:var(--t2);" id="talyaConfirmNo">Vazgeç</button>
          <button class="pop-cta-btn ${confirmColor === 'danger' ? '' : 'g'}" style="flex:1;${confirmColor === 'danger' ? 'background:var(--danger);' : ''}" id="talyaConfirmYes">${confirmLabel || 'Evet'}</button>
        </div>
      </div>
    `);
    document.getElementById('talyaConfirmYes').onclick = () => finish(true);
    document.getElementById('talyaConfirmNo').onclick = () => finish(false);
    // Kapatma (X) butonuna basılırsa da "hayır" say.
    const overlay = document.getElementById('talyaModalOverlay');
    const observer = new MutationObserver(() => {
      if (!document.body.contains(overlay)) { settled = true; resolve(false); observer.disconnect(); }
    });
    observer.observe(document.body, { childList: true });
  });
}

// ── ANA SAYFA — HIZLI ERİŞİM (Üyelik & Hesap'tan özelleştirilebilir) ──
async function renderHomeWidgets() {
  const box = document.getElementById('widget-hizliErisim-box');
  const card = document.getElementById('widget-hizliErisim');
  if (!box || !card) return;
  card.style.display = '';
  box.innerHTML = skeletonLines(1);

  let tools;
  try {
    const res = await fetch('/api/profile/home-widget-prefs');
    const data = await res.json();
    tools = (data.prefs && data.prefs.hizliErisimTools) || [];
  } catch (e) {
    tools = [];
  }

  const modules = window.MODULES_INDEX || [];
  const resolved = tools.map(t => {
    const mod = modules.find(m => m.key === t.mod);
    const item = mod && mod.items.find(it => it.id === t.id);
    return item ? { mod: t.mod, id: t.id, icon: item.icon, name: item.name, color: COLOR_MAP[mod.color] || 'var(--gold)', colorLo: COLOR_LO_MAP[mod.color] || 'var(--gold-lo)' } : null;
  }).filter(Boolean);

  if (!resolved.length) {
    card.style.display = 'none';
    return;
  }

  box.innerHTML = resolved.map(t => `
    <div style="position:relative;background:var(--accent-bg);border:1px solid var(--border);border-radius:var(--r);padding:16px 12px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;cursor:pointer;width:140px;transition:all .2s cubic-bezier(.2,.8,.2,1);" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,.1)';this.style.background='${t.colorLo}';this.style.borderColor='${t.color}'" onmouseout="this.style.transform='';this.style.boxShadow='';this.style.background='var(--accent-bg)';this.style.borderColor='var(--border)'" onclick="openModule('${t.mod}?open=${t.id}')">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${t.color};"></div>
      <i class="fa-solid ${t.icon}" style="font-size:18px;color:${t.color};"></i>
      <span style="font-size:12px;color:var(--t1);">${t.name}</span>
    </div>
  `).join('');
}

// "Talya'ya sorun…" kutusunun placeholder'ı, kullanıcı hiçbir şey
// yazmadığı sürece birkaç örnek arasında dönerek kutunun daha "canlı"
// hissettirmesini sağlar — girdiye hiçbir müdahalede bulunmaz, sadece
// ipucu metnidir.
function startAskPlaceholderRotation() {
  const inp = document.getElementById('talya-ask-input');
  if (!inp) return;
  const ORNEKLER = [
    "Talya'ya sorun…",
    'Kira sözleşmesini analiz et…',
    'Tahliye davası dilekçesi hazırla…',
    'Yargıtay emsal kararı bul…',
    'İcra takibi nasıl başlatılır?',
  ];
  let i = 0;
  setInterval(() => {
    if (document.activeElement === inp || inp.value) return; // yazarken değişmesin
    i = (i + 1) % ORNEKLER.length;
    inp.placeholder = ORNEKLER[i];
  }, 2500);
}

async function talyaAskSubmit() {
  const inp = document.getElementById('talya-ask-input');
  const text = inp ? inp.value.trim() : '';
  if (!text) return;

  openTalyaModal(`
    <div class="ic" style="margin-bottom:14px;"><div class="ic-t"><i class="fa-solid fa-scale-balanced"></i> Talya'ya Sordunuz</div>
      <p style="font-style:italic;">"${text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}"</p>
    </div>
    <div id="talya-ask-answer" style="font-size:13px;color:var(--t2);line-height:1.7;">
      <i class="fa-solid fa-spinner fa-spin"></i> Talya düşünüyor…
    </div>
    <button class="pop-cta-btn" style="width:100%;margin-top:16px;background:var(--bg2);color:var(--t2);" onclick="closeTalyaModal()">Kapat</button>
  `);
  inp.value = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    const answerBox = document.getElementById('talya-ask-answer');
    if (!answerBox) return; // kullanıcı pencereyi kapattıysa
    if (!res.ok) {
      answerBox.innerHTML = `<span style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> ${data.error || 'Bir hata oluştu.'}</span>`;
      return;
    }
    answerBox.innerHTML = fmtAI(data.reply || 'Bir cevap alınamadı, tekrar deneyin.');
  } catch (e) {
    const answerBox = document.getElementById('talya-ask-answer');
    if (answerBox) answerBox.innerHTML = `<span style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Bağlantı hatası. Lütfen tekrar deneyin.</span>`;
  }
}

function autoH(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }

// Bir tarihi gösterirken, eğer anlamlı bir saat bilgisi varsa (tam gece
// yarısı değilse) tarihin yanına saati de ekler — ör. arabuluculuk
// toplantı saatleri, Telegram botunun mesajında da bu saatin görünmesi
// gerektiği için özellikle önemli.
function fmtDueDate(dueDate) {
  const d = new Date(dueDate);
  const dateStr = d.toLocaleDateString('tr-TR');
  const hasTime = !(d.getHours() === 0 && d.getMinutes() === 0);
  if (!hasTime) return dateStr;
  const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
}

// ── BİNLİK AYRACI (para alanları) ──
// "tl-amount" sınıflı her giriş alanına, kullanıcı yazarken otomatik
// olarak "150.000" gibi binlik ayraç ekler. Sayfa yeniden yüklenmeden
// dinamik olarak eklenen alanlarda da çalışsın diye, tek tek her alana
// dinleyici bağlamak yerine tüm sayfayı (document) dinliyoruz (event
// delegation) — hangi modülde/ne zaman oluşturulursa oluşturulsun çalışır.
function tlParseValue(str) {
  // "150.000" -> "150000" (hesaplama/kaydetme için temiz sayı)
  if (typeof str !== 'string') return str;
  return str.replace(/\./g, '').replace(',', '.');
}
function tlFormatValue(digits) {
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
document.addEventListener('input', function (e) {
  const el = e.target;
  if (!el.classList || !el.classList.contains('tl-amount')) return;
  const cursorFromEnd = el.value.length - (el.selectionStart || el.value.length);
  const digitsOnly = el.value.replace(/[^\d]/g, '');
  const formatted = tlFormatValue(digitsOnly);
  el.value = formatted;
  const newPos = Math.max(0, formatted.length - cursorFromEnd);
  try { el.setSelectionRange(newPos, newPos); } catch (err) {}
});

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
        <span class="dl-days">${fmtDueDate(e.dueDate)}</span>
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
    const selected = prefData.selected || ['gelirgider', 'muvekkil', 'dosya'];

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
            const bekleyen = stats.gelirgider?.bekleyen || 0;
            const positive = net >= 0;
            const maxBar = Math.max(gelir, gider, 1);
            return `
              <div style="position:relative;background:var(--accent-bg);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${positive ? 'var(--gold)' : 'var(--danger)'};"></div>
                <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">
                  <i class="fa-solid fa-scale-balanced"></i> Bu Ay Net
                </div>
                <div style="font-family:'Inter',sans-serif;font-weight:700;font-size:24px;line-height:1;color:${positive ? 'var(--gold)' : 'var(--danger)'};margin-bottom:10px;">
                  ${fmtTLShort(net)}
                </div>
                <div style="width:100%;display:flex;flex-direction:column;gap:5px;margin-bottom:${bekleyen > 0 ? '6px' : '0'};">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:9.5px;color:var(--success);width:34px;text-align:right;flex-shrink:0;">Gelir</span>
                    <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="width:${(gelir/maxBar)*100}%;height:100%;background:var(--success);"></div></div>
                    <span style="font-size:9.5px;color:var(--t3);width:44px;text-align:left;flex-shrink:0;">${fmtTLShort(gelir)}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:9.5px;color:var(--danger);width:34px;text-align:right;flex-shrink:0;">Gider</span>
                    <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="width:${(gider/maxBar)*100}%;height:100%;background:var(--danger);"></div></div>
                    <span style="font-size:9.5px;color:var(--t3);width:44px;text-align:left;flex-shrink:0;">${fmtTLShort(gider)}</span>
                  </div>
                </div>
                ${bekleyen > 0 ? `
                  <div style="font-size:10.5px;color:var(--warn);border-top:1px solid var(--border);padding-top:6px;width:100%;">
                    <i class="fa-solid fa-hourglass-half"></i> Bekleyen: ${fmtTLShort(bekleyen)}
                  </div>
                ` : ''}
              </div>
            `;
          }

          if (key === 'muvekkil') {
            const aktif = stats.muvekkil?.aktif ?? 0;
            const aday = stats.muvekkil?.aday ?? 0;
            const arsiv = stats.muvekkil?.arsiv ?? 0;
            const total = Math.max(aktif + aday + arsiv, 1);
            const circumference = 2 * Math.PI * 26;
            const aktifLen = (aktif / total) * circumference;
            const adayLen = (aday / total) * circumference;
            const adayOffset = -aktifLen;
            const arsivLen = (arsiv / total) * circumference;
            const arsivOffset = -(aktifLen + adayLen);
            return `
              <div style="position:relative;background:var(--accent-bg);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--gold);"></div>
                <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">
                  <i class="fa-solid fa-users"></i> Toplam Müvekkil
                </div>
                <div style="position:relative;width:70px;height:70px;margin-bottom:8px;">
                  <svg width="70" height="70" viewBox="0 0 70 70" style="transform:rotate(-90deg);">
                    <circle cx="35" cy="35" r="26" fill="none" stroke="var(--border)" stroke-width="8"></circle>
                    <circle cx="35" cy="35" r="26" fill="none" stroke="var(--blue)" stroke-width="8" stroke-dasharray="${aktifLen} ${circumference}"></circle>
                    <circle cx="35" cy="35" r="26" fill="none" stroke="var(--amber)" stroke-width="8" stroke-dasharray="${adayLen} ${circumference}" stroke-dashoffset="${adayOffset}"></circle>
                    <circle cx="35" cy="35" r="26" fill="none" stroke="var(--t3)" stroke-width="8" stroke-dasharray="${arsivLen} ${circumference}" stroke-dashoffset="${arsivOffset}"></circle>
                  </svg>
                  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-weight:700;font-size:17px;color:var(--t0);">${aktif + aday + arsiv}</div>
                </div>
                <div style="display:flex;gap:8px;font-size:9.5px;flex-wrap:wrap;justify-content:center;">
                  <span style="color:var(--blue);"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--blue);margin-right:3px;"></span>${aktif} Aktif</span>
                  <span style="color:var(--amber);"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--amber);margin-right:3px;"></span>${aday} Aday</span>
                  <span style="color:var(--t3);"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--t3);margin-right:3px;"></span>${arsiv} Arşiv</span>
                </div>
                ${stats.muvekkil?.yeniBuAy > 0 ? `<div style="font-size:9.5px;color:var(--success);margin-top:4px;">+${stats.muvekkil.yeniBuAy} bu ay</div>` : ''}
              </div>
            `;
          }

          if (key === 'dosya') {
            const open = stats.dosya?.open ?? 0;
            const closed = stats.dosya?.closed ?? 0;
            const total = Math.max(open + closed, 1);
            const openPct = (open / total) * 100;
            const circumference = 2 * Math.PI * 26; // r=26
            const openLen = (openPct / 100) * circumference;
            return `
              <div style="position:relative;background:var(--accent-bg);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--gold);"></div>
                <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">
                  <i class="fa-solid fa-folder-open"></i> Dosya Durumu
                </div>
                <div style="position:relative;width:70px;height:70px;margin-bottom:8px;">
                  <svg width="70" height="70" viewBox="0 0 70 70" style="transform:rotate(-90deg);">
                    <circle cx="35" cy="35" r="26" fill="none" stroke="var(--danger)" stroke-width="8"></circle>
                    <circle cx="35" cy="35" r="26" fill="none" stroke="var(--success)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${openLen} ${circumference}"></circle>
                  </svg>
                  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-weight:700;font-size:17px;color:var(--t0);">${open + closed}</div>
                </div>
                <div style="display:flex;gap:10px;font-size:10.5px;">
                  <span style="color:var(--success);"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--success);margin-right:3px;"></span>${open} Açık</span>
                  <span style="color:var(--danger);"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--danger);margin-right:3px;"></span>${closed} Kapalı</span>
                </div>
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

function fmtTL(n) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n); }
function fmtTLShort(n) {
  if (typeof fmtTL === 'function') return fmtTL(n);
  return n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
}

async function renderDashOzet() {
  const box = document.getElementById('dashOzet');
  if (!box) return;
  box.innerHTML = skeletonLines(2);
  try {
    const res = await fetch('/api/daily-summary');
    const data = await res.json();
    const items = [
      { renk: 'var(--success)', metin: `Bugün <strong>${data.bugunDurusma}</strong> duruşmanız/etkinliğiniz var.`, gizle: data.bugunDurusma === 0 },
      { renk: 'var(--warn)', metin: data.yaklasanOdeme === 1 && data.enYakinOdemeIsim ? `<strong>${data.enYakinOdemeIsim}</strong>'in ödemesi yaklaşıyor.` : `<strong>${data.yaklasanOdeme}</strong> ödeme yaklaşıyor.`, gizle: data.yaklasanOdeme === 0 },
      { renk: 'var(--blue)', metin: `<strong>${data.uyapHareket}</strong> dosyada yeni UYAP hareketi var.`, gizle: data.uyapHareket === 0 },
      { renk: 'var(--danger)', metin: data.gecikenGorev === 1 && data.enGecikenGorevBaslik ? `"<strong>${data.enGecikenGorevBaslik}</strong>" görevi gecikti.` : `<strong>${data.gecikenGorev}</strong> görev gecikti.`, gizle: data.gecikenGorev === 0 },
    ].filter(i => !i.gizle);

    box.innerHTML = (items.length ? items.map(i => `
      <div style="display:flex;align-items:center;gap:10px;padding:7px 0;font-size:12.5px;color:var(--t1);">
        <span style="width:8px;height:8px;border-radius:50%;background:${i.renk};flex-shrink:0;"></span>
        <span>${i.metin}</span>
      </div>
    `).join('') : `<div style="font-size:12.5px;color:var(--t3);padding:8px 0;">Bugün için özel bir durum yok — her şey yolunda.</div>`)
    + (data.oneri ? `
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
        <div style="font-size:9.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--gold);margin-bottom:4px;"><i class="fa-solid fa-lightbulb"></i> Talya'nın Önerisi</div>
        <div style="font-size:12px;color:var(--t2);">${data.oneri}</div>
      </div>
    ` : '');
  } catch (e) {
    box.innerHTML = `<div style="font-size:12px;color:var(--danger);">Yüklenemedi.</div>`;
  }
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
        <span class="dl-days">${fmtDueDate(e.dueDate)}</span>
      </div>`;
    }).join('');
  } catch (e) {
    wrap.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--danger);">Yüklenemedi.</div>`;
  }
}

// ── BİLDİRİMLER (gerçek veri: yaklaşan duruşma/ödeme tarihleri) ──
// Dışarıdan bir ses dosyası İNDİRMEDEN (telif/ağ derdi olmadan), kısa bir
// "ding-dong" sesini doğrudan koda gömdük (base64). Web Audio API yerine
// klasik <audio> etiketi kullanıyoruz — tarayıcıların otomatik ses
// engelleme davranışında daha güvenilir çalışıyor. Sayfadaki İLK
// tıklama/tuşla "kilidini açıyoruz" (tarayıcı kuralı gereği).
const NOTIF_SOUND_B64 = 'data:audio/wav;base64,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';
let sharedNotifAudio = null;
function unlockAudioOnce() {
  if (sharedNotifAudio) return;
  try {
    sharedNotifAudio = new Audio(NOTIF_SOUND_B64);
    sharedNotifAudio.volume = 0.5;
    // Sessiz bir "dene çal" ile kilidi açıyoruz (bazı tarayıcılar ilk
    // etkileşimde gerçekten çalınmasını istiyor).
    sharedNotifAudio.play().then(() => {
      sharedNotifAudio.pause();
      sharedNotifAudio.currentTime = 0;
    }).catch(() => {});
  } catch (e) { /* desteklenmiyor */ }
}
if (typeof document !== 'undefined') {
  ['click', 'keydown', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, unlockAudioOnce, { once: true, passive: true });
  });
}

function playNotifSound() {
  try {
    if (sharedNotifAudio) {
      sharedNotifAudio.currentTime = 0;
      sharedNotifAudio.play().catch(() => {});
    } else {
      // Kilidi hiç açılmadıysa (kullanıcı hiç tıklamadıysa) yine de dene —
      // bazı taraylıcılarda çalışabilir.
      new Audio(NOTIF_SOUND_B64).play().catch(() => {});
    }
  } catch (e) { /* tarayıcı desteklemiyorsa sessizce geç */ }
}

let NOTIFS = [];
let seenMessageNotifIds = new Set();
let notifPollStarted = false;

async function loadRealNotifications() {
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) return;
    const data = await res.json();
    const fresh = (data.notifications || []).map((n, i) => ({ ...n, id: n.id || i }));

    // Yeni gelen müvekkil mesajı bildirimleri için gerçek bir popup göster
    // (sadece zilde birikmesin, dikkat çeksin). İlk yüklemede (sayfa yeni
    // açıldığında) hiçbirini "yeni" saymıyoruz — yoksa her girişte eski
    // mesajlar için de popup çıkardı.
    const isFirstLoad = seenMessageNotifIds.size === 0 && !notifPollStarted;
    fresh.forEach(n => {
      if (n.type === 'musteri_mesaj' && !seenMessageNotifIds.has(n.id)) {
        seenMessageNotifIds.add(n.id);
        if (!isFirstLoad) {
          toast(n.text, 'fa-solid fa-comment-dots', true);
          playNotifSound();
        }
      }
      // Tevkil Menüsü — yeni talep / onay / iptal bildirimleri de aynı
      // şekilde sesli+popup uyarı versin (zilde birikip sessizce kalmasın).
      if (typeof n.id === 'string' && n.id.indexOf('tevkil') === 0 && !seenMessageNotifIds.has(n.id)) {
        seenMessageNotifIds.add(n.id);
        if (!isFirstLoad) {
          toast(n.text, 'fa-solid ' + (n.ico || 'fa-people-arrows'), true);
          playNotifSound();
        }
      }
    });
    notifPollStarted = true;

    NOTIFS = fresh;
    renderNotifs();
  } catch (e) { /* sessizce geç */ }
}

// Yeni müvekkil mesajlarını yakalamak için düzenli aralıklarla kontrol et.
if (typeof window !== 'undefined' && !window.__talyaNotifPollStarted) {
  window.__talyaNotifPollStarted = true;
  setInterval(loadRealNotifications, 60000);
}

let notifPrefs = { sure: true, tebligat: true, musteri_mesaj: true };
let activeFilter = 'all';

async function loadNotifPrefs() {
  try {
    const res = await fetch('/api/profile/notif-prefs');
    if (!res.ok) return;
    const data = await res.json();
    // Eski kaydedilmiş tercihlerde "musteri_mesaj" anahtarı hiç yoksa
    // (yeni eklendiği için), varsayılan olarak açık kalsın diye önce
    // varsayılanları, sonra kullanıcının kaydettiklerini uyguluyoruz.
    if (data.prefs) { notifPrefs = { sure: true, tebligat: true, musteri_mesaj: true, ...data.prefs }; renderNotifs(); }
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

  // Müvekkil mesajı bildirimiyse, doğrudan o müvekkilin mesaj ekranına götür.
  if (n && n.type === 'musteri_mesaj' && n.clientId) {
    window.location.href = '/dashboard/buro?openClient=' + n.clientId;
  }
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

// ── RENK PALETİ ── varsayılan + 3 seçenek (lacivert, bordo, antrasit).
// Karanlık/aydınlık modla aynı şekilde tarayıcıda saklanır.
function setPalette(name) {
  if (name && name !== 'varsayilan') {
    document.documentElement.setAttribute('data-palette', name);
  } else {
    document.documentElement.removeAttribute('data-palette');
  }
  localStorage.setItem('talya-palette', name || 'varsayilan');
}
(function () {
  const savedPalette = localStorage.getItem('talya-palette');
  if (savedPalette && savedPalette !== 'varsayilan') {
    document.documentElement.setAttribute('data-palette', savedPalette);
  }
})();

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

// Bu fonksiyon, sayfa ilk açıldığında BİR KEZ, ayrıca SPA modunda (kalıcı
// menü) bir modülden diğerine geçildiğinde her seferinde TEKRAR çağrılır
// — çünkü içerik alanı yenilendiğinde (popBody, detailPane vb. yeniden
// oluştuğunda) verinin yeniden çekilip ekrana basılması gerekir.
window.talyaInitPage = async function () {
  cmdkItems = window.CMDK_INDEX || [];
  if (window.CURRENT_MODULE) {
    await initModulePage();
  } else {
    runCountUp();
    renderDashDeadlines();
    renderDashOzet();
    renderGelirGiderOzet();
    renderAppSidebar();
    renderHomeWidgets();
    startAskPlaceholderRotation();
  }
  loadRealNotifications();
};

// SPA modunda (kalıcı menü) bu otomatik çalıştırma ATLANIR —
// DashboardShellClient, içerik VE modül scripti tamamen hazır olduktan
// SONRA window.talyaInitPage()'i KENDİSİ çağırır. Bu satır, engine.js
// script'i CURRENT_MODULE henüz set edilmeden (içerik yüklenmeden)
// otomatik çalışıp menüyü yanlış (eksik) bir duruma göre çizmesini
// önler — "tıklayınca hiçbir şey gelmiyor, sayfayı yenileyince geliyor"
// hatasının kök nedeni buydu.
if (!window.__talyaSpaMode) {
  window.talyaInitPage();
}
loadNotifPrefs();
if (window.__talyaReady) window.__talyaReady();

// ══════════════════════════════════════════════════════
// OTOMATİK OTURUM KAPATMA — 30 dakika hareketsizlikten sonra
// güvenlik için otomatik çıkış yapar (son 2 dakikada uyarı gösterir).
// Hassas müvekkil verisi taşıdığımız için, paylaşımlı bilgisayarlarda
// unutulan oturumların açık kalmamasını sağlar.
// ══════════════════════════════════════════════════════
(function () {
  const IDLE_LIMIT_MS = 30 * 60 * 1000;      // 30 dakika
  const WARNING_BEFORE_MS = 2 * 60 * 1000;   // son 2 dakikada uyar
  let idleTimer = null;
  let warningTimer = null;
  let countdownInterval = null;

  function getModal() {
    let modal = document.getElementById('idleWarningScrim');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'idleWarningScrim';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:32px;width:min(360px,90vw);text-align:center;">
        <i class="fa-solid fa-hourglass-half" style="font-size:26px;color:var(--warn);margin-bottom:14px;display:block;"></i>
        <div style="font-family:'Instrument Serif',serif;font-size:19px;color:var(--t0);margin-bottom:8px;">Hâlâ orada mısınız?</div>
        <div style="font-size:12.5px;color:var(--t2);line-height:1.6;margin-bottom:18px;">
          Güvenliğiniz için, hareketsizlik nedeniyle <strong id="idleCountdown">2:00</strong> içinde oturumunuz otomatik kapanacak.
        </div>
        <button id="idleStayBtn" style="width:100%;padding:11px 18px;border-radius:8px;border:none;background:var(--gold);color:#fff;font-weight:500;cursor:pointer;font-size:13px;">
          Oturumu Devam Ettir
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#idleStayBtn').onclick = () => resetIdleTimer(true);
    return modal;
  }

  function showWarning() {
    const modal = getModal();
    modal.style.display = 'flex';
    let remaining = WARNING_BEFORE_MS;
    const countdownEl = () => document.getElementById('idleCountdown');
    countdownInterval = setInterval(() => {
      remaining -= 1000;
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        if (window.talyaSignOut) window.talyaSignOut();
        else window.location.href = '/';
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      const el = countdownEl();
      if (el) el.textContent = mins + ':' + String(secs).padStart(2, '0');
    }, 1000);
  }

  function hideWarning() {
    const modal = document.getElementById('idleWarningScrim');
    if (modal) modal.style.display = 'none';
    if (countdownInterval) clearInterval(countdownInterval);
  }

  function resetIdleTimer(fromButton) {
    hideWarning();
    if (idleTimer) clearTimeout(idleTimer);
    if (warningTimer) clearTimeout(warningTimer);
    idleTimer = setTimeout(showWarning, IDLE_LIMIT_MS - WARNING_BEFORE_MS);
    if (fromButton) toast('Oturum devam ettirildi', 'fa-solid fa-check', true);
  }

  // Sayfa etkileşimlerinde zamanlayıcıyı sıfırla — ama uyarı ekranı
  // AÇIKKEN sıradan bir "mouse hareketi" onu kapatmasın; sadece
  // butona tıklayarak devam edilebilsin (yanlışlıkla geçiştirmeyi önler).
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, () => {
      const modal = document.getElementById('idleWarningScrim');
      if (modal && modal.style.display === 'flex') return; // uyarı açıkken sadece butonla devam edilir
      resetIdleTimer(false);
    }, { passive: true });
  });

  resetIdleTimer(false);
})();
