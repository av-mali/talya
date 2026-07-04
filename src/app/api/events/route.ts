import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Takvim için: kullanıcının TÜM müvekkillerindeki duruşma/ödeme tarihleri
// (zaman filtresi yok — geçmiş + gelecek hepsi, takvimde gezinmek için).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const events = await prisma.clientEvent.findMany({
    where: { client: { userId } },
    include: { client: true },
    orderBy: { dueDate: "asc" },
  });

  const out = events.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    dueDate: e.dueDate,
    clientId: e.clientId,
    clientName: e.client.name,
  }));

  return NextResponse.json({ events: out });
}
