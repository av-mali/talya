import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateGundemReport, generateResmiGazeteOzeti } from "@/lib/gundemReport";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: string, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

// Telegram, güncellemeleri (mesajları) bu adrese POST eder. Sahte
// isteklere karşı, webhook kurulurken belirlediğimiz gizli anahtarı
// (X-Telegram-Bot-Api-Secret-Token) doğruluyoruz.
export async function POST(req: Request) {
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const update = await req.json();
  const message = update?.message;
  if (!message?.chat?.id || typeof message?.text !== "string") {
    return NextResponse.json({ ok: true }); // ilgilenmediğimiz güncelleme türü
  }

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  // ── Hesap bağlama: /baglan 123456 ──
  const linkMatch = text.match(/^\/(baglan|start)\s+(\d{6})$/i);
  if (linkMatch) {
    const code = linkMatch[2];
    const user = await prisma.user.findFirst({
      where: { telegramLinkCode: code, telegramLinkCodeExpiry: { gte: new Date() } },
    });
    if (!user) {
      await sendMessage(chatId, "❌ Kod geçersiz veya süresi dolmuş. Talya'da Üyelik & Hesap → Telegram Bağlantısı'ndan yeni bir kod alın.");
      return NextResponse.json({ ok: true });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: chatId, telegramLinkCode: null, telegramLinkCodeExpiry: null },
    });
    await sendMessage(chatId, `✅ Bağlantı başarılı! Artık bana "gündem" yazarak günlük özetinizi alabilirsiniz.`);
    return NextResponse.json({ ok: true });
  }

  // ── Bağlı hesabı bul ──
  const user = await prisma.user.findUnique({ where: { telegramChatId: chatId } });
  if (!user) {
    await sendMessage(chatId, "Merhaba! Ben Talya Asistan 👋\n\nHesabınızı bağlamak için Talya'da Üyelik & Hesap → Telegram Bağlantısı'na gidip oradaki kodu bana `/baglan KOD` şeklinde gönderin.");
    return NextResponse.json({ ok: true });
  }

  // ── Gündem isteği ──
  const lower = text.toLowerCase();
  if (lower.includes("gündem") || lower.includes("gundem") || lower.includes("bugün") || lower === "/gundem") {
    await sendMessage(chatId, "⏳ Gündeminiz hazırlanıyor, birkaç saniye…");
    const [report, gazeteOzeti] = await Promise.all([
      generateGundemReport(user.id),
      generateResmiGazeteOzeti(),
    ]);
    let fullReport = report;
    if (gazeteOzeti) {
      fullReport += `\n\n📰 *Resmi Gazete & Hukuk Gündemi*\n${gazeteOzeti}`;
    }
    fullReport += `\n\n⚠️ _Resmi Gazete/gündem özeti AI tarafından web'den derlenmiştir, garantili/eksiksiz bir tarama değildir._`;
    await sendMessage(chatId, fullReport);
    return NextResponse.json({ ok: true });
  }

  await sendMessage(chatId, `Anlayamadım 🤔\n\nGünlük özetinizi almak için bana "gündem" yazabilirsiniz.`);
  return NextResponse.json({ ok: true });
}
