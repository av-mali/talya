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

// Vercel Cron bu adrese düzenli aralıklarla istek atar. NOT: Vercel'in
// ücretsiz (Hobby) planında zamanlanmış görevler günde SADECE 1 KEZ
// çalışabiliyor — bu yüzden şimdilik, saat seçmiş olan herkese günün bu
// tek çalışma anında gönderiyoruz (kişiye özel saat eşleşmesi, Pro plana
// geçilince tekrar aktif edilecek).
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // "2026-07-15"

  const candidates = await prisma.user.findMany({
    where: {
      telegramChatId: { not: null },
      telegramDailyTime: { not: null },
      NOT: { telegramLastSentDate: todayStr },
    },
    select: { id: true, telegramChatId: true },
  });

  let sentCount = 0;
  for (const u of candidates) {
    if (!u.telegramChatId) continue;

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
