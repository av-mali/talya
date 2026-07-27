// Bu dosya SADECE 'Arabuluculuk' modülüne aittir — Davet Mektubu,
// İlk Oturum Tutanağı ve Son Tutanak (Anlaşma/Anlaşamama) belgelerini
// UYAP formatına sadık şekilde üretir. Bu modülü düzenlemek diğer
// modülleri (belge, buro, uyap, hesap, uyelik) etkilemez.
window.CURRENT_MODULE = {
  key: 'arabuluculuk',
  label: 'Arabuluculuk',
  nameHtml: `<em class="g">Arabuluculuk</em>`,
  color: 't',
  items: [
    {"id": "arabuluculuk", "icon": "fa-handshake", "name": "Dosyalarım"}
  ],
  popups: {
    arabuluculuk: {
      badge: 'g', badgeText: 'Arabuluculuk Belgeleri', titleHtml: '<em class="g">Arabuluculuk</em>',
      desc: 'Davet mektubu, ilk oturum ve son tutanağı otomatik oluşturun.',
      btnClass: 'g', btnIco: 'fa-handshake', btnLbl: '', hideCta: true, hideChatInput: true,
      body: `
        <div class="ic" style="margin-bottom:14px;">
          <div class="ic-t"><i class="fa-solid fa-wand-magic-sparkles"></i> Yeni Dosya — Başvuru Evrakından Doldur</div>
          <p>Başvuru evrakını yükleyin, AI taraf bilgilerini bulup formu doldursun. Kaydetmeden önce kontrol edin.</p>
          <input type="file" id="ar-autofile" accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.txt,.udf" style="margin-top:8px;width:100%;">
          <button class="pop-cta-btn g" style="width:100%;margin-top:8px;" onclick="arAutoFillFromFile()"><i class="fa-solid fa-file-import"></i><span>Belgeden Doldur</span></button>
          <div id="ar-autofill-status" style="font-size:11px;color:var(--t3);margin-top:6px;"></div>
        </div>

        <div class="fg"><div class="fl">Dosya Numarası <span class="opt">(Arabuluculuk Bilgi Sistemi)</span></div><input type="text" id="ar-dosyano" placeholder="2026/1329"></div>
        <div class="fg"><div class="fl">Büro Dosya Numarası <span class="opt">(iç takip için, opsiyonel)</span></div><input type="text" id="ar-buro-dosyano" placeholder="ör. 2026/45"></div>

        <div class="fg"><div class="fl">Başvurucu Türü</div>
          <div style="display:flex;gap:6px;">
            <button type="button" id="ar-bas-tip-sahis" class="pop-cta-btn g" style="width:auto;flex:1;padding:7px;" onclick="arSetBasvurucuTip('sahis')"><span>Şahıs</span></button>
            <button type="button" id="ar-bas-tip-tuzel" class="pop-cta-btn" style="width:auto;flex:1;padding:7px;background:var(--bg2);color:var(--t2);" onclick="arSetBasvurucuTip('tuzel')"><span>Tüzel Kişilik</span></button>
          </div>
        </div>
        <div id="ar-bas-sahis-alanlari">
          <div class="fg"><div class="fl">Ad Soyad</div><input type="text" id="ar-bas-ad" placeholder="Ad Soyad"></div>
          <div class="fg"><div class="fl">TC Kimlik No</div><input type="text" id="ar-bas-tc" placeholder="11 haneli TC kimlik no"></div>
        </div>
        <div id="ar-bas-tuzel-alanlari" style="display:none;">
          <div class="fg"><div class="fl">Unvan</div><input type="text" id="ar-bas-unvan" placeholder="… Ltd. Şti. / A.Ş."></div>
          <div class="fg"><div class="fl">Vergi/Mersis No</div><input type="text" id="ar-bas-vergimersis"></div>
          <div class="fg"><div class="fl">Şirket Yetkilisi</div><input type="text" id="ar-bas-yetkili"></div>
        </div>
        <div class="fg"><div class="fl">Başvurucu Adresi</div><input type="text" id="ar-bas-adres"></div>
        <div class="fg"><div class="fl">Başvurucu Vekili <span class="opt">(varsa)</span></div><input type="text" id="ar-bas-vekil" placeholder="Av. ..."></div>
        <div class="fg"><div class="fl">Vekil Baro/Sicil</div><input type="text" id="ar-bas-barosicil"></div>
        <div class="fg"><div class="fl">Başvurucu Telefon</div><input type="text" id="ar-bas-tel"></div>

        <div class="fg"><div class="fl">Karşı Taraf(lar) <span class="opt">(birden fazla eklenebilir)</span></div></div>
        <div id="ar-karsi-list"></div>
        <button class="pop-cta-btn b" style="width:100%;margin-bottom:14px;" onclick="arAddKarsiRow()" type="button"><i class="fa-solid fa-plus"></i><span>Karşı Taraf Ekle</span></button>

        <div class="fg"><div class="fl">Uyuşmazlık Türü</div>
          <div class="sw">
            <select id="ar-uyusmazlik-tur" onchange="document.getElementById('ar-uyusmazlik-tur-diger').style.display = this.value === 'Diğer' ? '' : 'none'">
              <option value="İş Hukuku">İş Hukuku</option>
              <option value="Ticaret Hukuku">Ticaret Hukuku</option>
              <option value="Tüketici Hukuku">Tüketici Hukuku</option>
              <option value="Kira Hukuku">Kira Hukuku</option>
              <option value="Ortaklığın Giderilmesi">Ortaklığın Giderilmesi</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
          <input type="text" id="ar-uyusmazlik-tur-diger" placeholder="Uyuşmazlık türünü yazın…" style="display:none;margin-top:6px;">
        </div>
        <div class="fg"><div class="fl">Uyuşmazlık Konusu</div><textarea id="ar-uyusmazlik" rows="3" placeholder="Kısa açıklama, madde madde olabilir…"></textarea></div>
        <div class="fg"><div class="fl">Başvuru Tarihi</div><input type="text" id="ar-basvuru-tarih" placeholder="12.03.2026"></div>
        <div class="fg"><div class="fl">Görevlendirme Tarihi</div><input type="text" id="ar-gorev-tarih" placeholder="12.03.2026"></div>

        <button class="pop-cta-btn g" id="ar-save-btn" style="width:100%;" onclick="arSaveCase()"><i class="fa-solid fa-floppy-disk"></i><span>Dosyayı Kaydet</span></button>
      `,
      onOpen: () => arOnOpen(),
      prompt: () => ''
    },
  }
};


// ══════════════════════════════════════════════════════
// ARABULUCULUK — Davet Mektubu / İlk Oturum / Son Tutanak
// ══════════════════════════════════════════════════════
let arCasesCache = [];
let arSelectedCaseId = null;
let arKarsiTarafRows = []; // form üzerindeki karşı taraf satırlarının verisi

let arBasvurucuTip = 'sahis';
function arSetBasvurucuTip(tip) {
  arBasvurucuTip = tip;
  document.getElementById('ar-bas-sahis-alanlari').style.display = tip === 'sahis' ? '' : 'none';
  document.getElementById('ar-bas-tuzel-alanlari').style.display = tip === 'tuzel' ? '' : 'none';
  const sahisBtn = document.getElementById('ar-bas-tip-sahis');
  const tuzelBtn = document.getElementById('ar-bas-tip-tuzel');
  if (sahisBtn) { sahisBtn.className = 'pop-cta-btn ' + (tip === 'sahis' ? 'g' : ''); sahisBtn.style.background = tip === 'sahis' ? '' : 'var(--bg2)'; sahisBtn.style.color = tip === 'sahis' ? '' : 'var(--t2)'; }
  if (tuzelBtn) { tuzelBtn.className = 'pop-cta-btn ' + (tip === 'tuzel' ? 'g' : ''); tuzelBtn.style.background = tip === 'tuzel' ? '' : 'var(--bg2)'; tuzelBtn.style.color = tip === 'tuzel' ? '' : 'var(--t2)'; }
}

function arRenderKarsiRows() {
  const box = document.getElementById('ar-karsi-list');
  if (!box) return;
  box.innerHTML = arKarsiTarafRows.map((row, i) => {
    const tip = row.tip || 'sahis';
    return `
    <div style="background:var(--bg2);border-radius:var(--r);padding:10px;margin-bottom:8px;position:relative;">
      ${arKarsiTarafRows.length > 1 ? `<span style="position:absolute;top:8px;right:8px;cursor:pointer;color:var(--t3);" onclick="arRemoveKarsiRow(${i})"><i class="fa-solid fa-xmark"></i></span>` : ''}
      <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Karşı Taraf ${arKarsiTarafRows.length > 1 ? (i + 1) : ''}</div>
      <div style="display:flex;gap:6px;margin-bottom:6px;">
        <button type="button" onclick="arSetKarsiTip(${i},'sahis')" style="flex:1;padding:6px;border:none;border-radius:6px;cursor:pointer;font-size:11.5px;font-weight:600;background:${tip === 'sahis' ? 'var(--gold)' : 'var(--card)'};color:${tip === 'sahis' ? '#fff' : 'var(--t2)'};">Şahıs</button>
        <button type="button" onclick="arSetKarsiTip(${i},'tuzel')" style="flex:1;padding:6px;border:none;border-radius:6px;cursor:pointer;font-size:11.5px;font-weight:600;background:${tip === 'tuzel' ? 'var(--gold)' : 'var(--card)'};color:${tip === 'tuzel' ? '#fff' : 'var(--t2)'};">Tüzel Kişilik</button>
      </div>
      ${tip === 'sahis' ? `
        <div class="fg" style="margin-bottom:6px;"><input type="text" placeholder="Ad Soyad" value="${(row.ad||'').replace(/"/g,'&quot;')}" oninput="arKarsiTarafRows[${i}].ad=this.value"></div>
        <div class="fg" style="margin-bottom:6px;"><input type="text" placeholder="TC Kimlik No" value="${(row.tcKimlik||'').replace(/"/g,'&quot;')}" oninput="arKarsiTarafRows[${i}].tcKimlik=this.value"></div>
      ` : `
        <div class="fg" style="margin-bottom:6px;"><input type="text" placeholder="Unvan" value="${(row.ad||'').replace(/"/g,'&quot;')}" oninput="arKarsiTarafRows[${i}].ad=this.value"></div>
        <div style="display:flex;gap:6px;margin-bottom:6px;">
          <input type="text" placeholder="Vergi/Mersis No" value="${(row.vergiMersis||'').replace(/"/g,'&quot;')}" oninput="arKarsiTarafRows[${i}].vergiMersis=this.value" style="flex:1;">
          <input type="text" placeholder="Şirket Yetkilisi" value="${(row.yetkiliAd||'').replace(/"/g,'&quot;')}" oninput="arKarsiTarafRows[${i}].yetkiliAd=this.value" style="flex:1;">
        </div>
      `}
      <div class="fg" style="margin-bottom:6px;"><input type="text" placeholder="Adres" value="${(row.adres||'').replace(/"/g,'&quot;')}" oninput="arKarsiTarafRows[${i}].adres=this.value"></div>
      <div style="display:flex;gap:6px;margin-bottom:6px;">
        <input type="text" placeholder="Vekili (varsa)" value="${(row.vekilAd||'').replace(/"/g,'&quot;')}" oninput="arKarsiTarafRows[${i}].vekilAd=this.value" style="flex:1;">
        <input type="text" placeholder="Vekil Baro/Sicil" value="${(row.vekilBaroSicil||'').replace(/"/g,'&quot;')}" oninput="arKarsiTarafRows[${i}].vekilBaroSicil=this.value" style="flex:1;">
      </div>
      <div class="fg"><input type="text" placeholder="Telefon" value="${(row.telefon||'').replace(/"/g,'&quot;')}" oninput="arKarsiTarafRows[${i}].telefon=this.value"></div>
    </div>
  `;
  }).join('');
}

function arSetKarsiTip(index, tip) {
  arKarsiTarafRows[index].tip = tip;
  arRenderKarsiRows();
}

function arAddKarsiRow() {
  arKarsiTarafRows.push({ tip: 'sahis', ad: '', tcKimlik: '', adres: '', vergiMersis: '', yetkiliAd: '', vekilAd: '', vekilBaroSicil: '', telefon: '' });
  arRenderKarsiRows();
}

function arRemoveKarsiRow(index) {
  arKarsiTarafRows.splice(index, 1);
  arRenderKarsiRows();
}

function arGetPane() {
  const empty = document.getElementById('chatEmpty');
  if (empty) empty.style.display = 'none';
  return document.getElementById('chatMsgs');
}

async function arOnOpen() {
  arKarsiTarafRows = [{ tip: 'sahis', ad: '', tcKimlik: '', adres: '', vergiMersis: '', yetkiliAd: '', vekilAd: '', vekilBaroSicil: '', telefon: '' }];
  arBasvurucuTip = 'sahis';
  arRenderKarsiRows();
  arGetPane().innerHTML = skeletonLines(3);
  await arLoadCases();
}

async function arLoadCases() {
  try {
    const res = await fetch('/api/mediation/cases');
    const data = await res.json();
    arCasesCache = data.cases || [];
    arRenderCaseList();
  } catch (e) {
    arGetPane().innerHTML = `<div style="padding:20px;color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

let arKapaliYilAcik = null; // kapalı dosyalar arasında hangi yıl grubunun açık olduğu (tek seferde bir tane)

function arGetYear(dosyaNo) {
  if (!dosyaNo) return 'Diğer';
  const m = String(dosyaNo).match(/^(\d{4})/);
  return m ? m[1] : 'Diğer';
}

function arCaseCardHtml(c) {
  const idx = arCasesCache.indexOf(c);
  return `
    <div class="kanban-card" draggable="true"
         ondragstart="event.dataTransfer.setData('text/plain','${c.id}')"
         onclick="arSelectCase(${idx})"
         style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;cursor:grab;">
      <div style="font-size:12.5px;">${c.dosyaNo || 'Dosya No yok'}${c.buroDosyaNo ? ` <span style="color:var(--t3);font-weight:400;">(${c.buroDosyaNo})</span>` : ''}</div>
      <div style="font-size:10.5px;color:var(--t3);margin-top:2px;">${c.basvurucuAd || '?'} / ${c.uyusmazlikTuru || '?'}</div>
    </div>
  `;
}

function arRenderCaseList() {
  const pane = arGetPane();

  if (!arCasesCache.length) {
    pane.innerHTML = `
      <div style="padding:20px 24px;overflow-y:auto;height:100%;box-sizing:border-box;">
        ${emptyState('fa-handshake', 'Henüz dosya yok', 'Soldaki formdan bir başvuru evrakı yükleyip veya elle doldurup ilk dosyanızı oluşturun.')}
      </div>
    `;
    return;
  }

  const acikDosyalar = arCasesCache.filter(c => (c.durum || 'acik') === 'acik');
  const kapaliDosyalar = arCasesCache.filter(c => c.durum === 'kapali');

  // Kapalı dosyaları, dosya numarasının başındaki yıla göre grupluyoruz
  // (ör. "2026/1329" -> 2026 grubu). Yeni yıl üstte olacak şekilde sıralı.
  const yilGruplari = {};
  kapaliDosyalar.forEach(c => {
    const yil = arGetYear(c.dosyaNo);
    (yilGruplari[yil] = yilGruplari[yil] || []).push(c);
  });
  const yillar = Object.keys(yilGruplari).sort((a, b) => b.localeCompare(a));

  pane.innerHTML = `
    <div style="padding:20px 24px;overflow-x:auto;height:100%;box-sizing:border-box;">
      <div style="display:flex;gap:14px;height:100%;min-width:600px;">
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;"
             ondragover="event.preventDefault()" ondrop="arDropOnColumn(event, 'acik')">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="width:8px;height:8px;border-radius:50%;background:var(--success);"></span>
            <span style="font-size:12px;font-weight:600;">Açık Dosyalar</span>
            <span style="font-size:11px;color:var(--t3);">(${acikDosyalar.length})</span>
          </div>
          <div style="background:var(--bg2);border-radius:var(--r);padding:8px;flex:1;min-height:200px;overflow-y:auto;">
            ${acikDosyalar.length ? acikDosyalar.map(arCaseCardHtml).join('') : `<div style="font-size:11.5px;color:var(--t3);text-align:center;padding:20px 8px;">Boş</div>`}
          </div>
        </div>

        <div style="flex:1;min-width:0;display:flex;flex-direction:column;"
             ondragover="event.preventDefault()" ondrop="arDropOnColumn(event, 'kapali')">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="width:8px;height:8px;border-radius:50%;background:var(--t3);"></span>
            <span style="font-size:12px;font-weight:600;">Kapalı Dosyalar</span>
            <span style="font-size:11px;color:var(--t3);">(${kapaliDosyalar.length})</span>
          </div>
          <div style="background:var(--bg2);border-radius:var(--r);padding:8px;flex:1;min-height:200px;overflow-y:auto;">
            ${yillar.length ? yillar.map(yil => `
              <div style="margin-bottom:6px;">
                <div style="font-weight:600;cursor:pointer;padding:8px 10px;display:flex;align-items:center;gap:8px;background:var(--card);border-radius:var(--r);" onclick="arToggleYilGrup('${yil}')">
                  <i class="fa-solid ${arKapaliYilAcik === yil ? 'fa-chevron-down' : 'fa-chevron-right'}" style="font-size:10px;"></i>
                  <span style="font-size:12px;">${yil}</span>
                  <span style="font-size:10.5px;color:var(--t3);margin-left:auto;">(${yilGruplari[yil].length})</span>
                </div>
                ${arKapaliYilAcik === yil ? `<div style="padding:8px 4px 0;">${yilGruplari[yil].map(arCaseCardHtml).join('')}</div>` : ''}
              </div>
            `).join('') : `<div style="font-size:11.5px;color:var(--t3);text-align:center;padding:20px 8px;">Boş</div>`}
          </div>
        </div>
      </div>
    </div>
  `;
}

function arToggleYilGrup(yil) {
  arKapaliYilAcik = (arKapaliYilAcik === yil) ? null : yil;
  arRenderCaseList();
}

function arDropOnColumn(event, durum) {
  event.preventDefault();
  const id = event.dataTransfer.getData('text/plain');
  if (id) arMoveDurum(id, durum);
}

async function arMoveDurum(id, durum) {
  await fetch('/api/mediation/cases/' + id, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ durum })
  });
  const c = arCasesCache.find(x => x.id === id);
  if (c) c.durum = durum;
  toast(durum === 'kapali' ? 'Dosya kapalı dosyalara taşındı' : 'Dosya açık dosyalara taşındı', 'fa-solid fa-check', true);
  arRenderCaseList();
}

async function arSelectCase(index) {
  const c = arCasesCache[index];
  if (!c) return;
  arSelectedCaseId = c.id;
  const karsiOzet = (c.karsiTaraflar || []).map(p => p.ad).filter(Boolean).join(', ') || '?';
  const pane = arGetPane();
  pane.innerHTML = `
    <div style="padding:20px 24px;overflow-y:auto;height:100%;box-sizing:border-box;">
      <div style="cursor:pointer;color:var(--t3);font-size:12px;margin-bottom:12px;" onclick="arRenderCaseList()"><i class="fa-solid fa-arrow-left"></i> Listeye Dön</div>
      <div style="font-family:'Instrument Serif',serif;font-size:16px;margin-bottom:4px;">${c.dosyaNo || 'Dosya No yok'}${c.buroDosyaNo ? ` <span style="font-size:12px;color:var(--t3);font-family:'Inter',sans-serif;">— Büro Dosya No: ${c.buroDosyaNo}</span>` : ''}</div>
      <div style="font-size:12px;color:var(--t3);margin-bottom:16px;">${c.basvurucuAd || '?'} — ${karsiOzet}</div>

      <div style="border:1px solid var(--border);border-radius:var(--r);padding:12px;margin-bottom:16px;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:8px;">Toplantı Tarihleri</div>

        <div style="display:flex;gap:6px;align-items:flex-end;margin-bottom:10px;">
          <div style="flex:1;">
            <div style="font-size:10.5px;color:var(--t3);margin-bottom:3px;">İlk Oturum Tarihi/Saati</div>
            <div style="display:flex;gap:4px;">
              <input type="date" id="ar-fix-ilk-tarih" value="${c.ilkOturumTarihi ? new Date(c.ilkOturumTarihi).toISOString().slice(0,10) : ''}" style="flex:1;">
              <input type="time" id="ar-fix-ilk-saat" value="${c.ilkOturumTarihi ? new Date(c.ilkOturumTarihi).toTimeString().slice(0,5) : '09:00'}" style="width:110px;">
            </div>
          </div>
          <button class="pop-cta-btn b" style="width:auto;padding:7px 10px;" onclick="arSaveFixedDate('ilk')" title="Kaydet"><i class="fa-solid fa-check"></i></button>
          ${c.ilkOturumTarihi ? `<button class="pop-cta-btn" style="width:auto;padding:7px 10px;background:var(--danger);" onclick="arClearFixedDate('ilk')" title="Sil"><i class="fa-solid fa-xmark"></i></button>` : ''}
        </div>

        <div style="display:flex;gap:6px;align-items:flex-end;">
          <div style="flex:1;">
            <div style="font-size:10.5px;color:var(--t3);margin-bottom:3px;">Son Oturum Tarihi/Saati</div>
            <div style="display:flex;gap:4px;">
              <input type="date" id="ar-fix-son-tarih" value="${c.sonTutanakTarihi ? new Date(c.sonTutanakTarihi).toISOString().slice(0,10) : ''}" style="flex:1;">
              <input type="time" id="ar-fix-son-saat" value="${c.sonTutanakTarihi ? new Date(c.sonTutanakTarihi).toTimeString().slice(0,5) : '09:00'}" style="width:110px;">
            </div>
          </div>
          <button class="pop-cta-btn b" style="width:auto;padding:7px 10px;" onclick="arSaveFixedDate('son')" title="Kaydet"><i class="fa-solid fa-check"></i></button>
          ${c.sonTutanakTarihi ? `<button class="pop-cta-btn" style="width:auto;padding:7px 10px;background:var(--danger);" onclick="arClearFixedDate('son')" title="Sil"><i class="fa-solid fa-xmark"></i></button>` : ''}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
        <button class="pop-cta-btn b" onclick="arShowGenForm('davet')"><i class="fa-solid fa-envelope"></i><span>Davet Mektubu Oluştur</span></button>
        <button class="pop-cta-btn b" onclick="arShowGenForm('ilkoturum')"><i class="fa-solid fa-people-arrows"></i><span>İlk Oturum Tutanağı Oluştur</span></button>
        <button class="pop-cta-btn b" onclick="arShowGenForm('sontutanak')"><i class="fa-solid fa-file-signature"></i><span>Son Tutanak Oluştur</span></button>
      </div>

      <div id="ar-gen-form"></div>
      <div id="ar-gen-result" style="margin-top:14px;"></div>

      <div style="margin-top:20px;border-top:1px solid var(--border);padding-top:12px;display:flex;gap:14px;">
        <span style="cursor:pointer;color:var(--gold);font-size:11.5px;" onclick="arEditCase('${c.id}')"><i class="fa-solid fa-pen"></i> Düzenle</span>
        <span style="cursor:pointer;color:var(--danger);font-size:11.5px;" onclick="arDeleteCase('${c.id}')"><i class="fa-solid fa-trash"></i> Bu dosyayı sil</span>
      </div>
    </div>
  `;
}

let arProfileCache = null;
async function getArabulucuProfile() {
  if (arProfileCache) return arProfileCache;
  try {
    const res = await fetch('/api/profile');
    const data = await res.json();
    arProfileCache = data.user || {};
  } catch (e) {
    arProfileCache = {};
  }
  return arProfileCache;
}

async function arSaveFixedDate(which) {
  if (!arSelectedCaseId) return;
  const body = {};
  if (which === 'ilk') {
    const tarih = document.getElementById('ar-fix-ilk-tarih').value;
    const saat = document.getElementById('ar-fix-ilk-saat').value || '09:00';
    if (!tarih) { toast('Önce bir tarih seçin', 'fa-solid fa-triangle-exclamation'); return; }
    body.ilkOturumTarihi = localDateTimeToISO(tarih, saat);
  } else {
    const tarih = document.getElementById('ar-fix-son-tarih').value;
    const saat = document.getElementById('ar-fix-son-saat').value || '09:00';
    if (!tarih) { toast('Önce bir tarih seçin', 'fa-solid fa-triangle-exclamation'); return; }
    body.sonTutanakTarihi = localDateTimeToISO(tarih, saat);
  }
  const res = await fetch('/api/mediation/cases/' + arSelectedCaseId, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    const data = await res.json();
    const idx = arCasesCache.findIndex(c => c.id === arSelectedCaseId);
    if (idx !== -1) arCasesCache[idx] = data.case;
    toast('Tarih kaydedildi', 'fa-solid fa-check', true);
    arSelectCase(idx);
  } else {
    toast('Kaydedilemedi', 'fa-solid fa-triangle-exclamation');
  }
}

async function arClearFixedDate(which) {
  if (!arSelectedCaseId) return;
  if (!confirm('Bu tarihi silmek istediğinize emin misiniz?')) return;
  const body = which === 'ilk' ? { ilkOturumTarihi: null } : { sonTutanakTarihi: null };
  const res = await fetch('/api/mediation/cases/' + arSelectedCaseId, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    const data = await res.json();
    const idx = arCasesCache.findIndex(c => c.id === arSelectedCaseId);
    if (idx !== -1) arCasesCache[idx] = data.case;
    toast('Tarih silindi', 'fa-solid fa-trash');
    arSelectCase(idx);
  }
}

function arShowGenForm(docType) {
  const formEl = document.getElementById('ar-gen-form');
  document.getElementById('ar-gen-result').innerHTML = '';
  const c = arCasesCache.find(cc => cc.id === arSelectedCaseId);

  if (docType === 'davet') {
    const options = [`<option value="basvurucu">Başvurucu — ${(c?.basvurucuAd)||''}</option>`]
      .concat((c?.karsiTaraflar || []).map((p, i) => `<option value="karsi-${i}">${(c.karsiTaraflar.length > 1 ? 'Karşı Taraf ' + (i+1) + ' — ' : 'Karşı Taraf — ')}${p.ad||''}</option>`));
    formEl.innerHTML = `
      <div class="ic" style="margin-bottom:10px;"><div class="ic-t">Davet Mektubu</div></div>
      <div class="fg"><div class="fl">Davet Edilecek Taraf</div>
        <select id="ar-davet-taraf">${options.join('')}</select>
      </div>
      <div style="display:flex;gap:6px;">
        <div class="fg" style="flex:1;"><div class="fl">Tarih</div><input type="date" id="ar-davet-tarih"></div>
        <div class="fg" style="flex:1;"><div class="fl">Saat</div><input type="time" id="ar-davet-saat" value="14:00"></div>
      </div>
      <div class="fg">
        <div class="fl">Toplantı Yeri</div>
        <input type="text" id="ar-davet-yer" placeholder="Telekonferans / Büro adresi">
        <div style="display:flex;gap:6px;margin-top:6px;">
          <span class="pop-cta-btn b" style="width:auto;padding:5px 10px;font-size:11px;cursor:pointer;" onclick="document.getElementById('ar-davet-yer').value='Telekonferans'">Telekonferans</span>
          <span class="pop-cta-btn b" style="width:auto;padding:5px 10px;font-size:11px;cursor:pointer;" onclick="arUseKayitliAdres()">Kayıtlı Adresimi Kullan</span>
        </div>
      </div>
      <button class="pop-cta-btn g" style="width:100%;margin-top:6px;" onclick="arGenerate('davet')"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Oluştur</span></button>
    `;
  } else if (docType === 'ilkoturum') {
    formEl.innerHTML = `
      <div class="ic" style="margin-bottom:10px;"><div class="ic-t">İlk Oturum Tutanağı</div></div>
      <div style="display:flex;gap:6px;">
        <div class="fg" style="flex:1;"><div class="fl">Toplantı Tarihi</div><input type="date" id="ar-ilk-tarih" value="${c?.ilkOturumTarihi ? new Date(c.ilkOturumTarihi).toISOString().slice(0,10) : ''}"></div>
        <div class="fg" style="flex:1;"><div class="fl">Toplantı Saati</div><input type="time" id="ar-ilk-saat" value="${c?.ilkOturumTarihi ? new Date(c.ilkOturumTarihi).toTimeString().slice(0,5) : '09:00'}"></div>
      </div>
      <div class="fg"><div class="fl">Kısa Notlar</div><textarea id="ar-ilk-notlar" rows="4" placeholder="Kiminle ne zaman görüşüldü, toplantı nasıl (yüz yüze/telekonferans) kararlaştırıldı, oturumda neler konuşuldu…"></textarea></div>
      <div style="font-size:10.5px;color:var(--t3);margin-bottom:6px;">Bu tarih, otomatik olarak Yaklaşan Süreler'e ve bildirim zilinize eklenecektir.</div>
      <button class="pop-cta-btn g" style="width:100%;" onclick="arGenerate('ilkoturum')"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Oluştur</span></button>
    `;
  } else if (docType === 'sontutanak') {
    formEl.innerHTML = `
      <div class="ic" style="margin-bottom:10px;"><div class="ic-t">Son Tutanak</div></div>
      <div style="display:flex;gap:6px;">
        <div class="fg" style="flex:1;"><div class="fl">Tutanak Tarihi</div><input type="date" id="ar-son-tarih" value="${c?.sonTutanakTarihi ? new Date(c.sonTutanakTarihi).toISOString().slice(0,10) : ''}"></div>
        <div class="fg" style="flex:1;"><div class="fl">Saati</div><input type="time" id="ar-son-saat" value="${c?.sonTutanakTarihi ? new Date(c.sonTutanakTarihi).toTimeString().slice(0,5) : '09:00'}"></div>
      </div>
      <div class="fg"><div class="fl">Sonuç</div>
        <select id="ar-son-sonuc" onchange="arToggleSontutanakFields()">
          <option value="anlasma">Anlaşma</option>
          <option value="anlasamama">Anlaşamama</option>
        </select>
      </div>
      <div id="ar-son-anlasma-alan">
        <div class="fg"><div class="fl">Anlaşma Şartları <span class="opt">(tutanağa BİREBİR bu şekilde yazılır, isimlere/tutarlara dikkat edin)</span></div><textarea id="ar-son-notlar" rows="6" placeholder="Örn: Taraflar, [X]'in [Y]'ye 06.10.2026 tarihine kadar taşınmazı boş olarak teslim etmesi konusunda anlaşmışlardır. Arabuluculuk ücreti olan 9.000 TL'nin başvurucu tarafından karşılanacağı..."></textarea></div>
      </div>
      <div id="ar-son-anlasamama-alan" style="display:none;">
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;">
          <input type="checkbox" id="ar-son-karsiteklif">
          <span style="font-size:12.5px;">Karşı tarafın bir karşı teklifi vardı</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0 12px;cursor:pointer;">
          <input type="checkbox" id="ar-son-ikincitoplanti">
          <span style="font-size:12.5px;">İkinci bir toplantı isteniyor</span>
        </label>
        <div style="font-size:11px;color:var(--t3);margin-bottom:10px;">Bu belge, standart bir "anlaşamama" cümle kalıbıyla otomatik oluşturulur — yukarıdaki iki seçenek dışında bir metin girmenize gerek yoktur.</div>
      </div>
      <div style="font-size:10.5px;color:var(--t3);margin-bottom:6px;">Bu tarih, otomatik olarak Yaklaşan Süreler'e ve bildirim zilinize eklenecektir.</div>
      <button class="pop-cta-btn g" style="width:100%;" onclick="arGenerate('sontutanak')"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Oluştur</span></button>
    `;
  }
}

async function arUseKayitliAdres() {
  const profile = await getArabulucuProfile();
  const el = document.getElementById('ar-davet-yer');
  if (el) el.value = profile.arabulucuAdres || '';
  if (!profile.arabulucuAdres) toast('Kayıtlı bir adresiniz yok — Üyelik & Hesap → Profil\'den ekleyebilirsiniz', 'fa-solid fa-triangle-exclamation');
}

function arToggleSontutanakFields() {
  const isAnlasma = document.getElementById('ar-son-sonuc').value === 'anlasma';
  document.getElementById('ar-son-anlasma-alan').style.display = isAnlasma ? '' : 'none';
  document.getElementById('ar-son-anlasamama-alan').style.display = isAnlasma ? 'none' : '';
}

async function arRefreshCaseDatesQuietly() {
  if (!arSelectedCaseId) return;
  try {
    const res = await fetch('/api/mediation/cases/' + arSelectedCaseId);
    const data = await res.json();
    if (data.case) {
      const idx = arCasesCache.findIndex(c => c.id === arSelectedCaseId);
      if (idx !== -1) arCasesCache[idx] = data.case;
    }
  } catch (e) { /* sessizce geç, ekranı bozma */ }
}

async function arGenerate(docType) {
  if (!arSelectedCaseId) return;
  const resultEl = document.getElementById('ar-gen-result');
  resultEl.innerHTML = `<div style="font-size:12px;color:var(--t3);"><i class="fa-solid fa-spinner fa-spin"></i> Belge hazırlanıyor…</div>`;

  const body = { docType };
  if (docType === 'davet') {
    body.davetEdilenSecim = document.getElementById('ar-davet-taraf').value;
    const tarih = document.getElementById('ar-davet-tarih').value;
    const saat = document.getElementById('ar-davet-saat').value;
    body.gunSaat = tarih ? `${tarih.split('-').reverse().join('.')} Saat ${saat || '14:00'}` : '';
    body.toplantiYeri = document.getElementById('ar-davet-yer').value;
  } else if (docType === 'ilkoturum') {
    body.toplantiTarihi = document.getElementById('ar-ilk-tarih').value;
    body.toplantiSaati = document.getElementById('ar-ilk-saat').value;
    body.notlar = document.getElementById('ar-ilk-notlar').value;
  } else if (docType === 'sontutanak') {
    body.tutanakTarihi = document.getElementById('ar-son-tarih').value;
    body.tutanakSaati = document.getElementById('ar-son-saat').value;
    body.sonuc = document.getElementById('ar-son-sonuc').value;
    if (body.sonuc === 'anlasma') {
      body.notlar = document.getElementById('ar-son-notlar').value;
    } else {
      body.karsiTeklifVar = document.getElementById('ar-son-karsiteklif').checked;
      body.ikinciToplantiIsteniyor = document.getElementById('ar-son-ikincitoplanti').checked;
    }
  }

  try {
    const res = await fetch('/api/mediation/cases/' + arSelectedCaseId + '/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      resultEl.innerHTML = `<div style="font-size:12px;color:var(--danger);">${data.error || 'Belge üretilemedi.'}</div>`;
      return;
    }
    const isDavet = docType === 'davet';
    const filename = data.fileName || (docType + '_belge.' + (isDavet ? 'docx' : 'udf'));
    const fileBase64 = isDavet ? data.docxBase64 : data.udfBase64;
    resultEl.innerHTML = `
      <div style="background:var(--bg2);border-radius:var(--r);padding:14px;">
        <div style="font-size:12px;color:var(--success);margin-bottom:8px;"><i class="fa-solid fa-circle-check"></i> Belge hazır.</div>
        <button class="pop-cta-btn b" style="width:100%;" onclick='arDownloadFile(${JSON.stringify(fileBase64)}, ${JSON.stringify(filename)}, ${JSON.stringify(isDavet)})'><i class="fa-solid fa-download"></i><span>${isDavet ? 'DOCX' : 'UDF'} İndir</span></button>
        <details style="margin-top:10px;">
          <summary style="cursor:pointer;font-size:11px;color:var(--t3);">Metni önizle</summary>
          <div style="white-space:pre-wrap;font-size:11.5px;color:var(--t2);margin-top:8px;max-height:300px;overflow-y:auto;">${data.text.replace(/</g,'&lt;')}</div>
        </details>
      </div>
    `;
    // Tarih dosyaya kaydedildi — ama ekranı (indirme linkini) SIFIRLAMADAN,
    // sadece arka plandaki önbelleği sessizce güncelliyoruz. Daha önce
    // burada arLoadCases() çağrılıyordu ve bu, kullanıcı dosyayı henüz
    // indirmeden ekranı listeye geri atıyordu.
    if (docType === 'ilkoturum' || docType === 'sontutanak') arRefreshCaseDatesQuietly();
  } catch (e) {
    resultEl.innerHTML = `<div style="font-size:12px;color:var(--danger);">Bağlantı hatası.</div>`;
  }
}

function arDownloadFile(base64, filename, isDocx) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const mime = isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/octet-stream';
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function arAutoFillFromFile() {
  const fileInput = document.getElementById('ar-autofile');
  const statusEl = document.getElementById('ar-autofill-status');
  const file = fileInput.files[0];
  if (!file) { toast('Önce bir belge seçin', 'fa-solid fa-triangle-exclamation'); return; }

  statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Belge okunuyor…';

  const form = new FormData();
  form.append('files', file);
  form.append('instruction', 'Bu başvuru evrakından taraf bilgilerini çıkar.');
  form.append('mode', 'mediation-extract');
  form.append('wantUdf', '0');

  try {
    const res = await fetch('/api/tools/analyze', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) {
      statusEl.innerHTML = `<span style="color:var(--danger);">${data.error || 'Okunamadı.'}</span>`;
      return;
    }
    let p;
    try {
      const clean = data.analysis.replace(/```json|```/g, '').trim();
      p = JSON.parse(clean);
    } catch (e) {
      statusEl.innerHTML = `<span style="color:var(--danger);">AI'dan gelen veri okunamadı — elle doldurun.</span>`;
      return;
    }

    const setIf = (id, val) => { if (val) document.getElementById(id).value = val; };
    setIf('ar-dosyano', p.dosyaNo);
    setIf('ar-buro-dosyano', p.buroDosyaNo);
    // AI, vergi/mersis no bulduysa tüzel kişilik olarak varsayıyoruz.
    if (p.basvurucuVergiMersis || p.basvurucuYetkiliAd) {
      arSetBasvurucuTip('tuzel');
      setIf('ar-bas-unvan', p.basvurucuAd);
      setIf('ar-bas-vergimersis', p.basvurucuVergiMersis);
      setIf('ar-bas-yetkili', p.basvurucuYetkiliAd);
    } else {
      arSetBasvurucuTip('sahis');
      setIf('ar-bas-ad', p.basvurucuAd);
      setIf('ar-bas-tc', p.basvurucuTC);
    }
    setIf('ar-bas-adres', p.basvurucuAdres);
    setIf('ar-bas-vekil', p.basvurucuVekilAd);
    setIf('ar-bas-barosicil', p.basvurucuBaroSicil);
    setIf('ar-bas-tel', p.basvurucuTelefon);
    setIf('ar-uyusmazlik', p.uyusmazlikKonusu);
    setIf('ar-basvuru-tarih', p.basvuruTarihi);

    if (Array.isArray(p.karsiTaraflar) && p.karsiTaraflar.length) {
      arKarsiTarafRows = p.karsiTaraflar.map(k => ({
        tip: (k.vergiMersis || k.yetkiliAd) ? 'tuzel' : 'sahis',
        ad: k.ad || '', tcKimlik: k.tcKimlik || '', adres: k.adres || '', vergiMersis: k.vergiMersis || '',
        yetkiliAd: k.yetkiliAd || '', vekilAd: k.vekilAd || '', vekilBaroSicil: k.vekilBaroSicil || '', telefon: k.telefon || '',
      }));
      arRenderKarsiRows();
      statusEl.innerHTML = `<span style="color:var(--success);"><i class="fa-solid fa-check"></i> Form dolduruldu (${p.karsiTaraflar.length} karşı taraf bulundu) — kaydetmeden önce kontrol edin.</span>`;
    } else {
      statusEl.innerHTML = '<span style="color:var(--success);"><i class="fa-solid fa-check"></i> Form dolduruldu — kaydetmeden önce kontrol edin.</span>';
    }
  } catch (e) {
    statusEl.innerHTML = `<span style="color:var(--danger);">Bağlantı hatası.</span>`;
  }
}

async function arSaveCase() {
  const body = {
    dosyaNo: document.getElementById('ar-dosyano').value,
    buroDosyaNo: document.getElementById('ar-buro-dosyano').value,
    basvurucuTip: arBasvurucuTip,
    basvurucuAd: arBasvurucuTip === 'sahis' ? document.getElementById('ar-bas-ad').value : document.getElementById('ar-bas-unvan').value,
    basvurucuTC: arBasvurucuTip === 'sahis' ? document.getElementById('ar-bas-tc').value : '',
    basvurucuVergiMersis: arBasvurucuTip === 'tuzel' ? document.getElementById('ar-bas-vergimersis').value : '',
    basvurucuYetkiliAd: arBasvurucuTip === 'tuzel' ? document.getElementById('ar-bas-yetkili').value : '',
    basvurucuAdres: document.getElementById('ar-bas-adres').value,
    basvurucuVekilAd: document.getElementById('ar-bas-vekil').value,
    basvurucuBaroSicil: document.getElementById('ar-bas-barosicil').value,
    basvurucuTelefon: document.getElementById('ar-bas-tel').value,
    karsiTaraflar: arKarsiTarafRows.filter(r => r.ad && r.ad.trim()),
    uyusmazlikTuru: document.getElementById('ar-uyusmazlik-tur').value === 'Diğer'
      ? document.getElementById('ar-uyusmazlik-tur-diger').value
      : document.getElementById('ar-uyusmazlik-tur').value,
    uyusmazlikKonusu: document.getElementById('ar-uyusmazlik').value,
    basvuruTarihi: document.getElementById('ar-basvuru-tarih').value,
    gorevlendirmeTarihi: document.getElementById('ar-gorev-tarih').value,
  };
  if (!body.basvurucuAd) { toast('Başvurucu adı gerekli', 'fa-solid fa-triangle-exclamation'); return; }
  if (!body.karsiTaraflar.length) { toast('En az bir karşı taraf girmelisiniz', 'fa-solid fa-triangle-exclamation'); return; }

  const isEditing = !!arEditingCaseId;
  const url = isEditing ? '/api/mediation/cases/' + arEditingCaseId : '/api/mediation/cases';
  const res = await fetch(url, {
    method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    toast(isEditing ? 'Dosya güncellendi' : 'Dosya kaydedildi', 'fa-solid fa-check', true);
    arEditingCaseId = null;
    const saveBtn = document.getElementById('ar-save-btn');
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i><span>Dosyayı Kaydet</span>';
    await arLoadCases();
  } else {
    toast('Kaydedilemedi', 'fa-solid fa-triangle-exclamation');
  }
}

let arEditingCaseId = null;

function arEditCase(id) {
  const c = arCasesCache.find(cc => cc.id === id);
  if (!c) return;
  arEditingCaseId = id;

  const setIf = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
  setIf('ar-dosyano', c.dosyaNo);
  setIf('ar-buro-dosyano', c.buroDosyaNo);
  arSetBasvurucuTip(c.basvurucuTip === 'tuzel' ? 'tuzel' : 'sahis');
  if (c.basvurucuTip === 'tuzel') {
    setIf('ar-bas-unvan', c.basvurucuAd);
    setIf('ar-bas-vergimersis', c.basvurucuVergiMersis);
    setIf('ar-bas-yetkili', c.basvurucuYetkiliAd);
  } else {
    setIf('ar-bas-ad', c.basvurucuAd);
    setIf('ar-bas-tc', c.basvurucuTC);
  }
  setIf('ar-bas-adres', c.basvurucuAdres);
  setIf('ar-bas-vekil', c.basvurucuVekilAd);
  setIf('ar-bas-barosicil', c.basvurucuBaroSicil);
  setIf('ar-bas-tel', c.basvurucuTelefon);
  setIf('ar-uyusmazlik', c.uyusmazlikKonusu);
  setIf('ar-basvuru-tarih', c.basvuruTarihi);
  setIf('ar-gorev-tarih', c.gorevlendirmeTarihi);

  const turSelect = document.getElementById('ar-uyusmazlik-tur');
  const turDiger = document.getElementById('ar-uyusmazlik-tur-diger');
  const knownTurler = ['İş Hukuku', 'Ticaret Hukuku', 'Tüketici Hukuku', 'Kira Hukuku', 'Ortaklığın Giderilmesi'];
  if (c.uyusmazlikTuru && knownTurler.includes(c.uyusmazlikTuru)) {
    turSelect.value = c.uyusmazlikTuru;
    turDiger.style.display = 'none';
  } else if (c.uyusmazlikTuru) {
    turSelect.value = 'Diğer';
    turDiger.style.display = '';
    turDiger.value = c.uyusmazlikTuru;
  }

  arKarsiTarafRows = (c.karsiTaraflar && c.karsiTaraflar.length)
    ? c.karsiTaraflar.map(p => ({ tip: p.tip || 'sahis', ad: p.ad || '', tcKimlik: p.tcKimlik || '', adres: p.adres || '', vergiMersis: p.vergiMersis || '', yetkiliAd: p.yetkiliAd || '', vekilAd: p.vekilAd || '', vekilBaroSicil: p.vekilBaroSicil || '', telefon: p.telefon || '' }))
    : [{ tip: 'sahis', ad: '', tcKimlik: '', adres: '', vergiMersis: '', yetkiliAd: '', vekilAd: '', vekilBaroSicil: '', telefon: '' }];
  arRenderKarsiRows();

  const saveBtn = document.getElementById('ar-save-btn');
  if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i><span>Dosyayı Güncelle</span>';

  toast('Dosya bilgileri forma yüklendi — yukarı kaydırıp düzenleyin', 'fa-solid fa-pen', true);
}

async function arDeleteCase(id) {
  if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;
  await fetch('/api/mediation/cases/' + id, { method: 'DELETE' });
  toast('Dosya silindi', 'fa-solid fa-trash');
  arLoadCases();
}
