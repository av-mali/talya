// Arabuluculuk Asgari Ücret Tarifesi — hesap motoru ve varsayılan (2026)
// veri seti. Bu dosya BİLEREK "sabit" değildir: gerçek kaynak veri artık
// veritabanında (MediationFeeTariff, tek satır) tutulur ve admin panelinden
// güncellenir; buradaki DEFAULT_TARIFF sadece (a) veritabanında henüz kayıt
// yokken kullanılacak İLK DEĞERLERİ ve (b) admin PDF/görsel yüklemediğinde
// bile aracın çalışır durumda olmasını sağlar. Sayılar, kullanıcının
// yüklediği resmi Tebliğ'den (26 Aralık 2025, Resmî Gazete Sayı: 33119,
// "2026 Yılı Arabuluculuk Asgari Ücret Tarifesi") elle doğrulanarak alınmıştır.

export type BirinciKisimRow = {
  key: string;
  label: string;
  iki: number; // 2 kişi taraf olması durumunda, TARAF BAŞINA ücret (bir saat için)
  uc5: number; // 3-5 kişi, taraf sayısı gözetmeksizin TOPLAM (bir saat için)
  alti10: number; // 6-10 kişi, taraf sayısı gözetmeksizin TOPLAM
  onbirUstu: number; // 11 ve üzeri, taraf sayısı gözetmeksizin TOPLAM
};

export type IkinciKisimDilim = {
  // Bu dilimin genişliği (TL). null = son (sınırsız) dilim.
  genislik: number | null;
  tekOran: number; // % — tek arabulucu görev yaparsa
  cokluOran: number; // % — birden fazla arabulucu görev yaparsa
};

export type MediationFeeTariffData = {
  yil: number;
  genelAsgariUcret: number; // MADDE 7/7 — anlaşma sağlanırsa, tutar ne olursa olsun bu tutardan az olamaz
  ortakligininGiderilmesiTicariAsgari: number; // MADDE 7/6 — ortaklığın giderilmesi + ticari uyuşmazlıklarda taban
  seriUyusmazlikTicari: number; // MADDE 7/4 — seri uyuşmazlık, ticari, uyuşmazlık başına
  seriUyusmazlikDiger: number; // MADDE 7/4 — seri uyuşmazlık, diğer, uyuşmazlık başına
  birinciKisim: BirinciKisimRow[];
  ikinciKisim: IkinciKisimDilim[];
};

export const DEFAULT_TARIFF: MediationFeeTariffData = {
  yil: 2026,
  genelAsgariUcret: 9000,
  ortakligininGiderilmesiTicariAsgari: 13000,
  seriUyusmazlikTicari: 7500,
  seriUyusmazlikDiger: 6000,
  birinciKisim: [
    { key: "aile", label: "Aile Hukuku ile İlgili Uyuşmazlıklarda", iki: 1000, uc5: 2200, alti10: 2300, onbirUstu: 2400 },
    { key: "ticari", label: "Ticari Uyuşmazlıklarda", iki: 1500, uc5: 3200, alti10: 3300, onbirUstu: 3400 },
    { key: "isci_isveren", label: "İşçi - İşveren Uyuşmazlıklarında", iki: 1130, uc5: 2460, alti10: 2560, onbirUstu: 2660 },
    { key: "tuketici", label: "Tüketici Uyuşmazlıklarında", iki: 1000, uc5: 2200, alti10: 2300, onbirUstu: 2400 },
    { key: "kira_komsu_kat_mulkiyeti", label: "Kira, Komşu Hakkı ve Kat Mülkiyeti Kanunundan Kaynaklanan Uyuşmazlıklarda", iki: 1170, uc5: 2540, alti10: 2640, onbirUstu: 2740 },
    { key: "ortakligin_giderilmesi", label: "Ortaklığın Giderilmesi Uyuşmazlıklarında", iki: 1170, uc5: 2540, alti10: 2640, onbirUstu: 2740 },
    { key: "diger", label: "Diğer Tür Uyuşmazlıklarda", iki: 1000, uc5: 2200, alti10: 2300, onbirUstu: 2400 },
  ],
  ikinciKisim: [
    { genislik: 600000, tekOran: 6, cokluOran: 9 },
    { genislik: 960000, tekOran: 5, cokluOran: 7.5 },
    { genislik: 1560000, tekOran: 4, cokluOran: 6 },
    { genislik: 3120000, tekOran: 3, cokluOran: 4.5 },
    { genislik: 9360000, tekOran: 2, cokluOran: 3 },
    { genislik: 12480000, tekOran: 1.5, cokluOran: 2.5 },
    { genislik: 24960000, tekOran: 1, cokluOran: 1.5 },
    { genislik: null, tekOran: 0.5, cokluOran: 1 },
  ],
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Birinci Kısım (saatlik/konusu para olmayan) hesabı. `tarafSayisi` en az 2
// olmalı (arabuluculukta tek taraf olmaz); değer 2'nin altındaysa 2 kabul edilir.
export function calcBirinciKisimSaatlik(row: BirinciKisimRow, tarafSayisi: number): number {
  const n = Math.max(2, Math.round(tarafSayisi || 2));
  if (n <= 2) return row.iki * n; // "taraf başına" — 2 taraf için toplam
  if (n <= 5) return row.uc5; // "taraf sayısı gözetmeksizin" toplam
  if (n <= 10) return row.alti10;
  return row.onbirUstu;
}

// İkinci Kısım (parasal, kademeli/dilimli) hesabı — anlaşılan/tespit edilen
// tutar üzerinden, dilim dilim (kademeli, Türk gelir vergisi dilimlerine
// benzer mantıkla) uygulanır.
export function calcIkinciKisim(dilimler: IkinciKisimDilim[], tutar: number, tekArabulucu: boolean): { toplam: number; detay: { dilimTutari: number; oran: number; katki: number }[] } {
  let kalan = Math.max(0, tutar || 0);
  let toplam = 0;
  const detay: { dilimTutari: number; oran: number; katki: number }[] = [];
  for (const d of dilimler) {
    if (kalan <= 0) break;
    const genislik = d.genislik === null || d.genislik === undefined ? kalan : d.genislik;
    const buDilim = Math.min(kalan, genislik);
    if (buDilim <= 0) continue;
    const oran = tekArabulucu ? d.tekOran : d.cokluOran;
    const katki = buDilim * (oran / 100);
    toplam += katki;
    detay.push({ dilimTutari: buDilim, oran, katki: round2(katki) });
    kalan -= buDilim;
  }
  return { toplam, detay };
}

export type FeeCalcInput = {
  // 1) Süreç sonucu — MADDE 7/3: anlaşılamazsa, konu parasal olsa BİLE
  // Birinci Kısım (saatlik) uygulanır.
  sonuc: "anlasildi" | "anlasilamadi";

  // 2) Anlaşıldıysa: uyuşmazlık konusu para ile ilgili mi?
  parasalMi?: boolean;

  // 3) Parasal + anlaşıldıysa özel durum seçimi
  ozelDurum?: "yok" | "seri" | "kira_tahliye" | "kira_tespit" | "ortaklik_ticari";

  // Birinci Kısım için (anlaşılamadı VEYA parasal değilse) gerekli alanlar
  uyusmazlikKategori?: string; // BirinciKisimRow.key
  tarafSayisi?: number;
  saat?: number;

  // İkinci Kısım / parasal hesap için gerekli alanlar
  arabulucuSayisi?: "tek" | "coklu";
  anlasmaTutari?: number; // "yok" (genel parasal) durumunda
  kiraBedeli?: number; // tahliye: yıllık kira bedeli; tespit: yıllık kira farkı
  seriTuru?: "ticari" | "diger";
  seriAdedi?: number;
};

export type FeeCalcResult = {
  toplamUcret: number;
  maddeAciklama: string; // hangi Tebliğ maddesi uygulandı
  ozet: string; // kısa Türkçe özet
  detaySatirlari: string[]; // hesaplama adımları (makbuz benzeri döküm)
  tabanUygulandiMi: boolean;
};

export function calculateMediationFee(tariff: MediationFeeTariffData, input: FeeCalcInput): FeeCalcResult {
  const detaySatirlari: string[] = [];
  const tekArabulucu = (input.arabulucuSayisi || "tek") !== "coklu";

  const findKategori = (key?: string): BirinciKisimRow =>
    tariff.birinciKisim.find((r) => r.key === key) || tariff.birinciKisim.find((r) => r.key === "diger") || tariff.birinciKisim[tariff.birinciKisim.length - 1];

  // ── MADDE 7/3: Anlaşma sağlanamadıysa → HER ZAMAN Birinci Kısım ──
  if (input.sonuc === "anlasilamadi") {
    const row = findKategori(input.uyusmazlikKategori);
    const saat = Math.max(1, input.saat || 1);
    const saatlik = calcBirinciKisimSaatlik(row, input.tarafSayisi || 2);
    const toplam = saatlik * saat;
    detaySatirlari.push(`Uyuşmazlık türü: ${row.label}`);
    detaySatirlari.push(`Taraf sayısı: ${Math.max(2, Math.round(input.tarafSayisi || 2))}`);
    detaySatirlari.push(`Saatlik ücret: ${saatlik.toLocaleString("tr-TR")} TL × ${saat} saat`);
    return {
      toplamUcret: round2(toplam),
      maddeAciklama: "MADDE 7/3 — anlaşma sağlanamaması hâlinde, konu parasal olsa bile Birinci Kısım (saatlik tarife) uygulanır.",
      ozet: "Anlaşma sağlanamadı — Birinci Kısım (saatlik) tarifeye göre hesaplandı.",
      detaySatirlari,
      tabanUygulandiMi: false,
    };
  }

  // ── Anlaşma sağlandı, konu parasal DEĞİL → Birinci Kısım ──
  if (!input.parasalMi) {
    const row = findKategori(input.uyusmazlikKategori);
    const saat = Math.max(1, input.saat || 1);
    const saatlik = calcBirinciKisimSaatlik(row, input.tarafSayisi || 2);
    const toplam = saatlik * saat;
    detaySatirlari.push(`Uyuşmazlık türü: ${row.label}`);
    detaySatirlari.push(`Taraf sayısı: ${Math.max(2, Math.round(input.tarafSayisi || 2))}`);
    detaySatirlari.push(`Saatlik ücret: ${saatlik.toLocaleString("tr-TR")} TL × ${saat} saat`);
    return {
      toplamUcret: round2(toplam),
      maddeAciklama: "MADDE 7/1 — konusu para olmayan veya para ile değerlendirilemeyen uyuşmazlıklarda Birinci Kısım uygulanır.",
      ozet: "Konusu parasal olmayan uyuşmazlık — Birinci Kısım (saatlik) tarifeye göre hesaplandı.",
      detaySatirlari,
      tabanUygulandiMi: false,
    };
  }

  // ── Anlaşma sağlandı, konu parasal → özel durumlara göre dallan ──
  const ozelDurum = input.ozelDurum || "yok";

  // MADDE 7/4 — Seri uyuşmazlık (sabit ücret, uyuşmazlık başına)
  if (ozelDurum === "seri") {
    const birimUcret = input.seriTuru === "ticari" ? tariff.seriUyusmazlikTicari : tariff.seriUyusmazlikDiger;
    const adet = Math.max(1, Math.round(input.seriAdedi || 1));
    const toplam = birimUcret * adet;
    detaySatirlari.push(`Seri uyuşmazlık türü: ${input.seriTuru === "ticari" ? "Ticari" : "Diğer"}`);
    detaySatirlari.push(`Uyuşmazlık başına ücret: ${birimUcret.toLocaleString("tr-TR")} TL × ${adet} uyuşmazlık`);
    if (adet < 10) {
      detaySatirlari.push("Not: Tebliğ'e göre seri uyuşmazlık sayılabilmesi için aynı ay içinde en az 10 uyuşmazlığa başvurulmuş olması gerekir.");
    }
    return {
      toplamUcret: round2(toplam),
      maddeAciklama: "MADDE 7/4 — seri uyuşmazlıklarda anlaşma sağlanması hâlinde, uyuşmazlık başına sabit ücret uygulanır.",
      ozet: "Seri uyuşmazlık — sabit ücret ile hesaplandı.",
      detaySatirlari,
      tabanUygulandiMi: false,
    };
  }

  // MADDE 7/5 — Kira tespiti / tahliye talepli
  if (ozelDurum === "kira_tahliye" || ozelDurum === "kira_tespit") {
    const yillikBedel = Math.max(0, input.kiraBedeli || 0);
    const taban = ozelDurum === "kira_tahliye" ? yillikBedel / 2 : yillikBedel;
    const { toplam, detay } = calcIkinciKisim(tariff.ikinciKisim, taban, tekArabulucu);
    const tabanliToplam = Math.max(toplam, tariff.genelAsgariUcret);
    detaySatirlari.push(
      ozelDurum === "kira_tahliye"
        ? `Bir yıllık kira bedeli: ${yillikBedel.toLocaleString("tr-TR")} TL → hesaplama tabanı (yarısı): ${taban.toLocaleString("tr-TR")} TL`
        : `Tespit olunan kira bedeli farkının bir yıllık tutarı: ${taban.toLocaleString("tr-TR")} TL`
    );
    detay.forEach((d) => detaySatirlari.push(`${d.dilimTutari.toLocaleString("tr-TR")} TL × %${d.oran} = ${d.katki.toLocaleString("tr-TR")} TL`));
    if (tabanliToplam > toplam) {
      detaySatirlari.push(`Hesaplanan ücret (${round2(toplam).toLocaleString("tr-TR")} TL) genel asgari ücretin (${tariff.genelAsgariUcret.toLocaleString("tr-TR")} TL) altında kaldığı için genel asgari ücret uygulandı.`);
    }
    return {
      toplamUcret: round2(tabanliToplam),
      maddeAciklama: "MADDE 7/5 — kira tespiti/tahliye talepli uyuşmazlıklarda özel taban üzerinden İkinci Kısım uygulanır.",
      ozet: ozelDurum === "kira_tahliye" ? "Tahliye talepli uyuşmazlık — İkinci Kısım'a göre hesaplandı." : "Kira tespiti uyuşmazlığı — İkinci Kısım'a göre hesaplandı.",
      detaySatirlari,
      tabanUygulandiMi: tabanliToplam > toplam,
    };
  }

  // MADDE 7/6 — Ortaklığın giderilmesi / ticari uyuşmazlık (taban 13.000)
  if (ozelDurum === "ortaklik_ticari") {
    const tutar = Math.max(0, input.anlasmaTutari || 0);
    const { toplam, detay } = calcIkinciKisim(tariff.ikinciKisim, tutar, tekArabulucu);
    const tabanliToplam = Math.max(toplam, tariff.ortakligininGiderilmesiTicariAsgari);
    detaySatirlari.push(`Anlaşma tutarı: ${tutar.toLocaleString("tr-TR")} TL`);
    detay.forEach((d) => detaySatirlari.push(`${d.dilimTutari.toLocaleString("tr-TR")} TL × %${d.oran} = ${d.katki.toLocaleString("tr-TR")} TL`));
    if (tabanliToplam > toplam) {
      detaySatirlari.push(`Hesaplanan ücret (${round2(toplam).toLocaleString("tr-TR")} TL) özel asgari ücretin (${tariff.ortakligininGiderilmesiTicariAsgari.toLocaleString("tr-TR")} TL) altında kaldığı için özel asgari ücret uygulandı.`);
    }
    return {
      toplamUcret: round2(tabanliToplam),
      maddeAciklama: "MADDE 7/6 — ortaklığın giderilmesi/ticari uyuşmazlıklarda İkinci Kısım uygulanır; ücret 13.000,00 TL'den az olamaz.",
      ozet: "Ortaklığın giderilmesi / ticari uyuşmazlık — İkinci Kısım'a göre hesaplandı.",
      detaySatirlari,
      tabanUygulandiMi: tabanliToplam > toplam,
    };
  }

  // MADDE 7/2 + 7/7 — Genel parasal uyuşmazlık (taban 9.000)
  const tutar = Math.max(0, input.anlasmaTutari || 0);
  const { toplam, detay } = calcIkinciKisim(tariff.ikinciKisim, tutar, tekArabulucu);
  const tabanliToplam = Math.max(toplam, tariff.genelAsgariUcret);
  detaySatirlari.push(`Anlaşma tutarı: ${tutar.toLocaleString("tr-TR")} TL`);
  detay.forEach((d) => detaySatirlari.push(`${d.dilimTutari.toLocaleString("tr-TR")} TL × %${d.oran} = ${d.katki.toLocaleString("tr-TR")} TL`));
  if (tabanliToplam > toplam) {
    detaySatirlari.push(`Hesaplanan ücret (${round2(toplam).toLocaleString("tr-TR")} TL) genel asgari ücretin (${tariff.genelAsgariUcret.toLocaleString("tr-TR")} TL) altında kaldığı için genel asgari ücret uygulandı.`);
  }
  return {
    toplamUcret: round2(tabanliToplam),
    maddeAciklama: "MADDE 7/2 — konusu para olan/değerlendirilebilen uyuşmazlıklarda İkinci Kısım uygulanır; MADDE 7/7 — ücret tutara bakılmaksızın 9.000,00 TL'den az olamaz.",
    ozet: "Konusu parasal uyuşmazlık — İkinci Kısım'a göre hesaplandı.",
    detaySatirlari,
    tabanUygulandiMi: tabanliToplam > toplam,
  };
}
