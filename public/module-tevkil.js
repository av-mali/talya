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
        <div class="fg"><div class="fl">İletişim Telefonu <span class="opt">(sadece kabul eden kişiye, kabul ettikten sonra gösterilir)</span></div><input type="text" id="tv-telefon" placeholder="05__ ___ __ __"></div>
        <button class="pop-cta-btn p" style="width:100%;" onclick="tevkilCreate()"><i class="fa-solid fa-paper-plane"></i><span>Talebi Yayınla</span></button>
      `,
      onOpen: () => tevkilOnOpen(),
      prompt: () => ''
    }
  }
};

let tevkilTab = 'acik'; // 'acik' | 'benim'

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

  try {
    const [statsRes, listRes] = await Promise.all([
      fetch('/api/tevkil/stats'),
      fetch(tevkilTab === 'acik' ? '/api/tevkil' : '/api/tevkil/mine'),
    ]);
    const stats = await statsRes.json();
    const listData = await listRes.json();
    const items = listData.talepler || [];

    pane.innerHTML = `
      <div style="padding:22px 24px;overflow-y:auto;height:100%;">
        <div style="display:flex;gap:10px;margin-bottom:16px;">
          <div style="flex:1;background:var(--bg2);border-radius:var(--r);padding:12px 14px;text-align:center;">
            <div style="font-size:20px;font-family:'JetBrains Mono',monospace;color:var(--purple);">${stats.talepSayisi ?? 0}</div>
            <div style="font-size:10.5px;color:var(--t3);">Talep Ettiğim</div>
          </div>
          <div style="flex:1;background:var(--bg2);border-radius:var(--r);padding:12px 14px;text-align:center;">
            <div style="font-size:20px;font-family:'JetBrains Mono',monospace;color:var(--purple);">${stats.kabulSayisi ?? 0}</div>
            <div style="font-size:10.5px;color:var(--t3);">Kabul Ettiğim</div>
          </div>
        </div>

        <div style="display:flex;gap:6px;margin-bottom:14px;">
          <button class="pop-cta-btn ${tevkilTab === 'acik' ? 'p' : ''}" style="width:auto;padding:6px 14px;${tevkilTab !== 'acik' ? 'background:var(--bg2);color:var(--t2);' : ''}" onclick="tevkilSwitchTab('acik')">Açık Talepler</button>
          <button class="pop-cta-btn ${tevkilTab === 'benim' ? 'p' : ''}" style="width:auto;padding:6px 14px;${tevkilTab !== 'benim' ? 'background:var(--bg2);color:var(--t2);' : ''}" onclick="tevkilSwitchTab('benim')">Taleplerim</button>
        </div>

        <div id="tevkil-list">${tevkilTab === 'acik' ? tevkilRenderAcikList(items) : tevkilRenderBenimList(items)}</div>
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

function tevkilRenderAcikList(items) {
  if (!items.length) return emptyState('fa-people-arrows', 'Açık talep yok', 'Şu an sistemde açık bir tevkil talebi bulunmuyor.');
  return items.map(t => `
    <div style="border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="font-size:13px;font-weight:600;">${t.sehir || ''}${t.mahkeme ? ' — ' + t.mahkeme : ''}</div>
        ${t.tarih ? `<div style="font-size:11px;color:var(--t3);white-space:nowrap;">${new Date(t.tarih).toLocaleDateString('tr-TR')} ${new Date(t.tarih).toTimeString().slice(0,5)}</div>` : ''}
      </div>
      ${t.durusmaTuru ? `<div style="font-size:12px;color:var(--t2);margin-top:4px;"><i class="fa-solid fa-gavel" style="width:14px;color:var(--t3);"></i> ${t.durusmaTuru}</div>` : ''}
      ${t.ucretTeklifi ? `<div style="font-size:12px;color:var(--t2);margin-top:2px;"><i class="fa-solid fa-turkish-lira-sign" style="width:14px;color:var(--t3);"></i> ${t.ucretTeklifi}</div>` : ''}
      ${t.aciklama ? `<div style="font-size:11.5px;color:var(--t3);margin-top:6px;">${t.aciklama}</div>` : ''}
      <div style="font-size:10.5px;color:var(--t3);margin-top:8px;">Talep eden: ${t.requester?.name || 'Bir avukat'}</div>
      <button class="pop-cta-btn p" style="width:100%;margin-top:10px;padding:8px;" onclick="tevkilAccept('${t.id}')"><i class="fa-solid fa-handshake"></i><span>Kabul Et</span></button>
    </div>
  `).join('');
}

function tevkilRenderBenimList(items) {
  if (!items.length) return emptyState('fa-people-arrows', 'Henüz talebiniz yok', 'Sol taraftan yeni bir tevkil talebi oluşturabilirsiniz.');
  return items.map(t => `
    <div style="border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="font-size:13px;font-weight:600;">${t.sehir || ''}${t.mahkeme ? ' — ' + t.mahkeme : ''}</div>
        <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${t.durum === 'kapali' ? 'var(--gold-lo)' : 'var(--bg2)'};color:${t.durum === 'kapali' ? 'var(--gold-hi)' : 'var(--t3)'};">${t.durum === 'kapali' ? 'Kapandı' : 'Açık'}</span>
      </div>
      ${t.tarih ? `<div style="font-size:11px;color:var(--t3);margin-top:4px;">${new Date(t.tarih).toLocaleDateString('tr-TR')} ${new Date(t.tarih).toTimeString().slice(0,5)}</div>` : ''}
      ${t.acceptedBy ? `
        <div style="background:var(--gold-lo);border-radius:var(--r);padding:10px 12px;margin-top:8px;">
          <div style="font-size:11.5px;color:var(--gold-hi);font-weight:600;"><i class="fa-solid fa-circle-check"></i> ${t.acceptedBy.name} kabul etti</div>
          <div style="font-size:11.5px;color:var(--t2);margin-top:4px;">${t.acceptedBy.phone ? '<i class="fa-solid fa-phone"></i> ' + t.acceptedBy.phone : ''}${t.acceptedBy.email ? '<br><i class="fa-solid fa-envelope"></i> ' + t.acceptedBy.email : ''}</div>
        </div>
      ` : `<span style="cursor:pointer;color:var(--danger);font-size:11px;display:inline-block;margin-top:8px;" onclick="tevkilDelete('${t.id}')"><i class="fa-solid fa-trash"></i> Talebi Kaldır</span>`}
    </div>
  `).join('');
}

async function tevkilAccept(id) {
  const ok = await talyaConfirm('Bu tevkil talebini kabul etmek istediğinize emin misiniz?<br><span style="font-size:12px;color:var(--t3);">Kabul ettikten sonra talep sahibinin iletişim bilgileri size görünecek.</span>', 'Evet, Kabul Et');
  if (!ok) return;
  const res = await fetch('/api/tevkil/' + id + '/accept', { method: 'POST' });
  const data = await res.json();
  if (res.ok) {
    toast('Talep kabul edildi', 'fa-solid fa-check', true);
    tevkilRenderPane();
  } else {
    toast(data.error || 'Kabul edilemedi', 'fa-solid fa-triangle-exclamation');
    tevkilRenderPane();
  }
}

async function tevkilDelete(id) {
  const ok = await talyaConfirm('Bu talebi kaldırmak istediğinize emin misiniz?', 'Evet, Kaldır', 'danger');
  if (!ok) return;
  await fetch('/api/tevkil/' + id, { method: 'DELETE' });
  toast('Talep kaldırıldı', 'fa-solid fa-trash');
  tevkilRenderPane();
}
