// AI çıktısını basit, düzgün biçimlendirilmiş bir Word (.docx) belgesine
// çevirir. Word, yazı tipini OKUYAN kişinin bilgisayarındaki fonttan
// aldığı için (PDF'in aksine yazı tipini gömmek gerekmez), Türkçe
// karakterler (ç, ğ, ı, ö, ş, ü) sorunsuz görünür.

import { Document, Packer, Paragraph, TextRun } from "docx";

export async function generateDocx(text: string): Promise<Buffer> {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  const paragraphs = lines.map((line) => {
    // "**kalın**" işaretli markdown satırlarını basitçe kalın yazıya çevir.
    const boldMatch = line.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      return new Paragraph({
        children: [new TextRun({ text: boldMatch[1], bold: true })],
      });
    }
    return new Paragraph({
      children: [new TextRun(line)],
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
