// Arabuluculuk belgelerinin (Davet Mektubu, İlk Oturum Tutanağı, Son
// Tutanak) SABİT/DEĞİŞMEYEN kısımları — gerçek örnek belgelerden BİREBİR
// alınmıştır. Bu metinler AI'a hiç yazdırılmaz (halüsinasyon/hata riski
// olmasın diye) — sadece değişken alanlar (taraf bilgileri, tarihler) ve
// kısa anlatı paragrafları AI ile doldurulur, geri kalanı burada.
//
// NOT: Karşı taraf sayısı BİRDEN FAZLA olabilir (gerçek başvuru
// formlarında sık görülen bir durum) — bu yüzden karşı taraflar bir
// dizi (array) olarak tutulur ve her biri için ayrı bir "KARŞI TARAF"
// bloğu üretilir.

export type MediationParty = {
  tip?: string | null; // "sahis" | "tuzel"
  ad?: string | null;
  tcKimlik?: string | null;
  adres?: string | null;
  vergiMersis?: string | null;
  yetkiliAd?: string | null;
  vekilAd?: string | null;
  vekilBaroSicil?: string | null;
  telefon?: string | null;
};

export type MediationCaseData = {
  dosyaNo?: string | null;
  buroDosyaNo?: string | null;
  basvurucuTip?: string | null; // "sahis" | "tuzel"
  basvurucuAd?: string | null;
  basvurucuTC?: string | null;
  basvurucuVergiMersis?: string | null;
  basvurucuYetkiliAd?: string | null;
  basvurucuAdres?: string | null;
  basvurucuVekilAd?: string | null;
  basvurucuBaroSicil?: string | null;
  basvurucuTelefon?: string | null;
  uyusmazlikKonusu?: string | null;
  basvuruTarihi?: string | null;
  gorevlendirmeTarihi?: string | null;
  karsiTaraflar?: MediationParty[];
};

export type ArabulucuProfile = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  arabuluculukBurosu?: string | null;
  arabulucuSicilNo?: string | null;
  arabulucuUets?: string | null;
  arabulucuAdres?: string | null;
  arabulucuIban?: string | null;
};

// Belge başlıklarındaki "... HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA"
// satırını üretir. Çoğu uyuşmazlık türü "... Hukuku" ile bitiyor (İş
// Hukuku, Kira Hukuku vb.) — bu durumda "Hukuku" eki atılıp yerine
// "HUKUKUNDAN KAYNAKLANAN..." eklenir. Ama "Kat Mülkiyeti Kanunu" gibi
// bir KANUN adı seçilmişse "... KANUNU HUKUKUNDAN..." diye anlamsız bir
// tekrar oluşmasın diye "KANUNUNDAN KAYNAKLANAN..." bağlacı kullanılır
// (ör. "KAT MÜLKİYETİ KANUNUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA").
export function buildUyusmazlikBasligi(uyusmazlikTuru?: string | null): string {
  const raw = (uyusmazlikTuru || "").trim();
  if (!raw) return "…… HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA";
  const upper = raw.toLocaleUpperCase("tr-TR");
  if (/KANUNU$/.test(upper)) return `${upper}NDAN KAYNAKLANAN UYUŞMAZLIKLARDA`;
  const stripped = upper.replace(/\s*HUKUKU\s*$/, "").trim();
  return `${stripped || upper} HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA`;
}

// Son Tutanak'ın 4 olası sonucu — takvim/bildirim/gündem gibi belge
// ÜRETMEYEN yerlerde de aynı kısa etiketlerin gösterilmesi için tek bir
// yerden tanımlanır (yoksa her yerde ayrı ayrı elle eşlenirdi).
export function sonucKisaLabel(sonuc?: string | null): string {
  switch (sonuc) {
    case "anlasma":
      return "Anlaşma";
    case "kismi":
      return "Kısmi Anlaşma";
    case "gorusmesiz":
      return "Görüşme Yapılmadan Anlaşamama";
    case "anlasamama":
      return "Anlaşamama";
    default:
      return "Anlaşamama";
  }
}

export { stripMarkup } from "./richTextMarkup";

// Sabit metinlerimizdeki (HUAK bilgilendirmesi vb.) HER paragraf "\t" ile
// (satır başı girintisiyle) başlıyor — AI'ın ürettiği ya da kullanıcının
// yazdığı serbest metinler bu girintiyi hiç bilmiyor. Bu fonksiyon, bir
// metnin İÇİNDEKİ her paragrafın (boş satırla ayrılmış blokların) başına
// aynı girintiyi ekleyerek tüm sayfanın tutarlı görünmesini sağlar.
export function indentParagraphs(text: string): string {
  return text
    .split("\n\n")
    .map((para) => (para.startsWith("\t") ? para : "\t" + para))
    .join("\n\n");
}

// Bir isim alanının başına yanlışlıkla karışmış olabilecek 10-11 haneli
// TC Kimlik/Vergi No gibi rakam dizilerini temizler. SADECE isim/unvan
// alanları için kullanılır — VERİ KAYDEDİLİRKEN (API route'larında,
// basvurucuAd/p.ad kaydedilirken ve okunurken) çağrılır. Belge üretirken
// (v() içinde) ARTIK çağrılmıyor — bkz. v()'nin üstündeki not.
export function stripTcFromName(val?: string | null): string {
  if (!val) return "";
  return val.trim().replace(/^\d{10,11}\s+/, "");
}

// NOT (düzeltme): v() ESKİDEN her alanda (telefon, adres, TC no, vergi/
// mersis no, baro/sicil no dahil) stripTcFromName() çalıştırıyordu. Bu
// fonksiyon "10-11 haneli bir rakam dizisi + boşluk + BAŞKA metin" gören
// her alanın BAŞINDAKİ o rakam dizisini siliyor — isim alanları için
// doğru (TC no'nun isme karışması), ama bir TELEFON numarası da (05XX
// XXX XX XX -> boşluksuz yazılınca tam 11 hane) TC no ile AYNI uzunlukta
// olduğundan, telefon alanında numaranın yanına küçük bir not/ek metin
// varsa ("05321234567 (iş)" gibi) numaranın kendisi sessizce silinip
// sadece o ek metin kalıyordu — "telefon tutanağa eklenmiyor" şikayetinin
// kaynağı buydu. stripTcFromName SADECE isim alanlarında (ad/unvan)
// çağrılmalı; onlar zaten API katmanında (kaydederken ve okurken) ayrıca
// temizleniyor, o yüzden burada hiç çağırmaya gerek yok.
export function v(val?: string | null, fallback = "……………") {
  if (!val || !val.trim()) return fallback;
  // Başvuru formlarındaki "[Haksız Fiilden Kaynaklanan (Nisbi)]" gibi
  // ham köşeli parantezli metinleri de temizler.
  return val.trim().replace(/^\[|\]$/g, "").trim();
}

// Vekil adının önüne "Av. " ekler — ama kullanıcı vekil adını zaten
// "Av. ..." (ya da "Avukat ...") diye girmişse (form alanına öyle
// yazılmış ya da belgeden öyle çıkarılmışsa) ÖNCE o ön eki temizler.
// Aksi halde metnin dört ayrı yerinde "Av. " elle ekleniyor olduğundan
// "Av. Av. İsim Soyisim" gibi çift görünüyordu.
export function avLabel(val?: string | null): string {
  const clean = (val || "").trim().replace(/^Av(\.|ukat)?\s+/i, "");
  return clean ? `Av. ${clean}` : "";
}

function partiesList(c: MediationCaseData): MediationParty[] {
  return c.karsiTaraflar && c.karsiTaraflar.length ? c.karsiTaraflar : [{}];
}

// Bir karşı taraf bloğu (birden fazlaysa numaralanır: "KARŞI TARAF 1" vb.)
// NOT: Şahıs/tüzel ayrımına göre SADECE ilgili satırlar eklenir — ör.
// şahısta "Vergi/Mersis No" satırı hiç YAZILMAZ (boş bırakılıp gösterilmez,
// tamamen atlanır). Bu hem yanlış bilgi göstermeyi hem de gereksiz boşluk
// satırlarını önler.
function buildKarsiTarafBlock(p: MediationParty, index: number, total: number): string {
  const label = total > 1 ? `KARŞI TARAF ${index + 1}` : "KARŞI TARAF";
  const isTuzel = p.tip === "tuzel";
  const lines = [
    `\t${isTuzel ? "Unvanı" : "Adı ve Soyadı"}\t: ${v(p.ad)}`,
  ];
  if (isTuzel) {
    lines.push(`\tVergi/Mersis/Detsis No\t: ${v(p.vergiMersis)}`);
    if (p.yetkiliAd && p.yetkiliAd.trim()) lines.push(`\tŞirket Yetkilisi\t: ${v(p.yetkiliAd)}`);
  } else {
    lines.push(`\tT.C. Kimlik No\t: ${v(p.tcKimlik)}`);
  }
  lines.push(`\tAdres\t: ${v(p.adres)}`);
  if (p.vekilAd && p.vekilAd.trim()) {
    lines.push(`\tVekili\t: ${v(p.vekilAd)}`);
    if (p.vekilBaroSicil && p.vekilBaroSicil.trim()) lines.push(`\tBaro/Sicil No\t: ${v(p.vekilBaroSicil)}`);
  }
  lines.push(`\tTelefon\t: ${v(p.telefon)}`);

  return `**__${label}\t__**\t\t

${lines.join("\n")}
`;
}

// Üç belgede de ortak olan başlık bloğu (Arabuluculuk Bürosu, Arabulucu,
// Başvurucu, Karşı Taraf(lar), Uyuşmazlık Konusu, tarihler).
export function buildHeaderBlock(
  c: MediationCaseData,
  a: ArabulucuProfile,
  arabulucuLabel: string, // "ARABULUCU" veya "ARABULUCUNUN"
  extraLine?: string, // ör. "Arabuluculuk Sonucu\t\t\t: ANLAŞMA"
  // "Tutanağının Düzenlendiği Tarih" — VARSAYILAN olarak (bu parametre
  // verilmezse) arabulucunun görevlendirildiği tarihe düşer, ama bu
  // YANLIŞ bir varsayımdı: tutanak, GÖREVLENDİRME günü değil, GÖRÜŞMENİN
  // (toplantının/son tutanağın) yapıldığı gün düzenlenir. Çağıran taraf
  // (generate/route.ts) gerçek toplantı/tutanak tarihini buraya
  // "DD.MM.YYYY" formatında geçmeli.
  duzenlemeTarihi?: string
): string {
  const parties = partiesList(c);
  const karsiTarafBlocks = parties.map((p, i) => buildKarsiTarafBlock(p, i, parties.length)).join("\n");

  // Dosya Numarası satırı: başvuru (büro) dosya no'su varsa önce o,
  // sonra " - " ile resmi (Arabuluculuk Bilgi Sistemi) dosya no'su.
  const dosyaNoGosterim = c.buroDosyaNo && c.buroDosyaNo.trim()
    ? `${c.buroDosyaNo.trim()} - ${v(c.dosyaNo)}`
    : v(c.dosyaNo);

  const basvurucuTuzel = c.basvurucuTip === "tuzel";
  const basvurucuLines = [
    `\t${basvurucuTuzel ? "Unvanı" : "Adı Soyadı"}\t: ${v(c.basvurucuAd)}`,
  ];
  if (basvurucuTuzel) {
    basvurucuLines.push(`\tVergi/Mersis No\t: ${v(c.basvurucuVergiMersis)}`);
    if (c.basvurucuYetkiliAd && c.basvurucuYetkiliAd.trim()) basvurucuLines.push(`\tŞirket Yetkilisi\t: ${v(c.basvurucuYetkiliAd)}`);
  } else {
    basvurucuLines.push(`\tT.C. Kimlik No\t: ${v(c.basvurucuTC)}`);
  }
  basvurucuLines.push(`\tAdresi\t: ${v(c.basvurucuAdres)}`);
  if (c.basvurucuVekilAd && c.basvurucuVekilAd.trim()) {
    basvurucuLines.push(`\tVekili\t: ${v(c.basvurucuVekilAd)}`);
    if (c.basvurucuBaroSicil && c.basvurucuBaroSicil.trim()) basvurucuLines.push(`\tBaro/Sicil No\t: ${v(c.basvurucuBaroSicil)}`);
  }
  basvurucuLines.push(`\tTelefon\t: ${v(c.basvurucuTelefon)}`);

  return `**__ARABULUCULUK BÜROSU\t__**\t\t\t
 
\tArabuluculuk Bürosu\t: ${v(a.arabuluculukBurosu)}
 \tDosya Numarası\t: ${dosyaNoGosterim}

**__${arabulucuLabel}\t__**\t\t\t\t
\t
\tAdı ve Soyadı\t: ${v(a.name)}
\tSicil Numarası\t: ${v(a.arabulucuSicilNo)}
\tTelefon\t: ${v(a.phone)}
\tUETS\t: ${v(a.arabulucuUets)}
\tE-Posta\t: ${v(a.email)}

**__BAŞVURUCU\t__**\t\t
\t
${basvurucuLines.join("\n")}

${karsiTarafBlocks}
**__ARABULUCULUK KONUSU UYUŞMAZLIK__**

\t${buildUyusmazlikKonusuCumlesi(c)}

[[D]]**__Arabuluculuk Bürosuna Başvuru Tarihi:__**** ${v(c.basvuruTarihi)}**
[[D]]**__Arabulucunun Görevlendirildiği Tarih:__**** ${v(c.gorevlendirmeTarihi)}**
[[D]]**__Tutanağının Düzenlendiği Tarih:__**** ${v(duzenlemeTarihi || c.gorevlendirmeTarihi)}**${extraLine ? "\n" + extraLine : ""}
`;
}

// Uyuşmazlık konusu artık kullanıcının yazdığı metin OLDUĞU GİBİ
// yapıştırılmaz — resmi bir başvuru cümlesi kalıbına yerleştirilir:
// "Başvurucu [AD] ve vekili Av. [VEKIL] tarafından yapılan "[KONU]"
// konulu başvurudur."
function buildUyusmazlikKonusuCumlesi(c: MediationCaseData): string {
  const basvurucuAd = v(c.basvurucuAd);
  const vekilCumle = c.basvurucuVekilAd && c.basvurucuVekilAd.trim()
    ? ` ve vekili ${avLabel(c.basvurucuVekilAd)}`
    : "";
  const konu = v(c.uyusmazlikKonusu, "……………");
  return `Başvurucu ${basvurucuAd}${vekilCumle} tarafından yapılan "${konu}" konulu başvurudur.`;
}

// Bir imzacının satırı, aynı satırdaki diğer imzacılarla birlikte dar
// sekme sütunlarına sığmayacak kadar uzunsa (ör. tek "Vekili" alanına
// birden fazla avukadın adı/baro no'su sıkışmışsa — "Av. X Baro-1 / Av.
// Y Baro-2" gibi) bu eşiği aşar. Böyle bir isim başka imzacılarla AYNI
// satıra zorlanırsa, o hücre taşıp aynı satırdaki diğer isimlerin VE alt
// satırdaki rol/imza satırlarının hizasını da bozuyordu (gerçek bir
// örnekte görüldü) — bu yüzden bu tür isimler KENDİ satırında yalnız
// bırakılır.
export const SIGN_OVERFLOW_THRESHOLD = 34;

// Kalan (taşmayan) imzacılar 3'lü satırlara MÜMKÜN OLDUĞUNCA DENGELİ
// dağıtılır — ör. 4 kişi varsa 3+1 (biri yalnız/"öksüz" kalır) DEĞİL,
// 2+2 şeklinde bölünür. maxPerRow'u aşmayan en dengeli dağılım budur.
export function balancedRows<T>(items: T[], maxPerRow: number): T[][] {
  if (!items.length) return [];
  const rowCount = Math.ceil(items.length / maxPerRow);
  const base = Math.floor(items.length / rowCount);
  let extra = items.length % rowCount;
  const rows: T[][] = [];
  let idx = 0;
  for (let r = 0; r < rowCount; r++) {
    const size = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    rows.push(items.slice(idx, idx + size));
    idx += size;
  }
  return rows;
}

// "Görüşme Yapılmadan Anlaşamama" durumunda toplantıya gelmeyen/kendisine
// ulaşılamayan tarafın imza satırı tutanağa hiç açılmaz — bu yüzden
// buildSignatureBlock'a opsiyonel bir "kimler katıldı" bilgisi geçilebilir.
// Belirtilmezse (davet/ilk oturum/anlaşma gibi tüm normal akışlarda
// olduğu gibi) herkes katılmış varsayılır — geriye dönük uyum bozulmaz.
export type SignatureAttendance = {
  basvurucu?: boolean; // varsayılan true
  karsiTaraflar?: boolean[]; // index sırası partiesList(c) ile aynı, varsayılan hepsi true
};

// İmza bloğu — Başvurucu tarafında vekil varsa vekil adı + "Başvurucu
// Vekili", yoksa başvurucunun kendisi; her karşı taraf için de aynı
// mantıkla (vekil / şirket yetkilisi / kendisi) ayrı bir imza alanı.
// NOT: Orijinal örnek belgelerde imza SATIRLARI (isim + rol + imza) 3'e
// kadar TEK satırda yan yana durur; isimler KALIN yazılır, roller değil.
export function buildSignatureBlock(c: MediationCaseData, a: ArabulucuProfile, attendance?: SignatureAttendance): string {
  const basvurucuKatildi = attendance?.basvurucu !== false;
  const basvurucuSign = c.basvurucuVekilAd
    ? { name: c.basvurucuVekilAd, role: "Başvurucu Vekili" }
    : { name: v(c.basvurucuAd), role: "Başvurucu" };

  const parties = partiesList(c);
  const karsiSigns = parties
    .map((p, i) => {
      const suffix = parties.length > 1 ? ` ${i + 1}` : "";
      const katildi = attendance?.karsiTaraflar?.[i] !== false;
      if (!katildi) return null;
      if (p.vekilAd) return { name: p.vekilAd, role: `Karşı Taraf${suffix} Vekili` };
      if (p.yetkiliAd) return { name: p.yetkiliAd, role: `Karşı Taraf${suffix} (Şirket Yetkilisi)` };
      return { name: v(p.ad), role: `Karşı Taraf${suffix}` };
    })
    .filter((s): s is { name: string; role: string } => s !== null);

  const arabulucuSign = { name: `Arb. ${v(a.name)}`, role: `(Sicil No: ${v(a.arabulucuSicilNo)})` };
  const allSigns = [...(basvurucuKatildi ? [basvurucuSign] : []), ...karsiSigns, arabulucuSign];

  // Önce kısa/normal isimleri (sırası korunarak) ayrı bir kümede topla ve
  // dengeli 3'lü gruplar hâlinde diz; taşacak kadar uzun isimler ise HİÇ
  // BİR KISA İSİMLE AYNI SATIRA ZORLANMADAN, kendi (tek kişilik)
  // satırlarında, en sona eklenir.
  const shortSigns = allSigns.filter((s) => s.name.length <= SIGN_OVERFLOW_THRESHOLD);
  const longSigns = allSigns.filter((s) => s.name.length > SIGN_OVERFLOW_THRESHOLD);
  const rows: { name: string; role: string }[][] = balancedRows(shortSigns, 3);
  for (const s of longSigns) rows.push([s]);

  // NOT: Her satırın BAŞINA da bir "\t" eklenir — böylece 1. sütun da
  // (2./3. sütunlar gibi) kendi sekme durağında ORTALANIR; eskiden ilk
  // isim hizasız biçimde doğrudan sayfa kenarından (sola yaslı) başlıyordu,
  // bu da özellikle tek kişilik (taşan-uzun-isim) satırlarda ve 2 kişilik
  // satırlarda sayfanın soluna YAPIŞIK görünmesine yol açıyordu. udf.ts /
  // docExport.ts bu satırdaki tab SAYISINA göre (=sütun sayısı) sekme
  // duraklarını sayfa genişliğine göre DİNAMİK olarak hesaplıyor.
  // İmza satırının altındaki üçüncü satır [[SIMG]] ile işaretlenir ve
  // her sütun için "¸" (CEDILLA) karakteri taşır — bu, kullanıcının
  // gönderdiği GERÇEK bir .udf örneğinde doğrulanan, UYAP'ın bir görseli
  // paylaşılan metin akışında TEK KARAKTERLİK bir <image> öğesiyle temsil
  // etme biçimi (bkz. udf.ts'teki loadEimzaImageBase64 açıklaması). Aynı
  // "¸" karakteri DOCX çıktısında da (docExport.ts) gerçek "e-imza"
  // görseliyle değiştirilir — yani metin İÇERİĞİ ("¸") HER İKİ formatta
  // da aynı, sadece o karakterin YERİNE ne konduğu farklı.
  const rowsText = rows
    .map((row) => {
      const nameLine = "\t" + row.map((s) => `**${s.name}**`).join("\t");
      const roleLine = "\t" + row.map((s) => s.role).join("\t");
      const markLine = "\t" + row.map(() => "¸").join("\t");
      return `[[S]]${nameLine}\n[[S]]${roleLine}\n[[SIMG]]${markLine}`;
    })
    .join("\n\n");

  return `${rowsText}



[[F]]Bu evrak 5070 sayılı Elektronik İmza Kanunu hükümlerine uygun olarak elektronik imza ile imzalanmıştır.
`;
}

// Bilgilendirme ve İlk Oturum Tutanağı'nın AÇILIŞ ("katılım teyidi")
// paragrafı — kullanıcının verdiği GERÇEK ÖRNEK cümle kalıpları BİREBİR
// kullanılır (AI'a hiç yazdırılmaz, GSM numarası/isim hatası riski
// olmasın). Her taraf (başvurucu + her karşı taraf) için ayrı bir cümle
// üretilir. SADECE telekonferans talep eden taraf "...ile yapılan
// görüşmede ... katılabileceğini ANCAK telekonferans şeklinde katılma
// isteğinin olduğunu beyan etti" kalıbını alır, diğer taraflar sade
// "...ile yapılan görüşmede ... teyit edildi." kalıbını kullanır.
// Paragrafın son (karar) cümlesi toplantının telekonferans mı yüz yüze
// mi yapılacağını belirtir — kullanıcının belirttiği gerçek uygulamaya
// göre, taraflardan BİRİ bile telekonferans talep ettiyse toplantının
// TAMAMI telekonferansa döner.
export function buildKatilimTeyidiParagraph(
  c: MediationCaseData,
  telekonferansTalepEden: string | null | undefined, // "basvurucu" | "karsi-{i}" | "" | null/undefined
  toplantiTarihiTr: string,
  toplantiSaati: string
): string {
  const basvurucuTemsilciEk = c.basvurucuVekilAd
    ? `vekili ${avLabel(c.basvurucuVekilAd)}`
    : c.basvurucuYetkiliAd && c.basvurucuYetkiliAd.trim()
    ? `Yetkilisi ${v(c.basvurucuYetkiliAd)}`
    : "";
  const basvurucuEtiket = `Başvurucu ${v(c.basvurucuAd)}${basvurucuTemsilciEk ? " " + basvurucuTemsilciEk : ""}`;

  const cumleler: string[] = [
    buildKatilimCumlesi(basvurucuEtiket, c.basvurucuTelefon, telekonferansTalepEden === "basvurucu"),
  ];

  const parties = partiesList(c);
  parties.forEach((p, i) => {
    const rolEtiketi = parties.length > 1 ? `Karşı taraf ${i + 1} olan` : "Karşı taraf olan";
    const temsilciEk = p.vekilAd
      ? `vekili ${avLabel(p.vekilAd)}`
      : p.yetkiliAd && p.yetkiliAd.trim()
      ? `Yetkilisi ${v(p.yetkiliAd)}`
      : "";
    const etiket = `${rolEtiketi} ${v(p.ad)}${temsilciEk ? " " + temsilciEk : ""}`;
    cumleler.push(buildKatilimCumlesi(etiket, p.telefon, telekonferansTalepEden === `karsi-${i}`));
  });

  const telekonferansMi = !!telekonferansTalepEden;
  // HTML <input type="time"> "16:00" (iki nokta üst üste) verir — resmi
  // belgelerde saat "16.00" (nokta) biçiminde yazılır.
  const saatMetni = (toplantiSaati || "").replace(":", ".");
  const kararCumlesi = `Taraflarla yapılan karşılıklı görüşme sonunda bilgilendirme ve ilk oturum toplantısının ${toplantiTarihiTr || "……………"} günü saat ${saatMetni || "……"}'da ${telekonferansMi ? "telekonferans" : "yüz yüze"} şeklinde yapılmasına karar verildi ve taraflar bu konuda bilgilendirildi.`;

  return `${cumleler.join(" ")} ${kararCumlesi}`;
}

function buildKatilimCumlesi(etiket: string, telefon: string | null | undefined, telekonferansTalebiVar: boolean): string {
  const tel = v(telefon);
  if (telekonferansTalebiVar) {
    return `${etiket} ile ${tel} numaralı GSM hattından yapılan görüşmede toplantıya belirlenen gün ve saat de katılabileceğini ancak telekonferans şeklinde katılma isteğinin olduğunu beyan etti.`;
  }
  return `${etiket} ile yapılan görüşmede toplantıya belirlenen gün ve saat de katılacağı ${tel} numaralı GSM hattından yapılan görüşme ile teyit edildi.`;
}

// İlk Oturum Tutanağı'nda değişmeyen, uzun yasal bilgilendirme metni —
// örnek belgeden birebir alınmıştır.
export const ILK_OTURUM_BILGILENDIRME = `\tTaraflara arabuluculuğun temel ilkeleri olan, arabuluculuk sürecinin iradi olduğu; arabuluculuk sürecinde her iki tarafın da eşit haklara sahip olduğu; taraflarca aksi kararlaştırılmadıkça arabulucunun arabuluculuk faaliyeti çerçevesinde kendisine sunulan veya diğer bir şekilde elde ettiği bilgi ve belgeler ile diğer kayıtları gizli tutmakla yükümlü olduğu ve tarafların ve görüşmelere katılan diğer kişilerin de bu konudaki gizliliğe uymak zorunda olduğu; tarafların, arabulucunun veya arabuluculuğa katılanlar da dâhil üçüncü bir kişinin, uyuşmazlıkla ilgili hukuk davası açıldığında yahut tahkim yoluna başvurulduğunda, tarafların arabuluculuk sürecine katılma isteğini, arabuluculuk sürecinde taraflarca ileri sürülen görüşleri, önerileri ya da herhangi bir vakıanın veya iddianın kabulünü ve sadece arabuluculuk faaliyeti dolayısıyla hazırlanan belgeleri delil olarak ileri süremeyeceği ve bunlar hakkında tanıklık yapamayacağı hususları hakkında bilgi verildi.

\tTaraflara arabulucunun görevini özenle, tarafsız bir biçimde ve şahsen yerine getireceği, arabulucunun taraflar arasında eşitliği gözetmekle yükümlü olduğu, arabuluculuk müzakerelerine tarafların bizzat, kanuni temsilcileri veya vekâletnamesinde özel yetki bulunan avukatları aracılığıyla katılabileceği, arabuluculuk sürecinde arabulucunun rolünün, hâkim veya hakem olmadığı, kimin haklı ya da haksız olduğu konusunda karar vermeyeceği, yargısal bir yetkinin kullanımı olarak sadece hâkim tarafından yapılabilecek işlemleri yapamayacağı, taraflara hukuki tavsiyelerde bulunamayacağı, tarafların çözüm üretemediklerinin ortaya çıkması hâlinde arabulucunun bir çözüm önerisinde bulunabileceği, yaşanılan uyuşmazlık ile ilgili çözüm seçeneklerini üreterek bir anlaşmaya ulaşabilmelerinde taraflara yardımcı olacak iletişimin ortamını sağlayacağı, bilgileri dâhilinde taraflarla ayrı ayrı veya birlikte görüşebileceği ve iletişim kurabileceği, arabulucu olarak tarafsız bir konumda olduğu, arabuluculuk sürecinin sonunda her iki tarafın da kabul edeceği bir anlaşmaya varılamaması hâlinde açılabilecek olası bir davada, daha sonra avukat olarak görev üstlenemeyeceği, arabuluculuk bürosuna başvurulmasından son tutanağın düzenlendiği tarihe kadar geçen sürede zamanaşımının duracağı ve hak düşürücü sürenin işlemeyeceği, arabuluculuk sürecinin sonunda her iki tarafın da kabul edeceği bir anlaşmaya varılamaması hâlinde yargı organlarına başvuru haklarının bulunduğu hususları hakkında bilgi verildi.

\tTaraflara arabuluculuk sürecinde düzenlenecek oturum tutanaklarına ve sürecin sonunda düzenlenecek son tutanağa, oturumların ve faaliyetin sonuçlanması ile arabulucunun son çözüm önerisi dışında hangi hususların yazılacağına tarafların karar vereceği; bununla beraber, bu hususta tarafların birlikte karar verememesi halinde son tutanağın içeriğinin tarafların karşılıklı teklif ve kabulleri dahil olmak üzere arabulucu tarafından düzenleneceği, arabuluculuk sürecinin sonunda varılan anlaşmanın kapsamının taraflarca belirleneceği, anlaşma belgesi düzenlenmesi hâlinde bu belgenin taraflar veya avukatları ve arabulucu tarafından imzalanacağı, tarafların bu anlaşma belgesinin icra edilebilirliğine ilişkin mahkemeden şerh verilmesini talep edebileceği ve bu şerhi içeren anlaşmanın ilâm niteliğinde belge sayılacağı, taraflar ve avukatları ile arabulucunun birlikte imzaladıkları anlaşma belgesinin icra edilebilirlik şerhi aranmaksızın ilâm niteliğinde belge sayılacağı, arabuluculuk faaliyeti sonunda anlaşmaya varılması hâlinde üzerinde anlaşılan hususlar hakkında taraflarca dava açılamayacağı hususları hakkında bilgi verildi.

\tTaraflara arabuluculuk faaliyeti sonunda anlaşmaları hâlinde, arabuluculuk ücretinin, Arabuluculuk Asgari Ücret Tarifesinin eki Arabuluculuk Ücret Tarifesinin İkinci Kısmına göre yüzdelik dilim üzerinden nispi olarak, aksi kararlaştırılmadıkça taraflarca eşit şekilde karşılanacağı, bu durumda ücretin Tarifenin Birinci Kısmında belirlenen iki saatlik ücret tutarından az olamayacağı; arabuluculuk faaliyeti sonunda iki saatten az süren görüşmeler sonunda tarafların anlaşamamaları hâllerinde iki saatlik ücret tutarının Tarifenin Birinci Kısmına göre Adalet Bakanlığı bütçesinden ödeneceği, iki saatten fazla süren görüşmeler sonunda tarafların anlaşamamaları hâlinde ise iki saati aşan kısma ilişkin ücretin aksi kararlaştırılmadıkça taraflarca eşit şekilde uyuşmazlığın konusu dikkate alınarak Tarifenin Birinci Kısmına göre karşılanacağı, Adalet Bakanlığı bütçesinden ödenen ve taraflarca karşılanan arabuluculuk ücretinin yargılama giderlerinden sayılacağı hususları hakkında bilgi verildi.

\tAyrıca, taraflara, kendilerinden arabuluculuk sürecinde birbirlerine karşı "siz"li hitap şeklini kullanmalarının ve söz verildiği zaman, sırayla ve sözleri kesilmeden konuşmalarının beklendiği, birbirlerinin sözünü kesmelerinin, söz veya hareketle diğer tarafı tahkir etmelerinin yasak olduğu, daha sonra eklemek istedikleri hususlar hakkında kendilerine konuşma olanağı tanınacağı, arabulucu tarafından da kendilerine sorular sorulabileceği hususları belirtilmiş; arabuluculuk sürecinde olabildiğince açık ve dürüst olunmasının ve işbirliği hâlinde hareket edilmesinin önemi vurgulanmış; arabuluculuk sürecinde belirtilen kurullara uymayı kabul edip etmedikleri kendilerine sorulmuştur.

\tTaraflar söz alarak arabuluculuğun temel ilkelerini, arabuluculuk sürecini ve arabuluculuk süreci sonunda hazırlanan arabuluculuk son tutanağının ve anlaşma belgesinin hukuki ve mali yönlerden bütün sonuçlarını anladık, arabuluculuk sürecinde ve bu tutanakta belirtilen kurullara uymayı kabul ediyoruz dediler.`;

// Anlaşma Son Tutanağı'nda yer alan, kısa standart kapanış paragrafları.
export const ANLASMA_KAPANIS = `\tTaraflara arabuluculuğun temel ilkeleri, arabuluculuk süreci ile arabuluculuk süreci sonunda hazırlanan son tutanağın hukuki ve mali sonuçları hakkında gerekli bilgiler verilmiştir.\t

\tTaraflar, yapılan görüşmeler sırasında arabuluculuğun temel ilkelerini, arabuluculuk sürecini ve arabuluculuk son tutanağının hukuki ve mali sonuçlarını anladıklarını beyan etmişlerdir.`;

// ANLAŞAMAMA anlatısı — kullanıcının verdiği GERÇEK ÖRNEK cümle kalıbı
// BİREBİR kullanılır (AI'a hiç yazdırılmaz, hata/sapma riski olmasın).
// Sadece isimler ve iki basit seçenek (karşı teklif / ikinci toplantı)
// değişir, cümle yapısı sabittir.
// ANLAŞMA anlatısı — açılış/kapanış cümleleri sabit şablon, ama anlaşma
// ŞARTLARI kullanıcının yazdığı metin BİREBİR (AI hiç değiştirmeden)
// kullanılır — para/tarih gibi kritik detaylarda hata riski olmasın.
export function buildAnlasmaNarrative(c: MediationCaseData, sartlarMetni: string, today: string): string {
  const basvurucuTemsilci = c.basvurucuVekilAd || v(c.basvurucuAd);
  const parties = partiesList(c);
  const karsiIsimler = parties.map((p) => p.vekilAd || p.yetkiliAd || v(p.ad)).join(", ");

  return `\t${today} günü taraflarla görüşmeler yapılmış, ${basvurucuTemsilci} ile ${karsiIsimler} arasında aşağıda belirtilen şartlar altında anlaşmaya varılmıştır.

${indentParagraphs(sartlarMetni.trim())}

\tTaraflar, üzerinde anlaşılan hususlar hakkında dava açılamayacağını anladıklarını ve bu durumu kabul ettiklerini beyan ederek son tutanağın bu şekilde düzenlenmesini talep etmişlerdir. Tarafların isteği üzerine tüm anlaşma şartları son tutanağa yazılmış ve arabuluculuk süreci ANLAŞMA ile sonuçlandırılmıştır.`;
}

// ANLAŞAMAMA anlatısı — kullanıcının verdiği GERÇEK ÖRNEK cümle kalıbı
// BİREBİR kullanılır (AI'a hiç yazdırılmaz, hata/sapma riski olmasın).
// Sadece isimler ve "karşı teklif var mı" değişir, cümle yapısı sabittir.
// NOT: Süreç zaten sabit iki oturumludur (ilk oturum + son tutanak) — bu
// yüzden "ikinci bir toplantı istemediklerini" gibi bir ibare son
// tutanakta anlamsızdır, ESKİDEN buradaydı, KALDIRILDI. "Arabuluculuk
// Sonucu" alanı ve başlıkta hâlâ sade "ANLAŞAMAMA" yazar (bkz.
// sonucKisaLabel) — SADECE bu anlatının son cümlesinde, Kısmi Anlaşma'dan
// ayırt edilsin diye "hiçbir konuda" ibaresi tırnağın DIŞINA eklenir:
// ...sürecinde hiçbir konuda "ANLAŞAMAMA" olarak sonuçlandırılmıştır.
export function buildAnlasamamaNarrative(c: MediationCaseData, karsiTeklifVar: boolean): string {
  const basvurucuHasVekil = !!(c.basvurucuVekilAd && c.basvurucuVekilAd.trim());
  const basvurucuTemsilci = basvurucuHasVekil
    ? `Başvurucu vekili ${c.basvurucuVekilAd}`
    : `Başvurucu ${v(c.basvurucuAd)}`;

  const parties = partiesList(c);
  const karsiCumleler = parties
    .map((p) => {
      const hasVekil = !!(p.vekilAd && p.vekilAd.trim());
      const temsilci = p.vekilAd || p.yetkiliAd || v(p.ad);
      const teklifCumlesi = karsiTeklifVar
        ? "karşı tekliflerinin olduğunu"
        : "herhangi bir karşı tekliflerinin olmadığını";
      // NOT: Buradaki "başvurucu yan ile" ifadesi, konuşan kişinin
      // KENDİ tarafını değil, KARŞISINDAKİ (başvurucu) tarafı işaret
      // eder — aksi halde "X, X ile anlaşamadı" gibi anlamsız bir
      // cümle çıkardı (daha önce yaşanan bir hataydı).
      // NOT (2): "talep" yerine "teklif" kullanılır (arabuluculukta
      // karşı tarafa iletilen şey bir dava talebi değil, uzlaşma
      // teklifidir). "kabul etmediklerini" ise sadece TEMSİLCİ bir
      // VEKİL ise (kişi + avukatı birlikte anıldığı için) çoğuldur;
      // taraf avukatsız TEK BAŞINA konuşuyorsa "kabul etmediğini"
      // (tekil) doğru olan — "biri" için çoğul kip demek mantıksızdı.
      const kabulEtmedi = hasVekil ? "kabul etmediklerini" : "kabul etmediğini";
      return `${temsilci} söz alarak başvurucunun teklifini ${kabulEtmedi}, başvurucu yan ile arabuluculuk sürecinde anlaşmanın mümkün olmadığını, ${teklifCumlesi} beyan etti.`;
    })
    .join(" ");

  const basvurucuKapanisTemsilci = c.basvurucuVekilAd || v(c.basvurucuAd);
  const istedi = basvurucuHasVekil ? "istediklerini" : "istediğini";

  return `\t${basvurucuTemsilci} söz alarak arabuluculuğa konu uyuşmazlıkla ilgili teklifini iletti. ${karsiCumleler} ${basvurucuKapanisTemsilci} söz alarak karşı taraf ile arabuluculuk sürecinde anlaşmanın mümkün olmadığını, bahse konu uyuşmazlığı adli merciler vasıtasıyla çözüme kavuşturmak ${istedi} beyan etti. Taraflar ile yapılan görüşmeler sonucunda tarafların, arabulucu tarafından sunulan alternatif çözüm önerilerine yanaşmadığı görülmüş ve arabuluculuk sürecinin devam ettirilmesinin mevcut durumu değiştirmeyeceği değerlendirilmiş, bahse konu uyuşmazlık arabuluculuk sürecinde hiçbir konuda "ANLAŞAMAMA" olarak sonuçlandırılmıştır.`;
}

// KISMİ ANLAŞMA anlatısı — buildAnlasmaNarrative ile aynı üsluptaki bir
// kalıp, ama anlaşılan VE anlaşılamayan hususlar AYRI AYRI kullanıcı
// tarafından girilir ve ikisi de tutanağa BİREBİR (AI'sız) yazılır.
// NOT: Bu şablon (buildGorusmeYapilmadanNarrative gibi) kullanıcının
// verdiği gerçek bir örnek belgeden değil, mevcut Anlaşma/Anlaşamama
// kalıplarının üslubuna göre tarafımca yazılmıştır — gözden geçirilmesi
// önerilir.
export function buildKismiAnlasmaNarrative(
  c: MediationCaseData,
  anlasilanHususlar: string,
  anlasilamayanHususlar: string,
  today: string,
  ucretCumlesi?: string
): string {
  const basvurucuTemsilci = c.basvurucuVekilAd || v(c.basvurucuAd);
  const parties = partiesList(c);
  const karsiIsimler = parties.map((p) => p.vekilAd || p.yetkiliAd || v(p.ad)).join(", ");

  return `\t${today} günü taraflarla görüşmeler yapılmış, ${basvurucuTemsilci} ile ${karsiIsimler} arasında bir kısım hususlarda anlaşmaya varılmış, bir kısım hususlarda ise anlaşma sağlanamamıştır.

\tAnlaşma Sağlanan Hususlar:

${indentParagraphs(anlasilanHususlar.trim())}

\tAnlaşma Sağlanamayan Hususlar:

${indentParagraphs(anlasilamayanHususlar.trim())}
${ucretCumlesi ? "\n" + indentParagraphs(ucretCumlesi.trim()) + "\n" : ""}
\tTaraflar, üzerinde anlaşılan hususlar hakkında dava açılamayacağını anladıklarını ve bu durumu kabul ettiklerini, anlaşılamayan hususlar bakımından ise dava haklarının saklı olduğunu beyan ederek son tutanağın bu şekilde düzenlenmesini talep etmişlerdir. Tarafların isteği üzerine tüm hususlar son tutanağa yazılmış ve arabuluculuk süreci KISMİ ANLAŞMA ile sonuçlandırılmıştır.`;
}

// GÖRÜŞME YAPILMADAN ANLAŞAMAMA anlatısı — toplantıya hiç oturulamadığı
// (bir/birden fazla taraf gelmedi ya da ulaşılamadı) için "söz alarak..."
// gibi bir görüşme anlatısı YAZILMAZ; sadece kimin katılmadığı ve neden
// görüşme yapılamadığı belirtilir. NOT: Bu şablon de kullanıcının verdiği
// gerçek bir örnekten değil, mevcut kalıpların üslubuna göre tarafımca
// yazılmıştır — gözden geçirilmesi önerilir.
export function buildGorusmeYapilmadanNarrative(katilmayanlar: string[], sebep: string): string {
  const katilmayanlarStr =
    katilmayanlar.length > 1
      ? katilmayanlar.slice(0, -1).join(", ") + " ve " + katilmayanlar[katilmayanlar.length - 1]
      : katilmayanlar[0] || "taraflardan biri";

  return `\tTaraflara usulüne uygun şekilde arabuluculuk toplantısına ilişkin bilgilendirme yapılmış ve davet gönderilmiş olmasına rağmen, ${katilmayanlarStr} toplantıya katılmamış veya kendisine ulaşılamamıştır.

${indentParagraphs((sebep || "Katılmama/ulaşılamama nedenine ilişkin ayrıca bir bilgi verilmemiştir.").trim())}

\tBu nedenle taraflar arasında bir görüşme yapılamamış olup, arabuluculuk süreci GÖRÜŞME YAPILMADAN ANLAŞAMAMA olarak sonuçlandırılmıştır.`;
}

// Anlaşma / Kısmi Anlaşma tutanaklarındaki ücret cümlesi — arabulucu
// artık kendi IBAN'ını her belgede elle yazmaz, profiline BİR KEZ girer
// (bkz. ArabulucuProfile.arabulucuIban) ve buradan otomatik çekilir.
// Ödeyen taraf(lar) TEK seçiliyse isimle, BİRDEN FAZLA seçiliyse "eşit
// oranda" ifadesiyle yazılır (sadece "iki taraf" değil, kaç taraf
// seçiliyse hepsi arasında eşit bölünür).
export function buildUcretCumlesi(
  c: MediationCaseData,
  a: ArabulucuProfile,
  ucretTutari: string,
  odeyenBasvurucu: boolean,
  odeyenKarsiTaraflar: boolean[]
): string {
  const parties = partiesList(c);
  const odeyenIsimler: string[] = [];
  if (odeyenBasvurucu) odeyenIsimler.push(c.basvurucuVekilAd || v(c.basvurucuAd));
  parties.forEach((p, i) => {
    if (odeyenKarsiTaraflar[i]) odeyenIsimler.push(p.vekilAd || p.yetkiliAd || v(p.ad));
  });

  if (!odeyenIsimler.length) return "";

  const odeyenCumlesi =
    odeyenIsimler.length === 1
      ? `${odeyenIsimler[0]} tarafından`
      : `${odeyenIsimler.join(", ")} tarafından eşit oranda`;

  // NOT: İsim + "'e/'a ait" gibi Türkçe ünlü uyumu gerektiren bir ek
  // KASITLI OLARAK kullanılmıyor — isim rastgele/kullanıcı verisi olduğu
  // için doğru eki programatik seçmek güvenilir değil ("...'e ait" her
  // isimde doğru olmayabilir). Bunun yerine ek gerektirmeyen "adına
  // açılan" ifadesi kullanılıyor.
  return `\tArabuluculuk ücreti olan ${v(ucretTutari)} TL'nin ${odeyenCumlesi} karşılanmak suretiyle, arabulucu Arb. ${v(a.name)} adına açılan ${v(a.arabulucuIban)} numaralı IBAN hesabına ödenmesi hususunda taraflar mutabık kalmıştır.`;
}

// Davet Mektubu'nda hiç değişmeyen, uzun HUAK bilgilendirme metni —
// örnek belgeden birebir alınmıştır.
export const DAVET_MEKTUBU_BILGILENDIRME = `[[B]]Başvuruya konu hukuki uyuşmazlığınızın 6325 Sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu kapsamında, tarafların üzerinde serbestçe tasarruf edebileceği iş ve işlemlerden doğan özel hukuk uyuşmazlığı olduğu anlaşılmaktadır.

[[B]]Bu bağlamda, gerçekleştirilecek arabuluculuk sürecinin daha verimli geçmesi için, arabuluculukla ilgili şu hususları bilgilerinize sunmak isterim

[[B]]Arabulucu taraflar arasındaki hukuki uyuşmazlığın çözümünde tarafsız ve bağımsız bir üçüncü kişi olarak yer alır ve taraflar arasındaki iletişim ortamını kolaylaştırarak kendi çözümlerini kendilerinin üretmeleri konusunda onlara yardımcı olur. Tarafların çözüm üretemediklerinin ortaya çıkması halinde arabulucu bir çözüm önerisinde de bulunabilir.

[[B]]Arabuluculuk yoluyla uyuşmazlığın çözümü gönüllülük esasına dayalıdır. Taraflar, süreci devam ettirmek, sonuçlandırmak veya bu süreçten vazgeçmek konusunda serbesttirler.

[[B]]Arabuluculuk yoluyla uyuşmazlığın çözümü ekonomik, sosyal ve psikolojik bakımdan faydalıdır. Arabuluculuk süreci taraflar arasındaki ilişkilerin korunmasına yardımcı olur ve toplumsal barışa hizmet eder.

[[B]]Taraflarca aksi kararlaştırılmadıkça arabuluculuk görüşmelerinde gizlilik ilkesine uyulması esastır. Bu durum, ticari, mesleki ve kişisel sırlarınızın korunmasını sağlayacağı gibi ticari, mesleki ve kişisel itibarınızın zarar görmesini de engelleyecektir.

[[B]]Arabuluculuk bürosuna başvurulmasından son tutanağın düzenlendiği tarihe kadar geçen sürede zamanaşımı durur ve hak düşürücü süre işlemez (HUAK m. 18A/15).

[[B]]Dava açılmadan önce ihtiyati tedbir kararı verilmesi hâlinde 6100 sayılı Kanunun 397.maddesinin birinci fıkrasında, ihtiyati haciz kararı verilmesi hâlinde ise 9/6/1932 tarihli ve 2004 sayılı İcra ve İflas Kanununun 264'üncü maddesinin birinci fıkrasında düzenlenen dava açma süresi, arabuluculuk bürosuna başvurulmasından son tutanağın düzenlendiği tarihe kadar işlemez (HUAK m. 18A/16).

[[B]]Davacı, arabuluculuk faaliyeti sonunda anlaşmaya varılamadığına ilişkin son tutanağın aslını veya arabulucu tarafından onaylanmış bir örneğini dava dilekçesine eklemek zorundadır. Bu zorunluluğa uyulmaması hâlinde mahkemece davacıya, son tutanağın bir haftalık kesin süre içinde mahkemeye sunulması gerektiği, aksi takdirde davanın usulden reddedileceği ihtarını içeren davetiye gönderilir. İhtarın gereği yerine getirilmez ise dava dilekçesi karşı tarafa tebliğe çıkarılmaksızın davanın usulden reddine karar verilir. Arabulucuya başvurulmadan dava açıldığının anlaşılması hâlinde herhangi bir işlem yapılmaksızın davanın, dava şartı yokluğu sebebiyle usulden reddine karar verilir. (HUAK m. 3/2).

[[B]]Arabulucu, yapılan başvuruyu görevlendirildiği tarihten itibaren üç hafta içinde sonuçlandırır. Bu süre zorunlu hâllerde arabulucu tarafından en fazla bir hafta uzatılabilir (HUAK m. 18A/9).

[[B]]Arabulucu, taraflara ulaşılamaması, taraflar katılmadığı için görüşme yapılamaması yahut yapılan görüşmeler sonucunda anlaşmaya varılması veya varılamaması hâllerinde arabuluculuk faaliyetini sona erdirir ve son tutanağı düzenleyerek durumu derhâl arabuluculuk bürosuna bildirir (HUAK m.18A/10).

[[B]]Tarafların arabuluculuk faaliyeti sonunda anlaşmaları hâlinde, arabuluculuk ücret, Arabuluculuk Asgari Ücret Tarifesinin eki Arabuluculuk Ücret Tarifesinin İkinci Kısmına göre karşılanır. Bu durumda ücret, Tarifenin Birinci Kısmında belirlenen iki saatlik ücret tutarından az olamaz. (HUAK m. 18A/12)

[[B]]Arabuluculuk faaliyeti sonunda taraflara ulaşılamaması, taraflar katılmadığı için görüşme yapılamaması veya iki saatten az süren görüşmeler sonunda tarafların anlaşamamaları hâllerinde, iki saatlik ücret tutarı Tarifenin Birinci Kısmına göre Adalet Bakanlığı bütçesinden ödenir. İki saatten fazla süren görüşmeler sonunda tarafların anlaşamamaları hâlinde ise iki saati aşan kısma ilişkin ücret aksi kararlaştırılmadıkça taraflarca eşit şekilde uyuşmazlığın konusu dikkate alınarak Tarifenin Birinci Kısmına göre karşılanır. Adalet Bakanlığı bütçesinden ödenen ve taraflarca karşılanan arabuluculuk ücret, yargılama giderlerinden sayılır. (HUAK m. 18A/13)

[[B]]Arabuluculuk müzakerelerine taraflar bizzat, kanuni temsilcileri veya avukatları aracılığıyla katılabilirler. Uyuşmazlığın çözümüne katkı sağlayabilecek uzman kişiler de müzakerelerde hazır bulundurulabilir (HUAK m. 15/6).

[[B]]Arabuluculuk görüşmeleri, taraflarca aksi kararlaştırılmadıkça, arabulucuyu görevlendiren büronun bağlı bulunduğu adli yargı ilk derece mahkemesi adalet komisyonunun yetki alanı içinde yürütülür (HUAK m. 18A/17).

[[B]]Yukarıda belirtilen tarihte yapılacak ilk toplantıya taraflardan birinin geçerli bir mazeret göstermeksizin katılmaması sebebiyle arabuluculuk faaliyetinin sona ermesi durumunda toplantıya katılmayan taraf, son tutanakta belirtilir ve bu taraf davada kısmen veya tamamen haklı çıksa bile yargılama giderinin tamamından sorumlu tutulur. Ayrıca bu taraf lehine vekâlet ücretine hükmedilmez. Her iki tarafın da ilk toplantıya katılmaması sebebiyle sona eren arabuluculuk faaliyeti üzerine açılacak davalarda tarafların yaptıkları yargılama giderleri kendi üzerlerinde bırakılır. (HUAK m.18A/11)

[[B]]Arabuluculuk görüşmelerine, gerçek kişilerin kimlik belgesi, şirket yetkililerinin kimlik belgesi ve imza sirküleri, avukatların kimlik belgesi ve arabuluculuk görüşmelerine katılma konusunda özel yetki bulunan vekâletname ile toplantıya katılması gerekmektedir. Arabuluculuk görüşmelerinde, idarenin taraf olduğu uyuşmazlıklarda idareyi, üst yönetici tarafından belirlenen iki üye ile hukuk birimi amiri veya onun belirleyeceği bir avukat ya da hukuk müşavirinden oluşan komisyon temsil eder (HUAK m. 15/8). Komisyon kendisini vekil ile temsil ettiremez (HUAK Yönetmeliği m. 18/1).

Katılımınızı bekler, arabuluculuk sürecinin barışçıl bir çözümle sonuçlanmasını dilerim.`;

// Davet mektubu genelde TEK bir tarafa gönderilir (davet edilen kişi
// seçilerek). "diğerTarafAd/diğerTarafVekil" = mektubu ALMAYAN, süreci
// BAŞLATAN taraf (genelde başvurucu) — mektupta "X ve vekili Y tarafından
// ... yapılan başvuru üzerine..." cümlesinde bahsedilir.
export function buildDavetMektubu(
  c: MediationCaseData,
  a: ArabulucuProfile,
  davetEdilenAd: string,
  davetEdilenVekil: string,
  davetEdilenBaroSicil: string,
  davetEdilenTelefon: string,
  gunSaat: string,
  toplantiYeri: string,
  uyusmazlikOzeti: string,
  today: string,
  digerTarafAd: string,
  digerTarafVekil: string,
  invitingBasvurucu: boolean
): string {
  const digerTarafCumle = digerTarafVekil
    ? `**${v(digerTarafAd)}** ve vekili Sayın **${avLabel(digerTarafVekil)}**`
    : `**${v(digerTarafAd)}**`;

  // Mektup BAŞVURUCU'nun kendisine gidiyorsa: "TARAFINIZCA yapılan
  // başvuru" (o zaten kendisi başvurmuş, ismini tekrar anmaya gerek yok).
  // Mektup KARŞI TARAF'a gidiyorsa: "[BAŞVURUCU ADI] TARAFINDAN yapılan
  // başvuru" (karşı taraf başvurmadı, kimin başvurduğunu belirtmek gerekir).
  const basvuruCumlesi = invitingBasvurucu
    ? `Tarafınızca **${v(a.arabuluculukBurosu)}**'na yapılan başvuru üzerine UYAP Arabulucu Portal tarafından görevlendirilmiş Türkiye Cumhuriyeti Adalet Bakanlığı'ndaki resmi sicile kayıtlı ${v(a.arabulucuSicilNo)} sicil numaralı arabulucuyum.`
    : `${digerTarafCumle} tarafından **${v(a.arabuluculukBurosu)}**'na yapılan başvuru üzerine UYAP Arabulucu Portal tarafından görevlendirilmiş Türkiye Cumhuriyeti Adalet Bakanlığı'ndaki resmi sicile kayıtlı ${v(a.arabulucuSicilNo)} sicil numaralı arabulucuyum.`;

  return `[[C]]**ARABULUCULUK SÜRECİNE DAVET MEKTUBUDUR**

**__DAVETTE BULUNAN__**

Arabulucu: Arb. **${v(a.name)}**
TELFON: ${v(a.phone)}
E-Mail: ${v(a.email)}
Adres: ${v(a.arabulucuAdres)}

**__DAVET EDİLEN__**

Adı / Soyadı: **${v(davetEdilenAd)}**
Vekili: ${davetEdilenVekil ? `**${avLabel(davetEdilenVekil)}**` : ""}
Baro / Sicil: ${v(davetEdilenBaroSicil, "")}
Telefon: ${v(davetEdilenTelefon)}

**__GÜN VE SAAT__**: ${v(gunSaat)}

**__TOPLANTI YERİ__**: ${v(toplantiYeri)}


**__AÇIKLAMALAR VE BİLGİLENDİRMELER: __**

Sayın **${v(davetEdilenAd)}**${davetEdilenVekil ? ` ve vekili Sayın **${avLabel(davetEdilenVekil)}**` : ""},

${basvuruCumlesi}

**${v(digerTarafAd)}** ile aranızdaki uyuşmazlığın, barışçıl olarak arabuluculuk yoluyla çözümlenmesine olanak sağlamak üzere, sizi tüm tarafların katılımıyla gerçekleşmeyi dilediğimiz arabuluculuk ilk oturumuna davet ediyorum.

${DAVET_MEKTUBU_BILGILENDIRME}

Saygılarımla… ${today}


[[R]]Arb. **${v(a.name)}**
[[R]]Sicil No: ${v(a.arabulucuSicilNo)}`;
}
