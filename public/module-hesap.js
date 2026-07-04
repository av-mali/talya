// Bu dosya SADECE 'Hesaplama Araçları' modülüne aittir.
// Bu modülü düzenlemek diğer modülleri (buro, uyap, hesap, uyelik) etkilemez.
//
// ÖNEMLİ: Kıdem tavanı, yasal/ticari faiz oranı ve kira TÜFE oranı artık
// kodda SABİT DEĞİL — /api/constants üzerinden veritabanından okunuyor.
// Bu rakamları değiştirmek için Yönetici Paneli > Hukuki Sabitler
// kullanılır, kod değişikliği gerekmez.
window.CURRENT_MODULE = {
  key: 'hesap',
  label: 'Hesaplama Araçları',
  nameHtml: `Hesaplama <em class="p">Araçları</em>`,
  color: 'p',
  items: [
    {"id": "kidem", "icon": "fa-hand-holding-dollar", "name": "Kıdem Tazminatı"},
    {"id": "ihbar", "icon": "fa-person-walking-arrow-right", "name": "İhbar Tazminatı"},
    {"id": "mesai", "icon": "fa-clock-rotate-left", "name": "Fazla Mesai"},
    {"id": "izin", "icon": "fa-umbrella-beach", "name": "Yıllık İzin"},
    {"id": "faiz", "icon": "fa-percent", "name": "Yasal Faiz"},
    {"id": "gecikme", "icon": "fa-arrow-trend-up", "name": "Gecikme Faizi"},
    {"id": "kira", "icon": "fa-building", "name": "Kira Artış Hesabı"},
    {"id": "za", "icon": "fa-hourglass-half", "name": "Zamanaşımı Takvimi"}
  ],
  popups: {
    kidem:{
      badge:'p', badgeText:'İş K. Md.14 · Güncel Tavan', titleHtml:'Kıdem <em class="p">Tazminatı</em>',
      desc:'İşe giriş, çıkış ve maaş girin; net kıdem tazminatı hesaplansın.',
      btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla', hideCta: true,
      body:`<div class="fg"><div class="fl"><i class="fa-solid fa-calendar-plus"></i> İşe Giriş</div><input type="text" id="k-giris" placeholder="GG/AA/YYYY" oninput="cKidem()"></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-calendar-xmark"></i> İşten Çıkış</div><input type="text" id="k-cikis" placeholder="GG/AA/YYYY" oninput="cKidem()"></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Brüt Aylık Maaş (TL)</div><input type="text" id="k-maas" placeholder="45000" oninput="cKidem()"></div>
        <div class="cr" id="k-res">
          <div class="cr-lbl">Kıdem Tazminatı</div>
          <div class="cr-val" id="k-top">—</div>
          <div class="cr-rows">
            <div class="cr-row"><span>Kıdem süresi</span><span id="k-r1">—</span></div>
            <div class="cr-row"><span>Tavan durumu</span><span id="k-r2">—</span></div>
          </div>
        </div>
        <div class="ic"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Not</div><p>Tavan tutarı yılda 2 kez (Ocak/Temmuz) güncellenir; burada güncel tavan kullanılır. Geçmiş tarihli fesihlerde o dönemin tavanı farklı olabilir.</p></div>`,
      prompt: () => ''
    },
    ihbar:{
      badge:'p', badgeText:'İş K. Md.17', titleHtml:'İhbar <em class="p">Tazminatı</em>',
      desc:'Kıdeme göre ihbar süresi ve tazminatı hesaplayın.',
      btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla', hideCta: true,
      body:`<div class="fg"><div class="fl"><i class="fa-solid fa-calendar-plus"></i> İşe Giriş</div><input type="text" id="i-giris" placeholder="GG/AA/YYYY" oninput="cIhbar()"></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-calendar-xmark"></i> Çıkış</div><input type="text" id="i-cikis" placeholder="GG/AA/YYYY" oninput="cIhbar()"></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Brüt Günlük Ücret (TL)</div><input type="text" id="i-gun" placeholder="1500" oninput="cIhbar()"></div>
        <div class="cr" id="i-res">
          <div class="cr-lbl">İhbar Tazminatı (Brüt)</div>
          <div class="cr-val" id="i-top">—</div>
          <div class="cr-rows">
            <div class="cr-row"><span>Yasal ihbar süresi</span><span id="i-r1">—</span></div>
            <div class="cr-row"><span>Hesap</span><span id="i-r2">—</span></div>
          </div>
        </div>
        <div class="ic"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Not</div><p>İhbar tazminatı, kıdem tazminatının aksine gelir vergisine ve damga vergisine tabidir; burada gösterilen brüt tutardır.</p></div>`,
      prompt: () => ''
    },
    mesai:{
      badge:'p', badgeText:'İş K. Md.41', titleHtml:'Fazla <em class="p">Mesai</em>',
      desc:'Fazla çalışma saatlerini girin; zamlı ücret hesaplansın.',
      btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla', hideCta: true,
      body:`<div class="fg"><div class="fl">Brüt Saatlik Ücret (TL)</div><input type="text" id="ms-s" placeholder="188" oninput="cMesai()"></div>
        <div class="fg"><div class="fl">Haftalık Fazla Saat</div><input type="text" id="ms-h" placeholder="10" oninput="cMesai()"></div>
        <div class="fg"><div class="fl">Kaç Ay</div><input type="text" id="ms-a" placeholder="12" oninput="cMesai()"></div>
        <div class="fg"><div class="fl">Zam Oranı</div><div class="sw"><select id="ms-o" onchange="cMesai()"><option value="1.5">%50 zamlı — fazla çalışma (hafta içi)</option><option value="2">%100 zamlı — hafta tatili/genel tatil çalışması</option></select></div></div>
        <div class="cr" id="ms-res"><div class="cr-lbl">Fazla Mesai Alacağı</div><div class="cr-val" id="ms-top">—</div><div class="cr-rows"><div class="cr-row"><span>Toplam saat</span><span id="ms-r1">—</span></div></div></div>`,
      prompt: () => ''
    },
    izin:{
      badge:'p', badgeText:'İş K. Md.53', titleHtml:'Yıllık <em class="p">İzin</em>',
      desc:'Kıdeme göre yıllık izin hakkını hesaplayın.',
      btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla', hideCta: true,
      body:`<div class="fg"><div class="fl">İşe Giriş</div><input type="text" id="iz-g" placeholder="GG/AA/YYYY" oninput="cIzin()"></div>
        <div class="fg"><div class="fl">Yaş</div><input type="text" id="iz-y" placeholder="35" oninput="cIzin()"></div>
        <div class="fg"><div class="fl">Kullanılan İzin (gün)</div><input type="text" id="iz-k" placeholder="0" oninput="cIzin()"></div>
        <div class="cr" id="iz-res"><div class="cr-lbl">İzin Hakkı</div><div class="cr-val" id="iz-top">—</div><div class="cr-rows"><div class="cr-row"><span>Yasal hak</span><span id="iz-r1">—</span></div><div class="cr-row"><span>Kullanılmamış</span><span id="iz-r2">—</span></div></div></div>`,
      prompt: () => ''
    },
    faiz:{
      badge:'p', badgeText:'TBK Md.88 · Güncel Oran', titleHtml:'Yasal <em class="p">Faiz</em>',
      desc:'Alacak ve tarih aralığı girin; işlemiş faiz hesaplansın.',
      btnClass:'p', btnIco:'fa-calculator', btnLbl:'Faiz Hesapla', hideCta: true,
      body:`<div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Asıl Alacak (TL)</div><input type="text" id="f-asl" placeholder="100000" oninput="cFaiz()"></div>
        <div class="fg"><div class="fl"><i class="fa-solid fa-calendar-plus"></i> Başlangıç Tarihi</div><input type="text" id="f-bas" placeholder="GG/AA/YYYY" oninput="cFaiz()"></div>
        <div class="cr" id="f-res">
          <div class="cr-lbl">Hesaplanan Faiz</div>
          <div class="cr-val" id="f-top">—</div>
          <div class="cr-rows">
            <div class="cr-row"><span>Uygulanan oran</span><span id="f-r0">—</span></div>
            <div class="cr-row"><span>Süre</span><span id="f-r1">—</span></div>
            <div class="cr-row"><span>Asıl + Faiz</span><span id="f-r2">—</span></div>
          </div>
        </div>
        <div class="ic"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Not</div><p>Yasal ve ticari işlerdeki temerrüt faizi şu an aynı orandan hesaplanıyor — çünkü ticari avans faizi yasal faizin altında kaldığı sürece kanun gereği yasal oran esas alınır.</p></div>`,
      prompt: () => ''
    },
    gecikme:{
      badge:'p', badgeText:'TBK Md.120 · Temerrüt', titleHtml:'Gecikme <em class="p">Faizi</em>',
      desc:'Temerrüt tarihinden itibaren gecikme faizi hesaplayın.',
      btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla', hideCta: true,
      body:`<div class="fg"><div class="fl">Borç Miktarı (TL)</div><input type="text" id="gf-b" placeholder="50000" oninput="cGecikme()"></div>
        <div class="fg"><div class="fl">Temerrüt Tarihi</div><input type="text" id="gf-t" placeholder="GG/AA/YYYY" oninput="cGecikme()"></div>
        <div class="cr" id="gf-res"><div class="cr-lbl">Gecikme Faizi</div><div class="cr-val" id="gf-top">—</div><div class="cr-rows"><div class="cr-row"><span>Uygulanan oran</span><span id="gf-r0">—</span></div><div class="cr-row"><span>Süre</span><span id="gf-r1">—</span></div><div class="cr-row"><span>Toplam</span><span id="gf-r2">—</span></div></div></div>`,
      prompt: () => ''
    },
    kira:{
      badge:'p', badgeText:'TBK Md.344 · Güncel TÜFE', titleHtml:'Kira Artış <em class="p">Hesabı</em>',
      desc:'Yasal azami kira artışı, güncel TÜFE oranıyla otomatik hesaplanır.',
      btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla', hideCta: true,
      body:`<div class="fg"><div class="fl">Mevcut Kira (TL/ay)</div><input type="text" id="ka-k" placeholder="15000" oninput="cKira()"></div>
        <div class="cr" id="ka-res"><div class="cr-lbl">Yeni Azami Kira</div><div class="cr-val" id="ka-top">—</div><div class="cr-rows"><div class="cr-row"><span>Uygulanan TÜFE oranı</span><span id="ka-r0">—</span></div><div class="cr-row"><span>Artış miktarı</span><span id="ka-r1">—</span></div></div></div>
        <div class="ic"><div class="ic-t"><i class="fa-solid fa-circle-info"></i> Not</div><p>2022-2024 arasında konut kiralarında geçerli olan %25 sınırlaması 1 Temmuz 2024'te tamamen kalktı — tek yasal sınır artık TÜFE 12 aylık ortalamasıdır. Bu oran her ay değiştiği için Yönetici Paneli'nden güncel tutulmalıdır.</p></div>`,
      prompt: () => ''
    },
    za:{
      badge:'p', badgeText:'TBK · İş K. · İdare', titleHtml:'Zamanaşımı <em class="p">Takvimi</em>',
      desc:'Olay tarihini girin; zamanaşımı/hak düşürücü süre dolum tarihini öğrenin.',
      btnClass:'p', btnIco:'fa-hourglass-half', btnLbl:'Hesapla', hideCta: true,
      body:`<div class="fg"><div class="fl">Hukuki Konu</div><div class="sw"><select id="za-t" onchange="cZa()">
          <option value="10">Genel alacak (TBK 146) — 10 yıl</option>
          <option value="5">Kıdem/ihbar/fazla mesai alacağı — 5 yıl</option>
          <option value="5-kira">Kira alacağı (TBK 147/6) — 5 yıl</option>
          <option value="haksizfiil">Haksız fiil (TBK 72) — 2 yıl / azami 10 yıl</option>
          <option value="0.164">İdari dava açma süresi (İYUK m.7) — 60 gün</option>
        </select></div></div>
        <div class="fg"><div class="fl">Hakkın Doğduğu / Öğrenildiği Tarih</div><input type="text" id="za-d" placeholder="GG/AA/YYYY" oninput="cZa()"></div>
        <div class="cr" id="za-res"><div class="cr-lbl" id="za-lbl">Zamanaşımı Dolum Tarihi</div><div class="cr-val" id="za-top" style="font-size:19px">—</div><div class="cr-rows"><div class="cr-row"><span>Kalan süre</span><span id="za-r1" style="color:var(--warn)">—</span></div><div class="cr-row" id="za-r2-row" style="display:none;"><span>Azami süre (olay tarihinden)</span><span id="za-r2">—</span></div></div></div>
        <div class="ic"><div class="ic-t"><i class="fa-solid fa-triangle-exclamation"></i> Not</div><p>Haksız fiilde kısa süre (2 yıl) zararın ve failin öğrenildiği tarihten, azami süre (10 yıl) ise fiilin işlendiği tarihten işler. İdari dava süresi teknik olarak zamanaşımı değil, hak düşürücü dava açma süresidir.</p></div>`,
      prompt: () => ''
    }
  }
};

// ── Bu modüle özel hesaplama fonksiyonları ──
function fmt(n){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(n);}
function pDate(s){if(!s)return null;const p=s.split('/');if(p.length!==3)return null;return new Date(+p[2],+p[1]-1,+p[0]);}
function daysBetween(d1,d2){return Math.floor((d2-d1)/(86400000));}

// Hukuki sabitler (kıdem tavanı, faiz oranı, kira TÜFE oranı) veritabanından
// çekilir. Sayfa açıldığında bir kere yüklenir, tüm hesaplayıcılar bunu kullanır.
let LEGAL_CONSTANTS = { kidemTavani: 73729.84, faizOrani: 24, kiraTufeOrani: 32.03 };

async function loadLegalConstants() {
  try {
    const res = await fetch('/api/constants');
    if (!res.ok) return;
    const data = await res.json();
    if (data.constants) LEGAL_CONSTANTS = data.constants;
  } catch (e) { /* varsayılan değerlerle devam */ }
}
// Modül yüklenir yüklenmez sabitleri çek.
loadLegalConstants();

function cKidem(){
  const g=pDate(document.getElementById('k-giris')?.value);
  const c=pDate(document.getElementById('k-cikis')?.value);
  const m=parseFloat((document.getElementById('k-maas')?.value||'0').replace(/\D/g,''));
  if(!g||!c||!m)return;
  const days=daysBetween(g,c);const yil=days/365;
  const tavan=LEGAL_CONSTANTS.kidemTavani;
  const baz=Math.min(m,tavan);
  const net=baz*yil;
  document.getElementById('k-res').style.display='block';
  document.getElementById('k-top').textContent=fmt(net);
  document.getElementById('k-r1').textContent=Math.floor(yil)+' yıl '+Math.floor((yil%1)*12)+' ay';
  document.getElementById('k-r2').textContent=m>tavan?('Tavan uygulandı ('+fmt(tavan)+')'):'Tavan aşılmadı';
}

function cIhbar(){
  const g=pDate(document.getElementById('i-giris')?.value);
  const c=pDate(document.getElementById('i-cikis')?.value);
  const gun=parseFloat((document.getElementById('i-gun')?.value||'0').replace(/\D/g,''));
  if(!g||!c||!gun)return;
  const totalDays=daysBetween(g,c);
  const months=totalDays/30.44; // yıl değil, AY bazında kıyaslama — İş K. 17 eşikleri ay/yıl karışık
  let sure;
  if(months<6) sure=2;
  else if(months<18) sure=4;
  else if(months<36) sure=6;
  else sure=8;
  const net=gun*sure*7;
  document.getElementById('i-res').style.display='block';
  document.getElementById('i-top').textContent=fmt(net);
  document.getElementById('i-r1').textContent=sure+' hafta ('+sure*7+' gün)';
  document.getElementById('i-r2').textContent=(sure*7)+' gün × '+fmt(gun);
}

function cMesai(){
  const s=parseFloat(document.getElementById('ms-s')?.value||'0');
  const h=parseFloat(document.getElementById('ms-h')?.value||'0');
  const a=parseFloat(document.getElementById('ms-a')?.value||'0');
  const o=parseFloat(document.getElementById('ms-o')?.value||'1.5');
  if(!s||!h||!a)return;
  const ts=h*4.33*a;const net=ts*s*o;
  document.getElementById('ms-res').style.display='block';
  document.getElementById('ms-top').textContent=fmt(net);
  document.getElementById('ms-r1').textContent=Math.round(ts)+' saat';
}

function cIzin(){
  const g=pDate(document.getElementById('iz-g')?.value);
  const y=parseInt(document.getElementById('iz-y')?.value||'0');
  const k=parseInt(document.getElementById('iz-k')?.value||'0');
  if(!g||!y)return;
  const yil=Math.floor(daysBetween(g,new Date())/365);
  // İş K. 53: 1-5 yıl (5 dahil) 14 gün; 5-15 yıl arası 20 gün; 15+ yıl 26 gün
  let hak=yil<=5?14:yil<15?20:26;
  if(y<18||y>=50)hak=Math.max(hak,20);
  document.getElementById('iz-res').style.display='block';
  document.getElementById('iz-top').textContent=(hak-k)+' gün kullanılmamış';
  document.getElementById('iz-r1').textContent=hak+' gün/yıl';
  document.getElementById('iz-r2').textContent=(hak-k)+' gün';
}

function cFaiz(){
  const a=parseFloat((document.getElementById('f-asl')?.value||'0').replace(/\D/g,''));
  const b=pDate(document.getElementById('f-bas')?.value);
  const o=LEGAL_CONSTANTS.faizOrani;
  if(!a||!b)return;
  const gun=daysBetween(b,new Date());
  const fz=a*(o/100)*(gun/365);
  document.getElementById('f-res').style.display='block';
  document.getElementById('f-top').textContent=fmt(fz);
  document.getElementById('f-r0').textContent='%'+o;
  document.getElementById('f-r1').textContent=gun+' gün';
  document.getElementById('f-r2').textContent=fmt(a+fz);
}

function cGecikme(){
  const b=parseFloat((document.getElementById('gf-b')?.value||'0').replace(/\D/g,''));
  const t=pDate(document.getElementById('gf-t')?.value);
  const o=LEGAL_CONSTANTS.faizOrani;
  if(!b||!t)return;
  const gun=daysBetween(t,new Date());
  const fz=b*(o/100)*(gun/365);
  document.getElementById('gf-res').style.display='block';
  document.getElementById('gf-top').textContent=fmt(fz);
  document.getElementById('gf-r0').textContent='%'+o;
  document.getElementById('gf-r1').textContent=gun+' gün';
  document.getElementById('gf-r2').textContent=fmt(b+fz);
}

function cKira(){
  const k=parseFloat((document.getElementById('ka-k')?.value||'0').replace(/\D/g,''));
  const t=LEGAL_CONSTANTS.kiraTufeOrani;
  if(!k)return;
  const artis=k*(t/100);
  document.getElementById('ka-res').style.display='block';
  document.getElementById('ka-top').textContent=fmt(k+artis)+'/ay';
  document.getElementById('ka-r0').textContent='%'+t;
  document.getElementById('ka-r1').textContent=fmt(artis);
}

function cZa(){
  const sel=document.getElementById('za-t').value;
  const t=pDate(document.getElementById('za-d')?.value);
  if(!t)return;

  const lbl=document.getElementById('za-lbl');
  const r2row=document.getElementById('za-r2-row');

  if(sel==='haksizfiil'){
    // Kısa süre: 2 yıl (öğrenmeden itibaren). Azami süre: 10 yıl (olaydan itibaren).
    const kisaBit=new Date(t); kisaBit.setFullYear(kisaBit.getFullYear()+2);
    const azamiBit=new Date(t); azamiBit.setFullYear(azamiBit.getFullYear()+10);
    const kal=daysBetween(new Date(),kisaBit);
    document.getElementById('za-res').style.display='block';
    lbl.textContent='Zamanaşımı Dolum Tarihi (2 yıllık kısa süre)';
    document.getElementById('za-top').textContent=kisaBit.toLocaleDateString('tr-TR');
    const r=document.getElementById('za-r1');
    r.textContent=kal>0?kal+' gün kaldı':'⚠️ KISA SÜRE DOLDU';
    r.style.color=kal<=0?'var(--danger)':kal<=90?'var(--warn)':'var(--success)';
    r2row.style.display='flex';
    document.getElementById('za-r2').textContent=azamiBit.toLocaleDateString('tr-TR')+' (azami 10 yıl)';
    return;
  }

  let sur=parseFloat(sel);
  const bit=new Date(t);
  bit.setFullYear(bit.getFullYear()+Math.floor(sur));
  if(sur%1)bit.setDate(bit.getDate()+Math.round((sur%1)*365));
  const kal=daysBetween(new Date(),bit);
  document.getElementById('za-res').style.display='block';
  lbl.textContent = sel==='0.164' ? 'Dava Açma Süresinin Son Günü' : 'Zamanaşımı Dolum Tarihi';
  document.getElementById('za-top').textContent=bit.toLocaleDateString('tr-TR');
  const r=document.getElementById('za-r1');
  r.textContent=kal>0?kal+' gün kaldı':'⚠️ SÜRE DOLDU';
  r.style.color=kal<=0?'var(--danger)':kal<=90?'var(--warn)':'var(--success)';
  r2row.style.display='none';
}
