import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupEventsByCaseAndDate } from "@/lib/groupEvents";
import { requireWorkspace } from "@/lib/workspace";

// Takvim VE ana sayfadaki "Yaklaşan Süreler" için: büronun tüm
// müvekkillerindeki duruşma/ödeme tarihleri + kullanıcının tarihi olan görevleri.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;
  const ws = await requireWorkspace();

  const [events, tasks] = await Promise.all([
    ws ? prisma.clientEvent.findMany({
      where: { case: { client: { workspaceId: ws.workspaceId } } },
      include: { case: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
    }) : Promise.resolve([]),
    prisma.task.findMany({
      where: { userId, done: false, dueDate: { not: null } },
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
