import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groupEventsByCaseAndDate } from "@/lib/groupEvents";
import { requireWorkspace, shouldRestrictToOwnItems } from "@/lib/workspace";

// Takvim VE ana sayfadaki "Yaklaşan Süreler" için: büronun tüm
// müvekkillerindeki duruşma/ödeme tarihleri + büronun tarihi olan görevleri.
export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const restricted = await shouldRestrictToOwnItems(ws.userId);

  const [events, tasks, mediationCases] = await Promise.all([
    prisma.clientEvent.findMany({
      where: {
        case: {
          client: { workspaceId: ws.workspaceId },
          ...(restricted ? { assignedToId: ws.userId } : {}),
        },
      },
      include: { case: { include: { client: true, assignedTo: { select: { name: true, email: true } } } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      where: {
        workspaceId: ws.workspaceId,
        done: false,
        dueDate: { not: null },
        ...(restricted ? { assignedToId: ws.userId } : {}),
      },
      include: { assignedTo: { select: { name: true, email: true } } },
      orderBy: { dueDate: "asc" },
    }),
    // Arabuluculuk dosyaları kişiseldir (büro geneli değil) — sadece
    // kendi tarihlerini görür.
    prisma.mediationCase.findMany({
      where: {
        userId: ws.userId,
        OR: [{ ilkOturumTarihi: { not: null } }, { sonTutanakTarihi: { not: null } }],
      },
    }),
  ]);

  // Aynı dosya + aynı tarihte birden fazla müvekkil varsa tek satırda birleştir.
  const grouped = groupEventsByCaseAndDate(events);

  const eventItems = grouped.map((g) => ({
    id: g.combinedId,
    type: g.type,
    title: g.title,
    dueDate: g.dueDate,
    clientId: null,
    clientName: `${g.clientNamesDisplay} — ${g.caseTitle}${g.assigneeName ? ` — (${g.assigneeName})` : ''}`,
  }));

  const taskItems = tasks.map((t) => ({
    id: t.id,
    type: "gorev",
    title: t.title,
    dueDate: t.dueDate!,
    clientId: null,
    clientName: t.assignedTo ? `Görev — (${t.assignedTo.name || t.assignedTo.email})` : "Görev",
  }));

  const mediationItems: any[] = [];
  mediationCases.forEach((m) => {
    if (m.ilkOturumTarihi) {
      mediationItems.push({
        id: "med-ilk-" + m.id,
        type: "durusma",
        title: "Bilgilendirme ve İlk Oturum",
        dueDate: m.ilkOturumTarihi,
        clientId: null,
        clientName: `Arabuluculuk — ${m.basvurucuAd || "?"}`,
      });
    }
    if (m.sonTutanakTarihi) {
      mediationItems.push({
        id: "med-son-" + m.id,
        type: "durusma",
        title: `Son Tutanak (${m.sonTutanakSonucu === "anlasma" ? "Anlaşma" : "Anlaşamama"})`,
        dueDate: m.sonTutanakTarihi,
        clientId: null,
        clientName: `Arabuluculuk — ${m.basvurucuAd || "?"}`,
      });
    }
  });

  const out = [...eventItems, ...taskItems, ...mediationItems].sort(
    (a, b) => new Date(a.dueDate as any).getTime() - new Date(b.dueDate as any).getTime()
  );

  return NextResponse.json({ events: out });
}
