import { describe, it, expect } from "vitest";
import {
  DEFAULT_TARIFF,
  calcBirinciKisimSaatlik,
  calcIkinciKisim,
  calculateMediationFee,
} from "./feeTariff";

describe("calcBirinciKisimSaatlik", () => {
  const aile = DEFAULT_TARIFF.birinciKisim.find((r) => r.key === "aile")!;

  it("2 kişi — taraf başına ücret, TOPLAM taraf sayısıyla çarpılır", () => {
    expect(calcBirinciKisimSaatlik(aile, 2)).toBe(2000); // 1000 x 2
  });

  it("3-5 kişi — taraf sayısı gözetmeksizin TEK bir toplam ücret", () => {
    expect(calcBirinciKisimSaatlik(aile, 3)).toBe(2200);
    expect(calcBirinciKisimSaatlik(aile, 5)).toBe(2200);
  });

  it("6-10 ve 11+ dilimleri doğru seçilir", () => {
    expect(calcBirinciKisimSaatlik(aile, 6)).toBe(2300);
    expect(calcBirinciKisimSaatlik(aile, 10)).toBe(2300);
    expect(calcBirinciKisimSaatlik(aile, 11)).toBe(2400);
    expect(calcBirinciKisimSaatlik(aile, 40)).toBe(2400);
  });

  it("2'den az taraf sayısı gönderilirse 2 kabul edilir (arabuluculukta tek taraf olmaz)", () => {
    expect(calcBirinciKisimSaatlik(aile, 1)).toBe(2000);
    expect(calcBirinciKisimSaatlik(aile, 0)).toBe(2000);
  });
});

describe("calcIkinciKisim — kademeli dilim hesabı", () => {
  it("1.000.000 TL, TEK arabulucu: ilk 600.000 %6 + kalan 400.000 %5", () => {
    const { toplam } = calcIkinciKisim(DEFAULT_TARIFF.ikinciKisim, 1000000, true);
    expect(Math.round(toplam)).toBe(36000 + 20000);
  });

  it("1.000.000 TL, BİRDEN FAZLA arabulucu: ilk 600.000 %9 + kalan 400.000 %7,5", () => {
    const { toplam } = calcIkinciKisim(DEFAULT_TARIFF.ikinciKisim, 1000000, false);
    expect(Math.round(toplam)).toBe(54000 + 30000);
  });

  it("son (sınırsız) dilime kadar TÜM dilimler doğru sırayla tüketilir — 60.000.000 TL", () => {
    // 600k@6 + 960k@5 + 1560k@4 + 3120k@3 + 9360k@2 + 12480k@1.5 + 24960k@1 + kalan(60M-53040k=6960k)@0.5
    const beklenen =
      600000 * 0.06 +
      960000 * 0.05 +
      1560000 * 0.04 +
      3120000 * 0.03 +
      9360000 * 0.02 +
      12480000 * 0.015 +
      24960000 * 0.01 +
      6960000 * 0.005;
    const { toplam } = calcIkinciKisim(DEFAULT_TARIFF.ikinciKisim, 60000000, true);
    expect(Math.round(toplam)).toBe(Math.round(beklenen));
  });

  it("tutar 0 veya negatifse katkı üretmez", () => {
    expect(calcIkinciKisim(DEFAULT_TARIFF.ikinciKisim, 0, true).toplam).toBe(0);
    expect(calcIkinciKisim(DEFAULT_TARIFF.ikinciKisim, -500, true).toplam).toBe(0);
  });
});

describe("calculateMediationFee — MADDE 7 dallanmaları", () => {
  it("MADDE 7/3 — anlaşma sağlanamazsa, konu PARASAL olsa BİLE Birinci Kısım uygulanır", () => {
    const r = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasilamadi",
      parasalMi: true,
      uyusmazlikKategori: "ticari",
      tarafSayisi: 2,
      saat: 1,
    });
    expect(r.toplamUcret).toBe(1500 * 2); // ticari, 2 kişi, 1 saat
    expect(r.maddeAciklama).toContain("MADDE 7/3");
  });

  it("MADDE 7/1 — anlaşıldı ama konu parasal değilse Birinci Kısım uygulanır", () => {
    const r = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasildi",
      parasalMi: false,
      uyusmazlikKategori: "isci_isveren",
      tarafSayisi: 2,
      saat: 2,
    });
    expect(r.toplamUcret).toBe(1130 * 2 * 2); // 2 kişi taraf başına x 2 saat
  });

  it("MADDE 7/7 — genel parasal uyuşmazlıkta hesaplanan ücret 9.000 TL'nin altında kalırsa taban uygulanır", () => {
    const r = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasildi",
      parasalMi: true,
      ozelDurum: "yok",
      anlasmaTutari: 50000, // %6 = 3000, taban altı
      arabulucuSayisi: "tek",
    });
    expect(r.toplamUcret).toBe(9000);
    expect(r.tabanUygulandiMi).toBe(true);
  });

  it("genel parasal uyuşmazlıkta yüksek tutarda taban UYGULANMAZ", () => {
    const r = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasildi",
      parasalMi: true,
      ozelDurum: "yok",
      anlasmaTutari: 1000000,
      arabulucuSayisi: "tek",
    });
    expect(r.toplamUcret).toBe(56000);
    expect(r.tabanUygulandiMi).toBe(false);
  });

  it("MADDE 7/4 — seri uyuşmazlıkta ticari/diğer birim ücret adetle çarpılır", () => {
    const ticari = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasildi", parasalMi: true, ozelDurum: "seri", seriTuru: "ticari", seriAdedi: 10,
    });
    expect(ticari.toplamUcret).toBe(7500 * 10);

    const diger = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasildi", parasalMi: true, ozelDurum: "seri", seriTuru: "diger", seriAdedi: 10,
    });
    expect(diger.toplamUcret).toBe(6000 * 10);
  });

  it("MADDE 7/6 — ortaklığın giderilmesi/ticari uyuşmazlıkta taban 13.000 TL'dir (genel 9.000'den farklı)", () => {
    const r = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasildi",
      parasalMi: true,
      ozelDurum: "ortaklik_ticari",
      anlasmaTutari: 100000, // %6 = 6000, ozel taban altı
      arabulucuSayisi: "tek",
    });
    expect(r.toplamUcret).toBe(13000);
  });

  it("MADDE 7/5 — tahliye talepli uyuşmazlıkta taban, yıllık kira bedelinin YARISI üzerinden hesaplanır", () => {
    const r = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasildi",
      parasalMi: true,
      ozelDurum: "kira_tahliye",
      kiraBedeli: 2000000, // taban = 1.000.000
      arabulucuSayisi: "tek",
    });
    expect(r.toplamUcret).toBe(56000); // 1.000.000 TL'lik ikinci kısım hesabıyla aynı
  });

  it("MADDE 7/5 — kira tespiti uyuşmazlığında taban DOĞRUDAN belirtilen yıllık fark tutarıdır (yarısı alınmaz)", () => {
    const r = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasildi",
      parasalMi: true,
      ozelDurum: "kira_tespit",
      kiraBedeli: 1000000,
      arabulucuSayisi: "tek",
    });
    expect(r.toplamUcret).toBe(56000);
  });

  it("bilinmeyen/boş uyuşmazlık kategorisi verilirse 'diğer' kategorisine düşer, hata fırlatmaz", () => {
    const r = calculateMediationFee(DEFAULT_TARIFF, {
      sonuc: "anlasilamadi",
      uyusmazlikKategori: "olmayan_kategori",
      tarafSayisi: 2,
      saat: 1,
    });
    expect(r.toplamUcret).toBe(1000 * 2); // "diger" kategorisi: 2 kişi x 1000
  });
});
