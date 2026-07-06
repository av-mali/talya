import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Eklenti (avukat.uyap.gov.tr üzerinde çalışıyor) farklı bir siteden bu
// uç noktaya istek attığı için CORS izni gerekiyor.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Bu uç nokta OTURUM ÇEREZİYLE değil, Chrome eklentisinin gönderdiği
// "Bearer <syncToken>" başlığıyla doğrulanır — çünkü eklenti bir web
// tarayıcı oturumu değil, ayrı bir istemci.
async function requireUserByToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const user = await prisma.user.findUnique({ where: { syncToken: token } });
  return user;
}

const SYSTEM_PROMPT = `Sen bir veri ayrıştırma asistanısın. Sana UYAP Avukat Portalı'ndan
(bir web sayfasından) ham olarak kopyalanmış, düzensiz metin verilecek. Bu metnin
içinde dosya listeleri, duruşma tarihleri, taraf isimleri gibi bilgiler karışık
şekilde bulunur; menü/navigasyon gibi alakasız metinler de olabilir, onları yok say.

Görevin: bu metinden hukuki dosya/duruşma/tebligat kayıtlarını çıkarıp SADECE
aşağıdaki JSON formatında bir dizi döndürmek. Başka hiçbir açıklama, markdown
işareti veya metin ekleme — SADECE geçerli JSON döndür.

Format:
[
  {
    "clientName": "Taraf/müvekkil adı (bulabilirsen)",
    "caseTitle": "Dosya esas no veya dava türü (ör. '2024/123 E.' veya 'Boşanma Davası')",
    "type": "durusma" | "odeme" | "gorusme" | "tebligat" | "diger",
    "title": "Kısa açıklama (ör. 'Duruşma')",
    "dueDate": "YYYY-MM-DD" (bulamıyorsan null),
    "confidence": "high" | "low"
  }
]

Emin olamadığın veya eksik bilgi içeren satırları "confidence":"low" ile işaretle
ama yine de listeye ekle — kullanıcı zaten onay ekranında gözden geçirecek.
Hiçbir kayıt bulamazsan boş dizi [] döndür.`;

export async function POST(req: Request) {
  const user = await requireUserByToken(req);
  if (!user) {
    return NextResponse.json({ error: "Geçersiz veya eksik senkronizasyon anahtarı." }, { status: 401, headers: CORS_HEADERS });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json({ error: "Gönderilen metin çok kısa veya boş." }, { status: 400, headers: CORS_HEADERS });
  }

  // Çok uzun sayfalarda gereksiz maliyeti önlemek için makul bir üst sınır.
  const clipped = text.slice(0, 12000);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: clipped }],
      }),
    });

    const data = await res.json();
    const raw: string = data.content?.[0]?.text || "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    let items: any[] = [];
    try {
      items = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      items = [];
    }

    const batch = await prisma.importBatch.create({
      data: {
        source: "uyap-extension",
        rawText: clipped,
        items,
        userId: user.id,
      },
    });

    return NextResponse.json({ batchId: batch.id, itemCount: items.length }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ error: "Ayrıştırma sırasında hata oluştu." }, { status: 502, headers: CORS_HEADERS });
  }
}
