import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwnedClient(clientId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;
  const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
  return client ? userId : null;
}

// Duruşma ya da ödeme tarihi ekle — bu tarih yaklaşınca bildirim olarak görünür
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const { type, title, dueDate } = await req.json();
  if (!type || !title || !dueDate) {
    return NextResponse.json({ error: "Tür, başlık ve tarih gerekli." }, { status: 400 });
  }
  const parsed = new Date(dueDate);
  if (isNaN(parsed.getTime())) {
    return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
  }

  const event = await prisma.clientEvent.create({
    data: { type, title, dueDate: parsed, clientId: params.id },
  });

  return NextResponse.json({ event });
}
