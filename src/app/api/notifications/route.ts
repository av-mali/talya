import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Önümüzdeki 14 gün içindeki (ve geçmiş, henüz görülmemiş) duruşma/ödeme
// tarihlerini bildirim olarak döndürür — üst menüdeki zil bu veriyi kullanır.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const now = new Date();
  const in14days = new Date(now.getTime() + 14 * 86400000);

  const events = await prisma.clientEvent.findMany({
    where: {
      client: { userId },
      dueDate: { lte: in14days },
    },
    include: { client: true },
    orderBy: { dueDate: "asc" },
  });

  const TYPE_LABELS: Record<string, string> = {
    durusma: "Duruşma", odeme: "Ödeme", gorusme: "Görüşme",
    arabuluculuk: "Arabuluculuk", istinaf: "İstinaf", temyiz: "Temyiz",
  };

  const notifs = events.map((e) => {
    const daysLeft = Math.ceil((e.dueDate.getTime() - now.getTime()) / 86400000);
    const overdue = daysLeft < 0;
    const label = TYPE_LABELS[e.type] || e.type;
    return {
      id: e.id,
      type: e.type === "durusma" || e.type === "istinaf" || e.type === "temyiz" ? "sure" : "tebligat",
      ico: e.type === "odeme" ? "fa-turkish-lira-sign" : "fa-gavel",
      level: overdue ? "danger" : daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warn" : "info",
      label,
      text: `${e.client.name} — ${e.title}`,
      time: overdue
        ? `${Math.abs(daysLeft)} gün geçti`
        : daysLeft === 0
        ? "Bugün"
        : `${daysLeft} gün kaldı`,
      read: false,
    };
  });

  return NextResponse.json({ notifications: notifs });
}
