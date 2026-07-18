// AI çıktısını basit, düzgün biçimlendirilmiş bir Word (.docx) belgesine
// çevirir. Word, yazı tipini OKUYAN kişinin bilgisayarındaki fonttan
// aldığı için (PDF'in aksine yazı tipini gömmek gerekmez), Türkçe
// karakterler (ç, ğ, ı, ö, ş, ü) sorunsuz görünür.

import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { PDFDocument, rgb } from "pdf-lib";
// @ts-ignore - @pdf-lib/fontkit için resmi TypeScript tip tanımı yok
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { parseLineMarkup } from "./richTextMarkup";

export async function generateDocx(text: string): Promise<Buffer> {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  const paragraphs = lines.map((rawLine) => {
    const { text: lineText, runs, centered, bulleted } = parseLineMarkup(rawLine);

    // Biçimli kısımları ve düz kısımları, orijinal sırayla ayrı
    // TextRun'lar olarak oluştur — aynı satırda hem düz hem kalın/altı
    // çizili metin bir arada olabiliyor (ör. "Vekili\t: Av. X").
    const children: TextRun[] = [];
    if (!runs.length) {
      children.push(new TextRun(lineText));
    } else {
      let cursor = 0;
      const sorted = [...runs].sort((a, b) => a.start - b.start);
      for (const r of sorted) {
        if (r.start > cursor) {
          children.push(new TextRun(lineText.slice(cursor, r.start)));
        }
        children.push(
          new TextRun({
            text: lineText.slice(r.start, r.start + r.length),
            bold: r.bold,
            underline: r.underline ? {} : undefined,
          })
        );
        cursor = r.start + r.length;
      }
      if (cursor < lineText.length) {
        children.push(new TextRun(lineText.slice(cursor)));
      }
    }

    return new Paragraph({
      children,
      alignment: centered ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      spacing: { after: 0, before: 0 },
      bullet: bulleted ? { level: 0 } : undefined,
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  return buf;
}

// PDF, Word'ün aksine yazı tipini KENDİ İÇİNE GÖMMEK zorundadır — bu yüzden
// Türkçe karakterleri (ç, ğ, ı, İ, ö, ş, ü) destekleyen gerçek bir font
// dosyası (Noto Serif) projeye eklenip burada kullanılıyor.
let cachedFontBytes: Buffer | null = null;
function loadTurkishFont(): Buffer {
  if (!cachedFontBytes) {
    const fontPath = path.join(process.cwd(), "src/assets/fonts/NotoSerif-Regular.ttf");
    cachedFontBytes = fs.readFileSync(fontPath);
  }
  return cachedFontBytes;
}

export async function generatePdf(text: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit as any);

  const fontBytes = loadTurkishFont();
  const font = await pdfDoc.embedFont(fontBytes);

  const fontSize = 11;
  const margin = 50;
  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();
  let y = height - margin;
  const lineHeight = fontSize * 1.4;
  const maxWidth = width - margin * 2;

  function wrapLine(line: string): string[] {
    if (!line) return [""];
    const words = line.split(" ");
    const wrapped: string[] = [];
    let current = "";
    for (const w of words) {
      const test = current ? current + " " + w : w;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
        wrapped.push(current);
        current = w;
      } else {
        current = test;
      }
    }
    if (current) wrapped.push(current);
    return wrapped;
  }

  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  for (const rawLine of rawLines) {
    // "**kalın**" işaretlerini PDF'te göstermeden temizle (ayrı bold font
    // gömmüyoruz şimdilik — sade ama doğru bir çıktı önceliğimiz).
    const cleanLine = rawLine.replace(/\*\*(.+?)\*\*/g, "$1");
    const wrapped = wrapLine(cleanLine);
    for (const line of wrapped) {
      if (y < margin) {
        page = pdfDoc.addPage();
        ({ width, height } = page.getSize());
        y = height - margin;
      }
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
