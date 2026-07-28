import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { generateDocx } from "./docExport";

// generateDocx() bir .docx (aslında ZIP) üretir; word/document.xml
// içindeki gerçek <w:tabs> ve footer XML'ini kontrol ediyoruz.
async function documentXml(text: string): Promise<string> {
  const buf = await generateDocx(text);
  const zip = await JSZip.loadAsync(buf);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("word/document.xml bulunamadı");
  return file.async("string");
}

describe("generateDocx — imza satırı (sigRow) sekme durakları", () => {
  // ÖNEMLİ: docx kütüphanesi sayfa boyutunu açıkça belirtmediğimiz için
  // kendi VARSAYILANINI (A4 — 11906 twips) kullanıyor, Letter (12240)
  // DEĞİL — bu yüzden udf.ts'teki (pt) değerlerin twips karşılığı birebir
  // aynı SAYI değil, ama aynı ORAN (çeyrek/yarı/üç-çeyrek).
  it("2 imzacılı satırda çeyrek/üç-çeyrek noktalarında CENTER durak olur", async () => {
    const xml = await documentXml("[[S]]\t**Ali**\t**Veli**");
    expect(xml).toContain('<w:tab w:val="center" w:pos="2437"/>');
    expect(xml).toContain('<w:tab w:val="center" w:pos="7310"/>');
  });

  it("1 imzacılı (tek/taşan isim) satırda tek durak sayfanın TAM ORTASINDA olur", async () => {
    const xml = await documentXml("[[S]]\t**Tek Kişi**");
    expect(xml).toContain('<w:tab w:val="center" w:pos="4873"/>');
  });

  it("3 imzacılı satırda sayfa üç eşit dilime bölünür", async () => {
    const xml = await documentXml("[[S]]\t**A**\t**B**\t**C**");
    expect(xml).toContain('<w:tab w:val="center" w:pos="1624"/>');
    expect(xml).toContain('<w:tab w:val="center" w:pos="4873"/>');
    expect(xml).toContain('<w:tab w:val="center" w:pos="8122"/>');
  });
});

describe("generateDocx — [[F]] footer", () => {
  it("footer satırı gövdeye değil, gerçek Word footer'ına (w:ftr) yazılır", async () => {
    const buf = await generateDocx(
      "Gövde metni.\n\n[[F]]Bu evrak 5070 sayılı Elektronik İmza Kanunu hükümlerine uygun olarak elektronik imza ile imzalanmıştır."
    );
    const zip = await JSZip.loadAsync(buf);
    const footerFile = Object.keys(zip.files).find((n) => /word\/footer\d*\.xml/.test(n));
    expect(footerFile).toBeTruthy();
    const footerXml = await zip.file(footerFile!)!.async("string");
    expect(footerXml).toContain("Bu evrak 5070 sayılı Elektronik İmza Kanunu");
    // Gövde belgesinde footer cümlesi TEKRAR etmemeli.
    const bodyXml = await zip.file("word/document.xml")!.async("string");
    expect(bodyXml).not.toContain("Bu evrak 5070 sayılı");
  });

  it("footer olmayan bir belgede footer dosyası hiç üretilmez", async () => {
    const buf = await generateDocx("Sadece gövde metni, footer yok.");
    const zip = await JSZip.loadAsync(buf);
    const footerFile = Object.keys(zip.files).find((n) => /word\/footer\d*\.xml/.test(n));
    expect(footerFile).toBeFalsy();
  });
});
