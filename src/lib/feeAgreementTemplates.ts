// Avukatlık Ücret Sözleşmesi şablonu — kullanıcının gönderdiği GERÇEK
// örnek belgeden, python-docx ile paragraf paragraf, biçim biçim (kalın/
// altı çizili/hizalama) çıkarılarak birebir oluşturulmuştur. Sadece
// değişken alanlar (isimler, tutarlar, tarihler) doldurulur — sabit
// hükümler (Diğer Hükümler'deki 9 madde) hiç AI'a yazdırılmaz.

export type FeeAgreementParty = {
  name?: string | null;
  phone?: string | null;
  officeAddress?: string | null;
  baro?: string | null;
  sicilNo?: string | null;
};

export type FeeAgreementClient = {
  name?: string | null;
  tcMersis?: string | null;
  address?: string | null;
  phone?: string | null;
};

export type Installment = { tutar: number; tarih: string };

function v(val?: string | null, fallback = "……………"): string {
  return val && val.trim() ? val.trim() : fallback;
}

function fmtTL(n: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " TL";
}

// Vekâlet Ücreti cümlesi — AI'a hiç yazdırılmaz, tamamen şablonla üretilir.
export function buildFeeSentence(
  sabitUcret: number | null,
  yuzdeVarMi: boolean,
  yuzdeOrani: number | null,
  odemeSekli: "pesin" | "taksit",
  pesinTarihi: string | null,
  taksitler: Installment[] | null,
  harcMasrafDahil: boolean
): string {
  const ucretParcasi = `Avukatlık ücreti olarak ${sabitUcret != null ? fmtTL(sabitUcret) : "……………"}${
    yuzdeVarMi ? ` + dava bedelinin %${yuzdeOrani ?? "…"}'i` : ""
  } ücret alınacağı, `;

  let odemeParcasi = "";
  if (odemeSekli === "pesin") {
    odemeParcasi = `bu ücretin ${v(pesinTarihi)} tarihinde ödeneceği`;
  } else {
    const list = taksitler && taksitler.length ? taksitler : [];
    const parcalar = list.map((t) => `${fmtTL(t.tutar)}'sinin ${v(t.tarih)} tarihinde`);
    if (parcalar.length === 0) {
      odemeParcasi = "bedelin kararlaştırılan taksitler halinde ödeneceği";
    } else if (parcalar.length === 1) {
      odemeParcasi = `bu miktarın ${parcalar[0]} ödeneceği`;
    } else {
      const son = parcalar[parcalar.length - 1];
      const oncekiler = parcalar.slice(0, -1).join(", ");
      odemeParcasi = `bu miktarın ${oncekiler} ve ${son} ödeneceği`;
    }
  }

  const harcCumlesi = harcMasrafDahil ? " Dava harç, masraf vb. giderler iş sahibine aittir." : "";
  return `${ucretParcasi}${odemeParcasi} hususunda anlaşmaya varılmıştır.${harcCumlesi}`;
}

// "Diğer Hükümler" başlığından sonra gelen, HİÇ DEĞİŞMEYEN 9 madde —
// örnek belgeden birebir alınmıştır.
export const DIGER_HUKUMLER_MADDELER = `[[N2]]Avukata verilen işten ötürü yukarıda belirlenen ücret ödenecektir. Ödemelerin belirtilen zamanda yapılmaması halinde geciken zaman için yasal faiz uygulanacaktır.

[[N2]]Bu ücret yalnız bu işler içindir. Bu işle ilgili olsa da bundan doğacak herhangi bir başka işi kapsamına almayacaktır. Karşılık dava açılması ve başkaca bu işle ilgili uyuşmazlıklar ve kovuşturma işleri çıkması halinde avukata ayrıca ücret ödenmesi gerekecektir. Yargıtay'da, Danıştay'da ve başkaca anlaşmazlıklar çözen mercilerde yapılacak duruşmalarda da anlaşmaya; anlaşma yapılmamışsa Avukatlık Ücret Tarifesine göre, ayrı ücret ödenecektir. Mahkeme tarafından hükmedilecek karşı vekalet ücreti Avukata aittir.

[[N2]]Avukat işi yasalar ve meslek kuralları uyarınca sonuna kadar kovuşturacaktır. Bu görevi kendisi yapacağı gibi gözetimi altında başka avukatlarla iş birliği yaparak onları da kovuşturma ve savunmasına alabilecektir. Ancak bu durumda iş sahibinden ek ücret istemeyecektir.

[[N2]]İş sahibi, avukatın yazılı olurunu almadan bu iş için başkasına vekâlet veremeyecektir. Tersine davranılması halinde avukata ücretin tamamı ödenecektir.

[[N2]]İş sahibi işten feragat eder ya da avukata iş kovuşturma olanağı vermezse yahut sözleşmeyle üstlendiği yükümlülüklerden birini yerine getirmezse, avukat kalan ücretin tamamını isteme hakkını kazanır.

[[N2]]İş sahibi, vekâletnamedeki adresi konut kabul etmiştir. Avukatın kendisine yapacağı her türlü bildirim bu adrese gönderilecektir. Adres değişikliğinin avukata bildirilmesi zorunlu olup, adres değişikliği nedeniyle iş sahibine ulaşmayan bildirimler nedeniyle avukata sorumluluk yüklenemez.

[[N2]]Sözleşme iş sahibince tek taraflı olarak haklı bir neden olmadan feshedilirse, avukat ücretin tamamını isteme hakkını kazanır.

[[N2]]Bu sözleşmede aksine bir hüküm bulunmadığı takdirde yürürlükteki Avukatlık Kanunu hükümleri uygulanır.

[[N2]]Bu sözleşmeden doğan uyuşmazlıkların çözümünde ${"{{YETKI_YERI}}"} Mahkemeleri ve İcra Daireleri yetkilidir.`;

export function buildFeeAgreementDocx(
  avukat: FeeAgreementParty,
  musteri: FeeAgreementClient,
  konu: string,
  feeSentence: string,
  sozlesmeTarihi: string,
  yetkiYeri: string
): string {
  const diger = DIGER_HUKUMLER_MADDELER.replace("{{YETKI_YERI}}", v(yetkiYeri, "……………"));

  return `[[C]]**AVUKATLIK ÜCRET SÖZLEŞMESİ**

**__Müvekkil Bilgileri__**\t

**İş Sahibi (Müvekkil)**\t: ${v(musteri.name)}${musteri.tcMersis ? ` – TC.${musteri.tcMersis}` : ""}
**Tebligat Adresi**\t: ${v(musteri.address)}
**Telefon**\t: ${v(musteri.phone)}

**__Avukat (Vekil) Bilgileri__**\t

**Adı Soyadı**\t: ${v(avukat.name)}
**Adres**\t: ${v(avukat.officeAddress)}
**Telefon**\t: ${v(avukat.phone)}

**__Sözleşme Konusu İş__**\t: ${v(konu)}

**__Vekâlet Ücreti__**\t: ${feeSentence}

**__Diğer Hükümler__**\t: Yukarıda adları yazılı avukat ile iş sahibi arasında belirtilen konuda ve anılan ücretlerle Avukatlık Kanunu uyarınca aşağıdaki şartlarla bir sözleşme yapılmıştır.

${diger}

**__Sözleşme Tarihi__**\t: ${v(sozlesmeTarihi)}


[[S]]\t${v(musteri.name)}\t${v(avukat.name)}
[[S]]\tİş Sahibi\tAvukat
[[S]]\t¸\t¸`;
}
