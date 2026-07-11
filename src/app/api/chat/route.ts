import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAiAccess } from "@/lib/workspace";

// BU DOSYA SUNUCUDA ÇALIŞIR — tarayıcı buranın içeriğini asla göremez.
// Anthropic API anahtarı burada, process.env üzerinden okunur; hiçbir zaman
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

  // 3) Son 20 mesajı veritabanından çekip Claude'a "hafıza" olarak gönder.
  const history = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  const recent = history.slice(-20);

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
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: recent.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });

    const data = await res.json();
    const reply: string =
      data.content?.[0]?.text || "Bir hata oluştu, tekrar deneyin.";

    // 4) Claude'un cevabını da veritabanına kaydet.
    await prisma.message.create({
      data: { role: "assistant", content: reply, userId },
    });

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: "Claude API bağlantı hatası." },
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
