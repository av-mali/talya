import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readUdfText, generateUdf } from "@/lib/udf";
import { generateDocx } from "@/lib/docExport";
import mammoth from "mammoth";

// Bu uç nokta Belge & Analiz modülündeki "Dosya Analizi", "Sözleşme
// İnceleme" ve "Dilekçe Sihirbazı" araçlarını besler. Google Gemini'nin
// ÜCRETSİZ katmanını kullanır (Claude değil) — kullanıcı kendi ücretsiz
// Gemini anahtarını Vercel'e girer.
//
// ÖNEMLİ: Yüklenen dosyalar HİÇBİR YERDE saklanmaz — anlık olarak
// işlenir, cevap üretilir üretilmez bellekten silinir.

const SYSTEM_HINTS: Record<string, string> = {
  dosya: "Sen Türk hukuku konusunda uzman bir asistansın. Sana verilen belgeyi dikkatle incele ve kullanıcının sorusunu, somut ve hukuki referanslarla (varsa ilgili kanun maddeleri) destekleyerek cevapla.",
  sozlesme: "Sen bir sözleşme inceleme uzmanısın. Sana verilen sözleşmeyi dikkatle incele; riskli/eksik/belirsiz maddeleri, tarafların lehine/aleyhine olan noktaları vurgula. Kullanıcının sorusuna bu çerçevede cevap ver.",
  dilekce: "Sen Türk hukuku konusunda uzman bir avukat asistanısın. Kullanıcının verdiği dava türü, olay örgüsü ve varsa özel taleplere göre, Hukuk Muhakemeleri Kanunu'na (HMK) uygun, resmi dilde, doğru başlıklandırılmış bir dilekçe taslağı yaz. Olay örgüsünde belirtilen somut detayları (isim, tarih, tutar, olay akışı ne varsa) MUTLAKA dilekçenin 'Açıklamalar' kısmına işle — genel/soyut bir metin yazma. Taslağı doğrudan dilekçe metni olarak ver, ekstra açıklama ekleme.",
};

function getExt(filename: string) {
  const m = filename.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : "";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Yönetici henüz ücretsiz Gemini anahtarını sisteme eklemedi (GEMINI_API_KEY)." },
      { status: 500 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const pastedText = (form.get("pastedText") as string) || "";
    const instruction = (form.get("instruction") as string) || "";
    const mode = (form.get("mode") as string) || "dosya";
    const wantUdf = form.get("wantUdf") === "1";

    if (!instruction.trim() && mode !== "dilekce") {
      return NextResponse.json({ error: "Lütfen bir soru/talimat girin." }, { status: 400 });
    }
    if (!file && !pastedText.trim() && mode !== "dilekce") {
      return NextResponse.json({ error: "Lütfen bir dosya yükleyin veya metin yapıştırın." }, { status: 400 });
    }

    const parts: any[] = [];
    const systemHint = SYSTEM_HINTS[mode] || SYSTEM_HINTS.dosya;

    if (file) {
      const ext = getExt(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());

      if (ext === "pdf" || ["jpg", "jpeg", "png", "webp"].includes(ext)) {
        // PDF ve görselleri Gemini doğrudan (multimodal) okuyabiliyor —
        // metne çevirmeye gerek yok, ham veriyi olduğu gibi gönderiyoruz.
        const mimeType = ext === "pdf" ? "application/pdf" : `image/${ext === "jpg" ? "jpeg" : ext}`;
        parts.push({ inline_data: { mime_type: mimeType, data: buffer.toString("base64") } });
      } else if (ext === "docx") {
        const result = await mammoth.extractRawText({ buffer });
        parts.push({ text: "BELGE İÇERİĞİ:\n" + result.value });
      } else if (ext === "udf") {
        const text = await readUdfText(buffer);
        parts.push({ text: "BELGE İÇERİĞİ (UYAP/UDF):\n" + text });
      } else {
        return NextResponse.json(
          { error: "Desteklenmeyen dosya formatı. PDF, JPG, PNG, DOCX veya UDF yükleyin." },
          { status: 400 }
        );
      }
    } else if (pastedText.trim()) {
      parts.push({ text: "BELGE İÇERİĞİ:\n" + pastedText.trim() });
    }

    const finalInstruction = mode === "dilekce" ? instruction : `KULLANICI SORUSU: ${instruction}`;
    parts.push({ text: systemHint + "\n\n" + finalInstruction });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts }] }),
      }
    );

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      const msg = geminiData?.error?.message || "Gemini API hatası.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const analysis: string =
      geminiData?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n") ||
      "Bir cevap üretilemedi.";

    let udfBase64: string | null = null;
    let docxBase64: string | null = null;
    if (wantUdf) {
      const udfBuffer = await generateUdf(analysis);
      udfBase64 = udfBuffer.toString("base64");
      const docxBuffer = await generateDocx(analysis);
      docxBase64 = docxBuffer.toString("base64");
    }

    return NextResponse.json({ analysis, udfBase64, docxBase64 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "İşlenirken bir hata oluştu." }, { status: 500 });
  }
}
