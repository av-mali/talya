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

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
  }

  await prisma.supportMessage.create({
    data: { ticketId: params.id, content: content.trim(), isAdmin: false },
  });
  // Kullanıcı yeni mesaj yazınca, talebi otomatik "açık" durumuna geri al
  // — yönetici "çözüldü" demişti ama kullanıcının hâlâ sorusu varmış demektir.
  await prisma.supportTicket.update({
    where: { id: params.id },
    data: { updatedAt: new Date(), status: ticket.status === "cozuldu" ? "acik" : ticket.status },
  });

  return NextResponse.json({ ok: true });
}
