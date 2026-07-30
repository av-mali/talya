import { describe, it, expect } from "vitest";
import { parseLineMarkup, stripMarkup } from "./richTextMarkup";

describe("parseLineMarkup", () => {
  it("satır başı işaretlerini (marker) doğru bayrağa çevirir ve metinden çıkarır", () => {
    expect(parseLineMarkup("[[C]]Başlık").centered).toBe(true);
    expect(parseLineMarkup("[[C]]Başlık").text).toBe("Başlık");
    expect(parseLineMarkup("[[R]]Sağa yaslı").right).toBe(true);
    expect(parseLineMarkup("[[S]]imza satırı").sigRow).toBe(true);
    expect(parseLineMarkup("[[D]]tarih satırı").dateRow).toBe(true);
    expect(parseLineMarkup("[[F]]altbilgi").footer).toBe(true);
    expect(parseLineMarkup("[[B]]madde").bulleted).toBe(true);
    expect(parseLineMarkup("[[N1]]bir").numbered).toBe(1);
    expect(parseLineMarkup("[[N2]]bir").numbered).toBe(2);
    // İşaretsiz satır: hepsi false/0 olmalı.
    const plain = parseLineMarkup("düz metin");
    expect(plain).toMatchObject({
      centered: false,
      right: false,
      sigRow: false,
      sigImage: false,
      dateRow: false,
      footer: false,
      bulleted: false,
      numbered: 0,
    });
  });

  it("[[SIMG]] hem sigImage HEM sigRow bayrağını true yapar (aynı sekme düzenini paylaşsın diye)", () => {
    const r = parseLineMarkup("[[SIMG]]\t(e-imza)\t(e-imza)");
    expect(r.sigImage).toBe(true);
    expect(r.sigRow).toBe(true);
    expect(r.text).toBe("\t(e-imza)\t(e-imza)");
  });

  it("**kalın**, __altı çizili__ ve **__ikisi birden__** biçimlerini doğru run'a çevirir", () => {
    const bold = parseLineMarkup("**kalın**");
    expect(bold.text).toBe("kalın");
    expect(bold.runs).toEqual([{ start: 0, length: 5, bold: true, underline: false }]);

    const underline = parseLineMarkup("__altı çizili__");
    expect(underline.text).toBe("altı çizili");
    expect(underline.runs).toEqual([{ start: 0, length: 11, bold: false, underline: true }]);

    const both = parseLineMarkup("**__ikisi birden__**");
    expect(both.text).toBe("ikisi birden");
    expect(both.runs).toEqual([{ start: 0, length: 12, bold: true, underline: true }]);
  });

  it("aynı satırda düz ve biçimli parçaları doğru offset'lerle ayırır (imza/tarih satırlarında kritik)", () => {
    // Gerçek örnek: [[D]] tarih satırı — etiket kalın+altı çizili, değer sadece kalın.
    const r = parseLineMarkup("[[D]]**__Başvuru Tarihi__**\t**: 01.01.2026**");
    expect(r.dateRow).toBe(true);
    expect(r.text).toBe("Başvuru Tarihi\t: 01.01.2026");
    expect(r.runs).toEqual([
      { start: 0, length: 14, bold: true, underline: true }, // "Başvuru Tarihi"
      { start: 15, length: 12, bold: true, underline: false }, // ": 01.01.2026"
    ]);
  });

  it("[[S]] satırındaki baştaki tab, ilk sütunun da kendi run'ı olarak korunur", () => {
    // buildSignatureBlock artık her imza satırının BAŞINA da bir tab
    // ekliyor (v280 düzeltmesi) — bu tab bold run'ın DIŞINDA, ayrı bir
    // düz segment olarak kalmalı ki offset hesapları kaymasın.
    const r = parseLineMarkup("[[S]]\t**Ad Soyad**\t**İkinci Kişi**");
    expect(r.sigRow).toBe(true);
    expect(r.text).toBe("\tAd Soyad\tİkinci Kişi");
    expect(r.runs).toEqual([
      { start: 1, length: 8, bold: true, underline: false },
      { start: 10, length: 11, bold: true, underline: false },
    ]);
  });
});

describe("stripMarkup", () => {
  it("tüm işaretleri temizler, [[B]] satırını görünür madde imine çevirir", () => {
    const input = ["[[C]]**Başlık**", "[[B]]Madde metni", "**kalın** __altı__ __**ikisi**__ ve düz"].join("\n");
    const out = stripMarkup(input);
    expect(out).toBe(["Başlık", "• Madde metni", "kalın altı ikisi ve düz"].join("\n"));
  });

  it("[[SZ14]] (punto işareti) da temizlenir", () => {
    expect(stripMarkup("[[SZ14]][[C]]**Başlık**")).toBe("Başlık");
  });
});

describe("[[SZ14]] — satır boyu punto işareti", () => {
  it("fontSize'ı doğru okur ve metinden çıkarır, diğer işaretlerle (ör. [[C]]) birlikte çalışır", () => {
    const r = parseLineMarkup("[[SZ14]][[C]]**Başlık Metni**");
    expect(r.fontSize).toBe(14);
    expect(r.centered).toBe(true);
    expect(r.text).toBe("Başlık Metni");
    expect(r.runs).toEqual([{ start: 0, length: 12, bold: true, underline: false }]);
  });

  it("işaret yoksa fontSize tanımsız (undefined) kalır", () => {
    expect(parseLineMarkup("düz metin").fontSize).toBeUndefined();
  });
});

describe("tarih satırı — etiket VE ':' birlikte altı çizili, tab yok (v293)", () => {
  it("'Etiket:__****  değer**' kalıbı, etiket+':' tek altı çizili+kalın run, değer (baştaki boşluk dahil) ayrı kalın-sadece run üretir", () => {
    const r = parseLineMarkup("[[D]]**__Tutanağının Düzenlendiği Tarih:__**** 28.06.2026**");
    expect(r.dateRow).toBe(true);
    expect(r.text).toBe("Tutanağının Düzenlendiği Tarih: 28.06.2026");
    expect(r.runs).toEqual([
      { start: 0, length: 31, bold: true, underline: true },
      { start: 31, length: 11, bold: true, underline: false },
    ]);
  });
});

describe("alt başlıklar (ARABULUCULUK BÜROSU vb.) — etiketten sonraki İLK tab da altı çizili run'a dahil (v293)", () => {
  it("'**__Etiket\\t__**' kalıbında tab, altı çizili run'ın İÇİNDE kalır", () => {
    const r = parseLineMarkup("**__ARABULUCULUK BÜROSU\t__**\t\t\t");
    expect(r.text).toBe("ARABULUCULUK BÜROSU\t\t\t\t");
    expect(r.runs).toEqual([{ start: 0, length: 20, bold: true, underline: true }]);
  });
});
