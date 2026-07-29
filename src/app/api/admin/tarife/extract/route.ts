import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callGemini } from "@/lib/gemini";
import { DEFAULT_TARIFF } from "@/lib/feeTariff";

// Admin, her yıl yayınlanan yeni "Arabuluculuk Asgari Ücret Tarifesi"
// Tebliği'nin PDF'ini veya tablo ekran görüntüsünü yükler; bu uç nokta
// Gemini'ye gönderip yapılandırılmış JSON olarak geri döndürür. Hiçbir
// şey bu aşamada KAYDEDİLMEZ — admin, dönen veriyi önce panelde
// düzenlenebilir tabloda gözden geçirip onaylamalı, ardından ayrı bir
// PUT /api/admin/tarife isteğiyle kaydetmelidir (kullanıcının istediği
// "AI çıkarsın, siz onaylayın" akışı).

const REFERENCE_KEYS = DEFAULT_TARIFF.birinciKisim.map((r) => `${r.key} = "${r.label}"`).join("\n");

const EXTRACT_PROMPT = `Sana Türkiye'de her yıl Resmî Gazete'de yayınlanan "Arabuluculuk Asgari Ücret Tarifesi" Tebliği'nin BİRİNCİ KISIM (saatlik, konusu para olmayan uyuşmazlıklar) ve İKİNCİ KISIM (kademeli/dilimli yüzde oranları, konusu para olan uyuşmazlıklar) tablolarını içeren bir belge/görsel veriliyor. Bu belgeden tarife verilerini çıkar ve SADECE geçerli bir JSON nesnesi döndür — başka hiçbir açıklama, markdown işareti (\`\`\`json gibi) veya ek metin EKLEME, sadece ham JSON:

{
  "yil": <belgedeki tarifenin yürürlük yılı, örn. 2026, bulamazsan null>,
  "genelAsgariUcret": <MADDE 7 civarında geçen, "anlaşma bedeline bakılmaksızın arabuluculuk ücreti ... TL'den az olamaz" şeklindeki GENEL taban tutarı, sayı olarak>,
  "ortakligininGiderilmesiTicariAsgari": <"ortaklığın giderilmesi" ve/veya "ticari uyuşmazlıklarda" için özel olarak belirtilen, genelde daha yüksek olan taban tutarı, sayı olarak>,
  "seriUyusmazlikTicari": <seri uyuşmazlıklarda TİCARİ uyuşmazlıklar için, uyuşmazlık başına belirtilen sabit ücret, sayı olarak>,
  "seriUyusmazlikDiger": <seri uyuşmazlıklarda DİĞER (ticari olmayan) uyuşmazlıklar için, uyuşmazlık başına belirtilen sabit ücret, sayı olarak>,
  "birinciKisim": [
    {
      "key": "<mümkünse aşağıdaki referans listesindeki key'lerden EN UYGUN olanı kullan; belgede bu referans listesine uymayan YENİ bir uyuşmazlık kategorisi varsa, kısa bir slug (küçük harf, alt çizgi) uydur>",
      "label": "<belgedeki tam kategori adı, örn. 'Aile Hukuku ile İlgili Uyuşmazlıklarda'>",
      "iki": <bu kategoride, TARAFLARDAN 2 kişi olması durumunda, TARAF BAŞINA belirtilen bir saatlik ücret, sayı olarak>,
      "uc5": <3-5 taraf, taraf sayısı gözetmeksizin TOPLAM bir saatlik ücret, sayı olarak>,
      "alti10": <6-10 taraf, taraf sayısı gözetmeksizin TOPLAM bir saatlik ücret, sayı olarak>,
      "onbirUstu": <11 ve üzeri taraf, taraf sayısı gözetmeksizin TOPLAM bir saatlik ücret, sayı olarak>
    }
  ],
  "ikinciKisim": [
    {
      "genislik": <bu dilimin TL cinsinden GENİŞLİĞİ (üst sınır DEĞİL — "sonra gelen X TL'si için" ifadesindeki X), sayı olarak; belgedeki EN SON (sınırsız, "X TL'den yukarısı için" şeklindeki) dilim için bu alanı JSON null yap>,
      "tekOran": <bu dilimde TEK arabulucu görev yaparsa uygulanan yüzde oranı, sayı olarak (örn. %6 için 6)>,
      "cokluOran": <bu dilimde BİRDEN FAZLA arabulucu görev yaparsa uygulanan yüzde oranı, sayı olarak (örn. %9 için 9)>
    }
  ]
}

REFERANS BİRİNCİ KISIM KATEGORİLERİ (mevcut sistemde kayıtlı, mümkünse bunların key'lerini kullan — sıralarını ve sayılarını KORUMANA gerek yok, belgede kaç kategori varsa o kadar nesne üret):
${REFERENCE_KEYS}

ÖNEMLİ KURALLAR:
- "ikinciKisim" dizisini belgedeki TABLO SIRASIYLA (ilk dilimden son dilime doğru) ver.
- Tüm parasal tutarları TL cinsinden, nokta/virgül ayraçları OLMADAN saf sayı olarak ver (örn. "9.000,00 TL" için 9000, "600.000,00 TL" için 600000).
- Emin olmadığın bir rakamı UYDURMA — belgede net okunamıyorsa o alanı null bırak, ama mümkün olduğunca tüm tabloyu eksiksiz okumaya çalış (görsel/taranmış sayfalarda tablo hücrelerini dikkatle oku).
- Belgede Birinci Kısım'da kaç kategori (satır grubu) varsa hepsini "birinciKisim" dizisine ekle, hiçbirini atlama.
- Belgede İkinci Kısım'da kaç dilim varsa hepsini "ikinciKisim" dizisine ekle, hiçbirini atlama.`;

function getExt(filename: string) {
  const m = filename.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : "";
}

async function fileToPart(file: File): Promise<any> {
  const ext = getExt(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  if (ext === "pdf" || ["jpg", "jpeg", "png", "webp"].includes(ext)) {
    const mimeType = ext === "pdf" ? "application/pdf" : `image/${ext === "jpg" ? "jpeg" : ext}`;
    return { inline_data: { mime_type: mimeType, data: buffer.toString("base64") } };
  }
  throw new Error(`Desteklenmeyen dosya formatı: ${file.name}. Lütfen PDF veya görsel (jpg/png/webp) yükleyin.`);
}

function stripJsonFence(text: string): string {
  return text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Yönetici henüz ücretsiz Gemini anahtarını sisteme eklemedi (GEMINI_API_KEY)." }, { status: 500 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Lütfen bir PDF veya görsel dosyası yükleyin." }, { status: 400 });
    }

    let part: any;
    try {
      part = await fileToPart(file);
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || "Dosya işlenemedi." }, { status: 400 });
    }

    const geminiResult = await callGemini({
      contents: [{ parts: [part, { text: EXTRACT_PROMPT }] }],
    });

    if (!geminiResult.ok) {
      return NextResponse.json({ error: geminiResult.friendlyError || "Gemini API hatası." }, { status: 502 });
    }

    const raw: string = geminiResult.data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";
    let parsed: any;
    try {
      parsed = JSON.parse(stripJsonFence(raw));
    } catch {
      return NextResponse.json({ error: "Yapay zeka tabloyu okuyamadı veya beklenmeyen bir biçimde döndürdü. Lütfen belgeyi/görseli kontrol edip tekrar deneyin ya da alanları elle girin." }, { status: 502 });
    }

    return NextResponse.json({ extracted: parsed });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "İşlenirken bir hata oluştu." }, { status: 500 });
  }
}
