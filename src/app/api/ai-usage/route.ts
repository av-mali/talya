import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Ana sayfadaki "Bu Ay AI Kullanımı" kutusu için gerçek veri — sahte
// yüzdelerin yerini alıyor. Sadece kullanıcının kendi sorgu sayısını
// (her "user" mesajı = bir AI sorgusu) ve son 7 günün günlük dağılımını
// döndürür. Belge & Analiz'deki (Gemini tabanlı) anlık analizler hiçbir
// yerde saklanmadığı için bu sayıma dahil değildir — sadece Talya
// sohbetindeki (Claude) sorgular sayılır.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const messages = await prisma.message.findMany({
    where: { userId, role: "user", createdAt: { gte: monthStart } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const total = messages.length;

  // Son 7 günün günlük sayıları (basit bir trend çizgisi için).
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = messages.filter((m) => m.createdAt >= day && m.createdAt < nextDay).length;
    days.push({ label: day.toLocaleDateString("tr-TR", { weekday: "short" }), count });
  }

  return NextResponse.json({ total, days });
}
