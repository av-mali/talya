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
