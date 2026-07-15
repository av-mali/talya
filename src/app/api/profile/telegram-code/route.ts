import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { telegramChatId: true, telegramDailyTime: true } });
  return NextResponse.json({ connected: !!user?.telegramChatId, dailyTime: user?.telegramDailyTime || "" });
}

// Her gün otomatik gündem mesajının gönderileceği saati kaydeder (ör. "08:00").
// Boş göndermek, otomatik mesajı kapatır.
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { dailyTime } = await req.json();
  if (dailyTime && !/^\d{2}:\d{2}$/.test(dailyTime)) {
    return NextResponse.json({ error: "Geçersiz saat formatı." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { telegramDailyTime: dailyTime || null, telegramLastSentDate: null },
  });
  return NextResponse.json({ ok: true });
}

// Yeni bir 6 haneli bağlantı kodu üretir (10 dakika geçerli).
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { telegramLinkCode: code, telegramLinkCodeExpiry: expiry },
  });

  return NextResponse.json({ code, expiresInMinutes: 10 });
}

// Bağlantıyı kaldır (botu unut).
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  await prisma.user.update({ where: { id: userId }, data: { telegramChatId: null } });
  return NextResponse.json({ ok: true });
}
