// Bu dosya SADECE 'Hesaplama Araçları' modülüne aittir.
// Bu modülü düzenlemek diğer modülleri (buro, uyap, hesap, uyelik) etkilemez.
window.CURRENT_MODULE = {
  key: 'hesap',
  label: 'Hesaplama Araçları',
  nameHtml: `Hesaplama <em class="p">Araçları</em>`,
  color: 'p',
  items: [{"id": "kidem", "icon": "fa-hand-holding-dollar", "name": "Kıdem Tazminatı"}, {"id": "ihbar", "icon": "fa-person-walking-arrow-right", "name": "İhbar Tazminatı"}, {"id": "mesai", "icon": "fa-clock-rotate-left", "name": "Fazla Mesai"}, {"id": "izin", "icon": "fa-umbrella-beach", "name": "Yıllık İzin"}, {"id": "nafaka", "icon": "fa-children", "name": "Nafaka Tahmini"}, {"id": "faiz", "icon": "fa-percent", "name": "Yasal Faiz"}, {"id": "gecikme", "icon": "fa-arrow-trend-up", "name": "Gecikme Faizi"}, {"id": "kira", "icon": "fa-building", "name": "Kira Artış Hesabı"}, {"id": "malpay", "icon": "fa-scale-unbalanced-flip", "name": "Mal Paylaşımı"}, {"id": "icra", "icon": "fa-gavel", "name": "İcra Masrafları"}, {"id": "za", "icon": "fa-hourglass-half", "name": "Zamanaşımı Takvimi"}],
  popups: {
  kidem:{
    badge:'p', badgeText:'İş K. Md.14 · 2026 Tavanı', titleHtml:'Kıdem <em class="p">Tazminatı</em>',
    desc:'İşe giriş, çıkış ve maaş girin; net kıdem tazminatı hesaplansın.',
    btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla',
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
      </div>`,
    prompt: ()=>`Kıdem tazminatı hesaplama sonucu: ${document.getElementById('k-top')?.textContent||''}. Kıdem süresi: ${document.getElementById('k-r1')?.textContent||''}. Hukuki dayanak ve müvekkile açıklama yaz.`
  },
  ihbar:{
    badge:'p', badgeText:'İş K. Md.17', titleHtml:'İhbar <em class="p">Tazminatı</em>',
    desc:'Kıdeme göre ihbar süresi ve tazminatı hesaplayın.',
    btnClass:'p', btnIco:'fa-calculator', btnLbl:'Hesapla',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-calendar-plus"></i> İşe Giriş</div><input type="text" id="i-giris" placeholder="GG/AA/YYYY" oninput="cIhbar()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-calendar-xmark"></i> Çıkış</div><input type="text" id="i-cikis" placeholder="GG/AA/YYYY" oninput="cIhbar()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Brüt Günlük Ücret (TL)</div><input type="text" id="i-gun" placeholder="1500" oninput="cIhbar()"></div>
      <div class="cr" id="i-res">
        <div class="cr-lbl">İhbar Tazminatı</div>
        <div class="cr-val" id="i-top">—</div>
        <div class="cr-rows">
          <div class="cr-row"><span>Yasal ihbar süresi</span><span id="i-r1">—</span></div>
          <div class="cr-row"><span>Hesap</span><span id="i-r2">—</span></div>
        </div>
      </div>`,
    prompt: ()=>`İhbar tazminatı hesaplama sonucu: ${document.getElementById('i-top')?.textContent||''}. Yasal süre: ${document.getElementById('i-r1')?.textContent||''}. Hukuki açıklama yaz.`
  },
  mesai:{badge:'p',badgeText:'İş K. Md.41',titleHtml:'Fazla <em class="p">Mesai</em>',desc:'Fazla çalışma saatlerini girin; zamlı ücret hesaplansın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Brüt Saatlik Ücret (TL)</div><input type="text" id="ms-s" placeholder="188" oninput="cMesai()"></div><div class="fg"><div class="fl">Haftalık Fazla Saat</div><input type="text" id="ms-h" placeholder="10" oninput="cMesai()"></div><div class="fg"><div class="fl">Kaç Ay</div><input type="text" id="ms-a" placeholder="12" oninput="cMesai()"></div><div class="fg"><div class="fl">Zam Oranı</div><div class="sw"><select id="ms-o" onchange="cMesai()"><option value="1.5">%50 — Hafta içi</option><option value="2">%100 — Tatil</option></select></div></div><div class="cr" id="ms-res"><div class="cr-lbl">Fazla Mesai Alacağı</div><div class="cr-val" id="ms-top">—</div><div class="cr-rows"><div class="cr-row"><span>Toplam saat</span><span id="ms-r1">—</span></div></div></div>`,prompt:()=>`Fazla mesai alacağı: ${document.getElementById('ms-top')?.textContent||''}. Hukuki açıklama yaz.`},
  izin:{badge:'p',badgeText:'İş K. Md.53',titleHtml:'Yıllık <em class="p">İzin</em>',desc:'Kıdeme göre yıllık izin hakkını hesaplayın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">İşe Giriş</div><input type="text" id="iz-g" placeholder="GG/AA/YYYY" oninput="cIzin()"></div><div class="fg"><div class="fl">Yaş</div><input type="text" id="iz-y" placeholder="35" oninput="cIzin()"></div><div class="fg"><div class="fl">Kullanılan İzin (gün)</div><input type="text" id="iz-k" placeholder="0" oninput="cIzin()"></div><div class="cr" id="iz-res"><div class="cr-lbl">İzin Hakkı</div><div class="cr-val" id="iz-top">—</div><div class="cr-rows"><div class="cr-row"><span>Yasal hak</span><span id="iz-r1">—</span></div><div class="cr-row"><span>Kullanılmamış</span><span id="iz-r2">—</span></div></div></div>`,prompt:()=>`Yıllık izin hakkı hesaplama: ${document.getElementById('iz-top')?.textContent||''}. Hukuki dayanak açıkla.`},
  nafaka:{
    badge:'p', badgeText:'TMK Md.169/175/182', titleHtml:'Nafaka <em class="p">Tahmini</em>',
    desc:'Tarafların gelir durumuna göre nafaka tahmini yapın.',
    btnClass:'p', btnIco:'fa-calculator', btnLbl:'Nafaka Tahmini Al',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-layer-group"></i> Nafaka Türü</div><div class="sw"><select id="n-tur"><option>Tedbir Nafakası</option><option>Yoksulluk Nafakası</option><option>İştirak Nafakası</option></select></div></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Talep Eden Net Geliri (TL)</div><input type="text" id="n-tal" placeholder="15000"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Karşı Taraf Net Geliri (TL)</div><input type="text" id="n-kar" placeholder="45000"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-children"></i> Çocuk Sayısı</div><input type="text" id="n-coc" placeholder="1"></div>
      <div class="ic"><div class="ic-t"><i class="fa-solid fa-triangle-exclamation"></i> Not</div><p>Bu tahmin rehber niteliğindedir. Hâkim somut koşulları değerlendirir.</p></div>`,
    prompt: ()=>`${document.getElementById('n-tur')?.value||''} tahmini. Talep eden geliri: ${document.getElementById('n-tal')?.value||''} TL, karşı taraf: ${document.getElementById('n-kar')?.value||''} TL, çocuk sayısı: ${document.getElementById('n-coc')?.value||'0'}. TMK hükümlerine ve Yargıtay içtihatlarına göre değerlendir.`
  },
  faiz:{
    badge:'p', badgeText:'TBK Md.88 · TCMB Oranları', titleHtml:'Yasal <em class="p">Faiz</em>',
    desc:'Alacak ve tarih aralığı girin; işlemiş faiz hesaplansın.',
    btnClass:'p', btnIco:'fa-calculator', btnLbl:'Faiz Hesapla',
    body:`<div class="fg"><div class="fl"><i class="fa-solid fa-turkish-lira-sign"></i> Asıl Alacak (TL)</div><input type="text" id="f-asl" placeholder="100000" oninput="cFaiz()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-calendar-plus"></i> Başlangıç Tarihi</div><input type="text" id="f-bas" placeholder="GG/AA/YYYY" oninput="cFaiz()"></div>
      <div class="fg"><div class="fl"><i class="fa-solid fa-percent"></i> Faiz Türü</div><div class="sw"><select id="f-ftur" onchange="cFaiz()"><option value="9">Yasal — %9</option><option value="19.5">Ticari — %19.5</option></select></div></div>
      <div class="cr" id="f-res">
        <div class="cr-lbl">Hesaplanan Faiz</div>
        <div class="cr-val" id="f-top">—</div>
        <div class="cr-rows">
          <div class="cr-row"><span>Süre</span><span id="f-r1">—</span></div>
          <div class="cr-row"><span>Asıl + Faiz</span><span id="f-r2">—</span></div>
        </div>
      </div>`,
    prompt: ()=>`Yasal faiz hesaplama sonucu: ${document.getElementById('f-top')?.textContent||''}. Toplam: ${document.getElementById('f-r2')?.textContent||''}. Hukuki dayanak açıkla.`
  },
  gecikme:{badge:'p',badgeText:'TBK Md.120 · Temerrüt',titleHtml:'Gecikme <em class="p">Faizi</em>',desc:'Temerrüt tarihinden itibaren gecikme faizi hesaplayın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Borç Miktarı (TL)</div><input type="text" id="gf-b" placeholder="50000" oninput="cGecikme()"></div><div class="fg"><div class="fl">Temerrüt Tarihi</div><input type="text" id="gf-t" placeholder="GG/AA/YYYY" oninput="cGecikme()"></div><div class="fg"><div class="fl">Tür</div><div class="sw"><select id="gf-o" onchange="cGecikme()"><option value="9">Yasal %9</option><option value="19.5">Ticari %19.5</option></select></div></div><div class="cr" id="gf-res"><div class="cr-lbl">Gecikme Faizi</div><div class="cr-val" id="gf-top">—</div><div class="cr-rows"><div class="cr-row"><span>Süre</span><span id="gf-r1">—</span></div><div class="cr-row"><span>Toplam</span><span id="gf-r2">—</span></div></div></div>`,prompt:()=>`Gecikme faizi: ${document.getElementById('gf-top')?.textContent||''}. Toplam borç+faiz: ${document.getElementById('gf-r2')?.textContent||''}.`},
  kira:{badge:'p',badgeText:'TBK Md.344',titleHtml:'Kira Artış <em class="p">Hesabı</em>',desc:'TÜFE oranıyla yasal azami kira artışını hesaplayın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Mevcut Kira (TL/ay)</div><input type="text" id="ka-k" placeholder="15000" oninput="cKira()"></div><div class="fg"><div class="fl">TÜFE Oranı (%)</div><input type="text" id="ka-t" placeholder="48.5" oninput="cKira()"></div><div class="cr" id="ka-res"><div class="cr-lbl">Yeni Azami Kira</div><div class="cr-val" id="ka-top">—</div><div class="cr-rows"><div class="cr-row"><span>Artış miktarı</span><span id="ka-r1">—</span></div></div></div>`,prompt:()=>`Kira artış hesabı: mevcut ${document.getElementById('ka-k')?.value||''}TL, yeni azami: ${document.getElementById('ka-top')?.textContent||''}. TBK 344 açıkla.`},
  malpay:{badge:'p',badgeText:'TMK Md.218-241',titleHtml:'Mal <em class="p">Paylaşımı</em>',desc:'Edinilmiş mallara katılma alacağını hesaplayın.',btnClass:'p',btnIco:'fa-scale-unbalanced-flip',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Evlilik Tarihi</div><input type="text" id="mp-g" placeholder="GG/AA/YYYY"></div><div class="fg"><div class="fl">Bitiş Tarihi</div><input type="text" id="mp-b" placeholder="GG/AA/YYYY"></div><div class="fg"><div class="fl">Taraf A Edinilmiş Mallar (TL)</div><input type="text" id="mp-a" placeholder="500000"></div><div class="fg"><div class="fl">Taraf B Edinilmiş Mallar (TL)</div><input type="text" id="mp-b2" placeholder="200000"></div><div class="ic"><div class="ic-t"><i class="fa-solid fa-triangle-exclamation"></i> Not</div><p>Kişisel mallar (miras, bağış) dahil edilmez.</p></div>`,prompt:()=>`TMK Md.218-241 edinilmiş mallara katılma: Taraf A: ${document.getElementById('mp-a')?.value||''} TL, Taraf B: ${document.getElementById('mp-b2')?.value||''} TL. Katılma alacağını hesapla ve açıkla.`},
  icra:{badge:'p',badgeText:'İİK · 2026 Tarife',titleHtml:'İcra <em class="p">Masrafları</em>',desc:'Takip türüne göre icra masraflarını hesaplayın.',btnClass:'p',btnIco:'fa-calculator',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Takip Türü</div><div class="sw"><select id="ic-t"><option>İlamsız icra</option><option>İlamlı icra</option><option>Kambiyo senedi</option></select></div></div><div class="fg"><div class="fl">Alacak Miktarı (TL)</div><input type="text" id="ic-a" placeholder="75000"></div>`,prompt:()=>`İİK 2026 tarife: ${document.getElementById('ic-t')?.value||''}, alacak ${document.getElementById('ic-a')?.value||''} TL. Toplam icra masrafları ve harçları hesapla.`},
  za:{badge:'p',badgeText:'TBK · TCK · İdare',titleHtml:'Zamanaşımı <em class="p">Takvimi</em>',desc:'Olay tarihini girin; zamanaşımı dolum tarihini öğrenin.',btnClass:'p',btnIco:'fa-hourglass-half',btnLbl:'Hesapla',body:`<div class="fg"><div class="fl">Hukuki Konu</div><div class="sw"><select id="za-t"><option value="10">Genel alacak — 10 yıl</option><option value="5">Kıdem/Fazla mesai — 5 yıl</option><option value="5">Kira alacağı — 5 yıl</option><option value="2">Haksız fiil — 2/10 yıl</option><option value="3">Tüketici — 3 yıl</option><option value="0.164">İdari dava — 60 gün</option></select></div></div><div class="fg"><div class="fl">Hakkın Doğduğu Tarih</div><input type="text" id="za-d" placeholder="GG/AA/YYYY" oninput="cZa()"></div><div class="cr" id="za-res"><div class="cr-lbl">Zamanaşımı Dolum Tarihi</div><div class="cr-val" id="za-top" style="font-size:19px">—</div><div class="cr-rows"><div class="cr-row"><span>Kalan süre</span><span id="za-r1" style="color:var(--warn)">—</span></div></div></div>`,prompt:()=>`Zamanaşımı takvimi: dolum tarihi ${document.getElementById('za-top')?.textContent||''}. Kalan: ${document.getElementById('za-r1')?.textContent||''}. Hukuki öneri ver.`}
  }
};

// ── Bu modüle özel hesaplama fonksiyonları ──
function fmt(n){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(n);}
function pDate(s){if(!s)return null;const p=s.split('/');if(p.length!==3)return null;return new Date(+p[2],+p[1]-1,+p[0]);}
function daysBetween(d1,d2){return Math.floor((d2-d1)/(86400000));}

function cKidem(){
  const g=pDate(document.getElementById('k-giris')?.value);
  const c=pDate(document.getElementById('k-cikis')?.value);
  const m=parseFloat((document.getElementById('k-maas')?.value||'0').replace(/\D/g,''));
  if(!g||!c||!m)return;
  const days=daysBetween(g,c);const yil=days/365;
  const tavan=41660;const baz=Math.min(m,tavan);
  const net=baz*yil;
  document.getElementById('k-res').style.display='block';
  document.getElementById('k-top').textContent=fmt(net);
  document.getElementById('k-r1').textContent=Math.floor(yil)+' yıl '+Math.floor((yil%1)*12)+' ay';
  document.getElementById('k-r2').textContent=m>tavan?'Tavan uygulandı':'Tavan aşılmadı';
}
function cIhbar(){
  const g=pDate(document.getElementById('i-giris')?.value);
  const c=pDate(document.getElementById('i-cikis')?.value);
  const gun=parseFloat((document.getElementById('i-gun')?.value||'0').replace(/\D/g,''));
  if(!g||!c||!gun)return;
  const yil=Math.floor(daysBetween(g,c)/365);
  const sure=yil<6?2:yil<18?4:yil<36?6:8;
  const net=gun*sure*7;
  document.getElementById('i-res').style.display='block';
  document.getElementById('i-top').textContent=fmt(net);
  document.getElementById('i-r1').textContent=sure+' hafta ('+sure*7+' gün)';
  document.getElementById('i-r2').textContent=sure*7+' × '+fmt(gun);
}
function cFaiz(){
  const a=parseFloat((document.getElementById('f-asl')?.value||'0').replace(/\D/g,''));
  const b=pDate(document.getElementById('f-bas')?.value);
  const o=parseFloat(document.getElementById('f-ftur')?.value||'9');
  if(!a||!b)return;
  const gun=daysBetween(b,new Date());
  const fz=a*(o/100)*(gun/365);
  document.getElementById('f-res').style.display='block';
  document.getElementById('f-top').textContent=fmt(fz);
  document.getElementById('f-r1').textContent=gun+' gün';
  document.getElementById('f-r2').textContent=fmt(a+fz);
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
  let hak=yil<5?14:yil<15?20:26;
  if(y<18||y>=50)hak=Math.max(hak,20);
  document.getElementById('iz-res').style.display='block';
  document.getElementById('iz-top').textContent=(hak-k)+' gün kullanılmamış';
  document.getElementById('iz-r1').textContent=hak+' gün/yıl';
  document.getElementById('iz-r2').textContent=(hak-k)+' gün';
}
function cGecikme(){
  const b=parseFloat((document.getElementById('gf-b')?.value||'0').replace(/\D/g,''));
  const t=pDate(document.getElementById('gf-t')?.value);
  const o=parseFloat(document.getElementById('gf-o')?.value||'9');
  if(!b||!t)return;
  const gun=daysBetween(t,new Date());
  const fz=b*(o/100)*(gun/365);
  document.getElementById('gf-res').style.display='block';
  document.getElementById('gf-top').textContent=fmt(fz);
  document.getElementById('gf-r1').textContent=gun+' gün';
  document.getElementById('gf-r2').textContent=fmt(b+fz);
}
function cKira(){
  const k=parseFloat((document.getElementById('ka-k')?.value||'0').replace(/\D/g,''));
  const t=parseFloat(document.getElementById('ka-t')?.value||'0');
  if(!k||!t)return;
  const artis=k*(t/100);
  document.getElementById('ka-res').style.display='block';
  document.getElementById('ka-top').textContent=fmt(k+artis)+'/ay';
  document.getElementById('ka-r1').textContent=fmt(artis);
}
function cZa(){
  const t=pDate(document.getElementById('za-d')?.value);
  const sur=parseFloat(document.getElementById('za-t')?.value||'10');
  if(!t)return;
  const bit=new Date(t);
  bit.setFullYear(bit.getFullYear()+Math.floor(sur));
  if(sur%1)bit.setDate(bit.getDate()+Math.round((sur%1)*365));
  const kal=daysBetween(new Date(),bit);
  document.getElementById('za-res').style.display='block';
  document.getElementById('za-top').textContent=bit.toLocaleDateString('tr-TR');
  const r=document.getElementById('za-r1');
  r.textContent=kal>0?kal+' gün kaldı':'⚠️ SÜRE DOLDU';
  r.style.color=kal<=0?'var(--danger)':kal<=90?'var(--warn)':'var(--success)';
}
