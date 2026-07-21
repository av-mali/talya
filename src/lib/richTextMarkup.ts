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
//   satırın EN BAŞINDA "[[N1]]" / "[[N2]]" -> o paragraf NUMARALI bir
//     liste öğesidir ("1-", "2-" şeklinde) — N1 ve N2 birbirinden
//     BAĞIMSIZ iki ayrı liste (biri 1'den, diğeri de kendi başına 1'den
//     başlar), gerçek Word "numaralı liste" özelliğiyle (görünüşte değil)
//   satırın EN BAŞINDA "[[B]]" -> o paragraf gerçek bir MADDE (liste
//     öğesi) olarak işaretlenir — sadece görünüş değil, dosyanın kendi
//     yapısında da gerçek bir liste öğesi (orijinal örnek belgelerde
//     HUAK bilgilendirme paragrafları böyle işaretliydi)
//
// Bu işaretler olmayan satırlar İKİ YANA YASLI (justify) kabul edilir —
// gerçek örnek UYAP belgelerinde gövde metninin tamamı böyledir.

export type FormatRun = { start: number; length: number; bold: boolean; underline: boolean };

export function parseLineMarkup(rawLine: string): { text: string; runs: FormatRun[]; centered: boolean; right: boolean; bulleted: boolean; sigRow: boolean; numbered: 1 | 2 | 0 } {
  let line = rawLine;
  let centered = false;
  let right = false;
  let bulleted = false;
  let sigRow = false;
  let numbered: 1 | 2 | 0 = 0;
  if (line.startsWith("[[C]]")) {
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
  if (line.startsWith("[[N1]]")) {
    numbered = 1;
    line = line.slice(6);
  } else if (line.startsWith("[[N2]]")) {
    numbered = 2;
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
  return { text: out, runs, centered, right, bulleted, sigRow, numbered };
}

export function stripMarkup(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/^\[\[C\]\]/, "")
        .replace(/^\[\[R\]\]/, "")
        .replace(/^\[\[S\]\]/, "")
        .replace(/^\[\[N1\]\]/, "")
        .replace(/^\[\[N2\]\]/, "")
        .replace(/^\[\[B\]\]/, "• ")
        .replace(/\*\*__(.+?)__\*\*/g, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
    )
    .join("\n");
}
