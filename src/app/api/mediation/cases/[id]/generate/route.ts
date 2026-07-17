import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasToolAccess, hasAiAccess } from "@/lib/workspace";
import { generateUdf } from "@/lib/udf";
import {
  buildHeaderBlock,
  buildSignatureBlock,
  buildDavetMektubu,
  ILK_OTURUM_BILGILENDIRME,
  ANLASMA_KAPANIS,
} from "@/lib/mediationTemplates";

export const maxDuration = 60;

// Kısa kullanıcı notlarından, örnek belgelerin diline uygun bir anlatı
// paragrafı üretir. SADECE anlatıyı üretir — başlık bloğu ve sabit yasal
// metinler burada AI'a hiç gösterilmez/yazdırılmaz (halüsinasyon riski
// olmasın diye), onlar template'lerden aynen gelir.
async function generateNarrative(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error("AI yapılandırması eksik.");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") || "";
  if (!text.trim()) throw new Error("AI yanıt üretemedi.");
  return text.trim();
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;
  if (!(await hasToolAccess(userId, "arabuluculuk"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }
  if (!(await hasAiAccess(userId))) {
    return NextResponse.json({ error: "AI kullanım yetkiniz yok." }, { status: 403 });
  }

  const mediationCase = await prisma.mediationCase.findFirst({ where: { id: params.id, userId } });
  if (!mediationCase) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true, email: true, arabuluculukBurosu: true, arabulucuSicilNo: true, arabulucuUets: true },
  });
  if (!profile) return NextResponse.json({ error: "Profil bulunamadı." }, { status: 404 });

  const body = await req.json();
  const { docType } = body; // "davet" | "ilkoturum" | "sontutanak"

  try {
    let finalText = "";

    if (docType === "davet") {
      const { davetEdilenTaraf, gunSaat, toplantiYeri } = body;
      // davetEdilenTaraf: "basvurucu" | "karsi" — davet edilen taraf seçimi
      const isKarsi = davetEdilenTaraf === "karsi";
      const ad = isKarsi ? mediationCase.karsiTarafAd : mediationCase.basvurucuAd;
      const vekil = isKarsi ? mediationCase.karsiTarafVekilAd : mediationCase.basvurucuVekilAd;
      const baroSicil = isKarsi ? "" : mediationCase.basvurucuBaroSicil || "";
      const telefon = isKarsi ? mediationCase.karsiTarafTelefon : mediationCase.basvurucuTelefon;

      const today = new Date().toLocaleDateString("tr-TR");
      const uyusmazlikOzeti = (mediationCase.uyusmazlikKonusu || "").split("\n")[0] || "aranızdaki uyuşmazlığın";

      finalText = buildDavetMektubu(
        mediationCase,
        profile,
        ad || "",
        vekil || "",
        baroSicil,
        telefon || "",
        gunSaat || "",
        toplantiYeri || "",
        uyusmazlikOzeti,
        today
      );
    } else if (docType === "ilkoturum") {
      const { notlar, toplantiTarihi, toplantiSaati } = body;
      if (!notlar || !notlar.trim()) {
        return NextResponse.json({ error: "Kısa notlar girmelisiniz." }, { status: 400 });
      }

      const narrativePrompt = `Sen bir arabuluculuk bürosu için "Bilgilendirme ve İlk Oturum Tutanağı" hazırlayan bir asistansın. Aşağıda, gerçek bir örnek tutanaktan alınmış İKİ anlatı paragrafının stili var — resmi, üçüncü şahıs, tarih/saat/telefon detaylarını içeren bir dil:

"Başvurucu [ad] vekili [vekil] ile yapılan görüşmede toplantıya belirlenen gün ve saatte katılacağı [tarih] günü [telefon] numaralı GSM hattından yapılan görüşme ile teyit edildi. Karşı taraf olan [karşı taraf] ile [tarih] günü [telefon] numaralı GSM hattından yapılan görüşmede... Taraflarla karşılıklı görüşme sonunda bilgilendirme ve ilk oturum toplantısının [tarih] günü saat [saat]'da yapılmasına karar verildi."

"[Tarih] günü saat [saat]'da [taraflar]'ın toplantı oturumunda oldukları görüldü ve müzakere süreci başladı."

Şimdi SANA VERİLEN şu bilgilere göre, BU AYNI ÜSLUPTA, benzer uzunlukta 2 paragraf yaz (sadece bu 2 paragrafı yaz, başka açıklama ekleme, başlık ekleme):

Başvurucu: ${mediationCase.basvurucuAd}${mediationCase.basvurucuVekilAd ? " vekili " + mediationCase.basvurucuVekilAd : ""}
Karşı Taraf: ${mediationCase.karsiTarafAd}${mediationCase.karsiTarafVekilAd ? " vekili " + mediationCase.karsiTarafVekilAd : mediationCase.karsiTarafYetkiliAd ? " yetkilisi " + mediationCase.karsiTarafYetkiliAd : ""}
Toplantı Tarihi ve Saati: ${toplantiTarihi || "belirtilmedi"} ${toplantiSaati || ""}
Kullanıcının kısa notları (gerçekleşen görüşmeler, kararlaştırılanlar): ${notlar}

Emin olmadığın hiçbir ismi/tarihi/telefon numarasını uydurma — sadece yukarıda sana verilenleri kullan, verilmeyeni boş bırak veya genel ifadeyle geç.`;

      const narrative = await generateNarrative(narrativePrompt);

      const closingPrompt = `Aşağıda, bir arabuluculuk "İlk Oturum" tutanağının KAPANIŞ paragrafının örnek üslubu var:

"Başvurucu vekili [vekil] söz alarak arabuluculuğa konu olayla ilgili taleplerini iletti. [Karşı taraf] söz alarak başvurucunun taleplerini değerlendirmek üzere süre talep etti. Taraflarla birlikte [tarih] günü ikinci toplantı yapılmasına karar verildi ve bilgilendirme ve ilk oturum toplantısı [tarih] günü saat [saat]'de sonlandırıldı."

Şimdi şu kısa nottan yola çıkarak AYNI ÜSLUPTA tek bir kapanış paragrafı yaz (sadece bu paragrafı yaz, başka açıklama ekleme):

Kullanıcının notu: ${notlar}`;

      const closing = await generateNarrative(closingPrompt);

      const header = buildHeaderBlock(mediationCase, profile, "ARABULUCU");
      const title = `...... HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA \nDAVA ŞARTI ARABULUCULUK BİLGİLENDİRME VE \nİLK OTURUM TUTANAĞI\n\n\n`;
      finalText =
        title +
        header +
        "\n\n" +
        narrative +
        "\n\n" +
        ILK_OTURUM_BILGILENDIRME +
        "\n\n" +
        closing +
        `\n\t\n\tİşbu arabuluculuk bilgilendirme ve ilk oturum tutanağı üç sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15 uyarınca hep birlikte imza altına alındı. ${new Date().toLocaleDateString("tr-TR")}\n\n\n\n\n` +
        buildSignatureBlock(mediationCase, profile);
    } else if (docType === "sontutanak") {
      const { sonuc, notlar } = body; // sonuc: "anlasma" | "anlasamama"
      if (!notlar || !notlar.trim()) {
        return NextResponse.json({ error: "Kısa notlar girmelisiniz." }, { status: 400 });
      }
      const isAnlasma = sonuc === "anlasma";

      const narrativePrompt = isAnlasma
        ? `Sen bir arabuluculuk bürosu için "Anlaşma Son Tutanağı" hazırlayan bir asistansın. Örnek üslup:

"[Tarih] günü taraflarla görüşmeler yapılmış, [karşı taraf] ile yapılan görüşmede... taraflar aşağıda belirtilen şartlar altında anlaşmaya varmıştır." ardından anlaşma şartlarının madde madde/paragraf paragraf yazılması, ardından: "Taraflar, üzerinde anlaşılan hususlar hakkında dava açılamayacağını anladıklarını ve bu durumu kabul ettiklerini beyan ederek son tutanağın bu şekilde düzenlenmesini talep etmişlerdir. ... arabuluculuk süreci ANLAŞMA ile sonuçlandırılmıştır."

Şimdi şu bilgilerden AYNI ÜSLUPTA anlatı paragraf(lar)ı yaz (sadece anlatıyı yaz, başlık/açıklama ekleme):

Başvurucu: ${mediationCase.basvurucuAd}${mediationCase.basvurucuVekilAd ? " vekili " + mediationCase.basvurucuVekilAd : ""}
Karşı Taraf: ${mediationCase.karsiTarafAd}${mediationCase.karsiTarafVekilAd ? " vekili " + mediationCase.karsiTarafVekilAd : mediationCase.karsiTarafYetkiliAd ? " yetkilisi " + mediationCase.karsiTarafYetkiliAd : ""}
Kullanıcının notu (anlaşma şartları, süreç): ${notlar}

Emin olmadığın hiçbir ismi/tutarı/tarihi uydurma — sadece verilenleri kullan.`
        : `Sen bir arabuluculuk bürosu için "Anlaşamama Son Tutanağı" hazırlayan bir asistansın. Örnek üslup:

"Başvurucu [ad] vekili [vekil] ... karşı taraf vekiline başvuruya konu olayı tekrar anlatarak ... talep ettiklerini iletti. [Karşı taraf] ... arabuluculuk sürecinde anlaşmanın mümkün olmadığını beyan etti. ... Taraflar ile yapılan görüşmeler sonucunda tarafların, arabulucu tarafından sunulan alternatif çözüm önerilerine yanaşmadığı görülmüş ve arabuluculuk sürecinin devam ettirilmesinin mevcut durumu değiştirmeyeceği değerlendirilmiş, bahse konu uyuşmazlık arabuluculuk sürecinde \"ANLAŞAMAMA\" olarak sonuçlandırılmıştır."

Şimdi şu bilgilerden AYNI ÜSLUPTA anlatı paragraf(lar)ı yaz (sadece anlatıyı yaz, başlık/açıklama ekleme):

Başvurucu: ${mediationCase.basvurucuAd}${mediationCase.basvurucuVekilAd ? " vekili " + mediationCase.basvurucuVekilAd : ""}
Karşı Taraf: ${mediationCase.karsiTarafAd}${mediationCase.karsiTarafVekilAd ? " vekili " + mediationCase.karsiTarafVekilAd : mediationCase.karsiTarafYetkiliAd ? " yetkilisi " + mediationCase.karsiTarafYetkiliAd : ""}
Kullanıcının notu (görüşmede ne oldu, neden anlaşılamadı): ${notlar}

Emin olmadığın hiçbir ismi/tarihi uydurma — sadece verilenleri kullan.`;

      const narrative = await generateNarrative(narrativePrompt);

      const sonucLabel = isAnlasma ? "ANLAŞMA" : "ANLAŞAMAMA";
      const extraLine = `Arabuluculuk Sonucu\t\t\t: ${sonucLabel}`;
      const header = buildHeaderBlock(mediationCase, profile, "ARABULUCUNUN", extraLine);
      const title = `..... HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA \nDAVA ŞARTI ARABULUCULUK \n"${sonucLabel}" SON TUTANAĞI\n\n`;
      const today = new Date().toLocaleDateString("tr-TR");
      const pageWord = isAnlasma ? "iki" : "iki";
      const closingLine = isAnlasma
        ? `\tİşbu arabuluculuk anlaşma son tutanağı ${pageWord} sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15  uyarınca hep birlikte imza altına alındı. ${today}`
        : `\tİşbu arabuluculuk bilgilendirme ve anlaşamama son tutanağı ${pageWord} sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15 uyarınca hep birlikte imza altına alındı. ${today}`;

      finalText =
        title +
        header +
        "\n\n\n\n\n" +
        narrative +
        (isAnlasma ? "\n\n" + ANLASMA_KAPANIS : "") +
        "\n\n" +
        closingLine +
        "\n\n\n\n" +
        buildSignatureBlock(mediationCase, profile);
    } else {
      return NextResponse.json({ error: "Geçersiz belge türü." }, { status: 400 });
    }

    const udfBuffer = await generateUdf(finalText);
    return NextResponse.json({ text: finalText, udfBase64: udfBuffer.toString("base64") });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Belge üretilemedi." }, { status: 500 });
  }
}
