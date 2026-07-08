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
      badge: 'g', badgeText: 'Mevzuat.gov.tr · Resmi Gazete', titleHtml: 'Mevzuat <em class="g">Arama</em>',
      desc: 'Kanun, yönetmelik ve tebliğlerde anlık arama yapın.',
      btnClass: 'g', btnIco: 'fa-book-open-reader', btnLbl: 'Mevzuatta Ara',
      body: `<div class="fg"><div class="fl"><i class="fa-solid fa-book"></i> Tür</div><div class="sw"><select id="f-mevtur"><option>Kanun</option><option>Yönetmelik</option><option>Tebliğ</option><option>C.B. Kararnamesi</option></select></div></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-magnifying-glass"></i> Arama Terimi</div><input type="text" id="f-mevara" placeholder="Kıdem tazminatı, velayet, kira artışı…"></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-hashtag"></i> Kanun No <span class="opt">(opsiyonel)</span></div><input type="text" id="f-mevno" placeholder="4857, 6098…"></div>`,
      prompt: () => `"${document.getElementById('f-mevara')?.value || ''}" konusunda ${document.getElementById('f-mevtur')?.value || ''} ara. İlgili maddeleri düz dilde özetle, değişiklik geçmişini belirt. ${document.getElementById('f-mevno')?.value ? 'Kanun No: ' + document.getElementById('f-mevno').value : ''}`
    },
    sablon: {
      badge: 'g', badgeText: 'Metin Şablonları', titleHtml: 'Şablon <em class="g">Kütüphanesi</em>',
      desc: 'Sık kullandığınız dilekçe/ihtarname metinlerini burada saklayın.',
      btnClass: 'g', btnIco: 'fa-layer-group', btnLbl: '', hideCta: true,
      body: `<div id="tpl-box">Yükleniyor…</div>`,
      onOpen: () => tplOnOpen(),
      prompt: () => ''
    },
    durusma: {
      badge: 'g', badgeText: 'Celse Hazırlığı', titleHtml: 'Duruşma <em class="g">Hazırlık</em>',
      desc: 'Duruşma bilgilerini girin; strateji ve sorular oluşturulsun.',
      btnClass: 'g', btnIco: 'fa-person-chalkboard', btnLbl: 'Hazırlık Başlat',
      body: `<div class="fg"><div class="fl"><i class="fa-solid fa-calendar-day"></i> Duruşma Tarihi</div><input type="text" id="f-dtarih" placeholder="GG/AA/YYYY"></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-align-left"></i> Güncel Durum</div><textarea id="f-ddur" rows="4" placeholder="Son celse kararı, bekleyen adımlar…"></textarea></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-lightbulb"></i> İstenen Çıktı</div><div class="sw"><select id="f-dcikti"><option>Olası hakim soruları ve cevaplar</option><option>Tanık soru listesi</option><option>Kapanış beyanı taslağı</option><option>Kronolojik olay örgüsü</option></select></div></div>`,
      prompt: () => `${document.getElementById('f-dtarih')?.value || ''} tarihli duruşma için hazırlık yap. İstenen: ${document.getElementById('f-dcikti')?.value || ''}.\n\nGüncel durum:\n${document.getElementById('f-ddur')?.value || ''}`
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
};

function fillQuickInstruction(prefix, type) {
  const el = document.getElementById(prefix + '-question');
  if (el && QUICK_INSTRUCTIONS[type]) {
    el.value = QUICK_INSTRUCTIONS[type];
    el.focus();
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
// Bu modülde ayrı bir sağ panel (detailPane) olmadığı için liste ve
// detay, aynı panel içinde (popBody) sırayla gösteriliyor.
// ══════════════════════════════════════════════════════
let tplSelectedId = null;

async function tplOnOpen() {
  tplSelectedId = null;
  await tplRenderList();
}

async function tplRenderList() {
  const box = document.getElementById('tpl-box');
  try {
    const res = await fetch('/api/templates');
    const data = await res.json();
    const templates = data.templates || [];

    if (!tplSelectedId) {
      box.innerHTML = `
        <div class="fg"><input type="text" id="tpl-title" placeholder="Şablon adı (ör. Kira İhtarnamesi)…"></div>
        <div class="fg"><textarea id="tpl-content" rows="5" placeholder="Şablon metnini buraya yazın…"></textarea></div>
        <button class="pop-cta-btn g" style="width:100%;margin-bottom:16px;" onclick="tplAdd()"><i class="fa-solid fa-plus"></i><span>Şablonu Kaydet</span></button>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:8px;">Şablonlarınız (${templates.length})</div>
        ${templates.length ? templates.map(t => `<div class="s-item" style="margin:0 0 4px;" onclick="tplView('${t.id}')">
          <span class="ico"><i class="fa-solid fa-file-lines"></i></span>${t.title}
        </div>`).join('') : '<div style="font-size:12px;color:var(--t3);">Henüz şablon eklenmedi.</div>'}
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
  toast('Şablon kaydedildi', 'fa-solid fa-check', true);
  tplRenderList();
}
