import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const ticket = await prisma.supportTicket.findFirst({ where: { id: params.id, userId } });
  if (!ticket) return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  if (ticket.status === "cozuldu") {
    return NextResponse.json({ error: "Bu talep çözüldü olarak işaretlenmiş, artık mesaj gönderilemez." }, { status: 400 });
  }

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
  }

  await prisma.supportMessage.create({
    data: { ticketId: params.id, content: content.trim(), isAdmin: false },
  });
  await prisma.supportTicket.update({
    where: { id: params.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
