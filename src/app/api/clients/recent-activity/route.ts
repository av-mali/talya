import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

// Ana sayfadaki "Son Müvekkil Aktivitesi" widget'ı için — en son eklenen
// müvekkiller ve en son gelen müvekkil mesajlarını tek, tarihe göre
// sıralanmış bir akışta birleştirir.
export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const [recentClients, recentMessages] = await Promise.all([
    prisma.client.findMany({
      where: { workspaceId: ws.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.clientPortalMessage.findMany({
      where: { isFromClient: true, client: { workspaceId: ws.workspaceId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { id: true, name: true } } },
    }),
  ]);

  const items = [
    ...recentClients.map((c) => ({
      type: "yeni-muvekkil",
      clientId: c.id,
      clientName: c.name,
      date: c.createdAt,
      text: `${c.name} eklendi`,
    })),
    ...recentMessages.map((m) => ({
      type: "mesaj",
      clientId: m.client.id,
      clientName: m.client.name,
      date: m.createdAt,
      text: `${m.client.name}'den yeni mesaj`,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return NextResponse.json({ items });
}
