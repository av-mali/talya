import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedClient } from "@/lib/workspace";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const messages = await prisma.clientPortalMessage.findMany({
    where: { clientId: params.id },
    orderBy: { createdAt: "asc" },
  });

  // Bu mesajları görüntülemek, "okundu" olarak işaretlemek demek.
  await prisma.clientPortalMessage.updateMany({
    where: { clientId: params.id, isFromClient: true, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
  }

  await prisma.clientPortalMessage.create({
    data: { clientId: params.id, content: content.trim(), isFromClient: false },
  });
  return NextResponse.json({ ok: true });
}

// Yanlışlıkla/anlamsız gelen bir müvekkil mesajını silmek için.
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const messageId = searchParams.get("messageId");
  if (!messageId) return NextResponse.json({ error: "messageId gerekli." }, { status: 400 });

  const msg = await prisma.clientPortalMessage.findFirst({ where: { id: messageId, clientId: params.id } });
  if (!msg) return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });

  await prisma.clientPortalMessage.delete({ where: { id: messageId } });
  return NextResponse.json({ ok: true });
}
