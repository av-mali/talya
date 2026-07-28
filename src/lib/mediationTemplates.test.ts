import { describe, it, expect } from "vitest";
import { avLabel, v, balancedRows, buildSignatureBlock } from "./mediationTemplates";

describe("avLabel", () => {
  it("önek yoksa ekler, zaten varsa TEKRARLAMAZ (Av. Av. hatası)", () => {
    expect(avLabel("Kübra KURT")).toBe("Av. Kübra KURT");
    expect(avLabel("Av. Kübra KURT")).toBe("Av. Kübra KURT");
    expect(avLabel("Avukat Kübra KURT")).toBe("Av. Kübra KURT");
  });

  it("boş/tanımsız değerde boş döner (sabit '……………' vs. yazmaz)", () => {
    expect(avLabel("")).toBe("");
    expect(avLabel(undefined)).toBe("");
    expect(avLabel(null)).toBe("");
  });
});

describe("v()", () => {
  it("telefon numarasını KIRPMAZ (eski stripTcFromName hatası — 11 haneli sayı + ek metin)", () => {
    // Eski hatada "05321234567 (iş)" gibi bir telefon, TC/vergi no
    // regex'ine takılıp sessizce sadece "(iş)" kısmına düşüyordu.
    expect(v("05321234567 (iş)")).toBe("05321234567 (iş)");
    expect(v("05321234567")).toBe("05321234567");
  });

  it("köşeli parantezleri temizler, boşta fallback döner", () => {
    expect(v("[Haksız Fiilden Kaynaklanan (Nisbi)]")).toBe("Haksız Fiilden Kaynaklanan (Nisbi)");
    expect(v("")).toBe("……………");
    expect(v(null)).toBe("……………");
    expect(v(undefined, "yok")).toBe("yok");
  });
});

describe("balancedRows", () => {
  it("4 öğeyi 3+1 değil 2+2 olarak böler (öksüz imzacı bırakmaz)", () => {
    expect(balancedRows([1, 2, 3, 4], 3)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("maxPerRow'u aşmayan en dengeli dağılımı üretir (1-7 arası tüm sayılar)", () => {
    expect(balancedRows([1], 3)).toEqual([[1]]);
    expect(balancedRows([1, 2], 3)).toEqual([[1, 2]]);
    expect(balancedRows([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    expect(balancedRows([1, 2, 3, 4, 5], 3)).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
    expect(balancedRows([1, 2, 3, 4, 5, 6], 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    expect(balancedRows([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([
      [1, 2, 3],
      [4, 5],
      [6, 7],
    ]);
  });

  it("boş dizide boş dizi döner", () => {
    expect(balancedRows([], 3)).toEqual([]);
  });
});

describe("buildSignatureBlock", () => {
  it("4 imzacıyı 2x2 olarak diziyor, her satır başına hizalama için tab ekliyor, isimler kalın", () => {
    const c: any = {
      basvurucuVekilAd: "Mehmet Devran DEVRİM",
      karsiTaraflar: [{ vekilAd: "Aylin BAHADIR" }, { vekilAd: "Ali ÇEKİÇ" }],
    };
    const a: any = { name: "Mehmet Ali ŞAHİN", arabulucuSicilNo: "35701" };
    const block = buildSignatureBlock(c, a);

    const nameLines = block.split("\n").filter((l) => l.startsWith("[[S]]") && l.includes("**"));
    expect(nameLines).toHaveLength(2);
    // Her isim satırı [[S]] işaretinden hemen sonra bir TAB ile başlamalı
    // (v280: ilk sütun da kendi sekme durağında ortalansın diye).
    for (const line of nameLines) {
      expect(line.startsWith("[[S]]\t")).toBe(true);
    }
    expect(nameLines[0]).toContain("**Mehmet Devran DEVRİM**");
    expect(nameLines[0]).toContain("**Aylin BAHADIR**");
    expect(nameLines[1]).toContain("**Ali ÇEKİÇ**");
    expect(nameLines[1]).toContain("**Arb. Mehmet Ali ŞAHİN**");
  });

  it("kapanış cümlesini gerçek bir FOOTER (gövde değil) olarak işaretliyor", () => {
    const c: any = {};
    const a: any = { name: "Test Arabulucu" };
    const block = buildSignatureBlock(c, a);
    expect(block).toContain("[[F]]Bu evrak 5070 sayılı Elektronik İmza Kanunu");
  });
});
