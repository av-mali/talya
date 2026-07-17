// UYAP'ın .udf formatı, aslında içinde content.xml barındıran bir ZIP
// arşividir. content.xml içindeki <content><![CDATA[...]]></content>
// bölümü belgenin düz metnidir. sign.sgn ise SADECE e-imzalı belgelerde
// bulunan dijital imza dosyasıdır — biz taslak (imzasız) üretiyoruz,
// bu yüzden sign.sgn'e hiç ihtiyacımız yok.
//
// Bu kütüphane gerçek bir örnek .udf dosyası incelenerek (reverse
// engineering) yazılmıştır — UYAP'ın resmi bir dokümantasyonu yoktur.
// Okuma tarafı güvenilirdir. Yazma (üretme) tarafı, tek bir örnek
// üzerinden en iyi tahminle kuruldu; gerçek UYAP ortamında test edilmesi
// önerilir.

import JSZip from "jszip";

export async function readUdfText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const contentFile = zip.file("content.xml");
  if (!contentFile) {
    throw new Error("Geçerli bir UDF dosyası değil (content.xml bulunamadı).");
  }
  const xml = await contentFile.async("string");
  const match = xml.match(/<content><!\[CDATA\[([\s\S]*?)\]\]><\/content>/);
  if (!match) {
    throw new Error("UDF içeriği okunamadı.");
  }
  return match[1];
}

// Biçimlendirme işaretleri (kaynak metne BEN koyuyorum, kullanıcı hiç
// görmüyor): "**kalın**", "__altı çizili__", ve bir satırın BAŞINDA
// "[[C]]" varsa o paragraf ORTALANMIŞ olur. Gerçek bir örnek UDF
// dosyasının <elements> yapısı incelenerek (paragraf başına Alignment +
// karakter aralığı bazlı biçim "run"ları) birebir uyumlu üretiliyor.
type FormatRun = { start: number; length: number; bold: boolean; underline: boolean };

function parseLineMarkup(rawLine: string): { text: string; runs: FormatRun[]; centered: boolean } {
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

export async function generateUdf(text: string): Promise<Buffer> {
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");

  let plainCdata = "";
  let elementsXml = "";
  let offset = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const isLast = i === rawLines.length - 1;
    const { text: lineText, runs, centered } = parseLineMarkup(rawLines[i]);
    const lengthWithBreak = lineText.length + (isLast ? 0 : 1);

    plainCdata += lineText + (isLast ? "" : "\n");

    if (lengthWithBreak > 0) {
      const alignAttr = centered ? ` Alignment="1"` : "";
      if (!runs.length) {
        elementsXml += `<paragraph${alignAttr}><content startOffset="${offset}" length="${lengthWithBreak}" /></paragraph>`;
      } else {
        // Biçimli kısımlar ile düz kısımları, orijinal sırayla ayrı
        // <content> "run"ları olarak yaz — gerçek UDF yapısı böyle çalışıyor.
        let cursor = 0;
        let inner = "";
        const sorted = [...runs].sort((a, b) => a.start - b.start);
        for (const r of sorted) {
          if (r.start > cursor) {
            inner += `<content startOffset="${offset + cursor}" length="${r.start - cursor}" />`;
          }
          const fmtAttrs = `${r.bold ? ' bold="true"' : ""}${r.underline ? ' underline="true"' : ""}`;
          inner += `<content${fmtAttrs} startOffset="${offset + r.start}" length="${r.length}" />`;
          cursor = r.start + r.length;
        }
        if (cursor < lineText.length + (isLast ? 0 : 1)) {
          inner += `<content startOffset="${offset + cursor}" length="${lineText.length + (isLast ? 0 : 1) - cursor}" />`;
        }
        elementsXml += `<paragraph${alignAttr}>${inner}</paragraph>`;
      }
    }
    offset += lengthWithBreak;
  }

  // CDATA içinde "]]>" dizisi geçerse XML bozulur — standart XML kaçış
  // tekniğiyle bunu güvenli hale getiriyoruz.
  const cdataContent = (plainCdata + "\n").replace(/]]>/g, "]]]]><![CDATA[>");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?> 

<template format_id="1.8" >
<content><![CDATA[${cdataContent}]]></content><properties><pageFormat mediaSizeName="1" leftMargin="42.51968479156494" rightMargin="42.51968479156494" topMargin="42.51968479156494" bottomMargin="42.51968479156494" paperOrientation="1" headerFOffset="20.0" footerFOffset="20.0" /></properties>
<elements resolver="hvl-default" >${elementsXml}</elements>
<styles><style name="default" description="Geçerli" family="Times New Roman" size="12" bold="false" italic="false" /><style name="hvl-default" family="Times New Roman" size="12" description="Gövde" /></styles>
</template>
`;

  const zip = new JSZip();
  zip.file("content.xml", xml);
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return buf;
}
