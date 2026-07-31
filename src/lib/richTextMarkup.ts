// UDF ve DOCX üretiminde ORTAK kullanılan, basit bir metin içi
// biçimlendirme işaret dili. Kaynak metne BEN (kod) koyuyorum, kullanıcı
// hiç görmüyor — ekranda gösterilirken stripMarkup() ile temizleniyor.
//
//   **kalın**              -> kalın
//   __altı çizili__        -> altı çizili
//   **__kalın + altı çizili__**  -> ikisi birden
//   satırın EN BAŞINDA "[[C]]" -> o paragraf ORTALANMIŞ olur
//   satırın EN BAŞINDA "[[R]]" -> o paragraf SAĞA YASLI olur (ör. imza alanı)
//   satırın EN BAŞINDA "[[S]]" -> o paragraf bir İMZA SATIRIDIR (dar,
//     3 sütuna sığacak şekilde ÖZEL bir sekme düzeni kullanır)
//   satırın EN BAŞINDA "[[SIMG]]" -> o paragraf bir İMZA GÖRSELİ
//     SATIRIDIR — [[S]] ile AYNI sekme düzenini kullanır (sigRow=true de
//     olur). Metindeki HER "¸" (CEDILLA) karakteri, gerçek "e-imza"
//     görseliyle (src/assets/images/eimza.png) değiştirilir — hem
//     DOCX'te (ImageRun, bkz. docExport.ts) hem UDF'de (<image
//     imageData=".." startOffset=".." length="1" />, bkz. udf.ts).
//     UDF'deki bu yapı, kullanıcının gönderdiği GERÇEK bir örnek .udf
//     dosyası (elle görsel eklenmiş) incelenerek doğrulandı — UYAP,
//     görseli paylaşılan metin akışında TEK KARAKTERLİK bir <image>
//     öğesiyle temsil ediyor, tahmin/uydurma değil.
//   satırın EN BAŞINDA "[[D]]" -> o paragraf bir TARİH/SONUÇ SATIRIDIR
//     ("Arabuluculuk Bürosuna Başvuru Tarihi : ..." gibi) — etiketler
//     normal etiket-değer satırlarından ÇOK daha uzun olduğundan, değer
//     sütununun her satırda AYNI (ve etiketin sığacağı kadar geniş) yerde
//     başlaması için ayrı/geniş bir sekme durağı kullanır
//   satırın EN BAŞINDA "[[N1]]" / "[[N2]]" -> o paragraf NUMARALI bir
//     liste öğesidir ("1.", "2." şeklinde) — N1 ve N2 birbirinden
//     BAĞIMSIZ iki ayrı liste (biri 1'den, diğeri de kendi başına 1'den
//     başlar), gerçek Word "numaralı liste" özelliğiyle (görünüşte değil)
//   satırın EN BAŞINDA "[[N3]]" -> o paragraf N1 listesinin İÇİNE
//     GİRİNTİLİ, HARFLİ bir alt liste öğesidir ("a)", "b)" şeklinde) —
//     davet mektubundaki "arabuluculuğun temel ilkeleri" gibi, bir N1
//     maddesinin altında ayrı bir alt liste açmak için kullanılır
//   satırın EN BAŞINDA "[[B]]" -> o paragraf gerçek bir MADDE (liste
//     öğesi) olarak işaretlenir — sadece görünüş değil, dosyanın kendi
//     yapısında da gerçek bir liste öğesi (orijinal örnek belgelerde
//     HUAK bilgilendirme paragrafları böyle işaretliydi)
//   satırın EN BAŞINDA "[[F]]" -> o paragraf sayfanın gerçek ALT BİLGİ
//     (footer) alanına yazılır — gövde metninin bir parçası DEĞİLDİR;
//     orijinal örnek UYAP belgelerinde "Bu evrak ... imzalanmıştır."
//     cümlesi ayrı, italik/kalın/küçük/mavi bir footer öğesi olarak
//     saklanıyor, sıradan bir paragraf değil
//   satırın EN BAŞINDA "[[SZ14]]" (veya başka bir sayı) -> o paragrafın
//     TAMAMI belirtilen punto BÜYÜKLÜĞÜNDE yazılır (ör. sadece ana
//     başlık satırları 14 punto, geri kalan gövde metni varsayılan
//     boyutta kalır) — sadece kullanıcının AÇIKÇA "başlık 14 punto
//     olacak" dediği satırlara uygulanır, alt başlıklara (ARABULUCU,
//     BAŞVURUCU vb.) DEĞİL
//
// Bu işaretler olmayan satırlar İKİ YANA YASLI (justify) kabul edilir —
// gerçek örnek UYAP belgelerinde gövde metninin tamamı böyledir.

export type FormatRun = { start: number; length: number; bold: boolean; underline: boolean };

export function parseLineMarkup(rawLine: string): { text: string; runs: FormatRun[]; centered: boolean; right: boolean; bulleted: boolean; sigRow: boolean; sigImage: boolean; dateRow: boolean; footer: boolean; numbered: 1 | 2 | 3 | 0; fontSize?: number } {
  let line = rawLine;
  let centered = false;
  let right = false;
  let bulleted = false;
  let sigRow = false;
  let sigImage = false;
  let dateRow = false;
  let footer = false;
  let numbered: 1 | 2 | 3 | 0 = 0;
  let fontSize: number | undefined;
  const szMatch = line.match(/^\[\[SZ(\d+)\]\]/);
  if (szMatch) {
    fontSize = parseInt(szMatch[1], 10);
    line = line.slice(szMatch[0].length);
  }
  // [[SIMG]] KONTROLÜ [[S]]'DEN ÖNCE gelmeli — ikisi de imza satırıyla
  // ilgili ama farklı işaretler ("[[SIMG]]" zaten "[[S]]" ile
  // BAŞLAMIYOR, o yüzden sıra aslında önemli değil, ama okunurluk için
  // birlikte tutuluyor). sigImage=true olan satır AYNI ZAMANDA sigRow da
  // sayılır — imza satırlarının ortak sekme durağı (TabSet/tabStops)
  // mantığını (bkz. udf.ts/docExport.ts) olduğu gibi kullanır, sadece
  // İÇERİĞİ (metin yerine gerçek e-imza görseli) farklı üretilir.
  if (line.startsWith("[[SIMG]]")) {
    sigImage = true;
    sigRow = true;
    line = line.slice(8);
  } else if (line.startsWith("[[C]]")) {
    centered = true;
    line = line.slice(5);
  }
  if (line.startsWith("[[R]]")) {
    right = true;
    line = line.slice(5);
  }
  if (line.startsWith("[[S]]")) {
    sigRow = true;
    line = line.slice(5);
  }
  if (line.startsWith("[[D]]")) {
    dateRow = true;
    line = line.slice(5);
  }
  if (line.startsWith("[[F]]")) {
    footer = true;
    line = line.slice(5);
  }
  if (line.startsWith("[[N1]]")) {
    numbered = 1;
    line = line.slice(6);
  } else if (line.startsWith("[[N2]]")) {
    numbered = 2;
    line = line.slice(6);
  } else if (line.startsWith("[[N3]]")) {
    numbered = 3;
    line = line.slice(6);
  }
  if (line.startsWith("[[B]]")) {
    bulleted = true;
    line = line.slice(5);
  }

  const runs: FormatRun[] = [];
  let out = "";
  let i = 0;
  while (i < line.length) {
    if (line.startsWith("**__", i)) {
      const end = line.indexOf("__**", i + 4);
      if (end !== -1) {
        const inner = line.slice(i + 4, end);
        runs.push({ start: out.length, length: inner.length, bold: true, underline: true });
        out += inner;
        i = end + 4;
        continue;
      }
    }
    if (line.startsWith("**", i)) {
      const end = line.indexOf("**", i + 2);
      if (end !== -1) {
        const inner = line.slice(i + 2, end);
        runs.push({ start: out.length, length: inner.length, bold: true, underline: false });
        out += inner;
        i = end + 2;
        continue;
      }
    }
    if (line.startsWith("__", i)) {
      const end = line.indexOf("__", i + 2);
      if (end !== -1) {
        const inner = line.slice(i + 2, end);
        runs.push({ start: out.length, length: inner.length, bold: false, underline: true });
        out += inner;
        i = end + 2;
        continue;
      }
    }
    out += line[i];
    i++;
  }
  return { text: out, runs, centered, right, bulleted, sigRow, sigImage, dateRow, footer, numbered, fontSize };
}

export function stripMarkup(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/^\[\[SIMG\]\]/, "")
        .replace(/^\[\[SZ\d+\]\]/, "")
        .replace(/^\[\[C\]\]/, "")
        .replace(/^\[\[R\]\]/, "")
        .replace(/^\[\[S\]\]/, "")
        .replace(/^\[\[D\]\]/, "")
        .replace(/^\[\[F\]\]/, "")
        .replace(/^\[\[N1\]\]/, "")
        .replace(/^\[\[N2\]\]/, "")
        .replace(/^\[\[N3\]\]/, "")
        .replace(/^\[\[B\]\]/, "• ")
        .replace(/\*\*__(.+?)__\*\*/g, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
    )
    .join("\n");
}
