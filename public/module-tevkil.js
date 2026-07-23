// Bu dosya SADECE 'Tevkil' modülüne aittir — büro sınırı olmadan,
// sistemdeki tüm avukatlar arasında çalışan bir tevkil talep/kabul
// panosu.
window.CURRENT_MODULE = {
  key: 'tevkil',
  label: 'Tevkil Menüsü',
  nameHtml: `<em class="p">Tevkil Menüsü</em>`,
  color: 'p',
  items: [
    {"id": "tevkil", "icon": "fa-people-arrows", "name": "Tevkil Panosu"}
  ],
  popups: {
    tevkil: {
      badge: 'p', badgeText: 'Bürolar Arası', titleHtml: 'Tevkil <em class="p">Menüsü</em>',
      desc: 'Bir duruşmada sizi temsil edecek birine mi ihtiyacınız var? Ya da başka bir avukata yardımcı mı olmak istiyorsunuz?',
      btnClass: 'p', btnIco: 'fa-people-arrows', btnLbl: '', hideCta: true,
      body: `
        <div class="ic" style="margin-bottom:14px;">
          <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;">
            <span style="font-size:13px;font-weight:600;">Tevkil Alma Açık</span>
            <label class="nd-toggle"><input type="checkbox" id="tevkil-alma-toggle" onchange="tevkilToggleAlma()"><span class="nd-slider"></span></label>
          </label>
          <p style="font-size:11px;color:var(--t3);margin-top:4px;">Açarsan, sistemdeki HERKESİN (kendi büronla sınırlı değil) yeni tevkil taleplerinden bildirim alırsın.</p>
        </div>

        <div class="ic" style="margin-bottom:14px;">
          <div class="ic-t"><i class="fa-solid fa-plus"></i> Yeni Tevkil Talebi</div>
        </div>
        <div class="fg"><div class="fl">Şehir</div><input type="text" id="tv-sehir" placeholder="ör. Ankara"></div>
        <div class="fg"><div class="fl">Mahkeme <span class="opt">(opsiyonel)</span></div><input type="text" id="tv-mahkeme" placeholder="ör. Ankara 3. Asliye Hukuk Mahkemesi"></div>
        <div style="display:flex;gap:6px;">
          <div class="fg" style="flex:1;"><div class="fl">Tarih</div><input type="date" id="tv-tarih"></div>
          <div class="fg" style="flex:1;"><div class="fl">Saat</div><input type="time" id="tv-saat" value="09:00"></div>
        </div>
        <div class="fg"><div class="fl">Dosya/Duruşma Türü</div><input type="text" id="tv-tur" placeholder="ör. Tanık Dinleme, Ön İnceleme…"></div>
        <div class="fg"><div class="fl">Ücret Teklifi</div><input type="text" id="tv-ucret" placeholder="ör. 2.000 TL, pazarlık edilebilir…"></div>
        <div class="fg"><div class="fl">Açıklama</div><textarea id="tv-aciklama" rows="3" placeholder="Ek bilgi…"></textarea></div>
        <div class="fg"><div class="fl">İletişim Telefonu <span class="opt">(sadece onayladığınız kişiye, onayladıktan sonra gösterilir)</span></div><input type="text" id="tv-telefon" placeholder="05__ ___ __ __"></div>
        <button class="pop-cta-btn p" style="width:100%;" onclick="tevkilCreate()"><i class="fa-solid fa-paper-plane"></i><span>Talebi Yayınla</span></button>
      `,
      onOpen: () => tevkilOnOpen(),
      prompt: () => ''
    }
  }
};

let tevkilTab = 'acik'; // 'acik' | 'benim' | 'basvurularim' | 'iptaller'

async function tevkilOnOpen() {
  try {
    const res = await fetch('/api/profile');
    const data = await res.json();
    const cb = document.getElementById('tevkil-alma-toggle');
    if (cb) cb.checked = !!(data.user && data.user.tevkilAlmaAcik);
  } catch (e) { /* sessiz geç */ }

  tevkilTab = 'acik';
  tevkilRenderPane();
}

async function tevkilToggleAlma() {
  const checked = document.getElementById('tevkil-alma-toggle').checked;
  await fetch('/api/profile', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tevkilAlmaAcik: checked })
  });
  toast(checked ? 'Tevkil bildirimleri açıldı' : 'Tevkil bildirimleri kapatıldı', 'fa-solid fa-check', true);
}

async function tevkilCreate() {
  const sehir = document.getElementById('tv-sehir').value.trim();
  if (!sehir) { toast('Şehir bilgisi gerekli', 'fa-solid fa-triangle-exclamation'); return; }
  const tarihRaw = document.getElementById('tv-tarih').value;
  const saat = document.getElementById('tv-saat').value || '09:00';

  const body = {
    sehir,
    mahkeme: document.getElementById('tv-mahkeme').value,
    tarih: tarihRaw ? localDateTimeToISO(tarihRaw, saat) : null,
    durusmaTuru: document.getElementById('tv-tur').value,
    ucretTeklifi: document.getElementById('tv-ucret').value,
    aciklama: document.getElementById('tv-aciklama').value,
    telefon: document.getElementById('tv-telefon').value,
  };

  const res = await fetch('/api/tevkil', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    toast('Talep yayınlandı', 'fa-solid fa-check', true);
    ['tv-sehir','tv-mahkeme','tv-tur','tv-ucret','tv-aciklama','tv-telefon'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('tv-tarih').value = '';
    tevkilTab = 'benim';
    tevkilRenderPane();
  } else {
    const data = await res.json();
    toast(data.error || 'Talep oluşturulamadı', 'fa-solid fa-triangle-exclamation');
  }
}

async function tevkilRenderPane() {
  const pane = document.getElementById('detailPane') || document.getElementById('chatMsgs');
  if (!pane) return;
  pane.innerHTML = `<div style="padding:22px 24px;">${skeletonRows(3)}</div>`;

  const urls = {
    acik: '/api/tevkil',
    benim: '/api/tevkil/mine',
    basvurularim: '/api/tevkil/basvurularim',
    iptaller: '/api/tevkil/iptal-edilenler',
  };

  try {
    const [statsRes, listRes] = await Promise.all([
      fetch('/api/tevkil/stats'),
      fetch(urls[tevkilTab]),
    ]);
    const stats = await statsRes.json();
    const listData = await listRes.json();
    const items = listData.talepler || listData.basvurular || [];

    const tabBtn = (key, label) => `<button class="pop-cta-btn ${tevkilTab === key ? 'p' : ''}" style="width:auto;padding:6px 12px;font-size:12px;${tevkilTab !== key ? 'background:var(--bg2);color:var(--t2);' : ''}" onclick="tevkilSwitchTab('${key}')">${label}</button>`;

    pane.innerHTML = `
      <div style="padding:22px 24px;overflow-y:auto;height:100%;">
        <div style="display:flex;gap:10px;margin-bottom:16px;">
          <div style="flex:1;background:var(--bg2);border-radius:var(--r);padding:12px 14px;text-align:center;">
            <div style="font-size:20px;font-family:'JetBrains Mono',monospace;color:var(--purple);">${stats.talepSayisi ?? 0}</div>
            <div style="font-size:10.5px;color:var(--t3);">Talep Ettiğim</div>
          </div>
          <div style="flex:1;background:var(--bg2);border-radius:var(--r);padding:12px 14px;text-align:center;">
            <div style="font-size:20px;font-family:'JetBrains Mono',monospace;color:var(--purple);">${stats.kabulSayisi ?? 0}</div>
            <div style="font-size:10.5px;color:var(--t3);">Onaylandığım</div>
          </div>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">
          ${tabBtn('acik', 'Açık Talepler')}
          ${tabBtn('benim', 'Taleplerim')}
          ${tabBtn('basvurularim', 'Başvurularım')}
          ${tabBtn('iptaller', 'İptal Edilenler')}
        </div>

        <div id="tevkil-list">${tevkilRenderList(items)}</div>
      </div>
    `;
  } catch (e) {
    pane.innerHTML = `<div style="padding:22px 24px;color:var(--danger);font-size:12px;">Yüklenemedi.</div>`;
  }
}

function tevkilSwitchTab(tab) {
  tevkilTab = tab;
  tevkilRenderPane();
}

function tevkilRenderList(items) {
  if (tevkilTab === 'acik') return tevkilRenderAcikList(items);
  if (tevkilTab === 'benim') return tevkilRenderBenimList(items);
  if (tevkilTab === 'basvurularim') return tevkilRenderBasvurularimList(items);
  return tevkilRenderIptallerList(items);
}

// ── AÇIK TALEPLER (herkese görünen pano) ──
function tevkilRenderAcikList(items) {
  if (!items.length) return emptyState('fa-people-arrows', 'Açık talep yok', 'Şu an sistemde açık bir tevkil talebi bulunmuyor.');
  return items.map(t => {
    const basvurdum = t.benimBasvurum;
    return `
    <div style="border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="font-size:13px;font-weight:600;">${t.sehir || ''}${t.mahkeme ? ' — ' + t.mahkeme : ''}</div>
        ${t.tarih ? `<div style="font-size:11px;color:var(--t3);white-space:nowrap;">${new Date(t.tarih).toLocaleDateString('tr-TR')} ${new Date(t.tarih).toTimeString().slice(0,5)}</div>` : ''}
      </div>
      ${t.durusmaTuru ? `<div style="font-size:12px;color:var(--t2);margin-top:4px;"><i class="fa-solid fa-gavel" style="width:14px;color:var(--t3);"></i> ${t.durusmaTuru}</div>` : ''}
      ${t.ucretTeklifi ? `<div style="font-size:12px;color:var(--t2);margin-top:2px;"><i class="fa-solid fa-turkish-lira-sign" style="width:14px;color:var(--t3);"></i> ${t.ucretTeklifi}</div>` : ''}
      ${t.aciklama ? `<div style="font-size:11.5px;color:var(--t3);margin-top:6px;">${t.aciklama}</div>` : ''}
      <div style="font-size:10.5px;color:var(--t3);margin-top:8px;">Talep eden: ${t.requester?.name || 'Bir avukat'}</div>
      ${basvurdum
        ? `<div style="margin-top:10px;padding:8px;border-radius:var(--r);background:var(--bg2);text-align:center;font-size:12px;color:var(--t2);"><i class="fa-solid fa-clock"></i> Başvurdunuz — onay bekleniyor</div>`
        : `<button class="pop-cta-btn p" style="width:100%;margin-top:10px;padding:8px;" onclick="tevkilBasvur('${t.id}')"><i class="fa-solid fa-hand"></i><span>Başvur</span></button>`
      }
    </div>
  `;
  }).join('');
}

async function tevkilBasvur(id) {
  const res = await fetch('/api/tevkil/' + id + '/basvur', { method: 'POST' });
  const data = await res.json();
  if (res.ok) {
    toast('Başvurunuz iletildi', 'fa-solid fa-check', true);
    tevkilRenderPane();
  } else {
    toast(data.error || 'Başvurulamadı', 'fa-solid fa-triangle-exclamation');
  }
}

// ── TALEPLERİM (talep sahibi olarak) ──
function tevkilRenderBenimList(items) {
  if (!items.length) return emptyState('fa-people-arrows', 'Henüz talebiniz yok', 'Sol taraftan yeni bir tevkil talebi oluşturabilirsiniz.');
  return items.map(t => `
    <div style="border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="font-size:13px;font-weight:600;">${t.sehir || ''}${t.mahkeme ? ' — ' + t.mahkeme : ''}</div>
        <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${t.durum === 'onaylandi' ? 'var(--gold-lo)' : 'var(--bg2)'};color:${t.durum === 'onaylandi' ? 'var(--gold-hi)' : 'var(--t3)'};">${t.durum === 'onaylandi' ? 'Onaylandı' : 'Açık'}</span>
      </div>
      ${t.tarih ? `<div style="font-size:11px;color:var(--t3);margin-top:4px;">${new Date(t.tarih).toLocaleDateString('tr-TR')} ${new Date(t.tarih).toTimeString().slice(0,5)}</div>` : ''}
      ${t.acceptedBy ? `
        <div style="background:var(--gold-lo);border-radius:var(--r);padding:10px 12px;margin-top:8px;">
          <div style="font-size:11.5px;color:var(--gold-hi);font-weight:600;"><i class="fa-solid fa-circle-check"></i> ${t.acceptedBy.name} onaylandı</div>
          <div style="font-size:11.5px;color:var(--t2);margin-top:4px;">${t.acceptedBy.phone ? '<i class="fa-solid fa-phone"></i> ' + t.acceptedBy.phone : ''}${t.acceptedBy.email ? '<br><i class="fa-solid fa-envelope"></i> ' + t.acceptedBy.email : ''}</div>
        </div>
      ` : `
        <div style="margin-top:8px;">
          <div style="font-size:11px;color:var(--t3);margin-bottom:6px;">${t.bekleyenBasvuruSayisi || 0} başvuru bekliyor</div>
          ${t.bekleyenBasvuruSayisi > 0 ? `<button class="pop-cta-btn b" style="width:100%;padding:7px;" onclick="tevkilShowBasvurular('${t.id}')"><i class="fa-solid fa-users"></i><span>Başvuranları Gör</span></button>` : ''}
          <span style="cursor:pointer;color:var(--danger);font-size:11px;display:inline-block;margin-top:8px;" onclick="tevkilDelete('${t.id}')"><i class="fa-solid fa-trash"></i> Talebi Kaldır</span>
        </div>
      `}
    </div>
  `).join('');
}

async function tevkilShowBasvurular(talepId) {
  const res = await fetch('/api/tevkil/' + talepId + '/basvurular');
  const data = await res.json();
  const basvurular = data.basvurular || [];
  openTalyaModal(`
    <div class="ic" style="margin-bottom:14px;"><div class="ic-t"><i class="fa-solid fa-users"></i> Başvuranlar</div>
      <p>Birini onayla — diğer başvurular otomatik reddedilir.</p>
    </div>
    ${basvurular.length ? basvurular.map(b => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
        <div>
          <div style="font-size:13px;font-weight:600;">${b.applicant.name || 'İsimsiz'}</div>
          ${b.applicant.baro ? `<div style="font-size:11px;color:var(--t3);">${b.applicant.baro} Barosu</div>` : ''}
        </div>
        ${b.durum === 'bekliyor'
          ? `<button class="pop-cta-btn g" style="width:auto;padding:6px 12px;" onclick="tevkilOnayla('${b.id}', '${talepId}')">Onayla</button>`
          : `<span style="font-size:11px;color:var(--t3);">${b.durum === 'onaylandi' ? 'Onaylandı' : 'Reddedildi'}</span>`
        }
      </div>
    `).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz başvuru yok.</div>'}
    <button class="pop-cta-btn" style="width:100%;margin-top:14px;background:var(--bg2);color:var(--t2);" onclick="closeTalyaModal()">Kapat</button>
  `);
}

async function tevkilOnayla(basvuruId, talepId) {
  const ok = await talyaConfirm('Bu kişiyi onaylamak istediğinize emin misiniz?<br><span style="font-size:12px;color:var(--t3);">Diğer başvurular otomatik reddedilecek.</span>', 'Evet, Onayla');
  if (!ok) return;
  const res = await fetch('/api/tevkil/basvuru/' + basvuruId + '/onayla', { method: 'POST' });
  const data = await res.json();
  if (res.ok) {
    toast('Onaylandı', 'fa-solid fa-check', true);
    closeTalyaModal();
    tevkilRenderPane();
  } else {
    toast(data.error || 'Onaylanamadı', 'fa-solid fa-triangle-exclamation');
  }
}

async function tevkilDelete(id) {
  const ok = await talyaConfirm('Bu talebi kaldırmak istediğinize emin misiniz?', 'Evet, Kaldır', 'danger');
  if (!ok) return;
  await fetch('/api/tevkil/' + id, { method: 'DELETE' });
  toast('Talep kaldırıldı', 'fa-solid fa-trash');
  tevkilRenderPane();
}

// ── BAŞVURULARIM (başvurucu olarak) ──
function tevkilRenderBasvurularimList(items) {
  if (!items.length) return emptyState('fa-hand', 'Henüz başvurunuz yok', '"Açık Talepler" sekmesinden bir tevkile başvurabilirsiniz.');
  return items.map(b => {
    const t = b.talep;
    const durumEtiket = { bekliyor: 'Onay Bekliyor', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi' }[b.durum] || b.durum;
    const durumRenk = b.durum === 'onaylandi' ? 'var(--success)' : b.durum === 'reddedildi' ? 'var(--danger)' : 'var(--warn)';
    return `
    <div style="border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="font-size:13px;font-weight:600;">${t.sehir || ''}${t.mahkeme ? ' — ' + t.mahkeme : ''}</div>
        <span style="font-size:10.5px;color:${durumRenk};font-weight:600;">${durumEtiket}</span>
      </div>
      ${t.tarih ? `<div style="font-size:11px;color:var(--t3);margin-top:4px;">${new Date(t.tarih).toLocaleDateString('tr-TR')} ${new Date(t.tarih).toTimeString().slice(0,5)}</div>` : ''}
      ${b.durum === 'onaylandi' ? `
        <div style="background:var(--gold-lo);border-radius:var(--r);padding:10px 12px;margin-top:8px;">
          <div style="font-size:11.5px;color:var(--gold-hi);font-weight:600;">Talep Sahibi: ${t.requester.name}</div>
          <div style="font-size:11.5px;color:var(--t2);margin-top:4px;">${t.requester.phone ? '<i class="fa-solid fa-phone"></i> ' + t.requester.phone : ''}${t.requester.email ? '<br><i class="fa-solid fa-envelope"></i> ' + t.requester.email : ''}</div>
        </div>
        <button class="pop-cta-btn" style="width:100%;margin-top:8px;padding:7px;background:var(--danger);color:#fff;" onclick="tevkilVazgec('${t.id}')"><i class="fa-solid fa-xmark"></i><span>Vazgeç</span></button>
      ` : ''}
    </div>
  `;
  }).join('');
}

async function tevkilVazgec(talepId) {
  const ok = await talyaConfirm('Bu tevkilden vazgeçmek istediğinize emin misiniz?<br><span style="font-size:12px;color:var(--t3);">Talep sahibine bildirilecek ve talep yeniden açılacak.</span>', 'Evet, Vazgeç', 'danger');
  if (!ok) return;
  const res = await fetch('/api/tevkil/' + talepId + '/iptal', { method: 'POST' });
  const data = await res.json();
  if (res.ok) {
    toast('Vazgeçildi, talep sahibine bildirildi', 'fa-solid fa-check', true);
    tevkilRenderPane();
  } else {
    toast(data.error || 'İşlem yapılamadı', 'fa-solid fa-triangle-exclamation');
  }
}

// ── İPTAL EDİLENLER (geçmiş) ──
function tevkilRenderIptallerList(items) {
  if (!items.length) return emptyState('fa-clock-rotate-left', 'İptal geçmişi yok', 'Vazgeçilen tevkiller burada listelenir.');
  return items.map(b => `
    <div style="border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:10px;opacity:.75;">
      <div style="font-size:13px;font-weight:600;">${b.talep.sehir || ''}${b.talep.mahkeme ? ' — ' + b.talep.mahkeme : ''}</div>
      <div style="font-size:11.5px;color:var(--t3);margin-top:4px;">${b.applicant.name} — ${b.talep.requester.name} için onaylanmıştı, vazgeçildi.</div>
      <div style="font-size:10.5px;color:var(--t3);margin-top:4px;">${new Date(b.updatedAt).toLocaleDateString('tr-TR')}</div>
    </div>
  `).join('');
}
