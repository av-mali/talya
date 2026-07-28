import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { generateUdf } from "./udf";

// generateUdf() bir .udf (aslında ZIP) dosyası üretir; içindeki
// content.xml'i açıp gerçek TabSet/footer değerlerini kontrol ediyoruz —
// bu, UYAP editöründe GÖRSEL olarak doğru hizalanıp hizalanmadığının
// dolaylı ama otomatikleştirilebilir tek kanıtı.
async function contentXml(text: string): Promise<string> {
  const buf = await generateUdf(text);
  const zip = await JSZip.loadAsync(buf);
  const file = zip.file("content.xml");
  if (!file) throw new Error("content.xml bulunamadı");
  return file.async("string");
}

describe("generateUdf — imza satırı (sigRow) TabSet'i", () => {
  it("1 imzacılı satırda tek durak sayfanın TAM ORTASINDA olur", async () => {
    const xml = await contentXml("[[S]]\t**Tek Kişi**");
    expect(xml).toContain('TabSet="255.1:2:0"');
  });

  it("2 imzacılı satırda çeyrek/üç-çeyrek noktalarında CENTER durak olur (v280 düzeltmesi)", async () => {
    const xml = await contentXml("[[S]]\t**Ali**\t**Veli**");
    expect(xml).toContain('TabSet="127.6:2:0,382.7:2:0"');
  });

  it("3 imzacılı satırda sayfa üç eşit dilime bölünür", async () => {
    const xml = await contentXml("[[S]]\t**A**\t**B**\t**C**");
    expect(xml).toContain('TabSet="85.0:2:0,255.1:2:0,425.2:2:0"');
  });

  it("ESKİ dar TabSet (en fazla 137pt) bir daha geri gelmemeli", async () => {
    const xml = await contentXml("[[S]]\t**Ali**\t**Veli**");
    expect(xml).not.toContain("18.0:0:0,69.0:2:0,136.0:0:0,137.0:0:0");
  });
});

describe("generateUdf — [[SIMG]] (gerçek e-imza görseli)", () => {
  // Yapı, kullanıcının gönderdiği GERÇEK bir .udf örneği (elle görsel
  // eklenmiş) incelenerek doğrulandı: UYAP, bir görseli paylaşılan metin
  // akışında TEK KARAKTERLİK ("¸" — CEDILLA) bir <image> öğesiyle temsil
  // ediyor — <content>'in resim hâli.
  it("her '¸' karakterini <image> öğesine çevirir, aradaki tab'ları normal <content> olarak bırakır", async () => {
    const xml = await contentXml("[[SIMG]]\t¸\t¸");
    const images = [...xml.matchAll(/<image imageData="([^"]+)" width="([^"]+)" height="([^"]+)" startOffset="(\d+)" length="(\d+)" \/>/g)];
    expect(images).toHaveLength(2);
    for (const m of images) {
      expect(m[2]).toBe("116.0"); // width — orijinal görselin doğal piksel boyutu
      expect(m[3]).toBe("57.0"); // height
      expect(m[5]).toBe("1"); // length — her görsel TEK karakterlik bir yer kaplar
    }
    // İki görsel arasındaki (ve önündeki) tab karakterleri normal <content> kalmalı.
    expect(xml).toContain('<content startOffset="0" length="1" />'); // baştaki tab
    expect(xml).toContain('<content startOffset="2" length="1" />'); // aradaki tab

    // Aynı 2-sütun dinamik CENTER TabSet'i (sigRow ile birebir aynı mantık).
    expect(xml).toContain('TabSet="127.6:2:0,382.7:2:0"');
  });

  it("gömülen imageData, gerçek eimza.png dosyasının base64'ü ile birebir eşleşir", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const expectedBase64 = fs.readFileSync(path.join(process.cwd(), "src/assets/images/eimza.png")).toString("base64");

    const xml = await contentXml("[[SIMG]]\t¸");
    const m = xml.match(/<image imageData="([^"]+)"/);
    expect(m?.[1]).toBe(expectedBase64);
  });

  it("CDATA metninde '¸' karakteri hâlâ görünür (image, aynı paylaşılan metin akışının bir parçası)", async () => {
    const xml = await contentXml("[[SIMG]]\t¸\t¸");
    const cdata = xml.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] || "";
    expect((cdata.match(/¸/g) || []).length).toBe(2);
  });
});

describe("generateUdf — diğer satır türleri", () => {
  it("[[D]] (tarih) satırı geniş tek sekme durağı kullanır", async () => {
    const xml = await contentXml("[[D]]**__Başvuru Tarihi__**\t**: 01.01.2026**");
    expect(xml).toContain('TabSet="300.0:0:0"');
  });

  it("[[C]] (ortalı) satır kendi TabSet'ini korur", async () => {
    const xml = await contentXml("[[C]]**Başlık**");
    expect(xml).toContain('TabSet="38.0:0:0"');
  });

  it("normal etiket-değer satırı varsayılan TabSet'i kullanır", async () => {
    const xml = await contentXml("Etiket\t: değer");
    expect(xml).toContain('TabSet="42.0:0:0,163.0:0:0,163.0:0:0"');
  });
});

describe("generateUdf — [[F]] footer", () => {
  it("footer satırını gövdeye DEĞİL, ayrı <footer> elementine yazar", async () => {
    const xml = await contentXml(
      "Gövde metni.\n\n[[F]]Bu evrak 5070 sayılı Elektronik İmza Kanunu hükümlerine uygun olarak elektronik imza ile imzalanmıştır."
    );
    expect(xml).toContain("<footer>");
    const footerMatch = xml.match(/<footer>([\s\S]*?)<\/footer>/);
    expect(footerMatch).toBeTruthy();
    expect(footerMatch![1]).toContain('italic="true"');
    expect(footerMatch![1]).toContain('bold="true"');
    expect(footerMatch![1]).toContain('size="10"');
    expect(footerMatch![1]).toContain('foreground="-16744193"');
  });

  it("footer olmayan bir belgede <footer> elementi hiç eklenmez", async () => {
    const xml = await contentXml("Sadece gövde metni, footer yok.");
    expect(xml).not.toContain("<footer>");
  });
});
