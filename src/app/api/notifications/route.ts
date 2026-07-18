import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupEventsByCaseAndDate } from "@/lib/groupEvents";
import { requireWorkspace, shouldRestrictToOwnItems } from "@/lib/workspace";

// Önümüzdeki 14 gün içindeki (ve geçmiş, henüz görülmemiş) duruşma/ödeme
// tarihlerini VE süresi yaklaşan görevleri bildirim olarak döndürür —
// üst menüdeki zil bu veriyi kullanır.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;
  const ws = await requireWorkspace();
  const restricted = ws ? await shouldRestrictToOwnItems(ws.userId) : false;

  const now = new Date();
  // Bildirim zili artık sadece ACİL (2 gün ve altı) kayıtları gösterir —
  // ana sayfadaki "Yaklaşan Süreler" (daha geniş pencere, 3 satır) ile
  // karışmasın diye ayrı bir amaç üstleniyor.
  const in2days = new Date(now.getTime() + 2 * 86400000);

  // ÖNEMLİ: Saat farkından değil, TAKVİM GÜNÜ farkından hesapla — yoksa
  // "bugün saat 14:00'te duruşma" sabah kontrol edilince yanlışlıkla
  // "1 gün kaldı" görünüyordu.
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  function daysUntil(date: Date): number {
    const dueMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.round((dueMidnight.getTime() - nowMidnight.getTime()) / 86400000);
  }

  // "3 gün kaldı" gibi etikete, anlamlı bir saat varsa (tam gece yarısı
  // değilse) saati de ekler — ör. arabuluculuk toplantı saatleri.
  function timeLabel(date: Date, daysLeft: number, overdue: boolean): string {
    const base = overdue ? `${Math.abs(daysLeft)} gün geçti` : daysLeft === 0 ? "Bugün" : `${daysLeft} gün kaldı`;
    const hasTime = !(date.getHours() === 0 && date.getMinutes() === 0);
    if (!hasTime) return base;
    const clock = date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    return `${base} · ${clock}`;
  }

  const [events, tasks, readRows, clientMessages, mediationCases] = await Promise.all([
    ws ? prisma.clientEvent.findMany({
      where: {
        case: {
          client: { workspaceId: ws.workspaceId },
          ...(restricted ? { assignedToId: ws.userId } : {}),
        },
        dueDate: { lte: in2days, gte: nowMidnight }, // tarihi tamamen geçmiş olanlar zilde artık gösterilmez
      },
      include: { case: { include: { client: true, assignedTo: { select: { name: true, email: true } } } } },
      orderBy: { dueDate: "asc" },
    }) : Promise.resolve([]),
    ws ? prisma.task.findMany({
      where: {
        workspaceId: ws.workspaceId,
        done: false,
        dueDate: { not: null, lte: in2days, gte: nowMidnight },
        ...(restricted ? { assignedToId: ws.userId } : {}),
      },
      include: { assignedTo: { select: { name: true, email: true } } },
      orderBy: { dueDate: "asc" },
    }) : Promise.resolve([]),
    prisma.notificationRead.findMany({ where: { userId }, select: { notifId: true } }),
    ws ? prisma.clientPortalMessage.findMany({
      where: { isFromClient: true, isRead: false, client: { workspaceId: ws.workspaceId } },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }) : Promise.resolve([]),
    prisma.mediationCase.findMany({
      where: {
        userId,
        OR: [
          { ilkOturumTarihi: { lte: in2days, gte: nowMidnight } },
          { sonTutanakTarihi: { lte: in2days, gte: nowMidnight } },
        ],
      },
    }),
  ]);

  const readIds = new Set(readRows.map((r) => r.notifId));

  const TYPE_LABELS: Record<string, string> = {
    durusma: "Duruşma", odeme: "Ödeme", gorusme: "Görüşme",
    arabuluculuk: "Arabuluculuk", istinaf: "İstinaf", temyiz: "Temyiz",
  };

  // Aynı dosya + aynı tarihte birden fazla müvekkil varsa tek bildirimde birleştir.
  const grouped = groupEventsByCaseAndDate(events);

  const eventNotifs = grouped.map((g) => {
    const daysLeft = daysUntil(g.dueDate);
    const overdue = daysLeft < 0;
    const label = TYPE_LABELS[g.type] || g.type;
    const id = "ev-" + g.combinedId;
    return {
      id,
      type: g.type === "durusma" || g.type === "istinaf" || g.type === "temyiz" ? "sure" : "tebligat",
      ico: g.type === "odeme" ? "fa-turkish-lira-sign" : "fa-gavel",
      level: overdue ? "danger" : daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warn" : "info",
      label,
      text: `${g.caseTitle} — ${g.clientNamesDisplay} — ${g.title}${g.assigneeName ? ` — (${g.assigneeName})` : ''}`,
      time: timeLabel(g.dueDate, daysLeft, overdue),
      dueDate: g.dueDate,
      read: readIds.has(id),
    };
  });

  const taskNotifs = tasks.map((t) => {
    const daysLeft = daysUntil(t.dueDate!);
    const overdue = daysLeft < 0;
    const id = "task-" + t.id;
    return {
      id,
      type: "sure",
      ico: "fa-list-check",
      level: overdue ? "danger" : daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warn" : "info",
      label: "Görev",
      text: `${t.title}${t.assignedTo ? ` — (${t.assignedTo.name || t.assignedTo.email})` : ''}`,
      time: timeLabel(t.dueDate!, daysLeft, overdue),
      dueDate: t.dueDate!,
      read: readIds.has(id),
    };
  });

  const messageNotifs = clientMessages.map((m) => ({
    id: "msg-" + m.id,
    type: "musteri_mesaj",
    ico: "fa-comment-dots",
    level: "info",
    label: "Müvekkil Mesajı",
    text: `${m.client.name}: ${m.content.slice(0, 60)}${m.content.length > 60 ? "…" : ""}`,
    time: new Date(m.createdAt).toLocaleDateString("tr-TR"),
    dueDate: m.createdAt,
    clientId: m.clientId,
    read: false,
  }));

  const mediationNotifs: any[] = [];
  mediationCases.forEach((m) => {
    const pushNotif = (dueDate: Date | null, title: string, idSuffix: string) => {
      if (!dueDate) return;
      const daysLeft = daysUntil(dueDate);
      const overdue = daysLeft < 0;
      const id = "med-" + idSuffix + "-" + m.id;
      mediationNotifs.push({
        id,
        type: "sure",
        ico: "fa-handshake",
        level: overdue ? "danger" : daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warn" : "info",
        label: "Arabuluculuk",
        text: `${title} — ${m.basvurucuAd || "?"}`,
        time: timeLabel(dueDate, daysLeft, overdue),
        dueDate,
        read: readIds.has(id),
      });
    };
    pushNotif(m.ilkOturumTarihi, "Bilgilendirme ve İlk Oturum", "ilk");
    pushNotif(m.sonTutanakTarihi, `Son Oturum (${m.sonTutanakSonucu === "anlasma" ? "Anlaşma" : "Anlaşamama"})`, "son");
  });

  const notifs = [...eventNotifs, ...taskNotifs, ...messageNotifs, ...mediationNotifs].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return NextResponse.json({ notifications: notifs });
}
