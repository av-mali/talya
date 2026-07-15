// Bu dosya SADECE 'Üyelik & Hesap' modülüne aittir.
// Bu modülü düzenlemek diğer modülleri etkilemez.
window.CURRENT_MODULE = {
  key: 'uyelik',
  label: 'Üyelik & Hesap',
  nameHtml: `Üyelik <em class="g">& Hesap</em>`,
  color: 'g',
  items: [
    {"id": "plan", "icon": "fa-star", "name": "Planım & Abonelik"},
    {"id": "faturalar", "icon": "fa-file-invoice", "name": "Fatura Geçmişi"},
    {"id": "profil", "icon": "fa-user-circle", "name": "Profil Bilgileri"},
    {"id": "guvenlik", "icon": "fa-shield-halved", "name": "Güvenlik & Şifre"},
    {"id": "bildirim", "icon": "fa-bell", "name": "Bildirim Ayarları"},
    {"id": "anasayfaistatistik", "icon": "fa-chart-simple", "name": "Ana Sayfa İstatistikleri"},
    {"id": "telegrambaglanti", "icon": "fa-paper-plane", "name": "Talya Asistan (Telegram)"}
  ],
  popups: {
    plan: {
      badge: 'g', badgeText: 'Abonelik', titleHtml: 'Planım &amp; <em class="g">Abonelik</em>',
      desc: 'Mevcut planınız ve durumu.',
      btnClass: 'g', btnIco: 'fa-star', btnLbl: '', hideCta: true,
      body: `
        <div style="background:var(--gold-lo);border:1px solid var(--gold-rule);border-radius:var(--r);padding:16px;margin-bottom:12px;">
          <div style="font-family:'Instrument Serif',serif;font-size:18px;color:var(--gold);margin-bottom:4px;">Standart Kullanım</div>
          <div style="font-size:12px;color:var(--t2);">Şu an ücretli bir abonelik sistemi aktif değil — hesabınız tam yetkiyle kullanımda.</div>
        </div>
        <div style="font-size:12.5px;color:var(--t2);line-height:1.6;">
          İleride ücretli planlar eklenirse, buradan görüntüleyip yönetebileceksiniz.
          Sorularınız için yöneticinizle iletişime geçebilirsiniz.
        </div>
      `,
      onOpen: () => {},
      prompt: () => ''
    },
    faturalar: {
      badge: 'g', badgeText: 'Fatura Geçmişi', titleHtml: 'Fatura <em class="g">Geçmişi</em>',
      desc: 'Abonelik ödeme geçmişiniz.',
      btnClass: 'g', btnIco: 'fa-file-invoice', btnLbl: '', hideCta: true,
      body: `
        <div style="text-align:center;padding:30px 10px;color:var(--t3);">
          <i class="fa-solid fa-file-invoice" style="font-size:26px;opacity:.3;display:block;margin-bottom:10px;"></i>
          Henüz bir ödeme sistemi entegre edilmedi.<br>Bu ekran, ücretli abonelik başladığında dolacak.
        </div>
      `,
      onOpen: () => {},
      prompt: () => ''
    },
    profil: {
      badge: 'g', badgeText: 'Hesap Bilgileri', titleHtml: 'Profil <em class="g">Bilgileri</em>',
      desc: 'Hesap bilgilerinizi görüntüleyin ve güncelleyin.',
      btnClass: 'g', btnIco: 'fa-floppy-disk', btnLbl: '', hideCta: true,
      body: `<div id="profil-box"></div>`,
      onOpen: () => profilOnOpen(),
      prompt: () => ''
    },
    guvenlik: {
      badge: 'g', badgeText: 'Güvenlik', titleHtml: 'Güvenlik &amp; <em class="g">Şifre</em>',
      desc: 'Şifrenizi değiştirin.',
      btnClass: 'g', btnIco: 'fa-shield-halved', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><div class="fl">Mevcut Şifre</div><input type="password" id="pw-current" placeholder="••••••••"></div>
        <div class="fg"><div class="fl">Yeni Şifre (en az 6 karakter)</div><input type="password" id="pw-new" placeholder="••••••••"></div>
        <div class="fg"><div class="fl">Yeni Şifre (tekrar)</div><input type="password" id="pw-new2" placeholder="••••••••"></div>
        <button class="pop-cta-btn g" style="width:100%;" onclick="guvenlikSave()"><i class="fa-solid fa-shield-halved"></i><span>Şifreyi Güncelle</span></button>
        <div id="guvenlik-msg" style="font-size:12px;margin-top:10px;"></div>
      `,
      onOpen: () => {
        const box = document.getElementById('guvenlik-msg');
        if (box) box.textContent = '';
      },
      prompt: () => ''
    },
    bildirim: {
      badge: 'g', badgeText: 'Bildirimler', titleHtml: 'Bildirim <em class="g">Ayarları</em>',
      desc: 'Hangi bildirim türlerini görmek istediğinizi seçin.',
      btnClass: 'g', btnIco: 'fa-bell', btnLbl: '', hideCta: true,
      body: `<div id="bildirim-box"></div>`,
      onOpen: () => bildirimOnOpen(),
      prompt: () => ''
    },
    anasayfaistatistik: {
      badge: 'g', badgeText: 'Ana Sayfa', titleHtml: 'Ana Sayfa <em class="g">İstatistikleri</em>',
      desc: 'Ana sayfada hangi istatistiklerin gösterileceğini seçin (en fazla 2).',
      btnClass: 'g', btnIco: 'fa-chart-simple', btnLbl: '', hideCta: true,
      body: `<div id="homestats-box"></div>`,
      onOpen: () => homeStatsOnOpen(),
      prompt: () => ''
    },
    telegrambaglanti: {
      badge: 'g', badgeText: 'Talya Asistan', titleHtml: 'Telegram <em class="g">Bağlantısı</em>',
      desc: 'Telegram\'dan "gündem" yazarak günlük özetinizi alın.',
      btnClass: 'g', btnIco: 'fa-paper-plane', btnLbl: '', hideCta: true,
      body: `<div id="telegram-box"></div>`,
      onOpen: () => telegramOnOpen(),
      prompt: () => ''
    }
  }
};

// ══════════════════════════════════════════════════════
// PROFİL BİLGİLERİ
// ══════════════════════════════════════════════════════
async function profilOnOpen() {
  const box = document.getElementById('profil-box');
  box.innerHTML = skeletonLines(4);
  try {
    const res = await fetch('/api/profile');
    const data = await res.json();
    const u = data.user;
    box.innerHTML = `
      <div class="fg"><div class="fl">Ad Soyad</div><input type="text" id="pf-name" value="${(u.name||'').replace(/"/g,'&quot;')}"></div>
      <div class="fg"><div class="fl">E-posta</div><input type="text" value="${u.email}" disabled style="opacity:.6;"></div>
      <div class="fg"><div class="fl">Telefon</div><input type="text" id="pf-phone" value="${(u.phone||'').replace(/"/g,'&quot;')}"></div>
      <div class="fg"><div class="fl">Baro</div><input type="text" id="pf-baro" value="${(u.baro||'').replace(/"/g,'&quot;')}"></div>
      <div class="fg"><div class="fl">Sicil Numarası</div><input type="text" id="pf-sicil" value="${(u.sicilNo||'').replace(/"/g,'&quot;')}"></div>
      <button class="pop-cta-btn g" style="width:100%;" onclick="profilSave()"><i class="fa-solid fa-floppy-disk"></i><span>Kaydet</span></button>
      <div id="profil-msg" style="font-size:12px;margin-top:10px;"></div>
    `;
  } catch (e) {
    box.innerHTML = `<div style="color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

async function profilSave() {
  const name = document.getElementById('pf-name').value;
  const phone = document.getElementById('pf-phone').value;
  const baro = document.getElementById('pf-baro').value;
  const sicilNo = document.getElementById('pf-sicil').value;
  const msg = document.getElementById('profil-msg');

  const res = await fetch('/api/profile', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, baro, sicilNo })
  });
  if (res.ok) {
    msg.style.color = 'var(--success)';
    msg.textContent = 'Bilgiler güncellendi.';
    toast('Profil güncellendi', 'fa-solid fa-check', true);
    const pill = document.getElementById('userEmailPill');
    if (pill && name) { /* e-posta sabit kalır, isim ayrı gösterilmiyor şu an */ }
  } else {
    msg.style.color = 'var(--danger)';
    msg.textContent = 'Güncellenemedi.';
  }
}

// ══════════════════════════════════════════════════════
// GÜVENLİK & ŞİFRE
// ══════════════════════════════════════════════════════
async function guvenlikSave() {
  const currentPassword = document.getElementById('pw-current').value;
  const newPassword = document.getElementById('pw-new').value;
  const newPassword2 = document.getElementById('pw-new2').value;
  const msg = document.getElementById('guvenlik-msg');

  if (!currentPassword || !newPassword) {
    msg.style.color = 'var(--danger)'; msg.textContent = 'Tüm alanları doldurun.'; return;
  }
  if (newPassword !== newPassword2) {
    msg.style.color = 'var(--danger)'; msg.textContent = 'Yeni şifreler eşleşmiyor.'; return;
  }
  if (newPassword.length < 6) {
    msg.style.color = 'var(--danger)'; msg.textContent = 'Yeni şifre en az 6 karakter olmalı.'; return;
  }

  const res = await fetch('/api/profile/password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await res.json();
  if (res.ok) {
    msg.style.color = 'var(--success)';
    msg.textContent = 'Şifre güncellendi.';
    toast('Şifre güncellendi', 'fa-solid fa-check', true);
    document.getElementById('pw-current').value = '';
    document.getElementById('pw-new').value = '';
    document.getElementById('pw-new2').value = '';
  } else {
    msg.style.color = 'var(--danger)';
    msg.textContent = data.error || 'Güncellenemedi.';
  }
}

// ══════════════════════════════════════════════════════
// BİLDİRİM AYARLARI
// ══════════════════════════════════════════════════════
async function bildirimOnOpen() {
  const box = document.getElementById('bildirim-box');
  box.innerHTML = skeletonLines(2);
  try {
    const res = await fetch('/api/profile/notif-prefs');
    const data = await res.json();
    const prefs = data.prefs || { sure: true, tebligat: true };
    box.innerHTML = `
      <div class="cl">
        <div class="cl-head"><i class="fa-solid fa-bell"></i> Bildirim Türleri</div>
        <div class="cl-item" style="cursor:pointer;" onclick="bildirimToggle('sure', this)">
          <div class="cl-dot">${prefs.sure ? '<i class="fa-solid fa-check"></i>' : ''}</div>
          <span>Süre uyarıları (duruşma/görev tarihleri)</span>
        </div>
        <div class="cl-item" style="cursor:pointer;" onclick="bildirimToggle('tebligat', this)">
          <div class="cl-dot">${prefs.tebligat ? '<i class="fa-solid fa-check"></i>' : ''}</div>
          <span>Ödeme hatırlatmaları</span>
        </div>
      </div>
      <div style="font-size:11px;color:var(--t3);margin-top:10px;">Değişiklik anında kaydedilir.</div>
    `;
  } catch (e) {
    box.innerHTML = `<div style="color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

async function bildirimToggle(type, el) {
  const dot = el.querySelector('.cl-dot');
  const isOn = dot.innerHTML.trim() !== '';
  const newVal = !isOn;
  dot.innerHTML = newVal ? '<i class="fa-solid fa-check"></i>' : '';

  const res = await fetch('/api/profile/notif-prefs');
  const data = await res.json();
  const prefs = data.prefs || {};
  prefs[type] = newVal;

  await fetch('/api/profile/notif-prefs', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefs })
  });
  if (typeof notifPrefs !== 'undefined') { notifPrefs[type] = newVal; }
  toast('Bildirim tercihi güncellendi', 'fa-solid fa-check', true);
}

// ══════════════════════════════════════════════════════
// ANA SAYFA İSTATİSTİKLERİ — en fazla 2 tanesi seçilebilir
// ══════════════════════════════════════════════════════
const HOME_STATS_OPTIONS = [
  { key: 'gelirgider', label: 'Bu Ay Net Gelir-Gider' },
  { key: 'muvekkil', label: 'Toplam Müvekkil Sayısı' },
  { key: 'dosya', label: 'Açık / Kapalı Dosya Sayısı' },
];
const HOME_STATS_MAX = 2;

async function homeStatsOnOpen() {
  const box = document.getElementById('homestats-box');
  box.innerHTML = skeletonLines(3);
  try {
    const res = await fetch('/api/profile/home-stats-prefs');
    const data = await res.json();
    homeStatsRender(data.selected || ['gelirgider']);
  } catch (e) {
    box.innerHTML = `<div style="color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

function homeStatsRender(selected) {
  const box = document.getElementById('homestats-box');
  box.innerHTML = `
    <div style="font-size:11.5px;color:var(--t3);line-height:1.6;margin-bottom:14px;">
      Ana sayfadaki istatistik kutusunun büyümemesi için en fazla <strong>${HOME_STATS_MAX}</strong> tanesini seçebilirsiniz.
    </div>
    ${HOME_STATS_OPTIONS.map(opt => `
      <label style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;">
        <input type="checkbox" class="homestats-cb" value="${opt.key}" ${selected.includes(opt.key) ? 'checked' : ''} onchange="homeStatsToggle()">
        <span style="font-size:13px;">${opt.label}</span>
      </label>
    `).join('')}
    <div id="homestats-msg" style="font-size:11px;color:var(--warn);margin-top:8px;"></div>
  `;
  box.dataset.selected = JSON.stringify(selected);
}

function homeStatsToggle() {
  const checkboxes = document.querySelectorAll('.homestats-cb');
  const checked = Array.from(checkboxes).filter(cb => cb.checked);
  const msg = document.getElementById('homestats-msg');

  if (checked.length > HOME_STATS_MAX) {
    // Son işaretleneni geri al, limiti aş­tırma.
    const last = checked[checked.length - 1];
    last.checked = false;
    msg.textContent = `En fazla ${HOME_STATS_MAX} istatistik seçebilirsiniz.`;
    return;
  }
  msg.textContent = '';

  const selected = Array.from(document.querySelectorAll('.homestats-cb'))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  fetch('/api/profile/home-stats-prefs', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selected })
  }).then(() => toast('Kaydedildi', 'fa-solid fa-check', true));
}

// ══════════════════════════════════════════════════════
// TALYA ASİSTAN — Telegram bağlantısı
// ══════════════════════════════════════════════════════
async function telegramOnOpen() {
  const box = document.getElementById('telegram-box');
  box.innerHTML = skeletonLines(3);
  try {
    const res = await fetch('/api/profile/telegram-code');
    const data = await res.json();
    telegramRender(data.connected, data.dailyTime);
  } catch (e) {
    box.innerHTML = `<div style="color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

function telegramRender(connected, dailyTime) {
  const box = document.getElementById('telegram-box');
  if (connected) {
    box.innerHTML = `
      <div class="ic" style="margin-bottom:14px;">
        <div class="ic-t"><i class="fa-solid fa-circle-check" style="color:var(--success);"></i> Bağlı</div>
        <p>Telegram hesabınız bağlı. Bota "gündem" yazarak istediğiniz an özetinizi alabilirsiniz.</p>
      </div>

      <div class="fg">
        <div class="fl">Her Gün Otomatik Gönderim Saati <span class="opt">(opsiyonel)</span></div>
        <div style="display:flex;gap:6px;">
          <input type="time" id="telegram-daily-time" value="${dailyTime || ''}" style="flex:1;">
          <button class="pop-cta-btn b" style="width:auto;padding:8px 14px;" onclick="telegramSaveDailyTime()">Kaydet</button>
        </div>
        <div style="font-size:11px;color:var(--t3);margin-top:6px;">Belirlediğiniz saatte, siz yazmadan gündeminiz otomatik gönderilir. Boş bırakıp kaydederseniz otomatik gönderim kapanır.</div>
      </div>

      <button class="pop-cta-btn" style="width:100%;margin-top:14px;background:var(--danger);" onclick="telegramDisconnect()"><i class="fa-solid fa-link-slash"></i><span>Bağlantıyı Kaldır</span></button>
    `;
  } else {
    box.innerHTML = `
      <div style="font-size:12.5px;color:var(--t2);line-height:1.6;margin-bottom:14px;">
        <strong>Talya Asistan</strong>, Telegram üzerinden günlük gündeminizi (duruşmalar, alacaklar, görevler, Resmi Gazete özeti) size gönderen bir bot.
      </div>
      <ol style="font-size:12.5px;color:var(--t2);line-height:1.8;padding-left:18px;margin-bottom:14px;">
        <li>Telegram'da <strong>@TalyaAsistanBot</strong>'u bulup başlatın.</li>
        <li>Aşağıdaki butona basıp bir kod alın.</li>
        <li>Bota <code>/baglan KOD</code> yazın.</li>
      </ol>
      <button class="pop-cta-btn g" style="width:100%;" onclick="telegramGetCode()"><i class="fa-solid fa-key"></i><span>Bağlantı Kodu Al</span></button>
      <div id="telegram-code-box" style="margin-top:12px;"></div>
    `;
  }
}

async function telegramGetCode() {
  const res = await fetch('/api/profile/telegram-code', { method: 'POST' });
  const data = await res.json();
  const box = document.getElementById('telegram-code-box');
  if (res.ok) {
    box.innerHTML = `
      <div style="text-align:center;padding:16px;background:var(--bg2);border-radius:var(--r);">
        <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Kodunuz (10 dakika geçerli)</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:26px;letter-spacing:.1em;color:var(--gold);font-weight:600;">${data.code}</div>
        <div style="font-size:11px;color:var(--t3);margin-top:8px;">Bota şunu gönderin: <code>/baglan ${data.code}</code></div>
      </div>
    `;
  } else {
    box.innerHTML = `<div style="color:var(--danger);font-size:12px;">${data.error || 'Kod alınamadı.'}</div>`;
  }
}

async function telegramSaveDailyTime() {
  const dailyTime = document.getElementById('telegram-daily-time').value;
  const res = await fetch('/api/profile/telegram-code', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dailyTime })
  });
  if (res.ok) {
    toast(dailyTime ? `Her gün ${dailyTime}'de otomatik gönderilecek` : 'Otomatik gönderim kapatıldı', 'fa-solid fa-check', true);
  } else {
    toast('Kaydedilemedi', 'fa-solid fa-triangle-exclamation');
  }
}

async function telegramDisconnect() {
  if (!confirm('Telegram bağlantınızı kaldırmak istediğinize emin misiniz?')) return;
  await fetch('/api/profile/telegram-code', { method: 'DELETE' });
  toast('Bağlantı kaldırıldı', 'fa-solid fa-check', true);
  telegramOnOpen();
}
