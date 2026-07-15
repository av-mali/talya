import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateGundemReport, generateResmiGazeteOzeti } from "@/lib/gundemReport";

export const maxDuration = 60;

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: string, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

// Vercel Cron bu adrese düzenli aralıklarla (vercel.json'da tanımlı,
// her 15 dakikada bir) istek atar. Kullanıcının seçtiği saat, şu anki
// saate (15 dakikalık pencere içinde) denk geliyorsa ve bugün henüz
// gönderilmediyse otomatik gündem mesajı yollar.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayStr = now.toISOString().slice(0, 10); // "2026-07-15"

  const candidates = await prisma.user.findMany({
    where: {
      telegramChatId: { not: null },
      telegramDailyTime: { not: null },
      NOT: { telegramLastSentDate: todayStr },
    },
    select: { id: true, telegramChatId: true, telegramDailyTime: true },
  });

  let sentCount = 0;
  for (const u of candidates) {
    if (!u.telegramDailyTime || !u.telegramChatId) continue;
    const [h, m] = u.telegramDailyTime.split(":").map(Number);
    const targetMinutes = h * 60 + m;
    // 15 dakikalık pencere içinde mi? (cron her 15 dakikada bir çalışıyor)
    if (Math.abs(currentMinutes - targetMinutes) > 7) continue;

    try {
      const [report, gazeteOzeti] = await Promise.all([
        generateGundemReport(u.id),
        generateResmiGazeteOzeti(),
      ]);
      let fullReport = report;
      if (gazeteOzeti) {
        fullReport += `\n\n📰 *Resmi Gazete & Hukuk Gündemi*\n${gazeteOzeti}`;
      }
      fullReport += `\n\n⚠️ _Resmi Gazete/gündem özeti AI tarafından web'den derlenmiştir, garantili/eksiksiz bir tarama değildir._`;
      await sendMessage(u.telegramChatId, fullReport);
      await prisma.user.update({ where: { id: u.id }, data: { telegramLastSentDate: todayStr } });
      sentCount++;
    } catch (e) {
      // Bir kullanıcı için hata olursa diğerlerini etkilemesin, devam et.
    }
  }

  return NextResponse.json({ ok: true, checked: candidates.length, sent: sentCount });
}
