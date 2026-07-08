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

export async function generateUdf(text: string): Promise<Buffer> {
  // Gerçek, minimal bir örnek UDF dosyası (elle test edilmiş, sorunsuz
  // açılan) incelenerek şu kritik eksikler bulundu ve düzeltildi:
  //  1) <styles> bölümü hiç yoktu — <elements resolver="hvl-default">
  //     bu isimde bir stile referans veriyor ama tanımı olmayınca
  //     görüntüleyici muhtemelen çöküyordu. Şimdi ekleniyor.
  //  2) <paragraph> etiketine gereksiz bir Alignment="0" eklemiştik;
  //     minimal örnekte hiç Alignment yok — kaldırıldı.
  //  3) Baştaki fazladan "\n" kaldırıldı (gerekli değilmiş).

  // CDATA içinde "]]>" dizisi geçerse XML bozulur — standart XML kaçış
  // tekniğiyle bunu güvenli hale getiriyoruz.
  const cdataContent = (text.replace(/\r\n/g, "\n") + "\n").replace(/]]>/g, "]]]]><![CDATA[>");
  const lines = cdataContent.split("\n");

  let offset = 0;
  let elementsXml = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLast = i === lines.length - 1;
    const lengthWithBreak = line.length + (isLast ? 0 : 1);
    // Son satır tamamen boşsa (sondaki \n'den sonra kalan iz), uzunluğu 0
    // olan bir paragraf oluşturmuyoruz.
    if (lengthWithBreak > 0) {
      elementsXml += `<paragraph><content startOffset="${offset}" length="${lengthWithBreak}" /></paragraph>`;
    }
    offset += lengthWithBreak;
  }

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
