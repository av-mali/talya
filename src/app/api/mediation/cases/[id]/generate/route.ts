import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasToolAccess, hasAiAccess } from "@/lib/workspace";
import { generateUdf } from "@/lib/udf";
import { generateDocx } from "@/lib/docExport";
import {
  buildHeaderBlock,
  buildSignatureBlock,
  buildDavetMektubu,
  buildAnlasmaNarrative,
  buildAnlasamamaNarrative,
  ILK_OTURUM_BILGILENDIRME,
  stripMarkup,
} from "@/lib/mediationTemplates";

export const maxDuration = 60;

const NARRATIVE_RULES = `
KESİN KURALLAR:
- Çıktında KÖŞELİ PARANTEZ ("[" veya "]") KULLANMA — hiçbir yer tutucu bırakma, sana verilen gerçek isim/tarih/saat bilgilerini doğrudan cümlenin içine yaz.
- "Başvurucu vekili" ya da "Karşı taraf" gibi GENEL/İSİMSİZ ifadeler kullanma — her zaman gerçek ismi yaz (sana verilmişse).
- Sana bir bilgi (tarih, saat, isim) verilmediyse, o bilgiyi UYDURMA; cümleyi o bilgiye hiç değinmeden, akıcı şekilde kur.
- Yalnızca istenen paragrafları yaz — başlık, açıklama, giriş cümlesi ekleme.`;

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
  return text.trim().replace(/[\[\]]/g, "");
}

function basvurucuTemsilci(mediationCase: any): string {
  return mediationCase.basvurucuVekilAd
    ? `${mediationCase.basvurucuVekilAd} (başvurucu ${mediationCase.basvurucuAd} vekili)`
    : `${mediationCase.basvurucuAd} (başvurucu)`;
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
  if (!(await hasAiAccess(userId))) {
    return NextResponse.json({ error: "AI kullanım yetkiniz yok." }, { status: 403 });
  }

  const mediationCase = await prisma.mediationCase.findFirst({
    where: { id: params.id, userId },
    include: { karsiTaraflar: { orderBy: { sira: "asc" } } },
  });
  if (!mediationCase) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true, email: true, arabuluculukBurosu: true, arabulucuSicilNo: true, arabulucuUets: true, arabulucuAdres: true },
  });
  if (!profile) return NextResponse.json({ error: "Profil bulunamadı." }, { status: 404 });

  const body = await req.json();
  const { docType } = body;

  try {
    let finalText = "";
    let fileName = "Belge";

    if (docType === "davet") {
      const { davetEdilenSecim, gunSaat, toplantiYeri } = body;
      let ad = "", vekil = "", baroSicil = "", telefon = "";
      let digerTarafAd = "", digerTarafVekil = "";
      if (davetEdilenSecim === "basvurucu") {
        ad = mediationCase.basvurucuAd || "";
        vekil = mediationCase.basvurucuVekilAd || "";
        baroSicil = mediationCase.basvurucuBaroSicil || "";
        telefon = mediationCase.basvurucuTelefon || "";
        digerTarafAd = (mediationCase.karsiTaraflar || []).map((p) => p.ad).filter(Boolean).join(", ") || "";
        digerTarafVekil = mediationCase.karsiTaraflar[0]?.vekilAd || "";
      } else {
        const idx = parseInt(String(davetEdilenSecim).replace("karsi-", ""), 10);
        const p = mediationCase.karsiTaraflar[idx];
        if (!p) return NextResponse.json({ error: "Davet edilecek taraf bulunamadı." }, { status: 400 });
        ad = p.ad || "";
        vekil = p.vekilAd || "";
        telefon = p.telefon || "";
        digerTarafAd = mediationCase.basvurucuAd || "";
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
        davetEdilenSecim === "basvurucu"
      );

      fileName = `${safeFilePart(ad)} - Davet Mektubu.docx`;
      const docxBuffer = await generateDocx(finalText);
      return NextResponse.json({ text: stripMarkup(finalText), docxBase64: docxBuffer.toString("base64"), fileName });
    } else if (docType === "ilkoturum") {
      const { notlar, toplantiTarihi, toplantiSaati } = body;
      if (!notlar || !notlar.trim()) {
        return NextResponse.json({ error: "Kısa notlar girmelisiniz." }, { status: 400 });
      }

      const openingPrompt = `Sen bir arabuluculuk bürosu için "Bilgilendirme ve İlk Oturum Tutanağı" hazırlayan bir asistansın.

Şu ÜSLUP KURALINI izle: Resmi, üçüncü şahıs anlatımıyla, "[isim] ile yapılan görüşmede ... teyit edildi" ve "[isim ve isim]'in toplantı oturumunda oldukları görüldü ve müzakere süreci başladı" kalıplarını kullanarak İKİ ayrı paragraf yaz. Birden fazla karşı taraf varsa HER BİRİNİN katılım durumunu ayrı ayrı belirt.
${NARRATIVE_RULES}

GERÇEK BİLGİLER:
Başvurucu tarafı: ${basvurucuTemsilci(mediationCase)}
Karşı taraf(lar): ${karsiTemsilciListesi(mediationCase)}
Toplantı Tarihi: ${toplantiTarihi || "(belirtilmedi)"}
Toplantı Saati: ${toplantiSaati || "(belirtilmedi)"}
Kullanıcının notu (görüşmelerin nasıl geçtiği, teyit süreci, toplantı yöntemi vb.): ${notlar}

Şimdi bu bilgilerle 2 paragraf yaz.`;

      const narrative = await generateNarrative(openingPrompt);

      const closingPrompt = `Sen bir arabuluculuk bürosu için "Bilgilendirme ve İlk Oturum Tutanağı"nın KAPANIŞ paragrafını yazan bir asistansın.

Şu ÜSLUP KURALINI izle: "[isim] söz alarak taleplerini iletti. [isim] söz alarak ... beyan etti/süre talep etti." kalıbıyla, oturumda kimin ne söylediğini, sonunda ne karara varıldığını (ikinci toplantı mı, tutanağın ne zaman sonlandırıldığı) anlatan TEK bir paragraf yaz. Birden fazla karşı taraf varsa HER BİRİNİN ayrı ayrı söz aldığını yaz.
${NARRATIVE_RULES}

GERÇEK BİLGİLER:
Başvurucu tarafı: ${basvurucuTemsilci(mediationCase)}
Karşı taraf(lar): ${karsiTemsilciListesi(mediationCase)}
Kullanıcının notu (oturumda neler konuşuldu, nasıl sonlandı): ${notlar}

Şimdi bu bilgilerle TEK paragraf yaz.`;

      const closing = await generateNarrative(closingPrompt);

      const header = buildHeaderBlock(mediationCase, profile, "ARABULUCU");
      const title = `[[C]]**...... HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA** \n[[C]]**DAVA ŞARTI ARABULUCULUK BİLGİLENDİRME VE** \n[[C]]**İLK OTURUM TUTANAĞI**\n\n\n`;
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

      // Tarih/saat girildiyse dosyaya kaydet — bu, Yaklaşan Süreler ve
      // bildirim ziliyle otomatik senkronize olur.
      if (toplantiTarihi) {
        const dt = new Date(`${toplantiTarihi}T${toplantiSaati || "09:00"}:00`);
        if (!isNaN(dt.getTime())) {
          await prisma.mediationCase.update({ where: { id: mediationCase.id }, data: { ilkOturumTarihi: dt } });
        }
      }

      fileName = `${safeFilePart(mediationCase.basvurucuAd || "")} - Bilgilendirme ve İlk Oturum Toplantısı.udf`;
    } else if (docType === "sontutanak") {
      const { sonuc, notlar, karsiTeklifVar, ikinciToplantiIsteniyor, tutanakTarihi, tutanakSaati } = body;
      const isAnlasma = sonuc === "anlasma";

      let narrative: string;
      if (isAnlasma) {
        if (!notlar || !notlar.trim()) {
          return NextResponse.json({ error: "Anlaşma şartlarını yazmalısınız." }, { status: 400 });
        }
        narrative = buildAnlasmaNarrative(mediationCase, notlar, new Date().toLocaleDateString("tr-TR"));
      } else {
        narrative = buildAnlasamamaNarrative(mediationCase, !!karsiTeklifVar, !!ikinciToplantiIsteniyor);
      }

      const sonucLabel = isAnlasma ? "ANLAŞMA" : "ANLAŞAMAMA";
      const extraLine = `Arabuluculuk Sonucu\t\t\t: ${sonucLabel}`;
      const header = buildHeaderBlock(mediationCase, profile, "ARABULUCUNUN", extraLine);
      const title = `[[C]]**..... HUKUKUNDAN KAYNAKLANAN UYUŞMAZLIKLARDA** \n[[C]]**DAVA ŞARTI ARABULUCULUK** \n[[C]]**"${sonucLabel}" SON TUTANAĞI**\n\n`;
      const today = new Date().toLocaleDateString("tr-TR");
      const closingLine = isAnlasma
        ? `\tİşbu arabuluculuk anlaşma son tutanağı iki sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15  uyarınca hep birlikte imza altına alındı. ${today}`
        : `\tİşbu arabuluculuk bilgilendirme ve anlaşamama son tutanağı iki sayfa ve dört nüsha olarak 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu m. 11, m. 15 uyarınca hep birlikte imza altına alındı. ${today}`;

      finalText =
        title +
        header +
        "\n\n\n\n\n" +
        narrative +
        "\n\n" +
        closingLine +
        "\n\n\n\n" +
        buildSignatureBlock(mediationCase, profile);

      if (tutanakTarihi) {
        const dt = new Date(`${tutanakTarihi}T${tutanakSaati || "09:00"}:00`);
        if (!isNaN(dt.getTime())) {
          await prisma.mediationCase.update({
            where: { id: mediationCase.id },
            data: { sonTutanakTarihi: dt, sonTutanakSonucu: sonuc },
          });
        }
      }

      fileName = `${safeFilePart(mediationCase.basvurucuAd || "")} - ${isAnlasma ? "Anlaşma" : "Anlaşamama"} Son Tutanağı.udf`;
    } else {
      return NextResponse.json({ error: "Geçersiz belge türü." }, { status: 400 });
    }

    const udfBuffer = await generateUdf(finalText);
    return NextResponse.json({ text: stripMarkup(finalText), udfBase64: udfBuffer.toString("base64"), fileName });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Belge üretilemedi." }, { status: 500 });
  }
}
