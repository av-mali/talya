// Bu dosya SADECE 'Belge & Analiz' modülüne aittir.
// Bu modülü düzenlemek diğer modülleri (buro, uyap, hesap, uyelik) etkilemez.
//
// NOT: "Dilekçe Sihirbazı", "Dosya Analizi", "Sözleşme İnceleme" ve
// "Şablon Kütüphanesi" artık kendi içinde çalışan (AI sohbet paneline
// göndermeyen) araçlar. "Emsal Karar Analizi", "Mevzuat Arama", "Risk
// Analizi" ve "Duruşma Hazırlık" ise eskisi gibi sohbet paneline soru
// gönderiyor — bu modülde sohbet paneli hâlâ var, sadece bazı araçlar
// onu kullanmıyor.
window.CURRENT_MODULE = {
  key: 'belge',
  label: 'Belge & Analiz',
  nameHtml: `Belge &amp; <em class="g">Analiz</em>`,
  color: 'g',
  items: [
    {"id": "wizard", "icon": "fa-scroll", "name": "Dilekçe Sihirbazı"},
    {"id": "emsal", "icon": "fa-magnifying-glass-chart", "name": "Emsal Karar Analizi"},
    {"id": "dosya", "icon": "fa-file-shield", "name": "Dosya Analizi"},
    {"id": "mevzuat", "icon": "fa-book-open-reader", "name": "Mevzuat Arama"},
    {"id": "sablon", "icon": "fa-layer-group", "name": "Şablon Kütüphanesi"},
    {"id": "durusma", "icon": "fa-timeline", "name": "Duruşma Hazırlık"}
  ],
  popups: {
    wizard: {
      badge: 'g', badgeText: 'HMK Md.119 · Ücretsiz AI (Gemini)', titleHtml: 'Dilekçe <em class="g">Sihirbazı</em>',
      desc: 'Dava türünü ve olayı yazın; AI HMK uyumlu bir taslak hazırlasın.',
      btnClass: 'g', btnIco: 'fa-gears', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><div class="fl"><i class="fa-solid fa-gavel"></i> Dava Türü</div><input type="text" id="ds-davatur" placeholder="Örn. İşe İade Davası, Boşanma Davası, İtirazın İptali…"></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-align-left"></i> Olay Örgüsü</div><textarea id="ds-olay" rows="5" placeholder="Müvekkilin yaşadığı olayı yazın…"></textarea></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-list-check"></i> Özel Talepler <span class="opt">(opsiyonel)</span></div><input type="text" id="ds-talep" placeholder="İhtiyati tedbir, faiz, vekâlet ücreti…"></div>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--t2);margin-bottom:10px;">
          <input type="checkbox" id="ds-udf" checked> Taslağı UDF/Word/PDF olarak da indirebilir hale getir
        </label>
        <button class="pop-cta-btn g" style="width:100%;" onclick="dilekceSihirbaziSubmit()"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Dilekçeyi Taslakla</span></button>
        <div class="ic" style="margin-top:14px;"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Not</div><p>Sonuç sağdaki sohbet panelinde görünür.</p></div>
      `,
      onOpen: () => {},
      prompt: () => ''
    },
    emsal: {
      badge: 'g', badgeText: 'Yargıtay · BAM Kararları', titleHtml: 'Emsal Karar <em class="g">Analizi</em>',
      desc: 'Uyuşmazlığı tanımlayın; benzer davalardaki kararlar AI ile analiz edilsin.',
      btnClass: 'g', btnIco: 'fa-magnifying-glass', btnLbl: 'Emsal Karar Ara',
      body: `
        <div class="fg"><div class="fl"><i class="fa-solid fa-gavel"></i> Uyuşmazlık Konusu</div><div class="sw"><select id="f-konu"><option>İş Hukuku</option><option>Aile Hukuku</option><option>Ticaret Hukuku</option><option>Ceza Hukuku</option><option>İdare Hukuku</option></select></div></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-align-left"></i> Hukuki Mesele</div><textarea id="f-mesele" rows="4" placeholder="Emsal aranan hukuki meseleyi özetleyin…"></textarea></div>`,
      prompt: () => `${document.getElementById('f-konu')?.value || ''} alanında şu konuda Yargıtay ve BAM emsal kararlarını ara ve analiz et:\n${document.getElementById('f-mesele')?.value || ''}`
    },
    dosya: {
      badge: 'g', badgeText: 'PDF · Görsel · Word · UDF', titleHtml: 'Dosya <em class="g">Analizi</em>',
      desc: 'Bir dosya yükleyin ya da metin yapıştırın; AI sorunuzu cevaplasın. Hiçbir dosya saklanmaz.',
      btnClass: 'g', btnIco: 'fa-file-magnifying-glass', btnLbl: '', hideCta: true,
      body: '', // JS ile dolduruluyor (bkz. buildAnalyzeWidgetHtml)
      onOpen: () => { document.getElementById('popBody').innerHTML = buildAnalyzeWidgetHtml('da', 'Bu belgeyi özetle, kararı/kritik süreleri çıkar…'); },
      prompt: () => ''
    },
    mevzuat: {
      badge: 'g', badgeText: 'Mevzuat.gov.tr · Gerçek Arama', titleHtml: 'Mevzuat <em class="g">Arama</em>',
      desc: 'Kanun, yönetmelik ve tebliğlerde gerçek zamanlı arama yapın.',
      btnClass: 'g', btnIco: 'fa-book-open-reader', btnLbl: '', hideCta: true, hideChatInput: true,
      body: `
        <div class="fg"><input type="text" id="mv-mevara" placeholder="Kıdem tazminatı, velayet, kira artışı…" onkeydown="if(event.key==='Enter')mevzuatSearch()"></div>
        <button class="pop-cta-btn g" style="width:100%;" onclick="mevzuatSearch()"><i class="fa-solid fa-magnifying-glass"></i><span>Mevzuatta Ara</span></button>
        <div class="ic" style="margin-top:14px;"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Kaynak</div><p>Sonuçlar, Adalet Bakanlığı Mevzuat Bilgi Sistemi'nden (mevzuat.gov.tr) gerçek zamanlı çekiliyor ve sağ panelde listelenir. Ücretsiz bir topluluk servisi üzerinden erişiliyor — nadiren yavaş/erişilemez olabilir.</p></div>
      `,
      onOpen: () => { mevzuatRenderInPane('<div style="padding:30px 24px;color:var(--t3);font-size:13px;">Aramak için sol taraftaki kutuyu kullanın.</div>'); },
      prompt: () => ''
    },
    sablon: {
      badge: 'g', badgeText: 'Metin Şablonları', titleHtml: 'Şablon <em class="g">Kütüphanesi</em>',
      desc: 'Sık kullandığınız dilekçe/ihtarname metinlerini burada saklayın.',
      btnClass: 'g', btnIco: 'fa-layer-group', btnLbl: '', hideCta: true, hideChatInput: true,
      body: `
        <div class="fg"><div class="fl">Şablon Adı</div><input type="text" id="tpl-title" placeholder="Kira İhtarnamesi…"></div>
        <div class="fg"><div class="fl">İçerik</div><textarea id="tpl-content" rows="8" placeholder="Şablon metnini buraya yazın…"></textarea></div>
        <button class="pop-cta-btn g" style="width:100%;" onclick="tplAdd()"><i class="fa-solid fa-plus"></i><span>Şablonu Kaydet</span></button>
      `,
      onOpen: () => tplOnOpen(),
      prompt: () => ''
    },
    durusma: {
      badge: 'g', badgeText: 'Çoklu Belge Analizi', titleHtml: 'Duruşma <em class="g">Hazırlık</em>',
      desc: 'İddianame, celse tutanakları gibi belgeleri birlikte yükleyin; AI duruşma stratejisi çıkarsın.',
      btnClass: 'g', btnIco: 'fa-person-chalkboard', btnLbl: '', hideCta: true,
      body: `
        <div class="fg"><div class="fl"><i class="fa-solid fa-file-arrow-up"></i> Belgeleri Yükle (birden fazla seçebilirsiniz)</div><input type="file" id="ds-files" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif,.docx,.txt,.html,.htm,.xml,.csv,.udf"></div>
        <div id="ds-filelist" style="font-size:11px;color:var(--t3);margin:-6px 0 10px;"></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-comment-dots"></i> Ek Talimat (opsiyonel)</div><textarea id="ds-question" rows="2" placeholder="Özellikle şu noktaya odaklan… (boş bırakılırsa genel strateji çıkarılır)"></textarea></div>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--t2);margin-bottom:10px;">
          <input type="checkbox" id="ds-udf"> Sonucu UDF/Word/PDF olarak da indirebilir hale getir
        </label>
        <button class="pop-cta-btn g" style="width:100%;" onclick="durusmaAnalyzeSubmit()"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Strateji Çıkar</span></button>
        <div class="ic" style="margin-top:14px;"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Gizlilik</div><p>Yüklediğiniz belgeler hiçbir yerde saklanmaz — anlık işlenir, silinir. Sonuç sağdaki panelde görünür.</p></div>
      `,
      onOpen: () => {
        const fi = document.getElementById('ds-files');
        if (fi) fi.onchange = () => {
          const list = document.getElementById('ds-filelist');
          list.textContent = fi.files.length ? `${fi.files.length} dosya seçildi: ` + Array.from(fi.files).map(f => f.name).join(', ') : '';
        };
      },
      prompt: () => ''
    }
  }
};

// ══════════════════════════════════════════════════════
// ORTAK "YÜKLE + ANALİZ ET" MOTORU
// Dosya Analizi ve Sözleşme İnceleme aynı motoru (farklı önekle) kullanır.
// ══════════════════════════════════════════════════════
function buildAnalyzeWidgetHtml(prefix, questionPlaceholder) {
  return `
    <div class="fg"><div class="fl"><i class="fa-solid fa-file-arrow-up"></i> Dosya Yükle (PDF, Görsel, DOCX, TXT/HTML/XML/CSV, UDF)</div><input type="file" id="${prefix}-file" accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif,.docx,.txt,.html,.htm,.xml,.csv,.udf"></div>
    <div style="text-align:center;font-size:11px;color:var(--t3);margin:8px 0;">— veya —</div>
    <div class="fg"><div class="fl"><i class="fa-solid fa-paste"></i> Metni Yapıştır</div><textarea id="${prefix}-text" rows="5" placeholder="Belge metnini buraya yapıştırabilirsiniz…"></textarea></div>
    <div class="fg">
      <div class="fl"><i class="fa-solid fa-comment-dots"></i> Sorunuz / Talimatınız</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
        <span class="qp" style="cursor:pointer;" onclick="fillQuickInstruction('${prefix}','risk')"><i class="fa-solid fa-scale-balanced"></i> Risk Analizi Yap</span>
        <span class="qp" style="cursor:pointer;" onclick="fillQuickInstruction('${prefix}','sozlesme')"><i class="fa-solid fa-file-signature"></i> Sözleşme İncele</span>
        <span class="qp" style="cursor:pointer;" onclick="fillQuickInstruction('${prefix}','karsitaraf')"><i class="fa-solid fa-arrows-turn-to-dots"></i> Karşı Taraf Lehine Çevir</span>
      </div>
      <textarea id="${prefix}-question" rows="2" placeholder="${questionPlaceholder}"></textarea>
    </div>
    <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--t2);margin-bottom:10px;">
      <input type="checkbox" id="${prefix}-udf"> Cevabı UDF/Word/PDF olarak da indirebilir hale getir
    </label>
    <button class="pop-cta-btn g" style="width:100%;" onclick="araclAnalyzeSubmit('${prefix}')"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Analiz Et</span></button>
    <div class="ic" style="margin-top:14px;"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Gizlilik</div><p>Yüklediğiniz dosya hiçbir yerde saklanmaz — anlık olarak işlenir, cevap üretilir üretilmez bellekten silinir. Sonuç sağdaki sohbet panelinde görünür.</p></div>
  `;
}

const QUICK_INSTRUCTIONS = {
  risk: 'Bu belgeyi/dosyayı hukuki açıdan değerlendir: güçlü yönler, zayıf yönler/riskler, varsa emsal içtihat eğilimi ve önerilen stratejiyi ayrı başlıklar halinde yaz. Sonunda genel değerlendirmeni "Düşük risk / Orta risk / Yüksek risk" şeklinde kategorik olarak belirt — net bir yüzde veya kesin bir kazanma olasılığı verme, hukuki sonuçlar kesin tahmin edilemez.',
  sozlesme: 'Bu sözleşmeyi TBK açısından incele: riskli, eksik veya belirsiz maddeleri tek tek tespit et, her biri için ne değiştirilmesi/eklenmesi gerektiğini öner. Taraflar arasındaki dengesizlikleri (varsa) ayrıca belirt.',
  karsitaraf: 'Bu belgeyi, hukuki geçerliliğini koruyarak, karşı tarafın (belgede kimin lehine yazıldıysa onun karşısındaki tarafın) çıkarına ve bakış açısına göre yeniden düzenle. Hangi maddelerin/ifadelerin karşı taraf lehine değiştirildiğini kısaca özetle.',
};

function fillQuickInstruction(prefix, type) {
  const el = document.getElementById(prefix + '-question');
  if (el && QUICK_INSTRUCTIONS[type]) {
    el.value = QUICK_INSTRUCTIONS[type];
    el.focus();
  }
}

async function durusmaAnalyzeSubmit() {
  const filesInput = document.getElementById('ds-files');
  const question = document.getElementById('ds-question').value.trim();
  const wantUdf = document.getElementById('ds-udf').checked;
  const files = filesInput.files ? Array.from(filesInput.files) : [];

  if (!files.length) { toast('En az bir belge yükleyin', 'fa-solid fa-triangle-exclamation'); return; }

  const fileNames = files.map(f => f.name).join(', ');
  appendMsg('user', `<strong>Duruşma Hazırlık</strong> — ${files.length} belge: ${fileNames.replace(/</g, '&lt;')}${question ? '<br><span style="opacity:.85;">' + question.replace(/</g, '&lt;') + '</span>' : ''}`);
  showTyping();

  const form = new FormData();
  files.forEach(f => form.append('files', f));
  form.append('instruction', question || 'Bu belgelere göre kapsamlı bir duruşma stratejisi çıkar.');
  form.append('mode', 'durusma');
  form.append('wantUdf', wantUdf ? '1' : '0');

  try {
    const res = await fetch('/api/tools/analyze', { method: 'POST', body: form });
    const data = await res.json();
    removeTyping();
    if (!res.ok) {
      appendMsg('ai', `<span style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> ${data.error || 'Hata oluştu.'}</span>`);
      return;
    }
    appendMsg('ai', fmtAI(data.analysis || ''), data.udfBase64 || null, data.docxBase64 || null, data.pdfBase64 || null);
  } catch (e) {
    removeTyping();
    appendMsg('ai', '<span style="color:var(--danger)">Bağlantı hatası.</span>');
  }
}

async function araclAnalyzeSubmit(prefix) {
  const fileInput = document.getElementById(prefix + '-file');
  const text = document.getElementById(prefix + '-text').value.trim();
  const question = document.getElementById(prefix + '-question').value.trim();
  const wantUdf = document.getElementById(prefix + '-udf').checked;
  const mode = prefix === 'sz' ? 'sozlesme' : 'dosya';

  if (!question) { toast('Soru/talimat girin', 'fa-solid fa-triangle-exclamation'); return; }
  if (!(fileInput.files && fileInput.files[0]) && !text) {
    toast('Dosya yükleyin veya metin yapıştırın', 'fa-solid fa-triangle-exclamation');
    return;
  }

  const fileLabel = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : 'Yapıştırılan metin';
  const baslik = mode === 'sozlesme' ? 'Sözleşme İnceleme' : 'Dosya Analizi';
  appendMsg('user', `<strong>${baslik}</strong> — ${fileLabel.replace(/</g, '&lt;')}<br><span style="opacity:.85;">${question.replace(/</g, '&lt;')}</span>`);
  showTyping();

  const form = new FormData();
  if (fileInput.files && fileInput.files[0]) form.append('file', fileInput.files[0]);
  if (text) form.append('pastedText', text);
  form.append('instruction', question);
  form.append('mode', mode);
  form.append('wantUdf', wantUdf ? '1' : '0');

  try {
    const res = await fetch('/api/tools/analyze', { method: 'POST', body: form });
    const data = await res.json();
    removeTyping();
    if (!res.ok) {
      appendMsg('ai', `<span style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> ${data.error || 'Hata oluştu.'}</span>`);
      return;
    }
    appendMsg('ai', fmtAI(data.analysis || ''), data.udfBase64 || null, data.docxBase64 || null, data.pdfBase64 || null);
  } catch (e) {
    removeTyping();
    appendMsg('ai', '<span style="color:var(--danger)">Bağlantı hatası.</span>');
  }
}

// ══════════════════════════════════════════════════════
// DİLEKÇE SİHİRBAZI — kendi motoru (dosya/metin gerekmez)
// ══════════════════════════════════════════════════════
async function dilekceSihirbaziSubmit() {
  const davaTuru = document.getElementById('ds-davatur').value.trim();
  const olay = document.getElementById('ds-olay').value.trim();
  const talep = document.getElementById('ds-talep').value.trim();
  const wantUdf = document.getElementById('ds-udf').checked;

  if (!davaTuru || !olay) {
    toast('Dava türü ve olay örgüsü gerekli', 'fa-solid fa-triangle-exclamation');
    return;
  }

  appendMsg('user', `<strong>Dilekçe Sihirbazı</strong> — ${davaTuru.replace(/</g, '&lt;')}<br><span style="opacity:.85;white-space:pre-wrap;">${olay.replace(/</g, '&lt;')}${talep ? '<br><em>Özel talep: ' + talep.replace(/</g, '&lt;') + '</em>' : ''}</span>`);
  showTyping();

  const instruction = `Dava Türü: ${davaTuru}\n\nOlay Örgüsü:\n${olay}\n\nÖzel Talepler: ${talep || 'Belirtilmemiş'}`;

  const form = new FormData();
  form.append('instruction', instruction);
  form.append('mode', 'dilekce');
  form.append('wantUdf', wantUdf ? '1' : '0');

  try {
    const res = await fetch('/api/tools/analyze', { method: 'POST', body: form });
    const data = await res.json();
    removeTyping();
    if (!res.ok) {
      appendMsg('ai', `<span style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> ${data.error || 'Hata oluştu.'}</span>`);
      return;
    }
    appendMsg('ai', fmtAI(data.analysis || ''), data.udfBase64 || null, data.docxBase64 || null, data.pdfBase64 || null);
  } catch (e) {
    removeTyping();
    appendMsg('ai', '<span style="color:var(--danger)">Bağlantı hatası.</span>');
  }
}

// ══════════════════════════════════════════════════════
// ŞABLON KÜTÜPHANESİ — Büro Yönetimi'nden buraya taşındı.
// Şablon Kütüphanesi artık klasik 3 sütun: ortada ekleme formu (popBody),
// sağda liste/detay (sohbet panelinin alanı, mevzuatGetPane ile aynı mantık).
let tplSelectedId = null;

function tplGetPane() {
  const empty = document.getElementById('chatEmpty');
  if (empty) empty.style.display = 'none';
  return document.getElementById('chatMsgs');
}

async function tplOnOpen() {
  tplSelectedId = null;
  await tplRenderList();
}

async function tplRenderList() {
  const box = tplGetPane();
  try {
    const res = await fetch('/api/templates');
    const data = await res.json();
    const templates = data.templates || [];

    if (!tplSelectedId) {
      box.innerHTML = `
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:8px;">Şablonlarınız (${templates.length})</div>
        ${templates.length ? templates.map(t => `<div class="s-item" style="margin:0 0 4px;" onclick="tplView('${t.id}')">
          <span class="ico"><i class="fa-solid fa-file-lines"></i></span>${t.title}
        </div>`).join('') : emptyState('fa-layer-group', 'Henüz şablon eklenmedi', 'Soldaki formdan ilk şablonunuzu ekleyin.')}
      `;
    } else {
      const tpl = templates.find(t => t.id === tplSelectedId);
      if (!tpl) { tplSelectedId = null; return tplRenderList(); }
      box.innerHTML = `
        <div style="cursor:pointer;color:var(--t3);font-size:12px;margin-bottom:12px;" onclick="tplBack()"><i class="fa-solid fa-arrow-left"></i> Listeye Dön</div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="font-family:'Instrument Serif',serif;font-size:18px;margin-bottom:12px;">${tpl.title}</div>
          <div style="display:flex;gap:6px;">
            <button class="pop-cta-btn g" style="width:auto;padding:5px 10px;" onclick="tplCopy('${tpl.id}')"><i class="fa-solid fa-copy"></i></button>
            <button class="pop-cta-btn" style="width:auto;padding:5px 10px;background:var(--danger);" onclick="tplDelete('${tpl.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <div id="tpl-content-${tpl.id}" style="white-space:pre-wrap;font-size:13px;background:var(--bg2);border-radius:var(--r);padding:16px;line-height:1.6;">${tpl.content}</div>
      `;
    }
  } catch (e) {
    box.innerHTML = `<div style="color:var(--danger);font-size:13px;">Yüklenemedi.</div>`;
  }
}

function tplView(id) { tplSelectedId = id; tplRenderList(); }
function tplBack() { tplSelectedId = null; tplRenderList(); }

async function tplCopy(id) {
  const el = document.getElementById('tpl-content-' + id);
  if (!el) return;
  navigator.clipboard?.writeText(el.innerText).then(() => toast('Panoya kopyalandı', 'fa-solid fa-check', true));
}

async function tplDelete(id) {
  if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;
  await fetch('/api/templates/' + id, { method: 'DELETE' });
  tplSelectedId = null;
  toast('Şablon silindi', 'fa-solid fa-trash');
  tplRenderList();
}

async function tplAdd() {
  const title = document.getElementById('tpl-title').value.trim();
  const content = document.getElementById('tpl-content').value.trim();
  if (!title || !content) { toast('Başlık ve içerik gerekli', 'fa-solid fa-triangle-exclamation'); return; }
  await fetch('/api/templates', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
  document.getElementById('tpl-title').value = '';
  document.getElementById('tpl-content').value = '';
  toast('Şablon kaydedildi', 'fa-solid fa-check', true);
  tplRenderList();
}

// ══════════════════════════════════════════════════════
// MEVZUAT ARAMA — mevzuat.gov.tr'ye gerçek zamanlı erişim
// (Bağımsız bir topluluk servisi üzerinden — bkz. üstteki not.)
// ══════════════════════════════════════════════════════

// Mevzuat Arama sonuçları, sağdaki sohbet panelinin alanını (chatMsgs)
// kullanır ama sohbet balonu formatında DEĞİL — doğrudan içerik olarak.
function mevzuatGetPane() {
  const empty = document.getElementById('chatEmpty');
  if (empty) empty.style.display = 'none';
  return document.getElementById('chatMsgs');
}
function mevzuatRenderInPane(html) {
  const pane = mevzuatGetPane();
  if (pane) pane.innerHTML = html;
}

// API'nin döndürdüğü alan adları kesin bilinmediği için (dış servis,
// canlı test edilemedi), birden fazla olası alan adını deniyoruz.
function mvzField(obj, ...names) {
  for (const n of names) {
    if (obj && obj[n] !== undefined && obj[n] !== null) return obj[n];
  }
  return null;
}

async function mevzuatSearch() {
  const query = document.getElementById('mv-mevara').value.trim();
  const box = mevzuatGetPane();
  if (!query) { toast('Bir arama terimi girin', 'fa-solid fa-triangle-exclamation'); return; }
  box.innerHTML = `<div style="font-size:12px;color:var(--t3);padding:10px 0;"><i class="fa-solid fa-spinner fa-spin"></i> mevzuat.gov.tr'de aranıyor…</div>`;

  try {
    const res = await fetch('/api/tools/mevzuat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'search', query })
    });
    const data = await res.json();
    console.log('[Mevzuat] Ham API cevabı:', data);
    if (!res.ok) {
      box.innerHTML = `<div style="font-size:12px;color:var(--danger);padding:10px 0;">${data.error || 'Arama başarısız.'}</div>`;
      return;
    }
    const list = Array.isArray(data.result) ? data.result : (data.result?.results || data.result?.items || data.result?.mevzuatlar || []);
    if (!list.length) {
      box.innerHTML = `<div style="font-size:12px;color:var(--t3);padding:10px 0;">Sonuç bulunamadı.</div>
        <div style="font-size:10px;color:var(--t3);margin-top:10px;padding:8px;background:var(--bg2);border-radius:6px;word-break:break-all;">Teşhis (geliştirici için): ${(data._debug || 'boş').replace(/</g,'&lt;')}</div>`;
      return;
    }
    // JSON'u doğrudan HTML özniteliğine gömmek, mevzuat adında tırnak/kesme
    // işareti geçince tıklamayı bozuyordu — bunun yerine sonuçları global
    // bir listede tutup sadece index'i geçiyoruz.
    mevzuatSearchResults = list;
    const totalNote = data.total && data.total > list.length
      ? `<div style="font-size:11px;color:var(--warn);margin-bottom:8px;">Toplam ${data.total} sonuçtan ${list.length} tanesi gösteriliyor — daha dar bir terimle aramayı dene.</div>`
      : '';
    box.innerHTML = `<div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:8px;">${list.length} sonuç</div>${totalNote}` +
      list.map((item, i) => {
        const title = mvzField(item, 'mevzuatAdi', 'mevzuat_adi', 'title', 'ad') || 'İsimsiz Mevzuat';
        const tur = mvzField(item, 'mevzuatTur', 'mevzuat_tur', 'type', 'tur') || '';
        const rgTarih = mvzField(item, 'resmiGazeteTarihi', 'resmi_gazete_tarihi', 'rgTarihi') || '';
        return `<div class="s-item" style="margin:0 0 4px;white-space:normal;height:auto;padding:10px 12px;" onclick="mevzuatShowTree(${i})">
          <span class="ico"><i class="fa-solid fa-scale-balanced"></i></span>
          <span>${title}<span style="display:block;font-size:10px;color:var(--t3);">${tur}${rgTarih ? ' — RG: ' + rgTarih : ''}</span></span>
        </div>`;
      }).join('');
  } catch (e) {
    box.innerHTML = `<div style="font-size:12px;color:var(--danger);padding:10px 0;">Bağlantı hatası — servis şu anda erişilemez olabilir.</div>`;
  }
}

let mevzuatCurrentItem = null;
let mevzuatSearchResults = [];

async function mevzuatShowTree(index) {
  const item = mevzuatSearchResults[index];
  if (!item) return;
  mevzuatCurrentItem = item;
  const mevzuatId = mvzField(item, 'mevzuatId', 'mevzuat_id', 'id');
  const mevzuatTur = mvzField(item, 'mevzuatTur', 'mevzuat_tur', 'type', 'tur') || '';
  const mevzuatNo = mvzField(item, 'mevzuatNo', 'mevzuat_no') || '';
  const title = mvzField(item, 'mevzuatAdi', 'mevzuat_adi', 'title', 'ad') || 'Mevzuat';
  const box = mevzuatGetPane();
  if (!mevzuatId) {
    toast('Bu mevzuatın kimliği alınamadı', 'fa-solid fa-triangle-exclamation');
    return;
  }
  box.innerHTML = `<div style="font-size:12px;color:var(--t3);padding:10px 0;"><i class="fa-solid fa-spinner fa-spin"></i> Tam metin yükleniyor…</div>`;

  try {
    const res = await fetch('/api/tools/mevzuat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'content', mevzuatId, mevzuatTur, mevzuatNo })
    });
    const data = await res.json();
    console.log('[Mevzuat] İçerik ham cevap:', data);
    if (!res.ok) {
      box.innerHTML = `<div style="font-size:12px;color:var(--danger);padding:10px 0;">${data.error || 'İçerik alınamadı.'}</div>`;
      return;
    }
    if (!data.result) {
      box.innerHTML = `<div style="font-size:12px;color:var(--t3);padding:10px 0;">İçerik alınamadı.</div>
        <div style="font-size:10px;color:var(--t3);margin-top:10px;padding:8px;background:var(--bg2);border-radius:6px;word-break:break-all;">Teşhis: ${(data._debug || 'boş').replace(/</g,'&lt;')}</div>`;
      return;
    }
    let text = typeof data.result === 'string' ? data.result : (data.result?.content || data.result?.text || JSON.stringify(data.result));

    // Ham PDF ikili verisi geldiyse (bazı türlerde hâlâ olabiliyor), bunu
    // kullanıcıya okunaksız metin olarak göstermek yerine net bir uyarı ver.
    if (text && text.slice(0, 8).includes('%PDF')) {
      box.innerHTML = `
        <div style="cursor:pointer;color:var(--t3);font-size:12px;margin-bottom:10px;" onclick="mevzuatSearch()"><i class="fa-solid fa-arrow-left"></i> Arama Sonuçlarına Dön</div>
        <div style="font-family:'Instrument Serif',serif;font-size:16px;margin-bottom:10px;">${title}</div>
        <div style="font-size:12px;color:var(--t3);padding:10px 0;">Bu belge için metin çıkarma şu an başarısız oluyor (servis ham PDF verisi döndürdü). Bu, "${mevzuatTur}" türü için bilinen bir sınır.</div>
        <a href="https://www.google.com/search?q=site:mevzuat.gov.tr+${encodeURIComponent(title)}" target="_blank" rel="noopener" style="color:var(--gold);font-size:12px;">mevzuat.gov.tr'de orijinalini ara ↗</a>
      `;
      return;
    }

    box.innerHTML = `
      <div style="cursor:pointer;color:var(--t3);font-size:12px;margin-bottom:10px;" onclick="mevzuatSearch()"><i class="fa-solid fa-arrow-left"></i> Arama Sonuçlarına Dön</div>
      <div style="font-family:'Instrument Serif',serif;font-size:16px;margin-bottom:10px;">${title}</div>
      <div style="white-space:pre-wrap;font-size:13px;background:var(--bg2);border-radius:var(--r);padding:14px;line-height:1.6;max-height:500px;overflow-y:auto;">${(text || '').replace(/</g, '&lt;')}</div>
      <button class="pop-cta-btn b" style="width:100%;margin-top:10px;" onclick="mevzuatCopyContent()"><i class="fa-solid fa-copy"></i><span>Kopyala</span></button>
      ${text && text.length < 600 ? `
        <div class="ic" style="margin-top:10px;"><div class="ic-t"><i class="fa-solid fa-triangle-exclamation"></i> Kısa görünüyor</div><p>Bu metin eksik/kısa gelmiş olabilir (bazı belgelerde ek/tablo kısmı otomatik okunamıyor). Orijinalini kontrol etmek için: <a href="https://www.google.com/search?q=site:mevzuat.gov.tr+${encodeURIComponent(title)}" target="_blank" rel="noopener" style="color:var(--gold);">mevzuat.gov.tr'de ara ↗</a></p></div>
      ` : ''}
    `;
    box.dataset.currentText = text;
  } catch (e) {
    box.innerHTML = `<div style="font-size:12px;color:var(--danger);padding:10px 0;">Bağlantı hatası.</div>`;
  }
}

function mevzuatCopyContent() {
  const box = mevzuatGetPane();
  const text = box?.dataset.currentText;
  if (!text) return;
  navigator.clipboard?.writeText(text).then(() => toast('Panoya kopyalandı', 'fa-solid fa-check', true));
}
