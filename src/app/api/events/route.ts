import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groupEventsByCaseAndDate } from "@/lib/groupEvents";
import { requireWorkspace } from "@/lib/workspace";

// Takvim VE ana sayfadaki "Yaklaşan Süreler" için: büronun tüm
// müvekkillerindeki duruşma/ödeme tarihleri + büronun tarihi olan görevleri.
export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const [events, tasks] = await Promise.all([
    prisma.clientEvent.findMany({
      where: { case: { client: { workspaceId: ws.workspaceId } } },
      include: { case: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      where: { workspaceId: ws.workspaceId, done: false, dueDate: { not: null } },
      orderBy: { dueDate: "asc" },
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
    clientName: `${g.clientNamesDisplay} — ${g.caseTitle}`,
  }));

  const taskItems = tasks.map((t) => ({
    id: t.id,
    type: "gorev",
    title: t.title,
    dueDate: t.dueDate!,
    clientId: null,
    clientName: "Görev",
  }));

  const out = [...eventItems, ...taskItems].sort(
    (a, b) => new Date(a.dueDate as any).getTime() - new Date(b.dueDate as any).getTime()
  );

  return NextResponse.json({ events: out });
}
