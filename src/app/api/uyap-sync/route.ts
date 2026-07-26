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

// ═══════════════════════════════════════════════════════════
// .ICS (UYAP "Toplu Takvime Ekle") AYRIŞTIRICISI
// AI'a gerek yok — bu format düzenli ve standart, kesin kurallarla
// okunabiliyor. Daha hızlı, daha güvenilir, daha ucuz (AI çağrısı yok).
// ═══════════════════════════════════════════════════════════

// ICS satır katlamasını (RFC5545 "folding") düzeltir: bir sonraki satır
// boşlukla başlıyorsa, önceki satırın devamıdır.
function unfoldIcs(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

// ICS metin kaçışlarını (\n, \,, \;, \\) gerçek karakterlere çevirir.
function unescapeIcsValue(v: string): string {
  return v
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function getProp(block: string, name: string): string | null {
  // "DTSTART;TZID=...:20260707T094500" gibi parametreli satırları da yakalar.
  const re = new RegExp("^" + name + "(;[^:\\n]*)?:(.*)$", "m");
  const m = block.match(re);
  return m ? m[2].trim() : null;
}

function parseIcsDate(v: string): Date | null {
  // Format: 20260707T094500 (yerel saat) ya da 20260707T094500Z (UTC)
  const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`);
}

const ISLEM_TYPE_MAP: Record<string, string> = {
  "duruşma": "durusma",
  "duruşma tarihi": "durusma",
  "tebligat": "gorusme",
  "arabuluculuk": "arabuluculuk",
  "istinaf": "istinaf",
  "temyiz": "temyiz",
  "ödeme": "odeme",
};

function parseIcsCalendar(raw: string) {
  const text = unfoldIcs(raw);
  const items: any[] = [];
  const blocks = text.split("BEGIN:VEVENT").slice(1);

  for (const rawBlock of blocks) {
    const block = rawBlock.split("END:VEVENT")[0];

    const dtstartRaw = getProp(block, "DTSTART");
    const dueDate = dtstartRaw ? parseIcsDate(dtstartRaw) : null;
    const location = getProp(block, "LOCATION");
    const descriptionRaw = getProp(block, "DESCRIPTION");
    const description = descriptionRaw ? unescapeIcsValue(descriptionRaw) : "";

    // DESCRIPTION içinden alanları çıkar: "Dosya No:", "Dosya Türü:",
    // "İşlem:", ve "Vekili Olunan Taraflar:" listesi.
    const dosyaNoMatch = description.match(/Dosya No:\s*(.+)/);
    const dosyaTuruMatch = description.match(/Dosya Türü:\s*(.+)/);
    const islemMatch = description.match(/İşlem:\s*(.+)/);

    const dosyaNo = dosyaNoMatch ? dosyaNoMatch[1].trim() : "";
    const dosyaTuru = dosyaTuruMatch ? dosyaTuruMatch[1].trim() : "";
    const islem = islemMatch ? islemMatch[1].trim() : "Duruşma";
    const caseTitle = [dosyaNo, dosyaTuru].filter(Boolean).join(" - ") || (location || "Dosya");
    const type = ISLEM_TYPE_MAP[islem.toLowerCase()] || "durusma";

    // "Vekili Olunan Taraflar:" başlığından sonraki "- İsim - ROL" satırları,
    // bir sonraki "Diğer Taraflar:" (ya da metin sonu) başlığına kadar.
    const vekiliSection = description.match(/Vekili Olunan Taraflar:\n([\s\S]*?)(?:\nDiğer Taraflar:|$)/);
    const clientNames: string[] = [];
    if (vekiliSection) {
      const lines = vekiliSection[1].split("\n");
      for (const line of lines) {
        const lm = line.match(/^-\s*(.+?)\s*-\s*[A-ZÇĞİÖŞÜ]+$/);
        if (lm) clientNames.push(lm[1].trim());
        else if (line.trim().startsWith("-")) clientNames.push(line.replace(/^-\s*/, "").trim());
      }
    }

    if (!dueDate) continue; // tarihsiz kayıt işe yaramaz, atla

    if (clientNames.length === 0) {
      // Temsil edilen taraf bulunamadıysa yine de kaydı ekle, kullanıcı
      // onay ekranında müvekkili elle seçsin.
      items.push({
        clientName: "",
        caseTitle,
        caseNumber: dosyaNo,
        type,
        title: islem,
        dueDate: dueDate.toISOString(),
        confidence: "low",
      });
    } else {
      for (const name of clientNames) {
        items.push({
          clientName: name,
          caseTitle,
          caseNumber: dosyaNo,
          type,
          title: islem,
          dueDate: dueDate.toISOString(),
          confidence: "high",
        });
      }
    }
  }

  return items;
}

export async function POST(req: Request) {
  const user = await requireUserByToken(req);
  if (!user) {
    return NextResponse.json({ error: "Geçersiz veya eksik senkronizasyon anahtarı." }, { status: 401, headers: CORS_HEADERS });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json({ error: "Gönderilen metin çok kısa veya boş." }, { status: 400, headers: CORS_HEADERS });
  }

  const trimmed = text.trim();

  // ── Yol 1: .ics takvim dosyası (UYAP "Toplu Takvime Ekle") ──
  // Kesin kurallarla okunur, AI'a hiç gerek yok — daha hızlı, daha güvenilir.
  if (trimmed.startsWith("BEGIN:VCALENDAR")) {
    try {
      const items = parseIcsCalendar(trimmed);
      if (!items.length) {
        return NextResponse.json({ batchId: null, itemCount: 0 }, { headers: CORS_HEADERS });
      }
      const batch = await prisma.importBatch.create({
        data: {
          source: "uyap-extension-ics",
          rawText: trimmed.slice(0, 8000),
          items,
          userId: user.id,
        },
      });
      return NextResponse.json({ batchId: batch.id, itemCount: items.length }, { headers: CORS_HEADERS });
    } catch (err) {
      return NextResponse.json({ error: "Takvim dosyası okunamadı." }, { status: 502, headers: CORS_HEADERS });
    }
  }

  // ── Yol 2: Dağınık sayfa metni — Gemini ile ayrıştır ──
  // Çok uzun sayfalarda gereksiz maliyeti önlemek için makul bir üst sınır.
  const clipped = trimmed.slice(0, 12000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: clipped }] }],
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("Gemini API hatası (uyap-sync):", data);
      return NextResponse.json({ error: data?.error?.message || "Yapay zeka şu anda yanıt veremiyor." }, { status: 502, headers: CORS_HEADERS });
    }
    const raw: string = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n") || "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    let items: any[] = [];
    try {
      items = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      items = [];
    }

    if (!items.length) {
      return NextResponse.json({ batchId: null, itemCount: 0 }, { headers: CORS_HEADERS });
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
