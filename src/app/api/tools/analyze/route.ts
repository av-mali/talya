import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readUdfText, generateUdf } from "@/lib/udf";
import { generateDocx, generatePdf } from "@/lib/docExport";
import mammoth from "mammoth";
import sharp from "sharp";
import { hasAiAccess, hasToolAccess } from "@/lib/workspace";

// Bu uç nokta Belge & Analiz modülündeki "Dosya Analizi", "Sözleşme
// İnceleme" ve "Dilekçe Sihirbazı" araçlarını besler. Google Gemini'nin
// ÜCRETSİZ katmanını kullanır (Claude değil) — kullanıcı kendi ücretsiz
// Gemini anahtarını Vercel'e girer.
//
// ÖNEMLİ: Yüklenen dosyalar HİÇBİR YERDE saklanmaz — anlık olarak
// işlenir, cevap üretilir üretilmez bellekten silinir.

// HALÜSİNASYON ÖNLEMİ: Her talimatın sonuna eklenen ortak güvenlik kuralı.
// Web araması (grounding) açık, ama AI'ın hangi kaynaklara güvenmesi
// gerektiğini ve emin olmadığında ne yapması gerektiğini net olarak
// belirtiyoruz — bu, riski azaltır ama SIFIRLAMAZ, kullanıcı her zaman
// kendi gözüyle doğrulamalı.
const HALLUCINATION_GUARD = `

ÖNEMLİ KURALLAR (İçtihat/Mevzuat Atıfları İçin):
- İçtihat (Yargıtay/Danıştay kararı) veya kanun maddesi atfı yapacaksan, ÖNCE web'de ara ve SADECE resmi kaynaklardan (yargitay.gov.tr, karararama.yargitay.gov.tr, danistay.gov.tr, karararama.danistay.gov.tr, mevzuat.gov.tr, resmigazete.gov.tr, anayasa.gov.tr) doğrula.
- Belirli bir kararın esas/karar numarasından (ör. "2021/1234 E., 2022/5678 K.") EMİN DEĞİLSEN, o numarayı ASLA UYDURMA. Bunun yerine ilgili hukuki ilkeden genel olarak bahset, spesifik ve sahte bir numara verme.
- Gerçek bir kaynakta bulamadığın bir kararı/maddeyi varmış gibi gösterme.`;

const SYSTEM_HINTS: Record<string, string> = {
  dosya: "Sen Türk hukuku konusunda uzman bir asistansın. Sana verilen belgeyi dikkatle incele ve kullanıcının sorusunu, somut ve hukuki referanslarla (varsa ilgili kanun maddeleri) destekleyerek cevapla." + HALLUCINATION_GUARD,
  sozlesme: "Sen bir sözleşme inceleme uzmanısın. Sana verilen sözleşmeyi dikkatle incele; riskli/eksik/belirsiz maddeleri, tarafların lehine/aleyhine olan noktaları vurgula. Kullanıcının sorusuna bu çerçevede cevap ver." + HALLUCINATION_GUARD,
  dilekce: "Sen Türk hukuku konusunda uzman bir avukat asistanısın. Kullanıcının verdiği dava türü, olay örgüsü ve varsa özel taleplere göre, Hukuk Muhakemeleri Kanunu'na (HMK) uygun, resmi dilde, doğru başlıklandırılmış bir dilekçe taslağı yaz. Olay örgüsünde belirtilen somut detayları (isim, tarih, tutar, olay akışı ne varsa) MUTLAKA dilekçenin 'Açıklamalar' kısmına işle — genel/soyut bir metin yazma. Taslağı doğrudan dilekçe metni olarak ver, ekstra açıklama ekleme." + HALLUCINATION_GUARD,
  durusma: "Sen Türk hukuku konusunda uzman, duruşma hazırlığı yapan bir avukat asistanısın. Sana verilen belgeleri (iddianame, celse tutanakları, dilekçeler vb.) BİRLİKTE, bütünsel olarak değerlendir. Şu başlıklar altında bir duruşma stratejisi çıkar: (1) Dosyanın Kronolojik Özeti, (2) Güçlü Yönler, (3) Zayıf Yönler / Karşı Tarafın Muhtemel İddiaları, (4) Hakimin Sorabileceği Olası Sorular ve Önerilen Cevaplar, (5) Duruşmada Vurgulanması Gereken Kilit Noktalar, (6) Önerilen Strateji. Belgeler arasında çelişki/tutarsızlık varsa mutlaka belirt." + HALLUCINATION_GUARD,
  "crm-extract": `Sana bir hukuki belge (dava dilekçesi, tebligat, ihtarname vb.) veriliyor. Bu belgeden aşağıdaki bilgileri çıkar ve SADECE geçerli bir JSON nesnesi olarak döndür — başka hiçbir açıklama, markdown işareti (\`\`\`json gibi) veya ek metin EKLEME, sadece ham JSON:
{
  "muvekkilAdi": "belgedeki müvekkil/vekil edilen tarafın adı (bulamazsan null)",
  "telefon": "varsa telefon numarası (yoksa null)",
  "email": "varsa e-posta (yoksa null)",
  "davaKonusu": "kısa bir dava konusu özeti, en fazla 1 cümle (yoksa null)",
  "esasNo": "esas/dosya numarası varsa (yoksa null)",
  "karsiTaraf": "karşı taraf adı varsa (yoksa null)",
  "mahkeme": "mahkeme/kurum adı varsa (yoksa null)"
}
Emin olmadığın alanları uydurma — null bırak. Belgede müvekkil kimin tarafı olduğu net değilse, dilekçeyi/belgeyi hazırlayan tarafı müvekkil olarak varsay.`,
  "mediation-extract": `Sana bir arabuluculuk başvuru evrakı veriliyor. Bu belgeden aşağıdaki bilgileri çıkar ve SADECE geçerli bir JSON nesnesi olarak döndür — başka hiçbir açıklama, markdown işareti eklemeden, sadece ham JSON:
{
  "dosyaNo": "varsa dosya/başvuru numarası (yoksa null)",
  "basvurucuAd": "başvurucunun adı soyadı (varsa TC no ile birlikte, yoksa null)",
  "basvurucuAdres": "başvurucunun adresi (yoksa null)",
  "basvurucuVekilAd": "başvurucu vekili varsa adı (yoksa null)",
  "basvurucuBaroSicil": "başvurucu vekilinin baro/sicil no varsa (yoksa null)",
  "basvurucuTelefon": "başvurucunun telefonu (yoksa null)",
  "karsiTarafAd": "karşı tarafın adı/unvanı (yoksa null)",
  "karsiTarafAdres": "karşı tarafın adresi (yoksa null)",
  "karsiTarafVergiMersis": "karşı taraf tüzel kişiyse vergi/mersis no (yoksa null)",
  "karsiTarafYetkiliAd": "karşı taraf tüzel kişiyse şirket yetkilisinin adı (yoksa null)",
  "karsiTarafVekilAd": "karşı taraf vekili varsa adı (yoksa null)",
  "karsiTarafTelefon": "karşı tarafın telefonu (yoksa null)",
  "uyusmazlikKonusu": "uyuşmazlık konusunun kısa özeti, maddeler halinde olabilir (yoksa null)",
  "basvuruTarihi": "başvuru tarihi varsa GG.AA.YYYY formatında (yoksa null)"
}
Emin olmadığın alanları uydurma — null bırak.`,
};

function getExt(filename: string) {
  const m = filename.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : "";
}

// Tek bir dosyayı Gemini'ye gönderilecek "part" haline çevirir. Hata
// olursa bir Error fırlatır (üst katman kullanıcıya net mesaj gösterir).
async function fileToPart(file: File): Promise<any> {
  const ext = getExt(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === "pdf" || ["jpg", "jpeg", "png", "webp"].includes(ext)) {
    const mimeType = ext === "pdf" ? "application/pdf" : `image/${ext === "jpg" ? "jpeg" : ext}`;
    return { inline_data: { mime_type: mimeType, data: buffer.toString("base64") } };
  }
  if (["bmp", "tiff", "tif"].includes(ext)) {
    try {
      const pngBuffer = await sharp(buffer).png().toBuffer();
      return { inline_data: { mime_type: "image/png", data: pngBuffer.toString("base64") } };
    } catch (e) {
      throw new Error(`${ext.toUpperCase()} dosyası (${file.name}) okunamadı/dönüştürülemedi.`);
    }
  }
  if (["txt", "html", "htm", "xml", "csv"].includes(ext)) {
    return { text: `BELGE (${file.name}):\n` + buffer.toString("utf-8") };
  }
  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return { text: `BELGE (${file.name}):\n` + result.value };
  }
  if (ext === "udf") {
    const text = await readUdfText(buffer);
    return { text: `BELGE (${file.name}, UYAP/UDF):\n` + text };
  }
  throw new Error(`Desteklenmeyen dosya formatı: ${file.name}`);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  // Büro yöneticisi bu kullanıcı için AI'yı tamamen kapatmış olabilir.
  if (!(await hasAiAccess(userId))) {
    return NextResponse.json({ error: "AI kullanım yetkiniz bulunmuyor. Büro yöneticinizle iletişime geçin." }, { status: 403 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Yönetici henüz ücretsiz Gemini anahtarını sisteme eklemedi (GEMINI_API_KEY)." },
      { status: 500 }
    );
  }

  try {
    const form = await req.formData();
    const multiFiles = form.getAll("files") as File[]; // yeni: çoklu dosya (Duruşma Hazırlık)
    const singleFile = form.get("file") as File | null; // eski: tekli dosya (geri uyum)
    const files = multiFiles.length ? multiFiles : (singleFile ? [singleFile] : []);
    const pastedText = (form.get("pastedText") as string) || "";
    const instruction = (form.get("instruction") as string) || "";
    const mode = (form.get("mode") as string) || "dosya";
    const wantUdf = form.get("wantUdf") === "1";

    // Bu spesifik aracı (mode) kullanma yetkisi de ayrıca kapatılmış olabilir.
    // "crm-extract" ve "mediation-extract" ayrı görünür araçlar değil,
    // ilgili ana aracın bir parçası — yetki kontrolünü ona göre yapıyoruz.
    const toolKeyForAccess =
      mode === "crm-extract" ? "muvekkilekle" : mode === "mediation-extract" ? "arabuluculuk" : mode;
    if (!(await hasToolAccess(userId, toolKeyForAccess))) {
      return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
    }

    if (!instruction.trim() && mode !== "dilekce") {
      return NextResponse.json({ error: "Lütfen bir soru/talimat girin." }, { status: 400 });
    }
    if (!files.length && !pastedText.trim() && mode !== "dilekce") {
      return NextResponse.json({ error: "Lütfen bir dosya yükleyin veya metin yapıştırın." }, { status: 400 });
    }

    const parts: any[] = [];
    const systemHint = SYSTEM_HINTS[mode] || SYSTEM_HINTS.dosya;

    for (const file of files) {
      try {
        parts.push(await fileToPart(file));
      } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Dosya işlenemedi." }, { status: 400 });
      }
    }
    if (!files.length && pastedText.trim()) {
      parts.push({ text: "BELGE İÇERİĞİ:\n" + pastedText.trim() });
    }

    const finalInstruction = mode === "dilekce" ? instruction : `KULLANICI SORUSU: ${instruction}`;
    parts.push({ text: systemHint + "\n\n" + finalInstruction });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          // Halüsinasyonu azaltmak için: AI, atıf yapmadan önce gerçekten
          // web'de arayabilsin diye Google Arama aracını açıyoruz.
          tools: [{ google_search: {} }],
        }),
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
    let pdfBase64: string | null = null;
    if (wantUdf) {
      const udfBuffer = await generateUdf(analysis);
      udfBase64 = udfBuffer.toString("base64");
      const docxBuffer = await generateDocx(analysis);
      docxBase64 = docxBuffer.toString("base64");
      const pdfBuffer = await generatePdf(analysis);
      pdfBase64 = pdfBuffer.toString("base64");
    }

    // Uyarı etiketi sadece EKRANDA gösterilen cevaba eklenir — UDF/Word/PDF
    // çıktısı (yukarıda zaten üretildi) temiz kalır, resmi belgeye karışmaz.
    // "crm-extract" modu ham JSON döndürür — uyarı metni eklenirse JSON bozulur.
    const displayAnalysis =
      mode === "crm-extract" || mode === "mediation-extract"
        ? analysis
        : analysis +
          "\n\n---\n⚠️ Bu metindeki içtihat/mevzuat atıfları yapay zeka tarafından oluşturulmuştur. Kullanmadan önce mutlaka resmi kaynaktan doğrulayın.";

    return NextResponse.json({ analysis: displayAnalysis, udfBase64, docxBase64, pdfBase64 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "İşlenirken bir hata oluştu." }, { status: 500 });
  }
}
