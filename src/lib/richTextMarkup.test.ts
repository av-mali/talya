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
      dateRow: false,
      footer: false,
      bulleted: false,
      numbered: 0,
    });
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
});
