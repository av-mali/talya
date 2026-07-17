// UDF ve DOCX üretiminde ORTAK kullanılan, basit bir metin içi
// biçimlendirme işaret dili. Kaynak metne BEN (kod) koyuyorum, kullanıcı
// hiç görmüyor — ekranda gösterilirken stripMarkup() ile temizleniyor.
//
//   **kalın**              -> kalın
//   __altı çizili__        -> altı çizili
//   **__kalın + altı çizili__**  -> ikisi birden
//   satırın EN BAŞINDA "[[C]]" -> o paragraf ORTALANMIŞ olur
//
// Bu işaretler olmayan satırlar İKİ YANA YASLI (justify) kabul edilir —
// gerçek örnek UYAP belgelerinde gövde metninin tamamı böyledir.

export type FormatRun = { start: number; length: number; bold: boolean; underline: boolean };

export function parseLineMarkup(rawLine: string): { text: string; runs: FormatRun[]; centered: boolean } {
  let line = rawLine;
  let centered = false;
  if (line.startsWith("[[C]]")) {
    centered = true;
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
  return { text: out, runs, centered };
}

export function stripMarkup(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/^\[\[C\]\]/, "")
        .replace(/\*\*__(.+?)__\*\*/g, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
    )
    .join("\n");
}
