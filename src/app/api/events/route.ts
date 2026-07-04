import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Takvim VE ana sayfadaki "Yaklaşan Süreler" için: kullanıcının tüm
// müvekkillerindeki duruşma/ödeme tarihleri + tarihi olan görevler.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const [events, tasks] = await Promise.all([
    prisma.clientEvent.findMany({
      where: { client: { userId } },
      include: { client: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      where: { userId, done: false, dueDate: { not: null } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const eventItems = events.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    dueDate: e.dueDate,
    clientId: e.clientId,
    clientName: e.client.name,
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
