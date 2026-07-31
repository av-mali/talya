import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasToolAccess, hasAiAccess } from "@/lib/workspace";
import { generateUdf } from "@/lib/udf";
import { generateDocx } from "@/lib/docExport";
import { callGemini } from "@/lib/gemini";
import {
  buildHeaderBlock,
  buildSignatureBlock,
  buildDavetMektubu,
  buildAnlasmaNarrative,
  buildAnlasamamaNarrative,
  buildKismiAnlasmaNarrative,
  buildGorusmeYapilmadanNarrative,
  buildUcretCumlesi,
  sonucKisaLabel,
  buildUyusmazlikBasligi,
  buildKatilimTeyidiParagraph,
  buildSonTutanakGirisParagrafi,
  ILK_OTURUM_BILGILENDIRME,
  stripMarkup,
  indentParagraphs,
  basvurucularList,
} from "@/lib/mediationTemplates";

export const maxDuration = 60;

// HTML <input type="date"> alanları "YYYY-MM-DD" (ISO) formatında gelir —
// bunu doğrudan metne/AI istemine yazarsak hem belgede hem AI'ın ürettiği
// anlatıda "2026-07-08" gibi Türkçe olmayan bir biçimde görünüyordu
// ("tutanağın düzenlendiği tarih" ve toplantı anlatısı satırlarındaki
// hata buydu). Kasıtlı olarak new Date(...) KULLANILMIYOR — saf metin
// ayrıştırma, projedeki diğer yerlerde görülen UTC/+03:00 kayması gibi
// saat dilimi tuzaklarına hiç girmiyor.
function formatTrDate(isoDate?: string | null): string | null {
  if (!isoDate) return null;
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${d}.${mo}.${y}`;
}

const NARRATIVE_RULES = `
KESİN KURALLAR:
- Çıktında KÖŞELİ PARANTEZ ("[" veya "]") KULLANMA — hiçbir yer tutucu bırakma, sana verilen gerçek isim/tarih/saat bilgilerini doğrudan cümlenin içine yaz.
- "Başvurucu vekili" ya da "Karşı taraf" gibi GENEL/İSİMSİZ ifadeler kullanma — her zaman gerçek ismi yaz (sana verilmişse).
- Sana bir bilgi (tarih, saat, isim) verilmediyse, o bilgiyi UYDURMA; cümleyi o bilgiye hiç değinmeden, akıcı şekilde kur.
- Yalnızca istenen paragrafları yaz — başlık, açıklama, giriş cümlesi ekleme.`;

async function generateNarrative(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error("AI yapılandırması eksik (GEMINI_API_KEY tanımlı değil).");
  const result = await callGemini({ contents: [{ parts: [{ text: prompt }] }] });

  if (!result.ok) {
    throw new Error(result.friendlyError || "AI servis hatası.");
  }
  const data = result.data;

  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p: any) => p.text).join("") || "";

  if (!text.trim()) {
    // Boş dönüşün en sık sebebi bir güvenlik/içerik filtresi olabilir —
    // bunu da göster ki gerçek sebep belli olsun, "AI yanıt üretemedi"
    // diye belirsiz bir mesajda kalınmasın.
    const reason = candidate?.finishReason || data?.promptFeedback?.blockReason;
    throw new Error(`AI yanıt üretemedi${reason ? " (sebep: " + reason + ")" : ""}.`);
  }

  return text.trim().replace(/[\[\]]/g, "");
}

function basvurucuTemsilci(mediationCase: any): string {
  const basvurucular = basvurucularList(mediationCase);
  return basvurucular
    .map((p: any, i: number) => {
      const label = basvurucular.length > 1 ? `başvurucu ${i + 1}` : "başvurucu";
      return p.vekilAd ? `${p.vekilAd} (${label} ${p.ad} vekili)` : `${p.ad} (${label})`;
    })
    .join(", ");
}

function karsiTemsilciListesi(mediationCase: any): string {
  return (mediationCase.karsiTaraflar || [])
    .map((p: any) => {
      if (p.vekilAd) return `${p.vekilAd} (${p.ad} vekili)`;
      if (p.yetkiliAd) return `${p.yetkiliAd} (${p.ad} yetkilisi)`;
      return `${p.ad} (kendisi)`;
    })
    .join(", ");
}

// Dosya adında kullanılamayacak karakterleri VE isim başına karışmış
// olabilecek TC Kimlik/Vergi No gibi rakam dizilerini temizler.
function safeFilePart(s: string): string {
  const noTc = (s || "Belge").replace(/^\d{10,11}\s+/, "");
  return noTc.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 80);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;
  if (!(await hasToolAccess(userId, "arabuluculuk"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const mediationCase = await prisma.mediationCase.findFirst({
    where: { id: params.id, userId },
    include: {
      karsiTaraflar: { orderBy: { sira: "asc" } },
      ekBasvurucular: { orderBy: { sira: "asc" } },
    },
  });
  if (!mediationCase) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true, email: true, arabuluculukBurosu: true, arabulucuSicilNo: true, arabulucuUets: true, arabulucuAdres: true, arabulucuIban: true },
  });
  if (!profile) return NextResponse.json({ error: "Profil bulunamadı." }, { status: 404 });

  const body = await req.json();
  const { docType } = body;

  // AI erişimi sadece GERÇEKTEN AI kullanan belge türü ("ilkoturum" — açılış/
  // kapanış paragrafları Gemini'den geliyor) için gerekli. "davet" ve
  // "sontutanak" tamamen sabit şablonlardan üretiliyor; AI erişimi olmayan
  // bir kullanıcıyı bu iki türde de gereksiz yere engellememek gerekiyordu.
  if (docType === "ilkoturum" && !(await hasAiAccess(userId))) {
    return NextResponse.json({ error: "AI kullanım yetkiniz yok." }, { status: 403 });
  }

  try {
    let finalText = "";
    let fileName = "Belge";

    if (docType === "davet") {
      const { davetEdilenSecim, gunSaat, toplantiYeri } = body;
      let ad = "", vekil = "", baroSicil = "", telefon = "";
      let digerTarafAd = "", digerTarafVekil = "";
      // "basvurucu" (geriye dönük uyum — Başvurucu 1) veya "basvurucu-{i}"
      // (i>=0, birden fazla başvurucu varsa — bkz. arSetDavetEdilenOptions).
      if (davetEdilenSecim === "basvurucu" || /^basvurucu-\d+$/.test(String(davetEdilenSecim))) {
        const basvurucular = basvurucularList(mediationCase);
        const idx = davetEdilenSecim === "basvurucu" ? 0 : parseInt(String(davetEdilenSecim).replace("basvurucu-", ""), 10);
        const bp = basvurucular[idx];
        if (!bp) return NextResponse.json({ error: "Davet edilecek taraf bulunamadı." }, { status: 400 });
        ad = bp.ad || "";
        vekil = bp.vekilAd || "";
        baroSicil = bp.vekilBaroSicil || "";
        telefon = bp.telefon || "";
        digerTarafAd = (mediationCase.karsiTaraflar || []).map((p) => p.ad).filter(Boolean).join(", ") || "";
        digerTarafVekil = mediationCase.karsiTaraflar[0]?.vekilAd || "";
      } else {
        const idx = parseInt(String(davetEdilenSecim).replace("karsi-", ""), 10);
        const p = mediationCase.karsiTaraflar[idx];
        if (!p) return NextResponse.json({ error: "Davet edilecek taraf bulunamadı." }, { status: 400 });
        ad = p.ad || "";
        vekil = p.vekilAd || "";
        baroSicil = p.vekilBaroSicil || "";
        telefon = p.telefon || "";
        digerTarafAd = basvurucularList(mediationCase).map((bp) => bp.ad).filter(Boolean).join(", ") || "";
        digerTarafVekil = mediationCase.basvurucuVekilAd || "";
      }

      const today = new Date().toLocaleDateString("tr-TR");
      const uyusmazlikOzeti = (mediationCase.uyusmazlikKonusu || "").split("\n")[0].replace(/[\[\]]/g, "") || "aranızdaki uyuşmazlığın";

      finalText = buildDavetMektubu(
        mediationCase,
        profile,
        ad,
        vekil,
        baroSicil,
        telefon,
        gunSaat || "",
        toplantiYeri || "",
        uyusmazlikOzeti,
        today,
        digerTarafAd,
        digerTarafVekil,
        davetEdilenSecim === "basvurucu" || /^basvurucu-\d+$/.test(String(davetEdilenSecim))
      );

      fileName = `${safeFilePart(ad)} - Davet Mektubu.docx`;
      const docxBuffer = await generateDocx(finalText);
      return NextResponse.json({ text: stripMarkup(finalText), docxBase64: docxBuffer.toString("base64"), fileName });
    } else if (docType === "ilkoturum") {
      const { notlar, toplantiTarihi, toplantiSaati, karsiTeklifVar, ikinciToplantiIstenmiyor, telekonferansTalepEden } = body;
      if (!notlar || !notlar.trim()) {
        return NextResponse.json({ error: "Kısa notlar girmelisiniz." }, { status: 400 });
      }
      // "İkinci toplantı istenmiyor" işaretliyse, süreç bu oturumda
      // anlaşmasız sona eriyor demektir — ayrı bir Son Tutanak adımına
      // gerek kalmadan TEK belgede "Bilgilendirme ve Anlaşamama Son
      // Tutanağı" üretiyoruz (kapanış kısmı AI'den değil, anlaşamama
      // metnindeki SABİT kalıptan geliyor).
      const sureBuradaBitiyor = !!ikinciToplantiIstenmiyor;
      // "YYYY-MM-DD" -> "DD.MM.YYYY" — hem AI anlatısında hem belge
      // başlığında/kapanışında GÖRÜŞMENİN yapıldığı tarih olarak kullanılır
      // (bugünün tarihi DEĞİL — "tutanağın düzenlendiği tarih" hatası buydu).
      const toplantiTarihiTr = formatTrDate(toplantiTarihi);

      // Açılış paragrafı ARTIK İKİYE bölündü: (1) "katılım teyidi" —
      // kimin hangi GSM hattından arandığı, katılıma/telekonferansa dair
      // ne beyan ettiği ve toplantının yüz yüze mi telekonferans mı
      // yapılacağı — kullanıcının verdiği GERÇEK örnek cümle kalıbıyla
      // SABİT/koddan üretilir (buildKatilimTeyidiParagraph, AI'a hiç
      // yazdırılmaz — GSM numarası/isim hatası riski olmasın). (2)
      // "oturum başladı" paragrafı ise hâlâ AI'ye yazdırılır (bkz. aşağı).
      const teyitParagrafi = indentParagraphs(
        buildKatilimTeyidiParagraph(mediationCase, telekonferansTalepEden, toplantiTarihiTr || "", toplantiSaati || "")
      );

      const openingPrompt = `Sen bir arabuluculuk bürosu için "Bilgilendirme ve İlk Oturum Tutanağı" hazırlayan bir asistansın.

Şu ÜSLUP KURALINI izle: Resmi, üçüncü şahıs anlatımıyla, "[isim ve isim]'in toplantı oturumunda oldukları görüldü ve müzakere süreci başladı" kalıbını kullanarak TEK bir paragraf yaz. Birden fazla karşı taraf varsa HER BİRİNİN toplantıda hazır bulunduğunu belirt.
ÇOK ÖNEMLİ — paragrafın SINIRI: Paragraf SADECE toplantıya kimlerin hazır bulunduğunu/katıldığını belirtip "... müzakere süreci başladı." cümlesiyle BİTMELİDİR, tam orada dur. Görüşmede NELERİN konuşulduğu, hangi tekliflerin verildiği, toplantının UZAYIP UZAMADIĞI, toplantının ne zaman/nasıl SONLANDIĞI veya bir SONRAKİ TOPLANTI ile ilgili HİÇBİR bilgiyi EKLEME — bunların hepsi ayrı, sana daha sonra sorulacak bir kapanış paragrafına ait, burada bunlardan hiç bahsetme. Kullanıcının notunda bu tür kapanış bilgileri geçiyor olsa bile, SEN o kısmı görmezden gel ve sadece katılım ile ilgili kısmı kullan. Görüşmelerin hangi GSM hattından/telefonla teyit edildiğinden ya da telekonferans talebinden HİÇ BAHSETME — bu bilgi ayrı, sabit bir paragrafta zaten var, sen sadece toplantı oturumunun kimlerle başladığını anlat.
${NARRATIVE_RULES}

GERÇEK BİLGİLER:
Başvurucu tarafı: ${basvurucuTemsilci(mediationCase)}
Karşı taraf(lar): ${karsiTemsilciListesi(mediationCase)}
Toplantı Tarihi: ${toplantiTarihiTr || "(belirtilmedi)"}
Toplantı Saati: ${toplantiSaati || "(belirtilmedi)"}
Kullanıcının notu (görüşmelerin nasıl geçtiği, oturumda neler konuşuldu vb.): ${notlar}

Şimdi bu bilgilerle TEK paragraf yaz.`;

      const oturumParagrafi = indentParagraphs(await generateNarrative(openingPrompt));
      const narrative = `${teyitParagrafi}\n\n${oturumParagrafi}`;

      // Kapanış: normal akışta AI'ye yazdırılır. Ama "ikinci toplantı
      // istenmiyor" işaretliyse süreç burada anlaşmasız bittiği için,
      // kapanış AI'den DEĞİL — Son Tutanak/Anlaşamama'daki ile AYNI SABİT
      // kalıptan (buildAnlasamamaNarrative) geliyor.
      let closing: string;
      if (sureBuradaBitiyor) {
        closing = buildAnlasamamaNarrative(mediationCase, !!karsiTeklifVar);
      } else {
        const closingPrompt = `Sen bir arabuluculuk bürosu için "Bilgilendirme ve İlk Oturum Tutanağı"nın KAPANIŞ paragrafını yazan bir asistansın.

Şu ÜSLUP KURALINI izle: "[isim] söz alarak teklifini iletti. [isim] söz alarak ... beyan etti/süre talep etti." kalıbıyla, oturumda kimin ne söylediğini, sonunda ne karara varıldığını (ikinci toplantı mı, tutanağın ne zaman sonlandırıldığı) anlatan TEK bir paragraf yaz. Birden fazla karşı taraf varsa HER BİRİNİN ayrı ayrı söz aldığını yaz. "Talep" kelimesini KULLANMA — arabuluculukta karşı tarafa iletilen şey bir "teklif"tir. Bir tarafın söylediklerini aktarırken ("kabul etmediğini/etmediklerini", "istediğini/istediklerini" gibi) EĞER o taraf bir VEKİL (avukat) ile temsil ediliyorsa ÇOĞUL kip ("etmediklerini"), EĞER taraf vekilsiz TEK BAŞINA konuşuyorsa TEKİL kip ("etmediğini") kullan — GERÇEK BİLGİLER kısmındaki "(... vekili)" ifadesi varsa vekili var demektir.
${NARRATIVE_RULES}

GERÇEK BİLGİLER:
Başvurucu tarafı: ${basvurucuTemsilci(mediationCase)}
Karşı taraf(lar): ${karsiTemsilciListesi(mediationCase)}
Kullanıcının notu (oturumda neler konuşuldu, nasıl sonlandı): ${notlar}

Şimdi bu bilgilerle TEK paragraf yaz.`;

        closing = indentParagraphs(await generateNarrative(closingPrompt));
      }

      // Kapanış cümlesindeki tarih de GÖRÜŞMENİN yapıldığı tarih olmalı —
      // toplantı tarihi girilmediyse (nadiren) bugüne düşer.
      const belgeTarihi = toplantiTarihiTr || new Date().toLocaleDateString("tr-TR");

      if (sureBuradaBitiyor) {
        // Tek belgede "Bilgilendirme ve Anlaşamama Son Tutanağı" — Son
        // Tutanak adımına ayrıca gerek yok. "Arabuluculuk Sonucu" alanı ve
        // başlık sade "ANLAŞAMAMA" gösterir — "hiçbir konuda" ibaresi
        // SADECE narrative metninin son cümlesinde geçer (bkz.
        // buildAnlasamamaNarrative).
        const extraLine = `[[D]]**__Arabuluculuk Sonucu\t__****: ANLAŞAMAMA**`;
        const header = buildHeaderBlock(mediationCase, profile, "ARABULUCU", extraLine, toplantiTarihiTr || undefined);
        const title = `[[SZ14]][[C]]**${buildUyusmazlikBasligi(mediationCase.uyusmazlikTuru)}** \n[[SZ14]][[C]]**DAVA ŞARTI ARABULUCULUK BİLGİLENDİRME VE** \n[[SZ14]][[C]]**"ANLAŞAMAMA" SON TUTANAĞI**\n\n\n`;
        finalText =
          title +
          header +
          "\n\n" +
          narrative +
          "\n\n" +
          ILK_OTURUM_BILGILENDIRME +
          "\n\n" +
          closing +
          `\n\t\n\tİşbu arabuluculuk bilgilendirme ve anlaşamama son tutanağı iki sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15 uyarınca hep birlikte imza altına alındı. ${belgeTarihi}\n\n\n\n\n` +
          buildSignatureBlock(mediationCase, profile);

        fileName = `${safeFilePart(mediationCase.basvurucuAd || "")} - Bilgilendirme ve Anlaşamama Son Tutanağı.udf`;
      } else {
        const header = buildHeaderBlock(mediationCase, profile, "ARABULUCU", undefined, toplantiTarihiTr || undefined);
        const title = `[[SZ14]][[C]]**${buildUyusmazlikBasligi(mediationCase.uyusmazlikTuru)}** \n[[SZ14]][[C]]**DAVA ŞARTI ARABULUCULUK BİLGİLENDİRME VE** \n[[SZ14]][[C]]**İLK OTURUM TUTANAĞI**\n\n\n`;
        finalText =
          title +
          header +
          "\n\n" +
          narrative +
          "\n\n" +
          ILK_OTURUM_BILGILENDIRME +
          "\n\n" +
          closing +
          `\n\t\n\tİşbu arabuluculuk bilgilendirme ve ilk oturum tutanağı üç sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15 uyarınca hep birlikte imza altına alındı. ${belgeTarihi}\n\n\n\n\n` +
          buildSignatureBlock(mediationCase, profile);

        fileName = `${safeFilePart(mediationCase.basvurucuAd || "")} - Bilgilendirme ve İlk Oturum Toplantısı.udf`;
      }

      // Tarih/saat girildiyse dosyaya kaydet — bu, Yaklaşan Süreler ve
      // bildirim ziliyle otomatik senkronize olur. Süreç burada
      // anlaşmasız bittiyse Son Tutanak alanlarını da aynı anda dolduruyoruz
      // (ayrı bir Son Tutanak adımı atlandığı için).
      if (toplantiTarihi) {
        // Sunucu UTC'de çalışabiliyor — Türkiye saatini (+03:00) açıkça
        // belirtmezsek, girilen saat yanlışlıkla UTC sanılıp 3 saat kayar.
        const dt = new Date(`${toplantiTarihi}T${toplantiSaati || "09:00"}:00+03:00`);
        if (!isNaN(dt.getTime())) {
          await prisma.mediationCase.update({
            where: { id: mediationCase.id },
            data: sureBuradaBitiyor
              ? { ilkOturumTarihi: dt, sonTutanakTarihi: dt, sonTutanakSonucu: "anlasamama" }
              : { ilkOturumTarihi: dt },
          });
        }
      }
    } else if (docType === "sontutanak") {
      // Sonuç artık 4 seçenekli: "anlasma" | "kismi" | "anlasamama" | "gorusmesiz".
      const {
        sonuc,
        notlar,
        anlasilanHususlar,
        anlasilamayanHususlar,
        ucretTutari,
        odeyenBasvurucu,
        odeyenKarsiTaraflar,
        katilmayanBasvurucu,
        katilmayanKarsiTaraflar,
        gorusmemeSebebi,
        tutanakTarihi,
        tutanakSaati,
      } = body;
      const karsiTarafSayisi = mediationCase.karsiTaraflar.length || 1;
      // Aynı hata sınıfı burada da vardı: "tutanağın düzenlendiği tarih" ve
      // kapanış cümlesi, GÖRÜŞMENİN/TUTANAĞIN yapıldığı tarih yerine
      // sunucunun bugünkü tarihini kullanıyordu.
      const tutanakTarihiTr = formatTrDate(tutanakTarihi);
      const belgeTarihi = tutanakTarihiTr || new Date().toLocaleDateString("tr-TR");

      let narrative: string;
      let attendance: { basvurucu?: boolean; karsiTaraflar?: boolean[] } | undefined;
      let sonucLabel: string;
      let closingLine: string;

      if (sonuc === "anlasma") {
        if (!notlar || !notlar.trim()) {
          return NextResponse.json({ error: "Anlaşma şartlarını yazmalısınız." }, { status: 400 });
        }
        const ucretCumlesi =
          ucretTutari && String(ucretTutari).trim()
            ? buildUcretCumlesi(mediationCase, profile, ucretTutari, !!odeyenBasvurucu, odeyenKarsiTaraflar || [])
            : "";
        narrative = buildAnlasmaNarrative(mediationCase, notlar + (ucretCumlesi ? "\n\n" + ucretCumlesi : ""), belgeTarihi);
        sonucLabel = "ANLAŞMA";
        closingLine = `\tİşbu arabuluculuk anlaşma son tutanağı iki sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15  uyarınca hep birlikte imza altına alındı. ${belgeTarihi}`;
      } else if (sonuc === "kismi") {
        if (!anlasilanHususlar || !anlasilanHususlar.trim() || !anlasilamayanHususlar || !anlasilamayanHususlar.trim()) {
          return NextResponse.json({ error: "Anlaşma sağlanan ve sağlanamayan hususları yazmalısınız." }, { status: 400 });
        }
        const ucretCumlesi =
          ucretTutari && String(ucretTutari).trim()
            ? buildUcretCumlesi(mediationCase, profile, ucretTutari, !!odeyenBasvurucu, odeyenKarsiTaraflar || [])
            : undefined;
        narrative = buildKismiAnlasmaNarrative(mediationCase, anlasilanHususlar, anlasilamayanHususlar, belgeTarihi, ucretCumlesi);
        sonucLabel = "KISMİ ANLAŞMA";
        closingLine = `\tİşbu arabuluculuk kısmi anlaşma son tutanağı iki sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15 uyarınca hep birlikte imza altına alındı. ${belgeTarihi}`;
      } else if (sonuc === "gorusmesiz") {
        const katilmayanKT: boolean[] = Array.from({ length: karsiTarafSayisi }, (_, i) => !!(katilmayanKarsiTaraflar || [])[i]);
        const hicKatilmayanYok = !katilmayanBasvurucu && katilmayanKT.every((v) => !v);
        if (hicKatilmayanYok) {
          return NextResponse.json({ error: "Toplantıya katılmayan en az bir taraf seçmelisiniz." }, { status: 400 });
        }
        const katilmayanlar: string[] = [];
        if (katilmayanBasvurucu) {
          // Tek checkbox "başvurucu tarafı katılmadı" anlamına gelir —
          // birden fazla başvurucu varsa HEPSİ listelenir (bkz. issue: tek
          // checkbox'ın hangi başvurucuyu kapsadığı ayrıştırılmıyor, bu
          // yüzden "başvurucu tarafının tamamı" olarak ele alınıyor).
          const basvurucular = basvurucularList(mediationCase);
          basvurucular.forEach((p, i) => {
            const suffix = basvurucular.length > 1 ? ` ${i + 1}` : "";
            katilmayanlar.push(`Başvurucu${suffix} ${p.vekilAd || p.ad || "……"}`);
          });
        }
        mediationCase.karsiTaraflar.forEach((p, i) => {
          if (katilmayanKT[i]) {
            const suffix = karsiTarafSayisi > 1 ? ` ${i + 1}` : "";
            katilmayanlar.push(`Karşı Taraf${suffix} ${p.vekilAd || p.yetkiliAd || p.ad || "……"}`);
          }
        });
        narrative = buildGorusmeYapilmadanNarrative(katilmayanlar, gorusmemeSebebi || "");
        sonucLabel = "GÖRÜŞME YAPILMADAN ANLAŞAMAMA";
        closingLine = `\tİşbu arabuluculuk görüşme yapılmadan anlaşamama son tutanağı iki sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15 uyarınca katılan taraflarca imza altına alındı. ${belgeTarihi}`;
        // Gelmeyen/ulaşılamayan tarafa imza satırı hiç açılmaz.
        attendance = { basvurucu: !katilmayanBasvurucu, karsiTaraflar: katilmayanKT.map((v) => !v) };
      } else {
        // "anlasamama" — karşı teklif seçeneği artık İlk Oturum adımında
        // sorulur (o oturumda "ikinci toplantı istenmiyor" işaretlenmediyse
        // süreç buraya kadar gelir) — bu formda ayrıca sorulmuyor, sabit
        // kalıp kullanılır.
        narrative = buildAnlasamamaNarrative(mediationCase, false);
        // "Arabuluculuk Sonucu" alanı ve başlık sade "ANLAŞAMAMA" gösterir
        // — "hiçbir konuda" ibaresi SADECE narrative'in son cümlesinde
        // (tırnağın dışında) geçer, bkz. buildAnlasamamaNarrative.
        sonucLabel = "ANLAŞAMAMA";
        closingLine = `\tİşbu arabuluculuk bilgilendirme ve anlaşamama son tutanağı iki sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15 uyarınca hep birlikte imza altına alındı. ${belgeTarihi}`;
      }

      // NOT: [[D]] işareti, buildHeaderBlock'taki tarih satırlarıyla
      // (Başvuru/Görevlendirme/Düzenlenme Tarihi) AYNI biçimi kullanır —
      // etiket + TAB birlikte kalın+altı çizili, ':' değer tarafında.
      const extraLine = `[[D]]**__Arabuluculuk Sonucu\t__****: ${sonucLabel}**`;
      const header = buildHeaderBlock(mediationCase, profile, "ARABULUCUNUN", extraLine, tutanakTarihiTr || undefined);
      const title = `[[SZ14]][[C]]**${buildUyusmazlikBasligi(mediationCase.uyusmazlikTuru)}** \n[[SZ14]][[C]]**DAVA ŞARTI ARABULUCULUK** \n[[SZ14]][[C]]**"${sonucLabel}" SON TUTANAĞI**\n\n`;

      // "Görüşme Yapılmadan Anlaşamama" DIŞINDAKİ tüm sonuçlarda, anlatıdan
      // ÖNCE tarafların toplantı oturumuna geldiğini/bilgilendirildiğini
      // belirten bir açılış paragrafı gelir (daha önce ATLANMIŞTI, bkz.
      // buildSonTutanakGirisParagrafi'nin üstündeki not). "Görüşme
      // Yapılmadan Anlaşamama"da bu paragraf hiç YAZILMAZ — toplantı zaten
      // hiç yapılamadı.
      const girisParagrafi =
        sonuc === "gorusmesiz" ? "" : buildSonTutanakGirisParagrafi(tutanakTarihiTr || "", tutanakSaati || "") + "\n\n";

      finalText =
        title +
        header +
        "\n\n\n\n\n" +
        girisParagrafi +
        narrative +
        "\n\n" +
        closingLine +
        "\n\n\n\n" +
        buildSignatureBlock(mediationCase, profile, attendance);

      if (tutanakTarihi) {
        const dt = new Date(`${tutanakTarihi}T${tutanakSaati || "09:00"}:00+03:00`);
        if (!isNaN(dt.getTime())) {
          await prisma.mediationCase.update({
            where: { id: mediationCase.id },
            data: { sonTutanakTarihi: dt, sonTutanakSonucu: sonuc },
          });
        }
      }

      fileName = `${safeFilePart(mediationCase.basvurucuAd || "")} - ${sonucKisaLabel(sonuc)} Son Tutanağı.udf`;
    } else {
      return NextResponse.json({ error: "Geçersiz belge türü." }, { status: 400 });
    }

    const udfBuffer = await generateUdf(finalText);
    return NextResponse.json({ text: stripMarkup(finalText), udfBase64: udfBuffer.toString("base64"), fileName });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Belge üretilemedi." }, { status: 500 });
  }
}
