import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAiAccess } from "@/lib/workspace";
import { callGemini } from "@/lib/gemini";

// BU DOSYA SUNUCUDA ÇALIŞIR — tarayıcı buranın içeriğini asla göremez.
// Gemini API anahtarı burada, process.env üzerinden okunur; hiçbir zaman
// frontend koduna gömülmez, hiçbir zaman tarayıcıya gönderilmez.

const SYSTEM_PROMPT =
  "Sen Talya'sın — Türkiye'nin en gelişmiş hukuk yapay zekası. HMK, TBK, TCK, İş Kanunu, UYAP ve Yargıtay içtihatlarına hakimsin. Avukatlara Türkçe, net, aksiyona yönelik hukuki destek sağla. Önemli madde referanslarını belirt.";

export async function POST(req: Request) {
  // 1) Giriş yapmış mı kontrol et. Yapmamışsa istek reddedilir.
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  // Büro yöneticisi bu kullanıcı için AI'yı kapatmış olabilir.
  if (!(await hasAiAccess(userId))) {
    return NextResponse.json({ error: "AI kullanım yetkiniz bulunmuyor. Büro yöneticinizle iletişime geçin." }, { status: 403 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
  }

  // 2) Kullanıcının bu mesajını veritabanına kaydet.
  await prisma.message.create({
    data: { role: "user", content: message, userId },
  });

  // 3) Son 20 mesajı veritabanından çekip Gemini'ye "hafıza" olarak gönder.
  const history = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  const recent = history.slice(-20);

  try {
    const result = await callGemini({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: recent.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    if (!result.ok) {
      // Gemini API bir hata döndürdü (geçersiz anahtar, kota, vb.) —
      // bunu SESSİZCE "reply" olarak göstermek yerine gerçek hata olarak
      // döndürüyoruz ki ileride fark edilebilsin.
      console.error("Gemini API hatası:", result.data);
      return NextResponse.json(
        { error: result.friendlyError || "Yapay zeka şu anda yanıt veremiyor." },
        { status: 502 }
      );
    }

    const data = result.data;
    const reply: string =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n") ||
      "Bir cevap üretilemedi, lütfen tekrar deneyin.";

    // 4) AI'nın cevabını da veritabanına kaydet.
    await prisma.message.create({
      data: { role: "assistant", content: reply, userId },
    });

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: "Gemini API bağlantı hatası." },
      { status: 502 }
    );
  }
}

// Geçmiş sohbeti sayfa yüklendiğinde göstermek için.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}
