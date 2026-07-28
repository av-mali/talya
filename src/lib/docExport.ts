// AI çıktısını basit, düzgün biçimlendirilmiş bir Word (.docx) belgesine
// çevirir. Word, yazı tipini OKUYAN kişinin bilgisayarındaki fonttan
// aldığı için (PDF'in aksine yazı tipini gömmek gerekmez), Türkçe
// karakterler (ç, ğ, ı, ö, ş, ü) sorunsuz görünür.

import { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, LevelFormat, Footer } from "docx";
import { PDFDocument, rgb } from "pdf-lib";
// @ts-ignore - @pdf-lib/fontkit için resmi TypeScript tip tanımı yok
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { parseLineMarkup } from "./richTextMarkup";

// Bir satırın biçimli ("**kalın**", "__altı çizili__") ve düz kısımlarını,
// orijinal sırayla ayrı TextRun'lar olarak üretir — aynı satırda hem düz
// hem kalın/altı çizili metin bir arada olabiliyor (ör. "Vekili\t: Av. X").
// "forceStyle" verilirse (footer satırı gibi) HER run'a o stil uygulanır
// (satırın kendi bold/underline işaretlerinin üstüne yazar).
function buildRuns(
  lineText: string,
  runs: { start: number; length: number; bold: boolean; underline: boolean }[],
  forceStyle?: { italics?: boolean; bold?: boolean; size?: number; color?: string }
): TextRun[] {
  const mk = (t: string, bold: boolean, underline: boolean) =>
    new TextRun({
      text: t,
      bold: forceStyle?.bold ?? bold,
      underline: underline ? {} : undefined,
      italics: forceStyle?.italics,
      size: forceStyle?.size,
      color: forceStyle?.color,
    });

  if (!runs.length) return [mk(lineText, false, false)];

  const children: TextRun[] = [];
  let cursor = 0;
  const sorted = [...runs].sort((a, b) => a.start - b.start);
  for (const r of sorted) {
    if (r.start > cursor) children.push(mk(lineText.slice(cursor, r.start), false, false));
    children.push(mk(lineText.slice(r.start, r.start + r.length), r.bold, r.underline));
    cursor = r.start + r.length;
  }
  if (cursor < lineText.length) children.push(mk(lineText.slice(cursor), false, false));
  return children;
}

// İmza satırlarında (sigRow) kaç imzacı varsa (=satırdaki TAB sayısı,
// satır başındaki tab da dahil — mediationTemplates.ts artık ilk sütun
// için de baştan bir tab ekliyor), her isim KENDİ sütununun TAM
// ORTASINA denk gelecek CENTER sekme durakları üretilir: sayfa, sütun
// sayısı kadar EŞİT dilime bölünür, her durak kendi diliminin
// ortasındadır — udf.ts'teki aynı mantığın DOCX karşılığı (aynı sayfa
// genişliği oranlarını kullanır, birimi twips).
// ÖNEMLİ: Bu kütüphane sayfa boyutunu AÇIKÇA belirtmediğimiz için
// kendi VARSAYILAN boyutunu kullanıyor — bu Letter DEĞİL, A4
// (11906×16838 twips)! Gerçek `docx` çıktısı üretilip word/document.xml
// içindeki <w:pgSz>/<w:pgMar> okunarak doğrulandı. Önceki sürümde bu
// sabit yanlışlıkla Letter (12240) varsayıyordu — küçük ama gereksiz bir
// sapmaydı (2400/7200 yerine 2520/7560 üretiyordu).
const DOCX_SIGROW_CONTENT_WIDTH_TWIPS = 9746; // A4 (11906) - 2 * 1080 kenar boşluğu
function sigRowTabStops(lineText: string) {
  const cols = Math.max((lineText.match(/\t/g) || []).length, 1);
  const stops: { type: (typeof TabStopType)[keyof typeof TabStopType]; position: number }[] = [];
  for (let k = 1; k <= cols; k++) {
    stops.push({
      type: TabStopType.CENTER,
      position: Math.round((DOCX_SIGROW_CONTENT_WIDTH_TWIPS * (2 * k - 1)) / (2 * cols)),
    });
  }
  return stops;
}

export async function generateDocx(text: string): Promise<Buffer> {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  const paragraphs: Paragraph[] = [];
  // Footer (ör. "Bu evrak ... imzalanmıştır.") satırları gövdeye DEĞİL,
  // sayfanın gerçek Word footer'ına yazılır — orijinal örnek UYAP
  // belgesinde bu cümle italik/kalın/10 punto/mavi bir sayfa altbilgisi
  // olarak saklanıyor, sıradan bir gövde paragrafı değil.
  const footerParagraphs: Paragraph[] = [];

  for (const rawLine of lines) {
    const { text: lineText, runs, centered, right, bulleted, numbered, sigRow, dateRow, footer } = parseLineMarkup(rawLine);

    const paragraph = new Paragraph({
      children: footer
        ? buildRuns(lineText, runs, { italics: true, bold: true, size: 20, color: "0080FF" })
        : buildRuns(lineText, runs),
      alignment: footer ? AlignmentType.CENTER : centered ? AlignmentType.CENTER : right ? AlignmentType.RIGHT : AlignmentType.JUSTIFIED,
      spacing: { after: 0, before: 0 },
      bullet: bulleted ? { level: 0 } : undefined,
      numbering: numbered === 1 ? { reference: "n1-list", level: 0 } : numbered === 2 ? { reference: "n2-list", level: 0 } : undefined,
      // İKİ sekme noktası: 400 (basit satır başı girintisi — "Diğer
      // Hükümler" maddeleri gibi tek başına girinti isteyen satırlar
      // için) ve 3200 ("Etiket\t: değer" tarzı satırlarda değerlerin
      // hepsinin AYNI dikey hizada başlaması için — etiket zaten 400'ü
      // geçtiğinden otomatik olarak ikinci noktaya atlar).
      // İmza satırları (sigRow) ise farklı bir düzen kullanır: satırdaki
      // imzacı SAYISINA göre DİNAMİK olarak hesaplanan CENTER sekme
      // durakları — her isim kendi eşit dilimin ortasında durur (bkz.
      // yukarıdaki sigRowTabStops). Tarih/sonuç satırları (dateRow —
      // "Arabuluculuk Bürosuna Başvuru Tarihi" gibi) etiketleri normal
      // etiket-değer satırlarından ÇOK daha uzun olduğundan, 3200'lük
      // normal durak onlara YETMİYOR (etiket zaten o noktayı geçmiş
      // oluyor, değer sütunu satır satır KAYIYOR) — bu yüzden en uzun
      // etiğin bile sığacağı, tek ve geniş bir durak (6000) kullanılır.
      tabStops: sigRow
        ? sigRowTabStops(lineText)
        : dateRow
        ? [{ type: TabStopType.LEFT, position: 6000 }]
        : [
            { type: TabStopType.LEFT, position: 400 },
            { type: TabStopType.LEFT, position: 3200 },
          ],
    });

    if (footer) footerParagraphs.push(paragraph);
    else paragraphs.push(paragraph);
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "n1-list",
          levels: [{
            level: 0, format: LevelFormat.DECIMAL, text: "%1-", alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: 500, hanging: 300 } }, run: { bold: true } },
          }],
        },
        {
          reference: "n2-list",
          levels: [{
            level: 0, format: LevelFormat.DECIMAL, text: "%1-", alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: 500, hanging: 300 } }, run: { bold: true } },
          }],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
          },
        },
        footers: footerParagraphs.length ? { default: new Footer({ children: footerParagraphs }) } : undefined,
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
