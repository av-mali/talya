import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Önümüzdeki 14 gün içindeki (ve geçmiş, henüz görülmemiş) duruşma/ödeme
// tarihlerini VE süresi yaklaşan görevleri bildirim olarak döndürür —
// üst menüdeki zil bu veriyi kullanır.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const now = new Date();
  const in14days = new Date(now.getTime() + 14 * 86400000);

  const [events, tasks, readRows] = await Promise.all([
    prisma.clientEvent.findMany({
      where: { case: { client: { userId } }, dueDate: { lte: in14days } },
      include: { case: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      where: { userId, done: false, dueDate: { not: null, lte: in14days } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.notificationRead.findMany({ where: { userId }, select: { notifId: true } }),
  ]);

  const readIds = new Set(readRows.map((r) => r.notifId));

  const TYPE_LABELS: Record<string, string> = {
    durusma: "Duruşma", odeme: "Ödeme", gorusme: "Görüşme",
    arabuluculuk: "Arabuluculuk", istinaf: "İstinaf", temyiz: "Temyiz",
  };

  const eventNotifs = events.map((e) => {
    const daysLeft = Math.ceil((e.dueDate.getTime() - now.getTime()) / 86400000);
    const overdue = daysLeft < 0;
    const label = TYPE_LABELS[e.type] || e.type;
    const id = "ev-" + e.id;
    return {
      id,
      type: e.type === "durusma" || e.type === "istinaf" || e.type === "temyiz" ? "sure" : "tebligat",
      ico: e.type === "odeme" ? "fa-turkish-lira-sign" : "fa-gavel",
      level: overdue ? "danger" : daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warn" : "info",
      label,
      text: `${e.case.client.name} (${e.case.title}) — ${e.title}`,
      time: overdue ? `${Math.abs(daysLeft)} gün geçti` : daysLeft === 0 ? "Bugün" : `${daysLeft} gün kaldı`,
      dueDate: e.dueDate,
      read: readIds.has(id),
    };
  });

  const taskNotifs = tasks.map((t) => {
    const daysLeft = Math.ceil((t.dueDate!.getTime() - now.getTime()) / 86400000);
    const overdue = daysLeft < 0;
    const id = "task-" + t.id;
    return {
      id,
      type: "sure",
      ico: "fa-list-check",
      level: overdue ? "danger" : daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warn" : "info",
      label: "Görev",
      text: t.title,
      time: overdue ? `${Math.abs(daysLeft)} gün geçti` : daysLeft === 0 ? "Bugün" : `${daysLeft} gün kaldı`,
      dueDate: t.dueDate!,
      read: readIds.has(id),
    };
  });

  const notifs = [...eventNotifs, ...taskNotifs].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return NextResponse.json({ notifications: notifs });
}
