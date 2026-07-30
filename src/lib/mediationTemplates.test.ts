import { describe, it, expect } from "vitest";
import {
  avLabel,
  v,
  balancedRows,
  buildSignatureBlock,
  buildHeaderBlock,
  buildAnlasamamaNarrative,
  buildKismiAnlasmaNarrative,
  buildGorusmeYapilmadanNarrative,
  buildUcretCumlesi,
  sonucKisaLabel,
  buildUyusmazlikBasligi,
  buildKatilimTeyidiParagraph,
} from "./mediationTemplates";

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

  it("isim/rol satırlarının altında [[SIMG]] ile işaretli, '¸' taşıyan bir imza görseli satırı üretir", () => {
    const c: any = {
      basvurucuVekilAd: "Mehmet Devran DEVRİM",
      karsiTaraflar: [{ vekilAd: "Aylin BAHADIR" }, { vekilAd: "Ali ÇEKİÇ" }],
    };
    const a: any = { name: "Mehmet Ali ŞAHİN", arabulucuSicilNo: "35701" };
    const block = buildSignatureBlock(c, a);

    const imgLines = block.split("\n").filter((l) => l.startsWith("[[SIMG]]"));
    expect(imgLines).toHaveLength(2); // 2x2 -> 2 satır
    // "¸", her formatta (DOCX'te görsel, UDF'de <image>) doğru şekilde
    // işlensin diye BİLEREK kullanılıyor — gerçek bir .udf örneğinde
    // doğrulanan UYAP kuralı (bkz. udf.ts). Sıradan [[S]] satırlarında
    // (isim/rol) GEÇMEMELİ.
    for (const line of imgLines) {
      expect(line).toContain("¸");
    }
  });

  it("kapanış cümlesini gerçek bir FOOTER (gövde değil) olarak işaretliyor", () => {
    const c: any = {};
    const a: any = { name: "Test Arabulucu" };
    const block = buildSignatureBlock(c, a);
    expect(block).toContain("[[F]]Bu evrak 5070 sayılı Elektronik İmza Kanunu");
  });
});

describe("buildHeaderBlock — 'Tutanağının Düzenlendiği Tarih'", () => {
  const c: any = { gorevlendirmeTarihi: "01.01.2026" };
  const a: any = {};

  it("duzenlemeTarihi verilirse ONU kullanır — gorevlendirmeTarihi'ni DEĞİL (görüşme günü ≠ görevlendirme günü)", () => {
    const header = buildHeaderBlock(c, a, "ARABULUCU", undefined, "08.07.2026");
    const line = header.split("\n").find((l) => l.includes("Tutanağının Düzenlendiği Tarih"));
    expect(line).toContain("08.07.2026");
    expect(line).not.toContain("01.01.2026");
  });

  it("duzenlemeTarihi verilmezse eskisi gibi gorevlendirmeTarihi'ne düşer (geriye dönük uyum)", () => {
    const header = buildHeaderBlock(c, a, "ARABULUCU");
    const line = header.split("\n").find((l) => l.includes("Tutanağının Düzenlendiği Tarih"));
    expect(line).toContain("01.01.2026");
  });
});

describe("buildHeaderBlock — tarih satırlarında etiket VE ':' birlikte altı çizili, aralarında TAB yok (v293, kullanıcının UYAP'ta elle düzenlediği örnek belgeyle karşılaştırılarak doğrulandı)", () => {
  const c: any = { basvuruTarihi: "16.06.2026", gorevlendirmeTarihi: "16.06.2026" };
  const a: any = {};

  it("üç tarih satırı da (Başvuru/Görevlendirme/Düzenlenme) yeni 'Etiket:__****  değer' kalıbını kullanır", () => {
    const header = buildHeaderBlock(c, a, "ARABULUCU");
    for (const etiket of [
      "Arabuluculuk Bürosuna Başvuru Tarihi",
      "Arabulucunun Görevlendirildiği Tarih",
      "Tutanağının Düzenlendiği Tarih",
    ]) {
      const line = header.split("\n").find((l) => l.includes(etiket));
      expect(line).toBeTruthy();
      expect(line).toContain(`${etiket}:__****`);
      // Eski kalıp: etiket ile ':' arasında bir TAB vardı — artık YOK.
      expect(line).not.toContain(`${etiket}__**\t`);
    }
  });
});

describe("buildHeaderBlock / buildKarsiTarafBlock — alt başlıklardan sonraki İLK tab artık altı çizili run'ın içinde (v293)", () => {
  it("ARABULUCULUK BÜROSU, arabulucuLabel ve BAŞVURUCU başlıkları '\\t__**' ile biter", () => {
    const c: any = {};
    const a: any = {};
    const header = buildHeaderBlock(c, a, "ARABULUCU");
    expect(header).toContain("**__ARABULUCULUK BÜROSU\t__**");
    expect(header).toContain("**__ARABULUCU\t__**");
    expect(header).toContain("**__BAŞVURUCU\t__**");
  });

  it("KARŞI TARAF etiketi de aynı kalıbı kullanır", () => {
    const c: any = { karsiTaraflar: [{ ad: "Test Kişi" }] };
    const a: any = {};
    const header = buildHeaderBlock(c, a, "ARABULUCU");
    expect(header).toContain("**__KARŞI TARAF\t__**");
  });

  it("ARABULUCULUK KONUSU UYUŞMAZLIK başlığına DOKUNULMADI — tab eklenmedi (kullanıcının kendi örneğinde de değişmemişti)", () => {
    const c: any = {};
    const a: any = {};
    const header = buildHeaderBlock(c, a, "ARABULUCU");
    expect(header).toContain("**__ARABULUCULUK KONUSU UYUŞMAZLIK__**\n");
  });
});

describe("buildAnlasamamaNarrative — 'ikinci toplantı' ibaresi kaldırıldı", () => {
  const c: any = { basvurucuAd: "Ali Veli", karsiTaraflar: [{ ad: "Ayşe Yılmaz" }] };

  it("artık 2. parametre almıyor ve metinde 'ikinci' kelimesi hiç geçmiyor (süreç zaten sabit 2 oturumlu)", () => {
    const text = buildAnlasamamaNarrative(c, true);
    expect(text).not.toContain("ikinci");
    expect(text).not.toContain("toplantı istemediklerini");
  });

  it("son cümlede 'hiçbir konuda' tırnağın DIŞINDA, sadece 'ANLAŞAMAMA' tırnak içinde geçer (başlık/etiket alanlarında hâlâ sade 'ANLAŞAMAMA' kullanılır)", () => {
    const text = buildAnlasamamaNarrative(c, false);
    expect(text).toContain('hiçbir konuda "ANLAŞAMAMA"');
    expect(text).not.toContain('"HİÇBİR KONUDA ANLAŞAMAMA"');
  });

  it("karşı teklif seçeneği hâlâ çalışıyor", () => {
    expect(buildAnlasamamaNarrative(c, true)).toContain("karşı tekliflerinin olduğunu");
    expect(buildAnlasamamaNarrative(c, false)).toContain("herhangi bir karşı tekliflerinin olmadığını");
  });

  it("'talep' yerine 'teklif' kullanılır — arabuluculukta karşı tarafa iletilen şey dava talebi değil uzlaşma teklifidir", () => {
    const text = buildAnlasamamaNarrative(c, true);
    expect(text).not.toContain("talep");
    expect(text).toContain("teklifini iletti");
    expect(text).toContain("başvurucunun teklifini");
  });

  it("vekilsiz (tek başına konuşan) taraf için TEKİL kip kullanılır — 'kabul etmediklerini' değil 'kabul etmediğini'", () => {
    const vekilsiz: any = { basvurucuAd: "Ali Veli", karsiTaraflar: [{ ad: "Ayşe Yılmaz" }] };
    const text = buildAnlasamamaNarrative(vekilsiz, true);
    expect(text).toContain("kabul etmediğini");
    expect(text).not.toContain("kabul etmediklerini");
    expect(text).toContain("çözüme kavuşturmak istediğini");
    expect(text).not.toContain("çözüme kavuşturmak istediklerini");
  });

  it("vekilli (avukatla temsil edilen) taraf için ÇOĞUL kip kullanılır", () => {
    const vekilli: any = {
      basvurucuAd: "Ali Veli",
      basvurucuVekilAd: "Av. Zeynep Kara",
      karsiTaraflar: [{ ad: "Ayşe Yılmaz", vekilAd: "Av. Mert Demir" }],
    };
    const text = buildAnlasamamaNarrative(vekilli, true);
    expect(text).toContain("kabul etmediklerini");
    expect(text).toContain("çözüme kavuşturmak istediklerini");
  });

  it("her taraf BAĞIMSIZ değerlendirilir — başvurucu vekilsiz ama karşı taraf vekilliyse her biri kendi kipini kullanır", () => {
    const karisik: any = {
      basvurucuAd: "Ali Veli",
      karsiTaraflar: [{ ad: "Ayşe Yılmaz", vekilAd: "Av. Mert Demir" }],
    };
    const text = buildAnlasamamaNarrative(karisik, true);
    // Karşı taraf (vekilli) -> çoğul "kabul etmediklerini"
    expect(text).toContain("kabul etmediklerini");
    // Başvurucu (vekilsiz) -> tekil "istediğini"
    expect(text).toContain("çözüme kavuşturmak istediğini");
    expect(text).not.toContain("çözüme kavuşturmak istediklerini");
  });
});

describe("buildKismiAnlasmaNarrative", () => {
  const c: any = { basvurucuAd: "Ali Veli", karsiTaraflar: [{ ad: "Ayşe Yılmaz" }] };

  it("anlaşılan ve anlaşılamayan hususları AYRI AYRI ve BİREBİR (değiştirmeden) içerir", () => {
    const text = buildKismiAnlasmaNarrative(c, "X konusunda anlaşıldı.", "Y konusunda anlaşılamadı.", "28.07.2026");
    expect(text).toContain("X konusunda anlaşıldı.");
    expect(text).toContain("Y konusunda anlaşılamadı.");
    expect(text).toContain("KISMİ ANLAŞMA");
  });

  it("ücret cümlesi verilirse metne eklenir, verilmezse hiç eklenmez", () => {
    const withFee = buildKismiAnlasmaNarrative(c, "X.", "Y.", "28.07.2026", "\tÜcret cümlesi burada.");
    expect(withFee).toContain("Ücret cümlesi burada.");
    const withoutFee = buildKismiAnlasmaNarrative(c, "X.", "Y.", "28.07.2026");
    expect(withoutFee).not.toContain("Ücret cümlesi burada.");
  });
});

describe("buildGorusmeYapilmadanNarrative", () => {
  it("katılmayan taraf(lar)ı ve nedeni metne yazar, 'söz alarak' gibi bir görüşme anlatısı İÇERMEZ", () => {
    const text = buildGorusmeYapilmadanNarrative(["Karşı Taraf Ayşe Yılmaz"], "Tebligata rağmen ulaşılamadı.");
    expect(text).toContain("Karşı Taraf Ayşe Yılmaz");
    expect(text).toContain("Tebligata rağmen ulaşılamadı.");
    expect(text).toContain("GÖRÜŞME YAPILMADAN ANLAŞAMAMA");
    expect(text).not.toContain("söz alarak");
  });

  it("birden fazla katılmayan taraf ', ... ve ...' şeklinde bağlanır", () => {
    const text = buildGorusmeYapilmadanNarrative(["Başvurucu Ali Veli", "Karşı Taraf Ayşe Yılmaz"], "");
    expect(text).toContain("Başvurucu Ali Veli ve Karşı Taraf Ayşe Yılmaz");
  });
});

describe("buildUcretCumlesi", () => {
  const c: any = {
    basvurucuAd: "Ali Veli",
    karsiTaraflar: [{ ad: "Ayşe Yılmaz" }, { ad: "Mehmet Can" }],
  };
  const a: any = { name: "Test Arabulucu", arabulucuIban: "TR000000000000000000000000" };

  it("TEK ödeyen seçiliyse ismiyle yazar", () => {
    const text = buildUcretCumlesi(c, a, "9.000", true, [false, false]);
    expect(text).toContain("Ali Veli tarafından karşılanmak");
    expect(text).not.toContain("eşit oranda");
  });

  it("BİRDEN FAZLA ödeyen seçiliyse 'eşit oranda' ifadesiyle yazar (sadece 'iki taraf' değil, N taraf genellenir)", () => {
    const text = buildUcretCumlesi(c, a, "9.000", true, [true, true]);
    expect(text).toContain("Ali Veli, Ayşe Yılmaz, Mehmet Can tarafından eşit oranda");
  });

  it("profildeki IBAN'ı kullanır, her belgede elle yazılmaz", () => {
    const text = buildUcretCumlesi(c, a, "9.000", true, [false, false]);
    expect(text).toContain("TR000000000000000000000000");
  });

  it("hiç ödeyen seçilmezse boş döner", () => {
    expect(buildUcretCumlesi(c, a, "9.000", false, [false, false])).toBe("");
  });
});

describe("buildSignatureBlock — 'Görüşme Yapılmadan Anlaşamama' katılmayan taraf imza satırı açılmaz", () => {
  const c: any = {
    basvurucuAd: "Ali Veli",
    karsiTaraflar: [{ ad: "Ayşe Yılmaz" }, { ad: "Mehmet Can" }],
  };
  const a: any = { name: "Test Arabulucu", arabulucuSicilNo: "12345" };

  it("attendance verilmezse (eski davranış) herkes imzalar", () => {
    const block = buildSignatureBlock(c, a);
    expect(block).toContain("Ali Veli");
    expect(block).toContain("Ayşe Yılmaz");
    expect(block).toContain("Mehmet Can");
  });

  it("katılmayan taraf attendance ile işaretlenirse imza satırından TAMAMEN çıkarılır", () => {
    const block = buildSignatureBlock(c, a, { basvurucu: true, karsiTaraflar: [false, true] });
    expect(block).not.toContain("Ayşe Yılmaz");
    expect(block).toContain("Mehmet Can");
    expect(block).toContain("Ali Veli");
  });

  it("başvurucu katılmadıysa başvurucu satırı da çıkarılır", () => {
    const block = buildSignatureBlock(c, a, { basvurucu: false, karsiTaraflar: [true, true] });
    expect(block).not.toContain("**Ali Veli**");
  });
});

describe("sonucKisaLabel", () => {
  it("4 sonuç türü için doğru kısa etiketi döner", () => {
    expect(sonucKisaLabel("anlasma")).toBe("Anlaşma");
    expect(sonucKisaLabel("kismi")).toBe("Kısmi Anlaşma");
    expect(sonucKisaLabel("anlasamama")).toBe("Anlaşamama");
    expect(sonucKisaLabel("gorusmesiz")).toBe("Görüşme Yapılmadan Anlaşamama");
  });

  it("bilinmeyen/boş değerde eski davranışla uyumlu olarak 'Anlaşamama' döner", () => {
    expect(sonucKisaLabel(null)).toBe("Anlaşamama");
    expect(sonucKisaLabel(undefined)).toBe("Anlaşamama");
  });
});

describe("buildKatilimTeyidiParagraph (v293) — kullanıcının UYAP'ta elle düzenlediği GERÇEK örnek belgeyle birebir doğrulandı", () => {
  const c: any = {
    basvurucuAd: "Samed Can MÜJDE",
    basvurucuVekilAd: "Arif USTA",
    basvurucuTelefon: "0533 425 88 60",
    karsiTaraflar: [
      {
        tip: "tuzel",
        ad: "Urfa Sofrası Özcemre İnş. Gıda Tur. San. Tic. Ltd. Şti.",
        yetkiliAd: "Özcan KUŞ",
        telefon: "0532 457 8505",
      },
    ],
  };

  it("telekonferansı karşı taraf talep ettiğinde, gerçek örnekteki cümle birebir üretilir", () => {
    const text = buildKatilimTeyidiParagraph(c, "karsi-0", "28.03.2025", "16:00");
    expect(text).toBe(
      "Başvurucu Samed Can MÜJDE vekili Av. Arif USTA ile yapılan görüşmede toplantıya belirlenen gün ve saat de katılacağı 0533 425 88 60 numaralı GSM hattından yapılan görüşme ile teyit edildi. " +
      "Karşı taraf olan Urfa Sofrası Özcemre İnş. Gıda Tur. San. Tic. Ltd. Şti. Yetkilisi Özcan KUŞ ile 0532 457 8505 numaralı GSM hattından yapılan görüşmede toplantıya belirlenen gün ve saat de katılabileceğini ancak telekonferans şeklinde katılma isteğinin olduğunu beyan etti. " +
      "Taraflarla yapılan karşılıklı görüşme sonunda bilgilendirme ve ilk oturum toplantısının 28.03.2025 günü saat 16.00'da telekonferans şeklinde yapılmasına karar verildi ve taraflar bu konuda bilgilendirildi."
    );
  });

  it("kimse telekonferans talep etmediyse (yüz yüze) HER İKİ taraf da sade 'teyit edildi' kalıbını alır, kapanış 'yüz yüze' der", () => {
    const text = buildKatilimTeyidiParagraph(c, "", "28.03.2025", "16:00");
    expect(text).toContain("Başvurucu Samed Can MÜJDE vekili Av. Arif USTA ile yapılan görüşmede toplantıya belirlenen gün ve saat de katılacağı 0533 425 88 60 numaralı GSM hattından yapılan görüşme ile teyit edildi.");
    expect(text).toContain("Karşı taraf olan Urfa Sofrası Özcemre İnş. Gıda Tur. San. Tic. Ltd. Şti. Yetkilisi Özcan KUŞ ile yapılan görüşmede toplantıya belirlenen gün ve saat de katılacağı 0532 457 8505 numaralı GSM hattından yapılan görüşme ile teyit edildi.");
    expect(text).not.toContain("ancak telekonferans");
    expect(text).toContain("yüz yüze şeklinde yapılmasına karar verildi");
    expect(text).not.toContain("telekonferans şeklinde yapılmasına karar verildi");
  });

  it("telekonferansı BAŞVURUCU talep ederse, 'ancak telekonferans...' kalıbı başvurucuya, sade kalıp karşı tarafa uygulanır", () => {
    const text = buildKatilimTeyidiParagraph(c, "basvurucu", "28.03.2025", "16:00");
    expect(text).toContain("Başvurucu Samed Can MÜJDE vekili Av. Arif USTA ile 0533 425 88 60 numaralı GSM hattından yapılan görüşmede toplantıya belirlenen gün ve saat de katılabileceğini ancak telekonferans şeklinde katılma isteğinin olduğunu beyan etti.");
    expect(text).toContain("Karşı taraf olan Urfa Sofrası Özcemre İnş. Gıda Tur. San. Tic. Ltd. Şti. Yetkilisi Özcan KUŞ ile yapılan görüşmede toplantıya belirlenen gün ve saat de katılacağı 0532 457 8505 numaralı GSM hattından yapılan görüşme ile teyit edildi.");
    expect(text).toContain("telekonferans şeklinde yapılmasına karar verildi");
  });

  it("birden fazla karşı taraf varsa 'Karşı taraf 1 olan' / 'Karşı taraf 2 olan' şeklinde numaralanır", () => {
    const cokluC: any = {
      basvurucuAd: "Ali Veli",
      karsiTaraflar: [{ ad: "Ayşe Yılmaz" }, { ad: "Mehmet Can" }],
    };
    const text = buildKatilimTeyidiParagraph(cokluC, "", "01.01.2026", "10:00");
    expect(text).toContain("Karşı taraf 1 olan Ayşe Yılmaz ile");
    expect(text).toContain("Karşı taraf 2 olan Mehmet Can ile");
    expect(text).not.toContain("Karşı taraf olan");
  });

  it("vekilsiz/yetkilisiz (kendisi katılan) taraf için ek ünvan eklenmez", () => {
    const cSade: any = { basvurucuAd: "Ali Veli", karsiTaraflar: [{ ad: "Ayşe Yılmaz" }] };
    const text = buildKatilimTeyidiParagraph(cSade, "", "01.01.2026", "10:00");
    expect(text).toContain("Başvurucu Ali Veli ile yapılan görüşmede");
    expect(text).toContain("Karşı taraf olan Ayşe Yılmaz ile yapılan görüşmede");
  });

  it("saat alanı ':' yerine '.' ile yazılır (HTML time input 'HH:MM' -> resmi belge 'HH.MM')", () => {
    const text = buildKatilimTeyidiParagraph(c, "", "01.01.2026", "09:30");
    expect(text).toContain("saat 09.30'da");
    expect(text).not.toContain("09:30");
  });
});

describe("buildUyusmazlikBasligi", () => {
  it("'... Hukuku' ile bitenlerde 'Hukuku' atılır, 'HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA' eklenir", () => {
    expect(buildUyusmazlikBasligi("İş Hukuku")).toBe("İŞ HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA");
    expect(buildUyusmazlikBasligi("Kira Hukuku")).toBe("KİRA HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA");
  });

  it("'... Kanunu' ile bitenlerde 'HUKUKUNDAN' DEĞİL 'KANUNUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA' eklenir (Kat Mülkiyeti Kanunu)", () => {
    expect(buildUyusmazlikBasligi("Kat Mülkiyeti Kanunu")).toBe("KAT MÜLKİYETİ KANUNUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA");
    expect(buildUyusmazlikBasligi("Kat Mülkiyeti Kanunu")).not.toContain("KANUNU HUKUKUNDAN");
  });

  it("boş/tanımsız değerde sabit '……' fallback kullanır", () => {
    expect(buildUyusmazlikBasligi("")).toBe("…… HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA");
    expect(buildUyusmazlikBasligi(undefined)).toBe("…… HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA");
  });
});
