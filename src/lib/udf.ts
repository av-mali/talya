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
import zlib from "zlib";
import fs from "fs";
import path from "path";
import { parseLineMarkup } from "./richTextMarkup";

// UYAP'ın ürettiği bazı UDF dosyaları, "streaming" (akış) modunda
// yazılmış zip'lerdir — asıl sıkıştırılmış içerik sağlamdır, ama
// standart bir ZIP dosyasının sonunda olması gereken "Central Directory"
// (içindekiler listesi) hiç yazılmamıştır. Bu, dosyayı BOZUK yapmaz —
// UYAP'ın kendi programı bunu sorunsuz okur — ama JSZip gibi standarda
// sıkı sıkıya bağlı kütüphaneler reddeder. Bu fonksiyon, o durumda,
// dosyanın en baştaki "local file header"ını elle ayrıştırıp içindeki
// ham DEFLATE verisini doğrudan açar (zlib akışın gerçek bitişini
// kendisi bulur, dosyanın geri kalanını sorun etmez).
function tryRawDeflateExtract(buffer: Buffer): string | null {
  if (buffer.length < 30 || buffer.readUInt32LE(0) !== 0x04034b50) return null; // "PK\x03\x04" imzası yok
  const nameLen = buffer.readUInt16LE(26);
  const extraLen = buffer.readUInt16LE(28);
  const dataStart = 30 + nameLen + extraLen;
  const name = buffer.subarray(30, 30 + nameLen).toString("utf-8");
  if (!name.includes("content.xml")) return null;
  try {
    const inflated = zlib.inflateRawSync(buffer.subarray(dataStart));
    return inflated.toString("utf-8");
  } catch (e) {
    return null; // sıkıştırma yöntemi deflate değilse (nadiren "store" olabilir) burada başarısız olur
  }
}

export async function readUdfText(buffer: Buffer): Promise<string> {
  let xml: string | null = null;
  try {
    const zip = await JSZip.loadAsync(buffer);
    const contentFile = zip.file("content.xml");
    if (contentFile) xml = await contentFile.async("string");
  } catch (e) {
    // JSZip standart kontrolde başarısız oldu — ham deflate ile deniyoruz.
  }

  if (!xml) {
    xml = tryRawDeflateExtract(buffer);
  }

  if (!xml) {
    throw new Error(
      "Bu UDF dosyası okunamadı. Dosya gerçekten bozuk/eksik olabilir — kaynağından tekrar indirip deneyin."
    );
  }

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
// İmza satırlarında (sigRow) kaç imzacı varsa (=satırdaki TAB sayısı,
// satır başındaki tab da dahil — mediationTemplates.ts artık ilk sütun
// için de baştan bir tab ekliyor), her isim KENDİ sütununun TAM
// ORTASINA denk gelecek şekilde CENTER (type=2 — UYAP'ın Java Swing
// tabanlı editöründe javax.swing.text.TabStop.ALIGN_CENTER değeri)
// sekme durakları üretilir: sayfa, sütun sayısı kadar EŞİT dilime
// bölünür, her durak kendi diliminin ortasındadır. Böylece 1, 2 veya 3
// imzacılı satırlar HER ZAMAN sayfa genişliğine düzgün yayılır.
// ÖNCEKİ sabit değer (TabSet="18.0:0:0,69.0:2:0,136.0:0:0,137.0:0:0"),
// v276'dan miras kalmış ve en fazla 137pt'ye kadar gidiyordu — 510pt'lik
// gerçek sayfa genişliğinde isimler birbirine neredeyse yapışık
// görünüyordu (kullanıcının ekran görüntüsüyle doğrulandı).
const UDF_CONTENT_WIDTH_PT = 510.24; // A4 (595.28pt) - 2 * 42.52pt kenar boşluğu (leftMargin/rightMargin ile aynı)
function sigRowTabSet(lineText: string): string {
  const cols = Math.max((lineText.match(/\t/g) || []).length, 1);
  const stops: string[] = [];
  for (let k = 1; k <= cols; k++) {
    const pos = (UDF_CONTENT_WIDTH_PT * (2 * k - 1)) / (2 * cols);
    stops.push(`${pos.toFixed(1)}:2:0`);
  }
  return stops.join(",");
}

// [[SIMG]] imza görseli — kullanıcının gönderdiği, elle görsel eklenmiş
// GERÇEK bir .udf dosyası (content.xml) incelenerek doğrulandı: UYAP
// editörü bir görseli, paylaşılan CDATA metin akışında TEK BİR karaktere
// ("¸" — CEDILLA, U+00B8) karşılık gelen bir <image> öğesiyle temsil
// ediyor — <content> öğesinin resim halindeki karşılığı:
//   <image imageData="BASE64_PNG" width="116.0" height="57.0"
//          startOffset=".." length="1" />
// width/height, görselin doğal piksel boyutuyla (116×57) BİREBİR aynı —
// UYAP'ın kendisi de görseli eklerken bunu punto/point birimi olarak
// kullanıyor, o yüzden biz de aynı değerleri kullanıyoruz (ölçeklemeye
// gerek yok). mediationTemplates.ts, imza "mark" satırında her sütun
// için tam olarak bu placeholder karakteri ("¸") üretir.
let cachedEimzaBase64: string | null = null;
function loadEimzaImageBase64(): string {
  if (!cachedEimzaBase64) {
    const imgPath = path.join(process.cwd(), "src/assets/images/eimza.png");
    cachedEimzaBase64 = fs.readFileSync(imgPath).toString("base64");
  }
  return cachedEimzaBase64;
}

export async function generateUdf(text: string): Promise<Buffer> {
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");

  let plainCdata = "";
  let elementsXml = "";
  // Footer (ör. "Bu evrak ... imzalanmıştır.") satırları gövde akışına
  // DEĞİL, ayrı bir <footer> öğesine yazılır — gerçek UYAP belgelerinde
  // bu cümle italik/kalın/10 punto/mavi (#0080FF) bir sayfa altbilgisi
  // olarak saklanıyor, sıradan bir paragraf değil (ham örnek dosyadan
  // doğrulandı). Metni yine de AYNI paylaşılan CDATA akışının parçası —
  // sadece <elements> içindeki normal paragraf listesine değil, ayrı bir
  // <footer><paragraph> öğesine referans veriyor.
  let footerXml = "";
  let offset = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const isLast = i === rawLines.length - 1;
    const { text: lineText, runs, centered, bulleted, sigRow, sigImage, dateRow, footer } = parseLineMarkup(rawLines[i]);
    const lengthWithBreak = lineText.length + (isLast ? 0 : 1);

    plainCdata += lineText + (isLast ? "" : "\n");

    if (footer && lengthWithBreak > 0) {
      footerXml += `<paragraph Alignment="1"><content italic="true" bold="true" size="10" foreground="-16744193" startOffset="${offset}" length="${lengthWithBreak}" /></paragraph>`;
      offset += lengthWithBreak;
      continue;
    }

    if (lengthWithBreak > 0) {
      // Gerçek örnek belgelerde gövde metninin tamamı "iki yana yaslı"
      // (Alignment="3") — sadece ana başlık satırları ortalanmış (Alignment="1").
      // Madde işaretli paragraflar (HUAK bilgilendirme metinleri gibi)
      // gerçek örnek belgelerde Bulleted="true" ile işaretliydi.
      const alignAttr = centered ? ` Alignment="1"` : ` Alignment="3"`;
      const bulletAttr = bulleted ? ` Bulleted="true" BulletType="BULLET_TYPE_ELLIPSE" ListLevel="1"` : "";
      // Gerçek örnek belgelerin ham XML'inde bulunan sabit sekme
      // noktaları — etiketler ne kadar uzun olursa olsun, değerler hep
      // aynı hizada başlar. İmza satırları (3 sütun, sayfa genişliğine
      // sığması gereken dar sütunlar) AYRI bir sekme düzeni kullanır.
      // Tarih/sonuç satırları (dateRow) çok daha uzun etiketler
      // taşıdığından (ör. "Arabuluculuk Bürosuna Başvuru Tarihi"), normal
      // 163.0'lık durak onlara yetmiyor — etiket zaten o noktayı geçmiş
      // oluyor ve değer, satırdan satıra FARKLI bir yere düşüyordu
      // (hizalanmama şikayetinin sebebi). En uzun etiketin bile sığacağı,
      // tek ve geniş bir durak (300.0) kullanılır.
      const tabSetAttr = centered
        ? ` TabSet="38.0:0:0"`
        : sigRow
        ? ` TabSet="${sigRowTabSet(lineText)}"`
        : dateRow
        ? ` TabSet="300.0:0:0"`
        : ` TabSet="42.0:0:0,163.0:0:0,163.0:0:0"`;
      if (sigImage) {
        // "¸" karakterlerinin her biri <image>'e, aralarındaki (tab gibi)
        // diğer karakterler normal <content>'e çevrilir.
        const eimzaBase64 = loadEimzaImageBase64();
        let inner = "";
        let plainStart = -1;
        const flushPlain = (endIdx: number) => {
          if (plainStart !== -1 && endIdx > plainStart) {
            inner += `<content startOffset="${offset + plainStart}" length="${endIdx - plainStart}" />`;
          }
          plainStart = -1;
        };
        for (let ci = 0; ci < lineText.length; ci++) {
          if (lineText[ci] === "¸") {
            flushPlain(ci);
            inner += `<image imageData="${eimzaBase64}" width="116.0" height="57.0" startOffset="${offset + ci}" length="1" />`;
          } else if (plainStart === -1) {
            plainStart = ci;
          }
        }
        flushPlain(lineText.length);
        if (!isLast) {
          // Satır sonu ("\n") her zaman düz metin — offset lineText.length'te.
          inner += `<content startOffset="${offset + lineText.length}" length="1" />`;
        }
        elementsXml += `<paragraph${alignAttr}${bulletAttr}${tabSetAttr}>${inner}</paragraph>`;
      } else if (!runs.length) {
        elementsXml += `<paragraph${alignAttr}${bulletAttr}${tabSetAttr}><content startOffset="${offset}" length="${lengthWithBreak}" /></paragraph>`;
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
        elementsXml += `<paragraph${alignAttr}${bulletAttr}${tabSetAttr}>${inner}</paragraph>`;
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
<elements resolver="hvl-default" >${elementsXml}${footerXml ? `<footer>${footerXml}</footer>` : ""}</elements>
<styles><style name="default" description="Geçerli" family="Times New Roman" size="12" bold="false" italic="false" /><style name="hvl-default" family="Times New Roman" size="12" description="Gövde" /></styles>
</template>
`;

  const zip = new JSZip();
  zip.file("content.xml", xml);
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return buf;
}
